export default async function role(data, token, guildId) {
    const roleData = data;
    
    roleData.delete = async (reason) => {
        await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles/${data.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json',
                'X-Audit-Log-Reason': reason || ''
            }
        });

        return true;
    };

    roleData.edit = async (options) => {
        const { name, color, permissions, hoist, mentionable } = options;
        
        const body = {};

        if (name) {
            body.name = name;
        }

        if (color) {
            body.color = color;
        }

        if (permissions) {
            body.permissions = permissions;
        }

        if (hoist !== undefined) {
            body.hoist = hoist;
        }

        if (mentionable !== undefined) {
            body.mentionable = mentionable;
        }
 
        const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles/${roleData.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Failed to edit role: ${JSON.stringify(await response.json())}`);
        }

        const updatedRole = await role(await response.json(), token);
        return updatedRole;
    };

    roleData.setColor = async (color) => {
        return await roleData.edit({ color });
    };

    roleData.setPermissions = async (permissions) => {
        return await roleData.edit({ permissions });
    };

    roleData.setHoist = async (hoist) => {
        return await roleData.edit({ hoist });
    };

    roleData.setMentionable = async (mentionable) => {
        return await roleData.edit({ mentionable });
    };

    return roleData;
}
