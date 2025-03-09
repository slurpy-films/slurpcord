import { user } from "../utils/index.js";

const cache = new Map();

export async function getCachedUser(data, token) {
    if (cache.has(data.id)) {
        return cache.get(data.id);
    }

    const userData = await user(data, token);
    cache.set(data.id, userData);
    return userData;
}

export function userIsIsCache(userId) {
    return cache.has(userId);
}