//Require modules

const discord = require("discord.js");
const axios = require("axios");
const fs = require("fs");

const client = require("../haseul.js").client;
const config = require("../config.json");
const functions = require("../functions/functions.js");
const database = require("../modules/lastfm_database.js");
const html = require("../functions/html.js");
const youtube = require("./youtube.js");

//Init

const api_key = config.lastfm_key;

let week = ["7", "7day", "7days", "weekly", "week", "1week"];
let month = ["30", "30day", "30days", "monthly", "month", "1month"];
let three_month = ["90", "90day", "90days", "3months", "3month"];
let six_month = ["180", "180day", "180days", "6months", "6month"];
let year = ["365", "365day", "365days", "1year", "year", "yr", "12months", "yearly"];
let overall = ["all", "at", "alltime", "forever", "overall"];
let grids = ["3x3", "4x4", "5x5"];

//Functions

exports.handle = async function (message) {

    let args = message.content.trim().split(" ");

    //Handle commands

    switch (args[0]) {

        case ".fm":
            switch (args[1]) {

                case "set":
                    message.channel.startTyping();
                    set_lf_user(message, args[2]).then(response => {
                        if (response) message.channel.send(response);
                        message.channel.stopTyping();
                    }).catch(error => {
                        console.error(error);
                        message.channel.stopTyping();
                    })
                    break;

                case "remove":
                case "delete":
                case "del":
                    message.channel.startTyping();
                    remove_lf_user(message).then(response => {
                        if (response) message.channel.send(response);
                        message.channel.stopTyping();
                    }).catch(error => {
                        console.error(error);
                        message.channel.stopTyping();
                    })
                    break;

                case "recent":
                case "recents":
                    let recentsCount;
                    let username;
                    if (args.length > 2) {
                        recentsNum = +args[2];
                        if (recentsNum) {
                            recentsCount = recentsNum;
                            username = args[3];
                        }
                        else {
                            recentsCount = 10;
                            username = args[2];
                        }
                    } else {
                        recentsCount = 10;
                    }
                    recentsCount = recentsCount > 1000 ? 1000 : recentsCount;
                    
                    let recentsFunc = recentsCount < 3 ? lf_recents : lf_recents_list;
                    message.channel.startTyping();
                    recentsFunc(message, username, recentsCount).then(response => {
                        if (response) message.channel.send(response);
                        message.channel.stopTyping();
                    }).catch(error => {
                        console.error(error);
                        message.channel.stopTyping();
                    })
                    break;

                case "topartists":
                case "tar":
                case "tat":
                case "ta":
                    switch(args[2]) {
                        
                        case "chart":
                        case "collage":
                            message.channel.startTyping();
                            lf_chart(message, args.slice(3), "artist").then(response => {
                                if (response) message.channel.send(...response);
                                message.channel.stopTyping();
                            }).catch(error => {
                                console.error(error);
                                message.channel.stopTyping();
                            })
                            break;

                        default:
                            message.channel.startTyping();
                            lf_top_artists(message, args.slice(2)).then(response => {
                                if (response) message.channel.send(response);
                                message.channel.stopTyping();
                            }).catch(error => {
                                console.error(error);
                                message.channel.stopTyping();
                            })
                            break;

                    }
                    break;

                case "topalbums":
                case "talb":
                case "tal":
                case "tab":
                    switch (args[2]) {
                        case "chart":
                        case "collage":
                            message.channel.startTyping();
                            lf_chart(message, args.slice(3), "album").then(response => {
                                if (response) message.channel.send(...response);
                                message.channel.stopTyping();
                            }).catch(error => {
                                console.error(error);
                                message.channel.stopTyping();
                            })
                            break;

                        default:
                            message.channel.startTyping();
                            lf_top_albums(message, args.slice(2)).then(response => {
                                if (response) message.channel.send(response);
                                message.channel.stopTyping();
                            }).catch(error => {
                                console.error(error);
                                message.channel.stopTyping();
                            })
                            break;
                    }
                    break;

                case "toptracks":
                case "tts":
                case "tt":
                    message.channel.startTyping();
                    lf_top_tracks(message, args.slice(2)).then(response => {
                        if (response) message.channel.send(response);
                        message.channel.stopTyping();
                    }).catch(error => {
                        console.error(error);
                        message.channel.stopTyping();
                    })
                    break;
                
                case "nowplaying":
                case "np":
                    message.channel.startTyping();
                    lf_recents(message, args[2], 1).then(response => {
                        if (response) message.channel.send(response);
                        message.channel.stopTyping();
                    }).catch(error => {
                        console.error(error);
                        message.channel.stopTyping();
                    })
                    break;
                
                case "profile":
                    message.channel.startTyping();
                    lf_profile(message, args[2]).then(response => {
                        if (response) message.channel.send(response);
                        message.channel.stopTyping();
                    }).catch(error => {
                        console.error(error);
                        message.channel.stopTyping();
                    })
                    break;

                default:
                    message.channel.startTyping();
                    lf_recents(message, args[1], 2).then(response => {
                        if (response) message.channel.send(response);
                        message.channel.stopTyping();
                    }).catch(error => {
                        console.error(error);
                        message.channel.stopTyping();
                    })
                    break;
            }
            break;
        
        case ".fmyt":
            message.channel.startTyping();
            lf_youtube(message, args[1]).then(response => {
                if (response) message.channel.send(response);
                message.channel.stopTyping();
            }).catch(error => {
                console.error(error);
                message.channel.stopTyping();
            })
            break; 
        
        case ".chart":
            switch (args[1]) {

                case "artists":
                case "artist":
                    message.channel.startTyping();
                    lf_chart(message, args.slice(2), "artist").then(response => {
                        if (response) message.channel.send(...response);
                        message.channel.stopTyping();
                    }).catch(error => {
                        console.error(error);
                        message.channel.stopTyping();
                    })
                    break;

                default:
                    message.channel.startTyping();
                    lf_chart(message, args.slice(1), "album").then(response => {
                        if (response) message.channel.send(...response);
                        message.channel.stopTyping();
                    }).catch(error => {
                        console.error(error);
                        message.channel.stopTyping();
                    })
                    break;

            }
            break;

    }
}

