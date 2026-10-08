const {
  Client,
  GatewayIntentBits,
  ChannelType,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const {
  joinVoiceChannel,
  VoiceConnectionStatus
} = require("@discordjs/voice");

const TOKEN = process.env.TOKEN;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const PREFIX = "t";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

// ==============================
// COMANDOS SLASH
// ==============================

const slashCommands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Muestra el menú de ayuda"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Muestra la latencia del bot"),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Muestra información del bot"),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Muestra información de un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Muestra información del servidor"),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Muestra el avatar de un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario del que quieres ver el avatar")
        .setRequired(false)
    )
].map(command => command.toJSON());

// ==============================
// REGISTRAR COMANDOS SLASH
// ==============================

async function registrarComandos() {
  try {
    const rest = new REST({ version: "10" }).setToken(TOKEN);

    console.log("Registrando comandos slash...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: slashCommands }
    );

    console.log("Comandos slash registrados correctamente.");
  } catch (error) {
    console.error("Error registrando comandos:", error);
  }
}

// ==============================
// CONEXIÓN AL VC
// ==============================

let conexionVC = null;
let reconectando = false;

async function conectarVC() {
  if (reconectando) return;

  try {
    const canal = await client.channels.fetch(VOICE_CHANNEL_ID);

    if (!canal || canal.type !== ChannelType.GuildVoice) {
      console.log("No se encontró el canal de voz.");
      return;
    }

    if (
      conexionVC &&
      conexionVC.state.status !== VoiceConnectionStatus.Destroyed
    ) {
      return;
    }

    conexionVC = joinVoiceChannel({
      channelId: canal.id,
      guildId: canal.guild.id,
      adapterCreator: canal.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true
    });

    console.log(`Conectado al VC: ${canal.name}`);

    conexionVC.on(VoiceConnectionStatus.Disconnected, () => {
  if (reconectando) return;

  reconectando = true;

  console.log("Bot desconectado. Intentando reconectar...");

  setTimeout(async () => {
    reconectando = false;
    conexionVC = null;
    await conectarVC();
  }, 5000);
});
