import { swagger } from "../../swagger/swagger";

export function addRouteToSwagger(tag: string, path: string, method: string) {
  method = method.toLowerCase();

  if (!swagger.paths[path]) {
    swagger.paths[path] = {};
  }

  if (swagger.tags.indexOf(tag) === -1) {
    swagger.tags.push(tag);
  }

  swagger.paths[path][method] = {
    parameters: [],
    tags: [tag],
    responses: {
      200: {
        description: "Success",
      },
      500: {
        description: "Internal Server Error",
        $ref: "#/components/responses/500-Response",
      },
      400: {
        description: "Bad Request",
        $ref: "#/components/responses/400-Response",
      },
      401: {
        description: "You are not authenticated!",
        $ref: "#/components/responses/401-Response",
      },
      422: {
        description: "Unprocessable Entity",
        $ref: "#/components/responses/422-Response",
      },
      403: {
        description: "Forbidden",
        $ref: "#/components/responses/403-Response",
      },
    },
  };
}
