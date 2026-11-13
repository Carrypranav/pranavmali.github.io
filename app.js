// site/app.js — Scroll-Driven Cinematic Portfolio Engine

(function () {
  'use strict';

  const cfg = window.CONFIG;
  if (!cfg) {
    console.error('Config not found!');
    return;
  }

  // DOM Elements
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPct = document.getElementById('loader-pct');
  const loaderMsg = document.getElementById('loader-msg');
  const video = document.getElementById('film');
  const stage = document.getElementById('stage');
  const scrollTrack = document.getElementById('scroll-track');
  const topProgressBar = document.getElementById('top-progress-bar');
  const scrollHint = document.getElementById('scroll-hint');
  const contactSvgFrame = document.getElementById('contact-svg-frame');
  const resumePaper = document.getElementById('resume-paper');
  const navItems = document.querySelectorAll('.nav-item');

  // Video Selection based on viewport width
  const isMobile = () => window.innerWidth <= 760;
  const getVideoUrl = () => isMobile() ? 'media/film_mobile.mp4' : 'media/film.mp4';

  // Playhead Tracking
  let targetPlayhead = 0;
  let currentPlayhead = 0;
  const LERP_FACTOR = 0.16;
  const SEEK_THRESHOLD = 0.02;

  // Timeline Segments processed from CONFIG
  let segmentRanges = [];
  let totalScrollHeight = 0;

  // ----------------------------------------------------
  // 1. Populate Dynamic Content from CONFIG
  // ----------------------------------------------------
  function populateContent() {
    // Populate Work Project Cards
    const projectCardsContainer = document.getElementById('project-cards');
    if (projectCardsContainer && cfg.projects) {
      projectCardsContainer.innerHTML = cfg.projects.map((p, idx) => `
        <article class="project-card" style="transition-delay: ${idx * 0.12}s">
          <div class="card-top">
            <span class="card-cat">${p.category}</span>
            <h3 class="card-title">${p.title}</h3>
            <p class="card-desc">${p.description}</p>
          </div>
          <div class="card-bottom">
            <div class="card-techs">
              ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
            <div class="card-footer">
              <span class="card-metric">${p.metric}</span>
              <a href="${p.live || p.link}" target="_blank" rel="noopener noreferrer" class="card-link">
                View Project →
              </a>
            </div>
          </div>
        </article>
      `).join('');
    }

    // Populate Skills Cloud
    const skillsCloud = document.getElementById('skills-cloud');
    if (skillsCloud && cfg.skills) {
      skillsCloud.innerHTML = cfg.skills.map((s, idx) => `
        <div class="skill-chip" style="transition-delay: ${idx * 0.06}s">
          <span class="skill-name">${s.name}</span>
          <span class="skill-badge">${s.level}</span>
        </div>
      `).join('');
    }

    // Populate Social Links
    const socialLinks = document.getElementById('social-links');
    if (socialLinks && cfg.contact && cfg.contact.socials) {
      socialLinks.innerHTML = cfg.contact.socials.map(s => `
        <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-btn">
          <span class="social-name">${s.name}</span>
          <span class="social-handle">${s.handle}</span>
        </a>
      `).join('');
    }

    // Copy Email Functionality
    const copyBtn = document.getElementById('copy-email-btn');
    const copyText = document.getElementById('copy-text');
    if (copyBtn && cfg.contact && cfg.contact.email) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(cfg.contact.email).then(() => {
          copyText.textContent = 'Copied!';
          setTimeout(() => { copyText.textContent = 'Copy'; }, 2000);
        }).catch(() => {
          copyText.textContent = 'malipranav1501@gmail.com';
        });
      });
    }
  }

  // ----------------------------------------------------
  // 2. Build Scroll Segments & Track
  // ----------------------------------------------------
  function buildTimeline() {
    const vh = window.innerHeight;
    let currentY = 0;
    segmentRanges = [];

    cfg.timeline.forEach((seg) => {
      const segPixelHeight = seg.h * vh;
      segmentRanges.push({
        id: seg.id,
        section: seg.section || null,
        fromT: seg.t[0],
        toT: seg.t[1],
        isHold: seg.t[0] === seg.t[1],
        startY: currentY,
        endY: currentY + segPixelHeight,
        height: segPixelHeight
      });
      currentY += segPixelHeight;
    });

    totalScrollHeight = currentY;
    scrollTrack.style.height = `${totalScrollHeight + window.innerHeight}px`;
  }

  // ----------------------------------------------------
  // 3. Download Whole Film with Fetch + Progress
  // ----------------------------------------------------
  async function loadFilm() {
    const url = getVideoUrl();
    loaderMsg.textContent = `Streaming visual master (${isMobile() ? 'Mobile' : 'Desktop'})...`;

    // iOS Autoplay / Seek Unlock
    const unlockIOS = () => {
      video.play().then(() => video.pause()).catch(() => {});
      window.removeEventListener('touchstart', unlockIOS);
      window.removeEventListener('click', unlockIOS);
    };
    window.addEventListener('touchstart', unlockIOS, { once: true });
    window.addEventListener('click', unlockIOS, { once: true });

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentLength = response.headers.get('content-length');
      // Approximate fallback sizes if content-length is not exposed by local server
      const totalBytes = contentLength ? parseInt(contentLength, 10) : (isMobile() ? 6300000 : 12500000);
      let loadedBytes = 0;

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loadedBytes += value.length;

        const pct = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
        loaderBar.style.width = `${pct}%`;
        loaderPct.textContent = `${pct}%`;
      }

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(blob);
      video.src = blobUrl;
    } catch (err) {
      console.warn('Fetch streaming fallback, loading direct src:', err);
      // Fallback: direct src
      video.src = url;
    }

    // Wait until video can play through or loadedmetadata
    const onReady = () => {
      loaderBar.style.width = '100%';
      loaderPct.textContent = '100%';
      loaderMsg.textContent = 'Ready';
      setTimeout(() => {
        loader.classList.add('loaded');
      }, 350);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('loadedmetadata', onReady);
    };

    video.addEventListener('canplay', onReady, { once: true });
    video.addEventListener('loadedmetadata', onReady, { once: true });

    // Fallback timer if browser delays canplay event
    setTimeout(onReady, 2500);
  }

  // ----------------------------------------------------
  // 4. Map Scroll to Film Time
  // ----------------------------------------------------
  function updateScrollTarget() {
    const scrollY = window.scrollY;
    const maxScroll = totalScrollHeight;
    const scrollProgress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;

    // Top Progress Line
    topProgressBar.style.width = `${scrollProgress * 100}%`;

    // Hide Scroll Hint after scrolling starts
    if (scrollY > 50) {
      scrollHint.classList.add('hidden');
    } else {
      scrollHint.classList.remove('hidden');
    }

    // Find active segment
    for (let i = 0; i < segmentRanges.length; i++) {
      const seg = segmentRanges[i];
      if (scrollY >= seg.startY && (scrollY <= seg.endY || i === segmentRanges.length - 1)) {
        const segProgress = seg.height > 0 ? (scrollY - seg.startY) / seg.height : 0;
        const clampedProg = Math.max(0, Math.min(1, segProgress));
        targetPlayhead = seg.fromT + clampedProg * (seg.toT - seg.fromT);
        break;
      }
    }
  }

  // ----------------------------------------------------
  // 5. Horizontal Stage Shift Keyframes (Desktop Only)
  // ----------------------------------------------------
  function computeStageShift(time) {
    if (isMobile()) {
      return 0; // Center on mobile
    }

    // Sideways shift over film time:
    // 0.0s - 7.0s (Intro): +22vw (Pranav stands to the right of intro text)
    // 7.0s - 14.5s (Step to close-up): smooth return from +22vw to +8vw
    // 14.5s - 27.5s (Sit down on chair): return to 0vw
    // 27.5s - 30.5s (Work hold): slight -2vw to frame laptop cleanly
    // 30.5s - 46.33s (Walking, resume, wave): 0vw centered
    if (time <= 7.0) {
      return 22; // +22vw
    } else if (time <= 14.5) {
      const p = (time - 7.0) / (14.5 - 7.0);
      return 22 - p * 14; // 22 -> 8
    } else if (time <= 22.0) {
      const p = (time - 14.5) / (22.0 - 14.5);
      return 8 - p * 8; // 8 -> 0
    } else if (time <= 30.5) {
      return -2; // -2vw
    } else {
      return 0; // 0vw
    }
  }

  // ----------------------------------------------------
  // 6. Active Section & Continuous Cross-Fade Loop
  // ----------------------------------------------------
  const sections = {
    intro: document.getElementById('sec-intro'),
    about: document.getElementById('sec-about'),
    work: document.getElementById('sec-work'),
    skills: document.getElementById('sec-skills'),
    resume: document.getElementById('sec-resume'),
    contact: document.getElementById('sec-contact')
  };

  // Continuous smooth cross-fading helper:
  // Returns opacity between 0 and 1, with smooth linear ramps and zero dead zones
  function calcOpacity(time, enterStart, enterPeak, exitPeak, exitEnd) {
    if (time < enterStart || time > exitEnd) return 0;
    if (time >= enterPeak && time <= exitPeak) return 1;
    if (time < enterPeak) {
      return Math.max(0, Math.min(1, (time - enterStart) / (enterPeak - enterStart)));
    }
    if (time > exitPeak) {
      return Math.max(0, Math.min(1, 1 - (time - exitPeak) / (exitEnd - exitPeak)));
    }
    return 0;
  }

  function applySectionOpacity(sec, op) {
    if (!sec) return;
    sec.style.opacity = op.toFixed(3);
    sec.style.visibility = op > 0.005 ? 'visible' : 'hidden';
    sec.style.transform = `translateY(${((1 - op) * 16).toFixed(1)}px)`;
  }

  function updateVisuals(time) {
    // Dynamic stage sideways shift
    const stageX = computeStageShift(time);
    document.documentElement.style.setProperty('--stage-x', `${stageX}vw`);

    // Section continuous cross-fade curves (no gaps, no dead zones)
    // 1. Intro: hold peak at 7.0s, cross-fades out 7.8s -> 11.0s
    const opIntro = calcOpacity(time, 0.0, 0.0, 7.8, 11.0);
    // 2. About: cross-fades in 8.2s -> 12.0s, hold peak at 14.5s, cross-fades out 16.0s -> 20.0s
    const opAbout = calcOpacity(time, 8.2, 12.0, 16.0, 20.0);
    // 3. Work: cross-fades in 18.0s -> 23.5s, hold peak at 27.5s, cross-fades out 28.5s -> 31.0s
    const opWork = calcOpacity(time, 18.0, 23.5, 28.5, 31.0);
    // 4. Skills: cross-fades in 29.5s -> 32.0s, walk peak 32.0s -> 36.5s, cross-fades out 36.5s -> 39.0s
    const opSkills = calcOpacity(time, 29.5, 32.0, 36.5, 39.0);
    // 5. Resume: cross-fades in & drops 38.0s -> 40.2s, pull-down hold peak at 41.5s, cross-fades out 42.2s -> 43.4s
    const opResume = calcOpacity(time, 38.0, 40.2, 42.2, 43.4);
    // 6. Contact: cross-fades in 42.6s -> 43.5s, wave hold peak at 43.5s -> 46.5s
    const opContact = calcOpacity(time, 42.6, 43.5, 46.5, 46.5);

    // Apply continuous styles
    applySectionOpacity(sections.intro, opIntro);
    applySectionOpacity(sections.about, opAbout);
    applySectionOpacity(sections.work, opWork);
    applySectionOpacity(sections.skills, opSkills);
    applySectionOpacity(sections.resume, opResume);
    applySectionOpacity(sections.contact, opContact);

    // Toggle active state for CSS styling
    sections.intro.classList.toggle('active', opIntro > 0.25);
    sections.about.classList.toggle('active', opAbout > 0.25);
    sections.work.classList.toggle('active', opWork > 0.25);
    sections.skills.classList.toggle('active', opSkills > 0.25);
    sections.resume.classList.toggle('active', opResume > 0.25);
    sections.contact.classList.toggle('active', opContact > 0.25);

    // Staggered Card Animation in Work
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => card.classList.toggle('in-view', opWork > 0.1));

    // Staggered Skill Chips
    const skillChips = document.querySelectorAll('.skill-chip');
    skillChips.forEach(chip => chip.classList.toggle('in-view', opSkills > 0.1));

    // Resume Drop Animation (synced to hands pulling down)
    resumePaper.classList.toggle('dropped', opResume > 0.15 || time >= 40.2);

    // Contact SVG Bounding Frame (drawn with stroke-dashoffset during wave)
    contactSvgFrame.classList.toggle('active', opContact > 0.15);
    contactSvgFrame.classList.toggle('drawn', time >= 43.5);

    // Active Navigation State (smooth threshold progression without resetting to Home)
    let activeNav = 'intro';
    if (time >= 42.8) activeNav = 'contact';
    else if (time >= 38.0) activeNav = 'resume';
    else if (time >= 29.5) activeNav = 'skills';
    else if (time >= 18.0) activeNav = 'work';
    else if (time >= 8.2) activeNav = 'about';
    else activeNav = 'intro';

    navItems.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === activeNav);
    });
  }

  // ----------------------------------------------------
  // 7. RequestAnimationFrame Render Loop with Seek Watchdog
  // ----------------------------------------------------
  let isSeeking = false;
  let lastSeekTime = 0;

  video.addEventListener('seeking', () => { isSeeking = true; });
  video.addEventListener('seeked', () => { isSeeking = false; });

  function renderLoop() {
    try {
      // Smooth playhead with lerp
      currentPlayhead += (targetPlayhead - currentPlayhead) * LERP_FACTOR;

      const now = performance.now();
      // Watchdog timeout: if seeking takes longer than 75ms (e.g. stalled decoder), release lock
      if (isSeeking && now - lastSeekTime > 75) {
        isSeeking = false;
      }

      // Seek only when difference exceeds threshold, video has metadata, and not currently locked
      if (video.readyState >= 1 && !isSeeking && Math.abs(currentPlayhead - video.currentTime) > SEEK_THRESHOLD) {
        try {
          isSeeking = true;
          lastSeekTime = now;
          video.currentTime = currentPlayhead;
        } catch (e) {
          isSeeking = false;
        }
      }

      // Update visual states and keyframed transforms
      updateVisuals(currentPlayhead);
    } catch (err) {
      console.warn('Render loop error:', err);
    }

    requestAnimationFrame(renderLoop);
  }

  // ----------------------------------------------------
  // 8. Navigation Smooth-Scroll to Section Holds
  // ----------------------------------------------------
  function setupNavHandlers() {
    navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        // Find corresponding hold segment
        const holdSeg = segmentRanges.find(s => s.section === targetId);
        if (holdSeg) {
          // Scroll to the middle of the hold segment
          const targetY = holdSeg.startY + holdSeg.height * 0.5;
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });
        }
      });
    });

    const logoBtn = document.getElementById('logo-btn');
    if (logoBtn) {
      logoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // ----------------------------------------------------
  // 9. Resize & Initialization
  // ----------------------------------------------------
  function onResize() {
    buildTimeline();
    updateScrollTarget();
  }

  function init() {
    populateContent();
    buildTimeline();
    loadFilm();
    setupNavHandlers();

    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('resize', onResize);

    updateScrollTarget();
    requestAnimationFrame(renderLoop);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
