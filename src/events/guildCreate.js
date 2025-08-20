// events/guildCreate.js
module.exports = {
    name: 'guildCreate',
    execute(guild) {
      console.log(`Fui adicionado a um NOVA GUILDA: ${guild.name}`);
    },
  };
  