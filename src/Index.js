// index.js
require('dotenv').config();
const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client();

// Liste des utilisateurs à tracker (Discord ID : Riot ID)
const trackedPlayers = {
    'DISCORD_USER_ID_1': { 
        summonerName: 'NomInvocateur1', 
        region: 'euw1' 
    },
    'DISCORD_USER_ID_2': { 
        summonerName: 'NomInvocateur2', 
        region: 'na1' 
    }
};

// Dictionnaire pour stocker le dernier match connu
let lastKnownMatches = {};

client.on('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
    
    // Vérifier les parties toutes les minutes
    setInterval(checkMatches, 60000);
});

async function checkMatches() {
    for (const [discordId, playerInfo] of Object.entries(trackedPlayers)) {
        try {
            // Récupérer l'ID du summoner
            const summonerResponse = await axios.get(
                `https://${playerInfo.region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(playerInfo.summonerName)}`,
                { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
            );
            
            const summonerId = summonerResponse.data.id;
            
            // Récupérer les matchs récents
            const matchesResponse = await axios.get(
                `https://${playerInfo.region}.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerResponse.data.accountId}`,
                { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
            );
            
            const latestMatchId = matchesResponse.data.matches[0].gameId;
            
            // Si c'est un nouveau match
            if (!lastKnownMatches[discordId] || lastKnownMatches[discordId] !== latestMatchId) {
                lastKnownMatches[discordId] = latestMatchId;
                
                // Récupérer les détails du match
                const matchDetails = await axios.get(
                    `https://${playerInfo.region}.api.riotgames.com/lol/match/v4/matches/${latestMatchId}`,
                    { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
                );
                
                // Trouver le joueur dans la liste des participants
                const participant = matchDetails.data.participants.find(
                    p => p.summonerName === playerInfo.summonerName
                );
                
                if (participant) {
                    const win = participant.stats.win;
                    const user = await client.users.fetch(discordId);
                    const channel = user.dmChannel || await user.createDM();
                    
                    channel.send(`🎮 Résultat de ta dernière partie de LoL: ${win ? 'Victoire 🏆' : 'Défaite 💀'}`);
                }
            }
        } catch (error) {
            console.error(`Erreur lors du tracking pour ${playerInfo.summonerName}:`, error.message);
        }
    }
}

client.login(process.env.DISCORD_TOKEN);