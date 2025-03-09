export default function commandInteraction(data) {
    const cmddata = data;
    cmddata.commandName = cmddata.data.name;
    cmddata.options = {};
    
    if (cmddata.data.options) {
        for (let option of cmddata.data.options) {
            cmddata.options[option.name] = option.value;
        }
    }

    cmddata.reply = async (content) => {
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

    cmddata.deferReply = async (ephemeral) => {
        await fetch(`https://discord.com/api/v10/interactions/${data.id}/${data.token}/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 5,
                data: { flags: ephemeral ? 64 : 0 }
            })
        });
    }

    cmddata.editReply = async (content) => {
        let responseData;
        if (typeof(content) === "string") {
            responseData = { content };
        } else {
            responseData = content;
            if (responseData.ephemeral) {
                responseData.flags = 64;
            }
        }
        await fetch(`https://discord.com/api/v10/webhooks/${data.application_id}/${data.token}/messages/@original`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseData)
        });
    }

    cmddata.getOption = (option) => {
        return cmddata.options[option];
    }

    return cmddata;
}