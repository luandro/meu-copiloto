const { exec, execSync } = require("child_process");
const { tts } = require("./tts");
const fs = require("fs");
const path = require("path");
const os = require("os");
const currentRecordingFile = path.join(os.tmpdir(), "current_recording.txt");
const recFolder = path.join(os.homedir(), "Documentos", "rec");
const whisperModelFolder = process.env.WHISPER_MODEL_FOLDER;

const executeCommand = (command, onSuccess, onError) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      if (onError) onError(error);
      return;
    }
    if (onSuccess) onSuccess(stdout, stderr);
  });
};

const executeSyncCommand = (command) => {
  try {
    return execSync(command).toString().trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
  }
};

const getBluetoothSinkProfile = () => {
  return executeSyncCommand(
    'pacmd list-sinks | grep -B 1 "name:.*bluez_sink" | grep -oP "(?<=<).*(?=>)"',
  );
};

const changeBluetoothProfile = (currentProfile, currentSink) => {
  if (currentProfile !== "a2dp_sink") {
    const btCommand = `pacmd set-card-profile ${currentSink} a2dp_sink`;
    console.log("Running:", btCommand);
    executeCommand(btCommand, null, (error) =>
      console.error("Error changing Bluetooth profile:", error),
    );
  }
};

const openSpotify = () => {
  executeCommand("spotify &", null, (error) =>
    console.error("Error opening Spotify:", error),
  );
};

const tryPlayingMusic = () => {
  executeCommand("playerctl play", null, (error, stdout, stderr) => {
    if (stderr && stderr.includes("No players found")) {
      console.log("No players found, trying again...");
      setTimeout(tryPlayingMusic, 5000); // try again after 5 seconds
    }
  });
};

const playMusic = () => {
  tts("Mudando fone para modo de música, e abrindo tocador");
  const readSinkProfile = getBluetoothSinkProfile();
  const addrParts = readSinkProfile.split(".");
  const currentSink = `${addrParts[0].replace("sink", "card")}.${addrParts[1]}`;
  const currentProfile = addrParts[addrParts.length - 1];
  changeBluetoothProfile(currentProfile, currentSink);
  openSpotify();
  setTimeout(tryPlayingMusic, 7000);
};

const getLatestRecordingDir = () => {
  const recordingDirs = fs
    .readdirSync(recFolder)
    .filter((folder) => fs.statSync(path.join(recFolder, folder)).isDirectory())
    .sort()
    .reverse();
  return recordingDirs.length > 0
    ? path.join(recFolder, recordingDirs[0])
    : null;
};

const getLatestRecording = (latestRecordingDir) => {
  const recordings = fs
    .readdirSync(latestRecordingDir)
    .filter((file) => file.startsWith("recording") && file.endsWith(".wav"));
  return recordings.length > 0
    ? path.join(latestRecordingDir, recordings[0])
    : null;
};

const playRecording = () => {
  const latestRecordingDir = getLatestRecordingDir();
  if (latestRecordingDir) {
    const latestRecording = getLatestRecording(latestRecordingDir);
    if (latestRecording) {
      executeCommand(`aplay ${latestRecording}`, null, (error) =>
        console.error("Error playing the recording:", error),
      );
    } else {
      tts("Não há gravações para reproduzir.");
    }
  }
};

const startRecording = () => {
  if (fs.existsSync(currentRecordingFile)) {
    const recordingDir = fs.readFileSync(currentRecordingFile, "utf8").trim();
    if (recordingDir && fs.existsSync(recordingDir)) {
      tts("Uma gravação já está em andamento.");
      return unpauseRecording();
    }
  }
  const timestamp = Math.floor(new Date().getTime() / 1000).toString();
  const recordingDir = path.join(recFolder, timestamp);
  if (!fs.existsSync(recordingDir)) {
    fs.mkdirSync(recordingDir, { recursive: true });
  }
  fs.writeFileSync(currentRecordingFile, recordingDir);
  tts("Iniciando gravação");
  executeCommand(`arecord -f cd ${recordingDir}/part_1.wav &`);
};

