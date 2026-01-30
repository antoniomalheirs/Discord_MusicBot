const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Embaralha a fila de reprodução.'),

  async execute(interaction) {
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

      if (!player || player.queue.size < 2) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('Fila Pequena')
          .setDescription('Não há músicas suficientes na fila para embaralhar.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      player.queue.shuffle();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Fila Embaralhada')
        .setDescription('🔀 A fila foi embaralhada com sucesso!');

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Shuffle Error:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Ocorreu um erro ao embaralhar a fila.');
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};