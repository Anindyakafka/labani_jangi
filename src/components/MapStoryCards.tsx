import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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
  const [story, setStory] = useState({ visible: false, index: 0 });
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 240, damping: 26, mass: 0.7 });
  const springY = useSpring(tiltY, { stiffness: 240, damping: 26, mass: 0.7 });
  const reduceMotion = useReducedMotion();
  const current = useRef(story);
  const target = useRef(story);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = cards[story.index] ?? cards[0];

  useEffect(() => {
    const commit = (next: { visible: boolean; index: number }) => {
      current.current = next;
      setStory(next);
    };
    const scheduleAdvance = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        if (current.current.index !== target.current.index) advance();
      }, 2600);
    };
    const advance = () => {
      if (!target.current.visible) {
        commit({ ...current.current, visible: false });
        return;
      }
      if (!current.current.visible) {
        commit({ visible: true, index: 0 });
        scheduleAdvance();
      } else if (current.current.index !== target.current.index) {
        commit({ visible: true, index: current.current.index + Math.sign(target.current.index - current.current.index) });
        scheduleAdvance();
      }
    };
    const change = (event: Event) => {
      const detail = (event as CustomEvent<{ index: number; visible: boolean }>).detail;
      if (!detail || !Number.isInteger(detail.index) || detail.index < 0 || detail.index >= cards.length) return;
      target.current = detail;
      if (!detail.visible) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        advance();
      } else if (!timer.current) advance();
    };
    if (reduceMotion) {
      commit({ visible: true, index: 0 });
      return;
    }
    window.addEventListener('map-story-change', change);
    const journey = document.querySelector<HTMLElement>('[data-map-journey]');
    if (journey?.dataset.storyIndex) change(new CustomEvent('map-story-change', { detail: { index: Number(journey.dataset.storyIndex), visible: journey.dataset.storyVisible === 'true' } }));
    return () => {
      window.removeEventListener('map-story-change', change);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [cards.length, reduceMotion]);

  if (!active) return null;
  return <div className="map-story-card-stage" aria-live="polite">
    <AnimatePresence mode="sync" initial={false}>
      {story.visible && <motion.a
        key={active.href}
        href={active.href}
        className="map-story-flip-card"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: -180, scale: .94 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, rotateY: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: 180, scale: .94 }}
        transition={{ duration: reduceMotion ? .15 : .82, ease: [0.22, 1, 0.36, 1] }}
        onPointerMove={(event) => {
          if (event.pointerType !== 'mouse') return;
          const rect = event.currentTarget.getBoundingClientRect();
          tiltX.set(((event.clientY - rect.top) / rect.height - .5) * -6);
          tiltY.set(((event.clientX - rect.left) / rect.width - .5) * 6);
        }}
        onPointerLeave={() => { tiltX.set(0); tiltY.set(0); }}
      >
        <motion.div className="map-story-flip-face" style={reduceMotion ? undefined : { rotateX: springX, rotateY: springY }}>
          <img src={active.image} alt="" aria-hidden="true" />
          <div className="map-story-card-copy"><span>{active.number} / 03</span><h2>{active.title}</h2><p>{active.copy}</p><b>{active.label}</b></div>
        </motion.div>
      </motion.a>}
    </AnimatePresence>
  </div>;
}
