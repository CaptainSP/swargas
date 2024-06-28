import { matchedData, param } from "express-validator";
import { ReturnModelType, prop } from "@typegoose/typegoose";
import {
  NextFunction,
  Request,
  Response,
  Router,
  RouterOptions,
} from "express";
import error from "../responses/error";
import {
  analyseMetaDataKey,
  bodyMetaDataKey,
  headerMetaDataKey,
  nextMetaDataKey,
  paginationMetaDataKey,
  paramMetaDataKey,
  queryMetaDataKey,
  requestMetaDataKey,
  resMetaDataKey,
  serviceMetaDataKey,
  userMetaDataKey,
} from "./request-parameters";
import { swagger } from "../swagger/swagger";
import { getSwaggerType } from "../services/swagger/get-swagger-type";
import { buildBody } from "../services/swagger/build-body";
import { addParamsToSwagger } from "../services/swagger/add-param-to-swagger";
import { changeResponseType } from "../services/swagger/change-response-type";
import { addReturnTypeToSwagger } from "../services/swagger/add-return-type-to-swagger";
import { addRouteToSwagger } from "../services/swagger/add-route-swagger";
import { buildMiddlewares } from "../services/swagger/build-middleware";
import { validateParams } from "../services/swagger/validate-params";
import { addDescriptionToSwagger } from "../services/swagger/add-description-swagger";
import { transformPath } from "../services/swagger/transform-path";
import { BeAnObject, DocumentType } from "@typegoose/typegoose/lib/types";
import { buildAnalyticsData } from "../services/build-data";
import PaginateService from "../services/paginate";
import { Service } from "../../models/service";

function getDataByParam(
  data: any,
  param: {
    param: any;
    index: number;
  }
) {
  if (typeof param.param !== "string") {
    let obj: any = {};
    for (let key in param.param) {
      const type = param.param[key];
      const dataValue = data[key];
      obj[key] = dataValue;
    }
    return {
      index: param.index,
      value: data,
    };
  } else {
    return {
      index: param.index,
      value: data[param.param],
    };
  }
}

