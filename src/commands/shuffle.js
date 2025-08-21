const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('shuffle')
      // DESCRIÇÃO TRADUZIDA
      .setDescription('Embaralha as músicas na fila.'),
  
    async execute(interaction) {
      const channel = interaction.member.voice.channel;
  
      if (!channel) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          // TÍTULO E DESCRIÇÃO TRADUZIDOS
          .setTitle('Erro')
          .setDescription('Você precisa estar em um canal de voz para embaralhar a fila.');
        
        // Resposta de erro efêmera  
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
  
      try {
        const queue = interaction.client.playerManager.distube.getQueue(channel);

        // Verificação adicional: não há fila ou não há músicas suficientes para embaralhar
        if (!queue || queue.songs.length < 2) {
            const embed = new EmbedBuilder()
                .setColor('#FF9900')
                // TÍTULO E DESCRIÇÃO TRADUZIDOS
                .setTitle('Fila Insuficiente')
                .setDescription('Não há músicas suficientes na fila para embaralhar.');

            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        await interaction.client.playerManager.distube.shuffle(channel);
  
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          // TÍTULO E DESCRIÇÃO TRADUZIDOS
          .setTitle('Fila Embaralhada')
          .setDescription('🔀 A fila foi embaralhada com sucesso.');
        
        // Resposta de confirmação PÚBLICA
        await interaction.reply({ embeds: [embed] });

      } catch (error) {
        console.error('Shuffle Error:', error);
  
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          // TÍTULO E DESCRIÇÃO TRADUZIDOS
          .setTitle('Erro')
          .setDescription('Ocorreu um erro ao tentar embaralhar a fila.');
        
        // Resposta de erro efêmera
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
    },
  };