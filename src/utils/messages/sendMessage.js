import axios from 'axios';
import FormData from 'form-data';
import { message } from "../datatypes/index.js";

export default async function sendMessage(channelId, content, token, messageId = null) {
    const formData = new FormData();

    formData.append('payload_json', JSON.stringify({
        content: typeof content === "string" ? content : content.content,
        embeds: content.embeds || [],
        message_reference: messageId ? { message_id: messageId, channel_id: channelId } : undefined,
    }));

    if (content.attachments && content.attachments.length > 0) {
        for (let i = 0; i < content.attachments.length; i++) {
            const attachment = content.attachments[i];
            if (attachment.file && Buffer.isBuffer(attachment.file)) {
                formData.append(`files[${i}]`, attachment.file, attachment.filename);
            }
        }
    }

    try {
        const response = await axios.post(
            `https://discord.com/api/v10/channels/${channelId}/messages`,
            formData,
            {
                headers: {
                    'Authorization': `Bot ${token}`,
                    ...formData.getHeaders(),
                },
            }
        );

        let messagedata = await message(response.data, token);
        return messagedata;
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
        throw error;
    }
}