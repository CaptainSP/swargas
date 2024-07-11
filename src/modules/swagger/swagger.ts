export const swagger: any = {
  openapi: "3.0.0",
  info: {
    title: "API",
    version: "1.0.0",
    description: "API",
  },
  security: [],
  servers: [
    {
      url: process.env.SWAGGER_URL || "https://unilocked.com",
    },
  ],
  paths: {},
  tags: [],
  components: {
    schemas: {
      any: {
        description: "Can be any type",
      },
    },
    responses: {
      "500-Response": {
        description: "Internal Server Error",
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
          },
          code: {
            type: "number",
          },
          status: {
            type: "number",
          },
          errors: {
            type: "array",
          },
        },
      },

      "400-Response": {
        description: "Bad Request",
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
          },
          code: {
            type: "number",
          },
          status: {
            type: "number",
          },
          errors: {
            type: "array",
          },
        },
      },
      "401-Response": {
        description: "You are not authenticated!",
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
          },
          code: {
            type: "number",
          },
          status: {
            type: "number",
          },
          errors: {
            type: "array",
          },
        },
      },
      "403-Response": {
        description: "You don't have permission to perform this action",
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
          },
          code: {
            type: "number",
          },
          status: {
            type: "number",
          },
          errors: {
            type: "array",
          },
        },
      },
      "404-Response": {
        description: "Resource not found",
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
          },
          code: {
            type: "number",
          },
          status: {
            type: "number",
          },
          errors: {
            type: "array",
          },
        },
      },
      "422-Response": {
        description:
          "Unprocessable Entity. Some of the request params or data may not be valid",
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
          },
          code: {
            type: "number",
          },
          status: {
            type: "number",
          },
          errors: {
            type: "array",
          },
        },
      },
    },
  },
};
