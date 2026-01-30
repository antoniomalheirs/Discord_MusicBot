const { Kazagumo, Plugins } = require("kazagumo");
const { Connectors } = require("shoukaku");
const { EmbedBuilder } = require("discord.js");
const SpotifyWebApi = require("spotify-web-api-node");
const ytSearch = require("yt-search");
require("dotenv").config();

class PlayerManager {
  constructor(client) {
    this.client = client;
    this.messageDeleteTimeout = 50000;

    // Configuração do Spotify API para buscar tracks
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    // Nodes do Lavalink
    const Nodes = [
      {
        name: "Lavalink",
        url: `${process.env.LAVALINK_HOST || "lavalink"}:${process.env.LAVALINK_PORT || 2333}`,
        auth: process.env.LAVALINK_PASSWORD || "youshallnotpass",
        secure: false,
      },
    ];

    // Inicializa Kazagumo (wrapper do Shoukaku)
    this.kazagumo = new Kazagumo(
      {
        defaultSearchEngine: "youtube",
        plugins: [new Plugins.PlayerMoved(client)],
        send: (guildId, payload) => {
          const guild = client.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
      },
      new Connectors.DiscordJS(client),
      Nodes
    );

    this.initialize();
    this.refreshSpotifyToken();
  }

  async refreshSpotifyToken() {
    try {
      const data = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(data.body["access_token"]);
      console.log("✅ Token de acesso do Spotify atualizado!");
      // Renovar token a cada 50 minutos
      setTimeout(() => this.refreshSpotifyToken(), 50 * 60 * 1000);
    } catch (error) {
      console.error("Erro ao atualizar token do Spotify:", error);
    }
  }

  initialize() {
    this.kazagumo.shoukaku.on("ready", (name) => {
      console.log(`✅ Lavalink node "${name}" está pronto!`);
    });

    this.kazagumo.shoukaku.on("error", (name, error) => {
      console.error(`❌ Erro no node "${name}":`, error);
    });

    this.kazagumo.shoukaku.on("close", (name, code, reason) => {
      console.warn(`⚠️ Node "${name}" desconectado. Code: ${code}, Reason: ${reason}`);
    });

    this.kazagumo.on("playerStart", (player, track) => {
      this.handlePlaySong(player, track);
    });

    this.kazagumo.on("playerEnd", (player) => {
      // Música terminou
    });

    this.kazagumo.on("playerEmpty", (player) => {
      // Fila vazia, pode desconectar
      player.destroy();
    });

    this.kazagumo.on("playerError", (player, error) => {
      console.error("Erro ao tocar:", error);
    });
  }

  async handlePlaySong(player, track) {
    try {
      const textChannel = this.client.channels.cache.get(player.textId);
      if (!textChannel) return;

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Reprodução em Curso")
        .setDescription(`🎶 **[${track.title}](${track.uri})**`)
        .setTimestamp();

      if (track.length) {
        const duration = this.formatDuration(track.length);
        embed.addFields({
          name: "Duração",
          value: `**${duration}**`,
          inline: true,
        });
      }

      if (track.thumbnail) {
        embed.setImage(track.thumbnail);
      }

      const sentMessage = await textChannel.send({ embeds: [embed] });
      setTimeout(() => {
        sentMessage.delete().catch(() => { });
      }, this.messageDeleteTimeout);
    } catch (error) {
      console.error("Error in handlePlaySong:", error);
    }
  }

  formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  async playSpotifyPlaylist(voiceChannel, playlistUrl, options = {}) {
    try {
      const playlistIdMatch = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)/);
      if (!playlistIdMatch) throw new Error("ID da playlist inválido");
      const playlistId = playlistIdMatch[1];

      const data = await this.spotifyApi.getPlaylist(playlistId);
      const playlist = data.body;
      const tracks = playlist.tracks.items;

      if (!tracks.length) throw new Error("Playlist vazia");

      // Avisar o usuário
      const embed = new EmbedBuilder()
        .setColor("#1DB954")
        .setTitle(`🎶 Carregando Playlist: ${playlist.name}`)
        .setDescription(`Processando ${tracks.length} músicas... A primeira tocará em instantes!`)
        .setThumbnail(playlist.images[0]?.url)
        .setFooter({ text: "As outras músicas serão adicionadas em segundo plano." });

      if (options.textChannel) {
        options.textChannel.send({ embeds: [embed] });
      }

      // Tocar a primeira música imediatamente
      const firstItem = tracks[0];
      if (firstItem.track) {
        const query = `${firstItem.track.name} ${firstItem.track.artists[0].name}`;
        const ytResult = await ytSearch(query);
        if (ytResult && ytResult.videos.length > 0) {
          await this.playSong(voiceChannel, ytResult.videos[0].url, options);
        }
      }

      // Processar o resto em background
      this.processSpotifyPlaylistInBackground(voiceChannel, tracks.slice(1), options);

    } catch (error) {
      console.error("Erro ao carregar playlist Spotify:", error);
      if (options.textChannel) {
        options.textChannel.send("❌ Erro ao carregar a playlist do Spotify.");
      }
    }
  }

  async processSpotifyPlaylistInBackground(voiceChannel, tracks, options) {
    // Pequeno delay inicial
    await new Promise(resolve => setTimeout(resolve, 2000));

    for (const item of tracks) {
      try {
        const player = this.kazagumo.players.get(voiceChannel.guild.id);
        if (!player) break; // Player foi fechado

        const track = item.track;
        if (!track) continue;

        const query = `${track.name} ${track.artists[0].name}`;
        const ytResult = await ytSearch(query);

        if (ytResult && ytResult.videos.length > 0) {
          // Adiciona diretamente à fila usando search do Kazagumo com o link resolvido
          const result = await this.kazagumo.search(ytResult.videos[0].url, { requester: options.member });
          if (result.tracks.length) {
            player.queue.add(result.tracks[0]);
          }
        }

        // Delay para não abusar da API / Rate limit
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        // Silently fail for individual tracks to keep process alive
        // console.warn("Falha ao adicionar faixa de playlist", error);
      }
    }

    if (options.textChannel) {
      // Opcional: avisar quando terminar
      // options.textChannel.send("✅ Playlist do Spotify totalmente carregada!");
    }
  }

  async playSong(voiceChannel, query, options = {}) {
    try {
      let player = this.kazagumo.players.get(voiceChannel.guild.id);

      if (!player) {
        player = await this.kazagumo.createPlayer({
          guildId: voiceChannel.guild.id,
          textId: options.textChannel?.id,
          voiceId: voiceChannel.id,
          volume: 100,
        });
      }

      // Busca a música
      const result = await this.kazagumo.search(query, { requester: options.member });

      if (!result.tracks.length) {
        throw new Error("Nenhuma música encontrada!");
      }

      if (result.type === "PLAYLIST") {
        for (const track of result.tracks) {
          player.queue.add(track);
        }
      } else {
        player.queue.add(result.tracks[0]);
      }

      if (!player.playing && !player.paused) {
        player.play();
      }

      return player;
    } catch (error) {
      console.error("Erro ao tocar:", error);
      throw error;
    }
  }

  async stop(guildId) {
    try {
      const player = this.kazagumo.players.get(guildId);
      if (player) {
        player.destroy();
      }
    } catch (error) {
      console.error("Erro ao parar:", error);
    }
  }

  async skip(guildId) {
    try {
      const player = this.kazagumo.players.get(guildId);
      if (player) {
        player.skip();
      }
    } catch (error) {
      console.error("Erro ao pular:", error);
    }
  }

  async leave(guildId) {
    try {
      const player = this.kazagumo.players.get(guildId);
      if (player) {
        player.destroy();
      }
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  getPlayer(guildId) {
    return this.kazagumo.players.get(guildId);
  }
}

module.exports = PlayerManager;
