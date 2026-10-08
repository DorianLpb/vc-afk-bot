const {
  Client,
  GatewayIntentBits,
  ChannelType,
  EmbedBuilder,
  SlashCommandBuilder,
  Partials,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const {
  joinVoiceChannel,
  VoiceConnectionStatus
} = require("@discordjs/voice");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

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
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.GuildMember, Partials.User]
});

const slashCommands = [
  new SlashCommandBuilder().setName("botinfo").setDescription("Muestra toda la informacion del bot"),
  new SlashCommandBuilder().setName("userinfo").setDescription("Muestra informacion de un usuario").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a consultar").setRequired(false)),
  new SlashCommandBuilder().setName("server-info").setDescription("Muestra toda la informacion del servidor"),
  new SlashCommandBuilder().setName("kick").setDescription("Expulsa a un usuario del servidor").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a expulsar").setRequired(true)).addStringOption(opt => opt.setName("razon").setDescription("Razon de la expulsion").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder().setName("ban").setDescription("Banea a un usuario del servidor").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a banear").setRequired(true)).addStringOption(opt => opt.setName("razon").setDescription("Razon del ban").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName("mute").setDescription("Aisla temporalmente a un usuario (timeout)").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a mutear").setRequired(true)).addStringOption(opt => opt.setName("tiempo").setDescription("Tiempo: 10s, 5m, 2h, 1d").setRequired(true)).addStringOption(opt => opt.setName("razon").setDescription("Razon del muteo").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName("hardban").setDescription("Banea a un usuario por ID o nombre (no necesita estar en el servidor)").addStringOption(opt => opt.setName("usuario").setDescription("ID o nombre de usuario").setRequired(true)).addStringOption(opt => opt.setName("razon").setDescription("Razon del ban").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName("kiss").setDescription("Besa a un usuario").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a besar").setRequired(true)),
  new SlashCommandBuilder().setName("thug").setDescription("Abraza a un usuario").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a abrazar").setRequired(true)),
  new SlashCommandBuilder().setName("voice-join").setDescription("El bot se une a un canal de voz (administrador)").addChannelOption(opt => opt.setName("canal").setDescription("Canal de voz al que unirse").addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice).setRequired(false)).addBooleanOption(opt => opt.setName("stop").setDescription("true para sacar al bot del canal de voz").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName("fly").setDescription("Estas volando"),
  new SlashCommandBuilder().setName("spank").setDescription("Nalguea a un usuario").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a nalguear").setRequired(true)),
  new SlashCommandBuilder().setName("punch").setDescription("Golpea a un usuario").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a golpear").setRequired(true)),
  new SlashCommandBuilder().setName("like").setDescription("Apruebas algo"),
  new SlashCommandBuilder().setName("sleep").setDescription("Estas durmiendo"),
  new SlashCommandBuilder().setName("dance").setDescription("Estas bailando"),
  new SlashCommandBuilder().setName("bot-say").setDescription("Envia un mensaje anonimo como el bot").addStringOption(opt => opt.setName("mensaje").setDescription("Mensaje a enviar").setRequired(true)).addAttachmentOption(opt => opt.setName("file").setDescription("Archivo adjunto opcional").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
].map(cmd => cmd.toJSON());

const kissGifs = [
  "https://cdn.nekotina.com/images/vuywvDR4.gif",
  "https://cdn.nekotina.com/images/DuxJnpyB.gif",
  "https://cdn.nekotina.com/images/dUTutY96.gif",
  "https://cdn.nekotina.com/images/QpQCXyh1.gif",
  "https://cdn.nekotina.com/images/OIYqnY9IF.gif",
  "https://cdn.nekotina.com/images/JUFu0fqJt.gif",
  "https://cdn.nekotina.com/images/SFqd-CfA.gif",
  "https://cdn.nekotina.com/images/EPyv7UWX.gif",
  "https://cdn.nekotina.com/images/EQQ-TVAt.gif",
  "https://cdn.nekotina.com/images/oUiAFsDZ.gif"
];

const rejectGifs = [
  "https://cdn.nekotina.com/images/3jijKebT.gif",
  "https://cdn.nekotina.com/images/HA3Ol7fj.gif",
  "https://cdn.nekotina.com/images/_vt7mzw5g.gif",
  "https://cdn.nekotina.com/images/XVae00Z9.gif",
  "https://cdn.nekotina.com/images/kedz2RMR.gif",
  "https://cdn.discordapp.com/attachments/1535051964017147934/1537416242648977478/image0.gif?ex=6a7ef5f4&is=6a7da474&hm=b01bc736ebf9c1d38d76313c802f8b627a658141e52fb1a723e0955fc2c7e617&",
  "https://cdn.nekotina.com/images/FQdMZIjV.gif",
  "https://cdn.nekotina.com/images/NRVgF57m.gif",
  "https://cdn.nekotina.com/images/MkfmfbLJ.gif",
  "https://cdn.nekotina.com/images/daZ0GGVu.gif"
];

const hugGifs = [
  "https://cdn.nekotina.com/images/qG4Rpy-Zs.gif",
  "https://cdn.nekotina.com/images/I9MUogRJ.gif",
  "https://cdn.nekotina.com/images/g7LcIj_Y.gif",
  "https://cdn.nekotina.com/images/UbOZT9VU.gif",
  "https://cdn.nekotina.com/images/-kGBT73A.gif",
  "https://cdn.nekotina.com/images/qrpfAEnw.gif",
  "https://cdn.nekotina.com/images/13PApX6a.gif",
  "https://cdn.nekotina.com/images/78zKETkoO.gif",
  "https://cdn.nekotina.com/images/NpgYrYkP.gif",
  "https://cdn.nekotina.com/images/_HYJYgYI.gif"
];

const flyGifs = [
  "https://cdn.nekotina.com/images/ZIQ51jJqd.gif",
  "https://cdn.nekotina.com/images/IezQDnh4-.gif",
  "https://cdn.nekotina.com/images/e3TC5JmC.gif",
  "https://cdn.nekotina.com/images/vHK7yl062.gif",
  "https://cdn.nekotina.com/images/xulua_zit.gif",
  "https://cdn.nekotina.com/images/MlqfhslY.gif",
  "https://cdn.nekotina.com/images/eMSdIiUz_.gif",
  "https://cdn.nekotina.com/images/rpQ9L5n-.gif",
  "https://cdn.nekotina.com/images/o5Pi9tsj-.gif",
  "https://cdn.nekotina.com/images/F5XOocrl.gif"
];

const spankGifs = [
  "https://cdn.nekotina.com/images/gOaYlAqT.gif",
  "https://cdn.nekotina.com/images/rs8Hdy2N.gif",
  "https://cdn.nekotina.com/images/CXMkuKKY.gif",
  "https://cdn.nekotina.com/images/B-YM2JJN.gif",
  "https://cdn.nekotina.com/images/3GmXaB3gj.gif",
  "https://cdn.nekotina.com/images/MDBUJ9f3.gif",
  "https://cdn.nekotina.com/images/M8HHs8WB.gif",
  "https://cdn.nekotina.com/images/6V7_EomK.gif",
  "https://cdn.nekotina.com/images/DhBVDfPxO.gif",
  "https://cdn.nekotina.com/images/EdFR_LN0.gif"
];

const likeGifs = [
  "https://cdn.nekotina.com/images/uiSeVqzc.gif",
  "https://cdn.nekotina.com/images/1rakIAOj.gif",
  "https://cdn.nekotina.com/images/iakOhlyIK.gif",
  "https://cdn.nekotina.com/images/QyO-YInZ.gif",
  "https://cdn.nekotina.com/images/A4vrZyYc.gif",
  "https://cdn.nekotina.com/images/Axy4eK3y.gif",
  "https://cdn.nekotina.com/images/RKRZibQ5.gif",
  "https://cdn.nekotina.com/images/1r1iOPA4.gif",
  "https://cdn.nekotina.com/images/0CoVKHI3.gif",
  "https://cdn.nekotina.com/images/Kdxb2W-8.gif"
];

const sleepGifs = [
  "https://cdn.nekotina.com/images/ADxGukGe.gif",
  "https://cdn.nekotina.com/images/LAmQZCmM.gif",
  "https://cdn.nekotina.com/images/vHepouzs.gif",
  "https://cdn.nekotina.com/images/Z8hlmzoqQ.gif",
  "https://cdn.nekotina.com/images/UurRuz8Z.gif",
  "https://cdn.nekotina.com/images/6056J7s7.gif",
  "https://cdn.nekotina.com/images/A14gLF0m.gif",
  "https://cdn.nekotina.com/images/XDxggvMe.gif",
  "https://cdn.nekotina.com/images/ZjNleRNW.gif",
  "https://cdn.nekotina.com/images/2NJW4dXN.gif"
];

const danceGifs = [
  "https://cdn.nekotina.com/images/5HGjmHo6.gif",
  "https://cdn.nekotina.com/images/Y1iTff3W.gif",
  "https://cdn.nekotina.com/images/pk-vpbQh.gif",
  "https://cdn.nekotina.com/images/n2CaTdz2.gif",
  "https://cdn.nekotina.com/images/cJOT73u7.gif",
  "https://cdn.nekotina.com/images/PqAjtHxDa.gif",
  "https://cdn.nekotina.com/images/wIBARQzm8.gif",
  "https://cdn.nekotina.com/images/lgUZaTiC.gif",
  "https://cdn.nekotina.com/images/6yzk_UJK.gif",
  "https://cdn.nekotina.com/images/qz7UaCmF.gif"
];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

function parseTime(timeStr) {
  if (!timeStr) return null;
  const match = /^(\d+)([smhd])$/.exec(timeStr);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * multipliers[unit];
}

function formatDuration(ms) {
  if (!ms || ms < 0) return "0s";
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);
  return parts.join(" ") || "0s";
}

