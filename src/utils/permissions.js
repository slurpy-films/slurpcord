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
    BAN_MEMBERS: 0x00020000,
    ADMINISTRATOR: 0x00000008,
};

export function decodePermissions(rawpermissions) {
    const permissions = Number(rawpermissions);
    const decodedPermissions = [];

    // Loop through each permission flag
    for (const [permission, flag] of Object.entries(permissionFlags)) {
        if ((permissions & flag) === flag) {
            decodedPermissions.push(permission);
        }
    }

    return decodedPermissions;
}