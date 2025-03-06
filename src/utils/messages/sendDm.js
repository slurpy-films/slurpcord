export default async function sendDM(id, token, content) {
    try {
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

        const messageResponse = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bot ${token}`
            },
            body: JSON.stringify(typeof(content) === "string" ? { content } : content )
        });

        const message = await messageResponse.json();

        if (!messageResponse.ok) {
            throw new Error(`Failed to send message: ${message.message}`);
        }

        return message;
    } catch (error) {
        console.error('Error sending DM:', error);
        throw error;
    }
}