function executeParams(
  target: any,
  propertyKey: string,
  mainPath: string,
  path: string,
  method: string,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const transFormed = transformPath("/" + mainPath + path);

  let bodyParams: any[] =
    Reflect.getOwnMetadata(bodyMetaDataKey, target, propertyKey) || [];
  let paramParams: any[] =
    Reflect.getOwnMetadata(paramMetaDataKey, target, propertyKey) || [];
  let queryParams: any[] =
    Reflect.getOwnMetadata(queryMetaDataKey, target, propertyKey) || [];
  let headerParams: any[] =
    Reflect.getOwnMetadata(headerMetaDataKey, target, propertyKey) || [];
  let reqParams: any[] =
    Reflect.getOwnMetadata(requestMetaDataKey, target, propertyKey) || [];
  let paginationParams: any[] =
    Reflect.getOwnMetadata(paginationMetaDataKey, target, propertyKey) || [];
  let analyseParams: any[] =
    Reflect.getOwnMetadata(analyseMetaDataKey, target, propertyKey) || [];
  let serviceParams: any[] =
    Reflect.getOwnMetadata(serviceMetaDataKey, target, propertyKey) || [];
  let resParams: any[] =
    Reflect.getOwnMetadata(resMetaDataKey, target, propertyKey) || [];
  let nextParams: any[] =
    Reflect.getOwnMetadata(nextMetaDataKey, target, propertyKey) || [];
  let userParams: any[] =
    Reflect.getOwnMetadata(userMetaDataKey, target, propertyKey) || [];

  let body = matchedData(req, { locations: ["body"] });
  if (req.body && !Array.isArray(req.body)) {
    for (let key in req.body) {
      if (!body[key]) {
        body[key] = req.body[key];
      }
    }
  } else if (Array.isArray(req.body) && (!body || body.length === 0)) {
    body = req.body;
  }
  const query = matchedData(req, { locations: ["query"] });
  const headers = matchedData(req, { locations: ["headers"] });
  const params = matchedData(req, { locations: ["params"] });

  const paginateMethod = async (
    model: ReturnModelType<any, BeAnObject>,
    query: any,
    options: {
      toObject: boolean;
      lean: boolean;
    } = {
      toObject: true,
      lean: false,
    }
  ) => {
    return await PaginateService.paginate(req, model, query, options);
  };

  const analyseMethod = async (
    model: ReturnModelType<any, BeAnObject>,
    data: any
  ) => {
    try {
      const createdData = await buildAnalyticsData(req);
      return await model.create({
        data: createdData,
        user: (req as any).user?._id,
        ...data,
      });
    } catch (e) {
      return null;
    }
  };

  let services = [];
  for (let param of serviceParams) {
    const type: new () => Service = Reflect.getMetadata(
      "design:paramtypes",
      target,
      propertyKey
    )[param.index];
    const service = new type();

    // check has method init
    if (service.init) {
      service.init(req, res, next, transFormed, method);
    }

    if (service.execute) {
      service.execute();
    }

    services.push({
      index: param.index,
      value: service,
    });
  }

  const datas = [
    ...bodyParams.map((param) => getDataByParam(body, param)),
    ...queryParams.map((param) => getDataByParam(query, param)),
    ...headerParams.map((param) => getDataByParam(headers, param)),
    ...paramParams.map((param) => getDataByParam(params, param)),
    ...reqParams.map((param) => ({ index: param.index, value: req })),
    ...paginationParams.map((param) => ({
      index: param.index,
      value: paginateMethod,
    })),
    ...analyseParams.map((param) => ({
      index: param.index,
      value: analyseMethod,
    })),
    ...services,
    ...resParams.map((param) => ({ index: param.index, value: res })),
    ...nextParams.map((param) => ({ index: param.index, value: next })),
    ...userParams.map((param) => ({
      index: param.index,
      value: (req as any).user,
    })),
  ]
    .sort((a, b) => a.index - b.index)
    .map((a) => a.value);

  if (datas.length === 0) {
    datas.push(req, res, next);
  }
  return datas;
}

async function sendWithSeo(
  data: any,
  status: number,
  target: string,
  propertyKey: string,
  res: Response
) {
  try {
    const seo = Reflect.getMetadata("seo", target, propertyKey);
    if (seo) {
      const seoResult = await seo(data?.data);
      data.seo = seoResult;
      res.status(status).send(data);
    }
  } catch (e) {
    console.log("Error in: SEO: ", e);
    res.status(status).send(data);
  }
}

function sendResponse(
  mainPath: string,
  path: string,
  target: string,
  propertyKey: string,
  method: string,
  res: Response,
  returnValue: any
) {
  if (returnValue && !res.headersSent) {
    if (returnValue.status) {
      changeResponseType(
        transformPath("/" + mainPath + path),
        method,
        returnValue.status?.toString() || "500",
        returnValue
      );
      sendWithSeo(returnValue, returnValue.status, target, propertyKey, res);
      //res.status(returnValue.status).send(returnValue);
    } else {
      let type = typeof returnValue;
      if (type === "object") {
        type = returnValue.constructor.name;
      }

      changeResponseType(
        transformPath("/" + mainPath + path),
        method,
        "200",
        returnValue
      );
      sendWithSeo(returnValue, 200, target, propertyKey, res);
    }
  }
}

function executeSwagger(mainPath, path, method, target, propertyKey) {
  const transFormed = transformPath("/" + mainPath + path);
  addRouteToSwagger(mainPath, transFormed, method);
  addParamsToSwagger(transFormed, method, target, propertyKey);
  addReturnTypeToSwagger(transFormed, method, target, propertyKey);
  addDescriptionToSwagger(transFormed, method, target, propertyKey);
}

