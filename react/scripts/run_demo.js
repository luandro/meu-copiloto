const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const testDataPath = "../resources/test_data.json";
let testData;
if (fs.existsSync(testDataPath)) {
  const testDataRaw = fs.readFileSync(testDataPath, "utf8");
  testData = JSON.parse(testDataRaw);
} else {
  console.error("Test data file does not exist.");
  process.exit(1);
}
const availableLanguages = testData["tests"]["singleKeyword"].map(
  (x) => x["language"],
);

const commands = process.argv.slice(2, -1);
const language = process.argv.slice(-1)[0];

if (!availableLanguages.includes(language)) {
  console.error(
    `Choose the language you would like to run the demo in with "yarn start [language]".\nAvailable languages are ${availableLanguages.join(
      ", ",
    )}`,
  );
  process.exit(1);
}

const version = process.env.npm_package_version;
const suffix = language === "en" ? "" : `_${language}`;
const rootDir = path.join(__dirname, "..", "..");
const resourcesDir = path.join(rootDir, "resources", language);

const libDirectory = path.join(__dirname, "..", "src", "lib");
let publicDirectory = path.join(__dirname, "..", "public", "keywords");
if (fs.existsSync(publicDirectory)) {
  fs.readdirSync(publicDirectory).forEach((k) => {
    fs.unlinkSync(path.join(publicDirectory, k));
  });
} else {
  fs.mkdirSync(publicDirectory, { recursive: true });
}

const keywordJS = [];
if (language !== "en") {
  try {
    const keywords = fs
      .readdirSync(resourcesDir)
      .filter((f) => path.extname(f) === ".ppn");

    keywords.forEach((k) => {
      fs.copyFileSync(
        path.join(resourcesDir, k),
        path.join(publicDirectory, k),
      );
      keywordJS.push(`  {
    label: "${k.replace("_wasm.ppn", "").replace("_", " ")}",
    sensitivity: 0.7,
    publicPath: "keywords/${k}",    
    customWritePath: "${version}_${k}",
  },`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fs.writeFileSync(
  path.join(libDirectory, "porcupineKeywords.js"),
  `const porcupineKeywords = [
${keywordJS.join("\n")}
];

(function () {
  if (typeof module !== "undefined" && typeof module.exports !== "undefined")
    module.exports = porcupineKeywords;
})();`,
);

publicDirectory = path.join(__dirname, "..", "public", "models");
if (fs.existsSync(publicDirectory)) {
  fs.readdirSync(publicDirectory).forEach((k) => {
    fs.unlinkSync(path.join(publicDirectory, k));
  });
} else {
  fs.mkdirSync(publicDirectory, { recursive: true });
}

const modelName = `porcupine_params${suffix}.pv`;
fs.copyFileSync(
  path.join(resourcesDir, modelName),
  path.join(publicDirectory, modelName),
);

fs.writeFileSync(
  path.join(libDirectory, "porcupineModel.js"),
  `const porcupineModel = {
  publicPath: "models/${modelName}",  
  customWritePath: "${version}_${modelName}",
};

(function () {
  if (typeof module !== "undefined" && typeof module.exports !== "undefined")
    module.exports = porcupineModel;
})();`,
);

const command = process.platform === "win32" ? "npx.cmd" : "npx";

child_process.fork("react-scripts", commands, {
  execPath: command,
});
