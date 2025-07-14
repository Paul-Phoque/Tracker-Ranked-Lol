const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('Track')
        .setDescription('Ajouter un joueur à la liste')
        .addStringOption(option =>
            option.setName('Summoner')
                .setDescription('Nom d\'invocateur LoL')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('Region')
                .setDescription('Région')
                .setRequired(true)
                .addChoice('EUW', 'euw1')
                .addChoice('NA', 'na1')
                .addChoice('EUNE', 'eun1')
                .addChoice('KR', 'kr')),
    
    async execute(interaction, config) {
        const summonerName = interaction.options.getString('Summoner');
        const region = interaction.options.getString('Region');
        
        config.trackedPlayers[interaction.user.id] = {
            summonerName,
            region
        };
        
        // Sauvegarder dans le fichier JSON
        fs.writeFileSync('./trackedPlayers.json', JSON.stringify(config.trackedPlayers, null, 2));
        
        await interaction.reply(`✅ ${summonerName} (${region}) est ajouté à la liste`);
    }
};