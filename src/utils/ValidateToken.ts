import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { GetTokenData } from "./GetTokenData";

export class ValidateToken {
    private queue: string;
    private responseQueue: string;
    private connection: string;

    constructor(queue: string, responseQueue: string, connection: string) {
        this.queue = queue;
        this.responseQueue = responseQueue;
        this.connection = connection;
    }

    validate = async (request: Request<any>, response: Response, next: NextFunction) => {
        try {
            const getTokenData = new GetTokenData(this.queue, this.responseQueue, this.connection);
            const token = await getTokenData.get(request);
            if (!token) throw new AppError('API_ERRORS.NOT_ALLOWED', 401);
            if (token.expiredAt || token.statusCode) throw new AppError(
                token.message || 'API_ERRORS.NOT_ALLOWED',
                token.statusCode || 401
            );
            next();
        } catch (error) {
            next(error);
        }
    }
}
