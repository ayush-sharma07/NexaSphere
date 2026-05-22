/**
 * Swagger / OpenAPI Configuration
 * API Documentation Setup
 */

import swaggerJsdoc from "swagger-jsdoc";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.nexasphere.com"
    : "http://localhost:3000";

const createSchema = (properties, required = []) => ({
  type: "object",
  required,
  properties,
});

const specs = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "NexaSphere API",
      version: "1.0.0",
      description:
        "Real-time event management platform with notifications, live updates, and collaboration features.",
      contact: {
        name: "NexaSphere Team",
        email: "support@nexasphere.com",
        url: "https://nexasphere.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },

    servers: [
      {
        url: API_URL,
        description:
          process.env.NODE_ENV === "production"
            ? "Production Server"
            : "Development Server",
      },
    ],

    security: [{ bearerAuth: [] }],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT authentication token",
        },

        apiKey: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "Service authentication API key",
        },
      },

      schemas: {
        Event: createSchema(
          {
            id: {
              type: "string",
              format: "uuid",
              description: "Event identifier",
            },

            name: {
              type: "string",
              example: "Tech Workshop 2024",
            },

            description: {
              type: "string",
            },

            date: {
              type: "string",
              format: "date-time",
              example: "2024-06-15T10:00:00Z",
            },

            location: {
              type: "string",
              example: "Building A, Room 101",
            },

            capacity: {
              type: "integer",
              minimum: 1,
              example: 50,
            },

            registrations: {
              type: "integer",
              example: 25,
            },

            status: {
              type: "string",
              enum: ["upcoming", "ongoing", "completed", "cancelled"],
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
          ["name", "date", "location"],
        ),

        User: createSchema(
          {
            id: {
              type: "string",
              format: "uuid",
            },

            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },

            name: {
              type: "string",
              example: "John Doe",
            },

            role: {
              type: "string",
              enum: ["user", "admin", "organizer"],
              default: "user",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
          ["email", "name"],
        ),

        Error: createSchema({
          success: {
            type: "boolean",
            example: false,
          },

          error: {
            type: "string",
            example: "Error message",
          },

          statusCode: {
            type: "integer",
            example: 400,
          },
        }),

        Success: createSchema({
          success: {
            type: "boolean",
            example: true,
          },

          data: {
            type: "object",
          },

          message: {
            type: "string",
            example: "Operation successful",
          },
        }),
      },
    },
  },

  apis: ["./server/routes/*.js", "./server/swagger-docs/*.js"],
});

export default specs;
