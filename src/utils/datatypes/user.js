import sendDM from "../messages/sendDm.js";

export default async function user(data, token) {
    const userdata = data;

    userdata.send = async (content) => {
        await sendDM(data.id, token, content);
    }

    return userdata;
}