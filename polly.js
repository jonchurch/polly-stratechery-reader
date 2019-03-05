const AWS = require("aws-sdk");
const Speaker = require("speaker");
const Stream = require("stream");

const Polly = new AWS.Polly({
  region: process.env.AWS_REGION || "us-east-1", //"eu-west-1",
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET
});

if (!Polly.config.credentials || !Polly.config.credentials.accessKeyId) {
  throw new Error("AWS sdk not configured!");
}

const getPlayer = function() {
  return new Speaker({
    channels: 1,
    bitDepth: 16,
    sampleRate: 16000
  });
};

const params = { OutputFormat: "pcm", VoiceId: "Matthew" };

const synthesize = function(text) {
  return new Promise(function(resolve, reject) {
    params.Text = text;
    Polly.synthesizeSpeech(params, function(err, res) {
      if (err) {
        // console.log("err", err);
        reject(err);
      } else if (res && res.AudioStream instanceof Buffer) {
        resolve(res.AudioStream);
      } else {
        reject(new Error("AudioStream not instanceof Buffer"));
      }
    });
  });
};

const speak = audioBuffer => {
  if (audioBuffer && audioBuffer instanceof Buffer) {
    return new Promise((resolve, reject) => {
      const bufferStream = new Stream.PassThrough();
      bufferStream.end(audioBuffer);
      bufferStream.pipe(getPlayer());
      bufferStream.on("end", () => {
        resolve();
      });
      bufferStream.on("error", err => {
        reject(err);
      });
    });
  } else {
    throw new Error("audioBuffer must be a Buffer");
  }
};

module.exports = { speak, synthesize };
