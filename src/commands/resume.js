const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Retoma a reprodução da música pausada.'),

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

      if (!player) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('Sem Música')
          .setDescription('Não há nenhuma música pausada no momento.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      if (!player.paused) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('Não Pausado')
          .setDescription('A música não está pausada.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      player.pause(false);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Reprodução Retomada')
        .setDescription('▶️ A música foi retomada com sucesso!');

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Resume Error:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Ocorreu um erro ao retomar a música.');
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};