/* ============================================================
   Transport Naceur — Editorial script
   ============================================================ */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- Scroll Reveal --- */
    function initReveal() {
        const els = document.querySelectorAll('.reveal, .reveal-stagger');
        if (!els.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        els.forEach((el) => io.observe(el));
    }

    /* --- Counters --- */
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
                const duration = 1800;
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

    /* --- Theme --- */
    function initTheme() {
        const root = document.documentElement;
        const btn = document.getElementById('themeToggle');
        const meta = document.querySelector('meta[name="theme-color"]');

        const apply = (theme) => {
            if (theme === 'light') root.setAttribute('data-theme', 'light');
            else root.removeAttribute('data-theme');
            if (meta) meta.setAttribute('content', theme === 'light' ? '#FAF7F2' : '#0A0908');
            if (btn) btn.setAttribute('aria-pressed', theme === 'light');
        };

        const saved = localStorage.getItem('stn-theme');
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        apply(saved || (prefersLight ? 'light' : 'dark'));

        if (btn) {
            btn.addEventListener('click', () => {
                const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                localStorage.setItem('stn-theme', next);
                apply(next);
            });
        }
    }

    /* --- UI --- */
    function initUI() {
        const header = document.getElementById('header');
        const progressBar = document.getElementById('scroll-progress');
        const scrollTopBtn = document.getElementById('scrollTop');
        let ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const sy = window.scrollY;
                const dh = document.documentElement.scrollHeight - window.innerHeight;
                const pct = dh > 0 ? Math.min((sy / dh) * 100, 100) : 0;
                if (progressBar) progressBar.style.width = pct + '%';
                if (header) header.classList.toggle('scrolled', sy > 30);
                if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', sy > 600);
                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        /* --- Mobile Menu Fullscreen --- */
        const mobileToggle = document.querySelector('.mobile-toggle');
        const headerNav = document.querySelector('#header nav');
        if (mobileToggle && headerNav) {
            // Create overlay if not present
            let overlay = document.querySelector('.mobile-menu-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'mobile-menu-overlay';
                overlay.setAttribute('aria-hidden', 'true');

                // Clone nav
                const navClone = headerNav.cloneNode(true);
                overlay.appendChild(navClone);

                // Add CTA section
                const ctaSection = document.createElement('div');
                ctaSection.className = 'mobile-menu-cta';
                ctaSection.innerHTML = `
                    <a href="#contact" class="btn btn-primary">
                        <span>Demander un devis</span>
                    </a>
                `;
                overlay.appendChild(ctaSection);

                // Add meta info
                const meta = document.createElement('div');
                meta.className = 'mobile-menu-meta';
                meta.innerHTML = `
                    <div>// Transports Naceur · Ets. 1973</div>
                    <div><a href="tel:+212522747647">+212 5 22 74 76 47</a></div>
                    <div><a href="mailto:contact@stn.ma">contact@stn.ma</a></div>
                `;
                overlay.appendChild(meta);

                document.body.appendChild(overlay);
            }

            const closeMenu = () => {
                overlay.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('mobile-menu-open');
            };

            const openMenu = () => {
                overlay.classList.add('open');
                mobileToggle.classList.add('active');
                mobileToggle.setAttribute('aria-expanded', 'true');
                document.body.classList.add('mobile-menu-open');
            };

            mobileToggle.addEventListener('click', () => {
                const isOpen = overlay.classList.contains('open');
                if (isOpen) closeMenu(); else openMenu();
            });

            // Close on link click
            overlay.querySelectorAll('a').forEach((a) => {
                a.addEventListener('click', () => closeMenu());
            });

            // Close on Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && overlay.classList.contains('open')) {
                    closeMenu();
                }
            });

            // Close on resize to desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth > 1024 && overlay.classList.contains('open')) {
                    closeMenu();
                }
            });
        }

        const form = document.getElementById('contactForm');
        const formMsg = document.getElementById('form-message');
        if (form && formMsg) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                formMsg.textContent = 'Envoi en cours...';
                formMsg.className = '';
                fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                }).then((res) => {
                    if (res.ok) {
                        formMsg.textContent = 'Merci, votre message a bien été envoyé.';
                        formMsg.className = 'success';
                        form.reset();
                    } else {
                        formMsg.textContent = 'Une erreur est survenue. Réessayez ou contactez-nous directement.';
                        formMsg.className = 'error';
                    }
                }).catch(() => {
                    formMsg.textContent = 'Une erreur est survenue. Réessayez ou contactez-nous directement.';
                    formMsg.className = 'error';
                });
            });
        }
    }

    /* --- Leaflet Map (lazy loaded) --- */
    function loadScript(src, integrity) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.crossOrigin = 'anonymous';
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }
    function loadStyle(href) {
        return new Promise((resolve, reject) => {
            const l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = href;
            l.crossOrigin = 'anonymous';
            l.onload = resolve;
            l.onerror = reject;
            document.head.appendChild(l);
        });
    }

    function initMap() {
        const mapEl = document.getElementById('leaflet-map');
        if (!mapEl) return;

        let loaded = false;
        const loadMap = async () => {
            if (loaded) return;
            loaded = true;
            try {
                await loadStyle('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
                await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
                initMapInstance(mapEl);
            } catch (e) {
                mapEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--ink-dim);font-family:var(--f-mono);font-size:12px;">// Erreur de chargement de la carte</div>';
            }
        };

        // Primary: IntersectionObserver
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries, observer) => {
                if (entries[0].isIntersecting) {
                    observer.disconnect();
                    loadMap();
                }
            }, { rootMargin: '400px' });
            io.observe(mapEl);
        }

        // Fallback: scroll check (in case IO doesn't fire)
        const checkOnScroll = () => {
            const rect = mapEl.getBoundingClientRect();
            if (rect.top < window.innerHeight + 400 && rect.bottom > -400) {
                window.removeEventListener('scroll', checkOnScroll);
                loadMap();
            }
        };
        window.addEventListener('scroll', checkOnScroll, { passive: true });
        // Initial check after page settles
        setTimeout(checkOnScroll, 100);
    }

    function initMapInstance(mapEl) {
        if (typeof L === 'undefined') return;
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const tileUrl = isLight
            ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

        const map = L.map('leaflet-map', { scrollWheelZoom: false, zoomControl: true }).setView([31.7917, -7.0926], 6);

        L.tileLayer(tileUrl, {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 18
        }).addTo(map);

        const cities = [
            { name: 'Casablanca (Siège)', lat: 33.5731, lng: -7.5898, primary: true },
            { name: 'Rabat', lat: 34.0209, lng: -6.8416 },
            { name: 'Tanger', lat: 35.7595, lng: -5.8340 },
            { name: 'Fès', lat: 34.0331, lng: -5.0003 },
            { name: 'Marrakech', lat: 31.6295, lng: -7.9811 },
            { name: 'Agadir', lat: 30.4278, lng: -9.5981 },
            { name: 'Oujda', lat: 34.6814, lng: -1.9086 },
            { name: 'Ouarzazate', lat: 30.9189, lng: -6.8934 },
            { name: 'Meknès', lat: 33.8935, lng: -5.5473 },
            { name: 'Kénitra', lat: 34.2610, lng: -6.5802 }
        ];

        cities.forEach((city) => {
            const size = city.primary ? 16 : 12;
            const icon = L.divIcon({
                className: 'stn-marker',
                html: `<div style="width:${size}px;height:${size}px;background:#22D3EE;border-radius:50%;box-shadow:0 0 0 4px rgba(34,211,238,0.2),0 0 16px rgba(34,211,238,0.6);border:2px solid #E8EEF7;"></div>`,
                iconSize: [size, size]
            });
            L.marker([city.lat, city.lng], { icon: icon })
                .addTo(map)
                .bindPopup('<strong>' + city.name + '</strong>');
        });
    }

    /* --- Service Worker (smart caching) --- */
    function initSW() {
        if (!('serviceWorker' in navigator)) return;
        // Register after page load to not block initial rendering
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
    }

    function boot() {
        initTheme();
        initUI();
        initReveal();
        initCounters();
        initMap();
        initSW();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
