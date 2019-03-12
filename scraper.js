const axios = require("axios");
const cheerio = require("cheerio");

const scrapeText = url => {
  return axios({
    url,
    method: "GET",
    headers: {
      Cookie: process.env.COOKIE
    }
  })
    .then(response => cheerio.load(response.data))
    .then($ => {
      $("time.updated").remove();

      return $("article")
        .children()
        .text();
    });
};

module.exports = scrapeText;
