import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { GetTokenData } from "./GetTokenData";

export class ValidateToken {
    private queue: string;
    private responseQueue: string;

    constructor(queue: string, responseQueue: string) {
        this.queue = queue;
        this.responseQueue = responseQueue;
    }

    validate = async (request: Request<any>, response: Response, next: NextFunction) => {
        try {
            const getTokenData = new GetTokenData(this.queue, this.responseQueue)
            const token = await getTokenData.get(request);
            if (!token || token.expiredAt) throw new AppError(
                token?.expiredAt ? token?.message || '' : 'API_ERRORS.NOT_ALLOWED',
                401
            );
            next();
        } catch (error) {
            next(error);
        }
    }
}
