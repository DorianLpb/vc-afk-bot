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
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content
    .slice(PREFIX.length)
    .trim()
    .split(/\s+/);

  const command = args.shift()?.toLowerCase();

  if (!command) return;

  if (command === "ping") {
    const msg = await message.reply("🏓 Calculando...");
    const latency = msg.createdTimestamp - message.createdTimestamp;

    return msg.edit(
      `🏓 **Pong!**\nLatencia: \`${latency}ms\``
    );
  }

  if (command === "help") {
    const embed = new EmbedBuilder()
      .setTitle("VC AFK • Ayuda")
      .setDescription("Menú de comandos de VC AFK.")
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
          value: "`tbal` `tdaily` `twork` `tshop`",
          inline: true
        },
        {
          name: "📊 Niveles",
          value: "`txp` `tlevel` `trank`",
          inline: true
        },
        {
          name: "🎫 Tickets",
          value: "`tticket` `tclose` `tclaim`",
          inline: true
        }
      );

    return message.reply({ embeds: [embed] });
  }

  if (command === "info" || command === "botinfo") {
    const embed = new EmbedBuilder()
      .setTitle("Información del bot")
      .setDescription("Bot multipropósito para servidores de Discord.")
      .addFields(
        {
          name: "🤖 Nombre",
          value: client.user.tag,
          inline: true
        },
        {
          name: "📡 Servidores",
          value: `${client.guilds.cache.size}`,
          inline: true
        },
        {
          name: "⚙️ Prefijo",
          value: "`t`",
          inline: true
        }
      );

    return message.reply({ embeds: [embed] });
      }  if (command === "userinfo") {
    const usuario =
      message.mentions.users.first() || message.author;

    const miembro = message.guild.members.cache.get(usuario.id);

    const embed = new EmbedBuilder()
      .setTitle(`Información de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "👤 Usuario",
          value: `${usuario}`,
          inline: true
        },
        {
          name: "🆔 ID",
          value: usuario.id,
          inline: true
        },
        {
          name: "📅 Cuenta creada",
          value: `<t:${Math.floor(usuario.createdTimestamp / 1000)}:R>`,
          inline: true
        }
      );

    if (miembro) {
      embed.addFields({
        name: "📥 Entró al servidor",
        value: `<t:${Math.floor(miembro.joinedTimestamp / 1000)}:R>`,
        inline: true
      });
    }

    return message.reply({ embeds: [embed] });
  }

  if (command === "serverinfo") {
    const guild = message.guild;

    const embed = new EmbedBuilder()
      .setTitle(`Información de ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: "👑 Dueño",
          value: `<@${guild.ownerId}>`,
          inline: true
        },
        {
          name: "👥 Miembros",
          value: `${guild.memberCount}`,
          inline: true
        },
        {
          name: "💬 Canales",
          value: `${guild.channels.cache.size}`,
          inline: true
        },
        {
          name: "🆔 ID",
          value: guild.id,
          inline: true
        }
      );

    return message.reply({ embeds: [embed] });
  }

  if (command === "avatar") {
    const usuario =
      message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setTitle(`Avatar de ${usuario.username}`)
      .setImage(
        usuario.displayAvatarURL({
          extension: "png",
          size: 1024
        })
      );

    return message.reply({ embeds: [embed] });
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  if (command === "ping") {
    return interaction.reply(
      `🏓 **Pong!**\nLatencia: \`${client.ws.ping}ms\``
    );
  }

  if (command === "help") {
    const embed = new EmbedBuilder()
      .setTitle("VC AFK • Ayuda")
      .setDescription("Sistema de comandos de VC AFK.")
      .addFields(
        {
          name: "💗 Social",
          value: "Próximamente",
          inline: true
        },
        {
          name: "🛡️ Moderación",
          value: "Próximamente",
          inline: true
        },
        {
          name: "🎮 Fun",
          value: "Próximamente",
          inline: true
        }
      );

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "info") {
    const embed = new EmbedBuilder()
      .setTitle("Información del bot")
      .setDescription(
        "VC AFK es un bot multipropósito para Discord."
      )
      .addFields(
        {
          name: "🤖 Bot",
          value: client.user.tag,
          inline: true
        },
        {
          name: "📡 Servidores",
          value: `${client.guilds.cache.size}`,
          inline: true
        }
      );

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "userinfo") {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`Información de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "👤 Usuario",
          value: `${usuario}`,
          inline: true
        },
        {
          name: "🆔 ID",
          value: usuario.id,
          inline: true
        },
        {
          name: "📅 Cuenta creada",
          value: `<t:${Math.floor(usuario.createdTimestamp / 1000)}:R>`,
          inline: true
        }
      );

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "serverinfo") {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle(`Información de ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: "👑 Dueño",
          value: `<@${guild.ownerId}>`,
          inline: true
        },
        {
          name: "👥 Miembros",
          value: `${guild.memberCount}`,
          inline: true
        },
        {
          name: "💬 Canales",
          value: `${guild.channels.cache.size}`,
          inline: true
        }
      );

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "avatar") {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`Avatar de ${usuario.username}`)
      .setImage(
        usuario.displayAvatarURL({
          extension: "png",
          size: 1024
        })
      );

    return interaction.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);
