const cache = new Map();

export function getDMchannel(userId) {
    if (cache.has(userId)) {
        return cache.get(userId);
    }
    return null;
}

export function addDMchannel(userId, dmchannel) {
    cache.set(userId, dmchannel);
}