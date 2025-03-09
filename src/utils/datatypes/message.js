import { sendMessage } from "../messages/index.js";

export default async function message(data, token) {
    const msgdata = data;

    msgdata.reply = async (content) => {
        await sendMessage(msgdata.channel_id, content, token, msgdata.id);
    }

    return msgdata;
}