# Versão 20 do Node.js
FROM node:22-slim

# Garante a instalação do python3, ffmpeg E as ferramentas de compilação
RUN apt-get update && apt-get install -y \
    python3 \
    ffmpeg \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# O resto do arquivo...
WORKDIR /bot/rec_groove/

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "node", "src/Index.js" ]