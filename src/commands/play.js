require("dotenv").config();
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const ytSearch = require("yt-search");

// 1. IMPORTAR A BIBLIOTECA DO SPOTIFY
const SpotifyWebApi = require("spotify-web-api-node");

// 2. CONFIGURAR A API COM SUAS CREDENCIAIS
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Função para obter o token de acesso da API
async function refreshSpotifyToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
    console.log("Token de acesso do Spotify foi atualizado!");
  } catch (err) {
    console.error(
      "Não foi possível atualizar o token de acesso do Spotify",
      err
    );
  }
}

// Atualiza o token ao iniciar e depois a cada hora
refreshSpotifyToken();
setInterval(refreshSpotifyToken, 3600 * 1000);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Search and play a song or playlist.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("youtube")
        .setDescription("Search for and play a song.")
        .addStringOption((option) =>
          option
            .setName("name-or-clear-url")
            .setDescription("The song to search for")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("playlist")
        .setDescription("Play a playlist from YouTube.")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("The URL of the YouTube playlist")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("spotify")
        .setDescription("Pesquise e toque uma música no Spotify.")
        .addStringOption((option) =>
          option
            .setName("name-or-clear-url")
            .setDescription("A música a ser pesquisada")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const allowedChannelId = process.env.MUSIC_CHANNEL_ID;
    const allowedChannelId1 = process.env.MUSIC_CHANNEL_ID1;

    if (interaction.channel.id !== allowedChannelId && interaction.channel.id !== allowedChannelId1) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FFFF00")
            .setDescription(
              `🚫 Vá para <#${allowedChannelId}> OU <#${allowedChannelId1}> para usar o comando.`
            ),
        ],
        flags: MessageFlags.Ephemeral, // A mensagem só será visível para quem usou o comando
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const query =
      interaction.options.getString("url") ||
      interaction.options.getString("name-or-clear-url");
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FFFF00")
            .setDescription(
              "🚫 Você precisa estar em um canal de voz para tocar música."
            ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await interaction.deferReply();

      if (subcommand === "playlist") {
        await interaction.editReply({
          content: `Playlist adicionada ${query}`,
        });
        await interaction.client.playerManager.distube.play(channel, query, {
          member: interaction.member,
          textChannel: interaction.channel,
        });
      } else if (subcommand === "youtube") {
        const isYoutubeUrl = query.includes("youtube.com");

        if (isYoutubeUrl) {
          await interaction.editReply({
            content: `Música adicionada por URL ${query}`,
          });

          await interaction.client.playerManager.distube.play(channel, query, {
            member: interaction.member,
            textChannel: interaction.channel,
          });
        } else {
          const searchResult = await ytSearch(query);
          if (!searchResult || !searchResult.videos.length) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor("#FFFF00")
                  .setDescription("🚫 No songs found for your query."),
              ],
            });
          }

          const videos = searchResult.videos.slice(0, 5);

          const embed = new EmbedBuilder()
            .setTitle("Search Results")
            .setDescription("Select a song to play:")
            .setColor("#ff0000")
            .setTimestamp();

          videos.forEach((video, index) => {
            embed.addFields({
              name: `${index + 1}. ${video.title}`,
              value: `Duration: ${video.timestamp} | ${video.author.name}`,
              inline: false,
            });
          });

          const row1 = new ActionRowBuilder();

          videos.forEach((video, index) => {
            row1.addComponents(
              new ButtonBuilder()
                .setCustomId(`play_${index}`)
                .setLabel(`${index + 1}`)
                .setStyle(ButtonStyle.Primary)
            );
          });

          const sentMessage = await interaction.editReply({
            embeds: [embed],
            components: [row1],
          });

          const filter = (i) =>
            i.customId.startsWith("play_") && i.user.id === interaction.user.id;
          const collector = interaction.channel.createMessageComponentCollector(
            { filter, time: 15000 }
          );

          collector.on("collect", async (i) => {
            try {
              collector.stop();

              const disabledRow = new ActionRowBuilder().addComponents(
                row1.components.map((button) =>
                  ButtonBuilder.from(button).setDisabled(true)
                )
              );

              await i.update({ components: [disabledRow] });

              const [action, index] = i.customId.split("_");
              const selectedVideo = videos[parseInt(index)];

              if (selectedVideo) {
                await interaction.followUp({
                  embeds: [
                    new EmbedBuilder()
                      .setColor("#FF00FF")
                      .setDescription(
                        `🎶 Queuing: **${selectedVideo.title}**...`
                      ),
                  ],
                });

                await interaction.client.playerManager.distube.play(
                  channel,
                  selectedVideo.url,
                  {
                    member: interaction.member,
                    textChannel: interaction.channel,
                  }
                );
              } else {
                await interaction.followUp({
                  embeds: [
                    new EmbedBuilder()
                      .setColor("#FFFF00")
                      .setDescription(
                        "🚫 The selected song could not be found."
                      ),
                  ],
                });
              }
            } catch (error) {
              console.error("Play Error:", error);
              await interaction.followUp({
                embeds: [
                  new EmbedBuilder()
                    .setColor("#FFFF00")
                    .setDescription(
                      "🚫 An error occurred while trying to play the song."
                    ),
                ],
              });
            }
          });

          collector.on("end", async (collected) => {
            if (!collected.size) {
              const timeoutRow = new ActionRowBuilder().addComponents(
                row1.components.map((button) =>
                  ButtonBuilder.from(button).setDisabled(true)
                )
              );

              await sentMessage.edit({
                embeds: [embed],
                components: [timeoutRow],
              });

              await interaction.followUp({
                embeds: [
                  new EmbedBuilder()
                    .setColor("#FFFFFF")
                    .setDescription("⚠️ You didn't select any song in time."),
                ],
              });
            }
          });
        }
      } else if (subcommand === "spotify") {
        const isSpotifyUrl = query.includes("open.spotify.com");
        if (isSpotifyUrl) {
          await interaction.editReply({
            content: `Música adicionada por URL ${query}`,
          });

          await interaction.client.playerManager.distube.play(channel, query, {
            member: interaction.member,
            textChannel: interaction.channel,
          });
        } else {
          const searchResult = await spotifyApi.searchTracks(query, {
            limit: 5,
          });

          if (
            !searchResult.body.tracks ||
            searchResult.body.tracks.items.length === 0
          ) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor("#ff0000")
                  .setDescription(
                    "🚫 Nenhuma música encontrada no Spotify com essa pesquisa.".setTimestamp()
                  ),
              ],
            });
          }

          const tracks = searchResult.body.tracks.items;

          const embed = new EmbedBuilder()
            .setTitle("Resultados da Pesquisa no Spotify")
            .setDescription("Selecione uma música para tocar:")
            .setColor("#1DB954")
            .setTimestamp();

          tracks.forEach((track, index) => {
            const artists = track.artists
              .map((artist) => artist.name)
              .join(", ");
            embed.addFields({
              name: `${index + 1}. ${track.name}`,
              value: `Artista(s): ${artists} | Álbum: ${track.album.name}`,
              inline: false,
            });
          });

          const row = new ActionRowBuilder();
          tracks.forEach((track, index) => {
            row.addComponents(
              new ButtonBuilder()
                .setCustomId(`spotify_${index}`)
                .setLabel(`${index + 1}`)
                .setStyle(ButtonStyle.Primary)
            );
          });

          await interaction.editReply({ embeds: [embed], components: [row] });

          const filter = (i) =>
            i.customId.startsWith("spotify_") &&
            i.user.id === interaction.user.id;
          const collector = interaction.channel.createMessageComponentCollector(
            { filter, time: 15000 }
          );

          collector.on("collect", async (i) => {
            collector.stop();

            const disabledRow = ActionRowBuilder.from(row).setComponents(
              row.components.map((button) =>
                ButtonBuilder.from(button).setDisabled(true)
              )
            );
            await i.update({ components: [disabledRow] });

            const index = parseInt(i.customId.split("_")[1]);
            const selectedTrack = tracks[index];

            const selectedTrackUrl = selectedTrack.external_urls.spotify;
            const artists = selectedTrack.artists
              .map((artist) => artist.name)
              .join(", ");

            await interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setColor("#1DB954")
                  .setDescription(
                    `🎶 Adicionando à fila: **${selectedTrack.name} por ${artists}**...`
                  ),
              ],
            });

            await interaction.client.playerManager.distube.play(
              channel,
              selectedTrackUrl,
              {
                member: interaction.member,
                textChannel: interaction.channel,
              }
            );
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FFFF00")
              .setDescription(
                "🚫 An error occurred while processing your request."
              ),
          ],
        flags: MessageFlags.Ephemeral 
        });
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FFFF00")
              .setDescription(
                "🚫 An error occurred while processing your request."
              ),
          ],
        });
      }
    }
  },
};
