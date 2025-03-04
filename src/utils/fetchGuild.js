export default async function fetchGuild(guildId, token) {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bot ${token}`
        }
    });

    if (!response.ok) {
        console.error('Failed to fetch guild:', await response.json());
        return null;
    }

    const guild = await response.json();
    return guild;
}