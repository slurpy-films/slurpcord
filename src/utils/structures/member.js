export default async function member(data, guildId, token) {

    const memberData = data;

    memberData.ban = async (reason, delmsgdays = 0) => {
        await fetch(`https://discord.com/api/v10/guilds/${guildId}/bans/${data.user.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json',

                'X-Audit-Log-Reason': reason || "",
            },
            body: JSON.stringify({
                delete_message_days: delmsgdays,
            })
        });
    }

    memberData.kick = async (reason = "") => {
        await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${data.user.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json',
                'X-Audit-Log-Reason': reason,
            },
        });
    }


    memberData.hasPermission = async (permission, channel) => {
        const channelData = await fetch(`https://discord.com/api/v10/channels/${channel.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${token}`
            }
        }).then(res => res.json());
    
        let permissions = memberData.permissions;

    
        const overwrites = channelData.permission_overwrites.filter(overwrite =>
            overwrite.id === memberData.id || memberData.roles.includes(overwrite.id)
        );
    
        for (const overwrite of overwrites) {
            permissions &= ~overwrite.deny;
            permissions |= overwrite.allow;
        }
    
        const permissionBit = getPermissionBit(permission);
        return (permissions & permissionBit) === permissionBit;
    };
    
    function getPermissionBit(permission) {
        const permissionsMap = {
            'ADMINISTRATOR': 0x00000008,
            'MANAGE_CHANNELS': 0x00000010,
            'SEND_MESSAGES': 0x00000800,
            'VIEW_CHANNEL': 0x00000400,
        };
        return permissionsMap[permission];
    }
    

    return memberData;
}