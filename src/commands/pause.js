const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    // DESCRIÇÃO TRADUZIDA
    .setDescription('Pausa a música atual.'),

  async execute(interaction) {
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Erro')
        .setDescription('❌ Você precisa estar em um canal de voz para pausar a música.')
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
          .setDescription('❌ Não há nenhuma música tocando no momento.')
          .setTimestamp();
        
        // Resposta de erro efêmera
        return interaction.reply({ embeds: [noQueueEmbed], flags: MessageFlags.Ephemeral });
      }

      if (queue.paused) {
        const alreadyPausedEmbed = new EmbedBuilder()
          .setColor('#ff9900')
          // TÍTULO E DESCRIÇÃO TRADUZIDOS
          .setTitle('Música Já Pausada')
          .setDescription('⏸️ A música já está pausada.')
          .setTimestamp();
        
        // Resposta de aviso efêmera
        return interaction.reply({ embeds: [alreadyPausedEmbed], flags: MessageFlags.Ephemeral });
      }

      await interaction.client.playerManager.distube.pause(channel);

      const pausedEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Música Pausada')
        .setDescription('⏸️ A música atual foi pausada.')
        .setTimestamp();
      
      // Resposta de confirmação PÚBLICA (sem a flag Ephemeral)
      await interaction.reply({ embeds: [pausedEmbed] });

    } catch (error) {
      console.error('Pause Error:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Erro')
        .setDescription('❌ Ocorreu um erro ao tentar pausar a música.')
        .setTimestamp();

      // Resposta de erro efêmera
      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }
  },
};