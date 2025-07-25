import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { APP_ID, APP_TOKEN, GUILD_ID } from ".";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commands = [];

const commandFiles = readdirSync(path.join(__dirname, "commands")).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(APP_TOKEN);

try {
    console.log("Deploying commands...");

    // Dev testing
    // await rest.put(Routes.applicationGuildCommands(APP_ID, GUILD_ID), { body: commands });

    // Global
    await rest.put(Routes.applicationCommands(APP_ID), { body: commands });
    console.log("✅ Successfully deployed!");
} catch (error) {
    console.error("❌ Error deploying commands:", error);
}
