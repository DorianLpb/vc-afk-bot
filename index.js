const { Client, GatewayIntentBits, ChannelType } = require("discord.js");
const { joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = process.env.TOKEN;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

function conectarVC() {
  const canal = client.channels.cache.get(VOICE_CHANNEL_ID);

  if (!canal || canal.type !== ChannelType.GuildVoice) {
    console.log("No se encontró el canal de voz.");
    return;
  }

  const conexion = joinVoiceChannel({
    channelId: canal.id,
    guildId: canal.guild.id,
    adapterCreator: canal.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: true
  });

  console.log(`Conectado a ${canal.name}`);

  conexion.on(VoiceConnectionStatus.Disconnected, () => {
    console.log("Bot desconectado. Intentando reconectar...");

    setTimeout(() => {
      conectarVC();
    }, 5000);
  });
}

client.once("ready", () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  conectarVC();
});

client.login(TOKEN); 
