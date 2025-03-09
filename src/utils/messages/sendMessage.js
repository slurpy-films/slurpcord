import { message } from "../datatypes/index.js";

export default async function sendMessage(channelId, content, token, messageId = null, ) {
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

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error('Failed to send message:', await response.json());
    }

    let messagedata = await response.json();
    messagedata = await message(messagedata, token);
    return messagedata;
}