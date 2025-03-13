import { getDMchannel, addDMchannel } from "../../cache/index.js";
import sendMessage from "./sendMessage.js";

let queuerunning = false;
const queue = [];

export default async function sendDM(id, token, content) {
    queue.push({ content, id });
    if (!queuerunning) {
        queuerunning = true;
        await dmQueue(token);
        queuerunning = false;
    }
}

async function dmQueue(token) {
    while (queue.length > 0) {
        const item = queue.shift();
        const { content, id } = item;

        const cachedChannel = getDMchannel(id);

        if (cachedChannel) {
            await sendMessageToChannel(token, cachedChannel.id, content);
        } else {
            const channel = await createDMChannel(token, id);
            await sendMessageToChannel(token, channel.id, content);
            addDMchannel(id, channel);
        }
    }
}

async function sendMessageToChannel(token, channelId, content) {
    return await sendMessage(channelId, content, token);
}

async function createDMChannel(token, id) {
    const response = await fetch('https://discord.com/api/v10/users/@me/channels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${token}`
        },
        body: JSON.stringify({ recipient_id: id })
    });

    const channel = await response.json();

    if (!response.ok) {
        throw new Error(`Failed to open DM: ${channel.message}`);
    }

    return channel;
}