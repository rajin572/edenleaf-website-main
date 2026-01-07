import { useEffect, useRef } from "react";

const SpinLoader = () => {
  const scissorsRef = useRef<SVGGElement>(null);
  const bladeTopRef = useRef<SVGGElement>(null);
  const bladeBottomRef = useRef<SVGGElement>(null);
  const dashRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    let frameId: number;
    let startTime: number | null = null;
    const dur = 2600;
    const distance = 170;
    const startX = 10;

    const frame = (ts: number) => {
      if (startTime === null) startTime = ts;
      let t = ((ts - startTime) % (dur * 2)) / dur;
      if (t > 1) t = 2 - t;

      const x = startX + t * distance;
      scissorsRef.current?.setAttribute("transform", `translate(${x.toFixed(1)},30)`);

      const snip = (Math.sin((((ts - startTime) % 260) / 260) * Math.PI * 2) + 1) / 2;
      const angle = 6 + snip * 16;
      bladeTopRef.current?.setAttribute("transform", `rotate(-${angle.toFixed(1)})`);
      bladeBottomRef.current?.setAttribute("transform", `rotate(${angle.toFixed(1)})`);

      dashRef.current?.setAttribute("stroke-dashoffset", (-(t * distance)).toFixed(1));

      frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="flex h-full w-full justify-center items-center">
      <svg
        viewBox="0 0 220 60"
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid meet"
        className="max-w-[140px] sm:max-w-[220px]"
        role="img"
        aria-label="Loading"
      >
        <line
          ref={dashRef}
          x1="46"
          y1="30"
          x2="210"
          y2="30"
          stroke="#8b48fb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 6"
        />
        <g ref={scissorsRef} transform="translate(10,30)">
          <g ref={bladeTopRef} transform="rotate(-14)">
            <ellipse cx="-6" cy="0" rx="9" ry="6.5" fill="none" stroke="#8b48fb" strokeWidth="3" />
            <line x1="2" y1="0" x2="34" y2="0" stroke="#8b48fb" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g ref={bladeBottomRef} transform="rotate(14)">
            <ellipse cx="-6" cy="0" rx="9" ry="6.5" fill="none" stroke="#8b48fb" strokeWidth="3" />
            <line x1="2" y1="0" x2="34" y2="0" stroke="#8b48fb" strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle cx="0" cy="0" r="2.4" fill="#8b48fb" />
        </g>
      </svg>
    </div>
  );
};

export default SpinLoader;