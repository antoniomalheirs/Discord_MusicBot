const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausa a reprodução da música atual.'),

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

      if (!player || !player.playing) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('Sem Música')
          .setDescription('Não há nenhuma música tocando no momento.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      if (player.paused) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('Já Pausado')
          .setDescription('A música já está pausada.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      player.pause(true);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Música Pausada')
        .setDescription('⏸️ A música foi pausada com sucesso!');

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Pause Error:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Ocorreu um erro ao pausar a música.');
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};