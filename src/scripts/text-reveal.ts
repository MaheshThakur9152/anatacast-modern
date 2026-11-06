/**
 * Text Animation & Scroll Reveal Utilities
 * Exact recreation of Framer Motion scroll-driven text reveals and staggered entrances.
 */

export function splitIntoWords(element: HTMLElement): HTMLElement[] {
  if (element.getAttribute('data-reveal-ready') === 'true') {
    return Array.from(element.querySelectorAll<HTMLElement>('.reveal-word'));
  }
  element.setAttribute('data-reveal-ready', 'true');

  const fullText = element.textContent?.trim() || '';
  if (!element.hasAttribute('aria-label') && fullText) {
    element.setAttribute('aria-label', fullText);
  }

  const createdWords: HTMLElement[] = [];

  function processNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (!text.trim()) return null; // whitespace only

      const tokens = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();

      for (const token of tokens) {
        if (!token) continue;
        if (/^\s+$/.test(token)) {
          frag.appendChild(document.createTextNode(token));
        } else {
          const span = document.createElement('span');
          span.className = 'reveal-word inline-block will-change-[opacity,transform]';
          span.style.opacity = '0.14';
          span.style.transform = 'translateY(8px)';
          span.textContent = token;
          frag.appendChild(span);
          createdWords.push(span);
        }
      }
      return frag;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      // Do not re-split if already a reveal-word
      if (el.classList.contains('reveal-word')) {
        createdWords.push(el);
        return null;
      }
      const children = Array.from(el.childNodes);
      for (const child of children) {
        const replacement = processNode(child);
        if (replacement) {
          el.replaceChild(replacement, child);
        }
      }
      return null;
    }
    return null;
  }

  const rootChildren = Array.from(element.childNodes);
  for (const child of rootChildren) {
    const replacement = processNode(child);
    if (replacement) {
      element.replaceChild(replacement, child);
    }
  }

  return createdWords;
}

export function updateWordsProgress(words: ArrayLike<HTMLElement>, progress: number) {
  const n = words.length;
  if (n === 0) return;

  for (let i = 0; i < n; i++) {
    const word = words[i];
    const start = i / n;
    const end = start + 1 / n;

    let opacity = 0.14;
    let y = 8;

    if (progress >= end) {
      opacity = 1;
      y = 0;
    } else if (progress <= start) {
      opacity = 0.14;
      y = 8;
    } else {
      const local = (progress - start) / (end - start);
      opacity = 0.14 + local * 0.86;
      y = 8 - local * 8;
    }

    word.style.opacity = opacity.toFixed(3);
    word.style.transform = `translateY(${y.toFixed(2)}px)`;
  }
}

let activeScrollListener: (() => void) | null = null;
let activeResizeListener: (() => void) | null = null;

export function setupScrollWordReveals() {
  if (activeScrollListener) {
    window.removeEventListener('scroll', activeScrollListener);
    activeScrollListener = null;
  }
  if (activeResizeListener) {
    window.removeEventListener('resize', activeResizeListener);
    activeResizeListener = null;
  }

  const containers = Array.from(
    document.querySelectorAll<HTMLElement>('[data-text-reveal="words"], [data-statement-target]')
  );
  if (!containers.length) return;

  // Prepare each container
  containers.forEach((container) => {
    // If not already prepared with .reveal-word spans
    if (!container.querySelector('.reveal-word')) {
      splitIntoWords(container);
    }
  });

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isReducedMotion) {
    containers.forEach((container) => {
      const words = container.querySelectorAll<HTMLElement>('.reveal-word');
      words.forEach((w) => {
        w.style.opacity = '1';
        w.style.transform = 'none';
      });
    });
    return;
  }

  function update() {
    const vh = window.innerHeight;

    containers.forEach((container) => {
      // Elements with data-custom-scroll are managed by their section controllers (e.g. sticky process timeline)
      if (container.hasAttribute('data-custom-scroll')) return;

      const rect = container.getBoundingClientRect();
      // Reference Framer Motion offset: ["start 0.85", "end 0.45"]
      // start: top of container reaches 85% of viewport
      // end: bottom of container reaches 45% of viewport (rect.top + rect.height = 0.45 * vh)
      const startTop = 0.85 * vh;
      const endTop = 0.45 * vh - rect.height;
      const total = startTop - endTop;

      let progress = 0;
      if (total > 0) {
        progress = Math.max(0, Math.min(1, (startTop - rect.top) / total));
      }

      const words = container.querySelectorAll<HTMLElement>('.reveal-word');
      updateWordsProgress(words, progress);
    });
  }

  activeScrollListener = update;
  activeResizeListener = update;

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

export function setupHeroParallax() {
  const hero = document.getElementById('top');
  if (!hero) return;

  const bgImg = hero.querySelector<HTMLElement>('.hero-bg-scale');
  const bgOverlay = hero.querySelector<HTMLElement>('.hero-bg-overlay');
  const h1 = hero.querySelector<HTMLElement>('h1');
  const subtitle = hero.querySelector<HTMLElement>('.hero-subtitle-block');

  function update() {
    const rect = hero.getBoundingClientRect();
    const heroH = hero.offsetHeight;
    const vh = window.innerHeight;
    const scrollRange = heroH - vh;
    if (scrollRange <= 0) return;

    // Progress 0 -> 1 as section scrolls through
    const progress = Math.max(0, Math.min(1, -rect.top / scrollRange));

    if (bgImg) {
      // 1.08 -> 1.32
      const scale = 1.08 + progress * (1.32 - 1.08);
      const y = progress * 18;
      bgImg.style.transform = `scale(${scale.toFixed(3)}) translateY(${y.toFixed(1)}%)`;
    }

    if (bgOverlay) {
      // 0.35 -> 0.92 at progress 0.8
      const pOverlay = Math.min(1, progress / 0.8);
      const opacity = 0.35 + pOverlay * (0.92 - 0.35);
      bgOverlay.style.opacity = opacity.toFixed(3);
    }

    if (h1) {
      // translateY: 0% -> -60%, opacity: 1 -> 0 by progress 0.55
      const h1Y = progress * -60;
      const pH1Fade = Math.min(1, progress / 0.55);
      const h1Opacity = Math.max(0, 1 - pH1Fade);
      h1.style.transform = `translateY(${h1Y.toFixed(1)}%)`;
      h1.style.opacity = h1Opacity.toFixed(3);
    }

    if (subtitle) {
      // translateY: 0% -> -140%
      const subY = progress * -140;
      subtitle.style.transform = `translateY(${subY.toFixed(1)}%)`;
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

export function initTextAnimations() {
  setupScrollWordReveals();
  setupHeroParallax();
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTextAnimations);
  } else {
    initTextAnimations();
  }
  document.addEventListener('astro:page-load', initTextAnimations);
}
