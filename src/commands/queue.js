const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Mostra a fila de reprodução.'),

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

      if (!player || !player.queue.current) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('Fila Vazia')
          .setDescription('Não há nenhuma música na fila.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      const current = player.queue.current;
      const queue = player.queue;

      let queueString = `**Tocando agora:** [${current.title}](${current.uri})\n\n`;

      if (queue.size > 0) {
        queueString += '**Próximas músicas:**\n';
        const tracks = [...queue].slice(0, 10);
        tracks.forEach((track, index) => {
          queueString += `${index + 1}. [${track.title}](${track.uri})\n`;
        });

        if (queue.size > 10) {
          queueString += `\n... e mais ${queue.size - 10} músicas`;
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🎵 Fila de Reprodução')
        .setDescription(queueString);

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Queue Error:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('Ocorreu um erro ao mostrar a fila.');
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};