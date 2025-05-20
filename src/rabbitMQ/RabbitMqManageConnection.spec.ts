import amqplib, { Channel, Connection } from 'amqplib';
import { RabbitMqManageConnection } from './RabbitMqManageConnection';

jest.mock('amqplib');

describe('RabbitMqManageConnection', () => {
    let mockConnection: jest.Mocked<Connection>;
    let mockChannel: jest.Mocked<Channel>;
    let rabbitMqManageConnection: RabbitMqManageConnection;

    beforeEach(() => {
        mockConnection = {
            createChannel: jest.fn(),
            close: jest.fn(),
        } as unknown as jest.Mocked<Connection>;
        mockChannel = {
            assertQueue: jest.fn(),
        } as unknown as jest.Mocked<Channel>;
        (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);
        mockConnection.createChannel.mockResolvedValue(mockChannel);
        rabbitMqManageConnection = new RabbitMqManageConnection('amqp://localhost');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a channel and assert the queue', async () => {
        const queueName = 'test-queue';
        const channel = await rabbitMqManageConnection.createChannel(queueName);
        expect(amqplib.connect).toHaveBeenCalledWith('amqp://localhost');
        expect(mockConnection.createChannel).toHaveBeenCalled();
        expect(mockChannel.assertQueue).toHaveBeenCalledWith(queueName);
        expect(channel).toBe(mockChannel);
    });

    it('should close the connection', async () => {
        const queueName = 'test-queue';
        await rabbitMqManageConnection.createChannel(queueName);
        rabbitMqManageConnection.closeConnection();
        expect(mockConnection.close).toHaveBeenCalled();
    });
});