const set_lf_user = async function (message, username) {
    
    if (!username) {
        return "\\⚠ Please provide a Last.fm username: `.fm set <username>`.";
    }
    
    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(username)}&api_key=${api_key}&format=json`);
    let { error } = response.data;
    if (error) {
        if (error == 6) {
            return `\\⚠ ${username} is an invalid Last.fm user.`;
        } else {
            throw new Error(response.data);
        }
    }
    
    response = await database.set_lf_user(message.author.id, username);
    return response;

}

const remove_lf_user = async function (message) {
    
    return await database.remove_lf_user(message.author.id);

}

const lf_recents = async function (message, username, recentsCount) {

    if (!username) {
        username = await database.get_lf_user(message.author.id);
    }
    if (!username) {
        return "\\⚠ No Last.fm username linked to your account. Please link a username to your account using `.fm set <username>`, alternatively, use `.fm <username>` to get recent tracks for a specific Last.fm user.";
    }
    
    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${api_key}&format=json&limit=2`);

    let { error } = response.data;
    if (error) {
        if (error == 6) {
            return `\\⚠ ${username} is an invalid Last.fm user.`;
        } else {
            throw new Error(response.data);
        }
    }

    let tracks = response.data.recenttracks.track;
    let attr = response.data.recenttracks["@attr"];
    let lf_user = attr.user;
    if (!tracks || tracks.length < 1) {
        return `\\⚠ ${lf_user} hasn't listened to any music during this time.`;
    }

    let track1 = tracks[0];
    let track2 = tracks[1];

    if (!track2) {
        track2 = {
            artist: {
                "#text": "Null"
            },
            name: "Null"
        }
    }

    let trackResponse = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.getInfo&user=${lf_user}&api_key=${api_key}&artist=${encodeURIComponent(track1.artist["#text"])}&track=${encodeURIComponent(track1.name)}&format=json`);
    
    if (trackResponse.data.error) {
        throw new Error(trackResponse.data.message);
    }

    let playCount;
    if (trackResponse.data.track && trackResponse.data.track.userplaycount) {
        playCount = trackResponse.data.track.userplaycount;
    } else {
        playCount = "0";
    }

    let album_thumbnail = track1.image[2]["#text"];
    let album_image = track1.image[track1.image.length-1]["#text"].replace("300x300/", "");
    if (!album_thumbnail || album_thumbnail.length < 1) {
        album_thumbnail = "https://lastfm-img2.akamaized.net/i/u/174s/c6f59c1e5e7240a4c0d427abd71f3dbb.png";
    }
    if (!album_image || album_image.length < 1) {
        album_image = "https://lastfm-img2.akamaized.net/i/u/c6f59c1e5e7240a4c0d427abd71f3dbb.png";
    }

    let nowplaying;
    if (track1["@attr"] && track1["@attr"].nowplaying == "true") {
        nowplaying = true;
        track1.status = "Now Playing";
    } else {
        nowplaying = false;
        track1.status = "Last Played";
    }

    let field1 = `${track1.artist["#text"].replace(/([\(\)\`\*\~\_])/g, "\\$&")} - [${track1.name.replace(/([\[\]\`\*\~\_])/g, "\\$&")}](https://www.last.fm/music/${encodeURIComponent(track1.artist["#text"]).replace(/\)/g, "\\)")}/_/${encodeURIComponent(track1.name).replace(/\)/g, "\\)")})`;
    let field2 = `${track2.artist["#text"].replace(/([\(\)\`\*\~\_])/g, "\\$&")} - [${track2.name.replace(/([\[\]\`\*\~\_])/g, "\\$&")}](https://www.last.fm/music/${encodeURIComponent(track2.artist["#text"]).replace(/\)/g, "\\)")}/_/${encodeURIComponent(track2.name).replace(/\)/g, "\\)")})`;
    if (track1.album["#text"]) field1+=` | **${track1.album["#text"].replace(/([\(\)\`\*\~\_])/g, "\\$&")}**`
    if (track2.album["#text"]) field2+=` | **${track2.album["#text"].replace(/([\(\)\`\*\~\_])/g, "\\$&")}**`

    let posessive = lf_user[lf_user.length-1].toLowerCase() == "s" ? "'" : "'s";
    let embed = new discord.RichEmbed()
    .setColor(0xc1222a)
    .setThumbnail(album_thumbnail)
    .setURL(album_image)
    .addField(`${track1.status}`, field1, false);
    
    if (recentsCount === 1) {
        let tagResponse = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.gettoptags&artist=${encodeURIComponent(track1.artist["#text"])}&track=${encodeURIComponent(track1.name)}&api_key=${api_key}&format=json`);
        let tags = tagResponse.data.toptags.tag.slice(0, 5);
        let taglist = [];
        for (i=0; i < tags.length; i++) {
            taglist.push(tags[i].name[0].toUpperCase() + tags[i].name.slice(1).toLowerCase());
        }
        embed.setAuthor(`${lf_user}${posessive} Latest Track`, `https://i.imgur.com/YbZ52lN.png`, `https://www.last.fm/user/${lf_user}/`)
        embed.addField(`Track Plays`, playCount, false);
        if (taglist.length > 0) embed.setFooter(`Tags: ${taglist.join(", ")}`);
    } else if (recentsCount === 2) {
        embed.setAuthor(`${lf_user}${posessive} Recent Tracks`, `https://i.imgur.com/YbZ52lN.png`, `https://www.last.fm/user/${lf_user}/`)
        embed.addField(`Previous Track`, field2, false);
        embed.setFooter(`Track Plays: ${playCount}`);
    }

    if (!nowplaying && track1.date) {
        embed.setTimestamp(new Date(0).setSeconds(+track1.date.uts));
    }
    return { embed: embed };

}

const lf_recents_list = async function (message, username, recentsCount) {

    if (!username) {
        username = await database.get_lf_user(message.author.id);
    }
    if (!username) {
        return "\\⚠ No Last.fm username linked to your account. Please link a username to your account using `.fm set <username>`, alternatively, use `.fm <username>` to get recent tracks for a specific Last.fm user.";
    }

    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${api_key}&format=json&limit=${recentsCount}`);

    let { error } = response.data;
    if (error) {
        if (error == 6) {
            return `\\⚠ ${username} is an invalid Last.fm user.`;
        } else {
            throw new Error(response.data);
        }
    }

    let tracks = response.data.recenttracks.track;
    let attr = response.data.recenttracks["@attr"];
    let lf_user = attr.user;
    if (!tracks || tracks.length < 1) {
        return `\\⚠ ${lf_user} hasn't listened to any music during this time.`;
    }

    let pages = [];
    let length = 0;
    let page = [];
    let startTime = Date.now();
    for (i=0; i < recentsCount && i < tracks.length; i++) {
        let track = tracks[i];
        let row;
        if (track["@attr"] && track["@attr"].nowplaying == "true") {
            row = `\\▶ ${track.artist["#text"].replace(/([\(\)\`\*\~\_])/g, "\\$&")} - [${track.name.replace(/([\[\]\`\*\~\_])/g, "\\$&")}](https://www.last.fm/music/${encodeURIComponent(track.artist["#text"]).replace(/\)/g, "\\)")}/_/${encodeURIComponent(track.name).replace(/\)/g, "\\)")}) (Now)`;
        } else {
            row = `${i + 1}. ${track.artist["#text"].replace(/([\(\)\`\*\~\_])/g, "\\$&")} - [${track.name.replace(/([\[\]\`\*\~\_])/g, "\\$&")}](https://www.last.fm/music/${encodeURIComponent(track.artist["#text"]).replace(/\)/g, "\\)")}/_/${encodeURIComponent(track.name).replace(/\)/g, "\\)")}) (${getTimeAgo(+track.date.uts)})`;
        }
        if (length + (row.length + 1) > 2048 || page.length > 19) { // + 1 = line break
            pages.push(page.join("\n"));
            page = [row];
            length = row.length + 1;
        } else {
            page.push(row);
            length += row.length + 1;
        }
    }
    pages.push(page.join("\n"));
    console.log(Date.now() - startTime);

    let album_thumbnail = tracks[0].image[2]["#text"];
    let album_image = tracks[0].image[tracks[0].image.length-1]["#text"].replace("300x300/", "");
    if (!album_thumbnail || album_thumbnail.length < 1) {
        album_thumbnail = "https://lastfm-img2.akamaized.net/i/u/174s/c6f59c1e5e7240a4c0d427abd71f3dbb.png";
    }
    if (!album_image || album_image.length < 1) {
        album_image = "https://lastfm-img2.akamaized.net/i/u/c6f59c1e5e7240a4c0d427abd71f3dbb.png";
    }

    let posessive = lf_user[lf_user.length-1].toLowerCase() == "s" ? "'" : "'s";
    let embed = new discord.RichEmbed()
    .setAuthor(`${lf_user}${posessive} Recent Tracks`, `https://i.imgur.com/YbZ52lN.png`, `https://www.last.fm/user/${lf_user}/library`)
    .setColor(0xc1222a)
    .setThumbnail(album_thumbnail);

    functions.embedPages(message, embed, pages, 600000);
    return;

}

const lf_top_artists = async function (message, args) {

    let {
        timeframe,
        date_preset,
        display_time,
        defaulted
    } = getTimeFrame(args[0]);

    let username = defaulted ? args[0] : args[1]
    if (!username) {
        username = await database.get_lf_user(message.author.id);
    }
    if (!username) {
        return "\\⚠ No Last.fm username linked to your account. Please link a username to your account using `.fm set <username>`, alternatively, use `.fm <username>` to get recent tracks for a specific Last.fm user.";
    }

    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&api_key=${api_key}&format=json&period=${timeframe}&limit=100`);

    let { error } = response.data;
    if (error) {
        if (error == 6) {
            return `\\⚠ ${username} is an invalid Last.fm user.`;
        } else {
            throw new Error(response.data);
        }
    }

    let artists = response.data.topartists.artist;
    let attr = response.data.topartists["@attr"];
    let lf_user = attr.user;
    if (!artists || artists.length < 1) {
        return `\\⚠ ${lf_user} hasn't listened to any music during this time.`;
    }

    let pages = [];
    let length = 0;
    let page = [];
    for (i=0; i < artists.length; i++) {
        let artist = artists[i];

        let plays_plural = "Plays"
        if (artist.playcount === "1") plays_plural = "Play";

        let row = `${i + 1}. [${artist.name.replace(/([\(\)\`\*\~\_])/g, "\\$&")}](https://www.last.fm/music/${encodeURIComponent(artist.name).replace(/\)/g, "\\)")}) (${artist.playcount} ${plays_plural})`
        if (length + (row.length + 1) > 2048 || page.length > 19) { // + 1 = line break
            pages.push(page.join("\n"));
            page = [row];
            length = row.length + 1;
        } else {
            page.push(row);
            length += row.length + 1;
        }
    }
    pages.push(page.join("\n"));

    let artist_thumbnail = artists[0].image[2]["#text"];
    if (!artist_thumbnail) {
        artist_thumbnail = "https://lastfm-img2.akamaized.net/i/u/avatar170s/2a96cbd8b46e442fc41c2b86b821562f.png";
    }

    let posessive = lf_user[lf_user.length-1].toLowerCase() == "s" ? "'" : "'s";
    let embed = new discord.RichEmbed()
    .setAuthor(`${lf_user}${posessive} Top Artists`,`https://i.imgur.com/FwnPEny.png`, `https://www.last.fm/user/${lf_user}/library/artists?date_preset=${date_preset}`)
    .setTitle(display_time)
    .setThumbnail(artist_thumbnail)
    .setColor(0xf49023);

    functions.embedPages(message, embed, pages, 600000);
    return;

}

const lf_top_albums = async function (message, args)  {

    let {
        timeframe,
        date_preset,
        display_time,
        defaulted
    } = getTimeFrame(args[0]);

    let username = defaulted ? args[0] : args[1]
    if (!username) {
        username = await database.get_lf_user(message.author.id);
    }
    if (!username) {
        return "\\⚠ No Last.fm username linked to your account. Please link a username to your account using `.fm set <username>`, alternatively, use `.fm <username>` to get recent tracks for a specific Last.fm user.";
    }

    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&api_key=${api_key}&format=json&period=${timeframe}&limit=100`);

    let { error } = response.data;
    if (error) {
        if (error == 6) {
            return `\\⚠ ${username} is an invalid Last.fm user.`;
        } else {
            throw new Error(response.data);
        }
    }

    let albums = response.data.topalbums.album;
    let attr = response.data.topalbums["@attr"];
    let lf_user = attr.user;
    if (!albums || albums.length < 1) {
        return `\\⚠ ${lf_user} hasn't listened to any music during this time.`;
    }

    let pages = [];
    let length = 0;
    let page = [];
    for (i=0; i < albums.length; i++) {
        let album = albums[i];

        let plays_plural = "Plays"
        if (album.playcount === "1") plays_plural = "Play";

        let row = `${i + 1}. ${album.artist.name.replace(/([\(\)\`\*\~\_])/g, "\\$&")} - [${album.name.replace(/([\(\)\`\*\~\_])/g, "\\$&")}](https://www.last.fm/music/${encodeURIComponent(album.artist.name).replace(/\)/g, "\\)")}/${encodeURIComponent(album.name).replace(/\)/g, "\\)")}) (${album.playcount} ${plays_plural})`
        if (length + (row.length + 1) > 2048 || page.length > 19) { // + 1 = line break
            pages.push(page.join("\n"));
            page = [row];
            length = row.length + 1;
        } else {
            page.push(row);
            length += row.length + 1;
        }
    }
    pages.push(page.join("\n"));

    let album_thumbnail = albums[0].image[2]["#text"];
    if (!album_thumbnail) {
        album_thumbnail = "https://lastfm-img2.akamaized.net/i/u/174s/c6f59c1e5e7240a4c0d427abd71f3dbb.png";
    }

    let posessive = lf_user[lf_user.length-1].toLowerCase() == "s" ? "'" : "'s";
    let embed = new discord.RichEmbed()
    .setAuthor(`${lf_user}${posessive} Top Albums`,`https://i.imgur.com/LZmYwDG.png`, `https://www.last.fm/user/${lf_user}/library/albums?date_preset=${date_preset}`)
    .setTitle(display_time)
    .setThumbnail(album_thumbnail)
    .setColor(0x2f8f5e);

    functions.embedPages(message, embed, pages, 600000);
    return;

}

