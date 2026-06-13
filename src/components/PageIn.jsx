import { useState, useLayoutEffect } from 'react';

export default function PageIn({ children, k }) {
  const [r, setR] = useState(false);

  useLayoutEffect(() => {
    setR(false);
    let rAF1, rAF2;
    // Double requestAnimationFrame guarantees layout is painted before transitioning class state
    rAF1 = requestAnimationFrame(() => {
      rAF2 = requestAnimationFrame(() => {
        setR(true);
      });
    });
    return () => {
      cancelAnimationFrame(rAF1);
      cancelAnimationFrame(rAF2);
    };
  }, [k]);

  return (
    <div style={{
      opacity: r ? 1 : 0,
      transform: r ? 'none' : 'translateY(10px)',
      transition: 'opacity .5s ease, transform .5s ease',
      willChange: 'opacity, transform'
    }}>
      {children}
    </div>
  );
}
