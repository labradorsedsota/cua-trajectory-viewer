import { useState, useEffect, useCallback } from 'react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  showVisual: boolean;
  onToggleVisual: () => void;
  canToggle: boolean;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onStepChange,
  showVisual,
  onToggleVisual,
  canToggle,
}: StepNavigationProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const useDots = totalSteps <= 20;

  const [inputValue, setInputValue] = useState(String(currentStep + 1));
  const [isEditing, setIsEditing] = useState(false);

  // Sync input when step changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(currentStep + 1));
    }
  }, [currentStep, isEditing]);

  const commitInput = useCallback(() => {
    setIsEditing(false);
    const num = parseInt(inputValue);
    if (!isNaN(num) && num >= 1 && num <= totalSteps) {
      onStepChange(num - 1);
    } else {
      setInputValue(String(currentStep + 1));
    }
  }, [inputValue, totalSteps, currentStep, onStepChange]);

  return (
    <div className="flex-shrink-0 h-16 bg-white border-t border-gray-200 flex items-center px-6 gap-4 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">

      {/* Progress Area - Left/Center */}
      <div className="flex-1 flex items-center justify-center">
        {useDots ? (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <button
                key={i}
                onClick={() => onStepChange(i)}
                className={`
                  rounded-full transition-all duration-200
                  ${i === currentStep
                    ? 'w-6 h-2.5 bg-primary-500'
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-primary-300'
                  }
                `}
                title={`Step ${i + 1}`}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full max-w-md">
            <span className="text-xs text-gray-400 font-mono w-8 text-right">1</span>
            <input
              type="range"
              min={0}
              max={totalSteps - 1}
              value={currentStep}
              onChange={(e) => onStepChange(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary-500
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-125
              "
            />
            <span className="text-xs text-gray-400 font-mono w-8">{totalSteps}</span>
          </div>
        )}
      </div>

      {/* Compact Nav Group:  ⏮ ◀  [input] / total  ▶ ⏭ */}
      <div className="flex items-center gap-1 bg-gray-50 rounded-xl px-1.5 py-1 border border-gray-200">
        <button
          onClick={() => onStepChange(0)}
          disabled={isFirst}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="第一步 (Home)"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => onStepChange(currentStep - 1)}
          disabled={isFirst}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="上一步 (←)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Editable Step Counter */}
        <div className="flex items-center gap-0.5 px-2 font-mono text-sm font-medium text-gray-700">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsEditing(true);
            }}
            onFocus={(e) => {
              setIsEditing(true);
              e.target.select();
            }}
            onBlur={commitInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitInput();
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === 'Escape') {
                setIsEditing(false);
                setInputValue(String(currentStep + 1));
                (e.target as HTMLInputElement).blur();
              }
              // Stop keyboard nav from firing while editing
              e.stopPropagation();
            }}
            className="w-8 text-center bg-white border border-gray-300 rounded px-1 py-0.5 text-sm font-mono font-medium text-gray-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors"
            title="输入步骤数字跳转"
          />
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">{totalSteps}</span>
        </div>

        <button
          onClick={() => onStepChange(currentStep + 1)}
          disabled={isLast}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="下一步 (→)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => onStepChange(totalSteps - 1)}
          disabled={isLast}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="最后一步 (End)"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Toggle Visual/Original */}
      {canToggle && (
        <>
          <div className="h-5 w-px bg-gray-200" />
          <button
            onClick={onToggleVisual}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${showVisual
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            title="切换截图类型"
          >
            {showVisual ? '📌 标注' : '📷 原始'}
          </button>
        </>
      )}
    </div>
  );
}
