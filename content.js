/**
 * YouFlix - Netflix theme for YouTube
 */

(function () {
  'use strict';

  if (window.__YOUFLIX_INITIALIZED__) return;
  window.__YOUFLIX_INITIALIZED__ = true;

  let settings = {
    enabled: true,
    heroBanner: true,
    hoverZoom: true,
    cinemaWatchMode: true,
    soundFx: true,
    autoNext: true,
    liveTrailer: true
  };

  let currentVideoList = [];
  let billboardVideo = null;
  let feedObserver = null;
  let domCheckInterval = null;
  let dismissedPostPlayVideoId = null;
  let trailerTimer = null;
  let isTrailerMuted = true;
  let lastPathname = window.location.pathname;

  // Fallback items while feed loads
  const FALLBACK_VIDEOS = [
    {
      id: 'dQw4w9WgXcQ',
      url: '/watch?v=dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      channel: 'Rick Astley',
      views: '1.5B views',
      uploadTime: '14 years ago',
      duration: '3:33',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      maxResThumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      matchScore: '99% Match',
      genres: 'Pop • Nostalgic • Dance'
    },
    {
      id: 'kJQP7kiw5Fk',
      url: '/watch?v=kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      channel: 'Luis Fonsi',
      views: '8.4B views',
      uploadTime: '7 years ago',
      duration: '4:42',
      thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
      maxResThumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
      matchScore: '98% Match',
      genres: 'Latin • Upbeat • Summer'
    },
    {
      id: 'JGwWNGJdvx8',
      url: '/watch?v=JGwWNGJdvx8',
      title: 'Ed Sheeran - Shape of You (Official Music Video)',
      channel: 'Ed Sheeran',
      views: '6.2B views',
      uploadTime: '7 years ago',
      duration: '4:24',
      thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
      maxResThumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
      matchScore: '97% Match',
      genres: 'Acoustic • Romantic • Hit'
    },
    {
      id: 'fJ9rUzIMcZQ',
      url: '/watch?v=fJ9rUzIMcZQ',
      title: 'Queen - Bohemian Rhapsody (Official Video Remastered)',
      channel: 'Queen Official',
      views: '1.7B views',
      uploadTime: '15 years ago',
      duration: '6:00',
      thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
      maxResThumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg',
      matchScore: '99% Match',
      genres: 'Classic Rock • Masterpiece • Epic'
    },
    {
      id: '9bZkp7q19f0',
      url: '/watch?v=9bZkp7q19f0',
      title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
      channel: 'officialpsy',
      views: '5.1B views',
      uploadTime: '12 years ago',
      duration: '4:13',
      thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
      maxResThumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      matchScore: '96% Match',
      genres: 'K-Pop • Energetic • Viral'
    },
    {
      id: 'kXYiU_JCYtU',
      url: '/watch?v=kXYiU_JCYtU',
      title: 'Numb [Official Music Video] - Linkin Park',
      channel: 'Linkin Park',
      views: '2.2B views',
      uploadTime: '17 years ago',
      duration: '3:07',
      thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg',
      maxResThumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/maxresdefault.jpg',
      matchScore: '98% Match',
      genres: 'Rock • Emotional • Intense'
    }
  ];

  // Settings & storage sync
  function initSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(settings, (saved) => {
        if (saved) settings = { ...settings, ...saved };
        applyYouFlixState();
      });

      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
          for (let key in changes) {
            settings[key] = changes[key].newValue;
          }
          applyYouFlixState();
        }
      });
    } else {
      try {
        const local = localStorage.getItem('youflix_settings');
        if (local) settings = { ...settings, ...JSON.parse(local) };
      } catch (e) {}
      applyYouFlixState();
    }

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((request) => {
        if (request && request.type === 'YF_SETTINGS_UPDATED') {
          settings = { ...settings, ...request.settings };
          applyYouFlixState();
        }
      });
    }
  }

  let hasPlayedIntroChime = false;

  // Intro sound
  function playNetflixChime() {
    if (!settings.soundFx) return;

    try {
      const audioUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
        ? chrome.runtime.getURL('assets/netflix-sound.mp3')
        : 'assets/netflix-sound.mp3';

      const audio = new Audio(audioUrl);
      audio.volume = 0.85;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            hasPlayedIntroChime = true;
          })
          .catch(() => {
            // Autoplay blocked before user interaction, queue for first click
            if (!hasPlayedIntroChime) {
              const onFirstUserClick = () => {
                if (!hasPlayedIntroChime && settings.soundFx) {
                  hasPlayedIntroChime = true;
                  const userAudio = new Audio(audioUrl);
                  userAudio.volume = 0.85;
                  userAudio.play().catch(() => {});
                }
                window.removeEventListener('click', onFirstUserClick);
                window.removeEventListener('keydown', onFirstUserClick);
              };
              window.addEventListener('click', onFirstUserClick, { once: true });
              window.addEventListener('keydown', onFirstUserClick, { once: true });
            }
          });
      }
    } catch (err) {}
  }

  function playSynthChimeFallback() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const t = ctx.currentTime || 0;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(74, t);
      gain1.gain.setValueAtTime(0.6, t);
      gain1.gain.setTargetAtTime(0, t, 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.6);

      const t2 = t + 0.16;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(118, t2);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(560, t2);
      filter.frequency.setTargetAtTime(80, t2, 0.35);

      gain2.gain.setValueAtTime(0.7, t2);
      gain2.gain.setTargetAtTime(0, t2, 0.38);

      osc2.connect(filter);
      filter.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 1.2);
    } catch (e) {}
  }

  // Routing & navigation
  function applyYouFlixState() {
    updateFloatingToggle();

    if (settings.enabled) {
      document.body.classList.add('youflix-mode');
      ensureHeader();
      handleRoute();
    } else {
      document.body.classList.remove('youflix-mode', 'youflix-home-active');
      cleanupYouFlixHome();
      cleanupHeader();
      cleanupPostPlayBanner();
    }
  }

  function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path === '/feed/trending' || path === '/feed/explore';
  }

  function isWatchPage() {
    return window.location.pathname === '/watch';
  }

  function handleRoute() {
    if (!settings.enabled) return;

    updateHeaderNavLinks();

    if (isHomePage()) {
      document.body.classList.remove('youflix-watch-active');
      document.body.classList.add('youflix-home-active');
      cleanupWatchPage();
      initHomePage();
    } else {
      document.body.classList.remove('youflix-home-active');
      cleanupYouFlixHome();

      if (isWatchPage()) {
        document.body.classList.add('youflix-watch-active');
        initWatchPage();
      } else {
        document.body.classList.remove('youflix-watch-active');
        cleanupWatchPage();
        cleanupPostPlayBanner();
      }
    }
  }

  // Quick switch toggle
  function updateFloatingToggle() {
    let toggle = document.getElementById('yf-floating-toggle');
    if (!toggle) {
      toggle = document.createElement('div');
      toggle.id = 'yf-floating-toggle';
      toggle.title = 'Switch between Netflix UI and Native YouTube';
      document.body.appendChild(toggle);

      toggle.addEventListener('click', () => {
        settings.enabled = !settings.enabled;
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.set({ enabled: settings.enabled });
        } else {
          localStorage.setItem('youflix_settings', JSON.stringify(settings));
        }
        applyYouFlixState();
      });
    }

    if (settings.enabled) {
      toggle.innerHTML = `
        <span class="yf-float-icon">🍿</span>
        <span class="yf-float-text">YouFlix: ON</span>
      `;
      toggle.classList.remove('disabled');
    } else {
      toggle.innerHTML = `
        <span class="yf-float-icon">🔴</span>
        <span class="yf-float-text">Netflix Mode: OFF</span>
      `;
      toggle.classList.add('disabled');
    }
  }

  // Header & navbar
  function ensureHeader() {
    if (document.getElementById('yf-header')) {
      updateHeaderNavLinks();
      return;
    }

    const donateUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
      ? chrome.runtime.getURL('donate.html')
      : 'donate.html';

    const header = document.createElement('header');
    header.id = 'yf-header';
    header.innerHTML = `
      <div class="yf-header-left">
        <a class="yf-logo" id="yf-home-btn" title="YouFlix Home">
          <span class="yf-logo-text">YOUFLIX</span>
        </a>
        <ul class="yf-nav-links">
          <li class="yf-nav-item" data-path="/"><a href="/">Home</a></li>
          <li class="yf-nav-item" data-path="/feed/trending"><a href="/feed/trending">Trending</a></li>
          <li class="yf-nav-item" data-path="/feed/subscriptions"><a href="/feed/subscriptions">Subscriptions</a></li>
          <li class="yf-nav-item" data-path="/feed/library"><a href="/feed/library">My List</a></li>
          <li class="yf-nav-item" data-path="/shorts"><a href="/shorts">Shorts</a></li>
        </ul>
      </div>
      <div class="yf-header-right">
        <div class="yf-search-box" id="yf-search-container">
          <button class="yf-search-btn" id="yf-search-trigger" title="Search">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <input type="text" id="yf-search-input" placeholder="Titles, creators, genres..." />
          <button class="yf-search-clear" id="yf-search-clear" title="Clear">&times;</button>
        </div>

        <a class="yf-header-donate-btn" href="${donateUrl}" target="_blank" title="Support YouFlix (Donate)">
          <span>☕ Donate</span>
        </a>

        <button class="yf-mode-switch-btn" id="yf-toggle-switch" title="Toggle between Netflix and YouTube">
          <span>Netflix Mode: ON</span>
        </button>

        <div class="yf-profile-container">
          <div class="yf-avatar-wrapper">
            <img class="yf-avatar" id="yf-user-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Account" />
            <span class="yf-caret"></span>
          </div>
          <div class="yf-profile-dropdown">
            <div class="yf-dropdown-item" id="yf-profile-main">
              <img class="yf-avatar" style="width:24px; height:24px;" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" />
              <span>You (Primary)</span>
            </div>
            <div class="yf-dropdown-item" id="yf-profile-kids">
              <span style="font-size:18px;">🧒</span>
              <span>Kids Mode</span>
            </div>
            <div class="yf-dropdown-divider"></div>
            <a class="yf-dropdown-item" href="/feed/library">My List</a>
            <a class="yf-dropdown-item" href="/feed/history">Watch History</a>
            <a class="yf-dropdown-item" href="${donateUrl}" target="_blank" style="color:#e50914;">☕ Support & Donate</a>
            <div class="yf-dropdown-divider"></div>
            <div class="yf-dropdown-item" id="yf-menu-toggle">Switch to Native YouTube</div>
          </div>
        </div>
      </div>
    `;

    document.body.prepend(header);

    // Scroll opacity transition
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    });

    // Home Logo click
    header.querySelector('#yf-home-btn').addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/');
    });

    // Search Interaction
    const searchContainer = header.querySelector('#yf-search-container');
    const searchInput = header.querySelector('#yf-search-input');
    const searchTrigger = header.querySelector('#yf-search-trigger');
    const searchClear = header.querySelector('#yf-search-clear');

    searchTrigger.addEventListener('click', () => {
      if (searchContainer.classList.contains('expanded') && searchInput.value.trim()) {
        executeSearch(searchInput.value.trim());
      } else {
        searchContainer.classList.toggle('expanded');
        if (searchContainer.classList.contains('expanded')) searchInput.focus();
      }
    });

    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim()) searchContainer.classList.add('has-text');
      else searchContainer.classList.remove('has-text');
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchContainer.classList.remove('has-text');
      searchInput.focus();
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        executeSearch(searchInput.value.trim());
      }
    });

    // Header Toggle Mode Button
    header.querySelector('#yf-toggle-switch').addEventListener('click', toggleMode);
    header.querySelector('#yf-menu-toggle').addEventListener('click', toggleMode);

    // Handle nav items click
    header.querySelectorAll('.yf-nav-links a').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href) {
          e.preventDefault();
          navigateTo(href);
        }
      });
    });

    syncNativeAvatar();
    updateHeaderNavLinks();
  }

  function toggleMode() {
    settings.enabled = !settings.enabled;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ enabled: settings.enabled });
    } else {
      localStorage.setItem('youflix_settings', JSON.stringify(settings));
    }
    applyYouFlixState();
  }

  function cleanupHeader() {
    const header = document.getElementById('yf-header');
    if (header) header.remove();
  }

  function updateHeaderNavLinks() {
    const currentPath = window.location.pathname;
    const items = document.querySelectorAll('.yf-nav-item');
    items.forEach(item => {
      const p = item.getAttribute('data-path');
      if (p === currentPath || (p === '/' && currentPath === '')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const toggleBtn = document.querySelector('#yf-toggle-switch span');
    if (toggleBtn) {
      toggleBtn.textContent = settings.enabled ? 'Netflix Mode: ON' : 'Netflix Mode: OFF';
    }
  }

  function executeSearch(query) {
    navigateTo(`/results?search_query=${encodeURIComponent(query)}`);
  }

  function navigateTo(url) {
    window.location.href = url;
  }

  function syncNativeAvatar() {
    const nativeAvatar = document.querySelector('ytd-topbar-menu-button-renderer img, #avatar-btn img, button#avatar-btn yt-img-shadow img');
    if (nativeAvatar && nativeAvatar.src) {
      const yfAvatar = document.getElementById('yf-user-avatar');
      if (yfAvatar) yfAvatar.src = nativeAvatar.src;
    }
  }

  // DOM video parser
  function parseVideoElement(el) {
    try {
      const linkEl = el.querySelector(
        'a#thumbnail[href*="/watch"], a#video-title-link, a[href*="/watch?v="], a[href*="/shorts/"]'
      );
      if (!linkEl) return null;

      const href = linkEl.getAttribute('href') || '';
      let videoId = null;

      if (href.includes('v=')) {
        const match = href.match(/[?&]v=([^&]+)/);
        if (match) videoId = match[1];
      } else if (href.includes('/shorts/')) {
        const parts = href.split('/shorts/')[1];
        if (parts) videoId = parts.split('?')[0];
      }

      if (!videoId) return null;

      const titleEl = el.querySelector('#video-title, #video-title-link, .ytd-video-renderer #title-wrapper');
      const title = titleEl ? (titleEl.getAttribute('title') || titleEl.textContent || '').trim() : 'Featured Video';

      if (!title || title.length < 2) return null;

      const channelEl = el.querySelector('ytd-channel-name yt-formatted-string, #channel-name a, #text.ytd-channel-name, .ytd-channel-name');
      const channel = channelEl ? channelEl.textContent.trim() : 'YouTube Creator';

      const metaSpans = el.querySelectorAll('#metadata-line span, span.ytd-video-meta-block');
      let views = '1.4M views';
      let uploadTime = 'Recently';
      if (metaSpans.length >= 1 && metaSpans[0].textContent.trim()) {
        views = metaSpans[0].textContent.trim();
      }
      if (metaSpans.length >= 2 && metaSpans[1].textContent.trim()) {
        uploadTime = metaSpans[1].textContent.trim();
      }

      const durationEl = el.querySelector(
        'ytd-thumbnail-overlay-time-status-renderer badge-shape, #text.ytd-thumbnail-overlay-time-status-renderer, span.badge-style-type-simple'
      );
      const duration = durationEl ? durationEl.textContent.trim() : '12:45';

      const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const maxResThumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

      const matchScore = 95 + (videoId.charCodeAt(0) % 5);

      // Generate Netflix genre tags based on title/channel
      const genresList = ['Exciting', 'Trending', 'Sci-Fi', 'Inspiring', 'Action', 'Deep Dive', 'Popular'];
      const g1 = genresList[videoId.charCodeAt(0) % genresList.length];
      const g2 = genresList[(videoId.charCodeAt(1) || 3) % genresList.length];
      const genres = `${g1} • ${g2} • 4K`;

      return {
        id: videoId,
        url: `/watch?v=${videoId}`,
        title,
        channel,
        views,
        uploadTime,
        duration,
        thumbnail,
        maxResThumbnail,
        matchScore: `${matchScore}% Match`,
        genres
      };
    } catch (e) {
      return null;
    }
  }

  function collectVideosFromDOM() {
    const videoElements = document.querySelectorAll(
      'ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer'
    );
    const videos = [];
    const seenIds = new Set();

    videoElements.forEach((el) => {
      const data = parseVideoElement(el);
      if (data && !seenIds.has(data.id)) {
        seenIds.add(data.id);
        videos.push(data);
      }
    });

    return videos;
  }

  // Home feed & rows
  function initHomePage() {
    if (!settings.enabled) return;

    let homeContainer = document.getElementById('youflix-home');
    if (!homeContainer) {
      homeContainer = document.createElement('div');
      homeContainer.id = 'youflix-home';
      document.body.appendChild(homeContainer);
      playNetflixChime();
    }

    let videos = collectVideosFromDOM();

    if (videos.length >= 4) {
      currentVideoList = videos;
      renderYouFlixExperience(homeContainer, videos);
    } else {
      currentVideoList = FALLBACK_VIDEOS;
      renderYouFlixExperience(homeContainer, FALLBACK_VIDEOS);
    }

    setupFeedObserver(homeContainer);
    setupNativeScrollerTrigger();
  }

  function setupFeedObserver(container) {
    if (feedObserver) feedObserver.disconnect();

    feedObserver = new MutationObserver(() => {
      const videos = collectVideosFromDOM();
      if (videos.length >= 5 && videos.length > currentVideoList.length) {
        currentVideoList = videos;
        renderYouFlixExperience(container, videos);
      }
    });

    const target = document.querySelector('ytd-app, #page-manager, #contents');
    if (target) {
      feedObserver.observe(target, { childList: true, subtree: true });
    }
  }

  function setupNativeScrollerTrigger() {
    if (domCheckInterval) clearInterval(domCheckInterval);

    domCheckInterval = setInterval(() => {
      if (!settings.enabled || !isHomePage()) {
        clearInterval(domCheckInterval);
        return;
      }

      if (currentVideoList.length < 24) {
        window.dispatchEvent(new CustomEvent('scroll'));
        const scroller = document.querySelector('ytd-rich-grid-renderer');
        if (scroller) {
          scroller.dispatchEvent(new CustomEvent('scroll', { bubbles: true }));
        }
      }
    }, 3000);
  }

  function cleanupYouFlixHome() {
    const home = document.getElementById('youflix-home');
    if (home) home.remove();
    if (feedObserver) {
      feedObserver.disconnect();
      feedObserver = null;
    }
    if (domCheckInterval) {
      clearInterval(domCheckInterval);
      domCheckInterval = null;
    }
    if (trailerTimer) {
      clearTimeout(trailerTimer);
      trailerTimer = null;
    }
  }

  function renderYouFlixExperience(container, videos) {
    if (!videos || videos.length === 0) return;

    billboardVideo = videos[0];

    // Organize into categorized Netflix rows (Row 1 is the signature TOP 10 row)
    const categories = [
      { title: 'Top 10 in YouFlix Today', isTop10: true, items: videos.slice(1, 11) },
      { title: '🎬 Recommended For You', isTop10: false, items: videos.slice(11, 19) },
      { title: '📺 Subscriptions & Top Channels', isTop10: false, items: videos.slice(19, 27) },
      { title: '⚡ Watch It Again', isTop10: false, items: videos.slice(27, 35) },
      { title: '🎮 Gaming & Entertainment', isTop10: false, items: videos.slice(35, 43) },
      { title: '💡 Deep Dives & Tech', isTop10: false, items: videos.slice(43, 51) }
    ].filter(cat => cat.items.length > 0);

    if (categories.length < 3) {
      const all = videos.slice(1);
      categories.length = 0;
      categories.push({ title: 'Top 10 in YouFlix Today', isTop10: true, items: all.slice(0, 10) });
      if (all.length > 3) {
        categories.push({ title: '🎬 Top Picks For You', isTop10: false, items: all.slice(3).concat(all.slice(0, 3)) });
      }
      categories.push({ title: '⚡ Featured Today', isTop10: false, items: FALLBACK_VIDEOS.slice(0, 6) });
    }

    let billboardHtml = '';
    if (settings.heroBanner && billboardVideo) {
      billboardHtml = `
        <div id="yf-billboard">
          <div class="yf-billboard-backdrop" id="yf-billboard-bg" style="background-image: url('${billboardVideo.maxResThumbnail}'), url('${billboardVideo.thumbnail}');">
            <div id="yf-trailer-container" class="yf-trailer-frame"></div>
          </div>
          <div class="yf-billboard-vignette"></div>
          <div class="yf-billboard-content">
            <div class="yf-spotlight-tag">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              YOUFLIX SPOTLIGHT
            </div>
            <h1 class="yf-billboard-title">${escapeHtml(billboardVideo.title)}</h1>
            <div class="yf-billboard-meta">
              <span class="yf-match-percent">${billboardVideo.matchScore}</span>
              <span class="yf-pill-badge">4K ULTRA HD</span>
              <span class="yf-pill-badge">16+</span>
              <span>${escapeHtml(billboardVideo.channel)}</span>
              <span>${escapeHtml(billboardVideo.views)}</span>
            </div>
            <p class="yf-billboard-desc">
              Watch this popular release by ${escapeHtml(billboardVideo.channel)}. Streamed over ${escapeHtml(billboardVideo.views)} with stellar audience reviews. Stream in cinema-grade 4K Ultra HD exclusively on YouFlix.
            </p>
            <div class="yf-billboard-actions">
              <button class="yf-btn-play" id="yf-billboard-play-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Play
              </button>
              <button class="yf-btn-info" id="yf-billboard-info-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                More Info
              </button>
            </div>
          </div>
          <div class="yf-billboard-right">
            <button class="yf-btn-volume" id="yf-billboard-vol-btn" title="Toggle Sound / Preview">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            </button>
            <div class="yf-billboard-maturity">
              <span class="yf-rating-text">U/A 16+</span>
            </div>
          </div>
        </div>
      `;
    }

    // Build Rows HTML with Pagination Indicators
    let rowsHtml = '<div id="yf-rows-container">';
    categories.forEach((cat, index) => {
      const isTop10 = cat.isTop10;
      rowsHtml += `
        <div class="yf-row ${isTop10 ? 'top-10-row' : ''}" data-row="${index}">
          <div class="yf-row-header">
            <div class="yf-row-title-area">
              <h2 class="yf-row-title">${escapeHtml(cat.title)}</h2>
              <span class="yf-row-explore">Explore All &rsaquo;</span>
            </div>
            <ul class="yf-pagination-indicator">
              <li class="yf-page-dot active"></li>
              <li class="yf-page-dot"></li>
              <li class="yf-page-dot"></li>
            </ul>
          </div>
          <div class="yf-slider-wrapper">
            <button class="yf-slider-arrow left" data-action="prev" title="Scroll Left">
              <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <div class="yf-slider-track">
              ${cat.items.map((v, itemIdx) => createCardHtml(v, itemIdx, cat.items.length, isTop10)).join('')}
            </div>
            <button class="yf-slider-arrow right" data-action="next" title="Scroll Right">
              <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
        </div>
      `;
    });
    rowsHtml += '</div>';

    container.innerHTML = billboardHtml + rowsHtml;

    attachBillboardEvents();
    attachSliderRowEvents();
    attachCardEvents();
    startBillboardTrailer();
  }

  function createCardHtml(video, index, total, isTop10) {
    let positionClass = '';
    if (index === 0) positionClass = 'first-card';
    else if (index === total - 1) positionClass = 'last-card';

    return `
      <div class="yf-card ${positionClass}" data-video-id="${video.id}" data-url="${video.url}">
        ${isTop10 ? `<span class="yf-top10-rank">${index + 1}</span>` : ''}
        <img class="yf-card-thumb" src="${video.thumbnail}" alt="${escapeHtml(video.title)}" loading="lazy" />
        <span class="yf-card-duration">${escapeHtml(video.duration)}</span>
        
        <div class="yf-card-hover-panel">
          <div class="yf-card-actions">
            <div class="yf-actions-left">
              <button class="yf-round-btn play yf-action-play" title="Play Now">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
              <button class="yf-round-btn yf-action-add" title="Add to Watch Later">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <button class="yf-round-btn yf-action-like" title="I like this">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              </button>
            </div>
            <button class="yf-round-btn yf-action-info" title="More Info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
          <h3 class="yf-card-title">${escapeHtml(video.title)}</h3>
          <div class="yf-card-meta">
            <span class="yf-match-percent">${video.matchScore}</span>
            <span class="yf-pill-badge">HD</span>
            <span>${escapeHtml(video.duration)}</span>
          </div>
          <div class="yf-genre-bullets">${video.genres || 'Exciting • Popular'}</div>
          <div class="yf-card-channel">${escapeHtml(video.channel)} • ${escapeHtml(video.views)}</div>
        </div>
      </div>
    `;
  }

  // Billboard live trailer
  function startBillboardTrailer() {
    if (!settings.liveTrailer || !billboardVideo) return;
    if (trailerTimer) clearTimeout(trailerTimer);

    trailerTimer = setTimeout(() => {
      const container = document.getElementById('yf-trailer-container');
      if (!container || !billboardVideo) return;

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${billboardVideo.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${billboardVideo.id}&playsinline=1&modestbranding=1&rel=0`;
      iframe.title = 'Billboard Trailer';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.className = 'yf-trailer-embed';
      container.innerHTML = '';
      container.appendChild(iframe);
      isTrailerMuted = true;
    }, 1800);
  }

  function attachBillboardEvents() {
    const playBtn = document.getElementById('yf-billboard-play-btn');
    if (playBtn && billboardVideo) {
      playBtn.addEventListener('click', () => {
        navigateTo(billboardVideo.url);
      });
    }

    const infoBtn = document.getElementById('yf-billboard-info-btn');
    if (infoBtn && billboardVideo) {
      infoBtn.addEventListener('click', () => {
        openDetailModal(billboardVideo);
      });
    }

    const volBtn = document.getElementById('yf-billboard-vol-btn');
    if (volBtn) {
      volBtn.addEventListener('click', () => {
        const iframe = document.querySelector('.yf-trailer-embed');
        if (iframe && billboardVideo) {
          isTrailerMuted = !isTrailerMuted;
          const muteParam = isTrailerMuted ? '1' : '0';
          iframe.src = `https://www.youtube.com/embed/${billboardVideo.id}?autoplay=1&mute=${muteParam}&controls=0&loop=1&playlist=${billboardVideo.id}&playsinline=1&modestbranding=1&rel=0`;
          volBtn.innerHTML = isTrailerMuted
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
        } else {
          playNetflixChime();
        }
      });
    }
  }

  function attachSliderRowEvents() {
    const rows = document.querySelectorAll('.yf-row');
    rows.forEach(row => {
      const track = row.querySelector('.yf-slider-track');
      const leftBtn = row.querySelector('.yf-slider-arrow.left');
      const rightBtn = row.querySelector('.yf-slider-arrow.right');
      const dots = row.querySelectorAll('.yf-page-dot');

      let currentPage = 0;
      const totalPages = dots.length || 3;

      function updateDots(page) {
        dots.forEach((dot, idx) => {
          if (idx === page) dot.classList.add('active');
          else dot.classList.remove('active');
        });
      }

      if (leftBtn && track) {
        leftBtn.addEventListener('click', () => {
          const scrollDistance = track.clientWidth * 0.8;
          track.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
          currentPage = Math.max(0, currentPage - 1);
          updateDots(currentPage);
        });
      }

      if (rightBtn && track) {
        rightBtn.addEventListener('click', () => {
          const scrollDistance = track.clientWidth * 0.8;
          track.scrollBy({ left: scrollDistance, behavior: 'smooth' });
          currentPage = Math.min(totalPages - 1, currentPage + 1);
          updateDots(currentPage);
        });
      }
    });
  }

  function attachCardEvents() {
    const cards = document.querySelectorAll('.yf-card');
    cards.forEach(card => {
      const url = card.getAttribute('data-url');
      const videoId = card.getAttribute('data-video-id');

      card.addEventListener('click', (e) => {
        if (e.target.closest('.yf-action-info')) {
          e.stopPropagation();
          const videoObj = currentVideoList.find(v => v.id === videoId) || FALLBACK_VIDEOS.find(v => v.id === videoId);
          if (videoObj) openDetailModal(videoObj);
          return;
        }

        if (e.target.closest('.yf-action-add')) {
          e.stopPropagation();
          const btn = e.target.closest('.yf-action-add');
          btn.style.color = '#46d369';
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          btn.title = 'Saved to My List';
          return;
        }

        if (e.target.closest('.yf-action-like')) {
          e.stopPropagation();
          const btn = e.target.closest('.yf-action-like');
          btn.style.color = '#e50914';
          return;
        }

        if (url) {
          navigateTo(url);
        }
      });
    });
  }

  // Video detail modal
  function openDetailModal(video) {
    closeDetailModal();

    const relatedVideos = currentVideoList.filter(v => v.id !== video.id).slice(0, 6);
    if (relatedVideos.length === 0) {
      relatedVideos.push(...FALLBACK_VIDEOS.filter(v => v.id !== video.id).slice(0, 6));
    }

    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'yf-modal-backdrop';
    modalBackdrop.id = 'yf-active-modal';

    const donateUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
      ? chrome.runtime.getURL('donate.html')
      : 'donate.html';

    modalBackdrop.innerHTML = `
      <div class="yf-modal-box">
        <button class="yf-modal-close" id="yf-modal-close-btn">&times;</button>
        <div class="yf-modal-hero" style="background-image: url('${video.maxResThumbnail}'), url('${video.thumbnail}');">
          <div class="yf-modal-hero-overlay"></div>
          <div class="yf-modal-hero-content">
            <h2 class="yf-modal-title">${escapeHtml(video.title)}</h2>
            <div class="yf-billboard-actions">
              <button class="yf-btn-play" id="yf-modal-play-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Play
              </button>
              <button class="yf-round-btn" style="width:42px; height:42px;" id="yf-modal-save-btn" title="Save to list">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="yf-modal-body">
          <div class="yf-modal-top-grid">
            <div>
              <div class="yf-billboard-meta" style="margin-bottom: 16px;">
                <span class="yf-match-percent">${video.matchScore}</span>
                <span class="yf-pill-badge">4K ULTRA HD</span>
                <span class="yf-pill-badge">16+</span>
                <span>${escapeHtml(video.duration)}</span>
              </div>
              <p class="yf-modal-desc">
                Watch this release by <strong>${escapeHtml(video.channel)}</strong>. 
                With over ${escapeHtml(video.views)}, stream uninterrupted in cinema mode on YouFlix.
              </p>
            </div>
            <div class="yf-modal-side-meta">
              <div><span>Creator:</span> <strong>${escapeHtml(video.channel)}</strong></div>
              <div><span>Views:</span> <strong>${escapeHtml(video.views)}</strong></div>
              <div><span>Uploaded:</span> <strong>${escapeHtml(video.uploadTime)}</strong></div>
              <div><span>Audio:</span> <strong>English [Original], Stereo 5.1</strong></div>
              <div><span>Subtitles:</span> <strong>English, Spanish, French, Hindi</strong></div>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="yf-more-like-section">
            <h3>More Like This</h3>
            <div class="yf-more-like-grid">
              ${relatedVideos.map(r => `
                <div class="yf-mlt-card" data-url="${r.url}">
                  <div class="yf-mlt-thumb-wrap">
                    <img class="yf-mlt-thumb" src="${r.thumbnail}" alt="${escapeHtml(r.title)}" />
                    <span class="yf-mlt-duration">${escapeHtml(r.duration)}</span>
                  </div>
                  <div class="yf-mlt-content">
                    <div class="yf-mlt-header">
                      <span class="yf-match-percent" style="font-size:12px;">${r.matchScore}</span>
                      <span class="yf-pill-badge" style="font-size:10px;">HD</span>
                    </div>
                    <h4 class="yf-mlt-title">${escapeHtml(r.title)}</h4>
                    <span style="font-size:11px; color:#888;">${escapeHtml(r.channel)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Support Project -->
          <div class="yf-modal-donate-bar">
            <span>Enjoying YouFlix? Consider supporting ongoing maintenance:</span>
            <a href="${donateUrl}" target="_blank" class="yf-modal-donate-link">☕ Support & Donate</a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    modalBackdrop.querySelector('#yf-modal-close-btn').addEventListener('click', closeDetailModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeDetailModal();
    });

    modalBackdrop.querySelector('.yf-modal-box').addEventListener('click', (e) => {
      e.stopPropagation();
    });

    modalBackdrop.querySelector('#yf-modal-play-btn').addEventListener('click', () => {
      navigateTo(video.url);
    });

    const saveBtn = modalBackdrop.querySelector('#yf-modal-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        saveBtn.style.color = '#46d369';
        saveBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      });
    }

    modalBackdrop.querySelectorAll('.yf-mlt-card').forEach(c => {
      c.addEventListener('click', () => {
        navigateTo(c.getAttribute('data-url'));
      });
    });

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeDetailModal();
        window.removeEventListener('keydown', onKeyDown);
      }
    };
    window.addEventListener('keydown', onKeyDown);
  }

  function closeDetailModal() {
    const activeModal = document.getElementById('yf-active-modal');
    if (activeModal) activeModal.remove();
  }

  // Watch page & cinema player

  let watchBarTimeout = null;
  let mouseIdleTimeout = null;
  let onActivityHandler = null;
  let onKeyDownHandler = null;
  let hasSkippedIntro = false;
  let lastPulseTime = 0;

  function initWatchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentVideoId = urlParams.get('v');

    if (dismissedPostPlayVideoId && dismissedPostPlayVideoId !== currentVideoId) {
      dismissedPostPlayVideoId = null;
    }
    hasSkippedIntro = false;

    ensureWatchBar();
    initMouseIdleTracker();

    // Auto-engage Theater Mode if cinema mode is enabled
    if (settings.cinemaWatchMode) {
      setTimeout(() => {
        const theaterContainer = document.querySelector('ytd-watch-flexy[theater]');
        if (!theaterContainer) {
          const sizeBtn = document.querySelector('button.ytp-size-button');
          if (sizeBtn) sizeBtn.click();
        }
      }, 600);
    }

    const video = document.querySelector('video');
    if (!video) {
      setTimeout(initWatchPage, 400);
      return;
    }

    setupPlayerInteractions(video);

    video.ontimeupdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration || 0;

      // 1. Netflix "Skip Intro" button (appears between 5s and 85s if video > 2 min)
      if (settings.cinemaWatchMode && !hasSkippedIntro && duration > 120 && currentTime >= 5 && currentTime <= 85) {
        ensureSkipIntroButton(video);
      } else {
        const existingSkip = document.getElementById('yf-skip-intro-btn');
        if (existingSkip && (currentTime > 90 || hasSkippedIntro)) {
          existingSkip.remove();
        }
      }

      // 2. Post-Play Next Video Countdown (last 10s of video)
      if (!settings.autoNext) return;
      if (dismissedPostPlayVideoId === currentVideoId) return;

      const timeLeft = duration - currentTime;
      if (duration > 30 && timeLeft > 0 && timeLeft <= 10) {
        showPostPlayBanner(currentVideoId);
      }
    };
  }

  function ensureWatchBar() {
    let bar = document.getElementById('yf-watch-bar');
    const playerContainer = document.getElementById('movie_player') || document.querySelector('#player-container') || document.body;

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'yf-watch-bar';
      bar.className = 'visible';
      bar.innerHTML = `
        <div class="yf-watch-bar-left">
          <button class="yf-btn-back" id="yf-watch-back-btn" title="Back to Netflix Browse">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Browse</span>
          </button>
        </div>
        <div class="yf-watch-bar-center">
          <h2 class="yf-watch-title" id="yf-watch-video-title">Now Playing</h2>
          <span class="yf-watch-channel" id="yf-watch-channel-name">YouTube Cinema</span>
        </div>
        <div class="yf-watch-bar-right">
          <span class="yf-pill-badge maturity">TV-MA</span>
          <span class="yf-pill-badge">4K ULTRA HD</span>
          <span class="yf-pill-badge">DOLBY 5.1</span>
        </div>
      `;

      playerContainer.appendChild(bar);

      bar.querySelector('#yf-watch-back-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        if (window.history.length > 1 && document.referrer.includes('youtube.com')) {
          window.history.back();
        } else {
          navigateTo('/');
        }
      });
    } else {
      const moviePlayer = document.getElementById('movie_player');
      if (moviePlayer && bar.parentElement !== moviePlayer) {
        moviePlayer.appendChild(bar);
      }
    }

    updateWatchBarMetadata();
  }

  function updateWatchBarMetadata() {
    setTimeout(() => {
      const titleEl = document.querySelector('ytd-watch-metadata #title h1, h1.ytd-watch-metadata, #title h1');
      const channelEl = document.querySelector('ytd-watch-metadata ytd-channel-name yt-formatted-string, ytd-watch-metadata #channel-name a');

      const titleText = titleEl ? titleEl.textContent.trim() : document.title.replace(' - YouTube', '');
      const channelText = channelEl ? channelEl.textContent.trim() : '';

      const barTitle = document.getElementById('yf-watch-video-title');
      const barChannel = document.getElementById('yf-watch-channel-name');

      if (barTitle && titleText) barTitle.textContent = titleText;
      if (barChannel && channelText) barChannel.textContent = channelText;
    }, 800);
  }

  function ensureSkipIntroButton(video) {
    if (document.getElementById('yf-skip-intro-btn')) return;
    const player = document.getElementById('movie_player') || document.querySelector('#player-container');
    if (!player) return;

    const skipBtn = document.createElement('button');
    skipBtn.id = 'yf-skip-intro-btn';
    skipBtn.className = 'yf-skip-intro-btn';
    skipBtn.innerHTML = `
      <span>Skip Intro</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
      </svg>
    `;

    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      hasSkippedIntro = true;
      if (video) {
        video.currentTime += 45;
        triggerPlayerPulse('forward');
      }
      skipBtn.style.opacity = '0';
      skipBtn.style.pointerEvents = 'none';
      setTimeout(() => {
        if (skipBtn.parentNode) skipBtn.remove();
      }, 300);
    });

    player.appendChild(skipBtn);
  }

  function triggerPlayerPulse(type) {
    const player = document.getElementById('movie_player');
    if (!player) return;

    const existing = player.querySelector('.yf-player-pulse');
    if (existing) existing.remove();

    const pulse = document.createElement('div');
    pulse.className = 'yf-player-pulse';

    if (type === 'play') {
      pulse.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
    } else if (type === 'pause') {
      pulse.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      `;
    } else if (type === 'forward') {
      pulse.innerHTML = `
        <div class="yf-seek-pulse">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="13 17 18 12 13 7"></polyline>
            <polyline points="6 17 11 12 6 7"></polyline>
          </svg>
          <span>+10s</span>
        </div>
      `;
    } else if (type === 'rewind') {
      pulse.innerHTML = `
        <div class="yf-seek-pulse">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="11 17 6 12 11 7"></polyline>
            <polyline points="18 17 13 12 18 7"></polyline>
          </svg>
          <span>-10s</span>
        </div>
      `;
    }

    player.appendChild(pulse);
    setTimeout(() => {
      if (pulse.parentNode) pulse.remove();
    }, 550);
  }

  function setupPlayerInteractions(video) {
    if (video.__yf_bound__) return;
    video.__yf_bound__ = true;

    video.addEventListener('play', () => {
      const now = Date.now();
      if (now - lastPulseTime > 400) {
        lastPulseTime = now;
        triggerPlayerPulse('play');
      }
    });

    video.addEventListener('pause', () => {
      const now = Date.now();
      if (now - lastPulseTime > 400 && !video.ended) {
        lastPulseTime = now;
        triggerPlayerPulse('pause');
      }
    });

    if (!onKeyDownHandler) {
      onKeyDownHandler = (e) => {
        if (!isWatchPage()) return;
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;

        if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
          triggerPlayerPulse('forward');
        } else if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
          triggerPlayerPulse('rewind');
        }
      };
      window.addEventListener('keydown', onKeyDownHandler);
    }
  }

  function initMouseIdleTracker() {
    if (onActivityHandler) return;

    onActivityHandler = () => {
      document.body.classList.remove('mouse-idle');
      const bar = document.getElementById('yf-watch-bar');
      if (bar) bar.classList.add('visible');

      const skipBtn = document.getElementById('yf-skip-intro-btn');
      if (skipBtn) skipBtn.classList.remove('idle-hide');

      if (mouseIdleTimeout) clearTimeout(mouseIdleTimeout);

      mouseIdleTimeout = setTimeout(() => {
        const video = document.querySelector('video');
        if (isWatchPage() && video && !video.paused) {
          document.body.classList.add('mouse-idle');
          if (bar) bar.classList.remove('visible');
          if (skipBtn) skipBtn.classList.add('idle-hide');
        }
      }, 2600);
    };

    window.addEventListener('mousemove', onActivityHandler);
    window.addEventListener('mousedown', onActivityHandler);
    window.addEventListener('touchstart', onActivityHandler, { passive: true });

    // Initial timeout
    mouseIdleTimeout = setTimeout(() => {
      const video = document.querySelector('video');
      if (isWatchPage() && video && !video.paused) {
        document.body.classList.add('mouse-idle');
        const bar = document.getElementById('yf-watch-bar');
        if (bar) bar.classList.remove('visible');
      }
    }, 3200);
  }

  function cleanupWatchPage() {
    const bar = document.getElementById('yf-watch-bar');
    if (bar) bar.remove();

    const skipBtn = document.getElementById('yf-skip-intro-btn');
    if (skipBtn) skipBtn.remove();

    const pulse = document.querySelector('.yf-player-pulse');
    if (pulse) pulse.remove();

    if (onActivityHandler) {
      window.removeEventListener('mousemove', onActivityHandler);
      window.removeEventListener('mousedown', onActivityHandler);
      window.removeEventListener('touchstart', onActivityHandler);
      onActivityHandler = null;
    }

    if (onKeyDownHandler) {
      window.removeEventListener('keydown', onKeyDownHandler);
      onKeyDownHandler = null;
    }

    if (mouseIdleTimeout) {
      clearTimeout(mouseIdleTimeout);
      mouseIdleTimeout = null;
    }

    document.body.classList.remove('mouse-idle');
    cleanupPostPlayBanner();
  }

  function showPostPlayBanner(currentVideoId) {
    if (document.getElementById('yf-postplay-banner')) return;
    if (dismissedPostPlayVideoId === currentVideoId) return;

    const nextVideoEl = document.querySelector(
      'ytd-compact-video-renderer, ytd-watch-next-secondary-results-renderer ytd-video-renderer'
    );
    let nextData = null;
    if (nextVideoEl) {
      nextData = parseVideoElement(nextVideoEl);
    }
    if (!nextData && currentVideoList.length > 1) {
      nextData = currentVideoList[1];
    }
    if (!nextData) nextData = FALLBACK_VIDEOS[0];

    const banner = document.createElement('div');
    banner.id = 'yf-postplay-banner';
    let countdown = 8;

    banner.innerHTML = `
      <div class="yf-postplay-header">
        <span>NEXT EPISODE</span>
        <span class="yf-postplay-timer" id="yf-postplay-timer-text">Starting in ${countdown}s</span>
      </div>
      <div class="yf-postplay-content">
        <img class="yf-postplay-thumb" src="${nextData.thumbnail}" alt="Next Video" />
        <div class="yf-postplay-info">
          <h4 class="yf-postplay-title">${escapeHtml(nextData.title)}</h4>
          <span style="font-size:11px; color:#aaa;">${escapeHtml(nextData.channel)}</span>
        </div>
      </div>
      <div class="yf-postplay-actions">
        <button class="yf-btn-postplay primary" id="yf-postplay-play">Play Now</button>
        <button class="yf-btn-postplay secondary" id="yf-postplay-cancel">Cancel</button>
      </div>
    `;

    document.body.appendChild(banner);

    const timerText = banner.querySelector('#yf-postplay-timer-text');
    const interval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(interval);
        navigateTo(nextData.url);
      } else if (timerText) {
        timerText.textContent = `Starting in ${countdown}s`;
      }
    }, 1000);

    banner.querySelector('#yf-postplay-play').addEventListener('click', () => {
      clearInterval(interval);
      navigateTo(nextData.url);
    });

    banner.querySelector('#yf-postplay-cancel').addEventListener('click', () => {
      clearInterval(interval);
      dismissedPostPlayVideoId = currentVideoId;
      banner.remove();
    });
  }

  function cleanupPostPlayBanner() {
    const banner = document.getElementById('yf-postplay-banner');
    if (banner) banner.remove();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Route listeners

  document.addEventListener('yt-navigate-finish', handleRoute);
  window.addEventListener('yt-navigate-finish', handleRoute);
  document.addEventListener('yt-page-data-updated', handleRoute);
  window.addEventListener('popstate', handleRoute);

  setInterval(() => {
    if (window.location.pathname !== lastPathname) {
      lastPathname = window.location.pathname;
      handleRoute();
    }
  }, 500);

  initSettings();

})();
