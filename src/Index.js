// index.js
require('dotenv').config();
const Discord = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Discord.Collection();

// Chargement des commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// Configuration
const config = {
    trackedPlayers: require('./trackedPlayers.json'),
    notificationChannel: null,
    lastKnownMatches: {}
};

// Vérification des matchs
async function checkMatches() {
    const embed = new Discord.MessageEmbed()
        .setTitle(`Résultat de partie - ${participant.championId}`)
        .setDescription(`${win ? 'Victoire 🏆' : 'Défaite 💀'}`)
        .addField('KDA', `${participant.stats.kills}/${participant.stats.deaths}/${participant.stats.assists}`)
        .addField('Farm', participant.stats.totalMinionsKilled)
        .setColor(win ? '#00ff00' : '#ff0000')
        .setTimestamp();

    config.notificationChannel.send({ 
        content: `🎮 <@${discordId}> a ${win ? 'gagné' : 'perdu'} sa partie`,
        embeds: [embed] 
    });

    // A garder ? 
    /* if (!config.notificationChannel) return;

    for (const [discordId, playerInfo] of Object.entries(config.trackedPlayers)) {
    } */
}

client.on('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
    // Vérifier les parties toutes les minutes
    setInterval(checkMatches, 60000);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, config);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Erreur lors de l\'exécution de cette commande', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);