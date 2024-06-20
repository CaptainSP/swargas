import { ParameterOptions } from "../../swagger/types";
import {
  bodyMetaDataKey,
  headerMetaDataKey,
  optionsMetaDataKey,
  paramMetaDataKey,
  queryMetaDataKey,
  requestMetaDataKey,
} from "../../decorators/request-parameters";
import {
  Location,
  ParamSchema,
  Schema,
  check,
  checkSchema,
} from "express-validator";
import { buildParamOptions, buildTypeOptions } from "./build-param-options";
import { getSwaggerType } from "./get-swagger-type";

export function buildMiddleware(
  position: Location | Location[],
  param: any,
  target: any,
  propertyKey: string
) {
  const options: ParamSchema =
    Reflect.getMetadata(optionsMetaDataKey, target, propertyKey) || {};
  const schemaForValidation: Schema = {};
  if (typeof param.param == "string") {
    options.in = position;
    let swaggerType = getSwaggerType(target, propertyKey, param);
    if (swaggerType.format == "ObjectId") {
      swaggerType.type = "objectId";
    }
    schemaForValidation[param.param] = {
      ...options,
      ...buildTypeOptions(swaggerType.type),
    };
  } else {
    return buildParamOptions(position, param.param);
  }
  return schemaForValidation;
}

export function buildMiddlewares(target: any, propertyKey: string) {
  let queryParams: any[] =
    Reflect.getOwnMetadata(queryMetaDataKey, target, propertyKey) || [];
  let headerParams: any[] =
    Reflect.getOwnMetadata(headerMetaDataKey, target, propertyKey) || [];
  let bodyParams: any[] =
    Reflect.getOwnMetadata(bodyMetaDataKey, target, propertyKey) || [];
  let requestParams: any[] =
    Reflect.getOwnMetadata(paramMetaDataKey, target, propertyKey) || [];
  const schemas: Schema[] = [];

  for (let param of queryParams) {
    schemas.push(buildMiddleware("query", param, target, propertyKey));
  }

  for (let param of headerParams) {
    schemas.push(buildMiddleware("headers", param, target, propertyKey));
  }

  for (let param of bodyParams) {
    schemas.push(buildMiddleware("body", param, target, propertyKey));
  }

  for (let param of requestParams) {
    schemas.push(buildMiddleware("params", param, target, propertyKey));
  }

  const combinedSchema: Schema = schemas.reduce((acc, schema) => {
    return {
      ...acc,
      ...schema,
    };
  }, {});

  return checkSchema(combinedSchema);
}