const respondedButtons = new Map();
function wasResponded(messageId) {
  if (!messageId) return false;
  const ts = respondedButtons.get(messageId);
  if (!ts) return false;
  if (Date.now() - ts > 24 * 3600 * 1000) {
    respondedButtons.delete(messageId);
    return false;
  }
  return true;
}
function markResponded(messageId) {
  if (messageId) respondedButtons.set(messageId, Date.now());
}

let activeVoiceConnection = null;
let targetVoiceChannelId = null;
let targetVoiceGuildId = null;

async function joinVoicePersistent(channel) {
  if (!channel) return null;
  targetVoiceChannelId = channel.id;
  targetVoiceGuildId = channel.guild.id;
  if (activeVoiceConnection) {
    try { activeVoiceConnection.destroy(); } catch (e) {}
    activeVoiceConnection = null;
  }
  activeVoiceConnection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: true
  });
  console.log(`Conectado al canal de voz: ${channel.name} (${channel.guild.name})`);
  activeVoiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
    setTimeout(async () => {
      try { if (activeVoiceConnection) activeVoiceConnection.destroy(); } catch (e) {}
      activeVoiceConnection = null;
      if (targetVoiceChannelId) {
        try {
          const ch = await client.channels.fetch(targetVoiceChannelId).catch(() => null);
          if (ch && (ch.type === ChannelType.GuildVoice || ch.type === ChannelType.GuildStageVoice)) {
            console.log("Reconectando al canal de voz...");
            joinVoicePersistent(ch);
          } else {
            targetVoiceChannelId = null;
            targetVoiceGuildId = null;
          }
        } catch (e) {
          console.error("Error reconectando VC:", e);
          targetVoiceChannelId = null;
          targetVoiceGuildId = null;
        }
      }
    }, 5000);
  });
  return activeVoiceConnection;
}

