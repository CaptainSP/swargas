import { validationResult } from "express-validator";
import success from "../../responses/success";

export const validateParams = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err:any) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    success:false,
    status: 422,
    code: 422,
    message: "Validation failed",
    errors: extractedErrors,
  });
};
