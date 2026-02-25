# Focus Dashboard Pro - Mood & Analytics

A beautiful, feature-rich focus dashboard with advanced mood tracking, visual analytics, Pomodoro timer, and more. Works completely offline using IndexedDB and LocalStorage.

![PWA](https://img.shields.io/badge/PWA-Ready-blue)
![Offline](https://img.shields.io/badge/Offline-Supported-green)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-orange)

## ✨ Features

### 📊 Self-Monitoring (Mood Tracker)
- **Daily mood rating** (1-5 Likert scale) with emojis
- **5 Main Categories** with subcategories:
  - 💞 **Relationships**: Family, Friends, Partner, Social
  - 🏛️ **Stability**: Job/Study, Finances, Living, Work-Life Balance
  - 🧠 **Mental State**: Mindset, Stress, Self-Talk, Emotions
  - 💪 **Physical**: Health, Sleep, Energy, Exercise
  - 🎯 **Meaning**: Goals, Growth, Purpose, Values
- **Time-restricted submission**: Only between 19:00-23:59
- **Once per day**: Prevents duplicate entries
- **Optional notes**: Add context to your mood

### 📈 Visual Analytics & Insights
- **Weekly Summary**: Average mood, change vs last week, best/worst days
- **7-Day Trend Chart**: Visual bar chart of recent mood
- **28-Day Heatmap**: GitHub-style contribution graph
- **Automatic Insights**: AI-generated observations about patterns
- **Category Averages**: See which areas need attention

### ⏱️ Pomodoro Timer
- 25min focus, 5min short break, 15min long break
- Custom alarm sounds (Digital, Chime, Bell)
- Browser notifications
- Session history tracking

### ✓ Task Management
- Add, complete, and delete tasks
- Task counter
- Clear completed/all options
- Persistent storage

### 📝 Quick Notes
- Auto-save as you type
- Clear option
- Persistent storage

### 🔗 Quick Links
- Add custom links
- Delete links
- Persistent storage

### 🎨 Themes
- **Masculine** (⚡): Dark cyan/purple
- **Girly** (🌸): Dark pink/purple
- **Light Mode** (☀️): Light theme option
- **Dark Mode** (🌙): Dark theme option

### 📲 PWA Features
- Install to home screen
- Works offline
- IndexedDB for large storage capacity
- Service worker caching

## 🚀 Deploy to GitHub Pages

### Step 1: Create GitHub Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Focus Dashboard Pro"
```

### Step 2: Push to GitHub

```bash
# Add your remote repository
git remote add origin https://github.com/YOUR_USERNAME/focus-dashboard.git

# Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

### Step 4: Access Your App

After a few minutes, your app will be live at:
```
https://YOUR_USERNAME.github.io/focus-dashboard/
```

## 📱 Install as App

### Desktop (Chrome/Edge)
1. Open the app in your browser
2. Click the **install icon** in the address bar
3. Click **Install**

### Mobile (Android - Chrome)
1. Open the app in Chrome
2. Tap the **menu** (⋮) → **Install app**
3. Or wait for the install prompt

### Mobile (iOS - Safari)
1. Open the app in Safari
2. Tap the **Share** button
3. Tap **Add to Home Screen**
4. Tap **Add**

## 💾 Data Storage

### IndexedDB (Primary)
- Mood entries (unlimited storage)
- Pomodoro history

### LocalStorage (Secondary)
- Tasks
- Notes
- Quick links
- Settings

### Export Data
Go to **Settings** → **Export Data** to download all your data as JSON.

## 🌐 Offline Support

The app works completely offline:
- All features available without internet
- Data stored locally in browser
- Service worker caches all assets
- No server required

## 🔒 Privacy

- **100% local storage**: All data stays on your device
- **No tracking**: No analytics or telemetry
- **No account required**: No sign-up needed
- **Open source**: All code is visible and auditable

## 🛠️ Development

### File Structure
```
focus-dashboard/
├── index.html      # Main application (single file)
├── manifest.json   # PWA manifest
├── sw.js          # Service worker
└── README.md      # This file
```

### Local Development

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📊 Analytics Features Explained

### Weekly Summary
- **Avg Mood**: Average mood score for the current week
- **vs Last Week**: Percentage change from previous week
- **Best Day**: Day with highest mood this week
- **Worst Day**: Day with lowest mood this week

### Insights
Automatic observations based on your data:
- Weekend vs weekday patterns
- Best day of week analysis
- Overall trend detection
- Mood level assessments

### Heatmap
- **Green/Bright**: Higher mood (4-5)
- **Blue/Medium**: Neutral mood (3)
- **Dark/Low**: Lower mood (1-2)
- **Gray**: No data

## 🎯 Tips for Best Use

1. **Track daily**: Submit your mood between 19:00-23:59
2. **Be honest**: Rate genuinely, not ideally
3. **Add notes**: Context helps identify patterns
4. **Review weekly**: Check analytics every Sunday
5. **Act on insights**: Use patterns to improve life

## 🐛 Troubleshooting

### App not loading offline
- Clear browser cache
- Revisit the app while online to refresh service worker
- Check browser's IndexedDB storage

### Install prompt not showing
- Must use HTTPS (or localhost)
- Clear browser cache
- Try incognito mode

### Data not saving
- Check browser storage permissions
- Ensure IndexedDB is enabled
- Try a different browser

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

Built with:
- Vanilla JavaScript (no frameworks)
- IndexedDB for data storage
- Web Audio API for sounds
- CSS Custom Properties for theming

---

**Made with ❤️ for productivity and self-awareness**