async function leaveVoice() {
  targetVoiceChannelId = null;
  targetVoiceGuildId = null;
  if (activeVoiceConnection) {
    try { activeVoiceConnection.destroy(); } catch (e) {}
    activeVoiceConnection = null;
  }
}

async function buildBotInfoEmbed() {
  const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
  const totalCommands = slashCommands.length;
  const prefixCommands = slashCommands.length;
  const pingValue = (typeof client.ws.ping === "number" && client.ws.ping >= 0) ? client.ws.ping : 0;
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("Informacion del Bot")
    .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
    .addFields(
      { name: "Nombre", value: String(client.user.username), inline: true },
      { name: "ID", value: String(client.user.id), inline: true },
      { name: "Ping", value: `${pingValue}ms`, inline: true },
      { name: "Uptime", value: formatDuration(client.uptime), inline: true },
      { name: "Servidores", value: String(client.guilds.cache.size), inline: true },
      { name: "Miembros totales", value: String(totalMembers), inline: true },
      { name: "Comandos totales", value: String(totalCommands), inline: true },
      { name: "Comandos por prefijo", value: String(prefixCommands), inline: true },
      { name: "Prefijo", value: `\`${PREFIX}\``, inline: true }
    )
    .setFooter({ text: `Solicitado por ${client.user.username}` })
    .setTimestamp();
}

async function buildUserInfoEmbed(targetUser, guild) {
  if (!targetUser) return null;
  let fullUser = targetUser;
  try {
    fullUser = await client.users.fetch(targetUser.id, { force: true });
  } catch (e) {
    console.error("Error fetching user:", e);
  }
  let member = null;
  if (guild) {
    try {
      member = await guild.members.fetch(targetUser.id);
    } catch (e) {}
  }
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`Informacion de ${fullUser.username}`)
    .setThumbnail(fullUser.displayAvatarURL({ size: 1024 }));
  const fields = [
    { name: "Display Name", value: String(member?.displayName || fullUser.displayName || fullUser.username), inline: true },
    { name: "Username", value: String(fullUser.username), inline: true },
    { name: "ID", value: String(fullUser.id), inline: true }
  ];
  if (fullUser.createdTimestamp) {
    const ts = Math.floor(fullUser.createdTimestamp / 1000);
    fields.push({ name: "Cuenta creada", value: `<t:${ts}:F>\n(<t:${ts}:R>)`, inline: false });
  }
  if (member && member.joinedTimestamp) {
    const joinedTs = Math.floor(member.joinedTimestamp / 1000);
    fields.push({ name: "Entro al servidor", value: `<t:${joinedTs}:F>\n(<t:${joinedTs}:R>)`, inline: false });
    fields.push({ name: "Tiempo en el servidor", value: formatDuration(Date.now() - member.joinedTimestamp), inline: true });
    fields.push({ name: "Roles", value: String(Math.max(0, member.roles.cache.size - 1)), inline: true });
  }
  const avatarUrl = fullUser.displayAvatarURL({ size: 1024 });
  fields.push({ name: "Avatar", value: `[Ver avatar](${avatarUrl})`, inline: true });
  let bannerUrl = null;
  try {
    bannerUrl = fullUser.bannerURL({ size: 1024 });
  } catch (e) {}
  fields.push({ name: "Banner", value: bannerUrl ? `[Ver banner](${bannerUrl})` : "No tiene banner", inline: true });
  if (bannerUrl) embed.setImage(bannerUrl);
  embed.addFields(fields);
  return embed;
}

async function buildServerInfoEmbed(guild) {
  if (!guild) return null;
  let owner = null;
  try {
    owner = await guild.fetchOwner();
  } catch (e) {
    console.error("Error fetching owner:", e);
  }
  const iconUrl = guild.iconURL ? guild.iconURL({ size: 1024 }) : null;
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle(`Informacion de ${guild.name}`)
    .setThumbnail(iconUrl || client.user.displayAvatarURL())
    .addFields(
      { name: "ID del servidor", value: String(guild.id), inline: true },
      { name: "Dueno", value: owner ? `<@${owner.id}>` : `<@${guild.ownerId}>`, inline: true },
      { name: "Creacion", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
      { name: "Miembros", value: String(guild.memberCount || 0), inline: true },
      { name: "Canales", value: String(guild.channels?.cache?.size || 0), inline: true },
      { name: "Emojis", value: String(guild.emojis?.cache?.size || 0), inline: true },
      { name: "Boosts", value: String(guild.premiumSubscriptionCount || 0), inline: true },
      { name: "Roles", value: String(guild.roles?.cache?.size || 0), inline: true }
    )
    .setFooter({ text: String(guild.name) })
    .setTimestamp();
}

async function executeKiss(target, sender) {
  if (!target || !sender) return { content: "Falta un usuario." };
  if (target.id === sender.id) return { content: "No puedes besarte a ti mismo!" };
  if (target.bot) return { content: "No puedes besar a un bot." };
  const phrases = [`${sender} besa con pasion a ${target}`, `${sender} besa a ${target}`];
  const embed = new EmbedBuilder().setColor(0xFF69B4).setDescription(randomFrom(phrases)).setImage(randomFrom(kissGifs));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`kiss_corresponder_${target.id}_${sender.id}`).setLabel("Corresponder").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`kiss_rechazar_${target.id}_${sender.id}`).setLabel("Rechazar").setStyle(ButtonStyle.Danger)
  );
  return { embeds: [embed], components: [row] };
}

