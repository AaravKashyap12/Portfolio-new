const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cache configuration: data stays fresh for 24 hours (86400 seconds)
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

// CORS configuration - allow your portfolio domain
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Change this to your actual domain in production
  methods: ['GET'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Portfolio API is running',
    endpoints: {
      leetcode: '/api/leetcode/:username',
      github: '/api/github/:username',
      combined: '/api/stats/:username'
    }
  });
});

// LeetCode API endpoint
app.get('/api/leetcode/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `leetcode_${username}`;

  try {
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Serving LeetCode data from cache for ${username}`);
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔄 Fetching fresh LeetCode data for ${username}`);

    // Fetch from LeetCode GraphQL API
    const response = await axios.post('https://leetcode.com/graphql', {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
            profile {
              ranking
              userAvatar
            }
          }
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            totalParticipants
            topPercentage
          }
        }
      `,
      variables: { username }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.data?.data?.matchedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = response.data.data.matchedUser;
    const contestData = response.data.data.userContestRanking;
    const stats = userData.submitStats.acSubmissionNum;

    const leetcodeData = {
      username: userData.username,
      easy: stats.find(s => s.difficulty === 'Easy')?.count || 0,
      medium: stats.find(s => s.difficulty === 'Medium')?.count || 0,
      hard: stats.find(s => s.difficulty === 'Hard')?.count || 0,
      total: stats.find(s => s.difficulty === 'All')?.count || 0,
      ranking: userData.profile?.ranking || null,
      avatar: userData.profile?.userAvatar || null,
      contests: contestData?.attendedContestsCount || 0,
      contestRating: Math.round(contestData?.rating || 0),
      topPercentage: contestData?.topPercentage || null
    };

    // Cache the data
    cache.set(cacheKey, leetcodeData);

    res.json({
      success: true,
      data: leetcodeData,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ LeetCode API Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch LeetCode data',
      message: error.message
    });
  }
});

// GitHub API endpoint
app.get('/api/github/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `github_${username}`;

  try {
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Serving GitHub data from cache for ${username}`);
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔄 Fetching fresh GitHub data for ${username}`);

    // Use GitHub contributions API (third-party service)
    const contributionsResponse = await axios.get(
      `https://github-contributions-api.jogruber.de/v4/${username}`,
      { timeout: 10000 }
    );

    // Get user profile data from GitHub API
    const profileResponse = await axios.get(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          'User-Agent': 'Portfolio-API',
          // Add GitHub token if you have one for higher rate limits
          ...(process.env.GITHUB_TOKEN && {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`
          })
        }
      }
    );

    const currentYear = new Date().getFullYear();
    const contributions = contributionsResponse.data;
    const profile = profileResponse.data;

    const githubData = {
      username: profile.login,
      name: profile.name,
      avatar: profile.avatar_url,
      bio: profile.bio,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      contributions: {
        total: contributions.total?.[currentYear] || 0,
        lastYear: contributions.contributions || [],
        weeks: processContributions(contributions.contributions)
      }
    };

    // Cache the data
    cache.set(cacheKey, githubData);

    res.json({
      success: true,
      data: githubData,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ GitHub API Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch GitHub data',
      message: error.message
    });
  }
});

// Combined stats endpoint (gets both LeetCode and GitHub)
app.get('/api/stats/:username', async (req, res) => {
  const { username } = req.params;
  const { leetcodeUsername, githubUsername } = req.query;

  try {
    // Use custom usernames if provided, otherwise use the main username
    const lcUsername = leetcodeUsername || username;
    const ghUsername = githubUsername || username;

    // Fetch both in parallel
    const [leetcodeRes, githubRes] = await Promise.allSettled([
      axios.get(`http://localhost:${PORT}/api/leetcode/${lcUsername}`),
      axios.get(`http://localhost:${PORT}/api/github/${ghUsername}`)
    ]);

    const response = {
      success: true,
      leetcode: leetcodeRes.status === 'fulfilled' ? leetcodeRes.value.data : { success: false, error: 'Failed to fetch' },
      github: githubRes.status === 'fulfilled' ? githubRes.value.data : { success: false, error: 'Failed to fetch' },
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Combined Stats Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch combined stats',
      message: error.message
    });
  }
});

// Helper function to process GitHub contributions into weeks format
function processContributions(contributions) {
  const weeks = [];
  const daysInWeek = 7;
  const totalWeeks = 53;

  // Group contributions by week
  for (let w = 0; w < totalWeeks; w++) {
    const week = [];
    for (let d = 0; d < daysInWeek; d++) {
      const index = w * daysInWeek + d;
      if (index < contributions.length) {
        week.push({
          date: contributions[index].date,
          count: contributions[index].count
        });
      } else {
        week.push({ date: null, count: 0 });
      }
    }
    weeks.push(week);
  }

  return weeks;
}

// Cache management endpoint (optional - for debugging)
app.get('/api/cache/stats', (req, res) => {
  const keys = cache.keys();
  res.json({
    totalCached: keys.length,
    keys: keys,
    stats: cache.getStats()
  });
});

// Clear cache endpoint (optional - for debugging)
app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({
    success: true,
    message: 'Cache cleared'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: {
      leetcode: '/api/leetcode/:username',
      github: '/api/github/:username',
      combined: '/api/stats/:username'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 Portfolio API Server Running             ║
║                                               ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   Cache TTL: 24 hours                         ║
║                                               ║
║   Endpoints:                                  ║
║   • GET /api/leetcode/:username               ║
║   • GET /api/github/:username                 ║
║   • GET /api/stats/:username                  ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
