import jwt,{JwtPayload} from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import createError from "../utils/createErrors";
import catchAsyncErrors from "../middileware/catchAsyncErrors"
import User from "../Models/usermodel"
export const authorizeRoles = (...roles:any) => {
    return (req:any, res:any, next:NextFunction) => {
      if (!roles.includes(req.user.role)) {
        return next(createError(
            `Role: ${req.user.role} is not allowed to access this resouce `,
            403
          )
        );
      }
  
      next();
    };
  };
  

  export const isAuthenticatedUser = catchAsyncErrors(async (req:any, res:any, next:any) => {
    const { token } = req.cookies;
  
    if (!token) {
      return next(createError("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
  
    req.user = await User.findById(decodedData.id);
  
    next();
  });  