const lf_top_tracks = async function (message, args) {

    let {
        timeframe,
        date_preset,
        display_time,
        defaulted
    } = getTimeFrame(args[0]);

    let username = defaulted ? args[0] : args[1]
    if (!username) {
        username = await database.get_lf_user(message.author.id);
    }
    if (!username) {
        return "\\⚠ No Last.fm username linked to your account. Please link a username to your account using `.fm set <username>`, alternatively, use `.fm <username>` to get recent tracks for a specific Last.fm user.";
    }

    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&api_key=${api_key}&format=json&period=${timeframe}&limit=100`);

    let { error } = response.data;
    if (error) {
        if (error == 6) {
            return `\\⚠ ${username} is an invalid Last.fm user.`;
        } else {
            throw new Error(response.data);
        }
    }

    let tracks = response.data.toptracks.track;
    let attr = response.data.toptracks["@attr"];
    let lf_user = attr.user;
    if (!tracks || tracks.length < 1) {
        return `\\⚠ ${lf_user} hasn't listened to any music during this time.`;
    }

    let pages = [];
    let length = 0;
    let page = [];
    for (i=0; i < tracks.length; i++) {
        let track = tracks[i];

        let plays_plural = "Plays"
        if (track.playcount === "1") plays_plural = "Play";

        let row = `${i + 1}. ${track.artist.name.replace(/([\(\)\`\*\~\_])/g, "\\$&")} - [${track.name.replace(/([\(\)\`\*\~\_])/g, "\\$&")}](https://www.last.fm/music/${encodeURIComponent(track.artist.name).replace(/\)/g, "\\)")}/_/${encodeURIComponent(track.name).replace(/\)/g, "\\)")}) (${track.playcount} ${plays_plural})`
        if (length + (row.length + 1) > 2048 || page.length > 19) { // + 1 = line break
            pages.push(page.join("\n"));
            page = [row];
            length = row.length + 1;
        } else {
            page.push(row);
            length += row.length + 1;
        }
    }
    pages.push(page.join("\n"));

    let track_thumbnail = tracks[0].image[2]["#text"];
    if (!track_thumbnail) {
        track_thumbnail = "https://lastfm-img2.akamaized.net/i/u/174s/4128a6eb29f94943c9d206c08e625904.png";
    }

    let posessive = lf_user[lf_user.length-1].toLowerCase() == "s" ? "'" : "'s";
    let embed = new discord.RichEmbed()
    .setAuthor(`${lf_user}${posessive} Top Tracks`,`https://i.imgur.com/RFO9qp1.png`, `https://www.last.fm/user/${lf_user}/library/tracks?date_preset=${date_preset}`)
    .setTitle(display_time)
    .setThumbnail(track_thumbnail)
    .setColor(0x2b61fb);

    functions.embedPages(message, embed, pages, 600000);
    return;

}

