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
  new SlashCommandBuilder().setName("botinfo").setDescription("Muestra toda la informaciÃ³n del bot"),
  new SlashCommandBuilder().setName("userinfo").setDescription("Muestra informaciÃ³n de un usuario").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a consultar").setRequired(false)),
  new SlashCommandBuilder().setName("server-info").setDescription("Muestra toda la informaciÃ³n del servidor"),
  new SlashCommandBuilder().setName("kick").setDescription("Expulsa a un usuario del servidor").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a expulsar").setRequired(true)).addStringOption(opt => opt.setName("razon").setDescription("RazÃ³n de la expulsiÃ³n").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder().setName("ban").setDescription("Banea a un usuario del servidor").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a banear").setRequired(true)).addStringOption(opt => opt.setName("razon").setDescription("RazÃ³n del ban").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName("mute").setDescription("AÃ­sla temporalmente a un usuario (timeout)").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a mutear").setRequired(true)).addStringOption(opt => opt.setName("tiempo").setDescription("Tiempo: 10s, 5m, 2h, 1d").setRequired(true)).addStringOption(opt => opt.setName("razon").setDescription("RazÃ³n del muteo").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName("hardban").setDescription("Banea a un usuario por ID o nombre (no necesita estar en el servidor)").addStringOption(opt => opt.setName("usuario").setDescription("ID o nombre de usuario").setRequired(true)).addStringOption(opt => opt.setName("razon").setDescription("RazÃ³n del ban").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName("kiss").setDescription("Besa a un usuario").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a besar").setRequired(true)),
  new SlashCommandBuilder().setName("thug").setDescription("Abraza a un usuario").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a abrazar").setRequired(true)),
  new SlashCommandBuilder().setName("voice-join").setDescription("El bot se une a un canal de voz (administrador)").addChannelOption(opt => opt.setName("canal").setDescription("Canal de voz al que unirse").addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice).setRequired(false)).addBooleanOption(opt => opt.setName("stop").setDescription("true para sacar al bot del canal de voz").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName("fly").setDescription("EstÃ¡s volando"),
  new SlashCommandBuilder().setName("spank").setDescription("Nalguea a un usuario").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a nalguear").setRequired(true)),
  new SlashCommandBuilder().setName("punch").setDescription("Golpea a un usuario").addUserOption(opt => opt.setName("usuario").setDescription("Usuario a golpear").setRequired(true)),
  new SlashCommandBuilder().setName("like").setDescription("Apruebas algo"),
  new SlashCommandBuilder().setName("sleep").setDescription("EstÃ¡s durmiendo"),
  new SlashCommandBuilder().setName("dance").setDescription("EstÃ¡s bailando"),
  new SlashCommandBuilder().setName("bot-say").setDescription("EnvÃ­a un mensaje anÃ³nimo como el bot").addStringOption(opt => opt.setName("mensaje").setDescription("Mensaje a enviar").setRequired(true)).addAttachmentOption(opt => opt.setName("file").setDescription("Archivo adjunto opcional").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
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
  if (ms < 0) return "0s";
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
  const ts = respondedButtons.get(messageId);
  if (!ts) return false;
  if (Date.now() - ts > 24 * 3600 * 1000) {
    respondedButtons.delete(messageId);
    return false;
  }
  return true;
}
function markResponded(messageId) {
  respondedButtons.set(messageId, Date.now());
}

let activeVoiceConnection = null;
let targetVoiceChannelId = null;
let targetVoiceGuildId = null;

async function joinVoicePersistent(channel) {
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
  console.log(`ðŸ”Š Conectado al canal de voz: ${channel.name} (${channel.guild.name})`);
  activeVoiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
    setTimeout(async () => {
      try { if (activeVoiceConnection) activeVoiceConnection.destroy(); } catch (e) {}
      activeVoiceConnection = null;
      if (targetVoiceChannelId) {
        try {
          const ch = await client.channels.fetch(targetVoiceChannelId).catch(() => null);
          if (ch && (ch.type === ChannelType.GuildVoice || ch.type === ChannelType.GuildStageVoice)) {
            console.log("ðŸ” Reconectando al canal de voz...");
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
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`InformaciÃ³n del Bot`)
    .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
    .addFields(
      { name: "Nombre", value: client.user.username, inline: true },
      { name: "ID", value: client.user.id, inline: true },
      { name: "Ping", value: `${client.ws.ping}ms`, inline: true },
      { name: "Uptime", value: formatDuration(client.uptime), inline: true },
      { name: "Servidores", value: `${client.guilds.cache.size}`, inline: true },
      { name: "Miembros totales", value: `${totalMembers}`, inline: true },
      { name: "Comandos totales", value: `${totalCommands}`, inline: true },
      { name: "Comandos por prefijo", value: `${prefixCommands}`, inline: true },
      { name: "Prefijo", value: `\`${PREFIX}\``, inline: true }
    )
    .setFooter({ text: `Solicitado por ${client.user.username}` })
    .setTimestamp();
}

async function buildUserInfoEmbed(targetUser, guild) {
  const fullUser = await client.users.fetch(targetUser.id, { force: true }).catch(() => targetUser);
  const member = await guild.members.fetch(targetUser.id).catch(() => null);
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`InformaciÃ³n de ${fullUser.username}`)
    .setThumbnail(fullUser.displayAvatarURL({ size: 1024 }));
  const fields = [
    { name: "Display Name", value: member?.displayName || fullUser.displayName || fullUser.username, inline: true },
    { name: "Username", value: fullUser.username, inline: true },
    { name: "ID", value: fullUser.id, inline: true },
    { name: "Cuenta creada", value: `<t:${Math.floor(fullUser.createdTimestamp / 1000)}:F>\n(<t:${Math.floor(fullUser.createdTimestamp / 1000)}:R>)`, inline: false }
  ];
  if (member) {
    const joinedTs = Math.floor(member.joinedTimestamp / 1000);
    fields.push({ name: "EntrÃ³ al servidor", value: `<t:${joinedTs}:F>\n(<t:${joinedTs}:R>)`, inline: false });
    fields.push({ name: "Tiempo en el servidor", value: formatDuration(Date.now() - member.joinedTimestamp), inline: true });
    fields.push({ name: "Roles", value: `${Math.max(0, member.roles.cache.size - 1)}`, inline: true });
  }
  const bannerUrl = fullUser.bannerURL({ size: 1024 });
  fields.push({ name: "Avatar", value: `[Ver avatar](${fullUser.displayAvatarURL({ size: 1024 })})`, inline: true });
  fields.push({ name: "Banner", value: bannerUrl ? `[Ver banner](${bannerUrl})` : "No tiene banner", inline: true });
  if (bannerUrl) embed.setImage(bannerUrl);
  embed.addFields(fields);
  return embed;
}

async function buildServerInfoEmbed(guild) {
  const owner = await guild.fetchOwner().catch(() => null);
  const iconUrl = guild.iconURL({ size: 1024 });
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle(`InformaciÃ³n de ${guild.name}`)
    .setThumbnail(iconUrl || client.user.displayAvatarURL())
    .addFields(
      { name: "ID del servidor", value: guild.id, inline: true },
      { name: "DueÃ±o", value: owner ? `<@${owner.id}>` : `<@${guild.ownerId}>`, inline: true },
      { name: "CreaciÃ³n", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
      { name: "Miembros", value: `${guild.memberCount}`, inline: true },
      { name: "Canales", value: `${guild.channels.cache.size}`, inline: true },
      { name: "Emojis", value: `${guild.emojis.cache.size}`, inline: true },
      { name: "Boosts", value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
      { name: "Roles", value: `${guild.roles.cache.size}`, inline: true }
    )
    .setFooter({ text: guild.name })
    .setTimestamp();
}

async function executeKiss(target, sender) {
  if (target.id === sender.id) return { content: "Â¡No puedes besarte a ti mismo! ðŸ˜…" };
  if (target.bot) return { content: "No puedes besar a un bot... ðŸ¤–" };
  const phrases = [`${sender} besa con pasiÃ³n a ${target}`, `${sender} besa a ${target}`];
  const embed = new EmbedBuilder().setColor(0xFF69B4).setDescription(randomFrom(phrases)).setImage(randomFrom(kissGifs));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`kiss_corresponder_${target.id}_${sender.id}`).setLabel("Corresponder").setEmoji("ðŸ’•").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`kiss_rechazar_${target.id}_${sender.id}`).setLabel("Rechazar").setEmoji("âŒ").setStyle(ButtonStyle.Danger)
  );
  return { embeds: [embed], components: [row] };
}

async function executeThug(target, sender) {
  if (target.id === sender.id) return { content: "Â¡No puedes abrazarte a ti mismo! ðŸ˜…" };
  if (target.bot) return { content: "No puedes abrazar a un bot... ðŸ¤–" };
  const embed = new EmbedBuilder().setColor(0xFF69B4).setDescription(`${sender} abraza a ${target}`).setImage(randomFrom(hugGifs));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`thug_volver_${target.id}_${sender.id}`).setLabel("Abrazar de vuelta").setEmoji("ðŸ¤—").setStyle(ButtonStyle.Primary)
  );
  return { embeds: [embed], components: [row] };
}

async function executeFly(sender) {
  const embed = new EmbedBuilder().setColor(0x87CEEB).setDescription(`${sender} estÃ¡ volando.`).setImage(randomFrom(flyGifs));
  return { embeds: [embed] };
}

async function executeSpank(target, sender) {
  if (target.id === sender.id) return { content: "Â¡No puedes nalguearte a ti mismo! ðŸ˜…" };
  if (target.bot) return { content: "No puedes nalguear a un bot... ðŸ¤–" };
  const phrases = [`${sender} nalguea el trasero de ${target}`, `${sender} nalguea a ${target}`];
  const embed = new EmbedBuilder().setColor(0xFF4500).setDescription(randomFrom(phrases)).setImage(randomFrom(spankGifs));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`spank_golpear_${target.id}_${sender.id}`).setLabel("Golpear").setEmoji("ðŸ¤œ").setStyle(ButtonStyle.Danger)
  );
  return { embeds: [embed], components: [row] };
}

