import { sendMessage } from "./utils/messages/index.js";
import { getCachedChannel, getCachedGuild, getCachedMember, getCachedUser } from './cache.js';
import { commandInteraction, buttonInteraction, RegisterCommands } from './interactions/index.js';
let sequence = null;

export default class Bot {
    constructor(token, prefix = "") {
        this.token = token;
        this.prefix = prefix;
        this.baseUrl = "https://discord.com/api/v10";
        this.commands = new Map();
        this.slashCmds = new Map();
        this.buttons = [];
        this.activity = null;
        this.connected = false;
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
        await RegisterCommands(this.token, this.user.id, commands);
    }

    setPrefix(prefix) {
        this.prefix = prefix;
    }

    button(action) {
        this.buttons.push(action);
    }

    setActivity(name, type = 0) {
        this.activity = { name, type };
        if (this.ws && this.connected) {
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
                        intents: 513 | 32768 | 8,
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
                    const input = message.content.split(this.prefix + cmd + "")[1];

                    const [guild, userdata, channelData] = await Promise.all([
                        message.guild_id ? getCachedGuild(message.guild_id, this.token) : null,
                        getCachedUser(message.author, this.token),
                        getCachedChannel(message.channel_id, this.token),
                    ]);
                    if (command) {
                        command({
                            reply: (content) => sendMessage(message.channel_id, content, this.token, message.id),
                            message,
                            user: userdata,
                            channel: channelData,
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

                if (interaction.type === 2) {
                interaction = commandInteraction(interaction);

                const commandfunc = this.slashCmds.get(interaction.data.name);
                interaction.options = {};
                if (interaction.data.options) {
                    for (let option of interaction.data.options) {
                        interaction.options[option.name] = option.value;
                    }
                }
                const [channel, userdata, guild, member] = await Promise.all([
                    getCachedChannel(interaction.channel_id, this.token),
                    getCachedUser(interaction.member.user, this.token),
                    getCachedGuild(interaction.guild_id, this.token),
                    getCachedMember(interaction.guild_id, interaction.member, this.token)
                ]);

                interaction.user = userdata;
                interaction.channel = channel;
                interaction.guild = guild;
                interaction.member = member;



                if (commandfunc) {
                    commandfunc(interaction);
                }
                } else if (interaction.type === 3) {
                    interaction = buttonInteraction(interaction);

                    const [channel, userdata, guild, member] = await Promise.all([
                        getCachedChannel(interaction.channel_id, this.token),
                        getCachedUser(interaction.member.user, this.token),
                        getCachedGuild(interaction.guild_id, this.token),
                        getCachedMember(interaction.guild_id, interaction.member, this.token)
                    ]);

                    interaction.user = userdata;
                    interaction.guild = guild;
                    interaction.member = member;
                    interaction.channel = channel;

                    this.buttons.forEach(func => {
                        func(interaction);
                    });
                }
                

            }
        });
    }
}