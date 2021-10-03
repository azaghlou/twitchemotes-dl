const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require("fs");
const colors = require('colors');
const [bin, sourcePath, ...args] = process.argv;
const [channel, debug] = args;
const url = `https://twitchemotes.com/channels/${channel}`;

if (!channel)
  return console.error(`Usage : scrap.js [channelID]\nExample : node ./scrap.js 21587971`);

request(url, (error, respone, html) => {
  if (!error && respone.statusCode == 200) {

    const $ = cheerio.load(html);
    const streamer = $('.card-header').find('a').text() || channel;
    const emotes = $('center').map((i, container) => {
      if ($(container).find('img') && $(container).text)
        return {
          link: $(container).find('img')[0].attribs.src.replace('/2.0', '/3.0'),
          name: $(container).text().trim()
        }
    }).get()

    if (!fs.existsSync(streamer)) {
      fs.mkdirSync(streamer);
    }

    emotes.forEach(emote => {
      request(emote.link).on('response', res => {
        if (respone.statusCode == 200) {
          console.log(`${'[OK]'.green} ${emote.link}`);
        } else {
          console.log(`${'[FAILED]'.blue} ${emote.link}`);
        }
      }).pipe(fs.createWriteStream(`${streamer}/${emote.name}.gif`));
    })
  }
})