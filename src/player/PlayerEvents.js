class PlayerEvents {
  constructor(distube) {
    this.distube = distube;
  }

  handlePlaySong(queue, song) {
    console.log(`Tocando agora ${song.name} em ${queue.voiceChannel.name}`);
    if (queue.textChannel) {
      queue.textChannel.send(
        `🎶 Tocando agora **${song.name}** em **${queue.voiceChannel.name}**`
      );
    }
  }

  handleAddSong(queue, song) {
    console.log(`Adicionado ${song.name} na fila ${queue.voiceChannel.name}`);
  }

  handleAddList(queue, playlist) {
    console.log(
      `Adicionado ${playlist.name} na fila ${queue.voiceChannel.name}`
    );
  }

  handleFinish(queue) {
    console.log(`Lista de reprodução vazia!! ${queue.voiceChannel.name}`);
  }
}

module.exports = PlayerEvents;
