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
    .setDescription("Muestra el menú de ayuda"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Muestra la latencia"),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Información del bot"),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Información de un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Información del servidor"),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Muestra un avatar")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    )
].map(command => command.toJSON());

async function registrarComandos() {
  try {
    console.log("Registrando comandos slash...");

    await client.application.commands.set(
      slashCommands,
      GUILD_ID
    );

    console.log(
      "Comandos slash registrados correctamente."
    );
  } catch (error) {
    console.error(
      "Error registrando comandos:",
      error
    );
  }
}

let conexionVC = null;
let reconectando = false;

async function conectarVC() {
  if (reconectando) return;

  try {
    const canal = await client.channels.fetch(
      VOICE_CHANNEL_ID
    );

    if (
      !canal ||
      canal.type !== ChannelType.GuildVoice
    ) {
      console.log(
        "No se encontró el canal de voz."
      );
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
      adapterCreator:
        canal.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true
    });

    console.log(
      `Conectado al VC: ${canal.name}`
    );

    conexionVC.on(
      VoiceConnectionStatus.Disconnected,
      () => {
        if (reconectando) return;

        reconectando = true;

        console.log(
          "Bot desconectado. Reconectando..."
        );

        setTimeout(async () => {
          reconectando = false;
          conexionVC = null;
          await conectarVC();
        }, 5000);
      }
    );
  } catch (error) {
    console.error(
      "Error conectando al VC:",
      error
    );

    setTimeout(() => {
      conectarVC();
    }, 10000);
  }
}client.once("ready", async () => {
  console.log(
    `Bot conectado como ${client.user.tag}`
  );

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
    const msg = await message.reply(
      "🏓 Calculando..."
    );

    const latency =
      msg.createdTimestamp -
      message.createdTimestamp;

    return msg.edit(
      `🏓 **Pong!**\nLatencia: \`${latency}ms\``
    );
  }

  if (command === "help") {
    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle("Trapeando Bot • Ayuda")
      .setDescription(
        "Usa `t` o `/` para utilizar los comandos."
      )
      .addFields(
        {
          name: "💗 Social",
          value:
            "`tkiss` `thug` `tcuddle` `tlove`",
          inline: true
        },
        {
          name: "🛡️ Moderación",
          value:
            "`tban` `tkick` `twarn` `tpurge`",
          inline: true
        },
        {
          name: "🎮 Fun",
          value:
            "`t8ball` `tdice` `tcoinflip`",
          inline: true
        },
        {
          name: "💰 Economía",
          value:
            "`tbal` `tdaily` `twork` `tshop`",
          inline: true
        },
        {
          name: "📊 Niveles",
          value:
            "`txp` `tlevel` `trank`",
          inline: true
        },
        {
          name: "🎫 Tickets",
          value:
            "`tticket` `tclose` `tclaim`",
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
    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle("Información del bot")
      .addFields(
        {
          name: "🤖 Nombre",
          value: client.user.tag,
          inline: true
        },
        {
          name: "📡 Servidores",
          value:
            `${client.guilds.cache.size}`,
          inline: true
        },
        {
          name: "⚙️ Prefijo",
          value: "`t`",
          inline: true
        }
      );

    return message.reply({
      embeds: [embed]
    });
  }

  if (command === "userinfo") {
    const usuario =
      message.mentions.users.first() ||
      message.author;

    const miembro =
      message.guild.members.cache.get(
        usuario.id
      );

    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle(
        `Información de ${usuario.username}`
      )
      .setThumbnail(
        usuario.displayAvatarURL({
          dynamic: true
        })
      )
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
        }
      );

    if (miembro) {
      embed.addFields({
        name: "📥 Entró al servidor",
        value:
          `<t:${Math.floor(
            miembro.joinedTimestamp / 1000
          )}:R>`,
        inline: true
      });
    }

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

    const command =
      interaction.commandName;

    if (command === "ping") {
      return interaction.reply(
        `🏓 **Pong!**\nLatencia: \`${client.ws.ping}ms\``
      );
    }

    if (command === "help") {
      const embed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle("Trapeando Bot • Ayuda")
        .setDescription(
          "Usa `t` o `/` para utilizar los comandos."
        )
        .addFields(
          {
            name: "💗 Social",
            value: "`tkiss` `thug` `tcuddle`",
            inline: true
          },
          {
            name: "🛡️ Moderación",
            value: "`tban` `tkick` `twarn`",
            inline: true
          },
          {
            name: "🎮 Fun",
            value: "`t8ball` `tdice`",
            inline: true
          }
        );

      return interaction.reply({
        embeds: [embed]
      });
    }

    if (command === "info") {
      return interaction.reply(
        `🤖 **Trapeando Bot**\n` +
        `📡 Servidores: \`${client.guilds.cache.size}\`\n` +
        `⚙️ Prefijo: \`t\``
      );
    }

    if (command === "userinfo") {
      const usuario =
        interaction.options.getUser(
          "usuario"
        ) || interaction.user;

      const embed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle(
          `Información de ${usuario.username}`
        )
        .setThumbnail(
          usuario.displayAvatarURL({
            dynamic: true
          })
        )
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
          }
        );

      return interaction.reply({
        embeds: [embed]
      });
    }

    if (command === "serverinfo") {
      const guild = interaction.guild;

      const embed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle(
          `Información de ${guild.name}`
        )
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
            value:
              `${guild.channels.cache.size}`,
            inline: true
          }
        );

      return interaction.reply({
        embeds: [embed]
      });
    }

    if (command === "avatar") {
      const usuario =
        interaction.options.getUser(
          "usuario"
        ) || interaction.user;

      const embed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle(
          `Avatar de ${usuario.username}`
        )
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