async function executeThug(target, sender) {
  if (!target || !sender) return { content: "Falta un usuario." };
  if (target.id === sender.id) return { content: "No puedes abrazarte a ti mismo!" };
  if (target.bot) return { content: "No puedes abrazar a un bot." };
  const embed = new EmbedBuilder().setColor(0xFF69B4).setDescription(`${sender} abraza a ${target}`).setImage(randomFrom(hugGifs));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`thug_volver_${target.id}_${sender.id}`).setLabel("Abrazar de vuelta").setStyle(ButtonStyle.Primary)
  );
  return { embeds: [embed], components: [row] };
}

async function executeFly(sender) {
  if (!sender) return { content: "Error: usuario no valido." };
  const embed = new EmbedBuilder().setColor(0x87CEEB).setDescription(`${sender} esta volando.`).setImage(randomFrom(flyGifs));
  return { embeds: [embed] };
}

async function executeSpank(target, sender) {
  if (!target || !sender) return { content: "Falta un usuario." };
  if (target.id === sender.id) return { content: "No puedes nalguearte a ti mismo!" };
  if (target.bot) return { content: "No puedes nalguear a un bot." };
  const phrases = [`${sender} nalguea el trasero de ${target}`, `${sender} nalguea a ${target}`];
  const embed = new EmbedBuilder().setColor(0xFF4500).setDescription(randomFrom(phrases)).setImage(randomFrom(spankGifs));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`spank_golpear_${target.id}_${sender.id}`).setLabel("Golpear").setStyle(ButtonStyle.Danger)
  );
  return { embeds: [embed], components: [row] };
}

async function executePunch(target, sender) {
  if (!target || !sender) return { content: "Falta un usuario." };
  if (target.id === sender.id) return { content: "No puedes golpearte a ti mismo!" };
  if (target.bot) return { content: "No puedes golpear a un bot." };
  const embed = new EmbedBuilder().setColor(0xFF4500).setDescription(`${sender} golpea a ${target}!`).setImage(randomFrom(rejectGifs));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`punch_volver_${target.id}_${sender.id}`).setLabel("Golpear de vuelta!").setStyle(ButtonStyle.Danger)
  );
  return { embeds: [embed], components: [row] };
}

async function executeLike(sender) {
  if (!sender) return { content: "Error: usuario no valido." };
  const embed = new EmbedBuilder().setColor(0xFFD700).setDescription(`${sender} lo aprueba!\nA ${sender} le gusta esto.`).setImage(randomFrom(likeGifs));
  return { embeds: [embed] };
}

async function executeSleep(sender) {
  if (!sender) return { content: "Error: usuario no valido." };
  const embed = new EmbedBuilder().setColor(0x6A5ACD).setDescription(`${sender} esta durmiendo..`).setImage(randomFrom(sleepGifs));
  return { embeds: [embed] };
}

async function executeDance(sender) {
  if (!sender) return { content: "Error: usuario no valido." };
  const embed = new EmbedBuilder().setColor(0xFF1493).setDescription(`${sender} esta bailando..`).setImage(randomFrom(danceGifs));
  return { embeds: [embed] };
}

async function registrarComandosGlobales() {
  try {
    console.log("Obteniendo informacion de la aplicacion...");
    await client.application.fetch();
    console.log("Registrando comandos slash globales...");
    await client.application.commands.set(slashCommands);
    console.log(`${slashCommands.length} comandos slash registrados globalmente.`);
  } catch (error) {
    console.error("Error registrando comandos slash:", error);
  }
}

client.once("ready", async () => {
  try {
    console.log(`Bot conectado como ${client.user.tag}`);
    console.log(`Servidores: ${client.guilds.cache.size}`);
    console.log(`Miembros totales: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`);
    await registrarComandosGlobales();
  } catch (e) {
    console.error("Error en ready:", e);
  }
});

client.on("guildCreate", async (guild) => {
  console.log(`Anadido a nuevo servidor: ${guild.name} (${guild.id})`);
});

