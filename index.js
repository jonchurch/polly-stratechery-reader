#!/usr/bin/env node
require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const chunk = require("lodash.chunk");
const fs = require("fs");
const url = require("url");

const { speak, synthesize } = require("./polly");

const captureTitleFromUrl = url => {
  const reg = /.*\/(\w+(?:\-\w+)?)[?\.]?/;
  const title = reg.exec(url);
  return title[1];
};

const URL =
  process.argv[2] || "https://stratechery.com/2015/aggregation-theory/";
const outputFormat = process.argv[3] || "pcm";

axios
  .get(URL, {
    headers: {
      Cookie: process.env.STRAT_COOKIE
    }
  }) // get the blog page
  .then(response => cheerio.load(response.data)) // load the html
  .then($ => {
    // transform the text
    $("time.updated").remove();
    const allText = $("article")
      .children()
      .text();
    // chunk the text up to send to polly
    const textChunks = chunk(allText, 3000);
    const audioBlobs = textChunks.map(chunk =>
      synthesize(chunk.join(""), outputFormat)
    );
    return Promise.all(audioBlobs)
      .then(blobs => {
        const urlTitle = captureTitleFromUrl(URL);

        const bigBlob = Buffer.concat(blobs);
        if (outputFormat === "pcm") {
          speak(bigBlob);
        } else {
          saveToDisk(bigBlob, urlTitle);
        }
        // speak the finished audio blob
      })
      .catch(err => Promise.reject(err));
  })
  .catch(err => console.error(err));

function saveToDisk(audioData, fileName) {
  if (!fileName) {
    throw new Error("File destination required before saving to disk");
  }
  const destination = `./output/${fileName}.mp3`;
  fs.writeFile(destination, audioData, err => {
    if (!err) {
      console.log("Success");
    } else {
      console.log({ err });
    }
  });
}