const lf_profile = async function (message, username) {

    if (!username) {
        username = await database.get_lf_user(message.author.id);
    }
    if (!username) {
        return "\\⚠ No Last.fm username linked to your account. Please link a username to your account using `.fm set <username>`, alternatively, use `.fm profile <username>` to see the Last.fm profile of a specific user.";
    }

    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(username)}&api_key=${api_key}&format=json`)
    
    let { error } = response.data;
    if (error) {
        if (error == 6) {
            return `\\⚠ ${username} is an invalid Last.fm user.`;
        } else {
            throw new Error(response.data);
        }
    }

    let user = response.data.user;
    let thumbnail = user.image[2]["#text"];
    let image = user.image[user.image.length-1]["#text"].replace("300x300/", "");

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let date = new Date(0);
    date.setSeconds(user.registered.unixtime);

    let date_string = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

    response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&api_key=${api_key}&format=json`)
    let artist_count = response.data.topartists["@attr"].total;

    response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&api_key=${api_key}&format=json`)
    let album_count = response.data.topalbums["@attr"].total;

    response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&api_key=${api_key}&format=json`)
    let track_count = response.data.toptracks["@attr"].total;

    let embed = new discord.RichEmbed()
    .setAuthor(`${user.name}`,`https://i.imgur.com/YbZ52lN.png`, `https://www.last.fm/user/${user.name}/`)
    .setColor(0xc1222a)
    .setFooter(`Total Scrobbles: ${user.playcount}`)
    .setThumbnail(thumbnail)
    .setURL(image)
    .setDescription(`Scrobbling since ${date_string}`)
    .setTimestamp(date)
    .addField("Library", `Artists: ${artist_count} | Albums: ${album_count} | Tracks: ${track_count}`);

    return { embed: embed };

}

