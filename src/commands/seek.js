const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Pula para uma posição específica na música.')
    .addIntegerOption(option =>
      option.setName('segundos')
        .setDescription('Posição em segundos')
        .setRequired(true)),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('segundos');
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

      if (!player || !player.queue.current) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('Sem Música')
          .setDescription('Não há nenhuma música tocando no momento.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      player.seek(seconds * 1000); // Kazagumo usa milissegundos

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Posição Alterada')
        .setDescription(`⏩ Pulando para **${seconds}** segundos.`);

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Seek Error:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Ocorreu um erro ao pular para a posição.');
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};
