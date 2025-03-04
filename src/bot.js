export class Bot {
    constructor(token, prefix) {
        this.token = token;
        this.prefix = prefix;
        this.baseUrl = "https://discord.com/api/v10";
        this.commands = new Map();
    }

    command(name, action) {
        this.commands.set(name, action);
    }

    ready(action) {
        this.ready = action;
    }

    async start() {
        const WebSocket = await import('ws');
        const ws = new WebSocket.WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

        ws.on('open', () => {
            ws.send(JSON.stringify({
                op: 2,
                d: {
                    token: this.token,
                    intents: 513 | 32768,
                    properties: {
                        os: 'linux',
                        browser: 'bot',
                        device: 'bot'
                    }
                }
            }));
        });

        ws.on('message', async (data) => {
            const payload = JSON.parse(data);
            const { op, t: event, s: sequence, d: messageData } = payload;

            if (op === 10) { // HELLO event fra Discord
                const heartbeatInterval = messageData.heartbeat_interval;

                // Starter heartbeat
                setInterval(() => {
                    ws.send(JSON.stringify({
                        op: 1, // HEARTBEAT opcode
                        d: sequence // Sekvensnummer for siste mottatte event
                    }));
                }, heartbeatInterval);
            }

            if (event === 'MESSAGE_CREATE') {
                const message = messageData;
                if (message.content.startsWith(this.prefix)) {
                    const [cmd, ...args] = message.content.slice(this.prefix.length).split(/\s+/);
                    const command = this.commands.get(cmd);
                    let guild;
                    if (message.guild_id) {
                        guild = await this.fetchGuild(message.guild_id);
                    }
                    if (command) {
                        command({
                            reply: (content) => this.sendMessage(message.channel_id, content, message.id),
                            args,
                            message,
                            channel: {
                                send: (content) => this.sendMessage(message.channel_id, content)
                            },
                            guild: guild ? guild : undefined,
                        });
                    }
                }
            } else if (event === "READY") {
                if (this.ready) {
                    this.user = messageData.user;
                    this.user.tag = messageData.user.username + "#" + messageData.user.discriminator;
                    this.ready();
                }
            }
        });
    }

    async sendMessage(channelId, content, messageId = null) {
        let body;
        if (typeof(content) === "string") {
            body = { content };
        } else {
            body = content;
        }

        if (messageId) {
            body.message_reference = {
                message_id: messageId,
                channel_id: channelId
            };
        }

        const response = await fetch(`${this.baseUrl}/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error('Failed to send message:', await response.json());
        }
    }

    async fetchGuild(guildId) {
        const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${this.token}`
            }
        });
    
        if (!response.ok) {
            console.error('Failed to fetch guild:', await response.json());
            return null;
        }
    
        const guild = await response.json();
        return guild;
    }
    
}
