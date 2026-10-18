# Docker — BAATCHEET

## 1. Overview

Docker is a platform used to package and run applications in isolated environments called containers.

In BAATCHEET, Docker is used to containerize the backend, frontend, and MongoDB, making the application easier to run consistently across environments.

## 2. Docker Architecture

The basic Docker workflow is:

**Dockerfile → Image → Container**

- **Dockerfile:** Instructions for building an image.
- **Image:** A packaged template containing the application and its runtime dependencies.
- **Container:** A running instance of an image.
- **Docker Engine:** Builds and runs containers.
- **Docker Compose:** Manages multiple related services together.

## 3. BAATCHEET Architecture

The application runs through three services:

| Service | Technology | Purpose |
|---|---|---|
| Frontend | React + Nginx | Serves the UI and reverse-proxies requests |
| Backend | Node.js + Express + Socket.IO | Handles APIs and real-time messaging |
| Database | MongoDB | Stores application data |

### Request flow

Browser → Nginx → Backend → MongoDB

Socket.IO connections are also proxied through Nginx.

## 4. Backend Dockerfile

The backend Dockerfile:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5001

USER node

CMD ["npm", "start"]
```

### Important concepts

- `FROM`: Selects the base image.
- `WORKDIR`: Sets the working directory inside the image.
- `COPY`: Copies files into the image.
- `RUN`: Executes a command while building the image.
- `npm ci --omit=dev`: Installs dependencies without development dependencies.
- `EXPOSE 5001`: Documents the intended container port; it does not publish the port.
- `USER node`: Runs the application as a non-root user.
- `CMD`: Defines the default command when the container starts.

### Docker layer caching

Copying `package*.json` before the application source allows Docker to reuse the dependency-installation layer when the source code changes but the package manifests remain unchanged.

## 5. Frontend Multi-Stage Dockerfile

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### Why multi-stage builds?

1. The builder stage uses Node.js to build the React application.
2. The build output is generated in `/app/dist`.
3. The final stage uses Nginx to serve the generated static files.
4. The final image does not need the Node.js runtime or frontend development dependencies.

This reduces the contents of the final runtime image.

## 6. Docker Compose

Docker Compose defines and manages the services required by BAATCHEET.

The current Compose configuration contains:

- `backend`: Builds the backend image and publishes port 5001.
- `frontend`: Builds the frontend image and publishes host port 3000 to container port 80.
- `mongodb`: Runs MongoDB and stores its data in a named volume.

### Port mapping

| Mapping | Meaning |
|---|---|
| `5001:5001` | Host port 5001 → backend container port 5001 |
| `3000:80` | Host port 3000 → frontend container port 80 |

The application is accessed through:

`http://localhost:3000`

### Service discovery

Containers on the same Compose network can communicate using service names.

The backend connects to MongoDB using:

`mongodb://mongodb:27017/baatcheet`

Here, `mongodb` is the Compose service name, `27017` is MongoDB's internal port, and `baatcheet` is the database name.

Inside a container, `localhost` refers to that same container—not another service.

## 7. Docker Volumes

MongoDB uses a named volume:

`baatcheet_mongodb_data:/data/db`

A named volume stores database data independently of the MongoDB container's lifecycle.

Consequently, removing and recreating the container does not normally remove the data stored in the named volume.

**Important:** Removing the volume itself can permanently delete its data. Production databases also require a proper backup and recovery strategy.

## 8. Healthchecks and Dependencies

MongoDB healthcheck:

```yaml
healthcheck:
  test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
  interval: 10s
  timeout: 5s
  retries: 5
```

Backend dependency:

```yaml
depends_on:
  mongodb:
    condition: service_healthy
```

- `Up` indicates that the container is running.
- `Healthy` indicates that the configured healthcheck is passing.
- `service_healthy` delays dependent service startup until the dependency passes its healthcheck.

A startup dependency does not automatically guarantee recovery from every failure occurring later.

## 9. Docker Ignore Files

### `.gitignore`

Controls which untracked files Git ignores.

### `.dockerignore`

Controls which files are excluded from the Docker build context.

Backend `.dockerignore`:

```text
node_modules
.env
.git
npm-debug.log
```

Excluding `.env` helps prevent secrets from being included in the build context or copied into the image.

The Compose `env_file` configuration injects environment variables into the container at runtime. It does not make the file itself part of the image.

For production, use an appropriate secrets-management solution.

## 10. Nginx Reverse Proxy

Nginx serves the React frontend and forwards backend requests.

### API requests

```nginx
location /api/ {
    proxy_pass http://backend:5001;
}
```

Requests such as `/api/auth/login` are forwarded to the backend.

Because `proxy_pass` has no URI suffix, the original request URI is preserved.

### Socket.IO

Nginx forwards `/socket.io/` requests to the backend and supports WebSocket upgrade headers.

### React SPA routing

```nginx
location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

If a requested frontend route does not match a static file, Nginx falls back to `index.html`, allowing React Router to handle the route.

### Browser versus container networking

The browser uses the frontend origin and calls `/api`.

Nginx then forwards the request to `http://backend:5001`.

The hostname `backend` is resolved inside the Docker network. It is not normally resolvable by the user's browser.

## 11. Useful Docker Commands

### Check versions

```bash
docker --version
docker compose version
```

### Build an image

```bash
docker build -t baatcheet-backend ./backend
```

Building an image does not start a container.

### Start the application

```bash
docker compose up -d --build
```

### Check running services

```bash
docker compose ps
```

### View logs

```bash
docker compose logs backend
docker compose logs -f backend
docker compose logs mongodb
```

### Restart a service

```bash
docker compose restart backend
```

### Execute a command inside a container

```bash
docker exec -it baatcheet-backend sh
```

### List images and containers

```bash
docker images
docker ps
docker ps -a
```

### Stop the Compose application

```bash
docker compose down
```

This stops and removes the Compose containers and network, but normally preserves named volumes.

**Do not use `docker compose down -v` casually:** it also removes Compose-managed named volumes and can delete database data.

## 12. Testing Performed

The following checks were performed during Docker implementation:

- Backend successfully connected to MongoDB.
- Backend resolved the MongoDB service name through Docker networking.
- MongoDB data persisted after its container was recreated.
- Text messages were sent successfully.
- Image messages were sent successfully after increasing request-body limits.
- Real-time messaging between two users worked without refreshing the page.
- Backend restart was followed by a successful messaging test.
- Docker Compose configuration was validated.

These checks confirm the tested functionality, but do not constitute complete production-load, disaster-recovery, or security testing.

## 13. Key Learnings

- Images are templates; containers are running instances.
- Docker Compose manages multiple related services.
- Containers communicate using Compose service names.
- Host port publishing and container-internal networking are different.
- Named volumes persist database data independently of containers.
- Multi-stage builds separate frontend build tools from the runtime image.
- Nginx serves static files and proxies API and Socket.IO traffic.
- Healthchecks improve startup coordination but do not solve every runtime failure.
- Dockerizing an application is only one part of making it production-ready.
