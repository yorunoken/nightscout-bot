import { Client, type Interaction, TextChannel, WebhookClient } from "discord.js";
import { commandsCollection } from "..";

export default {
    name: "interactionCreate",
    once: false,
    async execute(interaction: Interaction, client: Client) {
        if (!interaction.isChatInputCommand()) return;

        try {
            if (interaction.user.id === "736850770955206666" || interaction.user.id === "372343076578131968") {
                const webhook = new WebhookClient({ url: process.env.WEBHOOK_URL as string });
                const currChannel = interaction.channel ? ((await interaction.channel.fetch()) as TextChannel) : null;
                await webhook.send(`${interaction.commandName} on guild ${interaction.guild?.name} on channel ${currChannel?.name || "unknown"}`);
            }
        } catch (e) {
            console.error("error, stupid", e);
        }

        const command = commandsCollection.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ Error executing command "${interaction.commandName}"`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: "There was an error.", ephemeral: true });
            } else {
                await interaction.reply({ content: "There was an error.", ephemeral: true });
            }
        }
    },
};