client.on("messageCreate", async message => {
  try {
    if (!message || !message.author || message.author.bot || !message.guild) return;
    if (!message.content || typeof message.content !== "string") return;
    if (!message.content.toLowerCase().startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    const getTarget = async () => {
      try {
        let user = message.mentions?.users?.first();
        if (user) return user;
        if (message.reference?.messageId) {
          const refMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
          if (refMsg) return refMsg.author;
        }
      } catch (e) {
        console.error("Error en getTarget:", e);
      }
      return null;
    };

    if (command === "botinfo") {
      const embed = await buildBotInfoEmbed();
      return message.reply({ embeds: [embed] }).catch(e => console.error("reply error:", e));
    }
    if (command === "userinfo") {
      const target = await getTarget() || message.author;
      const embed = await buildUserInfoEmbed(target, message.guild);
      if (!embed) return message.reply("No se pudo construir la informacion del usuario.");
      return message.reply({ embeds: [embed] }).catch(e => console.error("reply error:", e));
    }
    if (command === "serverinfo") {
      const embed = await buildServerInfoEmbed(message.guild);
      if (!embed) return message.reply("No se pudo construir la informacion del servidor.");
      return message.reply({ embeds: [embed] }).catch(e => console.error("reply error:", e));
    }
    if (command === "kick") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.KickMembers)) return message.reply("No tienes permiso para expulsar usuarios.");
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. Uso: tkick @user");
      const reason = args.filter(a => !a.startsWith("<@") && !a.startsWith("<#")).join(" ") || "Sin razon";
      const member = await message.guild.members.fetch(target.id).catch(() => null);
      if (!member) return message.reply("El usuario no esta en el servidor.");
      if (!member.kickable) return message.reply("No puedo expulsar a ese usuario (rol superior o permisos insuficientes).");
      await member.kick(reason);
      const embed = new EmbedBuilder().setColor(0xFF0000).setTitle("Usuario expulsado")
        .addFields(
          { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
          { name: "Razon", value: String(reason), inline: false },
          { name: "Moderador", value: `${message.author.tag}`, inline: false }
        ).setThumbnail(target.displayAvatarURL()).setTimestamp();
      return message.reply({ embeds: [embed] }).catch(e => console.error("reply error:", e));
    }
    if (command === "ban") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.BanMembers)) return message.reply("No tienes permiso para banear usuarios.");
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. Uso: tban @user [razon]");
      const reason = args.filter(a => !a.startsWith("<@") && !a.startsWith("<#")).join(" ") || "Sin razon";
      const member = await message.guild.members.fetch(target.id).catch(() => null);
      if (member && !member.bannable) return message.reply("No puedo banear a ese usuario (rol superior al mio).");
      await message.guild.members.ban(target.id, { reason });
      const embed = new EmbedBuilder().setColor(0x8B0000).setTitle("Usuario baneado")
        .addFields(
          { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
          { name: "Razon", value: String(reason), inline: false },
          { name: "Moderador", value: `${message.author.tag}`, inline: false }
        ).setThumbnail(target.displayAvatarURL()).setTimestamp();
      return message.reply({ embeds: [embed] }).catch(e => console.error("reply error:", e));
    }
    if (command === "mute") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) return message.reply("No tienes permiso para mutear usuarios.");
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. Uso: tmute 10s @user [razon]");
      let timeArg = null;
      for (const a of args) { if (/^\d+[smhd]$/.test(a)) { timeArg = a; break; } }
      if (!timeArg) return message.reply("Debes especificar el tiempo. Ej: 10s, 5m, 2h, 1d");
      const ms = parseTime(timeArg);
      if (!ms) return message.reply("Formato de tiempo invalido. Usa: 10s, 5m, 2h, 1d");
      if (ms > 28 * 86400000) return message.reply("El tiempo maximo de aislamiento es 28 dias.");
      const reason = args.filter(a => !a.startsWith("<@") && !a.startsWith("<#") && !/^\d+[smhd]$/.test(a)).join(" ") || "Sin razon";
      const member = await message.guild.members.fetch(target.id).catch(() => null);
      if (!member) return message.reply("El usuario no esta en el servidor.");
      if (!member.moderatable) return message.reply("No puedo mutear a ese usuario (rol superior al mio).");
      await member.timeout(ms, reason);
      const embed = new EmbedBuilder().setColor(0xFFA500).setTitle("Usuario muteado")
        .addFields(
          { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
          { name: "Tiempo", value: String(timeArg), inline: true },
          { name: "Razon", value: String(reason), inline: false },
          { name: "Moderador", value: `${message.author.tag}`, inline: false }
        ).setThumbnail(target.displayAvatarURL()).setTimestamp();
      return message.reply({ embeds: [embed] }).catch(e => console.error("reply error:", e));
    }
    if (command === "hardban") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.BanMembers)) return message.reply("No tienes permiso para banear usuarios.");
      const input = args[0];
      if (!input) return message.reply("Uso: thardban <id o nombre de usuario> [razon]");
      const reason = args.slice(1).join(" ") || "Sin razon";
      let targetUser = null;
      if (/^\d+$/.test(input)) {
        targetUser = await client.users.fetch(input).catch(() => null);
      } else {
        const members = await message.guild.members.search({ query: input, limit: 5 }).catch(() => null);
        if (members && members.size > 0) {
          const exact = members.find(m => m.user.username.toLowerCase() === input.toLowerCase() || m.displayName.toLowerCase() === input.toLowerCase());
          targetUser = (exact || members.first()).user;
        }
      }
      if (!targetUser) return message.reply("No se encontro al usuario. Usa un ID valido (recomendado) o un nombre de usuario exacto.");
      await message.guild.members.ban(targetUser.id, { reason });
      const embed = new EmbedBuilder().setColor(0x4B0082).setTitle("Hardban aplicado")
        .addFields(
          { name: "Usuario", value: `${targetUser.tag} (${targetUser.id})`, inline: false },
          { name: "Razon", value: String(reason), inline: false },
          { name: "Moderador", value: `${message.author.tag}`, inline: false }
        ).setThumbnail(targetUser.displayAvatarURL()).setTimestamp();
      return message.reply({ embeds: [embed] }).catch(e => console.error("reply error:", e));
    }
    if (command === "kiss") {
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. Uso: tkiss @user");
      const payload = await executeKiss(target, message.author);
      return message.reply(payload).catch(e => console.error("reply error:", e));
    }
    if (command === "thug") {
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. Uso: tthug @user");
      const payload = await executeThug(target, message.author);
      return message.reply(payload).catch(e => console.error("reply error:", e));
    }
    if (command === "voicejoin" || command === "voice-join") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.Administrator)) return message.reply("Solo los administradores pueden usar este comando.");
      const stopArg = args.find(a => {
        const lower = a.toLowerCase();
        return lower === "stop:true" || lower === "true" || lower === "stop";
      });
      if (stopArg) { await leaveVoice(); return message.reply("Sali del canal de voz."); }
      let channel = message.mentions?.channels?.first();
      if (!channel && message.member?.voice?.channel) channel = message.member.voice.channel;
      if (!channel || (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice)) return message.reply("Menciona un canal de voz o unete a uno primero. Uso: tvoicejoin #canal");
      await joinVoicePersistent(channel);
      return message.reply(`Conectado al canal de voz **${channel.name}**. Me quedare hasta que uses tvoicejoin stop.`);
    }
    if (command === "fly") {
      const payload = await executeFly(message.author);
      return message.reply(payload).catch(e => console.error("reply error:", e));
    }
    if (command === "spank") {
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. Uso: tspank @user");
      const payload = await executeSpank(target, message.author);
      return message.reply(payload).catch(e => console.error("reply error:", e));
    }
    if (command === "punch") {
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. Uso: tpunch @user");
      const payload = await executePunch(target, message.author);
      return message.reply(payload).catch(e => console.error("reply error:", e));
    }
    if (command === "like") {
      const payload = await executeLike(message.author);
      return message.reply(payload).catch(e => console.error("reply error:", e));
    }
    if (command === "sleep") {
      const payload = await executeSleep(message.author);
      return message.reply(payload).catch(e => console.error("reply error:", e));
    }
    if (command === "dance") {
      const payload = await executeDance(message.author);
      return message.reply(payload).catch(e => console.error("reply error:", e));
    }
    if (command === "botsay" || command === "bot-say") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return message.reply("No tienes permiso para usar este comando (necesitas Gestionar Servidor).");
      const msg = args.join(" ");
      if (!msg && message.attachments.size === 0) return message.reply("Debes escribir un mensaje o adjuntar un archivo. Uso: tbotsay <mensaje>");
      const payload = { content: msg || "" };
      if (message.attachments.size > 0) {
        payload.files = message.attachments.map(a => ({ attachment: a.url, name: a.name }));
      }
      await message.channel.send(payload).catch(e => console.error("send error:", e));
      try { await message.delete(); } catch (e) {}
      return;
    }
  } catch (error) {
    console.error("Error en messageCreate:", error);
    if (error.code === 50013) return message.reply("No tengo permisos para hacer eso en este canal/servidor.").catch(() => {});
    if (error.code === 50007) return message.reply("No puedo enviar mensajes a ese usuario (tiene DMs cerrados).").catch(() => {});
    message.reply("Ocurrio un error al ejecutar el comando.").catch(() => {});
  }
});

