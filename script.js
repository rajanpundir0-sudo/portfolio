// ---------- Mobile nav toggle ----------
const navBurger = document.getElementById('navBurger');
const navMobileMenu = document.getElementById('navMobileMenu');
if (navBurger && navMobileMenu){
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
}
// ---------- YouTube embeds: lazy-load + autoplay only while on screen ----------
// Nothing loads until the card is about to enter view (faster initial page
// load), it autoplays muted/looped with no YouTube UI once visible, and the
// iframe is torn down again when scrolled away to free up resources.
const ytTargets = document.querySelectorAll('[data-yt-id]');
if (ytTargets.length){
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
}

// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

// ---------- Stagger the pre-marked-up word-mask reveals in the hero ----------
// Words (and their <em> emphasis, where present) are already wrapped in
// .word-mask > .word spans in the HTML, so natural kerning/letter-spacing
// is never disturbed — this just staggers each word's reveal delay.
document.querySelectorAll('.hero-title .line').forEach((line, lineIndex) => {
  line.querySelectorAll('.word').forEach((word, wordIndex) => {
    word.style.animationDelay = (lineIndex * 0.4 + wordIndex * 0.09) + 's';
  });
});

// ---------- Custom cursor ----------
if (!isTouch){
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
}

// ---------- Magnetic buttons ----------
if (!isTouch){
  document.querySelectorAll('.btn, .reel-play').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.25}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// ---------- 3D tilt on reel cards ----------
if (!isTouch){
  document.querySelectorAll('.reel-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${py * -10}deg) rotateY(${px * 10}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ---------- Scroll reveals ----------
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

// ---------- Stat count-up ----------
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

// ---------- Signature element: scroll-driven timecode rail ----------
const progressEl = document.getElementById('timelineProgress');
const playheadEl = document.getElementById('timelinePlayhead');
const codeEl = document.getElementById('timelineCode');
const heroBannerImg = document.querySelector('.hero-banner img');

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

  // gentle parallax on the hero banner image as it scrolls out of view
  if (heroBannerImg){
    const shift = Math.min(scrollTop * 0.15, 60);
    heroBannerImg.style.transform = `translateY(${shift}px) scale(1.06)`;
  }
}
window.addEventListener('scroll', updateTimeline, { passive: true });
window.addEventListener('resize', updateTimeline);
updateTimeline();

// ---------- Category nav scroll-spy ----------
// Filter buttons are anchor links to each category section; highlight
// whichever one is currently in view as the person scrolls through.
const filterLinks = document.querySelectorAll('.filter-btn');
const categorySections = document.querySelectorAll('.work-category');
if (filterLinks.length && categorySections.length){
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
}

// ---------- Reel preview play/pause on click ----------
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
