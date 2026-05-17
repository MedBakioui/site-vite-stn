/* ============================================================
   Transport Naceur — v2 script
   GSAP ScrollTrigger animations + lightweight hero particles
   (Three.js WebGL truck removed — zero extra dependencies)
   ============================================================ */

/* GSAP available check (safe for pages without GSAP) */
var HAS_GSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);


/* ------------------------------------------------------------
   1. HERO PARTICLES — lightweight CSS dot field (lazy)
   ------------------------------------------------------------ */
function initHeroParticles() {
    var container = document.getElementById('heroParticles');
    if (!container) return;

    /* Lazy: create particles only when hero is near viewport */
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                observer.disconnect();
                var COUNT = 40; /* reduced from 55 */
                for (var i = 0; i < COUNT; i++) {
                    var dot = document.createElement('span');
                    dot.className = 'hero-particle';

                    var size   = Math.random() * 3 + 1.5;
                    var x      = Math.random() * 100;
                    var y      = Math.random() * 100;
                    var delay  = Math.random() * 8;
                    var dur    = 6 + Math.random() * 10;
                    var bright = Math.random() > 0.7;

                    dot.style.cssText =
                        'width:' + size + 'px;height:' + size + 'px;' +
                        'left:' + x + '%;top:' + y + '%;' +
                        'background:' + (bright ? 'var(--accent)' : 'var(--primary)') + ';' +
                        'opacity:' + (0.15 + Math.random() * 0.45) + ';' +
                        'animation-duration:' + dur + 's;' +
                        'animation-delay:-' + delay + 's;';
                    container.appendChild(dot);
                }
            }
        });
    }, { rootMargin: '200px' });
    observer.observe(container);
}


/* ------------------------------------------------------------
   2. GSAP SCROLL ANIMATIONS (conditional)
   ------------------------------------------------------------ */
function initScrollAnimations() {
    if (!HAS_GSAP) return;

    /* hero entrance */
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
        .from('.hero-badge', { y: 20, opacity: 0, duration: 0.7 })
        .from('.hero-title .hero-line', { y: 80, opacity: 0, duration: 1, stagger: 0.12 }, '-=0.3')
        .from('.hero-sub', { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.hero-cta-row .btn', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.4')
        .from('.hero-meta', { y: 30, opacity: 0, duration: 0.7 }, '-=0.3');

    /* section heads */
    gsap.utils.toArray('.section-head').forEach(function (el) {
        gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    /* bento cards */
    gsap.utils.toArray('[data-stat-card]').forEach(function (el, i) {
        gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            delay: i * 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%' }
        });
    });

    /* service / fleet / certif / testimonial cards */
    ['[data-service-card]', '[data-fleet-card]', '[data-certif]', '[data-testimonial]'].forEach(function (sel) {
        gsap.utils.toArray(sel).forEach(function (el, i) {
            gsap.from(el, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                delay: i * 0.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%' }
            });
        });
    });

    /* about section */
    gsap.from('.about-text > *', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-grid', start: 'top 75%' }
    });

    gsap.from('.about-visual', {
        x: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-grid', start: 'top 75%' }
    });

    /* contact */
    gsap.from('.contact-info > *', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' }
    });

    gsap.from('.contact-form', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' }
    });
}


/* ------------------------------------------------------------
   3. COUNTER ANIMATIONS (conditional)
   ------------------------------------------------------------ */
function initCounters() {
    if (!HAS_GSAP) return;
    var counters = document.querySelectorAll('.counter');
    counters.forEach(function (el) {
        var target = parseInt(el.dataset.target || el.parentElement.dataset.target || '0', 10);
        ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            once: true,
            onEnter: function () {
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: function () {
                        el.textContent = Math.round(this.targets()[0].val);
                    }
                });
            }
        });
    });
}


/* ------------------------------------------------------------
   4. UI BEHAVIOURS — header, scroll progress, scrollTop, form
   ------------------------------------------------------------ */
function initTheme() {
    var root = document.documentElement;
    var btn = document.getElementById('themeToggle');
    var meta = document.querySelector('meta[name="theme-color"]');

    var apply = function (theme) {
        if (theme === 'light') root.setAttribute('data-theme', 'light');
        else root.removeAttribute('data-theme');
        if (meta) meta.setAttribute('content', theme === 'light' ? '#F7F8FB' : '#07080C');
        if (btn) btn.setAttribute('aria-pressed', theme === 'light');
    };

    var saved = localStorage.getItem('stn-theme');
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    apply(saved || (prefersLight ? 'light' : 'dark'));

    if (btn) {
        btn.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            localStorage.setItem('stn-theme', next);
            apply(next);
        });
    }
}


function initUI() {
    var header = document.getElementById('header');
    var progressBar = document.getElementById('scroll-progress');
    var scrollTopBtn = document.getElementById('scrollTop');
    var ticking = false;

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            var sy = window.scrollY;
            var dh = document.documentElement.scrollHeight - window.innerHeight;
            var pct = dh > 0 ? Math.min((sy / dh) * 100, 100) : 0;

            if (progressBar) progressBar.style.width = pct + '%';
            if (header) header.classList.toggle('scrolled', sy > 30);
            if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', sy > 600);
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* mobile menu toggle */
    var mobileToggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('#header nav');
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', function () {
            var expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', !expanded);
            nav.style.display = expanded ? 'none' : 'flex';
            nav.style.position = 'absolute';
            nav.style.top = '70px';
            nav.style.left = '24px';
            nav.style.right = '24px';
            nav.style.justifyContent = 'center';
        });

        nav.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    nav.style.display = 'none';
                    mobileToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    /* contact form */
    var form = document.getElementById('contactForm');
    var formMsg = document.getElementById('form-message');
    if (form && formMsg) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            formMsg.textContent = 'Envoi en cours...';
            formMsg.className = '';
            var xhr = new XMLHttpRequest();
            xhr.open('POST', form.action, true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.onload = function () {
                if (xhr.status === 200) {
                    formMsg.textContent = 'Merci, votre message a bien été envoyé.';
                    formMsg.className = 'success';
                    form.reset();
                } else {
                    formMsg.textContent = 'Une erreur est survenue. Réessayez ou contactez-nous directement.';
                    formMsg.className = 'error';
                }
            };
            xhr.onerror = function () {
                formMsg.textContent = 'Une erreur est survenue. Réessayez ou contactez-nous directement.';
                formMsg.className = 'error';
            };
            xhr.send(new FormData(form));
        });
    }
}


/* ------------------------------------------------------------
   BOOT
   ------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initUI();
    initHeroParticles();
    initScrollAnimations();
    initCounters();
});
