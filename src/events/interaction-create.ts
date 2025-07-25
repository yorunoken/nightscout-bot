import { Client, type Interaction } from "discord.js";
import { commandsCollection } from "..";

export default {
    name: "interactionCreate",
    once: false,
    async execute(interaction: Interaction, client: Client) {
        if (!interaction.isChatInputCommand()) return;

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
