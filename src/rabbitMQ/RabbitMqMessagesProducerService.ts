import { Channel, ConsumeMessage } from "amqplib";
import { uuid } from 'uuidv4';
import { RabbitMqManageConnection } from "./RabbitMqManageConnection";

export class RabbitMqMessagesProducerService {
    private connection: RabbitMqManageConnection;

    constructor(connection: RabbitMqManageConnection) {
        this.connection = connection;
    }

    async sendDataToAPI<T, K>(data: T, queue: string, responseQueue: string) {
        const channel = await this.connection.createChannel(responseQueue);
        const correlationId = uuid();
        const message = JSON.stringify({ data });
        channel.sendToQueue(
            queue,
            Buffer.from(message),
            {
                correlationId,
                replyTo: responseQueue
            }
        );

        return this.awaitApiResponse<K>(channel, correlationId, responseQueue);
    }

    private awaitApiResponse<T>(
        channel: Channel,
        correlationId: string,
        responseQueue: string
    ): Promise<T> {
        return new Promise(resolve => {
            channel.consume(responseQueue, (message: ConsumeMessage | null) => {
                if (!message) {
                    const response: T = {} as T;
                    resolve(response);
                    this.connection.closeConnection();
                } else if (message.properties.correlationId === correlationId) {
                    const response: T = JSON.parse(message.content.toString());
                    resolve(response);
                    this.connection.closeConnection();
                };
            }, {
                noAck: true,
            });
        });
    }
}
