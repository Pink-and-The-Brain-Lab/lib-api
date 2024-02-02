import amqplib, { Channel, Connection } from 'amqplib';

class RabbitMqManageConnection {
    private CONNECTION: Connection;
    private host: string;

    constructor (host: string) {
        this.host = host;
    }

    async createChannel(queueName: string): Promise<Channel> {
        this.CONNECTION = await amqplib.connect(this.host);
        const channel: Channel = await this.CONNECTION.createChannel();
        await channel.assertQueue(queueName);
        return channel;
    }
    
    closeConnection() {
        this.CONNECTION.close();
    }
}

export default RabbitMqManageConnection;
