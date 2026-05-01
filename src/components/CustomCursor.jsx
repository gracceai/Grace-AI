import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e) => {
      if (e.target.closest('button, a, input, textarea, [role="button"], .cursor-pointer')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Trail effect with lag
  useEffect(() => {
    let requestRef;
    const animateTrail = () => {
      setTrailPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.15,
        y: prev.y + (position.y - prev.y) * 0.15,
      }));
      requestRef = requestAnimationFrame(animateTrail);
    };
    requestRef = requestAnimationFrame(animateTrail);
    return () => cancelAnimationFrame(requestRef);
  }, [position]);

  return (
    <div className="hidden lg:block pointer-events-none fixed inset-0 z-[999999]">
      {/* Large Ambient Glow Blob */}
      <div 
        className="fixed h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 transition-transform duration-1000 ease-out pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
          background: 'radial-gradient(circle, rgba(74, 21, 75, 0.12) 0%, rgba(74, 21, 75, 0) 70%)',
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.2 : 1})`,
        }}
      />
      
      {/* Outer Trailing Ring */}
      <div 
        className="fixed h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 transition-all duration-300 ease-out pointer-events-none"
        style={{
          left: trailPosition.x,
          top: trailPosition.y,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : isHovering ? 1.5 : 1})`,
          opacity: isClicking ? 0.8 : 1,
        }}
      />

      {/* Inner Spot Dot */}
      <div 
        className="fixed h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 transition-transform duration-200 pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${isClicking ? 2.5 : isHovering ? 0.5 : 1})`,
        }}
      />
    </div>
  );
};

export default CustomCursor;
