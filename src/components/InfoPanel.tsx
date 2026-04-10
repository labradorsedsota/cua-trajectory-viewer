import type { TrajectoryData, StepData } from '../types';
import { getActionLabel, getActionCode, isDoneStep, getDoneConclusion } from '../utils/parser';

interface InfoPanelProps {
  data: TrajectoryData;
  step: StepData;
  currentStep: number;
  totalSteps: number;
}

export default function InfoPanel({ data, step, currentStep, totalSteps }: InfoPanelProps) {
  const done = isDoneStep(step);
  const conclusion = done ? getDoneConclusion(step) : null;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Task Card */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">📋 任务</span>
          {data.mosstid && (
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-mono rounded-full">
              {data.mosstid}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{data.task}</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* DONE Conclusion Badge */}
        {done && conclusion && (
          <div className={`
            rounded-xl p-4 border-2 animate-scaleIn
            ${conclusion.passed 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
            }
          `}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-2xl`}>{conclusion.passed ? '✅' : '❌'}</span>
              <span className={`font-bold text-lg ${conclusion.passed ? 'text-green-700' : 'text-red-700'}`}>
                {conclusion.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${conclusion.passed ? 'text-green-800' : 'text-red-800'}`}>
              {conclusion.text.length > 500 ? conclusion.text.slice(0, 500) + '...' : conclusion.text}
            </p>
          </div>
        )}

        {/* Think Card */}
        <div className="rounded-xl bg-primary-50/70 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">🧠 思考</span>
            <span className="text-xs text-gray-400">Step {currentStep + 1}/{totalSteps}</span>
          </div>
          {step.think ? (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {step.think}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">无思考内容</p>
          )}
        </div>

        {/* Action Card */}
        <div className="rounded-xl bg-green-50/70 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-green-500 uppercase tracking-wider">🎯 操作</span>
          </div>
          <div className="space-y-2">
            {step.actions.map((action, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-gray-800">{getActionLabel(action)}</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">{getActionCode(action)}</p>
              </div>
            ))}
            {step.actions.length === 0 && (
              <p className="text-sm text-gray-400 italic">无操作</p>
            )}
          </div>
        </div>
      </div>

      {/* Session Meta - Fixed Bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>⏱ {data.elapsedTime.toFixed(1)}s</span>
            <span>📊 {data.stepCount} 步</span>
          </div>
          <span className="font-mono text-[10px]">Step {currentStep + 1}/{totalSteps}</span>
        </div>
      </div>
    </div>
  );
}
