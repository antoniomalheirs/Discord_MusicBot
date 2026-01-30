const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Define o volume da reprodução de música.')
    .addIntegerOption(option =>
      option.setName('volume')
        .setDescription('Nível do volume (0-100).')
        .setRequired(true)),

  async execute(interaction) {
    const volume = interaction.options.getInteger('volume');
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Você precisa estar em um canal de voz para definir o volume.');

      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    if (volume < 0 || volume > 100) {
      const embed = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('Volume Inválido')
        .setDescription('O nível do volume deve ser um número entre 0 e 100.');

      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    try {
      const player = interaction.client.playerManager.getPlayer(interaction.guild.id);

      if (!player) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('Fila Inexistente')
          .setDescription('Não há nenhuma música tocando no momento para ajustar o volume.');

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      player.setVolume(volume);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Volume Definido')
        .setDescription(`🔊 Volume alterado para **${volume}%**.`);

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Set Volume Error:', error);

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Ocorreu um erro ao tentar definir o volume.');

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};