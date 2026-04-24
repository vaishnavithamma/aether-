import { useState, useCallback } from 'react';
import { useDetectionStore } from '../store/detectionStore';

export function useDetection() {
  const { detectData, setDetectData } = useDetectionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDetection = useCallback(async (fileHash: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_hash: fileHash })
      });
      if (!res.ok) throw new Error('Detection failed');
      const data = await res.json();
      setDetectData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setDetectData]);

  return { runDetection, loading, error, detectData };
}
