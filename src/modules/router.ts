import { Express, Response, Router as ExpressRouter } from "express";
import BaseController from "./controllers/base-controller";
import passport from "passport";

export abstract class Router {
  constructor(private app: Express) {}

  public listen() {}

  public use(router: ExpressRouter, path: string | null) {
    if (path) {
      this.app.use("/api/" + path, router);
      this.app.use(
        "/api/v1/" + path,
        passport.authenticate("bearer", { session: false }),
        router
      );
    } else {
      this.app.use(
        "/api/v1/",
        passport.authenticate("bearer", { session: false }),
        router
      );
      this.app.use("/api/", router);
    }
  }

  public createRoute<Type extends BaseController>(
    path: string | null = null,
    controller: { new (): Type }
  ) {
    try {
      const router = ExpressRouter();
      const createdController = new controller();

      const methods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(createdController)
      ).filter((method) => {
        return method !== "constructor" && method !== "listen";
      });

      for (let method of methods) {
        const hasGetDecorator = Reflect.getMetadata(
          "isRequestDecorator",
          createdController,
          method
        );
        if (hasGetDecorator) {
          (createdController as any)[method](path, router);
        }
      }
      createdController.listen(router);

      this.use(router, path);
    } catch (e) {
      console.log(e);
    }
  }

  public error(res: Response) {
    res.send({ success: false });
  }
}
