const OpenAI = require("openai").default;
const { toFile } = require("openai");
const fs = require("fs").promises;
const player = require("play-sound")((opts = {}));
const path = require("path");
// gets API Key from environment variable OPENAI_API_KEY
const openai = new OpenAI();
const tmp = require("tmp");
const speechFile = tmp.tmpNameSync({ postfix: ".mp3" });

module.exports = function speakText(text) {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  (async () => {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd", // changed to the best TTS model
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(speechFile, buffer);

    player.play(speechFile, function (err) {
      if (err) throw err;
      readline.close();
    });
  })();
};
