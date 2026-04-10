export interface ActionDetail {
  name?: string;
  action_type: string;
  input?: {
    action: string;
    coordinate?: [number, number];
    text?: string;
  };
  raw_response?: string;
}

export interface StepData {
  index: number;
  think: string;
  actions: ActionDetail[];
  rawResp: string;
  screenshotUrl?: string;
  visualUrl?: string;
}

export interface TrajectoryData {
  task: string;
  mosstid?: string;
  steps: StepData[];
  elapsedTime: number;
  stepCount: number;
  screenshots: Map<number, string>;       // step index -> blob URL
  visualScreenshots: Map<number, string>;  // step index -> blob URL
}
