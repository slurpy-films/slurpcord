import fetch from 'node-fetch';

export default async function RegisterCommands(token, clientId, commands) {
    const url = `https://discord.com/api/v10/applications/${clientId}/commands`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commands)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Failed to register commands:', data);
        } else {
        }
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}