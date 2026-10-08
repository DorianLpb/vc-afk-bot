const {
  Client,
  GatewayIntentBits,
  ChannelType,
  EmbedBuilder,
  SlashCommandBuilder,
  Partials
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
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildEmojisAndStickers
  ],
  partials: [Partials.Channel, Partials.Message]
});

const slashCommands = [
  new SlashCommandBuilder().setName("help").setDescription("Muestra la ayuda"),
  new SlashCommandBuilder().setName("ping").setDescription("Muestra la latencia"),
  new SlashCommandBuilder().setName("info").setDescription("Información del bot")
].map(command => command.toJSON());

async function registrarComandos() {
  try {
    console.log("Registrando comandos slash...");
    await client.application.commands.set(slashCommands, GUILD_ID);
    console.log("Comandos slash registrados correctamente.");
  } catch (error) {
    console.error("Error registrando comandos:", error);
  }
}

let conexionVC = null;
let reconectando = false;

async function conectarVC() {
  if (reconectando) return;
  reconectando = true;

  try {
    const canal = await client.channels.fetch(VOICE_CHANNEL_ID);
    if (!canal || canal.type !== ChannelType.GuildVoice) {
      console.log("No se encontró el canal de voz o no es de voz.");
      reconectando = false;
      return;
    }

    if (conexionVC && conexionVC.state.status !== VoiceConnectionStatus.Destroyed) {
      reconectando = false;
      return;
    }

    if (conexionVC && conexionVC.state.status === VoiceConnectionStatus.Destroyed) {
      conexionVC = null;
    }

    conexionVC = joinVoiceChannel({
      channelId: canal.id,
      guildId: canal.guild.id,
      adapterCreator: canal.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true
    });

    console.log(`Conectado al VC: ${canal.name}`);
    reconectando = false;

    conexionVC.on(VoiceConnectionStatus.Disconnected, () => {
      if (reconectando) return;
      reconectando = true;

      setTimeout(async () => {
        try {
          if (conexionVC) conexionVC.destroy();
        } catch (e) {}
        conexionVC = null;
        reconectando = false;
        await conectarVC();
      }, 5000);
    });
  } catch (error) {
    console.error("Error conectando al VC:", error);
    setTimeout(() => {
      reconectando = false;
      conectarVC();
    }, 10000);
  }
}

client.once("ready", async () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  await registrarComandos();
  await conectarVC();
});

// Sistema básico de economía en memoria (se reinicia al apagar el bot)
const economia = new Map();

// Función auxiliar para mencionar
const getUserMention = (message) => message.mentions.users.first() || message.author;

