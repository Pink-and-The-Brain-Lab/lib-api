import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMqManageConnection } from './RabbitMqManageConnection';

export class RabbitMqListener {
    private connection: RabbitMqManageConnection;

    constructor(connection: RabbitMqManageConnection) {
        this.connection = connection;
    }
    
    async genericListener<T, K>(queue: string, callback: Function): Promise<void> {
        const channel = await this.connection.createChannel(queue);
        channel.consume(queue, async (message: ConsumeMessage | null) => {
            if (!message) return;
            const content: K = JSON.parse(message.content.toString()).data;
            let response: T = await callback(content);
            this.rabbitQueueResponse<T>(channel, message, response);
            channel.ack(message);
        });
    }

    private rabbitQueueResponse<T>(channel: Channel, message: ConsumeMessage, response: T): void {
        const correlationId = message.properties.correlationId;
        const replyTo = message.properties.replyTo;
        channel.sendToQueue(
            replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId }
        );
    }
  
};
