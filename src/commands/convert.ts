import { SlashCommandBuilder, AttachmentBuilder, InteractionContextType, ChatInputCommandInteraction } from "discord.js";
import { drawChart } from "../canvas";
import { getGlucoseValues } from "../utils/nightscout";

export default {
    data: new SlashCommandBuilder()
        .setName("convert")
        .addIntegerOption((o) => o.setName("glucose").setDescription("Blood glucose level.").setMinValue(0).setMaxValue(999).setRequired(true))
        .addStringOption((o) => o.setName("unit").setDescription("Blood glucose unit").addChoices({ name: "mg/dL", value: "mg" }, { name: "mmol/L", value: "mmol" }))
        .setDescription("Convert blood glucose values between mmol/L and mg/dL")
        .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel]),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const glucoseValue = interaction.options.getInteger("glucose", true);
        const glucoseUnit = interaction.options.getString("unit") ?? glucoseValue > 30 ? "mg" : "mmol";

        if (glucoseUnit === "mg") {
            const mmolConverted = Math.round((glucoseValue / 18) * 10) / 10;

            await interaction.editReply(`${glucoseValue} mg/dL is ${mmolConverted} mmol/L`);
        } else {
            const mgdlConverted = Math.round(glucoseValue * 18);

            await interaction.editReply(`${glucoseValue} mmol/L is ${mgdlConverted} mg/dL`);
        }
    },
};
