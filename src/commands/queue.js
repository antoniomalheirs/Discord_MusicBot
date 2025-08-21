const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  MessageFlags, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ComponentType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    // DESCRIÇÃO TRADUZIDA
    .setDescription('Mostra a fila de músicas atual.'),

  async execute(interaction) {
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Erro')
        .setDescription('❌ Você precisa estar em um canal de voz para ver a fila.')
        .setTimestamp();

      return interaction.reply({ embeds: [noChannelEmbed], flags: MessageFlags.Ephemeral });
    }

    try {
      const queue = interaction.client.playerManager.distube.getQueue(channel);

      if (!queue || !queue.songs.length) {
        const emptyQueueEmbed = new EmbedBuilder()
          .setColor('#ff9900')
          // TÍTULO E DESCRIÇÃO TRADUZIDOS
          .setTitle('Fila')
          .setDescription('A fila está vazia no momento.')
          .setTimestamp();

        return interaction.reply({ embeds: [emptyQueueEmbed], flags: MessageFlags.Ephemeral});
      }

      const songs = queue.songs;
      const songsPerPage = 10;
      const totalPages = Math.ceil(songs.length / songsPerPage);

      const generateEmbed = (page) => {
        const start = page * songsPerPage;
        const end = start + songsPerPage;
        const currentSongs = songs.slice(start, end);

        const songList = currentSongs.map((song, index) => {
            const globalIndex = start + index;
            const isCurrent = globalIndex === 0;
            return `${isCurrent ? '**▶️**' : ''} **${globalIndex + 1}.** [${song.name}](${song.url}) - \`${song.formattedDuration}\`${isCurrent ? ' **(Tocando Agora)**' : ''}`;
        }).join('\n');

        return new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`🎵 Fila Atual - ${songs.length} músicas`)
            .setDescription(songList)
            .setFooter({ text: `Página ${page + 1} de ${totalPages} | Duração Total: ${queue.formattedDuration}` })
            .setTimestamp();
      };
      
      // Se a fila for pequena, apenas envia um embed sem botões
      if (totalPages <= 1) {
        const embed = generateEmbed(0);
        return interaction.reply({ embeds: [embed] });
      }

      // Se a fila for grande, cria os botões
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('prev_page')
            .setLabel('◀️ Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true), // Começa desabilitado
          new ButtonBuilder()
            .setCustomId('next_page')
            .setLabel('Próximo ▶️')
            .setStyle(ButtonStyle.Primary)
        );
      
      const initialEmbed = generateEmbed(0);
      const response = await interaction.reply({ 
        embeds: [initialEmbed], 
        components: [row] 
      });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000 // 1 minuto
      });

      let currentPage = 0;

      collector.on('collect', async (i) => {
        // Apenas o usuário que iniciou o comando pode usar os botões
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: 'Você não pode usar estes botões!', flags: MessageFlags.Ephemeral});
        }

        if (i.customId === 'prev_page') {
          currentPage--;
        } else if (i.customId === 'next_page') {
          currentPage++;
        }

        row.components[0].setDisabled(currentPage === 0); // Desabilita o botão 'anterior' na primeira página
        row.components[1].setDisabled(currentPage === totalPages - 1); // Desabilita o botão 'próximo' na última página

        const newEmbed = generateEmbed(currentPage);
        await i.update({ embeds: [newEmbed], components: [row] });
      });

      collector.on('end', async () => {
        // Desabilita os botões quando o tempo acabar
        const disabledRow = new ActionRowBuilder()
          .addComponents(
            row.components[0].setDisabled(true),
            row.components[1].setDisabled(true)
          );
        await response.edit({ components: [disabledRow] });
      });

    } catch (error) {
      console.error('Get Queue Error:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Erro')
        .setDescription('❌ Ocorreu um erro ao buscar a fila.')
        .setTimestamp();

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
      } else {
        await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
      }
    }
  },
};