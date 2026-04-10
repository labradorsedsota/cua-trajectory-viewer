import { useState, useCallback, useRef } from 'react';
import { parseFolder } from '../utils/parser';
import type { TrajectoryData } from '../types';

interface UploadPageProps {
  onLoaded: (data: TrajectoryData) => void;
}

export default function UploadPage({ onLoaded }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    setLoading(true);
    try {
      const data = await parseFolder(files);
      if (data.steps.length === 0) {
        throw new Error('文件夹为空，未找到任何轨迹步骤');
      }
      onLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败');
    } finally {
      setLoading(false);
    }
  }, [onLoaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    // Try to get directory entries
    const files: File[] = [];
    const entries: FileSystemEntry[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.();
      if (entry) entries.push(entry);
    }

    if (entries.length > 0) {
      // Recursively read directory
      const readEntry = async (entry: FileSystemEntry, path: string = ''): Promise<File[]> => {
        if (entry.isFile) {
          return new Promise((resolve) => {
            (entry as FileSystemFileEntry).file((file) => {
              // Create a new file with the relative path
              const newFile = new File([file], file.name, { type: file.type });
              Object.defineProperty(newFile, 'webkitRelativePath', {
                value: path + file.name,
                writable: false,
              });
              resolve([newFile]);
            }, () => resolve([]));
          });
        } else if (entry.isDirectory) {
          const dirReader = (entry as FileSystemDirectoryEntry).createReader();
          return new Promise((resolve) => {
            const allFiles: File[] = [];
            const readBatch = () => {
              dirReader.readEntries(async (entries) => {
                if (entries.length === 0) {
                  resolve(allFiles);
                  return;
                }
                for (const childEntry of entries) {
                  const childFiles = await readEntry(childEntry, path + entry.name + '/');
                  allFiles.push(...childFiles);
                }
                readBatch(); // Continue reading (readEntries may batch)
              }, () => resolve(allFiles));
            };
            readBatch();
          });
        }
        return [];
      };

      for (const entry of entries) {
        const entryFiles = await readEntry(entry);
        files.push(...entryFiles);
      }

      if (files.length > 0) {
        handleFiles(files);
        return;
      }
    }

    // Fallback to regular file list
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 animate-fadeIn">
      {/* Logo & Title */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 mb-6 shadow-lg shadow-primary-500/25">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CUA Trajectory Viewer</h1>
        <p className="text-gray-500 text-lg">可视化回放 Agent 操作轨迹</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`
          relative w-full max-w-xl rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'drop-active border-primary-500 scale-[1.02]' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/30'
          }
          ${loading ? 'pointer-events-none opacity-60' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center py-16 px-8">
          {loading ? (
            <>
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-6" />
              <p className="text-gray-600 font-medium">解析中...</p>
            </>
          ) : (
            <>
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300
                ${isDragging ? 'bg-primary-100' : 'bg-gray-100'}
              `}>
                <svg className={`w-10 h-10 transition-colors duration-300 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold text-lg mb-2">
                {isDragging ? '松开以加载轨迹' : '拖拽轨迹文件夹到此处'}
              </p>
              <p className="text-gray-400 text-sm">或点击选择文件夹</p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          {...{ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>}
          onChange={handleInputChange}
        />
      </div>

      {/* Error Toast */}
      {error && (
        <div className="mt-6 px-6 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-scaleIn">
          ❌ {error}
        </div>
      )}

      {/* Footer hint */}
      <p className="mt-8 text-gray-400 text-xs">
        支持标准 CUA 轨迹文件夹格式 · 所有数据仅在浏览器本地处理
      </p>

      {/* Browser hint */}
      <p className="mt-2 text-gray-300 text-xs">
        推荐使用 Chrome / Edge 浏览器
      </p>
    </div>
  );
}

// TypeScript augmentation for webkitdirectory
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}
