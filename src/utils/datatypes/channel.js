import sendMessage from "../messages/sendMessage.js";

export default async function channel(data, token) {
    const response = await fetch(`https://discord.com/api/v10/channels/${data}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bot ${token}`
        }
    });

    if (!response.ok) {
        console.error('Failed to fetch channel:', await response.json());
        return null;
    }

    data = await response.json();

    const channelData = data;

    channelData.send = async (content) => {
        await sendMessage(data.id, content, token);
    }

    channelData.messages = {
        fetch: async (id) => {
            const response = await fetch(`https://discord.com/api/v10/channels/${data.id}/messages${id ? `/${id}` : ''}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bot ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages:', await response.json());
            }
        }
    }

    return channelData;
}