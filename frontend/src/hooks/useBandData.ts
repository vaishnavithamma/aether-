import { useState } from 'react';

export function useBandData(totalBands: number = 186) {
  const [activeBand, setActiveBand] = useState(Math.floor(totalBands / 2));
  
  const handleBandChange = (band: number) => {
    if (band >= 0 && band < totalBands) {
      setActiveBand(band);
    }
  };

  return { activeBand, handleBandChange, totalBands };
}
