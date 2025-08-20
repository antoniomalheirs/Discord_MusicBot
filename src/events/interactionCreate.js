// src/events/interactionCreate.js
const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) { // O client é passado como argumento extra
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Comando não encontrado: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Erro ao executar ${interaction.commandName}`);
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
      }
    }
  },
};