client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.toLowerCase().startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();

  if (!command) return;

  try {
    // ================= 💗 SOCIAL =================
    if (["kiss", "thug", "cuddle", "highfive", "pat", "love", "ship"].includes(command)) {
      const user = getUserMention(message);
      if (user.id === message.author.id) return message.reply("¡No puedes usar esto contigo mismo! 😅");
      
      const acciones = {
        kiss: "le dio un beso a",
        thug: "se puso modo matón frente a",
        cuddle: "abrazó tiernamente a",
        highfive: "le dio un chocar de manos a",
        pat: "le dio palmaditas en la cabeza a",
        love: "le declaró su amor a",
        ship: "formó un lindo ship con"
      };
      
      const embed = new EmbedBuilder()
        .setColor(0xFF69B4)
        .setDescription(`💞 **${message.author.username}** ${acciones[command]} **${user.username}** 💞`);
      return message.reply({ embeds: [embed] });
    }

    // ================= 🎮 DIVERSIÓN =================
    if (command === "8ball") {
      const respuestas = ["Sí.", "No.", "Definitivamente.", "Pregunta de nuevo más tarde.", "No cuentes con ello.", "Mis fuentes dicen que sí.", "Muy dudoso."];
      return message.reply(`🎱 **${respuestas[Math.floor(Math.random() * respuestas.length)]}**`);
    }
    if (command === "dice") return message.reply(`🎲 Tiraste un dado y salió: **${Math.floor(Math.random() * 6) + 1}**`);
    if (command === "coinflip") return message.reply(`🪙 Lanzaste una moneda: **${Math.random() < 0.5 ? "Cara" : "Cruz"}**`);
    if (command === "rps") {
      const opciones = ["piedra", "papel", "tijera"];
      const botChoice = opciones[Math.floor(Math.random() * opciones.length)];
      const userChoice = args[0]?.toLowerCase();
      if (!opciones.includes(userChoice)) return message.reply("Elige: piedra, papel o tijera.");
      if (userChoice === botChoice) return message.reply(`🤖 ${botChoice} | Empate!`);
      const gana = (userChoice === "piedra" && botChoice === "tijera") || (userChoice === "papel" && botChoice === "piedra") || (userChoice === "tijera" && botChoice === "papel");
      return message.reply(`🤖 ${botChoice} | ${gana ? "¡Ganaste! 🎉" : "¡Perdiste! 😢"}`);
    }
    if (command === "choose") {
      const opciones = args.join(" ").split(",");
      if (opciones.length < 2) return message.reply("Escribe opciones separadas por comas. Ej: tchoose pizza, hamburguesa");
      return message.reply(`🤔 Elijo: **${opciones[Math.floor(Math.random() * opciones.length)].trim()}**`);
    }
    if (command === "roll") return message.reply(`🎲 ${Math.floor(Math.random() * 100) + 1}`);
    if (command === "cat") return message.reply(`🐱 ¡Miau! ¿Por qué no intentas buscar imágenes con un módulo de Tenor más tarde?`);
    if (command === "dog") return message.reply(`🐶 ¡Guau! Añadiré imágenes en el futuro.`);

    // ================= 🛡️ MODERACIÓN =================
    if (command === "ban") {
      const user = message.mentions.users.first();
      if (!user) return message.reply("Menciona a alguien para banear. `tban @user`");
      if (!message.memberPermissions.has("BanMembers")) return message.reply("No tienes permiso para banear.");
      await message.guild.members.ban(user);
      return message.reply(`🔨 **${user.username}** ha sido baneado del servidor.`);
    }
    if (command === "kick") {
      const user = message.mentions.users.first();
      if (!user) return message.reply("Menciona a alguien para expulsar. `tkick @user`");
      const member = await message.guild.members.fetch(user.id).catch(() => null);
      if (member) {
        await member.kick();
        return message.reply(`👢 **${user.username}** ha sido expulsado.`);
      }
    }
    if (command === "purge") {
      const amount = parseInt(args[0]);
      if (!amount) return message.reply("Dime cuántos mensajes borrar. Ej: `tpurge 10`");
      await message.channel.bulkDelete(amount + 1, true);
      return message.channel.send(`🧹 Limpié **${amount}** mensajes.`).then(msg => setTimeout(() => msg.delete(), 3000));
    }
    if (command === "timeout") {
      const user = message.mentions.users.first();
      const time = parseInt(args[1]);
      if (!user || !time) return message.reply("Uso: `ttimeout @user 10` (en minutos)");
      const member = await message.guild.members.fetch(user.id).catch(() => null);
      if (member) {
        await member.timeout(time * 60 * 1000);
        return message.reply(`⏳ **${user.username}** ha sido aislado por **${time}** minutos.`);
      }
    }
    if (command === "untimeout") {
      const user = message.mentions.users.first();
      const member = await message.guild.members.fetch(user.id).catch(() => null);
      if (member) {
        await member.timeout(null);
        return message.reply(`✅ **${user.username}** ya no está aislado.`);
      }
    }
    if (command === "lock") {
      await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
      return message.reply("🔒 Canal bloqueado.");
    }
    if (command === "unlock") {
      await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: true });
      return message.reply("🔓 Canal desbloqueado.");
    }
    if (command === "warn") return message.reply("⚠️ Sistema de advertencias en construcción. Usa moderación básica por ahora.");
    if (command === "warns") return message.reply("⚠️ No hay advertencias registradas.");

    // ================= 📊 INFORMACIÓN =================
    if (command === "ping") {
      const msg = await message.reply("🏓 Calculando...");
      return msg.edit(`🏓 **Pong!**\nLatencia: \`${Date.now() - msg.createdTimestamp}ms\``);
    }
    if (command === "help") {
      const embed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle("Trapeando Bot • Ayuda")
        .setDescription("Usa `t` o `/` para utilizar los comandos.")
        .addFields(
          { name: "💗 Social", value: "`tkiss` `thug` `tcuddle` `thighfive` `tpat` `tlove` `tship`", inline: false },
          { name: "🎮 Diversión", value: "`t8ball` `tdice` `tcoinflip` `trps` `tchoose` `troll` `tcat` `tdog`", inline: false },
          { name: "🛡️ Moderación", value: "`tban` `tkick` `twarn` `twarns` `tpurge` `ttimeout` `tuntimeout` `tlock` `tunlock`", inline: false },
          { name: "📊 Información", value: "`tping` `tinfo` `tuserinfo` `tserverinfo` `tavatar` `troleinfo` `tchannelinfo`", inline: false },
          { name: "💰 Economía", value: "`tbal` `tdaily` `twork` `tpay` `tshop` `tbuy`", inline: false },
          { name: "🎫 Utilidades", value: "`tticket` `tsuggest`", inline: false }
        );
      return message.reply({ embeds: [embed] });
    }
    if (command === "info") return message.reply(`🤖 **Trapeando Bot**\n📡 Servidores: \`${client.guilds.cache.size}\`\n⚙️ Prefijo: \`t\``);
    if (command === "userinfo") {
      const user = getUserMention(message);
      const embed = new EmbedBuilder().setColor(0x3498db).setTitle(`Info de ${user.username}`).setThumbnail(user.displayAvatarURL()).addFields(
        { name: "🆔 ID", value: user.id, inline: true },
        { name: "📅 Creación", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
      );
      return message.reply({ embeds: [embed] });
    }
    if (command === "serverinfo") {
      const g = message.guild;
      const embed = new EmbedBuilder().setColor(0x2ecc71).setTitle(`Info de ${g.name}`).addFields(
        { name: "👑 Owner", value: `<@${g.ownerId}>`, inline: true },
        { name: "👥 Miembros", value: `${g.memberCount}`, inline: true },
        { name: "💬 Canales", value: `${g.channels.cache.size}`, inline: true }
      );
      return message.reply({ embeds: [embed] });
    }
    if (command === "avatar") {
      const user = getUserMention(message);
      return message.reply({ embeds: [new EmbedBuilder().setColor(0x8b5cf6).setTitle(`Avatar de ${user.username}`).setImage(user.displayAvatarURL({ size: 1024 }))] });
    }
    if (command === "roleinfo") {
      const role = message.mentions.roles.first();
      if (!role) return message.reply("Menciona un rol. `troleinfo @rol`");
      return message.reply(`📋 **${role.name}**\n🆔 ID: \`${role.id}\`\n👥 Miembros: \`${role.members.size}\``);
    }
    if (command === "channelinfo") {
      const c = message.channel;
      return message.reply(`💬 **${c.name}**\n🆔 ID: \`${c.id}\`\nTipo: \`${c.type}\``);
    }

    // ================= 💰 ECONOMÍA (Básica) =================
    if (command === "bal") {
      const user = getUserMention(message);
      const bal = economia.get(user.id)?.coins || 0;
      return message.reply(`💰 **${user.username}** tiene \`${bal}\` monedas.`);
    }
    if (command === "daily") {
      const data = economia.get(message.author.id) || { coins: 0, lastDaily: 0 };
      if (Date.now() - data.lastDaily < 86400000) return message.reply("⏳ Ya reclamaste tu premio diario. Vuelve mañana.");
      data.coins += 500;
      data.lastDaily = Date.now();
      economia.set(message.author.id, data);
      return message.reply("🎁 Claimaste tus **500** monedas diarias!");
    }
    if (command === "work") {
      const data = economia.get(message.author.id) || { coins: 0, lastDaily: 0 };
      const ganancia = Math.floor(Math.random() * 200) + 50;
      data.coins += ganancia;
      economia.set(message.author.id, data);
      return message.reply(`💼 Trabajaste y ganaste **${ganancia}** monedas!`);
    }
    if (command === "pay") {
      const user = message.mentions.users.first();
      const amount = parseInt(args[1]);
      if (!user || !amount) return message.reply("Uso: `tpay @user 100`");
      const data = economia.get(message.author.id) || { coins: 0 };
      if (data.coins < amount) return message.reply("No tienes suficientes monedas.");
      data.coins -= amount;
      economia.set(message.author.id, data);
      const targetData = economia.get(user.id) || { coins: 0 };
      targetData.coins += amount;
      economia.set(user.id, targetData);
      return message.reply(`💸 Le pagaste **${amount}** monedas a **${user.username}**.`);
    }
    if (command === "shop") return message.reply("🛒 Tienda:\n1. Rol VIP - 5000 monedas\nUsa `tbuy 1`");
    if (command === "buy") return message.reply("🛒 Función de compra en desarrollo.");

    // ================= 🎫 UTILIDADES =================
    if (command === "suggest") {
      const suggestion = args.join(" ");
      if (!suggestion) return message.reply("Escribe tu sugerencia. `tsuggest Nueva idea`");
      const embed = new EmbedBuilder().setColor(0xFFD700).setAuthor({ name: `Sugerencia de ${message.author.username}` }).setDescription(suggestion);
      const msg = await message.channel.send({ embeds: [embed] });
      await msg.react("✅");
      await msg.react("❌");
      await message.delete();
    }
    if (command === "ticket") return message.reply("🎫 Sistema de tickets en construcción. Usa canales de soporte manuales por ahora.");

  } catch (error) {
    console.error("Error en comando:", error);
    // Si el bot no tiene permisos, avisará en lugar de morir
    if (error.code === 50013) return message.reply("❌ No tengo permisos para hacer eso en este canal.");
    message.reply("⚠️ Ocurrió un error al ejecutar el comando.").catch(() => {});
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  try {
    if (interaction.commandName === "ping") return interaction.reply(`🏓 **Pong!**\nLatencia: \`${client.ws.ping}ms\``);
    if (interaction.commandName === "help") return interaction.reply("🤖 **Trapeando Bot**\nUsa `t` o `/` para utilizar los comandos.");
    if (interaction.commandName === "info") return interaction.reply(`🤖 **Trapeando Bot**\n📡 Servidores: \`${client.guilds.cache.size}\``);
  } catch (error) {
    console.error("Error slash:", error);
  }
});

client.login(TOKEN);
