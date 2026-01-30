type EasingFn = (t: number) => number;

// Ease in-out cubic for a more premium feel
const easeInOutCubic: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface SmoothScrollOptions {
  duration?: number;
  offset?: number;
  easing?: EasingFn;
}

export function smoothScrollTo(targetY: number, options: SmoothScrollOptions = {}) {
  if (typeof window === "undefined") return;

  const { duration = 900, easing = easeInOutCubic } = options;
  const startY = window.scrollY || window.pageYOffset;
  const distance = targetY - startY;

  if (distance === 0 || duration <= 0) {
    window.scrollTo(0, targetY);
    return;
  }

  let startTime: number | null = null;

  const step = (timestamp: number) => {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easing(progress);

    window.scrollTo(0, startY + distance * eased);

    if (elapsed < duration) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

export function smoothScrollToSelector(
  selector: string,
  options: SmoothScrollOptions = {},
) {
  if (typeof window === "undefined") return;

  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return;

  const header = document.querySelector<HTMLElement>("header");
  const computedOffset =
    options.offset ?? (header ? header.offsetHeight + 16 : 0);

  const rect = element.getBoundingClientRect();
  const targetY = rect.top + window.scrollY - computedOffset;

  smoothScrollTo(targetY, options);
}


