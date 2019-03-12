#!/usr/bin/env node
const chunk = require("lodash.chunk");

const { speak, synthesize } = require("./polly");
const scrapeText = require("./scraper");

const URL =
  process.argv[2] || "https://stratechery.com/2019/the-value-chain-constraint/";

scrapeText(URL)
  .then(text => {
    const textChunks = chunk(text, 3000);
    const audioBlobPromises = textChunks.map(chunk =>
      synthesize(chunk.join(""))
    );
    return Promise.all(audioBlobPromises);
  })
  .then(blobs => Buffer.concat(blobs))
  .then(blob => speak(blob))
  .catch(err => console.log({ err }));
