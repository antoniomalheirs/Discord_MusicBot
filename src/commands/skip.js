const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');
const { DisTubeError } = require('distube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pula a música atual.'),

  async execute(interaction) {
    // Usar deferReply sem ephemeral para a resposta de sucesso ser pública
    await interaction.deferReply(); 

    const channel = interaction.member.voice.channel;

    if (!channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Erro')
        .setDescription('🚫 Você precisa estar em um canal de voz para pular a música.');
      
      // Erros devem ser efêmeros
      return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    try {
      const queue = interaction.client.playerManager.distube.getQueue(channel);

      if (!queue || !queue.songs.length) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Sem músicas')
          .setDescription('🚫 Não há nenhuma música tocando na fila no momento.');
        
        return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      // --- LÓGICA DE CORREÇÃO ADICIONADA AQUI ---
      // Verifica se há apenas uma música na fila
      if (queue.songs.length === 1) {
        // Se for a última música, parar o player em vez de pular
        await interaction.client.playerManager.distube.stop(channel);
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Fila finalizada')
          .setDescription('⏭️ A última música foi pulada e a fila terminou.');

        // Mensagem de sucesso pública
        return interaction.editReply({ embeds: [embed] });
      }
      
      // Se houver mais de uma música, apenas pula
      await interaction.client.playerManager.distube.skip(channel);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Música pulada')
        .setDescription('⏭️ A música atual foi pulada com sucesso!');

      // Mensagem de sucesso pública
      return interaction.editReply({ embeds: [embed] });

    } catch (error) {
      // O erro 'NO_UP_NEXT' não deve mais ocorrer com a lógica acima,
      // mas mantemos o tratamento por segurança.
      console.error('Erro ao pular música:', error);

      let embed;

      if (error instanceof DisTubeError && error.errorCode === 'NO_QUEUE') {
          embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Sem fila')
            .setDescription('🚫 Não existe nenhuma fila para pular.');
      } else {
        embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Erro')
          .setDescription('🚫 Ocorreu um erro inesperado ao tentar pular a música.');
      }

      // Responde ao erro de forma efêmera
      // Usamos editReply porque o deferReply já foi chamado
      return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};