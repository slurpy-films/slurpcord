import { Bot, SlashCommand } from "slurpcord";

const bot = new Bot("DISCORD_TOKEN", "PREFIX");

const pingcommand = new SlashCommand()
    .setName("ping")
    .setDescription("Pong!");

bot.ready(() => {
    bot.setCommands([pingcommand]);
    console.log(`Logged in as ${bot.user.tag}`);
});

bot.slashCommand("ping", async (cmd) => {
    await cmd.reply("Pong!");
})

bot.start()