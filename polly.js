const AWS = require("aws-sdk");
const Speaker = require("speaker");
const Stream = require("stream");

//Warning: Don't hardcode your AWS Keys
//Read more at http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
const Polly = new AWS.Polly({
  region: process.env.AWS_REGION || "us-east-1", //"eu-west-1",
  accessKeyId: process.env.ACCESS_KEY, //'REPLACETHISWITHYOURACCESSKEYID',
  secretAccessKey: process.env.SECRET //'rePlaceThisWithYourSecretAccessKey1234567890'
});

const getPlayer = function() {
  return new Speaker({
    channels: 1,
    bitDepth: 16,
    sampleRate: 16000
  });
};

const params = { OutputFormat: "pcm", VoiceId: "Raveena" };

const speak = function(text) {
  params.Text = text;
  Polly.synthesizeSpeech(params, function(err, res) {
    if (err) {
      console.log("err", err);
    } else if (res && res.AudioStream instanceof Buffer) {
      const bufferStream = new Stream.PassThrough();
      bufferStream.end(res.AudioStream);
      bufferStream.pipe(getPlayer());
    }
  });
};

module.exports = { speak: speak };
