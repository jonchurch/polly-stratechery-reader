#!/usr/bin/env node
const axios = require("axios");
const cheerio = require("cheerio");
const chunk = require("lodash.chunk");

const { speak, synthesize } = require("./polly");

const URL =
  process.argv[2] || "https://stratechery.com/2015/aggregation-theory/";
axios
  .get(URL) // get the blog page
  .then(response => cheerio.load(response.data)) // load the html
  .then($ => {
    // transform the text
    $("time.updated").remove();
    const allText = $("article")
      .children()
      .text();
    // chunk the text up to send to polly
    const textChunks = chunk(allText, 3000);
    const audioBlobs = textChunks.map(chunk => synthesize(chunk.join("")));
    Promise.all(audioBlobs).then(blobs => {
      const bigBlob = Buffer.concat(blobs);
      // speak the finished audio blob
      speak(bigBlob);
    });
  })
  .catch(err => console.log({ err }));
