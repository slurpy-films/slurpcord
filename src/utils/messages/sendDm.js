import { getDMchannel, addDMchannel } from "../../cache.js";

let queuerunning = false;
const queue = [];

export default async function sendDM(id, token, content) {
    queue.push({ content, id });
    if (!queuerunning) {
        queuerunning = true; // Start køprosessen
        await dmQueue(token); // Vent til køprosessen er ferdig
        queuerunning = false; // Når prosessen er ferdig, tillat neste
    }
}

async function dmQueue(token) {
    while (queue.length > 0) { // Fortsett så lenge det er elementer i køen
        const item = queue.shift(); // Fjerner første element i køen
        const { content, id } = item;

        // Hent eksisterende DM-kanal fra cache
        const cachedChannel = getDMchannel(id);

        if (cachedChannel) {
            await sendMessageToChannel(token, cachedChannel.id, content);
        } else {
            const channel = await createDMChannel(token, id);
            await sendMessageToChannel(token, channel.id, content);
            addDMchannel(id, channel); // Cache kanalen
        }
    }
}

async function sendMessageToChannel(token, channelId, content) {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${token}`
        },
        body: JSON.stringify(typeof(content) === "string" ? { content } : content )
    });

    const message = await response.json();

    if (!response.ok) {
        throw new Error(`Failed to send message: ${message.message}`);
    }

    return message;
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
