import { SlashCommandBuilder, AttachmentBuilder, InteractionContextType, ChatInputCommandInteraction } from "discord.js";
import { drawChart } from "../canvas";
import { getGlucoseValues } from "../utils/nightscout";

export default {
    data: new SlashCommandBuilder()
        .setName("graph")
        .addIntegerOption((o) => o.setName("hours").setDescription("Specify how many hours should be included.").setMinValue(1).setMaxValue(24))
        .setDescription("Graph command!")
        .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel]),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const hours = interaction.options.getInteger("hours") ?? 4;

        const glucoseValues = await getGlucoseValues(hours);
        const graphBuffer = await drawChart(glucoseValues, hours);

        const file = new AttachmentBuilder(graphBuffer, { name: "chart.png" });

        await interaction.editReply({
            files: [file],
        });
    },
};
