// deploy-commands.js

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, './src/commands/');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const clientId = process.env.CLIENT_ID; 
const guildId = '1188000462000107621'; 
const token = process.env.DISCORD_TOKEN;

for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Iniciando o registro dos comandos de barra (/).');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('Comandos de barra (/) registrados com sucesso.');
        return exit(0);
    } catch (error) {
        console.error(error);
    }
})();