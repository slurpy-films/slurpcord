import { addMemberToCache, getCachedChannel, getCachedGuild, getCachedMember, getCachedUser, userIsIsCache } from './cache/index.js';
import { commandInteraction, buttonInteraction, RegisterCommands } from './interactions/index.js';
import { guild, user, message as messageType } from "./utils/index.js";

let sequence = null;

export default class Bot {
    #commands = new Map();
    #slashCmds = new Map();
    #buttons = [];
    #guilds = new Map();
    #events = new Map();
    #connected = false;
    

    constructor(token, prefix = "") {
        this.token = token;
        this.prefix = prefix;
        this.activity = null;
        this.#connected = false;
    }

    command(name, action) {
        this.#commands.set(name, action);
    }

    slashCommand(name, action) {
        this.#slashCmds.set(name, action);
    }

    event(event, action) {
        const events = this.#events.get(event);
        if (!events) {
            this.#events.set(event, [action]);
            return;
        }
        events.push(action);
        this.#events.set(event, events);
    }

    guilds = {
        fetch: async (id) => {
            if (id) {
                const guild = this.#guilds.get(id);
                if (guild) {
                    return await guild;
                }
                return null;
            } else {
                return await Promise.all(Array.from(this.#guilds.values()));
            }
        }
    }

    users = {
        fetch: async (id) => {
            if (userIsIsCache(id)) {
                return await getCachedUser({ id }, this.token);
            } else {
                const response = await fetch(`https://discord.com/api/v1/users/${id}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bot ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json();
                getCachedUser(data, this.token);
                return await user(data, this.token);
            }
        }
    }

    channels = {
        fetch: async (id) => {
            return await getCachedChannel(id, this.token);
        }
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
        this.#buttons.push(action);
    }

    setActivity(name, type = 0) {
        this.activity = { name, type };
        if (this.ws && this.#connected) {
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

            if (op === 10) {
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
                        intents: 513 | 32768 | 8 | 16 | 2,
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

                this.#connected = true;
            }
        

            if (event === 'MESSAGE_CREATE') {
                let message = messageData;
                message = await messageType(message, this.token);
                if (message.content.startsWith(this.prefix)) {
                    const [cmd, ...args] = message.content.slice(this.prefix.length).split(/\s+/);
                    const command = this.#commands.get(cmd);
                    const input = message.content.split(this.prefix + cmd + " ")[1];
                    const [guild, userdata, channelData] = await Promise.all([
                        message.guild_id ? getCachedGuild(message.guild_id, this.token) : null,
                        getCachedUser(message.author, this.token),
                        getCachedChannel(message.channel_id, this.token),
                    ]); 

                    message.guild = guild;
                    message.user = userdata;
                    message.channel = channelData;

                    if (command) {
                        command(message, input);
                    }
                }
                if (this.#events.has(event)) {
                    const [guild, userdata, channelData] = await Promise.all([
                        message.guild_id ? getCachedGuild(message.guild_id, this.token) : null,
                        getCachedUser(message.author, this.token),
                        getCachedChannel(message.channel_id, this.token),
                    ]);


                    message.guild = guild;
                    message.user = userdata;
                    message.channel = channelData;
                    this.#events.get(event).forEach(func => {
                        func(message);
                    })
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

                    for (let data of guilddata) {
                        const formattedguild = guild(data, this.token);
                        this.#guilds.set(data.id, formattedguild);
                    }

                    this.user = messageData.user;
                    this.user.tag = messageData.user.username + "#" + messageData.user.discriminator;
                    this.ready();
                }
            } else if (event === "INTERACTION_CREATE") {
                let interaction = messageData;

                interaction.isCommand = interaction.type === 2;
                interaction.isButton = interaction.type === 3;

                if (interaction.type === 2) {
                    interaction = commandInteraction(interaction);

                    const commandfunc = this.#slashCmds.get(interaction.data.name);
                    interaction.options = {};
                    if (interaction.data.options) {
                        for (let option of interaction.data.options) {
                            interaction.options[option.name] = option.value;
                        }
                    }
                    const [channel, userdata, guild, member] = await Promise.all([
                        getCachedChannel(interaction.channel_id, this.token),
                        getCachedUser(interaction.guild_id ? interaction.member.user : interaction.user, this.token),
                        interaction.guild_id ? getCachedGuild(interaction.guild_id, this.token) : null,
                        getCachedMember(interaction.guild_id, interaction.guild_id ? interaction.member.user : interaction.user, this.token)
                    ]);

                    interaction.user = userdata;
                    interaction.channel = channel;
                    interaction.guild = guild;
                    interaction.member = member;

                    if (commandfunc) {
                        commandfunc(interaction);
                    }
                    if (this.#events.has(event)) {
                        this.#events.get(event).forEach(func => {
                            func(interaction);
                        })
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

                    this.#buttons.forEach(func => {
                        func(interaction);
                    });

                    this.#events.get(event).forEach(func => {
                        func(interaction);
                    })
                }
            } else if (event === "GUILD_MEMBER_ADD") {
                let member = messageData;
                
                const [guild, user] = await Promise.all([
                    getCachedGuild(messageData.guild_id, this.token),
                    getCachedUser(messageData.user, this.token)
                ]);

                const events = this.#events.get(event);
                if (events) {
                    events.forEach(func => {
                        func(user, guild);
                    })
                }
            } else if (event === "GUILD_MEMBER_REMOVE") {
                let member = messageData;
                
                const [guild, user] = await Promise.all([
                    getCachedGuild(member.guild_id, this.token),
                    getCachedUser(member.user, this.token),
                ]);

                const events = this.#events.get(event);

                if (events) {
                    events.forEach(func => {
                        func(user, guild);
                    })
                }
            }
        });
    }
}