async function executePunch(target, sender) {
  if (target.id === sender.id) return { content: "Â¡No puedes golpearte a ti mismo! ðŸ˜…" };
  if (target.bot) return { content: "No puedes golpear a un bot... ðŸ¤–" };
  const embed = new EmbedBuilder().setColor(0xFF4500).setDescription(`${sender} golpea a ${target}!`).setImage(randomFrom(rejectGifs));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`punch_volver_${target.id}_${sender.id}`).setLabel("Golpear de vuelta!").setEmoji("ðŸ¤œ").setStyle(ButtonStyle.Danger)
  );
  return { embeds: [embed], components: [row] };
}

async function executeLike(sender) {
  const embed = new EmbedBuilder().setColor(0xFFD700).setDescription(`${sender} lo aprueba!\nA ${sender} le gusta esto.`).setImage(randomFrom(likeGifs));
  return { embeds: [embed] };
}

async function executeSleep(sender) {
  const embed = new EmbedBuilder().setColor(0x6A5ACD).setDescription(`${sender} estÃ¡ durmiendo..ðŸ’¤`).setImage(randomFrom(sleepGifs));
  return { embeds: [embed] };
}

async function executeDance(sender) {
  const embed = new EmbedBuilder().setColor(0xFF1493).setDescription(`${sender} estÃ¡ bailando..ðŸ’ƒðŸ»`).setImage(randomFrom(danceGifs));
  return { embeds: [embed] };
}

