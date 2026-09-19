import swaggerJSDoc from "swagger-jsdoc";

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
                url: "http://localhost:5001"
            }
        ]
    },

    apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;