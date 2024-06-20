import { swagger } from "../../swagger/swagger";
import {
  headerMetaDataKey,
  paginationMetaDataKey,
  paramMetaDataKey,
  queryMetaDataKey,
} from "../../decorators/request-parameters";
import { buildBody } from "./build-body";
import { getSwaggerType } from "./get-swagger-type";
import { splitType } from "./split-type";

export function addParamToSwagger(
  path: string,
  method: string,
  param: {
    name: string;
    in: string;
    required: boolean;
    schema: any;
  }
) {
  method = method.toLowerCase();
  swagger.paths[path][method].parameters.push(param);
}

export function addParamsToSwagger(
  path: string,
  method: string,
  target: any,
  propertyKey: string
) {
  let queryParams: any[] =
    Reflect.getOwnMetadata(queryMetaDataKey, target, propertyKey) || [];
  let headerParams: any[] =
    Reflect.getOwnMetadata(headerMetaDataKey, target, propertyKey) || [];
  let paramParams: any[] =
    Reflect.getOwnMetadata(paramMetaDataKey, target, propertyKey) || [];
  let paginationParams =
    Reflect.getOwnMetadata(paginationMetaDataKey, target, propertyKey) || [];

  buildBody(path, method.toLocaleLowerCase(), target, propertyKey);

  if (paginationParams.length > 0) {
    addParamToSwagger(path, method.toLocaleLowerCase(), {
      name: "page",
      in: "query",
      required: false,
      schema: {
        type: "number",
      },
    });
    addParamToSwagger(path, method.toLocaleLowerCase(), {
      name: "perPage",
      in: "query",
      required: false,
      schema: {
        type: "number",
      },
    });
  }

  queryParams.forEach((param) => {
    if (typeof param.param == "string") {
      addParamToSwagger(path, method.toLocaleLowerCase(), {
        name: splitType(param.param),
        in: "query",
        required: false,
        schema: getSwaggerType(target, propertyKey, param),
      });
    } else {
      for (let key in param.param) {
        addParamToSwagger(path, method.toLocaleLowerCase(), {
          name: splitType(key),
          in: "query",
          required: false,
          schema: getSwaggerType(target, propertyKey, param),
        });
      }
    }
  });

  paramParams.forEach((param) => {
    if (typeof param.param == "string") {
      addParamToSwagger(path, method.toLocaleLowerCase(), {
        name: splitType(param.param),
        in: "path",
        required: false,
        schema: getSwaggerType(target, propertyKey, param),
      });
    } else {
      for (let key in param.param) {
        addParamToSwagger(path, method.toLocaleLowerCase(), {
          name: splitType(key),
          in: "path",
          required: false,
          schema: getSwaggerType(target, propertyKey, param),
        });
      }
    }
  });

  headerParams.forEach((param) => {
    if (typeof param.param == "string") {
      addParamToSwagger(path, method.toLocaleLowerCase(), {
        name: splitType(param.param),
        in: "header",
        required: false,
        schema: getSwaggerType(target, propertyKey, param),
      });
    } else {
      for (let key in param.param) {
        addParamToSwagger(path, method.toLocaleLowerCase(), {
          name: splitType(key),
          in: "header",
          required: false,
          schema: getSwaggerType(target, propertyKey, param),
        });
      }
    }
  });
}
