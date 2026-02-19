# 🚀 Complete Deployment Guide

## Quick Start (5 Minutes)

### Step 1: Test Backend Locally

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Visit: http://localhost:3000
You should see: "Portfolio API is running"

Test endpoints:
```bash
curl http://localhost:3000/api/leetcode/AaravKashyap
curl http://localhost:3000/api/github/AaravKashyap12
```

### Step 2: Deploy Backend to Vercel (Easiest)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Create `vercel.json` in backend folder**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. **Deploy**
```bash
cd backend
vercel
```

Follow prompts:
- Project name: `portfolio-api` (or your choice)
- Link to existing project: No
- Deploy: Yes

4. **Set Environment Variables**
```bash
vercel env add FRONTEND_URL
# Enter your portfolio URL (e.g., https://aarav.dev)

vercel env add GITHUB_TOKEN
# Paste your GitHub token (optional but recommended)
```

5. **Redeploy with environment variables**
```bash
vercel --prod
```

Your API is now live at: `https://portfolio-api-xxxx.vercel.app`

### Step 3: Update Frontend

In your `portfolio-with-backend.html` file, find this line (around line 4304):

```javascript
const API_BASE_URL = 'http://localhost:3000';
```

Change it to your deployed URL:
```javascript
const API_BASE_URL = 'https://portfolio-api-xxxx.vercel.app';
```

### Step 4: Deploy Frontend

Host your HTML file on:
- **Vercel**: Drag & drop HTML file
- **Netlify**: Drag & drop HTML file  
- **GitHub Pages**: Push to `gh-pages` branch
- **Cloudflare Pages**: Connect GitHub repo

Done! Your portfolio now has live LeetCode and GitHub stats! 🎉

---

## Alternative Deployment Options

### Option A: Railway (Very Easy, Good Free Tier)

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your backend folder
5. Railway auto-detects Node.js
6. Add environment variables in Railway dashboard:
   - `FRONTEND_URL`: Your portfolio URL
   - `GITHUB_TOKEN`: (optional)
7. Deploy!

Your API URL: `https://your-project.up.railway.app`

### Option B: Render (Good Free Tier)

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variables:
   - `FRONTEND_URL`
   - `GITHUB_TOKEN`
6. Create Web Service

Your API URL: `https://your-service.onrender.com`

### Option C: Traditional VPS (Full Control)

**For DigitalOcean, AWS, Linode, etc.**

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone your repo
git clone https://github.com/yourusername/portfolio-api.git
cd portfolio-api/backend

# 4. Install dependencies
npm install

# 5. Create .env file
nano .env
# Add your environment variables

# 6. Install PM2 for process management
sudo npm install -g pm2

# 7. Start the API
pm2 start server.js --name portfolio-api

# 8. Save PM2 config and enable startup
pm2 save
pm2 startup

# 9. Setup Nginx reverse proxy (optional but recommended)
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/portfolio-api

# Add this configuration:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/portfolio-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Setup SSL with Let's Encrypt (recommended)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## GitHub Token Setup (Recommended)

Without token: 60 requests/hour
With token: 5,000 requests/hour

### Get GitHub Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Portfolio API"
4. Select scopes:
   - ✅ `public_repo` (read-only public repositories)
