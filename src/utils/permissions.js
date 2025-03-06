const permissionFlags = {
    ADMINISTRATOR: 0x00000008,
    VIEW_AUDIT_LOG: 0x00000010,
    MANAGE_GUILD: 0x00000020,
    ADD_REACTIONS: 0x00000040,
    VIEW_CHANNEL: 0x00000400,
    SEND_MESSAGES: 0x00000800,
    MANAGE_MESSAGES: 0x00002000,
    MANAGE_ROLES: 0x00004000,
    MANAGE_CHANNELS: 0x00008000,
    KICK_MEMBERS: 0x00010000,
    BAN_MEMBERS: 0x00020000
};

export async function getUserPermissions(token, userId, guildId) {
    try {
        // Hent brukerens medlemsdata
        const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!memberResponse.ok) {
            console.error('Failed to fetch member data:', await memberResponse.json());
            return [];
        }

        const memberData = await memberResponse.json();

        // Hent alle rollene i guilden
        const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!rolesResponse.ok) {
            console.error('Failed to fetch roles:', await rolesResponse.json());
            return [];
        }

        const roles = await rolesResponse.json();

        // Finn rollene som brukeren har
        const userRoles = memberData.roles;
        const userPermissions = new Set();

        for (const role of roles) {
            if (userRoles.includes(role.id)) {
                const permissions = Number(role.permissions);
                for (const [permission, flag] of Object.entries(permissionFlags)) {
                    if ((permissions & flag) === flag) {
                        userPermissions.add(permission);
                    }
                }
            }
        }

        return Array.from(userPermissions);
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return [];
    }
}