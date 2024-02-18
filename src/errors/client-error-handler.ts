import { NextFunction, Request, Response } from "express";
import { AppError } from './AppError';

const clientErrorHandle = (error: Error, request: Request, response: Response, next: NextFunction) => {
    if (error instanceof AppError) {
        return response.status(error.statusCode || 500).json({
            status: error.statusCode,
            message: error.message
        });
    }
    const _error: any = error;
    return response.status(_error.statusCode || 500).json({
        status: _error.statusCode || 500,
        message: error.message || 'API_ERRORS.INTERNAL_SERVER_ERROR'
    });
};

export { clientErrorHandle };