5. Generate token
6. **Copy the token immediately** (you won't see it again!)
7. Add to your deployment:

**Vercel:**
```bash
vercel env add GITHUB_TOKEN
# Paste your token
vercel --prod
```

**Railway/Render:**
- Go to dashboard
- Environment Variables
- Add `GITHUB_TOKEN` with your token value

---

## Testing Your Deployed API

Once deployed, test all endpoints:

```bash
# Replace with your actual URL
API_URL="https://your-api-url.com"

# Test health check
curl $API_URL/

# Test LeetCode
curl $API_URL/api/leetcode/AaravKashyap

# Test GitHub
curl $API_URL/api/github/AaravKashyap12

# Test combined stats
curl "$API_URL/api/stats/Aarav?leetcodeUsername=AaravKashyap&githubUsername=AaravKashyap12"

# Check cache
curl $API_URL/api/cache/stats
```

Expected responses should have `"success": true`

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# In your frontend directory
vercel

# Or just drag & drop your HTML file to vercel.com
```

### Option 2: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag & drop your HTML file
3. Done!

Or with CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option 3: GitHub Pages

```bash
# Create a new repo on GitHub
git init
git add portfolio-with-backend.html
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main

# Enable GitHub Pages
# Go to repo Settings → Pages
# Source: Deploy from branch
# Branch: main
# Save
```

Access at: `https://yourusername.github.io/portfolio-with-backend.html`

### Option 4: Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub repo
3. Deploy

---

## CORS Configuration

If you get CORS errors, update your backend `.env`:

```env
# For development
FRONTEND_URL=http://localhost:5500

# For production (replace with your actual domain)
FRONTEND_URL=https://yourdomain.com

# Allow multiple domains (comma separated)
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
```

Then redeploy your backend.

---

## Monitoring & Maintenance

### Check API Health

Create a simple health check script:

```bash
#!/bin/bash
# health-check.sh

API_URL="https://your-api-url.com"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ API is healthy"
else
    echo "❌ API is down! Status code: $RESPONSE"
    # Send notification (optional)
fi
```

Run with cron:
```bash
crontab -e
# Add: */5 * * * * /path/to/health-check.sh
```

### Monitoring Services (Optional)

Free monitoring:
- **UptimeRobot**: https://uptimerobot.com
- **Pingdom**: Free tier available
- **Better Uptime**: https://betteruptime.com

### View Logs

**Vercel:**
```bash
vercel logs
```

**Railway:**
- Dashboard → Deployments → View Logs

**Render:**
- Dashboard → Logs tab

**PM2 (VPS):**
```bash
pm2 logs portfolio-api
pm2 monit
```

---

## Troubleshooting

### 1. API Returns 404

**Problem:** Endpoints not found

**Solution:**
- Check your API URL is correct
- Ensure backend is deployed and running
- Test with `curl https://your-api-url.com/`

### 2. CORS Errors

**Problem:** "Access to fetch blocked by CORS policy"

**Solution:**
- Update `FRONTEND_URL` in backend environment variables
- Redeploy backend
- Clear browser cache

### 3. Rate Limit Errors

**Problem:** Too many requests to GitHub/LeetCode

**Solution:**
- Add GitHub token to backend
- Data is cached for 24 hours automatically
- Check cache with: `curl API_URL/api/cache/stats`

### 4. Data Not Updating

**Problem:** Shows old data

**Solution:**
- Data is cached for 24 hours
- Clear cache: `curl -X POST API_URL/api/cache/clear`
- Or wait for automatic cache expiry

### 5. Frontend Not Loading Data

**Problem:** Numbers show 0 or dummy data

**Solution:**
- Check browser console for errors
- Verify API_BASE_URL is correct
- Test API endpoints directly
- Check network tab in DevTools

---

## Performance Tips

1. **Enable Compression** (for VPS deployments):
```javascript
// Add to server.js
const compression = require('compression');
app.use(compression());
```

2. **Add Rate Limiting**:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

3. **Use Redis for Caching** (production):
```bash
npm install redis
```

---

## Security Checklist

- ✅ Use HTTPS in production
- ✅ Set proper CORS origins (not `*`)
- ✅ Add rate limiting
- ✅ Keep dependencies updated: `npm audit`
- ✅ Use environment variables for secrets
- ✅ Never commit `.env` file
- ✅ Enable GitHub token for higher limits
- ✅ Monitor API usage

---

## Need Help?

1. Check logs first (see Monitoring section)
2. Test API endpoints with `curl`
3. Check browser console for frontend errors
4. Verify environment variables are set
5. Ensure backend is running

Common issues are usually:
- Wrong API URL
- Missing environment variables
- CORS configuration
- Network/firewall issues

---

## Summary

✅ Backend deployed and running
✅ Frontend updated with backend URL
✅ GitHub token configured (optional)
✅ CORS properly configured
✅ Monitoring setup (optional)

Your portfolio now has **real-time LeetCode and GitHub stats**! 🎉

The data updates automatically every 24 hours thanks to caching.
