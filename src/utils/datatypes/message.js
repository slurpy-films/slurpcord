import { sendMessage, editMessage, addReaction } from "../messages/index.js";

export default async function message(data, token) {
    const msgdata = data;

    msgdata.reply = async (content) => {
        return await sendMessage(msgdata.channel_id, content, token, msgdata.id);
    }

    msgdata.edit = async (content) => {
        return await editMessage(msgdata.channel_id, content, token, msgdata.id);
    }

    msgdata.react = async (emoji) => {
        await addReaction(msgdata.channel_id, msgdata.id, emoji, token);
    }

    msgdata.delete = async () => {
        await fetch(`https://discord.com/api/v10/channels/${msgdata.channel_id}/messages/${msgdata.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bot ${token}`
            }
        })
    }

    return msgdata;
}