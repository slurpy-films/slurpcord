import { channel } from "../utils/index.js";

const cache = new Map();

export async function getCachedChannel(channelId, token) {
    if (cache.has(channelId)) {
        return cache.get(channelId);
    }

    const channelData = await channel(channelId, token);
    cache.set(channelId, channelData);
    return channelData;
}
