import SlurpcordError from "../../errors/index.js";

export default async function editMessage(channelId, content, token, messageId ) {
    let body;
    if (typeof(content) === "string") {
        body = { content };
    } else {
        body = content;
    }

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bot ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new SlurpcordError('Failed to send message:', await response.json());
    }

    return await response.json();
}