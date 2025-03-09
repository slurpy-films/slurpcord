import { Bot } from "slurpcord";

const bot = new Bot("DISCORD_TOKEN", "PREFIX");

bot.command("ping", async (cmd) => {
    await cmd.reply("Pong!");
});

bot.start();