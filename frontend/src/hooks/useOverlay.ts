import { useState } from 'react';

export function useOverlay() {
  const [opacity, setOpacity] = useState(0.7);
  
  return { opacity, setOpacity };
}
