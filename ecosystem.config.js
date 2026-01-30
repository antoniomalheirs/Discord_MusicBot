module.exports = {
    apps: [
        {
            name: "music-bot",
            script: "./src/Index.js",
            watch: true, // Reinicia se houver alterações nos arquivos
            ignore_watch: ["node_modules", "logs"],
            max_memory_restart: "300M", // Reinicia se usar muita memória (bom para Android)
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
