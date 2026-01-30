const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Para a música e limpa toda a fila.'),

  async execute(interaction) {
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Você precisa estar em um canal de voz para parar a música.');

      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    try {
      const player = interaction.client.playerManager.getPlayer(interaction.guild.id);

      if (!player) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Fila Inexistente')
          .setDescription('Não há nenhuma música tocando ou a fila está vazia.');

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      await interaction.client.playerManager.stop(interaction.guild.id);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Música Parada')
        .setDescription('🛑 A música foi parada e a fila foi limpa.');

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Stop Error:', error);

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Ocorreu um erro ao tentar parar a música.');

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
    }
  },
};