const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');
const { DisTubeError } = require('distube');

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
      const queue = interaction.client.playerManager.distube.getQueue(channel);

      if (!queue || !queue.songs.length) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Fila Inexistente')
          .setDescription('Não há nenhuma música tocando ou a fila está vazia.');
        
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      await interaction.client.playerManager.distube.stop(channel);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Música Parada')
        .setDescription('🛑 A música foi parada e a fila foi limpa.');

      // MENSAGEM DE CONFIRMAÇÃO PÚBLICA (SEM flags)
      // CÓDIGO CORRIGIDO - a linha abaixo foi separada do comentário
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Stop Error:', error);

      let embed;

      if (error instanceof DisTubeError) {
        if (error.errorCode === 'NO_QUEUE') {
          embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Fila Inexistente')
            .setDescription('Não existe uma fila para parar.');
        } else {
          embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Erro')
            .setDescription('Ocorreu um erro ao tentar parar a música.');
        }
      } else {
        embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Erro')
          .setDescription('Ocorreu um erro ao tentar parar a música.');
      }
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
    }
  },
};