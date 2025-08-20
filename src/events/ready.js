// src/events/ready.js
const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ ${client.user.tag} Online/Operando & Pronto para tocar!`);
  },
};