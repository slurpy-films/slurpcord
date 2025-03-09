import { fetchGuild } from "../utils/index.js";
import { guild } from "../utils/index.js";

const cache = new Map();

export async function getCachedGuild(guildId, token) {
    if (cache.has(guildId)) {
        return cache.get(guildId);
    }

    const guilddata = await fetchGuild(guildId, token);
    const processedguild = await guild(guilddata, token);
    cache.set(guildId, processedguild);
    return processedguild;
}