// The Bank Is Code — scroll mechanics.
// Tracks the most-visible section, fades it in, drives the 10-dot progress rail.

const sections = Array.from(document.querySelectorAll('.story-section'));
const dots = Array.from(document.querySelectorAll('.story-dot'));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let activeIndex = null;

function setActiveIndex(index) {
  if (index === activeIndex) return;
  activeIndex = index;
  dots.forEach((dot) => {
    const isActive = Number(dot.dataset.dot) === index;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
}

const ratios = new Map(sections.map((section) => [section, 0]));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-active', entry.isIntersecting);
      ratios.set(entry.target, entry.intersectionRatio);
    });

    let bestSection = null;
    let bestRatio = 0;
    ratios.forEach((ratio, section) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestSection = section;
      }
    });

    if (bestSection) {
      setActiveIndex(Number(bestSection.dataset.storyIndex));
    }
  },
  { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
);

sections.forEach((section) => observer.observe(section));

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const target = document.getElementById(`s${dot.dataset.dot.padStart(2, '0')}`);
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
});
