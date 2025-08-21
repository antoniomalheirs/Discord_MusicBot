const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { distubeOptions } = require('./config/config.js');
const fs = require('fs');
const path = require('path');
const PlayerManager = require('./player/PlayerManager.js');

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildMessages
];

const client = new Client({ intents });
client.commands = new Collection();
client.playerManager = new PlayerManager(client, distubeOptions);
client.playerManager.distube.setMaxListeners(20);

// Corrected path for commands
const commandsPath = path.join(__dirname, './commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// Corrected path for events
const eventsPath = path.join(__dirname, './events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.DISCORD_TOKEN);