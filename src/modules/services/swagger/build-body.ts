import { swagger } from "../../swagger/swagger";
import { bodyMetaDataKey } from "../../decorators/request-parameters";
import { getItemsOfArray } from "./get-items-of-array";
import { getKeysOfObject } from "./get-keys-of-object";
import { getSwaggerType } from "./get-swagger-type";

export function buildBody(
  path: string,
  method: string,
  target: any,
  propertyKey: string
) {
  let bodyParams: any[] =
    Reflect.getOwnMetadata(bodyMetaDataKey, target, propertyKey) || [];

  const requestBody: any = {};
  requestBody.required = false;
  requestBody.content = {
    "application/json": {
      schema: buildSchema(target, propertyKey, bodyParams),
    },
  };

  if (bodyParams.length > 0) {
    swagger.paths[path][method].requestBody = requestBody;
  }
}

function buildSchema(target: any, propertyKey: string, params: any[]) {
  const schema = {
    type: "object",
    properties: {},
  };
  for (let param of params) {
    
    if (typeof param.param === "object") {
      if (Array.isArray(param.param)) {
        return {
          type: "array",
          items: getItemsOfArray(param.param, true),
        };
      } else {
        return {
          type: "object",
          properties: getKeysOfObject(param.param, true),
        };
      }
    } else {
        
      schema.properties[param.param] = getSwaggerType(target, propertyKey, param);
    }
  }
  return schema;
}
