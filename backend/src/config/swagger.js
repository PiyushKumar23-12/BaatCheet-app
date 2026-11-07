import swaggerJSDoc from "swagger-jsdoc";
import env from "./env.js";

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "BAATCHEET API",
            version: "1.0.0",
            description: "API documentation for the BAATCHEET chat application"
        },

        servers: [
            {
                url: env.NODE_ENV === "production"
                    ? "https://baatcheet-frontend-9oom.onrender.com"
                    : `http://localhost:${env.PORT}`,
                description: env.NODE_ENV === "production"
                    ? "Production server"
                    : "Development server"
            }
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "jwt"
                }
            }
        }
    },

    apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;