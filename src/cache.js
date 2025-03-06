import { member, fetchGuild, channel, user, guild } from "./utils/utils.js";

const cache = {
    guilds: new Map(),
    channels: new Map(),
    users: new Map(),
    members: new Map()  // Added member cache
};

// Fetch cached or fresh guild data
export async function getCachedGuild(guildId, token) {
    if (cache.guilds.has(guildId)) {
        return cache.guilds.get(guildId);
    }

    const guilddata = await fetchGuild(guildId, token);
    const processedguild = await guild(guilddata, token);
    cache.guilds.set(guildId, processedguild);
    return processedguild;
}

// Fetch cached or fresh channel data
export async function getCachedChannel(channelId, token) {
    if (cache.channels.has(channelId)) {
        return cache.channels.get(channelId);
    }

    const channelData = await channel(channelId, token);
    cache.channels.set(channelId, channelData);
    return channelData;
}

// Fetch cached or fresh user data
export async function getCachedUser(data, token) {
    if (cache.users.has(data.id)) {
        return cache.users.get(data.id);
    }

    const userData = await user(data, token);
    cache.users.set(data.id, userData);
    return userData;
}

// Fetch cached or fresh member data
export async function getCachedMember(guildId, user, token) {
    const memberCacheKey = `${guildId}-${user.id}`;

    if (cache.members.has(memberCacheKey)) {
        return cache.members.get(memberCacheKey);
    }

    const memberData = await member(user, guildId, token);
    cache.members.set(memberCacheKey, memberData);
    return memberData;
}
