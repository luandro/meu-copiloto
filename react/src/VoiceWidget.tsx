import React, { useEffect, useState } from "react";
import { PorcupineKeyword } from "@picovoice/porcupine-web";
import { usePorcupine } from "@picovoice/porcupine-react";
import RecordButton from './RecordButton';
import KeywordSelect from './KeywordSelect';
import StatusIndicators from './StatusIndicators';

import porcupineModel from "./lib/porcupineModel";
import porcupineKeywords from "./lib/porcupineKeywords";

// Load the accessKey from .env file
const accessKey = process.env.REACT_APP_ACCESS_KEY;

export default function VoiceWidget() {
  const [keywordDetections, setKeywordDetections] = useState<string[]>([]);
  const [keyword, setKeyword] = useState<PorcupineKeyword>(porcupineKeywords[0]);
  const [accessKeyError, setAccessKeyError] = useState<string | null>(null);

  const {
    keywordDetection,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
    release
  } = usePorcupine();

  // Initialize Porcupine on mount
  useEffect(() => {
    const initEngine = async () => {
      if (!accessKey) {
        setAccessKeyError("AccessKey is not set in the .env file.");
        return;
      }

      await init(
        accessKey,
        [keyword],
        porcupineModel
      );
    };

    initEngine();
  }, [init, keyword]);

  const setSelectedKeyword = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKeyword = porcupineKeywords.find(k => k.label === event.target.value);
    if (selectedKeyword) {
      setKeyword(selectedKeyword);
    }
  };
  useEffect(() => {
    if (keywordDetection !== null) {
      setKeywordDetections((oldVal) => [...oldVal, keywordDetection.label])
      console.log(`${keywordDetection.label} has been called. Take action!`)
      stop()
    }
  }, [keywordDetection])


  return (
    <div className="flex justify-center items-center h-screen">
      <div className="voice-widget py-12 px-24 bg-white shadow rounded-lg flex flex-col items-center space-y-12">
        <StatusIndicators
          isLoaded={isLoaded}
          error={error ? error.toString() : null}
          accessKeyError={accessKeyError}
        />
        <KeywordSelect
          porcupineKeywords={porcupineKeywords}
          keyword={keyword}
          setSelectedKeyword={setSelectedKeyword}
          disabled={!isLoaded}
        />
        <RecordButton
          isListening={isListening}
          start={start}
          stop={stop}
          disabled={!isLoaded}
        />
        <div
        >
          <button
            className="px-4 py-2 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 transition ease-in duration-200 text-center"
            onClick={() => release()}
            disabled={error !== null || accessKeyError !== null || !isLoaded}
          >
            Release
          </button>
        </div>
        <div className="mb-4 w-full">
          <h3 className="text-lg font-semibold text-center">Keyword Detections:</h3>
          {keywordDetections.length > 0 && (
            <ul className="list-disc pl-5">
              {keywordDetections.map((label: string, index: number) => (
                <li key={index} className="text-gray-700">{label}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
