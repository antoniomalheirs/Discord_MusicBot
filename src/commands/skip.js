const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pula a música atual.'),

  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.member.voice.channel;

    if (!channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('🚫 Você precisa estar em um canal de voz para pular a música.');

      return interaction.editReply({ embeds: [embed] });
    }

    try {
      const player = interaction.client.playerManager.getPlayer(interaction.guild.id);

      if (!player || !player.queue.current) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Sem músicas')
          .setDescription('🚫 Não há nenhuma música tocando na fila no momento.');

        return interaction.editReply({ embeds: [embed] });
      }

      // Se for a última música na fila
      if (player.queue.size === 0) {
        await interaction.client.playerManager.stop(interaction.guild.id);
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Fila finalizada')
          .setDescription('⏭️ A última música foi pulada e a fila terminou.');

        return interaction.editReply({ embeds: [embed] });
      }

      // Se houver mais músicas, pula
      await interaction.client.playerManager.skip(interaction.guild.id);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Música pulada')
        .setDescription('⏭️ A música atual foi pulada com sucesso!');

      return interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao pular música:', error);

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('🚫 Ocorreu um erro inesperado ao tentar pular a música.');

      return interaction.editReply({ embeds: [embed] });
    }
  },
};