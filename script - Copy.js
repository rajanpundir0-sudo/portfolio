// Mark that JS is running, before anything else. CSS only hides .reveal
// elements pending animation once this class is present (see style.css) —
// so if this line never executes (JS blocked entirely), content stays
// visible by default instead of stuck invisible.
document.documentElement.classList.add('js-anim-ready');

// Each feature below is wrapped in its own try/catch. This is deliberate:
// if one block throws (a missing element, a browser quirk, whatever), it
// must not stop every feature declared after it in this file from running.
// Previously the whole script was one top-to-bottom sequence, so a single
// failure partway through could silently disable everything below it —
// including the scroll-reveal system, which would leave entire sections
// permanently invisible with no error the visitor could see.

function safe(name, fn){
  try { fn(); }
  catch (err) { console.error(`[portfolio] "${name}" failed:`, err); }
}

// ---------- Mobile nav toggle ----------
safe('mobile nav toggle', () => {
  const navBurger = document.getElementById('navBurger');
  const navMobileMenu = document.getElementById('navMobileMenu');
  if (!navBurger || !navMobileMenu) return;
  navBurger.addEventListener('click', () => {
    const isOpen = navMobileMenu.classList.toggle('is-open');
    navBurger.classList.toggle('is-open', isOpen);
    navBurger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  navMobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMobileMenu.classList.remove('is-open');
      navBurger.classList.remove('is-open');
      navBurger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
});

// ---------- YouTube embeds: lazy-load + autoplay only while on screen ----------
safe('YouTube embeds', () => {
  const ytTargets = document.querySelectorAll('[data-yt-id]');
  if (!ytTargets.length) return;
  const buildSrc = (id) =>
    `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}` +
    `&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1&disablekb=1`;

  const ytObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const id = el.dataset.ytId;
      if (entry.isIntersecting){
        if (!el.querySelector('iframe')){
          const iframe = document.createElement('iframe');
          iframe.src = buildSrc(id);
          iframe.title = 'Video preview';
          iframe.setAttribute('frameborder', '0');
          iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
          iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
          iframe.allowFullscreen = true;
          el.appendChild(iframe);
        }
      } else {
        const existing = el.querySelector('iframe');
        if (existing) existing.remove();
      }
    });
  }, { threshold: 0.35, rootMargin: '200px 0px 200px 0px' });

  ytTargets.forEach(el => ytObserver.observe(el));
});

// ---------- Footer year ----------
safe('footer year', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

// ---------- Stagger the pre-marked-up word-mask reveals in the hero ----------
// Words (and their <em> emphasis, where present) are already wrapped in
// .word-mask > .word spans in the HTML, so natural kerning/letter-spacing
// is never disturbed — this just staggers each word's reveal delay.
safe('hero word stagger', () => {
  document.querySelectorAll('.hero-title .line').forEach((line, lineIndex) => {
    line.querySelectorAll('.word').forEach((word, wordIndex) => {
      word.style.animationDelay = (lineIndex * 0.4 + wordIndex * 0.09) + 's';
    });
  });
});

// ---------- Custom cursor ----------
safe('custom cursor', () => {
  if (isTouch) return;
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing(){
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
  });
});

// ---------- Magnetic buttons ----------
safe('magnetic buttons', () => {
  if (isTouch) return;
  document.querySelectorAll('.btn, .reel-play').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.25}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
});

// ---------- 3D tilt on reel cards ----------
safe('card tilt', () => {
  if (isTouch) return;
  document.querySelectorAll('.reel-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${py * -10}deg) rotateY(${px * 10}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
});

// ---------- Scroll reveals ----------
// Belt-and-suspenders: the CSS default for .reveal/.reveal-stagger is
// already visible (see style.css) — this only ADDS a nicer animated
// entrance when it can. If the IntersectionObserver below fails for any
// reason, or takes an element out of view before it fires, the safety
// timeout further down force-reveals anything still unmarked so content
// can never get stuck invisible.
safe('scroll reveals', () => {
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
});

// ---------- Reveal safety net ----------
// Runs regardless of whether the block above succeeded. Anything that
// still hasn't been revealed a couple seconds after load — for any
// reason — gets force-revealed here so nothing stays permanently blank.
safe('reveal safety net', () => {
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.in-view), .reveal-stagger:not(.in-view)')
      .forEach(el => el.classList.add('in-view'));
  }, 2000);
});

// ---------- Stat count-up ----------
safe('stat count-up', () => {
  const countEls = document.querySelectorAll('[data-count-to]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.countTo);
      const suffix = el.dataset.suffix || '';
      const duration = 900;
      const start = performance.now();
      function tick(now){
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  countEls.forEach(el => countObserver.observe(el));
});

// ---------- Signature element: scroll-driven timecode rail ----------
safe('timeline rail', () => {
  const progressEl = document.getElementById('timelineProgress');
  const playheadEl = document.getElementById('timelinePlayhead');
  const codeEl = document.getElementById('timelineCode');
  const heroBannerImg = document.querySelector('.hero-banner img');
  if (!progressEl || !playheadEl || !codeEl) return;

  function framesToTimecode(totalFrames){
    const fps = 30;
    const frames = Math.floor(totalFrames % fps);
    const totalSeconds = Math.floor(totalFrames / fps);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
  }

  function updateTimeline(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    progressEl.style.width = (pct * 100) + '%';
    playheadEl.style.left = (pct * 100) + '%';
    const totalFrames = Math.round(pct * 90 * 30);
    codeEl.textContent = framesToTimecode(totalFrames);

    if (heroBannerImg){
      const shift = Math.min(scrollTop * 0.15, 60);
      heroBannerImg.style.transform = `translateY(${shift}px) scale(1.06)`;
    }
  }
  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);
  updateTimeline();
});

// ---------- Category nav scroll-spy ----------
safe('category scroll-spy', () => {
  const filterLinks = document.querySelectorAll('.filter-btn');
  const categorySections = document.querySelectorAll('.work-category');
  if (!filterLinks.length || !categorySections.length) return;
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        filterLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' });
  categorySections.forEach(sec => spyObserver.observe(sec));
});

// ---------- Reel preview play/pause on click ----------
safe('reel play/pause', () => {
  document.querySelectorAll('.reel-card').forEach(card => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.reel-play');
    if (!video || !playBtn) return;
    playBtn.addEventListener('click', () => {
      if (video.paused){ video.play(); playBtn.textContent = '❚❚'; }
      else { video.pause(); playBtn.textContent = '▶'; }
    });
    video.addEventListener('ended', () => { playBtn.textContent = '▶'; });
  });
});
