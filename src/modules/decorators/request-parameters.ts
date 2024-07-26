import { getKeysOfObject } from "../services/swagger/get-keys-of-object";
import { getItemsOfArray } from "../services/swagger/get-items-of-array";
import { ParameterOptions } from "../swagger/types";
import { SeoResult } from "../../models/seo";
export const bodyMetaDataKey = Symbol("AppBody");
export const queryMetaDataKey = Symbol("AppQuery");
export const paramMetaDataKey = Symbol("AppParam");
export const headerMetaDataKey = Symbol("AppHeader");
export const requestMetaDataKey = Symbol("AppRequest");
export const nextMetaDataKey = Symbol("AppNext");
export const resMetaDataKey = Symbol("AppRes");
export const userMetaDataKey = Symbol("AppUser");
export const optionsMetaDataKey = Symbol("AppOptions");
export const paginationMetaDataKey = Symbol("AppPagination");
export const analyseMetaDataKey = Symbol("AppAnalyse");
export const valueMetaDataKey = Symbol("AppValue");
export const valueOptionsMetaDataKey = Symbol("AppValueOptions");
export const serviceMetaDataKey = Symbol("AppService");

function defineMetadata(
  metaDataKey: Symbol,
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number,
  param: any,
  options: ParameterOptions
) {
  let params: any[] =
    Reflect.getOwnMetadata(metaDataKey, target, propertyKey) || [];
  params.push({
    index: parameterIndex,
    param,
  });
  Reflect.defineMetadata(metaDataKey, params, target, propertyKey);
  Reflect.defineMetadata(optionsMetaDataKey, options, target, propertyKey);
}

export function Description(value: string) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const description = {
      description: value,
    };
    Reflect.defineMetadata("description", description, target, propertyKey);
  };
}

export function Seo(value: (data: any) => Promise<any>) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata("seo", value, target, propertyKey);
  };
}

export function Success(data: any) {
  let obj: any = {};
  if (typeof data === "object") {
    if (Array.isArray(data)) {
      obj = {
        type: "array",
        items: getItemsOfArray(data, true),
      };
    } else {
      obj = {
        type: "object",
        properties: getKeysOfObject(data, true),
      };
    }
  } else {
    if (data == "string") {
      obj = {
        type: "string",
      };
    } else if (data == "number") {
      obj = {
        type: "number",
      };
    } else if (data == "boolean") {
      obj = {
        type: "boolean",
      };
    } else if (data == "date") {
      obj = {
        type: "string",
        format: "date-time",
      };
    } else if (data == "object") {
      obj = {
        type: "object",
      };
    } else {
      obj = {
        type: "object",
        $ref: "#/components/schemas/" + data,
      };
    }
  }
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const success = {
      "200": {
        description: "Success",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  default: true,
                },
                data: obj,
              },
            },
          },
        },
      },
    };
    Reflect.defineMetadata("success", success, target, propertyKey);
  };
}

export function Body<T>(
  options: ParameterOptions = {},
  valueType: new () => T = null,
  valueOptions: ParameterOptions = {}
) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(
      bodyMetaDataKey,
      target,
      propertyKey,
      parameterIndex,
      null,
      options
    );
    Reflect.defineMetadata(valueMetaDataKey, valueType, target, propertyKey);
    Reflect.defineMetadata(
      valueOptionsMetaDataKey,
      valueOptions,
      target,
      propertyKey
    );
  };
}

export function Query(param: any, options: ParameterOptions = {}) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(
      queryMetaDataKey,
      target,
      propertyKey,
      parameterIndex,
      param,
      options
    );
    // Log returntype
    /*console.log(
      "returntype",
      Reflect.getMetadata("design:returntype", target, propertyKey) == Promise
    );*/
  };
}

export function Param(param: any, options: ParameterOptions = {}) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(
      paramMetaDataKey,
      target,
      propertyKey,
      parameterIndex,
      param,
      options
    );
  };
}

export function Header(param: any, options: ParameterOptions = {}) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(
      headerMetaDataKey,
      target,
      propertyKey,
      parameterIndex,
      param,
      options
    );
  };
}

export function Req(forPaginate = false, options: ParameterOptions = {}) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(
      requestMetaDataKey,
      target,
      propertyKey,
      parameterIndex,
      "",
      options
    );
  };
}

export function Analyse() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(
      analyseMetaDataKey,
      target,
      propertyKey,
      parameterIndex,
      "",
      {}
    );
  };
}

export function Service() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(
      serviceMetaDataKey,
      target,
      propertyKey,
      parameterIndex,
      "",
      {}
    );
  };
}

export function Pagination() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(
      paginationMetaDataKey,
      target,
      propertyKey,
      parameterIndex,
      "",
      {}
    );
  };
}

export function Next() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(
      nextMetaDataKey,
      target,
      propertyKey,
      parameterIndex,
      "",
      {}
    );
  };
}

export function Res() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(resMetaDataKey, target, propertyKey, parameterIndex, "", {});
  };
}

export function User() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    defineMetadata(
      userMetaDataKey,
      target,
      propertyKey,
      parameterIndex,
      "",
      {}
    );
  };
}
