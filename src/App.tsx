import { useState } from 'react';
import UploadPage from './components/UploadPage';
import ReplayPage from './components/ReplayPage';
import type { TrajectoryData } from './types';

export default function App() {
  const [data, setData] = useState<TrajectoryData | null>(null);

  const handleReset = () => {
    // Revoke blob URLs to free memory
    if (data) {
      data.screenshots.forEach(url => URL.revokeObjectURL(url));
      data.visualScreenshots.forEach(url => URL.revokeObjectURL(url));
    }
    setData(null);
  };

  if (data) {
    return <ReplayPage data={data} onReset={handleReset} />;
  }

  return <UploadPage onLoaded={setData} />;
}
