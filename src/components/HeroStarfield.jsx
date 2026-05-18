import { useMemo } from "react";

const LAYER_CONFIG = [
  { count: 42, size: [1, 2], opacity: [0.25, 0.55], duration: [3, 6] },
  { count: 32, size: [1.5, 2.5], opacity: [0.35, 0.7], duration: [4, 8] },
  { count: 18, size: [2, 3.5], opacity: [0.45, 0.9], duration: [5, 10] },
];

const createStars = (count, sizeRange, opacityRange, durationRange) =>
  Array.from({ length: count }, (_, index) => {
    const seed = index * 7919;
    const rand = (n) => ((seed * (n + 1) * 9301 + 49297) % 233280) / 233280;

    return {
      left: `${rand(1) * 100}%`,
      top: `${rand(2) * 100}%`,
      size: sizeRange[0] + rand(3) * (sizeRange[1] - sizeRange[0]),
      opacity: opacityRange[0] + rand(4) * (opacityRange[1] - opacityRange[0]),
      duration: durationRange[0] + rand(5) * (durationRange[1] - durationRange[0]),
      delay: rand(6) * 6,
    };
  });

function HeroStarfield() {
  const layers = useMemo(
    () =>
      LAYER_CONFIG.map((layer, layerIndex) => ({
        id: layerIndex,
        stars: createStars(layer.count, layer.size, layer.opacity, layer.duration),
      })),
    []
  );

  return (
    <div aria-hidden="true" className="hero-starfield">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={`hero-starfield__layer hero-starfield__layer--${layer.id}`}
        >
          {layer.stars.map((star, starIndex) => (
            <span
              key={starIndex}
              className="hero-starfield__star"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                "--star-opacity": star.opacity,
                "--twinkle-duration": `${star.duration}s`,
                "--twinkle-delay": `${star.delay}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default HeroStarfield;
