const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    // DESCRIÇÃO TRADUZIDA
    .setDescription('Continua a música pausada.'),

  async execute(interaction) {
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Erro')
        .setDescription('❌ Você precisa estar em um canal de voz para continuar a música.')
        .setTimestamp();

      // Resposta de erro efêmera
      return interaction.reply({ embeds: [noChannelEmbed], flags: MessageFlags.Ephemeral });
    }

    try {
      const queue = interaction.client.playerManager.distube.getQueue(channel);

      if (!queue) {
        const noQueueEmbed = new EmbedBuilder()
          .setColor('#ff9900')
          // TÍTULO E DESCRIÇÃO TRADUZIDOS
          .setTitle('Erro')
          .setDescription('❌ Não há nenhuma música tocando para continuar.')
          .setTimestamp();
        
        // Resposta de erro efêmera
        return interaction.reply({ embeds: [noQueueEmbed], flags: MessageFlags.Ephemeral });
      }

      if (!queue.paused) {
        const alreadyPlayingEmbed = new EmbedBuilder()
          .setColor('#ff9900')
          // TÍTULO E DESCRIÇÃO TRADUZIDOS
          .setTitle('Música Já Tocando')
          .setDescription('▶️ A música já está tocando.')
          .setTimestamp();
        
        // Resposta de aviso efêmera
        return interaction.reply({ embeds: [alreadyPlayingEmbed], flags: MessageFlags.Ephemeral });
      }

      await interaction.client.playerManager.distube.resume(channel);

      const resumedEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Música Retomada')
        .setDescription('▶️ A música foi retomada.')
        .setTimestamp();
      
      // Resposta de confirmação PÚBLICA (sem a flag Ephemeral)
      await interaction.reply({ embeds: [resumedEmbed] });

    } catch (error) {
      console.error('Resume Error:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Erro')
        .setDescription('❌ Ocorreu um erro ao tentar continuar a música.')
        .setTimestamp();
      
      // Resposta de erro efêmera
      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }
  },
};