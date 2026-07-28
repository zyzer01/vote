'use client';

import * as React from 'react';

import { useIsInView } from '@/hooks/use-is-in-view';
import type { UseIsInViewOptions } from '@/hooks/use-is-in-view';

type CountingNumberProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  number: number;
  fromNumber?: number;
  padStart?: boolean;
  decimalSeparator?: string;
  decimalPlaces?: number;
  /** Seconds the count-up takes. */
  duration?: number;
  delay?: number;
  initiallyStable?: boolean;
} & UseIsInViewOptions;

/** Ease-out cubic - fast start, gentle settle, same feel as a damped spring. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts up to `number` once it scrolls into view.
 *
 * Driven by a plain requestAnimationFrame writing `textContent` directly, so
 * this costs no React renders and - importantly for the marketing page - does
 * not pull the animation library into the bundle.
 */
function CountingNumber({
  ref,
  number,
  fromNumber = 0,
  padStart = false,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  decimalSeparator = '.',
  decimalPlaces = 0,
  duration = 1.6,
  delay = 0,
  initiallyStable = false,
  ...props
}: CountingNumberProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    { inView, inViewOnce, inViewMargin },
  );

  const numberStr = number.toString();
  const decimals =
    typeof decimalPlaces === 'number'
      ? decimalPlaces
      : numberStr.includes('.')
        ? (numberStr.split('.')[1]?.length ?? 0)
        : 0;

  const finalIntLength = Math.floor(Math.abs(number)).toString().length;

  const format = React.useCallback(
    (val: number) => {
      let out = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
      if (decimals > 0) out = out.replace('.', decimalSeparator);
      if (padStart) {
        const [intPart, fracPart] = out.split(decimalSeparator);
        const paddedInt = intPart.padStart(finalIntLength, '0');
        out = fracPart ? `${paddedInt}${decimalSeparator}${fracPart}` : paddedInt;
      }
      return out;
    },
    [decimals, decimalSeparator, padStart, finalIntLength],
  );

  React.useEffect(() => {
    if (!isInView) return;

    const el = localRef.current;
    if (!el) return;

    const from = initiallyStable ? number : fromNumber;
    if (
      from === number ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.textContent = format(number);
      return;
    }

    let frame = 0;
    let start = 0;
    const ms = duration * 1000;

    const step = (now: number) => {
      start ||= now;
      const t = Math.min((now - start) / ms, 1);
      el.textContent = format(from + (number - from) * easeOut(t));
      if (t < 1) frame = requestAnimationFrame(step);
    };

    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [
    isInView,
    number,
    fromNumber,
    initiallyStable,
    duration,
    delay,
    format,
    localRef,
  ]);

  const zeroText = padStart
    ? '0'.padStart(finalIntLength, '0') +
      (decimals > 0 ? decimalSeparator + '0'.repeat(decimals) : '')
    : '0' + (decimals > 0 ? decimalSeparator + '0'.repeat(decimals) : '');

  const initialText = initiallyStable ? format(number) : zeroText;

  return (
    <span ref={localRef} data-slot="counting-number" {...props}>
      {initialText}
    </span>
  );
}

export { CountingNumber, type CountingNumberProps };
