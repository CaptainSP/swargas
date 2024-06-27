import { Request, Response, NextFunction } from "express";
export abstract class Service {
  protected req: Request;
  protected res: Response;
  protected next: NextFunction;
  protected path: string;
  protected method: string;

  /**
   * Initialize the service
   * @param req Request
   * @param res Response
   * @param next NextFn
   */
  public init(
    req: Request,
    res: Response,
    next: NextFunction,
    path: string,
    method: string
  ): void {
    this.req = req;
    this.res = res;
    this.next = next;
    this.path = path;
    this.method = method;
  }

  public execute(): void {}
}
