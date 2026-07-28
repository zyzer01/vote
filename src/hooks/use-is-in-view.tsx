import * as React from 'react';

interface UseIsInViewOptions {
  inView?: boolean;
  inViewOnce?: boolean;
  inViewMargin?: string;
}

/**
 * Plain IntersectionObserver rather than the animation library's `useInView` -
 * this is used on the marketing page, where pulling in the library costs more
 * than the hook is worth.
 */
function useIsInView<T extends HTMLElement = HTMLElement>(
  ref: React.Ref<T>,
  options: UseIsInViewOptions = {},
) {
  const { inView, inViewOnce = false, inViewMargin = '0px' } = options;
  const localRef = React.useRef<T>(null);
  React.useImperativeHandle(ref, () => localRef.current as T);

  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    // `inView: false` means "don't gate on visibility" - nothing to observe.
    if (!inView) return;

    const el = localRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (inViewOnce) observer.disconnect();
        } else if (!inViewOnce) {
          setIsIntersecting(false);
        }
      },
      { rootMargin: inViewMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, inViewOnce, inViewMargin]);

  const isInView = !inView || isIntersecting;
  return { ref: localRef, isInView };
}

export { useIsInView, type UseIsInViewOptions };
