const { SlashCommandBuilder } = require('@discordjs/builders');
const { makeRequest } = require('../utils/apiLimiter');

// A revoir
/* const response = await makeRequest(() => 
    axios.get(url, { headers })
);
const axios = require('axios'); */

module.exports = {
    data: new SlashCommandBuilder()
        .setName('Stats')
        .setDescription('Affiche les stats d\'un joueur')
        .addStringOption(option =>
            option.setName('Summoner')
                .setDescription('Nom d\'invocateur')
                .setRequired(true)),
    
    async execute(interaction, config) {
        await interaction.deferReply();
        
        const summonerName = interaction.options.getString('Summoner');
        const player = Object.values(config.trackedPlayers).find(p => p.summonerName === summonerName);
        
        if (!player) {
            return await interaction.editReply('Joueur non trouvé dans la liste');
        }
        
        try {
            // Récupérer les infos du summoner
            const summonerResponse = await axios.get(
                `https://${player.region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
                { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
            );
            
            // Récupérer les stats ranked
            const rankedResponse = await axios.get(
                `https://${player.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerResponse.data.id}`,
                { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
            );
            
            // Formater les stats
            const embed = new Discord.MessageEmbed()
                .setTitle(`Stats de ${summonerName}`)
                .setColor('#0099ff');
            
            rankedResponse.data.forEach(queue => {
                embed.addField(
                    `${queue.queueType === 'RANKED_SOLO' ? 'Solo/Duo' : 'Flex'}`,
                    `${queue.tier} ${queue.rank} - ${queue.leaguePoints} LP\n` +
                    `W: ${queue.wins} / L: ${queue.losses} (${Math.round((queue.wins / (queue.wins + queue.losses)) * 100)}%)`
                );
            });
            
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply('Erreur lors de la récupération des stats');
        }
    }
};