export function GET(path: string, ...middlewares: any[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata("isRequestDecorator", true, target, propertyKey);

    const originalValue = descriptor.value;
    descriptor.value = function (mainPath: string, router: Router) {
      executeSwagger(mainPath, path, "GET", target, propertyKey);

      router.get(
        path,
        buildMiddlewares(target, propertyKey),
        ...middlewares,
        validateParams,
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            const returnValue = await originalValue.apply(
              this,
              executeParams(
                target,
                propertyKey,
                mainPath,
                path,
                "GET",
                req,
                res,
                next
              )
            );
            sendResponse(
              mainPath,
              path,
              target,
              propertyKey,
              "GET",
              res,
              returnValue
            );
          } catch (e) {
            console.log("Error in: GET: ", path, e);
            res.status(500).send(error(e));
          }
        }
      );
    };
  };
}

export function POST(path: string, ...middlewares: any[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata("isRequestDecorator", true, target, propertyKey);
    const originalValue = descriptor.value;
    descriptor.value = function (mainPath: string, router: Router) {
      executeSwagger(mainPath, path, "POST", target, propertyKey);

      router.post(
        path,
        buildMiddlewares(target, propertyKey),
        ...middlewares,
        validateParams,
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            const returnValue = await originalValue.apply(
              this,
              executeParams(
                target,
                propertyKey,
                mainPath,
                path,
                "POST",
                req,
                res,
                next
              )
            );
            sendResponse(
              mainPath,
              path,
              target,
              propertyKey,
              "POST",
              res,
              returnValue
            );
          } catch (error) {
            console.log(error);
            res.status(500).json({ error });
          }
        }
      );
    };
  };
}

export function PUT(path: string, ...middlewares: any[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata("isRequestDecorator", true, target, propertyKey);
    const originalValue = descriptor.value;
    descriptor.value = function (mainPath: string, router: Router) {
      executeSwagger(mainPath, path, "PUT", target, propertyKey);

      router.put(
        path,
        buildMiddlewares(target, propertyKey),
        ...middlewares,
        validateParams,
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            const returnValue = await originalValue.apply(
              this,
              executeParams(
                target,
                propertyKey,
                mainPath,
                path,
                "PUT",
                req,
                res,
                next
              )
            );
            sendResponse(
              mainPath,
              path,
              target,
              propertyKey,
              "PUT",
              res,
              returnValue
            );
          } catch (error) {
            console.log(error);
            res.status(500).json({ error });
          }
        }
      );
    };
  };
}

export function DELETE(path: string, ...middlewares: any[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata("isRequestDecorator", true, target, propertyKey);
    const originalValue = descriptor.value;
    descriptor.value = function (mainPath: string, router: Router) {
      executeSwagger(mainPath, path, "DELETE", target, propertyKey);

      router.delete(
        path,
        buildMiddlewares(target, propertyKey),
        ...middlewares,
        validateParams,
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            const returnValue = await originalValue.apply(
              this,
              executeParams(
                target,
                propertyKey,
                mainPath,
                path,
                "DELETE",
                req,
                res,
                next
              )
            );
            sendResponse(
              mainPath,
              path,
              target,
              propertyKey,
              "DELETE",
              res,
              returnValue
            );
          } catch (error) {
            console.log(error);
            res.status(500).json({ error });
          }
        }
      );
    };
  };
}

export function PATCH(path: string, ...middlewares: any[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata("isRequestDecorator", true, target, propertyKey);
    const originalValue = descriptor.value;
    descriptor.value = function (mainPath: string, router: Router) {
      executeSwagger(mainPath, path, "PATCH", target, propertyKey);

      router.patch(
        path,
        buildMiddlewares(target, propertyKey),
        ...middlewares,
        validateParams,
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            const returnValue = await originalValue.apply(
              this,
              executeParams(
                target,
                propertyKey,
                mainPath,
                path,
                "PATCH",
                req,
                res,
                next
              )
            );
            sendResponse(
              mainPath,
              path,
              target,
              propertyKey,
              "PATCH",
              res,
              returnValue
            );
          } catch (error) {
            console.log(error);
            res.status(500).json({ error });
          }
        }
      );
    };
  };
}
