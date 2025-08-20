# 🎵 Recover Groove — Bot de Música para Discord

Um bot de música **profissional e personalizável** feito em **Node.js** para tocar músicas no Discord a partir do **YouTube** e **Spotify**, com suporte a **fila de reprodução**, **playlists**, **busca interativa** e **interface com botões**.

---

## 🚀 Funcionalidades

- 🎧 Toque músicas do **YouTube** e **Spotify**  
- 🔎 Busca interativa com botões para selecionar faixas  
- 📂 Suporte a **playlists completas**  
- 🟢 Integração direta com a API do Spotify  
- 📻 Suporte ao **yt-dlp** para maior compatibilidade com links do YouTube  
- 🎶 Fila de músicas com eventos e mensagens no chat  
- 📱 Interface com **botões interativos** (seleção de músicas)  
- 🛑 Comandos de controle: `play`, `skip`, `stop`, `leave`  
- 🖼️ Embeds estilizados para melhor visualização  

---

## 📦 Tecnologias Utilizadas

- [Discord.js v14](https://discord.js.org/) — API para bots no Discord  
- [DisTube](https://distube.js.org/) — Biblioteca para gerenciamento de música  
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — Extração avançada de vídeos do YouTube  
- [Spotify Web API Node](https://github.com/thelinmichael/spotify-web-api-node) — Integração com Spotify  
- [yt-search](https://www.npmjs.com/package/yt-search) — Busca de vídeos no YouTube  

---

## ⚙️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```
### 2. Instale as dependências
```bash
.
npm install
```

### 3. Configure o arquivo .env
Crie um arquivo chamado .env na raiz do projeto e adicione suas credenciais:
```bash
DISCORD_TOKEN=seu_token_do_discord
CLIENT_ID=seu_client_id_do_discord
GUILD_ID=seu_guild_id_de_teste
SPOTIFY_CLIENT_ID=seu_client_id_spotify
SPOTIFY_CLIENT_SECRET=seu_client_secret_spotify
```

### 4. Registre os comandos
```bash
.
node deploy-commands.js
```

### 5. Inicie o bot
```bash
.
node src/Recover-Groove.js
```

## 🎮 Comandos Disponíveis
```bash
.
/play youtube
```

## Procura uma música no YouTube e toca no canal de voz.
#### ➡️ Exemplo: /play youtube name-or-clear-url:Never Gonna Give You Up
```bash
.
/play playlist
```

## Reproduz uma playlist do YouTube.
#### ➡️ Exemplo: /play playlist url:https://youtube.com/playlist?list=...
```bash
.
/play spotify
```

## Procura e toca músicas diretamente do Spotify.
#### ➡️ Exemplo: /play spotify name-or-clear-url:Shape of You
```bash
## 📁 Estrutura 
src/
├── commands/
│   └── play.js          # Comando principal de música
├── PlayerManager.js      # Gerencia o Distube e plugins
├── PlayerQueue.js        # Controle da fila de músicas
├── PlayerEvents.js       # Eventos (play, add, finish, etc.)
├── PlayerErrorHandler.js # Tratamento de erros
└── Recover-Groove.js     # Arquivo principal do bot
```


## 🛠️ Plugins Configurados

* SpotifyPlugin: Converte links e buscas do Spotify em resultados do YouTube
* YtDlpPlugin: Compatibilidade com links de vídeos e playlists do YouTube

## 📌 Notas Importantes

* O bot precisa de permissões para Conectar-se e Falar no canal de voz.
* O Spotify não fornece streaming de áudio diretamente, então as músicas são buscadas no YouTube a partir dos metadados do Spotify.
* Para maior precisão, recomendamos usar o yt-dlp com cookies (cookies.txt) para acessar músicas privadas/bloqueadas no YouTube.

## 👨‍💻 Autor
```bash
Recover Groove 🎶
Feito com ❤️ em Node.js

Se gostou, deixe uma ⭐ no repositório!
```
