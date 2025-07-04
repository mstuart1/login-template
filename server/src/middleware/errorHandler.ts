import { Request, Response, NextFunction } from 'express';
import logEvents from './logEvents';


const errorHandler = (
  error: any,
  _: Request,
  response: Response,
  _next: NextFunction // eslint-disable-line no-unused-vars
) => {
    logEvents(`${error.name}: ${error.message}`, 'error.log');
  response
    .status(error.statusCode || 500)
    .json({
      message:
        error 
          ? error.message
          : 'Oops! Something wonky happened...'
    });
};



export default errorHandler