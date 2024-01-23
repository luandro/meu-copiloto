const { execSync } = require("child_process");

const tts = (text, lang) => {
  const resourcesDir = "../resources/";
  let model;
  switch (lang) {
    case "pt":
      model = "pt/tts/pt_BR-faber-medium.onnx";
      break;
    case "en":
      model = "en/tts/en_US-ryan-high.onnx";
      break;
    default:
      model = "pt/tts/pt_BR-faber-medium.onnx";
      break;
  }
  const execTts = (input) =>
    execSync(
      `echo "${input}" | piper-tts --model ${resourcesDir}${model} --output_raw | aplay -f S16_LE -c1 -r22050`,
    );
  if (Array.isArray(text)) {
    for (const txt of text) {
      execTts(txt);
    }
  } else return execTts(text);
};
const no = () => execSync(`aplay static/nao.wav`);
const yes = () => execSync(`aplay static/sim.wav`);

module.exports = {
  tts,
  yes,
  no,
};
