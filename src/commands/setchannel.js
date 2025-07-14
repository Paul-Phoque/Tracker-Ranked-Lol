const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Définit le channel pour les notifications')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel pour les notifications')
                .setRequired(true)),
    
    async execute(interaction, config) {
        const channel = interaction.options.getChannel('channel');
        config.notificationChannel = channel;
        await interaction.reply(`✅ Les notifications seront envoyées dans ${channel}`);
    }
};