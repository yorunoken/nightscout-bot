import type { Client } from "discord.js";

export default {
    name: "ready",
    once: true,
    execute(client: Client) {
        console.log(`✅ Logged in as ${client.user?.tag}`);
        console.log(`Servers (${client.guilds.cache.size}): ${client.guilds.cache.map((g) => g.name).join(", ")}`);
    },
};
