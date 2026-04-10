interface ScreenshotViewerProps {
  url?: string;
  stepNumber: number;
  onClickFullscreen: () => void;
}

export default function ScreenshotViewer({ url, stepNumber, onClickFullscreen }: ScreenshotViewerProps) {
  return (
    <div className="h-full bg-gray-800 flex items-center justify-center p-4 relative group">
      {url ? (
        <>
          <img
            src={url}
            alt={`Step ${stepNumber}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-200 cursor-pointer hover:scale-[1.01]"
            onClick={onClickFullscreen}
            draggable={false}
          />
          {/* Fullscreen hint */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onClickFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg backdrop-blur-sm transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              查看原图
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">截图缺失 (Step {stepNumber})</p>
        </div>
      )}
    </div>
  );
}
