require("dotenv").config();
const { parse } = require("url");

const { startSpeechSynthesisTask } = require("./polly");
const scrapeText = require("./scraper");

const url =
  "https://stratechery.com/2019/airbnb-acquires-hoteltonight-supply-versus-demand-the-hoteltonight-proposition/";

scrapeText(url)
  .then(text => {
    const speed = "85";
    const ssml = `<speak><prosody rate="${speed}%">${text}</prosody></speak>`;
    const key = parse(url).pathname;
    startSpeechSynthesisTask({
      text: ssml,
      key: `${speed}__${key}`
    }).then(task => {
      console.log({ task });
    });
  })
  .catch(err => console.log({ err }));
