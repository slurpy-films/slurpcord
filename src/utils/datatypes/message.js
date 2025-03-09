import { sendMessage, editMessage } from "../messages/index.js";

export default async function message(data, token) {
    const msgdata = data;

    msgdata.reply = async (content) => {
        return await sendMessage(msgdata.channel_id, content, token, msgdata.id);
    }

    msgdata.edit = async (content) => {
        return await editMessage(msgdata.channel_id, content, token, msgdata.id);
    }

    return msgdata;
}