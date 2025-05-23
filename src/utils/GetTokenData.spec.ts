import { Request } from "express";
import { RabbitMqManageConnection } from "../rabbitMQ/RabbitMqManageConnection";
import { RabbitMqMessagesProducerService } from "../rabbitMQ/RabbitMqMessagesProducerService";
import { GetTokenData } from "./GetTokenData";
import { IValidationTokenData } from "./interfaces/validation-token-data.interface";

jest.mock("../rabbitMQ/RabbitMqManageConnection");
jest.mock("../rabbitMQ/RabbitMqMessagesProducerService");

describe("GetTokenData", () => {
    let mockRequest: Partial<Request>;
    let mockRabbitMqService: jest.Mocked<RabbitMqMessagesProducerService>;
    let getTokenData: GetTokenData;

    const queue = "test-queue";
    const responseQueue = "response-queue";
    const connectionString = "amqp://localhost";

    beforeEach(() => {
        mockRequest = {
            headers: {
                authorization: "Bearer test-token",
            },
        };
        const mockConnection = new RabbitMqManageConnection(connectionString) as jest.Mocked<RabbitMqManageConnection>;
        mockRabbitMqService = new RabbitMqMessagesProducerService(mockConnection) as jest.Mocked<RabbitMqMessagesProducerService>;
        (RabbitMqMessagesProducerService as jest.Mock).mockImplementation(() => mockRabbitMqService);
        getTokenData = new GetTokenData(queue, responseQueue, connectionString);
    });

    it("should return user validation data when token is provided", async () => {
        const mockValidationData: IValidationTokenData = {
            statusCode: 200,
        };
        mockRabbitMqService.sendDataToAPI.mockResolvedValue(mockValidationData);
        const result = await getTokenData.get(mockRequest as Request);
        expect(mockRabbitMqService.sendDataToAPI).toHaveBeenCalledWith(
            "test-token",
            queue,
            responseQueue
        );
        expect(result).toEqual(mockValidationData);
    });

    it("should return null when no authorization header is provided", async () => {
        mockRequest.headers = {};
        const result = await getTokenData.get(mockRequest as Request);
        expect(result).toBeNull();
    });

    it("should return null when token is not present in the authorization header", async () => {
        mockRequest.headers = {
            authorization: "Bearer",
        };
        const result = await getTokenData.get(mockRequest as Request);
        expect(result).toBeNull();
    });
});
