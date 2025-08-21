const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('previous')
      // DESCRIÇÃO TRADUZIDA
      .setDescription('Toca a música anterior da fila.'),
  
    async execute(interaction) {
      const channel = interaction.member.voice.channel;
  
      if (!channel) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          // TÍTULO E DESCRIÇÃO TRADUZIDOS
          .setTitle('Erro')
          .setDescription('Você precisa estar em um canal de voz para tocar a música anterior.');
        
        // Erro efêmero
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
  
      try {
        const queue = interaction.client.playerManager.distube.getQueue(channel);

        // Verifica se existe uma fila
        if (!queue) {
            const embed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('Fila Inexistente')
                .setDescription('Não há nenhuma música tocando no momento.');

            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        // Verifica se há uma música anterior para tocar
        if (queue.previousSongs.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('Sem Música Anterior')
                .setDescription('Não há uma música anterior no histórico da fila.');
                
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
        
        await interaction.client.playerManager.distube.previous(channel);
  
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          // TÍTULO E DESCRIÇÃO TRADUZIDOS
          .setTitle('Música Anterior')
          .setDescription('⏮️ Tocando a música anterior.');
        
        // Confirmação pública
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral});

      } catch (error) {
        console.error('Previous Song Error:', error);
  
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          // TÍTULO E DESCRIÇÃO TRADUZIDOS
          .setTitle('Erro')
          .setDescription('Ocorreu um erro ao tentar tocar a música anterior.');
        
        // Erro efêmero
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
    },
  };