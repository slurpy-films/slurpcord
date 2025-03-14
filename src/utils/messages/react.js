import SlurpcordError from "../../errors/index.js";

export default async function addReaction(channelId, messageId, emoji, token) {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bot ${token}`,
        },
    });

    if (!response.ok) {
        throw new SlurpcordError('Failed to add reaction: ');
    }
}
