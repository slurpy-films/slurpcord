import member from "./member.js";
import channelType from "./channel.js";
import { memberIsIsCache, getCachedMember, addMemberToCache } from "../../cache/index.js";

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

            const memberWithPermissions = await member(memberData, data.id, token);


            addMemberToCache(memberData, token, data.id);

            return memberWithPermissions;
        }
    };

    guildData.channels = {
        fetch: async (channelId) => {
            return await channelType(channelId, token);
        },
        create: async (channel) => {
            const { name, type, parentId, permissionOverwrites } = channel;

            const body = {
                name: name,
                type: type,
            };
        
            if (parentId) {
                body.parent_id = parentId;
            }

            if (permissionOverwrites && permissionOverwrites.length > 0) {
                body.permission_overwrites = permissionOverwrites;
            }
        
            const response = await fetch(`https://discord.com/api/v10/guilds/${data.id}/channels`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bot ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
        
            if (!response.ok) {
                console.error('Failed to create channel:', await response.json());
                return null;
            }
        
            const channelData = await response.json();
            return await channelType(channelData.id, token);
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
