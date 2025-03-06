import { getUserPermissions } from "./permissions.js";

export default async function member(data, guildId, token) {

    const memberData = data;

    memberData.ban = async (reason) => {
        await fetch(`https://discord.com/api/v10/guilds/${guildId}/bans/${data.user.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reason: reason
            })
        });
    }

    memberData.kick = async (reason) => {
        await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${data.user.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reason: reason
            })
        });
    }

    memberData.permissions = await getUserPermissions(token, data.user.id, guildId);

    return memberData;
}
