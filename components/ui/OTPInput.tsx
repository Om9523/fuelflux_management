'use client';

import React, { useRef, useState, useEffect } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, error }) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync digits array if the parent value is cleared/changed externally
  useEffect(() => {
    if (value === '') {
      setDigits(Array(6).fill(''));
    } else if (value.length === 6) {
      setDigits(value.split(''));
    }
  }, [value]);

  const handleChange = (index: number, val: string) => {
    // Only allow numeric input
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (!cleanVal) return;

    // Use only the last character if multiple characters are input (safeguard)
    const singleDigit = cleanVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    setDigits(newDigits);

    const completedCode = newDigits.join('');
    onChange(completedCode);

    // Auto-focus next input box if digit entered
    if (index < 5 && singleDigit) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current input is empty, focus previous cell and erase it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Erase current cell
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
        onChange(newDigits.join(''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted value contains at least 6 digits
    const digitsOnly = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
    if (digitsOnly.length === 6) {
      const newDigits = digitsOnly.split('');
      setDigits(newDigits);
      onChange(digitsOnly);
      
      // Focus the last input box
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2.5 justify-between w-full max-w-sm">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              value={digits[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={`
                w-12 h-14 text-center text-xl font-bold text-text-primary rounded-xl border border-slate-200 bg-white outline-none transition-all duration-300
                focus:border-primary focus:ring-4 focus:ring-primary/10
                ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}
              `}
            />
          ))}
      </div>
      {error && (
        <span className="text-xs font-semibold text-red-500 animate-fadeIn mt-1 flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};
