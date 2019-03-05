#!/usr/bin/env node
const axios = require("axios");
const cheerio = require("cheerio");
const chunk = require("lodash.chunk");

const { speak, synthesize } = require("./polly");

const URL =
  process.argv[2] || "https://stratechery.com/2019/the-value-chain-constraint/";
axios
  .get(URL)
  .then(response => cheerio.load(response.data))
  .then($ => {
    $("time.updated").remove();

    const allText = $("article")
      .children()
      .text();
    const textChunks = chunk(allText, 3000);
    const audioBlobs = textChunks.map(chunk => synthesize(chunk.join("")));
    Promise.all(audioBlobs).then(blobs => {
      const bigBlob = Buffer.concat(blobs);
      speak(bigBlob);
    });
  })
  .catch(err => console.log({ err }));
