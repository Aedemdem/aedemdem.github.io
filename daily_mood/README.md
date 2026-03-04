# Focus Dashboard Pro - Mood & Analytics

A beautiful, feature-rich focus dashboard with advanced mood tracking, visual analytics, Pomodoro timer, and more. Works completely offline using IndexedDB and LocalStorage.

![PWA](https://img.shields.io/badge/PWA-Ready-blue)
![Offline](https://img.shields.io/badge/Offline-Supported-green)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-orange)

## ✨ Features

### 📊 Self-Monitoring (Mood Tracker)
- **Daily mood rating** (1-5 Likert scale) with emojis
- **5 Main Categories** with subcategories:
  - 💞 **Relationships**: Family, Friends, Partner
  - 🏛️ **Stability**: Job/Study, Finances, Work-Life Balance
  - 🧠 **Mental State**: Mindset, Stress, Anxiety
  - 💪 **Physical**: Sleep, Energy, Health
  - 🎯 **Meaning**: Goals, Growth, Values
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
- **Persistent browser notifications** after permission granted
- Session history tracking

### ✓ Task Management
- Add, complete, and delete tasks
- Task counter
- Clear completed/all options
- Persistent storage

### 📝 Quick Notes
- Gratitude journal with 3 daily entries
- Save and track gratitude over time
- Persistent storage

### 🎮 Relaxation Games
- **Breathing Exercise**: Guided breathing with visual animation
- **Quick Relax**: 1-minute relaxation with calming sounds

### 🎨 Themes
- **Blue** (🔵): Default cyan/purple theme
- **Pink** (🌸): Pink/magenta theme
- **Green** (🌿): Green nature theme
- **Light Mode** (☀️): Light theme option
- **Dark Mode** (🌙): Dark theme option

### 🌐 Internationalization
- **English** (en)
- **Bahasa Indonesia** (id)

### 📲 PWA Features
- **Install to home screen** on mobile and desktop
- **Works offline** - no internet required
- **Persistent notifications** for timer alerts
- IndexedDB for large storage capacity
- Service worker caching
- **Mobile-optimized** with extra bottom spacing for safe areas

## 🚀 Deploy to GitHub Pages

### Step 1: Create GitHub Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Update: Focus Dashboard Pro with modular structure"
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
https://YOUR_USERNAME.github.io/focus-dashboard/daily_mood/
```

## 📱 Install as App

### Desktop (Chrome/Edge)
1. Open the app in your browser
2. Click the **install icon** (⊕) in the address bar
3. Click **Install**

### Mobile (Android - Chrome)
1. Open the app in Chrome
2. Tap the **menu** (⋮) → **Install app** or **Add to Home screen**
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
- Gratitude journal entries

### LocalStorage (Secondary)
- Tasks
- Settings (theme, language, notifications)
- User preferences

### Export Data
Go to **Settings** → **Export Data** to download all your data as JSON.

## 🌐 Offline Support

The app works completely offline:
- All features available without internet
- Data stored locally in browser
- Service worker caches all assets
- No server required

## 🔔 Persistent Notifications

After granting notification permission:
- Timer alerts appear even when tab is not focused
- Notifications stay visible until dismissed (30 seconds)
- Click notification to return to the app
- Works in background (browser-dependent)

### Enable Notifications:
1. Go to **Settings** tab
2. Toggle **Notifications** ON
3. Grant permission when prompted
4. Test notification will appear to confirm

## 📊 Mood Feature Updates (v3.1)

### Key Changes:
- **No time restriction**: Submit mood anytime during the day
- **Once per day**: Only one submission allowed per day
- **Update support**: Resubmit to overwrite your mood for the current day
- **Mood History**: View all past entries in a paginated table (10 per page)
- **Auto-update Analytics**: Analytics refresh automatically when switching tabs

### Mood History Table:
- Shows date, mood rating, and notes
- Pagination controls (Previous/Next)
- Displays most recent entries first
- Available on the Mood tab

## 🎮 Timer Updates (v3.1)

### Focus Timer Slider:
- **5-minute increments**: Adjust from 5 to 120 minutes
- **Visual display**: See selected duration in real-time
- **Preset alternatives**: No more fixed time options
- **Snooze support**: 5-minute snooze when timer completes

## 🔒 Privacy

- **100% local storage**: All data stays on your device
- **No tracking**: No analytics or telemetry
- **No account required**: No sign-up needed
- **Open source**: All code is visible and auditable

## 🛠️ Development

### File Structure
```
daily_mood/
├── index.html      # Main HTML structure
├── styles.css      # All CSS styles
├── app.js          # Application JavaScript
├── sw.js           # Service Worker for PWA
├── manifest.json   # PWA manifest
└── README.md       # This file
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

Then open `http://localhost:8000/daily_mood/` in your browser.

**Note:** For PWA features to work properly, use HTTPS or localhost.

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
6. **Enable notifications**: Never miss a timer alert
7. **Install as app**: Quick access from home screen

## 🐛 Troubleshooting

### App not loading offline
- Clear browser cache
- Revisit the app while online to refresh service worker
- Check browser's IndexedDB storage

### Install prompt not showing
- Must use HTTPS (or localhost)
- Clear browser cache
- Try incognito mode
- Ensure all files (manifest.json, sw.js) are accessible

### Notifications not working
- Check browser notification permissions
- Ensure notifications are enabled in Settings
- Some browsers require user interaction first
- iOS has limited notification support for web apps

### Data not saving
- Check browser storage permissions
- Ensure IndexedDB is enabled
- Try a different browser
- Export data regularly as backup

## 📱 Mobile Optimizations

- **Safe area padding**: Extra spacing at bottom for notch/home indicator
- **Touch-friendly**: Larger tap targets for buttons
- **Responsive**: Adapts to all screen sizes
- **No scrollbar**: Clean tab navigation
- **Optimized animations**: Smooth on mobile devices

## 🔄 Changelog

### Version 3.1 (Current) - Major Fixes & Enhancements
- ✅ **Mood input fixed**: All input fields now working properly
- ✅ **Language persistence**: Language setting now saves and persists after refresh
- ✅ **Import/Export data**: Full data backup and restore functionality
- ✅ **Mood anytime**: No time restriction - submit mood any time (once per day)
- ✅ **Mood overwrite**: Update your mood for the current day
- ✅ **Mood history table**: Paginated list showing 10 entries per page
- ✅ **Auto-update analytics**: Analytics refresh without page reload
- ✅ **Breathing timer format**: Now displays mm:ss format
- ✅ **Focus timer slider**: 5-120 minutes in 5-minute increments
- ✅ **PWA Install button**: Install prompt available in Settings
- ✅ **Theme in Settings**: Theme selection moved to Settings tab
- ✅ **Dark/Light in header**: Quick theme toggle remains in header

### Version 3.0
- ✅ **Modular structure**: Separated HTML, CSS, and JavaScript
- ✅ **PWA enhanced**: Better manifest and service worker
- ✅ **Persistent notifications**: Timer alerts that stay visible
- ✅ **Mobile spacing**: Extra bottom padding for mobile devices
- ✅ **iOS support**: Apple-specific meta tags
- ✅ **Improved performance**: Optimized code structure

### Version 2.0
- Mood tracking with categories
- Analytics and insights
- Pomodoro timer
- Task management
- Gratitude journal
- Breathing exercises
- Multi-language support
- Theme options

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

Built with:
- Vanilla JavaScript (no frameworks)
- IndexedDB for data storage
- Web Audio API for sounds
- CSS Custom Properties for theming
- Web Notifications API for alerts

---

**Made with ❤️ for productivity and self-awareness**

**Version:** 3.1  
**Last Updated:** March 2025
