import { WebhookClient, type VoiceState } from "discord.js";

export default {
    name: "voiceStateUpdate",
    once: false,
    async execute(oldState: VoiceState, newState: VoiceState) {
        const webhook = new WebhookClient({ url: process.env.WEBHOOK_URL as string });

        const targetUserId = "372343076578131968";
        const specificUserId = "736850770955206666";

        if (!oldState.channelId && newState.channelId) {
            const joinedUserId = newState.member?.id;

            if (joinedUserId === specificUserId) {
                await webhook.send(`Specific user ${newState.member?.user.tag} joined any channel: ${newState.channel?.name}`);
            }

            const targetMember = newState.guild?.members.cache.get(targetUserId);
            if (targetMember?.voice.channelId === newState.channelId && joinedUserId !== targetUserId) {
                await webhook.send(`${newState.member?.user.tag} joined the same VC as ${targetMember.user.tag}: ${newState.channel?.name}`);
            }
        }

        if (oldState.channelId && !newState.channelId) {
            const leftUserId = oldState.member?.id;

            if (leftUserId === specificUserId) {
                await webhook.send(`Specific user ${oldState.member?.user.tag} left channel: ${oldState.channel?.name}`);
            }

            const targetMember = oldState.guild?.members.cache.get(targetUserId);
            if (targetMember?.voice.channelId === oldState.channelId && leftUserId !== targetUserId) {
                await webhook.send(`${oldState.member?.user.tag} left the same VC as ${targetMember.user.tag}: ${oldState.channel?.name}`);
            }
        }
    },
};
