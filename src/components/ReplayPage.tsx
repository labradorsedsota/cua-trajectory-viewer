import { useState, useMemo } from 'react';
import type { TrajectoryData } from '../types';
import { useKeyboard } from '../hooks/useKeyboard';
import ScreenshotViewer from './ScreenshotViewer';
import InfoPanel from './InfoPanel';
import StepNavigation from './StepNavigation';
import Lightbox from './Lightbox';

interface ReplayPageProps {
  data: TrajectoryData;
  onReset: () => void;
}

export default function ReplayPage({ data, onReset }: ReplayPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showVisual, setShowVisual] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const totalSteps = data.steps.length;

  const goTo = (step: number) => {
    const clamped = Math.max(0, Math.min(step, totalSteps - 1));
    setCurrentStep(clamped);
  };

  const handlers = useMemo(() => ({
    onLeft: () => goTo(currentStep - 1),
    onRight: () => goTo(currentStep + 1),
    onHome: () => goTo(0),
    onEnd: () => goTo(totalSteps - 1),
  }), [currentStep, totalSteps]);

  useKeyboard(handlers);

  const step = data.steps[currentStep];
  const currentScreenshot = showVisual
    ? (step.visualUrl || step.screenshotUrl)
    : (step.screenshotUrl || step.visualUrl);

  const hasVisual = data.visualScreenshots.size > 0;
  const hasOriginal = data.screenshots.size > 0;
  const canToggle = hasVisual && hasOriginal;

  return (
    <div className="h-screen flex flex-col bg-gray-50 animate-fadeIn">
      {/* Top Bar */}
      <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shadow-sm">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          重新上传
        </button>

        <div className="h-5 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-800 text-sm">CUA Trajectory Viewer</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="font-mono bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-medium">
            Step {currentStep + 1} / {totalSteps}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Screenshot Area - 60% */}
        <div className="w-[60%] flex-shrink-0">
          <ScreenshotViewer
            url={currentScreenshot}
            stepNumber={currentStep + 1}
            onClickFullscreen={() => currentScreenshot && setLightboxUrl(currentScreenshot)}
          />
        </div>

        {/* Info Panel - 40% */}
        <div className="w-[40%] border-l border-gray-200 overflow-hidden">
          <InfoPanel
            data={data}
            step={step}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepChange={goTo}
        showVisual={showVisual}
        onToggleVisual={() => setShowVisual(!showVisual)}
        canToggle={canToggle}
      />

      {/* Lightbox */}
      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  );
}
