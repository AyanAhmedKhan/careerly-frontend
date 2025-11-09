import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';

// Register GSAP plugins (SplitType is a separate lib, not a GSAP plugin)
gsap.registerPlugin(ScrollTrigger);

const SplitText = ({
  text,
  className = '',
  delay = 100, // milliseconds between characters/words
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars', // 'chars' | 'words' | 'lines' | combinations like 'words,chars'
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1, // percentage of element visible before starting (0-1)
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
}) => {
  const ref = useRef(null);
  const splitRef = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Ensure fonts are loaded for accurate line/word splitting
  useEffect(() => {
    if (document?.fonts?.status === 'loaded') {
      setFontsLoaded(true);
    } else if (document?.fonts?.ready) {
      document.fonts.ready.then(() => setFontsLoaded(true));
    } else {
      // Fallback if Font Loading API isn't supported
      const t = setTimeout(() => setFontsLoaded(true), 100);
      return () => clearTimeout(t);
    }
  }, []);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !text || !fontsLoaded) return;

      // Clean up previous split and ScrollTriggers for this element
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
      if (splitRef.current) {
        try { splitRef.current.revert(); } catch (_) { /* ignore */ }
        splitRef.current = null;
      }

      // Calculate ScrollTrigger start string based on threshold and rootMargin
      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
          ? `-=${Math.abs(marginValue)}${marginUnit}`
          : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      // Perform text splitting using split-type
      const split = new SplitType(el, {
        types: splitType,
        tagName: 'span',
        lineClass: 'split-line',
        wordClass: 'split-word',
        charClass: 'split-char',
      });
      splitRef.current = split;

      // Determine animation targets in priority order
      let targets = [];
      const normalized = String(splitType).replace(/\s+/g, '');
      if (normalized.includes('chars') && split.chars?.length) targets = split.chars;
      if (!targets.length && normalized.includes('words') && split.words?.length) targets = split.words;
      if (!targets.length && normalized.includes('lines') && split.lines?.length) targets = split.lines;
      if (!targets.length) targets = split.chars || split.words || split.lines || [];

      if (targets.length) {
        gsap.fromTo(
          targets,
          { ...from },
          {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
            scrollTrigger: {
              trigger: el,
              start,
              once: true,
              fastScrollEnd: true,
              anticipatePin: 0.4,
            },
            onComplete: () => {
              onLetterAnimationComplete?.();
            },
            willChange: 'transform, opacity',
            force3D: true,
          }
        );
      }

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
        try { splitRef.current?.revert(); } catch (_) { /* ignore */ }
        splitRef.current = null;
      };
    },
    { dependencies: [
        text,
        className,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        onLetterAnimationComplete,
      ],
      scope: ref }
  );

  const commonStyle = {
    textAlign,
    wordWrap: 'break-word',
    willChange: 'transform, opacity',
  };
  const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`.trim();

  switch (tag) {
    case 'h1':
      return (
        <h1 ref={ref} style={commonStyle} className={classes}>
          {text}
        </h1>
      );
    case 'h2':
      return (
        <h2 ref={ref} style={commonStyle} className={classes}>
          {text}
        </h2>
      );
    case 'h3':
      return (
        <h3 ref={ref} style={commonStyle} className={classes}>
          {text}
        </h3>
      );
    case 'h4':
      return (
        <h4 ref={ref} style={commonStyle} className={classes}>
          {text}
        </h4>
      );
    case 'h5':
      return (
        <h5 ref={ref} style={commonStyle} className={classes}>
          {text}
        </h5>
      );
    case 'h6':
      return (
        <h6 ref={ref} style={commonStyle} className={classes}>
          {text}
        </h6>
      );
    default:
      return (
        <p ref={ref} style={commonStyle} className={classes}>
          {text}
        </p>
      );
  }
};

export default SplitText;
