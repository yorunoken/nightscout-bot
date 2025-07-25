import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),

    async execute(interaction: ChatInputCommandInteraction) {
        const startTime = performance.now();

        await interaction.reply({
            content: "Ping...",
        });

        const endTime = performance.now();
        const ms = endTime - startTime;

        await interaction.editReply({
            content: `Ping! (${ms.toFixed()}ms)`,
        });
    },
};
