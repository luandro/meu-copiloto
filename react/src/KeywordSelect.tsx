import React from 'react';
import { PorcupineKeyword } from "@picovoice/porcupine-web";

interface KeywordSelectProps {
  porcupineKeywords: PorcupineKeyword[];
  keyword: PorcupineKeyword;
  setSelectedKeyword: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
}

const KeywordSelect: React.FC<KeywordSelectProps> = ({ porcupineKeywords, keyword, setSelectedKeyword, disabled }) => {
  return (
    <div className="mb-4">
      <select
        value={'label' in keyword ? keyword.label : keyword.builtin}
        onChange={setSelectedKeyword}
        disabled={disabled}
        className="keyword-select"
      >
        {porcupineKeywords.map((k) => {
          const displayValue = 'label' in k ? k.label : k.builtin;
          return (
            <option key={displayValue} value={displayValue}>
              {displayValue}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default KeywordSelect;