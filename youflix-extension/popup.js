// YouFlix popup controller

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    enabled: document.getElementById('toggle-enabled'),
    heroBanner: document.getElementById('toggle-hero'),
    liveTrailer: document.getElementById('toggle-trailer'),
    hoverZoom: document.getElementById('toggle-hover'),
    cinemaWatchMode: document.getElementById('toggle-cinema'),
    soundFx: document.getElementById('toggle-sound'),
    autoNext: document.getElementById('toggle-autonext'),
    statusBadge: document.getElementById('status-badge'),
    btnOpenYoutube: document.getElementById('btn-open-youtube'),
    btnTestChime: document.getElementById('btn-test-chime'),
    btnDonate: document.getElementById('btn-open-donate'),
    footerDonate: document.getElementById('footer-donate-link')
  };

  const defaultSettings = {
    enabled: true,
    heroBanner: true,
    liveTrailer: true,
    hoverZoom: true,
    cinemaWatchMode: true,
    soundFx: true,
    autoNext: true
  };

  // Load saved settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(defaultSettings, (items) => {
      applyValuesToUI(items);
    });
  } else {
    try {
      const stored = localStorage.getItem('youflix_settings');
      const items = stored ? JSON.parse(stored) : defaultSettings;
      applyValuesToUI(items);
    } catch (e) {
      applyValuesToUI(defaultSettings);
    }
  }

  function applyValuesToUI(items) {
    elements.enabled.checked = items.enabled !== false;
    elements.heroBanner.checked = items.heroBanner !== false;
    elements.liveTrailer.checked = items.liveTrailer !== false;
    elements.hoverZoom.checked = items.hoverZoom !== false;
    elements.cinemaWatchMode.checked = items.cinemaWatchMode !== false;
    elements.soundFx.checked = items.soundFx !== false;
    elements.autoNext.checked = items.autoNext !== false;

    updateStatusBadge(elements.enabled.checked);
  }

  function saveSettings() {
    const updated = {
      enabled: elements.enabled.checked,
      heroBanner: elements.heroBanner.checked,
      liveTrailer: elements.liveTrailer.checked,
      hoverZoom: elements.hoverZoom.checked,
      cinemaWatchMode: elements.cinemaWatchMode.checked,
      soundFx: elements.soundFx.checked,
      autoNext: elements.autoNext.checked
    };

    updateStatusBadge(updated.enabled);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set(updated);

      // Notify YouTube tabs
      if (chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
          if (tabs && tabs.length > 0) {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, {
                type: 'YF_SETTINGS_UPDATED',
                settings: updated
              }).catch(() => {});
            });
          }
        });
      }
    } else {
      localStorage.setItem('youflix_settings', JSON.stringify(updated));
    }
  }

  function updateStatusBadge(isActive) {
    if (isActive) {
      elements.statusBadge.classList.remove('disabled');
      elements.statusBadge.querySelector('.status-text').textContent = 'Active';
    } else {
      elements.statusBadge.classList.add('disabled');
      elements.statusBadge.querySelector('.status-text').textContent = 'Disabled';
    }
  }

  // Toggle listeners
  [
    elements.enabled,
    elements.heroBanner,
    elements.liveTrailer,
    elements.hoverZoom,
    elements.cinemaWatchMode,
    elements.soundFx,
    elements.autoNext
  ].forEach(input => {
    if (input) input.addEventListener('change', saveSettings);
  });

  // Open YouTube
  elements.btnOpenYoutube.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'https://www.youtube.com' });
    } else {
      window.open('https://www.youtube.com', '_blank');
    }
  });

  // Donation handler
  function openDonationPage(amount) {
    const url = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
      ? chrome.runtime.getURL(`donate.html${amount ? '?amount=' + amount : ''}`)
      : `donate.html${amount ? '?amount=' + amount : ''}`;

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  }

  if (elements.btnDonate) {
    elements.btnDonate.addEventListener('click', () => openDonationPage(5));
  }

  if (elements.footerDonate) {
    elements.footerDonate.addEventListener('click', (e) => {
      e.preventDefault();
      openDonationPage(5);
    });
  }

  document.querySelectorAll('.donate-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const amount = chip.dataset.amount || 5;
      openDonationPage(amount);
    });
  });

  // Sound test
  elements.btnTestChime.addEventListener('click', () => {
    playChime();
  });

  function playChime() {
    try {
      const audioUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
        ? chrome.runtime.getURL('assets/netflix-sound.mp3')
        : 'assets/netflix-sound.mp3';

      const audio = new Audio(audioUrl);
      audio.volume = 0.85;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          playSynthChimeFallback();
        });
      }
    } catch (e) {
      playSynthChimeFallback();
    }
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
});
