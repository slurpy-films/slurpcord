import { sendDM } from "../messages/index.js";

export default async function user(data, token) {
    const userdata = data;

    userdata.send = async (content) => {
        await sendDM(data.id, token, content);
    }

    userdata.avatarURL = (options = { size: 1024 }) => {
        const { size } = options;
        return `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=${size}`;
    }

    return userdata;
}