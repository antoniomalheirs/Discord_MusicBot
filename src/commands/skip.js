const { SlashCommandBuilder } = require('@discordjs/builders');
const { 
  EmbedBuilder,
  MessageFlags,
 } = require('discord.js');
const { DisTubeError } = require('distube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pula a música atual.'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // Previne expiração e torna erros efêmeros por padrão

    const channel = interaction.member.voice.channel;

    if (!channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('🚫 Você precisa estar em um canal de voz para pular a música.');
      
      return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral, });
    }

    try {
      const queue = interaction.client.playerManager.distube.getQueue(channel);

      if (!queue || !queue.songs.length) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Sem músicas')
          .setDescription('🚫 Não há nenhuma música tocando na fila no momento.');
        
        return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral, });
      }

      await interaction.client.playerManager.distube.skip(channel);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Música pulada')
        .setDescription('⏭ A música atual foi pulada com sucesso!');

      // Sucesso → mensagem pública
      return interaction.followUp({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao pular música:', error);

      let embed;

      if (error instanceof DisTubeError) {
        if (error.errorCode === 'NO_QUEUE') {
          embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Sem fila')
            .setDescription('🚫 Não existe nenhuma fila para pular.');
        } else if (error.errorCode === 'NO_UP_NEXT') {
          embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Nada na Fila')
            .setDescription('🚫 Não há nenhuma música para pular em seguida.');
        } else {
          embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Erro')
            .setDescription('🚫 Ocorreu um erro ao tentar pular a música.');
        }
      } else {
        embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Erro')
          .setDescription('🚫 Ocorreu um erro ao tentar pular a música.');
      }

      return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral, });
    }
  },
};