const trimRecordings = (recordings, recordingDir) => {
  recordings.forEach((filePath, index) => {
    const trimmedFilePath = path.join(recordingDir, `trimmed_${index}.wav`);
    const duration = executeSyncCommand(
      `ffprobe -i "${filePath}" -show_entries format=duration -v quiet -of csv="p=0"`,
    );
    const trimmedDuration = parseFloat(duration) - 1.1;
    executeSyncCommand(
      `ffmpeg -i "${filePath}" -vn -acodec pcm_s16le -ar 44100 -ac 2 -ss 0 -t ${trimmedDuration} "${trimmedFilePath}"`,
    );
    fs.unlinkSync(filePath);
    fs.renameSync(trimmedFilePath, filePath);
  });
};

const createRecordingListFile = (recordings, recordingDir) => {
  const listFilePath = path.join(recordingDir, "mylist.txt");
  fs.writeFileSync(
    listFilePath,
    recordings.map((file) => `file '${file}'`).join("\n"),
  );
  return listFilePath;
};

const mergeRecordings = (listFilePath, recordingDir) => {
  executeSyncCommand(
    `ffmpeg -f concat -safe 0 -i "${listFilePath}" -c copy ${recordingDir}/full_recording.wav`,
  );
  const recordingFiles = fs
    .readFileSync(listFilePath, "utf8")
    .split("\n")
    .map((line) => line.replace("file ", "").replace(/'/g, ""));
  recordingFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
  fs.unlinkSync(listFilePath);
};

const applyAudioFilter = (finalFile, recordingDir) => {
  executeSyncCommand(
    `ffmpeg -i ${recordingDir}/full_recording.wav -af anlmdn ${finalFile}`,
  );
  fs.unlinkSync(`${recordingDir}/full_recording.wav`);
};

const transcribeAudio = (finalFile, recordingDir) => {
  const modelFile = path.join(whisperModelFolder, "model.bin");
  if (fs.existsSync(modelFile)) {
    executeCommand(
      `whisper-ctranslate2 ${finalFile} --model_directory ${whisperModelFolder} --vad_filter True -f txt --output_dir ${recordingDir}`,
    );
  } else {
    console.error("Model file not found:", modelFile);
  }
};

const stopRecording = () => {
  try {
    const recordingDir = fs.readFileSync(currentRecordingFile, "utf8").trim();
    tts("Gravação finalizada");
    if (recordingDir && fs.existsSync(recordingDir)) {
      const recordings = fs
        .readdirSync(recordingDir)
        .filter((file) => file.endsWith(".wav"))
        .sort()
        .map((file) => path.join(recordingDir, file));
      if (recordings.length > 0) {
        trimRecordings(recordings, recordingDir);
        const listFilePath = createRecordingListFile(recordings, recordingDir);
        mergeRecordings(listFilePath, recordingDir);
        const finalFile = `${recordingDir}/recording.wav`;
        applyAudioFilter(finalFile, recordingDir);
        transcribeAudio(finalFile, recordingDir);
        fs.unlinkSync(currentRecordingFile);
      }
    }
  } catch (err) {
    tts("Não há gravação em progresso");
  }
};

const pauseRecording = () => {
  try {
    fs.readFileSync(currentRecordingFile, "utf8").trim();
    tts("Gravação pausada");
  } catch (err) {
    tts("Não há gravação em progresso");
  }
};

const unpauseRecording = () => {
  try {
    const recordingDir = fs.readFileSync(currentRecordingFile, "utf8").trim();
    if (recordingDir && fs.existsSync(recordingDir)) {
      tts("Gravação continuada");
      const recordings = fs.readdirSync(recordingDir);
      const recordingPattern = new RegExp(`^part_(\\d+)\\.wav$`);
      let maxIndex = 0;
      recordings.forEach((file) => {
        const match = file.match(recordingPattern);
        if (match) {
          const index = parseInt(match[1], 10);
          if (index > maxIndex) {
            maxIndex = index;
          }
        }
      });
      const newIndex = maxIndex + 1;
      executeCommand(`arecord -f cd ${recordingDir}/part_${newIndex}.wav &`);
    }
  } catch (err) {
    tts("Não há gravação em progresso");
  }
};

module.exports = {
  playMusic,
  startRecording,
  stopRecording,
  pauseRecording,
  unpauseRecording,
  playRecording,
};