async function registrarComandosGlobales() {
  try {
    console.log("Registrando comandos slash globales...");
    await client.application.commands.set(slashCommands);
    console.log(`âœ… ${slashCommands.length} comandos slash registrados globalmente.`);
  } catch (error) {
    console.error("Error registrando comandos slash:", error);
  }
}

client.once("ready", async () => {
  console.log(`âœ… Bot conectado como ${client.user.tag}`);
  console.log(`   Servidores: ${client.guilds.cache.size}`);
  console.log(`   Miembros totales: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`);
  await registrarComandosGlobales();
});

client.on("guildCreate", async (guild) => {
  console.log(`âž• AÃ±adido a nuevo servidor: ${guild.name} (${guild.id})`);
  console.log("   Los comandos slash globales se sincronizarÃ¡n automÃ¡ticamente.");
});

client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.toLowerCase().startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  if (!command) return;
  const getTarget = async () => {
    let user = message.mentions.users.first();
    if (user) return user;
    if (message.reference?.messageId) {
      const refMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (refMsg) return refMsg.author;
    }
    return null;
  };
  try {
    if (command === "botinfo") {
      const embed = await buildBotInfoEmbed();
      return message.reply({ embeds: [embed] });
    }
    if (command === "userinfo") {
      const target = await getTarget() || message.author;
      const embed = await buildUserInfoEmbed(target, message.guild);
      return message.reply({ embeds: [embed] });
    }
    if (command === "serverinfo") {
      const embed = await buildServerInfoEmbed(message.guild);
      return message.reply({ embeds: [embed] });
    }
    if (command === "kick") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.KickMembers)) return message.reply("âŒ No tienes permiso para expulsar usuarios.");
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. `tkick @user`");
      const reason = args.filter(a => !a.startsWith("<@") && !a.startsWith("<#")).join(" ") || "Sin razÃ³n";
      const member = await message.guild.members.fetch(target.id).catch(() => null);
      if (!member) return message.reply("âŒ El usuario no estÃ¡ en el servidor.");
      if (!member.kickable) return message.reply("âŒ No puedo expulsar a ese usuario (rol superior al mÃ­o o permisos insuficientes).");
      await member.kick(reason);
      const embed = new EmbedBuilder().setColor(0xFF0000).setTitle("Usuario expulsado")
        .addFields(
          { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
          { name: "RazÃ³n", value: reason, inline: false },
          { name: "Moderador", value: `${message.author.tag}`, inline: false }
        ).setThumbnail(target.displayAvatarURL()).setTimestamp();
      return message.reply({ embeds: [embed] });
    }
    if (command === "ban") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.BanMembers)) return message.reply("âŒ No tienes permiso para banear usuarios.");
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. `tban @user [razÃ³n]`");
      const reason = args.filter(a => !a.startsWith("<@") && !a.startsWith("<#")).join(" ") || "Sin razÃ³n";
      const member = await message.guild.members.fetch(target.id).catch(() => null);
      if (member && !member.bannable) return message.reply("âŒ No puedo banear a ese usuario (rol superior al mÃ­o).");
      await message.guild.members.ban(target.id, { reason });
      const embed = new EmbedBuilder().setColor(0x8B0000).setTitle("Usuario baneado")
        .addFields(
          { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
          { name: "RazÃ³n", value: reason, inline: false },
          { name: "Moderador", value: `${message.author.tag}`, inline: false }
        ).setThumbnail(target.displayAvatarURL()).setTimestamp();
      return message.reply({ embeds: [embed] });
    }
    if (command === "mute") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) return message.reply("âŒ No tienes permiso para mutear usuarios.");
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. `tmute 10s @user [razÃ³n]`");
      let timeArg = null;
      for (const a of args) { if (/^\d+[smhd]$/.test(a)) { timeArg = a; break; } }
      if (!timeArg) return message.reply("Debes especificar el tiempo. Ej: `10s`, `5m`, `2h`, `1d`");
      const ms = parseTime(timeArg);
      if (!ms) return message.reply("Formato de tiempo invÃ¡lido. Usa: `10s`, `5m`, `2h`, `1d`");
      if (ms > 28 * 86400000) return message.reply("âŒ El tiempo mÃ¡ximo de aislamiento es 28 dÃ­as.");
      const reason = args.filter(a => !a.startsWith("<@") && !a.startsWith("<#") && !/^\d+[smhd]$/.test(a)).join(" ") || "Sin razÃ³n";
      const member = await message.guild.members.fetch(target.id).catch(() => null);
      if (!member) return message.reply("âŒ El usuario no estÃ¡ en el servidor.");
      if (!member.moderatable) return message.reply("âŒ No puedo mutear a ese usuario (rol superior al mÃ­o).");
      await member.timeout(ms, reason);
      const embed = new EmbedBuilder().setColor(0xFFA500).setTitle("Usuario muteado")
        .addFields(
          { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
          { name: "Tiempo", value: timeArg, inline: true },
          { name: "RazÃ³n", value: reason, inline: false },
          { name: "Moderador", value: `${message.author.tag}`, inline: false }
        ).setThumbnail(target.displayAvatarURL()).setTimestamp();
      return message.reply({ embeds: [embed] });
    }
    if (command === "hardban") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.BanMembers)) return message.reply("âŒ No tienes permiso para banear usuarios.");
      const input = args[0];
      if (!input) return message.reply("Uso: `thardban <id o nombre de usuario>` [razÃ³n]");
      const reason = args.slice(1).join(" ") || "Sin razÃ³n";
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
      if (!targetUser) return message.reply("âŒ No se encontrÃ³ al usuario. Usa un ID vÃ¡lido (recomendado) o un nombre de usuario exacto.");
      await message.guild.members.ban(targetUser.id, { reason });
      const embed = new EmbedBuilder().setColor(0x4B0082).setTitle("Hardban aplicado")
        .addFields(
          { name: "Usuario", value: `${targetUser.tag} (${targetUser.id})`, inline: false },
          { name: "RazÃ³n", value: reason, inline: false },
          { name: "Moderador", value: `${message.author.tag}`, inline: false }
        ).setThumbnail(targetUser.displayAvatarURL()).setTimestamp();
      return message.reply({ embeds: [embed] });
    }
    if (command === "kiss") {
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. `tkiss @user`");
      const payload = await executeKiss(target, message.author);
      return message.reply(payload);
    }
    if (command === "thug") {
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. `thug @user`");
      const payload = await executeThug(target, message.author);
      return message.reply(payload);
    }
    if (command === "voicejoin" || command === "voice-join") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.Administrator)) return message.reply("âŒ Solo los administradores pueden usar este comando.");
      const stopArg = args.find(a => {
        const lower = a.toLowerCase();
        return lower === "stop:true" || lower === "true" || lower === "stop";
      });
      if (stopArg) { await leaveVoice(); return message.reply("ðŸ”‡ SalÃ­ del canal de voz."); }
      let channel = message.mentions.channels.first();
      if (!channel && message.member?.voice?.channel) channel = message.member.voice.channel;
      if (!channel || (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice)) return message.reply("Menciona un canal de voz o Ãºnete a uno primero. Uso: `tvoicejoin #canal`");
      await joinVoicePersistent(channel);
      return message.reply(`ðŸ”Š Conectado al canal de voz **${channel.name}**. Me quedarÃ© hasta que uses \`tvoicejoin stop\`.`);
    }
    if (command === "fly") {
      const payload = await executeFly(message.author);
      return message.reply(payload);
    }
    if (command === "spank") {
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. `tspank @user`");
      const payload = await executeSpank(target, message.author);
      return message.reply(payload);
    }
    if (command === "punch") {
      const target = await getTarget();
      if (!target) return message.reply("Menciona a alguien o responde a su mensaje. `tpunch @user`");
      const payload = await executePunch(target, message.author);
      return message.reply(payload);
    }
    if (command === "like") {
      const payload = await executeLike(message.author);
      return message.reply(payload);
    }
    if (command === "sleep") {
      const payload = await executeSleep(message.author);
      return message.reply(payload);
    }
    if (command === "dance") {
      const payload = await executeDance(message.author);
      return message.reply(payload);
    }
    if (command === "botsay" || command === "bot-say") {
      if (!message.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return message.reply("âŒ No tienes permiso para usar este comando (necesitas Gestionar Servidor).");
      const msg = args.join(" ");
      if (!msg && message.attachments.size === 0) return message.reply("Debes escribir un mensaje o adjuntar un archivo. Uso: `tbotsay <mensaje>`");
      const payload = { content: msg || "" };
      if (message.attachments.size > 0) {
        payload.files = message.attachments.map(a => ({ attachment: a.url, name: a.name }));
      }
      await message.channel.send(payload);
      try { await message.delete(); } catch (e) {}
      return;
    }
  } catch (error) {
    console.error("Error en comando:", error);
    if (error.code === 50013) return message.reply("âŒ No tengo permisos para hacer eso en este canal/servidor.");
    if (error.code === 50007) return message.reply("âŒ No puedo enviar mensajes a ese usuario (tiene DMs cerrados).");
    message.reply("âš ï¸ OcurriÃ³ un error al ejecutar el comando.").catch(() => {});
  }
});

