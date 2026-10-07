import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)');
const clearMapMotionStyles = (targets: Element[]) => gsap.set(targets, { clearProps: 'opacity,transform,visibility,fill' });
const clearRevealStyles = (targets: HTMLElement[]) => {
  gsap.set(targets, { clearProps: 'opacity,visibility' });
  gsap.set(targets.filter((target) => !target.hasAttribute('data-reveal-fade-only')), { clearProps: 'transform' });
};

function refreshAfterLayoutSettles() {
  const refresh = () => ScrollTrigger.refresh();
  if (document.readyState === 'complete') refresh();
  else window.addEventListener('load', refresh, { once: true });
  if ('fonts' in document) void document.fonts.ready.then(refresh);
}

/** Fade a section's marked children (or the section itself) as it enters the viewport. */
export function initScrollReveals() {
  const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-reveal]'));
  if (!groups.length) return;

  const motionPreference = reducedMotion();
  const animations = new Map<HTMLElement, gsap.core.Timeline>();

  for (const group of groups) {
    if (group.dataset.revealInitialized === 'true') continue;
    group.dataset.revealInitialized = 'true';
    const selector = group.dataset.revealItems || '[data-reveal-item]';
    const selectedTargets = Array.from(group.querySelectorAll<HTMLElement>(selector));
    const targets: HTMLElement[] = selectedTargets.length ? selectedTargets : [group];

    const createReveal = () => {
      const prior = animations.get(group);
      prior?.scrollTrigger?.kill();
      prior?.kill();
      animations.delete(group);
      clearRevealStyles(targets);

      if (motionPreference.matches) {
        group.dataset.revealState = 'static';
        return;
      }

      group.dataset.revealState = 'scroll';
      if (group.getBoundingClientRect().top < window.innerHeight * 0.86) {
        group.dataset.revealState = 'visible';
        return;
      }
      const movementTargets = targets.filter((target) => !target.hasAttribute('data-reveal-fade-only'));
      const fadeTargets = targets.filter((target) => target.hasAttribute('data-reveal-fade-only'));
      const timeline = gsap.timeline();
      if (movementTargets.length) {
        gsap.set(movementTargets, { opacity: 0, y: 20 });
        timeline.to(movementTargets, {
          opacity: 1,
          y: 0,
          duration: 0.48,
          stagger: movementTargets.length > 1 ? 0.06 : 0,
          ease: 'power2.out',
        }, 0);
      }
      if (fadeTargets.length) {
        gsap.set(fadeTargets, { opacity: 0 });
        timeline.to(fadeTargets, {
          opacity: 1,
          duration: 0.48,
          stagger: fadeTargets.length > 1 ? 0.06 : 0,
          ease: 'power2.out',
        }, 0);
      }
      ScrollTrigger.create({
        trigger: group,
        animation: timeline,
        start: 'top 86%',
        toggleActions: 'play none none reverse',
        invalidateOnRefresh: true,
      });
      animations.set(group, timeline);
    };

    createReveal();
    motionPreference.addEventListener('change', createReveal);
  }

  refreshAfterLayoutSettles();
}

/** Scrub the district fragments from a centroid-collapsed state into their true positions. */
export function initDistrictMapMotion(widget: HTMLElement) {
  if (widget.dataset.mapMotionInitialized === 'true') return;

  const svg = widget.querySelector<SVGSVGElement>('[data-ground-map-svg]');
  const outline = widget.querySelector<SVGPathElement>('[data-ground-state-outline]');
  const fragmentLayer = widget.querySelector<SVGGElement>('[data-ground-map-fragments]');
  const controls = Array.from(widget.querySelectorAll<SVGPathElement>('[data-ground-district]'));
  const fragments = Array.from(widget.querySelectorAll<SVGPathElement>('[data-ground-map-fragment]'));
  if (!svg || !outline || !fragmentLayer || controls.length !== 23 || fragments.length !== controls.length) return;

  widget.dataset.mapMotionInitialized = 'true';
  const motionPreference = reducedMotion();
  const stateX = Number(widget.dataset.stateCentroidX);
  const stateY = Number(widget.dataset.stateCentroidY);
  let timeline: gsap.core.Timeline | undefined;

  const clearTimeline = () => {
    timeline?.scrollTrigger?.kill();
    timeline?.kill();
    timeline = undefined;
    clearMapMotionStyles([outline, ...fragments]);
  };

  const createTimeline = () => {
    clearTimeline();
    document.documentElement.removeAttribute('data-map-motion-pending');
    if (motionPreference.matches) {
      widget.dataset.mapMotion = 'static';
      return;
    }

    widget.dataset.mapMotion = 'scrubbed';
    const byId = new Map(fragments.map((fragment) => [fragment.dataset.groundMapFragment ?? '', fragment]));
    const ordered = fragments.filter((fragment) => fragment.dataset.groundMapFragment !== 'nadia');
    const nadia = byId.get('nadia');
    if (nadia) ordered.push(nadia);

    const renderedScale = () => {
      const box = svg.getBoundingClientRect();
      const viewBox = svg.viewBox.baseVal;
      return {
        x: box.width / viewBox.width,
        y: box.height / viewBox.height,
      };
    };

    const originFor = (_index: number, target: Element) => {
      const path = target as SVGPathElement;
      const bounds = path.getBBox();
      const cx = Number(path.dataset.centroidX);
      const cy = Number(path.dataset.centroidY);
      const x = bounds.width ? ((cx - bounds.x) / bounds.width) * 100 : 50;
      const y = bounds.height ? ((cy - bounds.y) / bounds.height) * 100 : 50;
      return `${x}% ${y}%`;
    };
    const offsetX = (_index: number, target: Element) => {
      const scale = renderedScale().x;
      return (stateX - Number((target as SVGPathElement).dataset.centroidX)) * scale;
    };
    const offsetY = (_index: number, target: Element) => {
      const scale = renderedScale().y;
      return (stateY - Number((target as SVGPathElement).dataset.centroidY)) * scale;
    };

    gsap.set(outline, { opacity: 1, visibility: 'visible' });
    gsap.set(fragments, {
      opacity: 0,
      x: offsetX,
      y: offsetY,
      scale: 0.045,
      transformOrigin: originFor,
    });

    const trigger = widget.closest<HTMLElement>('.ground-hero') ?? widget;
    const entryDuration = 0.72;
    const stagger = 0.02;
    const entryStart = 0.1;
    const finalEntryBeat = entryStart + entryDuration + (ordered.length - 1) * stagger;
    const mapLand = getComputedStyle(widget).getPropertyValue('--ground-map-land-light').trim();
    const homeFill = getComputedStyle(widget).getPropertyValue('--ground-map-home').trim();

    timeline = gsap.timeline({
      scrollTrigger: {
        id: `west-bengal-map-${widget.id || 'home'}`,
        trigger,
        start: 'top top',
        end: () => `+=${Math.round(Math.max(680, window.innerHeight * 0.82))}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    timeline.to(outline, { opacity: 0, duration: 0.18, ease: 'none' }, 0);
    timeline.fromTo(
      ordered,
      {
        x: offsetX,
        y: offsetY,
        scale: 0.045,
        opacity: 0,
        transformOrigin: originFor,
      },
      {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: entryDuration,
        stagger,
        ease: 'power2.out',
      },
      entryStart,
    );
    if (nadia) {
      timeline.fromTo(
        nadia,
        { fill: mapLand },
        { fill: homeFill, duration: 0.12, ease: 'none' },
        finalEntryBeat - 0.12,
      );
    }
  };

  createTimeline();
  motionPreference.addEventListener('change', createTimeline);
  refreshAfterLayoutSettles();
}
