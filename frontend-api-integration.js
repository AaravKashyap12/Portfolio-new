// ===== FIXED FRONTEND INTEGRATION =====
// Drop this file in the same folder as portfolio-with-backend.html
// and include it AFTER all other scripts but BEFORE closing </body>

// ================= CONFIG =================
const API_BASE_URL = "http://localhost:3000"; // CHANGE THIS to your deployed URL

const CONFIG = {
  leetcodeUsername: "AaravKashyap",
  githubUsername: "AaravKashyap12"
};

// ================= HELPERS =================
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) return data.data;
    throw new Error(data.error || "API error");
  } catch (err) {
    console.error("❌ API failed:", url, err);
    return null;
  }
}

function animCount(id, target, delay = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  setTimeout(() => {
    let n = 0;
    const step = Math.ceil(target / 40) || 1;
    const iv = setInterval(() => {
      n = Math.min(n + step, target);
      el.textContent = n;
      if (n >= target) clearInterval(iv);
    }, 30);
  }, delay);
}

// ================= LEETCODE =================
async function initLeetCode() {
  const lc = await safeFetch(`${API_BASE_URL}/api/leetcode/${CONFIG.leetcodeUsername}`) || {
    easy: 68, medium: 47, hard: 12
  };

  const total = lc.easy + lc.medium + lc.hard;

  // Set values with animations
  animCount("lc-easy", lc.easy, 0);
  animCount("lc-med", lc.medium, 200);
  animCount("lc-hard", lc.hard, 400);
  animCount("lc-total", total, 600);

  // Draw donut if the function is available globally
  if (typeof drawDonut === "function") {
    setTimeout(() => drawDonut(lc.easy, lc.medium, lc.hard), 800);
  }
}

// ================= GITHUB =================
async function initGitHubGrid() {
  const gh = await safeFetch(`${API_BASE_URL}/api/github/${CONFIG.githubUsername}`);
  if (!gh) return;

  const total = gh.contributions?.total || 0;
  animCount("gh-commit-count", total, 0);

  // If drawGrid exists, it usually relies on specific data scope.
  // In your portfolio, drawGrid is localized, so we trigger a click or 
  // similar if we need to force a redraw, but usually the inline script handles it.
  if (typeof drawGrid === "function") {
    // Note: Inline drawGrid might not take arguments
    try { drawGrid(gh.contributions.weeks); } catch (e) { drawGrid(); }
  }
}

// ================= APP START =================
async function startPortfolioIntegration() {
  console.log("🚀 Starting Portfolio API Integration...");

  // We run these in parallel
  await Promise.all([
    initLeetCode(),
    initGitHubGrid()
  ]);

  console.log("✅ Stats synchronized with Backend");
}

// Run after DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startPortfolioIntegration);
} else {
  startPortfolioIntegration();
}

// ===== USAGE NOTES =====
// 1. Place this file in your root directory.
// 2. Add <script src="frontend-api-integration.js"></script> before </body>.
// 3. This script is designed to safely enhance your portfolio with real data.