client.on("interactionCreate", async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = interaction.commandName;
      if (cmd === "botinfo") { const embed = await buildBotInfoEmbed(); return interaction.reply({ embeds: [embed] }); }
      if (cmd === "userinfo") { const target = interaction.options.getUser("usuario") || interaction.user; const embed = await buildUserInfoEmbed(target, interaction.guild); return interaction.reply({ embeds: [embed] }); }
      if (cmd === "server-info") { const embed = await buildServerInfoEmbed(interaction.guild); return interaction.reply({ embeds: [embed] }); }
      if (cmd === "kick") {
        const target = interaction.options.getUser("usuario");
        const reason = interaction.options.getString("razon") || "Sin razÃ³n";
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) return interaction.reply({ content: "âŒ El usuario no estÃ¡ en el servidor.", ephemeral: true });
        if (!member.kickable) return interaction.reply({ content: "âŒ No puedo expulsar a ese usuario.", ephemeral: true });
        await member.kick(reason);
        const embed = new EmbedBuilder().setColor(0xFF0000).setTitle("Usuario expulsado")
          .addFields(
            { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
            { name: "RazÃ³n", value: reason, inline: false },
            { name: "Moderador", value: `${interaction.user.tag}`, inline: false }
          ).setThumbnail(target.displayAvatarURL()).setTimestamp();
        return interaction.reply({ embeds: [embed] });
      }
      if (cmd === "ban") {
        const target = interaction.options.getUser("usuario");
        const reason = interaction.options.getString("razon") || "Sin razÃ³n";
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (member && !member.bannable) return interaction.reply({ content: "âŒ No puedo banear a ese usuario.", ephemeral: true });
        await interaction.guild.members.ban(target.id, { reason });
        const embed = new EmbedBuilder().setColor(0x8B0000).setTitle("Usuario baneado")
          .addFields(
            { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
            { name: "RazÃ³n", value: reason, inline: false },
            { name: "Moderador", value: `${interaction.user.tag}`, inline: false }
          ).setThumbnail(target.displayAvatarURL()).setTimestamp();
        return interaction.reply({ embeds: [embed] });
      }
      if (cmd === "mute") {
        const target = interaction.options.getUser("usuario");
        const timeStr = interaction.options.getString("tiempo");
        const reason = interaction.options.getString("razon") || "Sin razÃ³n";
        const ms = parseTime(timeStr);
        if (!ms) return interaction.reply({ content: "Formato de tiempo invÃ¡lido. Usa: `10s`, `5m`, `2h`, `1d`", ephemeral: true });
        if (ms > 28 * 86400000) return interaction.reply({ content: "âŒ El tiempo mÃ¡ximo es 28 dÃ­as.", ephemeral: true });
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) return interaction.reply({ content: "âŒ El usuario no estÃ¡ en el servidor.", ephemeral: true });
        if (!member.moderatable) return interaction.reply({ content: "âŒ No puedo mutear a ese usuario.", ephemeral: true });
        await member.timeout(ms, reason);
        const embed = new EmbedBuilder().setColor(0xFFA500).setTitle("Usuario muteado")
          .addFields(
            { name: "Usuario", value: `${target.tag} (${target.id})`, inline: false },
            { name: "Tiempo", value: timeStr, inline: true },
            { name: "RazÃ³n", value: reason, inline: false },
            { name: "Moderador", value: `${interaction.user.tag}`, inline: false }
          ).setThumbnail(target.displayAvatarURL()).setTimestamp();
        return interaction.reply({ embeds: [embed] });
      }
      if (cmd === "hardban") {
        const input = interaction.options.getString("usuario");
        const reason = interaction.options.getString("razon") || "Sin razÃ³n";
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
        if (!targetUser) return interaction.reply({ content: "âŒ Usuario no encontrado.", ephemeral: true });
        await interaction.guild.members.ban(targetUser.id, { reason });
        const embed = new EmbedBuilder().setColor(0x4B0082).setTitle("Hardban aplicado")
          .addFields(
            { name: "Usuario", value: `${targetUser.tag} (${targetUser.id})`, inline: false },
            { name: "RazÃ³n", value: reason, inline: false },
            { name: "Moderador", value: `${interaction.user.tag}`, inline: false }
          ).setThumbnail(targetUser.displayAvatarURL()).setTimestamp();
        return interaction.reply({ embeds: [embed] });
      }
      if (cmd === "kiss") { const target = interaction.options.getUser("usuario"); const payload = await executeKiss(target, interaction.user); return interaction.reply(payload); }
      if (cmd === "thug") { const target = interaction.options.getUser("usuario"); const payload = await executeThug(target, interaction.user); return interaction.reply(payload); }
      if (cmd === "voice-join") {
        const stop = interaction.options.getBoolean("stop");
        if (stop) { await leaveVoice(); return interaction.reply({ content: "ðŸ”‡ SalÃ­ del canal de voz." }); }
        let channel = interaction.options.getChannel("canal");
        if (!channel && interaction.member?.voice?.channel) channel = interaction.member.voice.channel;
        if (!channel || (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice)) return interaction.reply({ content: "Menciona un canal de voz o Ãºnete a uno primero.", ephemeral: true });
        await joinVoicePersistent(channel);
        return interaction.reply({ content: `ðŸ”Š Conectado a **${channel.name}**. Me quedarÃ© hasta que uses \`/voice-join stop: true\`.` });
      }
      if (cmd === "fly") { const payload = await executeFly(interaction.user); return interaction.reply(payload); }
      if (cmd === "spank") { const target = interaction.options.getUser("usuario"); const payload = await executeSpank(target, interaction.user); return interaction.reply(payload); }
      if (cmd === "punch") { const target = interaction.options.getUser("usuario"); const payload = await executePunch(target, interaction.user); return interaction.reply(payload); }
      if (cmd === "like") { const payload = await executeLike(interaction.user); return interaction.reply(payload); }
      if (cmd === "sleep") { const payload = await executeSleep(interaction.user); return interaction.reply(payload); }
      if (cmd === "dance") { const payload = await executeDance(interaction.user); return interaction.reply(payload); }
      if (cmd === "bot-say") {
        const msg = interaction.options.getString("mensaje");
        const attachment = interaction.options.getAttachment("file");
        const payload = { content: msg };
        if (attachment) {
          payload.files = [{ attachment: attachment.url, name: attachment.name }];
        }
        await interaction.channel.send(payload);
        return interaction.reply({ content: "âœ… Mensaje enviado de forma anÃ³nima.", ephemeral: true });
      }
    }
    if (interaction.isButton()) {
      const id = interaction.customId;
      if (id.startsWith("kiss_corresponder_")) {
        const parts = id.split("_");
        const targetId = parts[2];
        const senderId = parts[3];
        if (interaction.user.id !== targetId) return interaction.reply({ content: "âŒ Solo el usuario besado puede usar este botÃ³n.", ephemeral: true });
        if (wasResponded(interaction.message.id)) return interaction.reply({ content: "âŒ Este mensaje ya fue respondido.", ephemeral: true });
        markResponded(interaction.message.id);
        const sender = await client.users.fetch(senderId).catch(() => null);
        const target = interaction.user;
        const oldRow = ActionRowBuilder.from(interaction.message.components[0]);
        oldRow.components.forEach(c => c.setDisabled(true));
        await interaction.update({ components: [oldRow] });
        const embed = new EmbedBuilder().setColor(0xFF69B4).setDescription(`${target} besa de vuelta a ${sender}`).setImage(randomFrom(kissGifs));
        return interaction.followUp({ embeds: [embed] });
      }
      if (id.startsWith("kiss_rechazar_")) {
        const parts = id.split("_");
        const targetId = parts[2];
        const senderId = parts[3];
        if (interaction.user.id !== targetId) return interaction.reply({ content: "âŒ Solo el usuario besado puede usar este botÃ³n.", ephemeral: true });
        if (wasResponded(interaction.message.id)) return interaction.reply({ content: "âŒ Este mensaje ya fue respondido.", ephemeral: true });
        markResponded(interaction.message.id);
        const sender = await client.users.fetch(senderId).catch(() => null);
        const target = interaction.user;
        const oldRow = ActionRowBuilder.from(interaction.message.components[0]);
        oldRow.components.forEach(c => c.setDisabled(true));
        await interaction.update({ components: [oldRow] });
        const embed = new EmbedBuilder().setColor(0x808080).setDescription(`${target} rechaza el beso de ${sender}`).setImage(randomFrom(rejectGifs));
        return interaction.followUp({ embeds: [embed] });
      }
      if (id.startsWith("thug_volver_")) {
        const parts = id.split("_");
        const targetId = parts[2];
        const senderId = parts[3];
        if (interaction.user.id !== targetId) return interaction.reply({ content: "âŒ Solo el usuario abrazado puede usar este botÃ³n.", ephemeral: true });
        if (wasResponded(interaction.message.id)) return interaction.reply({ content: "âŒ Este mensaje ya fue respondido.", ephemeral: true });
        markResponded(interaction.message.id);
        const sender = await client.users.fetch(senderId).catch(() => null);
        const target = interaction.user;
        const oldRow = ActionRowBuilder.from(interaction.message.components[0]);
        oldRow.components.forEach(c => c.setDisabled(true));
        await interaction.update({ components: [oldRow] });
        const embed = new EmbedBuilder().setColor(0xFF69B4).setDescription(`${target} abraza de vuelta a ${sender}`).setImage(randomFrom(hugGifs));
        return interaction.followUp({ embeds: [embed] });
      }
      if (id.startsWith("spank_golpear_")) {
        const parts = id.split("_");
        const targetId = parts[2];
        const senderId = parts[3];
        if (interaction.user.id !== targetId) return interaction.reply({ content: "âŒ Solo el usuario nalgueado puede usar este botÃ³n.", ephemeral: true });
        if (wasResponded(interaction.message.id)) return interaction.reply({ content: "âŒ Este mensaje ya fue respondido.", ephemeral: true });
        markResponded(interaction.message.id);
        const sender = await client.users.fetch(senderId).catch(() => null);
        const target = interaction.user;
        const oldRow = ActionRowBuilder.from(interaction.message.components[0]);
        oldRow.components.forEach(c => c.setDisabled(true));
        await interaction.update({ components: [oldRow] });
        const embed = new EmbedBuilder().setColor(0xFF4500).setDescription(`${target} golpea a ${sender}`).setImage(randomFrom(rejectGifs));
        return interaction.followUp({ embeds: [embed] });
      }
      if (id.startsWith("punch_volver_")) {
        const parts = id.split("_");
        const targetId = parts[2];
        const senderId = parts[3];
        if (interaction.user.id !== targetId) return interaction.reply({ content: "âŒ Solo el usuario golpeado puede usar este botÃ³n.", ephemeral: true });
        if (wasResponded(interaction.message.id)) return interaction.reply({ content: "âŒ Este mensaje ya fue respondido.", ephemeral: true });
        markResponded(interaction.message.id);
        const sender = await client.users.fetch(senderId).catch(() => null);
        const target = interaction.user;
        const oldRow = ActionRowBuilder.from(interaction.message.components[0]);
        oldRow.components.forEach(c => c.setDisabled(true));
        await interaction.update({ components: [oldRow] });
        const embed = new EmbedBuilder().setColor(0xFF4500).setDescription(`${target} golpea de vuelta a ${sender}`).setImage(randomFrom(rejectGifs));
        return interaction.followUp({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error("Error en interacciÃ³n:", error);
    if (interaction.isRepliable()) {
      if (interaction.deferred || interaction.replied) {
        interaction.followUp({ content: "âš ï¸ OcurriÃ³ un error.", ephemeral: true }).catch(() => {});
      } else {
        interaction.reply({ content: "âš ï¸ OcurriÃ³ un error.", ephemeral: true }).catch(() => {});
      }
    }
  }
});

client.login(TOKEN);
