export default function buttonInteraction(data) {
    const btnData = data;


    btnData.reply = async (content) => {
        let responseData;
        if (typeof(content) === "string") {
            responseData = { content };
        } else {
            responseData = content;
            if (responseData.ephemeral) {
                responseData.flags = 64;
            }
        }
        
        await fetch(`https://discord.com/api/v10/interactions/${data.id}/${data.token}/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 4,
                data: responseData
            })
        });
    }

    btnData.customId = btnData.data.custom_id;
    

    return btnData;
}
