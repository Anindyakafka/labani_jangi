import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface StoryCard {
  title: string;
  copy: string;
  image: string;
  href: string;
  label: string;
  number: string;
}

interface Props { cards: StoryCard[]; }

export default function MapStoryCards({ cards }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();
  const active = cards[activeIndex] ?? cards[0];

  useEffect(() => {
    const change = (event: Event) => {
      const index = (event as CustomEvent<{ index: number }>).detail?.index;
      if (Number.isInteger(index) && index >= 0 && index < cards.length) setActiveIndex(index);
    };
    window.addEventListener('map-story-change', change);
    return () => window.removeEventListener('map-story-change', change);
  }, [cards.length]);

  if (!active) return null;
  return <div className="map-story-card-stage" aria-live="polite">
    <AnimatePresence mode="wait" initial={false}>
      <motion.a
        key={active.href}
        href={active.href}
        className="map-story-flip-card"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: -180, scale: .94 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, rotateY: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: 180, scale: .94 }}
        transition={{ duration: reduceMotion ? .15 : 1.15, ease: [0.65, 0, 0.35, 1] }}
        onPointerMove={(event) => {
          if (event.pointerType !== 'mouse') return;
          const rect = event.currentTarget.getBoundingClientRect();
          setTilt({ x: ((event.clientY - rect.top) / rect.height - .5) * -8, y: ((event.clientX - rect.left) / rect.width - .5) * 8 });
        }}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <motion.div className="map-story-flip-face" animate={reduceMotion ? undefined : { rotateX: tilt.x, rotateY: tilt.y, scale: tilt.x || tilt.y ? 1.015 : 1 }} transition={{ type: 'spring', stiffness: 260, damping: 23 }}>
          <img src={active.image} alt="" aria-hidden="true" />
          <div className="map-story-card-copy"><span>{active.number} / 03</span><h2>{active.title}</h2><p>{active.copy}</p><b>{active.label}</b></div>
        </motion.div>
      </motion.a>
    </AnimatePresence>
  </div>;
}
