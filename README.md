<p style="align: center;">
    <img src="https://slurpy-films.github.io/images/slurpcord.png" style="width: 150px; height: auto;" />
</p>

# Slurpcord - Simple Discord API Wrapper

Slurpcord is a beginner-friendly API wrapper for Discord, designed to be easy to use and understand, especially for those who are new to Discord bot development.

## Code example:
```js
import { Bot } from "slurpcord";

const bot = new Bot("DISCORD_TOKEN", "PREFIX");

bot.command("ping", async (cmd) => {
    await cmd.reply("Pong!");
});

bot.start();
```

## Features

- Easy-to-use commands for managing Discord bots.
- Supports both message-based commands and slash commands.
- Built-in caching for faster performance.
- Lightweight and simple to integrate into your own projects.
