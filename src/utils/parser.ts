import type { TrajectoryData, StepData, ActionDetail } from '../types';

function extractMosstid(task: string): string | undefined {
  const match = task.match(/\[mosstid:\s*([^\]]+)\]/);
  return match ? match[1].trim() : undefined;
}

function parseThinkAction(resp: string): { think: string; actions: ActionDetail[] } {
  let think = '';
  const thinkMatch = resp.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch) {
    think = thinkMatch[1].trim();
  }

  const actions: ActionDetail[] = [];
  const actionMatch = resp.match(/<action>([\s\S]*?)<\/action>/);
  if (actionMatch) {
    try {
      // The action content is a Python-style list of dicts. Parse it.
      let actionStr = actionMatch[1].trim();
      // Convert Python-style to JSON-compatible
      actionStr = actionStr
        .replace(/'/g, '"')
        .replace(/True/g, 'true')
        .replace(/False/g, 'false')
        .replace(/None/g, 'null');
      
      // Try to parse as JSON array
      try {
        const parsed = JSON.parse(actionStr);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            actions.push({
              name: item.name,
              action_type: item.action_type || 'unknown',
              input: item.input,
              raw_response: item.raw_response,
            });
          }
        }
      } catch {
        // If JSON parse fails, try to extract action_type and input manually
        const typeMatch = actionStr.match(/"action_type":\s*"([^"]+)"/);
        const actionTypeMatch = actionStr.match(/"action":\s*"([^"]+)"/);
        const coordMatch = actionStr.match(/"coordinate":\s*\[(\d+),\s*(\d+)\]/);
        const textMatch = actionStr.match(/"text":\s*"([^"]*?)"/);
        
        actions.push({
          action_type: typeMatch ? typeMatch[1] : 'unknown',
          input: {
            action: actionTypeMatch ? actionTypeMatch[1] : 'unknown',
            ...(coordMatch ? { coordinate: [parseInt(coordMatch[1]), parseInt(coordMatch[2])] as [number, number] } : {}),
            ...(textMatch ? { text: textMatch[1] } : {}),
          },
        });
      }
    } catch {
      // Fallback: just store raw
      actions.push({ action_type: 'unknown', raw_response: actionMatch[1] });
    }
  }

  return { think, actions };
}

