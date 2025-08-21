const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jump')
    // DESCRIÇÃO TRADUZIDA
    .setDescription('Pula para uma música específica na fila.')
    .addIntegerOption(option =>
      option.setName('position')
        // DESCRIÇÃO DA OPÇÃO TRADUZIDA
        .setDescription('A posição da música na fila.')
        .setRequired(true)),

  async execute(interaction) {
    const position = interaction.options.getInteger('position');
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Erro')
        .setDescription('❌ Você precisa estar em um canal de voz para pular para uma música.')
        .setTimestamp();

      return interaction.reply({ embeds: [noChannelEmbed], flags: MessageFlags.Ephemeral });
    }

    try {
      const queue = interaction.client.playerManager.distube.getQueue(channel);

      // VERIFICAÇÃO 1: Existe uma fila?
      if (!queue) {
          const noQueueEmbed = new EmbedBuilder()
              .setColor('#ff9900')
              .setTitle('Fila Inexistente')
              .setDescription('Não há nenhuma música tocando no momento.');

          return interaction.reply({ embeds: [noQueueEmbed], flags: MessageFlags.Ephemeral });
      }

      // VERIFICAÇÃO 2: A posição é válida?
      if (position <= 0 || position > queue.songs.length) {
          const invalidPositionEmbed = new EmbedBuilder()
              .setColor('#ff9900')
              .setTitle('Posição Inválida')
              .setDescription(`❌ Por favor, insira um número entre 1 e ${queue.songs.length}.`);

          return interaction.reply({ embeds: [invalidPositionEmbed], flags: MessageFlags.Ephemeral });
      }

      // DisTube espera um índice baseado em 0, então subtraímos 1
      await interaction.client.playerManager.distube.jump(channel, position - 1);

      const successEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Música Pulada')
        .setDescription(`🔀 Pulou com sucesso para a música **#${position}** na fila.`)
        .setTimestamp();

      // Confirmação pública
      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Jump Error:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Erro')
        .setDescription('❌ Ocorreu um erro ao tentar pular para essa música.')
        .setTimestamp();
      
      // Erro efêmero
      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }
  },
};