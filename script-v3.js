/* ============================================================
   Transport Naceur — v3 (light & fast)
   - Smooth scroll reveal (IntersectionObserver — cheap)
   - Hero parallax (rAF-throttled)
   ============================================================ */

(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------
       SCROLL REVEAL
       ---------------------------------------------------------- */
    function initReveal() {
        const els = document.querySelectorAll('.reveal-3d');
        if (!els.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        els.forEach((el) => io.observe(el));
    }

    /* ----------------------------------------------------------
       HERO PARALLAX
       ---------------------------------------------------------- */
    function initHeroParallax() {
        if (reduceMotion) return;
        const content = document.querySelector('.hero-content');
        if (!content) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                const max = window.innerHeight;
                const p = Math.min(y / max, 1);
                content.style.transform = `translate3d(0, ${p * 60}px, 0)`;
                content.style.opacity = (1 - p * 0.9).toString();
                ticking = false;
            });
        }, { passive: true });
    }

    /* ----------------------------------------------------------
       COUNTERS (vanilla — no GSAP dependency)
       ---------------------------------------------------------- */
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                const el = e.target;
                io.unobserve(el);
                const target = parseInt(el.dataset.target || '0', 10);
                if (reduceMotion) { el.textContent = target; return; }
                const duration = 1600;
                const start = performance.now();
                function tick(now) {
                    const t = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - t, 3);
                    el.textContent = Math.round(target * eased);
                    if (t < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.3 });
        counters.forEach((el) => io.observe(el));
    }

    function boot() {
        initReveal();
        initHeroParallax();
        initCounters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
