import { Channel, ConsumeMessage } from "amqplib";
import { RabbitMqMessagesProducerService } from "./RabbitMqMessagesProducerService";
import { RabbitMqManageConnection } from "./RabbitMqManageConnection";
import { uuid } from 'uuidv4';

jest.mock('./RabbitMqManageConnection');
jest.mock('uuidv4', () => ({
    uuid: jest.fn(),
}));

describe('RabbitMqMessagesProducerService', () => {
    let mockConnection: jest.Mocked<RabbitMqManageConnection>;
    let mockChannel: jest.Mocked<Channel>;
    let service: RabbitMqMessagesProducerService;

    beforeEach(() => {
        mockConnection = new RabbitMqManageConnection('amqp://localhost') as jest.Mocked<RabbitMqManageConnection>;
        mockChannel = {
            sendToQueue: jest.fn(),
            consume: jest.fn(),
        } as unknown as jest.Mocked<Channel>;
        mockConnection.createChannel = jest.fn().mockResolvedValue(mockChannel);
        mockConnection.closeConnection = jest.fn();
        service = new RabbitMqMessagesProducerService(mockConnection);
    });

    it('should send data to the queue and await a response', async () => {
        const queue = 'test-queue';
        const responseQueue = 'response-queue';
        const data = { key: 'value' };
        const correlationId = 'test-correlation-id';
        const responseData = { success: true };
        (uuid as jest.Mock).mockReturnValue(correlationId);
        mockChannel.consume.mockImplementation((queue, onMessage) => {
            const message: ConsumeMessage = {
                content: Buffer.from(JSON.stringify(responseData)),
                properties: { correlationId } as unknown as any,
                fields: {} as any,
            };
            setTimeout(() => onMessage(message), 10);
            return Promise.resolve({ consumerTag: 'test-tag' });
        });
        const result = await service.sendDataToAPI<typeof data, typeof responseData>(data, queue, responseQueue);
        expect(mockConnection.createChannel).toHaveBeenCalledWith(responseQueue);
        expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
            queue,
            Buffer.from(JSON.stringify({ data })),
            { correlationId, replyTo: responseQueue }
        );
        expect(mockChannel.consume).toHaveBeenCalledWith(
            responseQueue,
            expect.any(Function),
            { noAck: true }
        );
        expect(mockConnection.closeConnection).toHaveBeenCalled();
        expect(result).toEqual(responseData);
    });

    it('should send data to the queue and do not recieve a message', async () => {
        const queue = 'test-queue';
        const responseQueue = 'response-queue';
        const data = { key: 'value' };
        const correlationId = 'test-correlation-id';
        const responseData = {};
        (uuid as jest.Mock).mockReturnValue(correlationId);
        mockChannel.consume.mockImplementation((queue, onMessage) => {
            setTimeout(() => onMessage(null), 10);
            return Promise.resolve({ consumerTag: 'test-tag' });
        });
        const result = await service.sendDataToAPI<typeof data, typeof responseData>(data, queue, responseQueue);
        expect(mockConnection.createChannel).toHaveBeenCalledWith(responseQueue);
        expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
            queue,
            Buffer.from(JSON.stringify({ data })),
            { correlationId, replyTo: responseQueue }
        );
        expect(mockChannel.consume).toHaveBeenCalledWith(
            responseQueue,
            expect.any(Function),
            { noAck: true }
        );
        expect(mockConnection.closeConnection).toHaveBeenCalled();
        expect(result).toEqual(responseData);
    });
});