const lf_youtube = async function (message, username) {

    if (!username) {
        username = await database.get_lf_user(message.author.id);
    }
    if (!username) {
        return "\\⚠ No Last.fm username linked to your account. Please link a username to your account using `.fm set <username>`, alternatively, use `.fmyt <username>` to get a youtube video of the most recent song listened to by a specific user.";
    }
    
    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${api_key}&format=json&limit=1`);

    let { error } = response.data;
    if (error) {
        if (error == 6) {
            return `\\⚠ ${username} is an invalid Last.fm user.`;
        } else {
            throw new Error(response.data);
        }
    }

    let track = response.data.recenttracks.track[0];
    let artist = track.artist["#text"];
    let title = track.name;
    let query = `${artist} - ${title}`;

    let nowplaying = (track["@attr"] && track["@attr"].nowplaying == "true");
    let status = nowplaying ? "Now Playing" : "Last Played";        

    let video_link = await youtube.query(query);
    return `${status}: ${video_link}`;

}

const lf_chart = async function (message, args, type="album") {

    let username = await database.get_lf_user(message.author.id);
    if (!username) {
        return "\\⚠ No Last.fm username linked to your account. Please link a username to your account using `.fm set <username>`, alternatively, use `.fm <username>` to get recent tracks for a specific Last.fm user.";
    }

    let grid;
    let time;
    if (args.length < 1) {
        grid = "3x3";
        time = "7day";
    }
    else if (args.length < 2) {
        let gridMatch = args[0].match(/\d+x\d+/i);
        grid = gridMatch ? args[0] : "3x3";
        time = gridMatch ? "7day" : args[0];
    }
    else {
        let gridMatch = args[0].match(/\d+x\d+/i);
        grid = gridMatch ? args[0] : args[1];
        time = gridMatch ? args[1] : args[0];
    }
    let dimension = +grid.split('x')[0] || 3;
    if (dimension > 10) dimension = 10;

    let {
        timeframe,
        display_time
    } = getTimeFrame(time);

    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.gettop${type.toLowerCase()}s&user=${username}&api_key=${api_key}&format=json&period=${timeframe}&limit=${dimension ** 2}`);
    let { error } = response.data;
    if (error) {
        if (error == 6) {
            return `\\⚠ ${username} is an invalid Last.fm user.`;
        } else {
            throw new Error(response.data);
        }
    }

    let collection = response.data[`top${type}s`][type];
    if (!collection || collection.length < 1) {
        return `\\⚠ ${lf_user} hasn't listened to any music during this time.`;
    }
    while (Math.sqrt(collection.length) <= dimension-1) {
        dimension--;
    }
    let screenDimension = 300 * dimension;

    let css = fs.readFileSync("./resources/fmchart.css", {encoding: 'utf8'});
    let htmlString = "";

    htmlString += `<div class="grid">\n`;
    for (let i=0; i<dimension; i++) {

        htmlString += `    <div class="column">\n    `;
        for (let i=0; i<dimension; i++) {
            if (collection.length < 1) break;
            let item = collection.shift();
            let image = item.image[item.image.length-1]["#text"] || (type == "artist" ? 
            "https://lastfm-img2.akamaized.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png" :
            "https://lastfm-img2.akamaized.net/i/u/300x300/c6f59c1e5e7240a4c0d427abd71f3dbb.png");

            if (type == "album") {
                htmlString += [
                    `    <div class="container">\n    `,
                    `        <img src="${image}" width="${300}" height="${300}">\n    `,
                    `        <div class="text">${item.artist.name}<br>${item.name}<br>Plays: ${item.playcount}</div>\n    `,
                    `    </div>\n    `
                ].join(``);
            }
            if (type == "artist") {
                htmlString += [ 
                    `    <div class="container">\n    `,
                    `        <img src="${image}" width="${300}" height="${300}">\n    `,
                    `        <div class="text">${item.name}<br>Plays: ${item.playcount}</div>\n    `,
                    `    </div>\n    `
                ].join(``);
            }
        }
        htmlString += `</div>\n`;

    }
    htmlString += `</div>`;

    htmlString = [
        `<html>\n`,
        `<head>\n`,
        `    <meta charset="UTF-8">\n`,
        `    <link href="https://fonts.googleapis.com/css?family=Roboto+Mono" rel="stylesheet">\n`,
        `</head>\n\n`,
        `<style>\n`,
        `${css}\n`,
        `</style>\n\n`,
        `<body>\n`,
        `${htmlString}\n`,
        `</body>\n\n`,
        `</html>\n`
    ].join(``);


    let image = await html.toImage(htmlString, screenDimension, screenDimension);
    let imageAttachment = new discord.Attachment(image, `${username}-${timeframe}.jpg`);
    let posessive = username[username.length-1].toLowerCase == 's' ? "'" : "'s";
    return [
        `**${username}${posessive}** ${display_time} ${functions.capitalise(type)} Chart`, 
        imageAttachment
    ];

}

