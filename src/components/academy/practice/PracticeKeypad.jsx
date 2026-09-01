import React from 'react';

export function PracticeKeypad({
  onInputNumber,
  correctVal,
  enteredVal,
  isSolved,
  isError
}) {
  return (
    <div className="practice-keypad-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
        let btnClass = 'practice-key-btn';
        if (isSolved && num === correctVal) {
          btnClass += ' key-solved';
        } else if (isError && num === enteredVal) {
          btnClass += ' key-error';
        }

        return (
          <button
            key={num}
            type="button"
            className={btnClass}
            onClick={() => onInputNumber(num)}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}
