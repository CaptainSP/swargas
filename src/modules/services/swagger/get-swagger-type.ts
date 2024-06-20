import { ObjectId, Types } from 'mongoose';
import { getItemsOfArray } from "./get-items-of-array";
import { getKeysOfObject } from "./get-keys-of-object";

export function getSwaggerType(target: any, propertyKey: string, param: any) {
  if (typeof param.param !== "string") {
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
  }

  const type = Reflect.getMetadata("design:paramtypes", target, propertyKey)[
    param.index
  ];
  
  if (type === String) {
    return {
      type: "string",
    };
  } else if (type === Number) {
    return {
      type: "number",
    };
  } else if (type === Boolean) {
    return {
      type: "boolean",
    };
  } else if (type === Date) {
    return {
      type: "string",
      format: "date-time",
    };
  }  else if (type == Types.ObjectId) {
    
    return {
      type: "string",
      format: "ObjectId",
    };
  }
  else {
    return {
      type: "object",
      $ref: "#/components/schemas/" + type.name,
    };
  }
}