//Util Functions

getTimeFrame = (timeframe) => {
    
    let display_time;
    let date_preset;
    let defaulted = false;

    switch (true) {
        case week.includes(timeframe):
            timeframe = "7day";
            display_time = "Last Week";
            date_preset = "LAST_7_DAYS";
            break;
        case month.includes(timeframe):
            timeframe = "1month";
            display_time = "Last Month";
            date_preset = "LAST_30_DAYS";
            break;
        case three_month.includes(timeframe):
            timeframe = "3month";
            display_time = "Last 3 Months";
            date_preset = "LAST_90_DAYS";
            break;
        case six_month.includes(timeframe):
            timeframe = "6month";
            display_time = "Last 6 Months";
            date_preset = "LAST_180_DAYS";
            break;
        case year.includes(timeframe):
            timeframe = "12month";
            display_time = "Last Year";
            date_preset = "LAST_365_DAYS";
            break;
        case overall.includes(timeframe):
            timeframe = "overall";
            display_time = "All Time";
            date_preset = "ALL";
            break;
        default:
            timeframe = "7day";
            display_time = "Last Week";
            date_preset = "LAST_7_DAYS";
            defaulted = true;
    }

    return {
        timeframe: timeframe,
        display_time: display_time,
        date_preset: date_preset,
        defaulted: defaulted
    };
}

