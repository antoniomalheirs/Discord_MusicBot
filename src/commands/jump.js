const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('Pula para uma música específica na fila.')
    .addIntegerOption(option =>
      option.setName('posicao')
        .setDescription('Posição da música na fila (1, 2, 3...)')
        .setRequired(true)),

  async execute(interaction) {
    const position = interaction.options.getInteger('posicao');
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Você precisa estar em um canal de voz.');
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    try {
      const player = interaction.client.playerManager.getPlayer(interaction.guild.id);

      if (!player || player.queue.size === 0) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('Fila Vazia')
          .setDescription('Não há músicas na fila para pular.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      if (position < 1 || position > player.queue.size) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('Posição Inválida')
          .setDescription(`A posição deve ser entre 1 e ${player.queue.size}.`);
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      // Remove as músicas anteriores à posição desejada
      for (let i = 0; i < position - 1; i++) {
        player.queue.shift();
      }

      player.skip();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Pulando')
        .setDescription(`⏭️ Pulando para a posição **${position}** na fila!`);

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Jump Error:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Ocorreu um erro ao pular para a posição.');
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};