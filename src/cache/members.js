import { member } from "../utils/index.js";

const cache = new Map();

export async function getCachedMember(guildId, user, token) {
    const memberCacheKey = `${guildId}-${user.id}`;
    if (cache.has(memberCacheKey)) {
        return cache.get(memberCacheKey);
    }
    const memberData = await member(user, guildId, token);
    cache.set(memberCacheKey, memberData);
    return memberData;
}


export function memberIsIsCache(userId, guildId) {
    const memberCacheKey = `${guildId}-${userId}`;
    return cache.has(memberCacheKey);
}


export async function addMemberToCache(data, token, guildId) {
    const memberkey = `${guildId}-${data.user.id}`;
    if (cache.has(memberkey)) return;
    cache.set(memberkey, await member(data, guildId, token));
}