getTimeAgo = (time) => {

    let currTime = Date.now() / 1000;
    let timeDiffSecs = currTime - time;
    let timeAgoText;
    let timeAgo;

    if (timeDiffSecs < 60) {            //60 = minute
        timeAgo = Math.floor(timeDiffSecs);
        timeAgoText = timeAgo > 1 ? `${timeAgo}secs ago` : `${timeAgo}sec ago`;
    } else if (timeDiffSecs < 3600) {   //3600 = hour
        timeAgo = Math.floor((timeDiffSecs) / 60);
        timeAgoText = timeAgo > 1 ? `${timeAgo}mins ago` : `${timeAgo}min ago`;
    } else if (timeDiffSecs < 86400) {  //86400 = day
        timeAgo = Math.floor((timeDiffSecs) / 3600);
        timeAgoText = timeAgo > 1 ?  `${timeAgo}hrs ago` :  `${timeAgo}hr ago`;
    } else if (timeDiffSecs < 604800) { //604800 = week
        timeAgo = Math.floor((timeDiffSecs) / 86400);
        timeAgoText = timeAgo > 1 ? `${timeAgo}days ago` : `${timeAgo}day ago`;
    } else {                            //More than a week
        timeAgo = Math.floor((timeDiffSecs) / 604800)
        timeAgoText = timeAgo > 1 ?  `${timeAgo}wks ago` :  `${timeAgo}wk ago`;
    }

    return timeAgoText;
    
}
