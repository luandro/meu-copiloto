const { yes } = require("./tts");
const { exec } = require("child_process");

module.exports = function (friendlyKeywordName, contextFilename) {
  return () => {
    // stop all processes that might be running
    exec("pkill arecord && playerctl pause");
    console.log(`Wake word '${friendlyKeywordName}' detected.`);
    yes();
    console.log(
      `Listening for speech within the context of '${contextFilename}'. Please speak your phrase into the microphone. `,
    );
  };
};