client.on("interactionCreate", async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = interaction.commandName;

      if (cmd === "botinfo") {
        await interaction.deferReply();
        const embed = await buildBotInfoEmbed();
        return interaction.editReply({ embeds: [embed] }).catch(e => console.error("editReply error:", e));
      }
      if (cmd === "userinfo") {
        await interaction.deferReply();
        const target = interaction.options.getUser("usuario") || interaction.user;
        const embed = await buildUserInfoEmbed(target, interaction.guild);
        if (!embed) return interaction.editReply({ content: "No se pudo construir la informacion." });
        return interaction.editReply({ embeds: [embed] }).catch(e => console.error("editReply error:", e));
      }
      if (cmd === "server-info") {
        await interaction.deferReply();
        const embed = await buildServerInfoEmbed(interaction.guild);
        if (!embed) return interaction.editReply({ content: "No se pudo construir la informacion." });
        return interaction.editReply({ embeds: [embed] }).catch(e => console.error("editReply error:", e));
      }
      if (cmd === "kick") {
        await interaction.deferReply();
        const target = interaction.options.getUser("usuario");
        const reason = interaction.options.getString("razon") || "Sin razon";
        if (!target) return interaction.editReply({ content: "Usuario no valido." });
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) return interaction.editReply({ content: "El usuario no esta en el servidor." });
        if (!member.kickable) return interaction.editReply({ content: "No puedo expulsar a ese usuario." });
        await member.kick(reason);
        const embed = new EmbedBuilder().setColor(0xFF0000).setTitle("Usuario expulsado")
          .addFields(
            { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
            { name: "Razon", value: String(reason), inline: false },
            { name: "Moderador", value: `${interaction.user.tag}`, inline: false }
          ).setThumbnail(target.displayAvatarURL()).setTimestamp();
        return interaction.editReply({ embeds: [embed] }).catch(e => console.error("editReply error:", e));
      }
      if (cmd === "ban") {
        await interaction.deferReply();
        const target = interaction.options.getUser("usuario");
        const reason = interaction.options.getString("razon") || "Sin razon";
        if (!target) return interaction.editReply({ content: "Usuario no valido." });
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (member && !member.bannable) return interaction.editReply({ content: "No puedo banear a ese usuario." });
        await interaction.guild.members.ban(target.id, { reason });
        const embed = new EmbedBuilder().setColor(0x8B0000).setTitle("Usuario baneado")
          .addFields(
            { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
            { name: "Razon", value: String(reason), inline: false },
            { name: "Moderador", value: `${interaction.user.tag}`, inline: false }
          ).setThumbnail(target.displayAvatarURL()).setTimestamp();
        return interaction.editReply({ embeds: [embed] }).catch(e => console.error("editReply error:", e));
      }
      if (cmd === "mute") {
        await interaction.deferReply();
        const target = interaction.options.getUser("usuario");
        const timeStr = interaction.options.getString("tiempo");
        const reason = interaction.options.getString("razon") || "Sin razon";
        if (!target) return interaction.editReply({ content: "Usuario no valido." });
        const ms = parseTime(timeStr);
        if (!ms) return interaction.editReply({ content: "Formato de tiempo invalido. Usa: 10s, 5m, 2h, 1d" });
        if (ms > 28 * 86400000) return interaction.editReply({ content: "El tiempo maximo es 28 dias." });
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) return interaction.editReply({ content: "El usuario no esta en el servidor." });
        if (!member.moderatable) return interaction.editReply({ content: "No puedo mutear a ese usuario." });
        await member.timeout(ms, reason);
        const embed = new EmbedBuilder().setColor(0xFFA500).setTitle("Usuario muteado")
          .addFields(
            { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
            { name: "Tiempo", value: String(timeStr), inline: true },
            { name: "Razon", value: String(reason), inline: false },
            { name: "Moderador", value: `${interaction.user.tag}`, inline: false }
          ).setThumbnail(target.displayAvatarURL()).setTimestamp();
        return interaction.editReply({ embeds: [embed] }).catch(e => console.error("editReply error:", e));
      }
      if (cmd === "hardban") {
        await interaction.deferReply();
        const input = interaction.options.getString("usuario");
        const reason = interaction.options.getString("razon") || "Sin razon";
        let targetUser = null;
        if (/^\d+$/.test(input)) {
          targetUser = await client.users.fetch(input).catch(() => null);
        } else {
          const members = await interaction.guild.members.search({ query: input, limit: 5 }).catch(() => null);
          if (members && members.size > 0) {
            const exact = members.find(m => m.user.username.toLowerCase() === input.toLowerCase() || m.displayName.toLowerCase() === input.toLowerCase());
            targetUser = (exact || members.first()).user;
          }
        }
        if (!targetUser) return interaction.editReply({ content: "Usuario no encontrado." });
        await interaction.guild.members.ban(targetUser.id, { reason });
        const embed = new EmbedBuilder().setColor(0x4B0082).setTitle("Hardban aplicado")
          .addFields(
            { name: "Usuario", value: `${targetUser.tag} (${targetUser.id})`, inline: false },
            { name: "Razon", value: String(reason), inline: false },
            { name: "Moderador", value: `${interaction.user.tag}`, inline: false }
          ).setThumbnail(targetUser.displayAvatarURL()).setTimestamp();
        return interaction.editReply({ embeds: [embed] }).catch(e => console.error("editReply error:", e));
      }
      if (cmd === "kiss") {
        const target = interaction.options.getUser("usuario");
        if (!target) return interaction.reply({ content: "Usuario no valido.", ephemeral: true });
        const payload = await executeKiss(target, interaction.user);
        return interaction.reply(payload).catch(e => console.error("reply error:", e));
      }
      if (cmd === "thug") {
        const target = interaction.options.getUser("usuario");
        if (!target) return interaction.reply({ content: "Usuario no valido.", ephemeral: true });
        const payload = await executeThug(target, interaction.user);
        return interaction.reply(payload).catch(e => console.error("reply error:", e));
      }
      if (cmd === "voice-join") {
        await interaction.deferReply();
        const stop = interaction.options.getBoolean("stop");
        if (stop) {
          await leaveVoice();
          return interaction.editReply({ content: "Sali del canal de voz." });
        }
        let channel = interaction.options.getChannel("canal");
        if (!channel && interaction.member?.voice?.channel) channel = interaction.member.voice.channel;
        if (!channel || (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice)) return interaction.editReply({ content: "Menciona un canal de voz o unete a uno primero." });
        await joinVoicePersistent(channel);
        return interaction.editReply({ content: `Conectado a **${channel.name}**. Me quedare hasta que uses /voice-join stop: true.` });
      }
      if (cmd === "fly") {
        const payload = await executeFly(interaction.user);
        return interaction.reply(payload).catch(e => console.error("reply error:", e));
      }
      if (cmd === "spank") {
        const target = interaction.options.getUser("usuario");
        if (!target) return interaction.reply({ content: "Usuario no valido.", ephemeral: true });
        const payload = await executeSpank(target, interaction.user);
        return interaction.reply(payload).catch(e => console.error("reply error:", e));
      }
      if (cmd === "punch") {
        const target = interaction.options.getUser("usuario");
        if (!target) return interaction.reply({ content: "Usuario no valido.", ephemeral: true });
        const payload = await executePunch(target, interaction.user);
        return interaction.reply(payload).catch(e => console.error("reply error:", e));
      }
      if (cmd === "like") {
        const payload = await executeLike(interaction.user);
        return interaction.reply(payload).catch(e => console.error("reply error:", e));
      }
      if (cmd === "sleep") {
        const payload = await executeSleep(interaction.user);
        return interaction.reply(payload).catch(e => console.error("reply error:", e));
      }
      if (cmd === "dance") {
        const payload = await executeDance(interaction.user);
        return interaction.reply(payload).catch(e => console.error("reply error:", e));
      }
      if (cmd === "bot-say") {
        await interaction.deferReply({ ephemeral: true });
        const msg = interaction.options.getString("mensaje");
        const attachment = interaction.options.getAttachment("file");
        const payload = { content: String(msg || "") };
        if (attachment) {
          payload.files = [{ attachment: attachment.url, name: attachment.name }];
        }
        try {
          await interaction.channel.send(payload);
          return interaction.editReply({ content: "Mensaje enviado de forma anonima." });
        } catch (e) {
          console.error("bot-say send error:", e);
          return interaction.editReply({ content: "Error al enviar el mensaje: " + e.message });
        }
      }

      return interaction.reply({ content: "Comando no reconocido.", ephemeral: true }).catch(() => {});
    }

    if (interaction.isButton()) {
      const id = interaction.customId || "";

      if (id.startsWith("kiss_corresponder_")) {
        const parts = id.split("_");
        const targetId = parts[2];
        const senderId = parts[3];

        if (interaction.user.id !== targetId) {
          return interaction.reply({ content: "Solo el usuario besado puede usar este boton.", ephemeral: true }).catch(() => {});
        }
        if (wasResponded(interaction.message?.id)) {
          return interaction.reply({ content: "Este mensaje ya fue respondido.", ephemeral: true }).catch(() => {});
        }
        markResponded(interaction.message?.id);

        const sender = await client.users.fetch(senderId).catch(() => null);
        const target = interaction.user;

        if (interaction.message?.components?.[0]) {
          const oldRow = ActionRowBuilder.from(interaction.message.components[0]);
          oldRow.components.forEach(c => c.setDisabled(true));
          await interaction.update({ components: [oldRow] }).catch(e => console.error("update error:", e));
        } else {
          await interaction.deferUpdate().catch(() => {});
        }

        const embed = new EmbedBuilder().setColor(0xFF69B4).setDescription(`${target} besa de vuelta a ${sender}`).setImage(randomFrom(kissGifs));
        return interaction.followUp({ embeds: [embed] }).catch(e => console.error("followUp error:", e));
      }

      if (id.startsWith("kiss_rechazar_")) {
        const parts = id.split("_");
        const targetId = parts[2];
        const senderId = parts[3];

        if (interaction.user.id !== targetId) {
          return interaction.reply({ content: "Solo el usuario besado puede usar este boton.", ephemeral: true }).catch(() => {});
        }
        if (wasResponded(interaction.message?.id)) {
          return interaction.reply({ content: "Este mensaje ya fue respondido.", ephemeral: true }).catch(() => {});
        }
        markResponded(interaction.message?.id);

        const sender = await client.users.fetch(senderId).catch(() => null);
        const target = interaction.user;

        if (interaction.message?.components?.[0]) {
          const oldRow = ActionRowBuilder.from(interaction.message.components[0]);
          oldRow.components.forEach(c => c.setDisabled(true));
          await interaction.update({ components: [oldRow] }).catch(e => console.error("update error:", e));
        } else {
          await interaction.deferUpdate().catch(() => {});
        }

        const embed = new EmbedBuilder().setColor(0x808080).setDescription(`${target} rechaza el beso de ${sender}`).setImage(randomFrom(rejectGifs));
        return interaction.followUp({ embeds: [embed] }).catch(e => console.error("followUp error:", e));
      }

      if (id.startsWith("thug_volver_")) {
        const parts = id.split("_");
        const targetId = parts[2];
        const senderId = parts[3];

        if (interaction.user.id !== targetId) {
          return interaction.reply({ content: "Solo el usuario abrazado puede usar este boton.", ephemeral: true }).catch(() => {});
        }
        if (wasResponded(interaction.message?.id)) {
          return interaction.reply({ content: "Este mensaje ya fue respondido.", ephemeral: true }).catch(() => {});
        }
        markResponded(interaction.message?.id);

        const sender = await client.users.fetch(senderId).catch(() => null);
        const target = interaction.user;

        if (interaction.message?.components?.[0]) {
          const oldRow = ActionRowBuilder.from(interaction.message.components[0]);
          oldRow.components.forEach(c => c.setDisabled(true));
          await interaction.update({ components: [oldRow] }).catch(e => console.error("update error:", e));
        } else {
          await interaction.deferUpdate().catch(() => {});
        }

        const embed = new EmbedBuilder().setColor(0xFF69B4).setDescription(`${target} abraza de vuelta a ${sender}`).setImage(randomFrom(hugGifs));
        return interaction.followUp({ embeds: [embed] }).catch(e => console.error("followUp error:", e));
      }

      if (id.startsWith("spank_golpear_")) {
        const parts = id.split("_");
        const targetId = parts[2];
        const senderId = parts[3];

        if (interaction.user.id !== targetId) {
          return interaction.reply({ content: "Solo el usuario nalgueado puede usar este boton.", ephemeral: true }).catch(() => {});
        }
        if (wasResponded(interaction.message?.id)) {
          return interaction.reply({ content: "Este mensaje ya fue respondido.", ephemeral: true }).catch(() => {});
        }
        markResponded(interaction.message?.id);

        const sender = await client.users.fetch(senderId).catch(() => null);
        const target = interaction.user;

        if (interaction.message?.components?.[0]) {
          const oldRow = ActionRowBuilder.from(interaction.message.components[0]);
          oldRow.components.forEach(c => c.setDisabled(true));
          await interaction.update({ components: [oldRow] }).catch(e => console.error("update error:", e));
        } else {
          await interaction.deferUpdate().catch(() => {});
        }

        const embed = new EmbedBuilder().setColor(0xFF4500).setDescription(`${target} golpea a ${sender}`).setImage(randomFrom(rejectGifs));
        return interaction.followUp({ embeds: [embed] }).catch(e => console.error("followUp error:", e));
      }

      if (id.startsWith("punch_volver_")) {
        const parts = id.split("_");
        const targetId = parts[2];
        const senderId = parts[3];

        if (interaction.user.id !== targetId) {
          return interaction.reply({ content: "Solo el usuario golpeado puede usar este boton.", ephemeral: true }).catch(() => {});
        }
        if (wasResponded(interaction.message?.id)) {
          return interaction.reply({ content: "Este mensaje ya fue respondido.", ephemeral: true }).catch(() => {});
        }
        markResponded(interaction.message?.id);

        const sender = await client.users.fetch(senderId).catch(() => null);
        const target = interaction.user;

        if (interaction.message?.components?.[0]) {
          const oldRow = ActionRowBuilder.from(interaction.message.components[0]);
          oldRow.components.forEach(c => c.setDisabled(true));
          await interaction.update({ components: [oldRow] }).catch(e => console.error("update error:", e));
        } else {
          await interaction.deferUpdate().catch(() => {});
        }

        const embed = new EmbedBuilder().setColor(0xFF4500).setDescription(`${target} golpea de vuelta a ${sender}`).setImage(randomFrom(rejectGifs));
        return interaction.followUp({ embeds: [embed] }).catch(e => console.error("followUp error:", e));
      }
    }
  } catch (error) {
    console.error("Error en interactionCreate:", error);
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: "Ocurrio un error: " + (error.message || "desconocido"), ephemeral: true });
      } else {
        await interaction.reply({ content: "Ocurrio un error: " + (error.message || "desconocido"), ephemeral: true });
      }
    } catch (e) {}
  }
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

client.login(TOKEN);