export async function parseFolder(files: FileList | File[]): Promise<TrajectoryData> {
  const fileArray = Array.from(files);
  
  // Find result.json
  const resultFile = fileArray.find(f => f.name === 'result.json' || f.webkitRelativePath?.endsWith('/result.json'));
  if (!resultFile) {
    throw new Error('未找到 result.json，请确认文件夹格式');
  }

  const resultText = await resultFile.text();
  let resultJson: {
    task: string;
    history_resps: string[];
    elapsed_time_sec: number;
    step_count: number;
  };
  
  try {
    resultJson = JSON.parse(resultText);
  } catch {
    throw new Error('result.json 格式错误');
  }

  if (!resultJson.history_resps || !Array.isArray(resultJson.history_resps)) {
    throw new Error('result.json 缺少 history_resps 字段');
  }

  // Build screenshot maps
  const screenshots = new Map<number, string>();
  const visualScreenshots = new Map<number, string>();

  for (const file of fileArray) {
    const path = file.webkitRelativePath || file.name;
    const trajectoryMatch = path.match(/trajectory\/(\d+)\.png$/);
    const visualMatch = path.match(/trajectory_visual\/(\d+)\.png$/);

    if (trajectoryMatch) {
      const idx = parseInt(trajectoryMatch[1]);
      const url = URL.createObjectURL(file);
      screenshots.set(idx, url);
    } else if (visualMatch) {
      const idx = parseInt(visualMatch[1]);
      const url = URL.createObjectURL(file);
      visualScreenshots.set(idx, url);
    }
  }

  // Parse steps — skip leading screenshot-only entries (no real action)
  const allParsed = resultJson.history_resps.map((resp, i) => ({
    origIndex: i,
    parsed: parseThinkAction(resp),
    rawResp: resp,
  }));

  // Determine how many leading entries to skip:
  // An entry is "initial screenshot" if think is empty AND all actions are screenshot/tool_use with action=screenshot
  let skipCount = 0;
  for (const entry of allParsed) {
    const { think, actions } = entry.parsed;
    const isScreenshotOnly = think === '' && actions.length > 0 &&
      actions.every(a => a.input?.action === 'screenshot' || (a.action_type === 'tool_use' && a.input?.action === 'screenshot'));
    if (isScreenshotOnly) {
      skipCount++;
    } else {
      break; // stop at first real step
    }
  }

  // Extract initial thinking from skipped entries
  let initialThinking: string | undefined;
  if (skipCount > 0) {
    const parts: string[] = [];
    for (let s = 0; s < skipCount; s++) {
      const entry = allParsed[s];
      // Priority 1: <think> content
      if (entry.parsed.think) {
        parts.push(entry.parsed.think);
      } else {
        // Priority 2: [THINKING] from raw_response inside actions
        for (const action of entry.parsed.actions) {
          const raw = action.raw_response || '';
          const thinkMatch = raw.match(/\[THINKING\]\s*([\s\S]*?)(?:\[TOOL_USE\]|$)/);
          if (thinkMatch && thinkMatch[1].trim()) {
            parts.push(thinkMatch[1].trim());
          }
        }
      }
    }
    if (parts.length > 0) {
      initialThinking = parts.join('\n\n');
    }
  }

  // Screenshot files are numbered sequentially and correspond 1:1 to the
  // *visible* steps (after skipping leading screenshot-only entries).
  // So Step 1 → 1.png, Step 2 → 2.png, etc.
  const steps: StepData[] = allParsed.slice(skipCount).map((entry, i) => {
    const fileNum = i + 1; // sequential index among visible steps
    return {
      index: i,
      think: entry.parsed.think,
      actions: entry.parsed.actions,
      rawResp: entry.rawResp,
      screenshotUrl: screenshots.get(fileNum),
      visualUrl: visualScreenshots.get(fileNum),
    };
  });

  const mosstid = extractMosstid(resultJson.task);
  // Clean task text (remove the mosstid tag and separator)
  let cleanTask = resultJson.task;
  cleanTask = cleanTask.replace(/\n---mano inner test---\n/g, '\n').replace(/\[mosstid:\s*[^\]]+\]/g, '').trim();

  return {
    task: cleanTask,
    mosstid,
    initialThinking,
    steps,
    elapsedTime: resultJson.elapsed_time_sec,
    stepCount: resultJson.step_count || resultJson.history_resps.length,
    screenshots,
    visualScreenshots,
  };
}

export function getActionLabel(action: ActionDetail): string {
  if (action.action_type === 'DONE') return '✅ DONE';
  
  const input = action.input;
  if (!input) return action.action_type;

  switch (input.action) {
    case 'screenshot':
      return '📸 Screenshot';
    case 'left_click':
      return `🖱️ Click (${input.coordinate?.[0]}, ${input.coordinate?.[1]})`;
    case 'right_click':
      return `🖱️ Right Click (${input.coordinate?.[0]}, ${input.coordinate?.[1]})`;
    case 'double_click':
      return `🖱️ Double Click (${input.coordinate?.[0]}, ${input.coordinate?.[1]})`;
    case 'type':
      return `⌨️ Type "${input.text && input.text.length > 30 ? input.text.slice(0, 30) + '...' : input.text}"`;
    case 'key':
      return `⌨️ Key: ${input.text}`;
    case 'scroll':
      return `🔄 Scroll (${input.coordinate?.[0]}, ${input.coordinate?.[1]})`;
    default:
      return `${input.action}${input.coordinate ? ` (${input.coordinate[0]}, ${input.coordinate[1]})` : ''}`;
  }
}

export function getActionCode(action: ActionDetail): string {
  if (action.action_type === 'DONE') return 'DONE';
  const input = action.input;
  if (!input) return action.action_type;
  
  let code = `${input.action}`;
  if (input.coordinate) code += ` (${input.coordinate[0]}, ${input.coordinate[1]})`;
  if (input.text) code += ` "${input.text}"`;
  return code;
}

export function isDoneStep(step: StepData): boolean {
  return step.actions.some(a => a.action_type === 'DONE');
}

export function getDoneConclusion(step: StepData): { passed: boolean; text: string } {
  const think = step.think;
  const passed = /PASS|成功|正常/.test(think) && !/FAIL|失败/.test(think);
  return { passed, text: think };
}
