# 🚀 Portfolio Backend Proxy - Complete Package

This is a **production-ready backend API** that fetches and caches your LeetCode and GitHub stats, making your portfolio display real-time data!

## 📦 What's Included

```
backend/
├── server.js                      # Main Express server with all API logic
├── package.json                   # Node.js dependencies
├── vercel.json                    # Vercel deployment config
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── start.sh                       # Quick start script (chmod +x first)
├── README.md                      # Detailed backend documentation
├── DEPLOYMENT_GUIDE.md            # Step-by-step deployment instructions
├── SETUP_CHECKLIST.md             # Complete setup checklist
├── frontend-api-integration.js    # Frontend integration code
└── portfolio-with-backend.html    # Your updated portfolio HTML
```

## ⚡ Quick Start (3 Steps)

### 1️⃣ Setup & Test Locally

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Visit: http://localhost:3000

### 2️⃣ Deploy Backend (Choose One)

**Vercel (Easiest):**
```bash
npm install -g vercel
vercel
vercel env add FRONTEND_URL
vercel env add GITHUB_TOKEN
vercel --prod
```

**Railway:** Go to railway.app → Deploy from GitHub

**Render:** Go to render.com → New Web Service

### 3️⃣ Update & Deploy Frontend

In `portfolio-with-backend.html`, update:
```javascript
const API_BASE_URL = 'https://your-api-url.vercel.app';
```

Deploy to: Vercel, Netlify, GitHub Pages, or Cloudflare Pages

## 📚 Documentation

- **[README.md](backend/README.md)** - API endpoints, features, testing
- **[DEPLOYMENT_GUIDE.md](backend/DEPLOYMENT_GUIDE.md)** - Complete deployment walkthrough
- **[SETUP_CHECKLIST.md](backend/SETUP_CHECKLIST.md)** - Step-by-step checklist

## 🎯 Features

✅ Fetches real LeetCode stats (Easy, Medium, Hard)
✅ Fetches real GitHub contributions
✅ Smart 24-hour caching (respects rate limits)
✅ CORS enabled for frontend
✅ Graceful fallbacks if APIs fail
✅ Production-ready error handling
✅ Easy deployment to Vercel/Railway/Render
✅ Optional GitHub token support (5000 req/hour)

## 🔗 API Endpoints

Once deployed, you'll have:

- `GET /` - Health check
- `GET /api/leetcode/:username` - LeetCode stats
- `GET /api/github/:username` - GitHub stats
- `GET /api/stats/:username` - Combined stats

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Caching:** node-cache (in-memory)
- **APIs:** LeetCode GraphQL, GitHub REST API
- **Deployment:** Vercel/Railway/Render/VPS

## 📊 What Gets Updated

Your portfolio will now show:

**LeetCode Section:**
- ✅ Real Easy/Medium/Hard problem counts
- ✅ Total solved problems
- ✅ Updates automatically every 24 hours

**GitHub Section:**
- ✅ Real contribution graph (last year)
- ✅ Total contributions count
- ✅ Updates automatically every 24 hours

## 🎨 Frontend Changes

The updated `portfolio-with-backend.html` includes:

1. ✅ TalentMatch tech stack fixed (Python · FastAPI · React · Tailwind · NLP · spaCy · TF-IDF)
2. ✅ Backend API integration for LeetCode
3. ✅ Backend API integration for GitHub
4. ✅ Graceful fallbacks if APIs fail
5. ✅ Console logging for debugging

## 🔐 Environment Variables

Required in deployment:

```env
PORT=3000                          # Server port (auto-set by platforms)
FRONTEND_URL=https://your-site.com # Your portfolio URL (for CORS)
GITHUB_TOKEN=ghp_xxxxx             # Optional: Higher rate limits
```

## 🚨 Important Notes

1. **GitHub Token** - Get one at https://github.com/settings/tokens
   - Without: 60 requests/hour
   - With: 5,000 requests/hour

2. **CORS** - Update `FRONTEND_URL` to your actual domain before production

3. **Caching** - Data refreshes every 24 hours automatically

4. **Fallback** - Shows last known data if APIs fail

## 📱 Testing Your Setup

```bash
# Test backend
curl https://your-api-url.com/api/leetcode/AaravKashyap
curl https://your-api-url.com/api/github/AaravKashyap12

# Expected response
{
  "success": true,
  "data": { ... },
  "cached": false,
  "timestamp": "2024-02-19T..."
}
```

## 🐛 Troubleshooting

**Backend not starting?**
- Check Node.js is installed (v18+)
- Run `npm install` first
- Check `.env` file exists

**CORS errors?**
- Update `FRONTEND_URL` in backend
- Redeploy backend
- Clear browser cache

**Data not updating?**
- Check browser console for errors
- Verify `API_BASE_URL` is correct
- Test API endpoints directly with curl

**Rate limit errors?**
- Add GitHub token to backend
- Check token has `public_repo` scope
- Data is cached for 24 hours by default

## 🎓 Learning Resources

New to backend deployment? Check out:

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Support

If you get stuck:

1. Read the error message carefully
2. Check the console/logs
3. Review the relevant documentation file
4. Google the specific error
5. Check environment variables are set

Most issues are configuration related! Take your time with each step.

## 🎉 You're All Set!

Once deployed, your portfolio will have:

✨ Real-time LeetCode stats
✨ Real-time GitHub contributions
✨ Automatic daily updates
✨ Professional production backend
✨ Reliable caching system

**Now go show off your portfolio!** 🚀

---

## 📄 File Structure Explained

**Backend Files:**
- `server.js` - Main API server code
- `package.json` - Dependencies and scripts
- `.env` - Your configuration (don't commit!)
- `vercel.json` - Vercel deployment config

**Documentation:**
- `README.md` - API documentation
- `DEPLOYMENT_GUIDE.md` - How to deploy
- `SETUP_CHECKLIST.md` - Complete checklist

**Frontend:**
- `portfolio-with-backend.html` - Updated HTML with API integration
- `frontend-api-integration.js` - Standalone integration code

## 🔄 Updating Your Stats

Your stats update automatically every 24 hours thanks to caching.

To force an update:
```bash
curl -X POST https://your-api-url.com/api/cache/clear
```

Or just wait for the 24-hour cache to expire!

---

Made with ❤️ for Aarav Kashyap Singh

GitHub: [@AaravKashyap12](https://github.com/AaravKashyap12)
LeetCode: [@AaravKashyap](https://leetcode.com/u/AaravKashyap/)
