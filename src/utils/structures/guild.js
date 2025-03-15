import member from "./member.js";
import channelType from "./channel.js";
import roleType from "./role.js";
import { memberIsIsCache, getCachedMember, addMemberToCache } from "../../cache/index.js";
import SlurpcordError from "../../errors/index.js";

export default async function guild(data, token) {
    const guildData = data;

    guildData.members = {
        fetch: async (userId) => {
            if (!userId) throw new Error('User ID is required');

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
                throw new SlurpcordError(`Failed to fetch member: ${await response.text()}`);
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
                throw new SlurpcordError(`Failed to create channel: ${await response.text()}`);
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
                throw new SlurpcordError(`Failed to delete channel: ${await response.text()}`);
            }

            return true;
        }
    };

    guildData.roles = {
        fetch: async (roleId) => {
            const response = await fetch(`https://discord.com/api/v10/guilds/${data.id}/roles`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bot ${token}`
                }
            });
        
            if (!response.ok) {
                throw new SlurpcordError(`Failed to fetch roles: ${await response.text()}`);
            }
        
            const rolesData = await response.json();
        
            if (roleId) {
                const role = rolesData.find(role => role.id === roleId);
                if (role) {
                    return await roleType(role, token, data.id);
                } else {
                    throw new SlurpcordError(`Role with ID ${roleId} not found.`);
                }
            }
        
            const allRoles = await Promise.all(rolesData.map(async role => await roleType(role, token, data.id)));
            return allRoles;
        },        
        create: async (role) => {
            const { name, color, hoist, mentionable, permissions } = role;

            const body = {
                name: name,
                color: color,
                hoist: hoist,
                mentionable: mentionable,
                permissions: permissions
            };

            const response = await fetch(`https://discord.com/api/v10/guilds/${data.id}/roles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bot ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new SlurpcordError(`Failed to create role: ${await response.text()}`);
            }

            const roleData = await response.json();
            return await roleType(roleData, token, data.id);
        },
        delete: async (roleId) => {
            const response = await fetch(`https://discord.com/api/v10/guilds/${data.id}/roles/${roleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bot ${token}`
                }
            });

            if (!response.ok) {
                throw new SlurpcordError(`Failed to delete role: ${await response.text()}`);
            }

            return true;
        }
    };

    return guildData;
}
