import { member, fetchGuild, channel, user, guild } from "./utils/index.js";

const cache = {
    guilds: new Map(),
    channels: new Map(),
    users: new Map(),
    members: new Map(),
    userChannels: new Map()
};

export async function getCachedGuild(guildId, token) {
    if (cache.guilds.has(guildId)) {
        return cache.guilds.get(guildId);
    }

    const guilddata = await fetchGuild(guildId, token);
    const processedguild = await guild(guilddata, token);
    cache.guilds.set(guildId, processedguild);
    return processedguild;
}

export async function getCachedChannel(channelId, token) {
    if (cache.channels.has(channelId)) {
        return cache.channels.get(channelId);
    }

    const channelData = await channel(channelId, token);
    cache.channels.set(channelId, channelData);
    return channelData;
}

export async function getCachedUser(data, token) {
    if (cache.users.has(data.id)) {
        return cache.users.get(data.id);
    }

    const userData = await user(data, token);
    cache.users.set(data.id, userData);
    return userData;
}

export async function getCachedMember(guildId, user, token) {
    const memberCacheKey = `${guildId}-${user.id}`;
    if (cache.members.has(memberCacheKey)) {
        return cache.members.get(memberCacheKey);
    }
    const memberData = await member(user, guildId, token);
    cache.members.set(memberCacheKey, memberData);
    return memberData;
}


export function memberIsIsCache(userId, guildId) {
    const memberCacheKey = `${guildId}-${userId}`;
    return cache.members.has(memberCacheKey);
}


export async function addMemberToCache(data, token, guildId) {
    const memberkey = `${guildId}-${data.user.id}`;
    if (cache.members.has(memberkey)) return;
    cache.members.set(memberkey, await member(data, guildId, token));
}

export function userIsIsCache(userId) {
    return cache.users.has(userId);
}

export function getDMchannel(userId) {
    if (cache.userChannels.has(userId)) {
        return cache.userChannels.get(userId);
    }
    return null;
}

export function addDMchannel(userId, dmchannel) {
    cache.userChannels.set(userId, dmchannel);
}