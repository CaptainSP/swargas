import { swagger } from "../../swagger/swagger";

export function addDescriptionToSwagger(
  path: string,
  method: string,
  target: any,
  propertyKey: string
) {
  const description = Reflect.getMetadata("description", target, propertyKey);
  if (description) {
    if (!swagger.paths[path]) {
      swagger.paths[path] = {};
    }

    method = method.toLowerCase();

    if (!swagger.paths[path][method]) {
      swagger.paths[path][method] = {
        parameters: [],
        tags: [],
        responses: {
          200: {
            description: "Success",
          },
        },
      };
    }

    swagger.paths[path][method].description = description.description;
  }
}
