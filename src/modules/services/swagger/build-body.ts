import { swagger } from "../../swagger/swagger";
import {
  bodyMetaDataKey,
  optionsMetaDataKey,
  valueMetaDataKey,
  valueOptionsMetaDataKey,
} from "../../decorators/request-parameters";
import { getItemsOfArray } from "./get-items-of-array";
import { getKeysOfObject } from "./get-keys-of-object";
import { getSwaggerType } from "./get-swagger-type";
import {
  isArrayConstructor,
  isDateConstructor,
  isEmailConstructor,
  isNumberConstructor,
  isStringConstructor,
} from "./check-constructor";
import { getItemsOfArrayClass } from "./get-items-of-array-class";
import { getKeysOfObjectClass } from "./get-keys-object-class";

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
    const type = Reflect.getMetadata("design:paramtypes", target, propertyKey)[
      param.index
    ];

    console.log("type", type);
    
    const valueType = Reflect.getMetadata(
      valueMetaDataKey,
      target,
      propertyKey
    );

    if (isArrayConstructor(type)) {
      return {
        type: "array",
        items: getItemsOfArrayClass(type as any, valueType),
      };
    } else {
      return {
        type: "object",
        properties: getKeysOfObjectClass(type),
      };
    }
  }
  return schema;
}
