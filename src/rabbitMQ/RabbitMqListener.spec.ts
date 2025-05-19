import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMqManageConnection } from './RabbitMqManageConnection';
import { RabbitMqListener } from './RabbitMqListener';

describe('RabbitMqListener', () => {
    let mockConnection: jest.Mocked<RabbitMqManageConnection>;
    let mockChannel: jest.Mocked<Channel>;
    let rabbitMqListener: RabbitMqListener;

    beforeEach(() => {
        mockConnection = {
            createChannel: jest.fn(),
        } as unknown as jest.Mocked<RabbitMqManageConnection>;
        mockChannel = {
            consume: jest.fn(),
            ack: jest.fn(),
            sendToQueue: jest.fn(),
        } as unknown as jest.Mocked<Channel>;
        rabbitMqListener = new RabbitMqListener(mockConnection);
    });

    it('should consume messages and process them with the callback', async () => {
        const queue = 'test-queue';
        const mockMessage: ConsumeMessage = {
            content: Buffer.from(JSON.stringify({ data: { key: 'value' } })),
            properties: {
                correlationId: '123',
                replyTo: 'reply-queue',
            },
        } as unknown as ConsumeMessage;
        const callback = jest.fn().mockResolvedValue({ success: true });
        mockConnection.createChannel.mockResolvedValue(mockChannel);
        mockChannel.consume.mockImplementation((_, onMessage) => {
            onMessage(mockMessage);
            return Promise.resolve({ consumerTag: 'test-tag' });
        });
        await rabbitMqListener.genericListener(queue, callback);
        expect(callback).toHaveBeenCalledWith({ key: 'value' });
        expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
            'reply-queue',
            Buffer.from(JSON.stringify({ success: true })),
            { correlationId: '123' }
        );
        expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
    });

    it('should try to consume messages and do not recieve a messsage', async () => {
        const queue = 'test-queue';
        const callback = jest.fn().mockResolvedValue({ success: true });
        mockConnection.createChannel.mockResolvedValue(mockChannel);
        mockChannel.consume.mockImplementation((_, onMessage) => {
            onMessage(null);
            return Promise.resolve({ consumerTag: 'test-tag' });
        });
        await rabbitMqListener.genericListener(queue, callback);
        expect(callback).not.toHaveBeenCalled();
        expect(mockChannel.sendToQueue).not.toHaveBeenCalled();
        expect(mockChannel.ack).not.toHaveBeenCalled();
    });
});
