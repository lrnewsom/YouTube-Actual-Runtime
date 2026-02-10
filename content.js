/**
 * YouTube Actual Runtime – Firefox content script.
 * Shows real (wall-clock) time remaining and total based on playback speed.
 * Display is hidden at 1× so it doesn’t duplicate YouTube’s own timer.
 */
(function () {
  // --- Constants and state ---
  const DISPLAY_ID = "yt-actual-runtime-display";
  const POLL_INTERVAL_MS = 1000;
  const REINIT_DELAY_MS = 1000;
  const TIME_CONTAINER_SELECTOR = ".ytp-time-contents";

  let displayEl = null;
  let currentVideo = null;

  // --- Time formatting ---
  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // --- DOM helpers ---
  function getVideo() {
    return document.querySelector("video");
  }

  // --- Display lifecycle ---
  function createDisplay() {
    const existing = document.getElementById(DISPLAY_ID);
    if (existing) {
      displayEl = existing;
      return;
    }
    if (displayEl) return;

    displayEl = document.createElement("span");
    displayEl.id = DISPLAY_ID;
    displayEl.style.marginLeft = "8px";
    displayEl.style.fontSize = "12px";
    displayEl.style.opacity = "0.8";
    displayEl.style.color = "#a3e635";
    displayEl.style.fontWeight = "500";
    displayEl.textContent = "⏱ real: --:--";

    const timeContainer = document.querySelector(TIME_CONTAINER_SELECTOR);
    if (timeContainer) {
      timeContainer.appendChild(displayEl);
    }
  }

  function reattachDisplay() {
    displayEl = null;
    createDisplay();
    updateDisplay();
  }

  function onVideoSourceChange() {
    // Same <video> element, new src (e.g. playlist next/prev). Player bar may be re-rendered.
    reattachDisplay();
  }

  // --- Playback sync ---
  function updateDisplay() {
    const video = getVideo();
    if (!video || !displayEl || !video.duration) return;

    // Hide at 1× so we don’t duplicate YouTube’s timer.
    if (video.playbackRate === 1) {
      displayEl.style.display = "none";
      return;
    }

    displayEl.style.display = "";

    const remaining = video.duration - video.currentTime;
    const realRemaining = remaining / video.playbackRate;
    const realDuration = video.duration / video.playbackRate;
    displayEl.textContent = `⏱ real: ${formatTime(
      realRemaining
    )} / ${formatTime(realDuration)}`;
    displayEl.title = `Actual time remaining at ${video.playbackRate}× speed`;
  }

  function start() {
    const video = getVideo();
    if (!video) return;
    currentVideo = video;

    createDisplay();

    // Sync with YouTube by updating on video events instead of setInterval.
    video.addEventListener("timeupdate", updateDisplay);
    video.addEventListener("ratechange", updateDisplay);
    video.addEventListener("seeked", updateDisplay);
    video.addEventListener("play", updateDisplay);
    video.addEventListener("pause", updateDisplay);

    // Playlist: same element gets new src; bar is re-rendered and our span can be removed.
    video.addEventListener("loadstart", onVideoSourceChange);

    updateDisplay();
  }

  // --- Navigation and playlist handling ---
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      const existing = document.getElementById(DISPLAY_ID);
      if (existing) existing.remove();
      displayEl = null;
      currentVideo = null;
      setTimeout(start, REINIT_DELAY_MS);
      return;
    }

    // Display may have been removed when YouTube re-rendered the bar (e.g. playlist).
    const display = document.getElementById(DISPLAY_ID);
    const timeContainer = document.querySelector(TIME_CONTAINER_SELECTOR);
    if (
      currentVideo &&
      document.contains(currentVideo) &&
      (!display || !timeContainer || !timeContainer.contains(display))
    ) {
      reattachDisplay();
    }
  }, POLL_INTERVAL_MS);

  const observer = new MutationObserver(() => {
    const video = getVideo();
    if (!video) return;
    // New page or playlist replaced the <video> node.
    const videoReplaced =
      !currentVideo ||
      !document.contains(currentVideo) ||
      getVideo() !== currentVideo;
    if (videoReplaced) {
      currentVideo = null;
      start();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
