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

  return (
    <div className="flex-shrink-0 h-16 bg-white border-t border-gray-200 flex items-center px-6 gap-4 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      {/* Nav Buttons - Left */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onStepChange(0)}
          disabled={isFirst}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="第一步 (Home)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => onStepChange(currentStep - 1)}
          disabled={isFirst}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="上一步 (←)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Progress Area - Center */}
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

      {/* Step Counter */}
      <div className="text-sm font-mono text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
        {currentStep + 1} / {totalSteps}
      </div>

      {/* Nav Buttons - Right */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onStepChange(currentStep + 1)}
          disabled={isLast}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="下一步 (→)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => onStepChange(totalSteps - 1)}
          disabled={isLast}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="最后一步 (End)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
