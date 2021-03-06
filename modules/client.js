const Discord = require("discord.js");
const { embedPages, resolveMember, withTyping } = require("../functions/discord.js");
const { Client } = require("../haseul.js");

const fs = require("fs");
const process = require("process");
const serverSettings = require("../utils/server_settings.js");
const { getDelta } = require("../functions/functions.js");

exports.onCommand = async function(message, args) {
    let { channel } = message;

    switch (args[0]) {

        case "botinfo":
        case "binfo":
        case "clientinfo":
            withTyping(channel, botInfo, [message]);
            break
        case "serverlist":
        case "guildlist":
            if (message.author.id === "125414437229297664")
                withTyping(channel, serverList, [message]);
            break;

    }

}

async function botInfo(message) {

    let { guild } = message;

    let stat;
    try {
        stat = fs.readFileSync(`/proc/${process.pid}/stat`);
    } catch(e) {
        console.error(Error(e));
        message.channel.send(`⚠ Error occurred.`);
        return;
    }
    let statArray = stat.toString().split(/(?<!\(\w+)\s(?!\w+\))/i);
    let memory = Math.round((parseInt(statArray[23]) * 4096)/10000)/100;
    // let threads = statArray[19];

    let botMember = await resolveMember(guild, Client.user.id);
    if (!botMember) {
        message.channel.send(`⚠ Error occurred.`);
        return;
    }
    let uptime = getDelta(Client.uptime, 'days');
    let uptimeString = "";
    if (uptime.days) uptimeString += `${uptime.days}d `;
    if (uptime.hours) uptimeString += `${uptime.hours}h `;
    if (uptime.minutes) uptimeString += `${uptime.minutes}m `;
    if (uptime.seconds) uptimeString += `${uptime.seconds}s `;

    let status = {
        "0": "<:online_cb:533459049765928970>Ready",
        "1": "<:idle_cb:533459049702752266>Connecting",
        "2": "<:idle_cb:533459049702752266>Reconnecting",
        "3": "<:idle_cb:533459049702752266>Idle",
        "4": "<:idle_cb:533459049702752266>Nearly",
        "5": "<:offline_cb:533459049648226317>Offline"
    }
    
    let embed = new Discord.MessageEmbed({
        author: { name: `${Client.user.username} Info`, icon_url: Client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 32 }) },
        description: `<@${Client.user.id}>`,
        thumbnail: { url: Client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 512 }) },
        color: botMember.displayColor || 0xffffff,
        fields: [
            { name: 'Author', value: '<@125414437229297664>', inline: true },
            { name: 'Status', value: status[Client.ws.status], inline: true },
            { name: 'Uptime', value: uptimeString, inline: true },
            { name: 'Ping', value: `${Math.floor(Client.ws.ping)}ms`, inline: true },
            { name: 'Server Count', value: Client.guilds.cache.size.toLocaleString(), inline: true },
            { name: 'Cached Users', value: Client.users.cache.size.toLocaleString(), inline: true },
            { name: 'Bot Joined', value: botMember.joinedAt.toUTCString().replace(/^.*?\s/, '').replace(" GMT", " UTC"), inline: false },
            { name: 'Bot Created', value: Client.user.createdAt.toUTCString().replace(/^.*?\s/, '').replace(" GMT", " UTC"), inline: false },
            { name: 'Memory', value: memory + 'MB', inline: true },
            { name: 'Links', value: '[Website](https://haseulbot.xyz/) - [Discord](https://discord.gg/w4q5qux) - [Patreon](https://www.patreon.com/haseulbot)' }
        ],
        footer: { text: `Type ${serverSettings.get(guild.id, "prefix")}help for help with ${Client.user.username}` }
    });
    
    message.channel.send({embed});

}

async function serverList(message) {

    let guildString = Client.guilds.cache.array().sort((a, b) => b.memberCount - a.memberCount).map(guild => `${guild.name} (${guild.id}) (${guild.memberCount} members)`).join('\n');

    let descriptions = [];
    while (guildString.length > 2048 || guildString.split('\n').length > 25) {
        let currString = guildString.slice(0, 2048);

        let lastIndex = 0;
        for (let i = 0; i < 25; i++) {
            let index = currString.indexOf('\n', lastIndex) + 1;
            if (index) lastIndex = index; else break;
        }
        currString   = currString.slice(0, lastIndex);
        guildString = guildString.slice(lastIndex);

        descriptions.push(currString);
    } 
    descriptions.push(guildString);

    let pages = descriptions.map((desc, i) => {
        return {
            embed: {
                title: "Server List",
                description: desc,
                color: 0xffffff,
                footer: {
                    text: `Page ${i+1} of ${descriptions.length}`
                }
            }
        }
    })

    embedPages(message, pages);

}
