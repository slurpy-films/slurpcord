import sendMessage from './utils/sendMessage.js';
import fetchGuild from './utils/fetchGuild.js';
import registerCommands from './slashCommands.js';

let sequence = null;

export default class Bot {
    constructor(token, prefix = "") {
        this.token = token;
        this.prefix = prefix;
        this.baseUrl = "https://discord.com/api/v10";
        this.commands = new Map();
        this.slashCmds = new Map();
        this.activity = null;
        this.connected = false; // Sjekk for HELLO-event
        this.guilds = [];
    }

    command(name, action) {
        this.commands.set(name, action);
    }

    slashCommand(name, action) {
        this.slashCmds.set(name, action);
    }

    ready(action) {
        this.ready = action;
    }

    async setCommands(commands) {
        await registerCommands(this.token, this.user.id, commands);
    }

    setPrefix(prefix) {
        this.prefix = prefix;
    }

    setActivity(name, type = 0) {
        this.activity = { name, type };
        if (this.ws && this.connected) { // Sjekk om vi er ferdige med HELLO
            this.ws.send(JSON.stringify({
                op: 3,
                d: {
                    since: null,
                    activities: [this.activity],
                    status: 'online',
                    afk: false
                }
            }));
        }
    }

    async start() {
        const WebSocket = await import('ws');
        this.ws = new WebSocket.WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');


        this.ws.on('close', (code, reason) => {
            console.log(`WebSocket closed: ${code} - ${reason}`);
            clearInterval(this.heartbeat);
        });

        this.ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.ws.close();
        });

        

        this.ws.on('message', async (data) => {
            const payload = JSON.parse(data);
            const { op, t: event, s, d: messageData } = payload;

            if (s) sequence = s;

            if (op === 10) { // HELLO-event
                const heartbeatInterval = messageData.heartbeat_interval;

                const sendHeartbeat = () => {
                    this.ws.send(JSON.stringify({
                        op: 1,
                        d: sequence
                    }));
                };

                sendHeartbeat();
                this.heartbeat = setInterval(sendHeartbeat, heartbeatInterval);

                this.ws.send(JSON.stringify({
                    op: 2,
                    d: {
                        token: this.token,
                        intents: 513 | 32768,
                        properties: {
                            os: 'linux',
                            browser: 'bot',
                            device: 'bot'
                        },
                        presence: this.activity ? {
                            activities: [this.activity],
                            status: 'online',
                            afk: false
                        } : undefined
                    }
                }));

                this.connected = true;
            }

            if (event === 'MESSAGE_CREATE') {
                let message = messageData;
                if (message.content.startsWith(this.prefix)) {
                    const [cmd, ...args] = message.content.slice(this.prefix.length).split(/\s+/);
                    const command = this.commands.get(cmd);
                    let guild;

                    const input = message.content.split(this.prefix + cmd + "")[1];
                    if (message.guild_id) {
                        guild = await fetchGuild(message.guild_id, this.token);
                    }
                    if (command) {
                        command({
                            reply: (content) => sendMessage(message.channel_id, content, this.token, message.id),
                            message,
                            channel: {
                                send: (content) => sendMessage(message.channel_id, content, this.token)
                            },
                            guild: guild ? guild : undefined,
                        }, input);
                    }
                }
            } else if (event === "READY") {
                if (this.ready) {
                    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bot ${this.token}`,
                            'Content-Type': 'application/json'
                        }
                    });
            
                    const guilddata = await response.json();
            
                    this.guilds = guilddata;
                    this.user = messageData.user;
                    this.user.tag = messageData.user.username + "#" + messageData.user.discriminator;
                    this.ready();
                }
            } else if (event === "INTERACTION_CREATE") {
                let interaction = messageData;
                const command = this.slashCmds.get(interaction.data.name);
                interaction.options = {};
                if (interaction.data.options) {
                    for (let option of interaction.data.options) {
                        interaction.options[option.name] = option.value;
                    }
                }
                if (command) {
                    command({
                        reply: (content) => {
                            let responseData;
                            if (typeof(content) === "string") {
                                responseData = { content };
                            } else {
                                responseData = content;
                                if (responseData.ephemeral) {
                                    responseData.flags = 64;
                                }
                            }
                            return fetch(`${this.baseUrl}/interactions/${interaction.id}/${interaction.token}/callback`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    type: 4,
                                    data: responseData
                                })
                            });
                        },                        
                        interaction,
                        channel: {
                            send: (content) => sendMessage(interaction.channel_id, content, this.token)
                        },
                        getOption: (name) => interaction.options[name]
                    });
                }
            }
        });
    }
}
