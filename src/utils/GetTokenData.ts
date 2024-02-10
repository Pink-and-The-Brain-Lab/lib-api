import { Request } from "express";
import { RabbitMqManageConnection } from "../rabbitMQ/RabbitMqManageConnection";
import { RabbitMqMessagesProducerService } from "../rabbitMQ/RabbitMqMessagesProducerService";
import { IValidationTokenData } from "./interfaces/validation-token-data.interface";

export class GetTokenData {
    private queue: string;
    private responseQueue: string;

    constructor(queue: string, responseQueue: string) {
        this.queue = queue;
        this.responseQueue = responseQueue;
    }

    async get(request: Request<any>): Promise<IValidationTokenData | null> {
        const authHeader = request.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return null;
        const connection = new RabbitMqManageConnection('amqp://localhost');
        const rabbitMqService = new RabbitMqMessagesProducerService(connection);
        const userValidation = await rabbitMqService.sendDataToAPI<string, IValidationTokenData>(token, this.queue, this.responseQueue);
        return userValidation;
    }
}
