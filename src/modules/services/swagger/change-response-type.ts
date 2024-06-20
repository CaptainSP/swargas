import { swagger } from "../../swagger/swagger";
import { getKeysOfObject } from "./get-keys-of-object";

export function changeResponseType(
  path: string,
  method: string,
  code: string,
  data: any
) {
  method = method.toLowerCase();
  return;

  let type = typeof data;
  let properties = undefined;

  if (type === "object") {
    properties = getKeysOfObject(data);
  }

  if (!swagger.paths[path][method].responses[code]) {
    swagger.paths[path][method].responses[code] = {
      description: "Success",
      "application/json": {
        schema: {
          type: type,
          properties: properties,
        },
      },
    };
  }
}
