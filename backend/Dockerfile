# We build the docker image in layers

# FROM means node image is already made in docker so we will use this as a starting image for our image
# node:22-alpine--> It already has linux,node,npm in it Alpine version
FROM node:22-alpine

# use /app as the working directory inside the image/container
# /app is equivalent to BaatCheet/Backend
WORKDIR /app

# Take all types of packags.json files from my project on my computer and copy them into the Docker image.
# Your computer                    Docker image
# backend/
# ├── package.json       ───────►  /app/package.json
# └── package-lock.json  ───────►  /app/package-lock.json
COPY --chown=node:node package*.json ./


# similar to npm install except the development dependencies
# It performs clean installation depends on lock file and delete existing node modules and reinstall that
RUN npm ci --omit=dev


# Copy the rest of our backend to /app
COPY --chown=node:node . .


# This application is intended to listen on port 5001 inside the container.
EXPOSE 5001

USER node

# CMD ["npm", "start"]
#           ↓
# npm start
#           ↓
# node src/index.js
#           ↓
# BAATCHEET backend starts
CMD ["npm","start"]



# docker exec -it baatcheet-backend sh --> command so that we can do any operations inside the container 
# ke baad tum container ke andar chal rahe sh shell program se interact kar rahe ho.

# docker exec
#     ↓
# Execute a command inside an existing container

# -it
#     ↓
# Interactive terminal

# baatcheet-backend
#     ↓
# Container name

# sh
#     ↓
# Start a shell inside the container