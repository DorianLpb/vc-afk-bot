const {
  Client,
  GatewayIntentBits,
  ChannelType,
  EmbedBuilder,
  SlashCommandBuilder
} = require("discord.js");

const {
  joinVoiceChannel,
  VoiceConnectionStatus
} = require("@discordjs/voice");

const TOKEN = process.env.TOKEN;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;
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

const slashCommands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Muestra la ayuda"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Muestra la latencia"),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Información del bot"),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Información de un usuario"),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Información del servidor"),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Muestra un avatar")
].map(command => command.toJSON());

async function registrarComandos() {
  try {
    console.log("Registrando comandos slash...");

    await client.application.commands.set(
      slashCommands,
      GUILD_ID
    );

    console.log("Comandos slash registrados correctamente.");
  } catch (error) {
    console.error("Error registrando comandos:", error);
  }
}

let conexionVC = null;
let reconectando = false;async function conectarVC() {
  if (reconectando) return;

  try {
    const canal = await client.channels.fetch(
      VOICE_CHANNEL_ID
    );

    if (
      !canal ||
      canal.type !== ChannelType.GuildVoice
    ) {
      console.log("No se encontró el canal de voz.");
      return;
    }

    if (
      conexionVC &&
      conexionVC.state.status !==
        VoiceConnectionStatus.Destroyed
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

    conexionVC.on(
      VoiceConnectionStatus.Disconnected,
      () => {
        if (reconectando) return;

        reconectando = true;

        setTimeout(async () => {
          reconectando = false;
          conexionVC = null;
          await conectarVC();
        }, 5000);
      }
    );
  } catch (error) {
    console.error("Error conectando al VC:", error);

    setTimeout(() => {
      conectarVC();
    }, 10000);
  }
}

client.once("ready", async () => {
  console.log(`Bot conectado como ${client.user.tag}`);

  await registrarComandos();
  await conectarVC();
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const contenido = message.content.trim();

  if (!contenido.toLowerCase().startsWith(PREFIX)) {
    return;
  }

  const partes = contenido
    .slice(PREFIX.length)
    .trim()
    .split(/\s+/);

  const command = partes.shift()?.toLowerCase();

  if (!command) return;

  console.log(`Comando recibido: ${command}`);  if (command === "ping") {
    const inicio = Date.now();

    const msg = await message.reply(
      "🏓 Calculando..."
    );

    const latencia = Date.now() - inicio;

    return msg.edit(
      `🏓 **Pong!**\nLatencia: \`${latencia}ms\``
    );
  }

  if (command === "help") {
    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle("Trapeando Bot • Ayuda")
      .setDescription(
        "Usa `t` o `/` para los comandos."
      )
      .addFields(
        {
          name: "💗 Social",
          value: "`tkiss` `thug` `tcuddle` `tlove`",
          inline: true
        },
        {
          name: "🛡️ Moderación",
          value: "`tban` `tkick` `twarn` `tpurge`",
          inline: true
        },
        {
          name: "🎮 Fun",
          value: "`t8ball` `tdice` `tcoinflip`",
          inline: true
        },
        {
          name: "💰 Economía",
          value: "`tbal` `tdaily` `twork`",
          inline: true
        }
      );

    return message.reply({
      embeds: [embed]
    });
  }

  if (
    command === "info" ||
    command === "botinfo"
  ) {
    return message.reply(
      `🤖 **Trapeando Bot**\n` +
      `📡 Servidores: \`${client.guilds.cache.size}\`\n` +
      `⚙️ Prefijo: \`t\``
    );
  }

  if (command === "userinfo") {
    const usuario =
      message.mentions.users.first() ||
      message.author;

    return message.reply(
      `👤 **${usuario.username}**\n` +
      `🆔 ID: \`${usuario.id}\``
    );
  }

  if (command === "serverinfo") {
    const guild = message.guild;

    return message.reply(
      `📊 **${guild.name}**\n` +
      `👥 Miembros: \`${guild.memberCount}\`\n` +
      `💬 Canales: \`${guild.channels.cache.size}\``
    );
  }

  if (command === "avatar") {
    const usuario =
      message.mentions.users.first() ||
      message.author;

    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle(`Avatar de ${usuario.username}`)
      .setImage(
        usuario.displayAvatarURL({
          extension: "png",
          size: 1024
        })
      );

    return message.reply({
      embeds: [embed]
    });
  }
});client.on(
  "interactionCreate",
  async interaction => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = interaction.commandName;

    if (command === "ping") {
      return interaction.reply(
        `🏓 **Pong!**\nLatencia: \`${client.ws.ping}ms\``
      );
    }

    if (command === "help") {
      return interaction.reply(
        "🤖 **Trapeando Bot**\nUsa `t` o `/` para utilizar los comandos."
      );
    }

    if (command === "info") {
      return interaction.reply(
        `🤖 **Trapeando Bot**\n` +
        `📡 Servidores: \`${client.guilds.cache.size}\``
      );
    }

    if (command === "userinfo") {
      const usuario = interaction.user;

      return interaction.reply(
        `👤 **${usuario.username}**\n` +
        `🆔 ID: \`${usuario.id}\``
      );
    }

    if (command === "serverinfo") {
      const guild = interaction.guild;

      return interaction.reply(
        `📊 **${guild.name}**\n` +
        `👥 Miembros: \`${guild.memberCount}\``
      );
    }

    if (command === "avatar") {
      const usuario = interaction.user;

      const embed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle(`Avatar de ${usuario.username}`)
        .setImage(
          usuario.displayAvatarURL({
            extension: "png",
            size: 1024
          })
        );

      return interaction.reply({
        embeds: [embed]
      });
    }
  }
);

client.login(TOKEN);
