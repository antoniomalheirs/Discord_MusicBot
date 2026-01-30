const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('previous')
    .setDescription('Volta para a música anterior.'),

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
          .setDescription('Não há nenhuma música tocando no momento.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      // Kazagumo não tem suporte nativo a previous, então voltamos ao início da música atual
      player.seek(0);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Reiniciada')
        .setDescription('⏮️ A música foi reiniciada do início!');

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Previous Error:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Ocorreu um erro ao voltar a música.');
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};