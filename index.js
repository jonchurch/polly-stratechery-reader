require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");

const { speak } = require("./polly");

const URL = "https://stratechery.com/2019/the-value-chain-constraint/";
axios
  .get(URL)
  .then(response => cheerio.load(response.data))
  .then($ => {
    let text = [];
    const article = $("article");

    const title = article.find("h1.entry-title").text();
    text.push(title);

    const content = article.find(".entry-content").children();
    const allText = content.text();

    speak(allText.substring(0, 3000));
  })
  .catch(err => console.log({ err }));
