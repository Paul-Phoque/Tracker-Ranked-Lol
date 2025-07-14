const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('Compare')
        .setDescription('Compare deux joueurs')
        .addStringOption(option =>
            option.setName('Joueur1')
                .setDescription('Premier joueur')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('Joueur2')
                .setDescription('Deuxième joueur')
                .setRequired(true)),
    
    async execute(interaction, config) {
        await interaction.deferReply();
        
        const [joueur1, joueur2] = [interaction.options.getString('Joueur1'), interaction.options.getString('Joueur2')];
        
        // Logique de comparaison ici
        // (Requêtes à l'API Riot, calcul des stats comparées, etc.)
        // A venir...
        const embed = new Discord.MessageEmbed()
            .setTitle(`Comparaison ${joueur1} vs ${joueur2}`)
            // Stats comparées
            .setColor('#0099ff');
        
        await interaction.editReply({ embeds: [embed] });
    }
};