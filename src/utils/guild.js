import member from "./member.js";
import channel from "./channel.js";
import { memberIsIsCache, getCachedMember, addMemberToCache } from "../cache.js";

export default async function guild(data, token) {
    const guildData = data;

    guildData.members = {
        fetch: async (userId) => {
            if (!userId) return null;

            if (memberIsIsCache(userId, data.id)) {
                return await getCachedMember(data.id, { id: userId }, token);
            }

            const response = await fetch(`https://discord.com/api/v10/guilds/${data.id}/members/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bot ${token}`
                }
            });

            if (!response.ok) {
                return null;
            }

            const memberData = await response.json();

            // Hent medlemmet med full informasjon, inkludert permissions
            const memberWithPermissions = await member(memberData, data.id, token);

            // Legg til permissions som et dekodet array

            addMemberToCache(memberData, token, data.id);

            return memberWithPermissions;
        }
    };

    guildData.channels = {
        fetch: async (channelId) => {
            return await channel(channelId, token);
        },
        create: async (name, type = 0) => {
            const response = await fetch(`https://discord.com/api/v10/guilds/${data.id}/channels`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bot ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    type: type
                })
            });

            if (!response.ok) {
                console.error('Failed to create channel:', await response.json());
                return null;
            }

            const channelData = await response.json();
            return await channel(channelData.id, token);
        },
        delete: async (channelId) => {
            const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bot ${token}`
                }
            });

            if (!response.ok) {
                console.error('Failed to delete channel:', await response.json());
                return null;
            }

            return true;
        }
    };

    return guildData;
}
