import { useEffect, useState } from 'react';

export function useCountUp(target, { duration = 1500, start = 0 } = {}) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    if (target === start || typeof target !== 'number') {
      setValue(target);
      return;
    }

    let raf;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = start + (target - start) * eased;
      setValue(target % 1 === 0 ? Math.round(next) : Number(next.toFixed(1)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return value;
}
