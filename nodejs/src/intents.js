const { tts, no } = require("./tts");
const { listCalendar, listEmails, listTasks } = require("./api");
const {
  playMusic,
  playRecording,
  startRecording,
  pauseRecording,
  stopRecording,
  unpauseRecording,
} = require("./skills");

module.exports = async function (inference) {
  console.log();
  console.log("Inference:");
  console.log(JSON.stringify(inference, null, 4));
  if (!inference.isUnderstood) {
    no();
  }
  switch (inference.intent) {
    case "time":
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      tts(`Agora são ${currentTime}`);
      break;
    case "record":
      switch (inference.slots.recordAction) {
        case "toque":
        case "tocar":
        case "reproduzir":
          playRecording();
          break;
        case "finalizar":
        case "finalize":
        case "termine":
        case "terminar":
        case "pare":
          stopRecording();
          break;
        case "pause":
          pauseRecording();
          break;
        case "continue":
        case "continuar":
        case "des pause":
          unpauseRecording();
          break;
        default:
          startRecording();
          break;
      }
      break;
    case "listEmails":
      if (inference.slots.date === "hoje") {
        console.log("Hoje!");
      }
      await listEmails();
      break;
    case "listCalendar":
      switch (inference.slots.calendarDate) {
        case "amanhã":
          listCalendar(startTime.toISOString());
          break;
        default:
          listCalendar();
          break;
      }
      break;
    case "listTasks":
      listTasks();
      break;
    case "music":
      playMusic();
      break;
    default:
      break;
  }
  console.log();
  console.log();
  console.log(`Listening for wake word`);
};
