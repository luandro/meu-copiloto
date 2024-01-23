import React from 'react';

interface RecordButtonProps {
  isListening: boolean;
  start: () => void;
  stop: () => void;
  disabled: boolean;
}

const RecordButton: React.FC<RecordButtonProps> = ({ isListening, start, stop, disabled }) => {
  return (
    <button
      className={`recButton px-4 py-2 ${isListening ? 'Rec' : 'notRec'} text-white font-bold rounded disabled:opacity-50`}
      onClick={() => { isListening ? stop() : start(); }}
      disabled={disabled}
    >
      <svg className="svg-mic" viewBox="0 0 24 24" width="48px" height="48px"><path d="M 12 2 C 10.343 2 9 3.343 9 5 L 9 11 C 9 12.657 10.343 14 12 14 C 13.657 14 15 12.657 15 11 L 15 5 C 15 3.343 13.657 2 12 2 z M 6.0878906 11 C 5.4818906 11 4.9937969 11.537719 5.0917969 12.136719 C 5.5816755 15.136436 7.9811339 17.488992 11 17.921875 L 11 20 C 11 20.552 11.448 21 12 21 C 12.552 21 13 20.552 13 20 L 13 17.921875 C 16.018866 17.488992 18.418325 15.136436 18.908203 12.136719 C 19.006203 11.537719 18.518109 11 17.912109 11 C 17.418109 11 17.010734 11.363563 16.927734 11.851562 C 16.522734 14.206563 14.471 16 12 16 C 9.529 16 7.4772656 14.206563 7.0722656 11.851562 C 6.9892656 11.363563 6.5828906 11 6.0878906 11 z"></path></svg>
    </button>
  );
};
export default RecordButton;