import { Client, Collection, GatewayIntentBits } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { DiscordEvent } from "./types/DiscordEvents";
import type { Command } from "./types/Command";

export const APP_TOKEN = process.env.APP_TOKEN!;
export const APP_ID = process.env.APP_ID!;
export const GUILD_ID = process.env.GUILD_ID!;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const commandsCollection = new Collection<string, Command>();
const commandFiles = readdirSync(path.join(__dirname, "commands")).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    commandsCollection.set(command.data.name, command);
}

const eventFiles = readdirSync(path.join(__dirname, "events")).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
for (const file of eventFiles) {
    const eventModule = await import(`./events/${file}`);
    const event: DiscordEvent = eventModule.default;

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
client.login(APP_TOKEN);
