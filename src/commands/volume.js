const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { DisTubeError } = require('distube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    // DESCRIÇÃO TRADUZIDA
    .setDescription('Define o volume da reprodução de música.')
    .addIntegerOption(option =>
      option.setName('volume')
        // DESCRIÇÃO DA OPÇÃO TRADUZIDA
        .setDescription('Nível do volume (0-100).')
        .setRequired(true)),

  async execute(interaction) {
    const volume = interaction.options.getInteger('volume');
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Erro')
        .setDescription('Você precisa estar em um canal de voz para definir o volume.');
      
      // Resposta de erro efêmera
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // A verificação de volume deve ser efêmera
    if (volume < 0 || volume > 100) {
      const embed = new EmbedBuilder()
        .setColor('#FF9900')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Volume Inválido')
        .setDescription('O nível do volume deve ser um número entre 0 e 100.');
      
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    try {
      // É preciso verificar se a fila existe antes de tentar alterar o volume
      const queue = interaction.client.playerManager.distube.getQueue(channel);
      if (!queue) {
          const embed = new EmbedBuilder()
              .setColor('#FF9900')
              .setTitle('Fila Inexistente')
              .setDescription('Não há nenhuma música tocando no momento para ajustar o volume.');

          return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      await interaction.client.playerManager.distube.setVolume(channel, volume);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Volume Definido')
        .setDescription(`🔊 Volume alterado para **${volume}%**.`);
      
      // Resposta de confirmação PÚBLICA
      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Set Volume Error:', error);

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        // TÍTULO E DESCRIÇÃO TRADUZIDOS
        .setTitle('Erro')
        .setDescription('Ocorreu um erro ao tentar definir o volume.');
      
      // Resposta de erro efêmera
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};