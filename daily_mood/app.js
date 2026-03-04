// Focus Dashboard Pro - Main Application JavaScript
// Version 3.1 - Fixed and Enhanced

// IndexedDB Store
const DB_NAME = "focus-dashboard-pro";
const DB_VERSION = 2;
const Store = {
    db: null,
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("mood")) {
                    db.createObjectStore("mood", { keyPath: "date" });
                }
                if (!db.objectStoreNames.contains("pomodoro")) {
                    db.createObjectStore("pomodoro", { keyPath: "id", autoIncrement: true });
                }
                if (!db.objectStoreNames.contains("gratitude")) {
                    db.createObjectStore("gratitude", { keyPath: "id", autoIncrement: true });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },
    mood: {
        get(date) {
            return new Promise((resolve) => {
                if (!Store.db) { resolve(null); return; }
                const tx = Store.db.transaction("mood", "readonly");
                const store = tx.objectStore("mood");
                const req = store.get(date);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            });
        },
        set(data) {
            return new Promise((resolve) => {
                const tx = Store.db.transaction("mood", "readwrite");
                const store = tx.objectStore("mood");
                store.put(data);
                tx.oncomplete = () => resolve();
            });
        },
        getAll() {
            return new Promise((resolve) => {
                if (!Store.db) { resolve([]); return; }
                const tx = Store.db.transaction("mood", "readonly");
                const store = tx.objectStore("mood");
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve([]);
            });
        },
        getAllDescending() {
            return new Promise((resolve) => {
                Store.mood.getAll().then(entries => {
                    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
                    resolve(entries);
                });
            });
        }
    },
    pomodoro: {
        add(data) {
            return new Promise((resolve) => {
                const tx = Store.db.transaction("pomodoro", "readwrite");
                const store = tx.objectStore("pomodoro");
                store.add(data);
                tx.oncomplete = () => resolve();
            });
        },
        getAll() {
            return new Promise((resolve) => {
                if (!Store.db) { resolve([]); return; }
                const tx = Store.db.transaction("pomodoro", "readonly");
                const store = tx.objectStore("pomodoro");
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve([]);
            });
        }
    },
    gratitude: {
        add(data) {
            return new Promise((resolve) => {
                const tx = Store.db.transaction("gratitude", "readwrite");
                const store = tx.objectStore("gratitude");
                store.add(data);
                tx.oncomplete = () => resolve();
            });
        },
        getAll() {
            return new Promise((resolve) => {
                if (!Store.db) { resolve([]); return; }
                const tx = Store.db.transaction("gratitude", "readonly");
                const store = tx.objectStore("gratitude");
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve([]);
            });
        }
    },
    get(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error("LocalStorage error:", e);
        }
    }
};

// App State
const App = {
    selectedMood: null,
    theme: "blue",
    colorScheme: "dark",
    soundEnabled: true,
    notifyEnabled: false,
    alarmSound: "digital",
    audioCtx: null,
    timerInterval: null,
    isRunning: false,
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    currentMode: 25,
    breathCycles: 0,
    breathTime: 0,
    breathPhase: "inhale",
    breathingInterval: null,
    moodHistoryPage: 1,
    moodHistoryPerPage: 10,
    deferredPrompt: null
};

// Translations
const translations = {
    en: {
        goodMorning: "Good morning",
        goodAfternoon: "Good afternoon",
        goodEvening: "Good evening",
        howAreYou: "How are you feeling?",
        trackDaily: "Track your mood daily (once per day)",
        veryBad: "Very Bad",
        bad: "Bad",
        neutral: "Neutral",
        good: "Good",
        veryGood: "Very Good",
        relationships: "Relationships",
        connection: "Connection",
        family: "Family",
        friends: "Friends",
        partner: "Partner",
        stability: "Stability",
        security: "Security",
        workStudy: "Work/Study",
        finances: "Finances",
        workLife: "Work-Life",
        mental: "Mental",
        mindset: "Mindset",
        stress: "Stress",
        anxiety: "Anxiety",
        physical: "Physical",
        health: "Health",
        sleep: "Sleep",
        energy: "Energy",
        meaning: "Meaning",
        purpose: "Purpose",
        goals: "Goals",
        growth: "Growth",
        values: "Values",
        notes: "Notes (optional)",
        submitMood: "Submit Mood",
        updateMood: "Update Mood",
        today: "Today:",
        submittedAt: "Submitted at",
        alreadySubmitted: "Already submitted",
        alreadySubmittedMsg: "Update your mood for today?",
        moodRecorded: "Mood recorded!",
        moodUpdated: "Mood updated!",
        noMoodData: "No mood data yet. Start tracking!",
        weeklyStats: "Weekly Stats",
        avgMood: "Avg Mood",
        vsLastWeek: "vs Last Week",
        bestDay: "Best Day",
        worstDay: "Worst Day",
        totalEntries: "Total Entries",
        currentStreak: "Current Streak",
        insights: "Insights",
        categoryAverages: "Category Averages",
        breathingGame: "Breathing Exercise",
        start: "Start",
        stop: "Stop",
        cycles: "Cycles:",
        time: "Time:",
        gratitudeJournal: "Gratitude Journal",
        entry1: "I'm grateful for...",
        entry2: "Today's highlight...",
        entry3: "Looking forward to...",
        save: "Save",
        totalEntriesLabel: "Total Entries",
        recentEntries: "Recent Entries",
        quickRelax: "Quick Relax",
        relaxationComplete: "Relaxation complete",
        relaxationCompleteMsg: "Take a moment to breathe",
        pomodoroTimer: "Focus Timer",
        focusTime: "Focus Time",
        duration: "Duration:",
        minutes: "minutes",
        pause: "⏸ Pause",
        startTimer: "▶ Start",
        reset: "Reset",
        sound: "Sound",
        notifications: "Notifications",
        alarmSound: "Alarm Sound",
        digital: "Digital",
        chime: "Chime",
        bell: "Bell",
        exportData: "Export Data",
        importData: "Import Data",
        resetApp: "Reset App",
        tasks: "Tasks",
        addTask: "Add Task",
        taskPlaceholder: "Add a new task...",
        clearCompleted: "Clear Completed",
        clearAll: "Clear All",
        deleteTasks: "Delete all tasks?",
        timesUp: "Time's up!",
        focusComplete: "Focus session complete!",
        breakOver: "Break is over!",
        stopAlarm: "Stop",
        snoozeAlarm: "Snooze (5 min)",
        emptyEntry: "Empty entry",
        emptyEntryMsg: "Please add at least one gratitude entry",
        gratitudeSaved: "Gratitude saved!",
        gratitudeSavedMsg: "Your entries have been recorded",
        exportSuccess: "Data exported",
        exportSuccessMsg: "Your data has been downloaded",
        importSuccess: "Data imported",
        importSuccessMsg: "Your data has been restored",
        importError: "Import failed",
        importErrorMsg: "Invalid file format",
        resetConfirm: "Reset all data?",
        resetConfirmMsg: "This will delete all your data permanently",
        resetComplete: "Reset complete",
        resetCompleteMsg: "Reloading page...",
        language: "Language",
        theme: "Theme",
        blueTheme: "Blue",
        pinkTheme: "Pink",
        greenTheme: "Green",
        darkMode: "Dark Mode",
        lightMode: "Light Mode",
        installApp: "Install App",
        moodHistory: "Mood History",
        date: "Date",
        mood: "Mood",
        page: "Page",
        of: "of",
        previous: "Previous",
        next: "Next",
        noHistory: "No history yet"
    },
    id: {
        goodMorning: "Selamat pagi",
        goodAfternoon: "Selamat siang",
        goodEvening: "Selamat malam",
        howAreYou: "Apa kabar Anda?",
        trackDaily: "Lacak suasana hati harian (sekali sehari)",
        veryBad: "Sangat Buruk",
        bad: "Buruk",
        neutral: "Netral",
        good: "Baik",
        veryGood: "Sangat Baik",
        relationships: "Hubungan",
        connection: "Koneksi",
        family: "Keluarga",
        friends: "Teman",
        partner: "Rekan kerja",
        stability: "Stabilitas",
        security: "Keamanan",
        workStudy: "Pekerjaan/Studi",
        finances: "Keuangan",
        workLife: "Keseimbangan Kerja",
        mental: "Mental",
        mindset: "Pola Pikir",
        stress: "Stres",
        anxiety: "Kecemasan",
        physical: "Fisik",
        health: "Kesehatan",
        sleep: "Tidur",
        energy: "Energi",
        meaning: "Makna",
        purpose: "Tujuan",
        goals: "Tujuan",
        growth: "Pertumbuhan",
        values: "Nilai",
        notes: "Catatan (opsional)",
        submitMood: "Kirim Suasana Hati",
        updateMood: "Perbarui Suasana Hati",
        today: "Hari ini:",
        submittedAt: "Dikirim pada",
        alreadySubmitted: "Sudah dikirim",
        alreadySubmittedMsg: "Perbarui suasana hati Anda untuk hari ini?",
        moodRecorded: "Suasana hati tercatat!",
        moodUpdated: "Suasana hati diperbarui!",
        noMoodData: "Belum ada data. Mulai lacak!",
        weeklyStats: "Statistik Mingguan",
        avgMood: "Rata-rata",
        vsLastWeek: "vs Minggu Lalu",
        bestDay: "Hari Terbaik",
        worstDay: "Hari Terburuk",
        totalEntries: "Total Entri",
        currentStreak: "Streak Saat Ini",
        insights: "Wawasan",
        categoryAverages: "Rata-rata Kategori",
        breathingGame: "Latihan Pernapasan",
        start: "Mulai",
        stop: "Berhenti",
        cycles: "Siklus:",
        time: "Waktu:",
        gratitudeJournal: "Jurnal Rasa Syukur",
        entry1: "Saya bersyukur untuk...",
        entry2: "Sorotan hari ini...",
        entry3: "Menantikan...",
        save: "Simpan",
        totalEntriesLabel: "Total Entri",
        recentEntries: "Entri Terbaru",
        quickRelax: "Relaksasi Cepat",
        relaxationComplete: "Relaksasi selesai",
        relaxationCompleteMsg: "Luangkan waktu untuk bernapas",
        pomodoroTimer: "Timer Fokus",
        focusTime: "Waktu Fokus",
        duration: "Durasi:",
        minutes: "menit",
        pause: "⏸ Jeda",
        startTimer: "▶ Mulai",
        reset: "Reset",
        sound: "Suara",
        notifications: "Notifikasi",
        alarmSound: "Suara Alarm",
        digital: "Digital",
        chime: "Lonceng",
        bell: "Bel",
        exportData: "Ekspor Data",
        importData: "Impor Data",
        resetApp: "Reset Aplikasi",
        tasks: "Tugas",
        addTask: "Tambah Tugas",
        taskPlaceholder: "Tambah tugas baru...",
        clearCompleted: "Hapus Selesai",
        clearAll: "Hapus Semua",
        deleteTasks: "Hapus semua tugas?",
        timesUp: "Waktu habis!",
        focusComplete: "Sesi fokus selesai!",
        breakOver: "Istirahat selesai!",
        stopAlarm: "Berhenti",
        snoozeAlarm: "Tunda (5 mnt)",
        emptyEntry: "Entri kosong",
        emptyEntryMsg: "Tambahkan setidaknya satu entri",
        gratitudeSaved: "Rasa syukur disimpan!",
        gratitudeSavedMsg: "Entri Anda telah disimpan",
        exportSuccess: "Data diekspor",
        exportSuccessMsg: "Data Anda telah diunduh",
        importSuccess: "Data diimpor",
        importSuccessMsg: "Data Anda telah dipulihkan",
        importError: "Impor gagal",
        importErrorMsg: "Format file tidak valid",
        resetConfirm: "Reset semua data?",
        resetConfirmMsg: "Ini akan menghapus semua data Anda secara permanen",
        resetComplete: "Reset selesai",
        resetCompleteMsg: "Memuat ulang halaman...",
        language: "Bahasa",
        theme: "Tema",
        blueTheme: "Biru",
        pinkTheme: "Merah Muda",
        greenTheme: "Hijau",
        darkMode: "Mode Gelap",
        lightMode: "Mode Terang",
        installApp: "Instal Aplikasi",
        moodHistory: "Riwayat Suasana Hati",
        date: "Tanggal",
        mood: "Suasana Hati",
        page: "Halaman",
        of: "dari",
        previous: "Sebelumnya",
        next: "Selanjutnya",
        noHistory: "Belum ada riwayat"
    }
};

let currentLang = "en";

function t(key) {
    return translations[currentLang][key] || key;
}

function applyLanguage() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.dataset.i18nPlaceholder;
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });
}

// Helper Functions
function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatTimeMMSS(totalSeconds) {
    // Special handling for breathing exercise: display up to 99:99
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    // For breathing exercise, allow seconds to show up to 99
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getMoodEmoji(value) {
    const emojis = { 1: "😞", 2: "😕", 3: "😐", 4: "🙂", 5: "🤩" };
    return emojis[value] || "❓";
}

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize IndexedDB
    await Store.init();

    // Load saved settings - FIX: Load language FIRST before applying
    currentLang = Store.get("language", "en");
    App.theme = Store.get("theme", "blue");
    App.colorScheme = Store.get("colorScheme", "dark");
    App.soundEnabled = Store.get("soundEnabled", true);
    App.notifyEnabled = Store.get("notifyEnabled", false);
    App.alarmSound = Store.get("alarmSound", "digital");

    // Apply settings
    document.documentElement.setAttribute("data-theme", App.theme);
    document.documentElement.setAttribute("data-color-scheme", App.colorScheme);
    applyLanguage();

    // Update theme buttons
    document.querySelectorAll(".theme-btn").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.dataset.theme === App.theme || btn.dataset.color === App.colorScheme) {
            btn.classList.add("active");
        }
    });

    // Theme buttons (color scheme only in header)
    document.querySelectorAll(".theme-btn[data-color]").forEach((btn) => {
        btn.addEventListener("click", () => {
            App.colorScheme = btn.dataset.color;
            document.documentElement.setAttribute("data-color-scheme", App.colorScheme);
            localStorage.setItem("colorScheme", JSON.stringify(App.colorScheme));
            document.querySelectorAll(".theme-btn[data-color]").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Theme buttons in Settings
    document.querySelectorAll(".theme-select-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            App.theme = btn.dataset.theme;
            document.documentElement.setAttribute("data-theme", App.theme);
            localStorage.setItem("theme", JSON.stringify(App.theme));
            document.querySelectorAll(".theme-select-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Language selector - FIX: Properly save and apply
    const langSelect = document.getElementById("language");
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener("change", () => {
            currentLang = langSelect.value;
            Store.set("language", currentLang);
            applyLanguage();
            updateMoodUI();
            renderMoodHistory();
        });
    }

    // Update time
    function updateTime() {
        const now = new Date();
        document.getElementById("clock").textContent =
            now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        document.getElementById("date").textContent =
            now.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
            });
        const hour = now.getHours();
        let greeting = t("goodEvening");
        if (hour >= 5 && hour < 12) greeting = t("goodMorning");
        else if (hour >= 12 && hour < 17) greeting = t("goodAfternoon");
        document.getElementById("greeting").textContent = greeting;
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Tab switching with auto-update for analytics
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
            if (btn.dataset.tab === "analytics") {
                initDateRange(); // Initialize date range selector
                updateAnalyticsWithRange(); // Use new function with date range
            }
        });
    });

    // Particles
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 1.5 + 0.5;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.fillStyle = "hsla(199, 89%, 48%, 0.3)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < 50; i++) particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    // Mood Functions - FIXED: No time restriction, once per day with overwrite
    function canSubmitMood() {
        return true; // Always available
    }

    async function getSubmissionStatus() {
        const today = getTodayKey();
        const entry = await Store.mood.get(today);
        if (entry) return { status: "submitted", entry };
        return { status: "available" };
    }

    async function updateMoodUI() {
        const status = await getSubmissionStatus();
        const statusIcon = document.getElementById("statusIcon");
        const statusText = document.getElementById("statusText");
        const statusTime = document.getElementById("statusTime");
        const moodInputSection = document.getElementById("moodInputSection");
        const submitBtn = document.getElementById("submitMood");
        const moodLabels = ["veryBad", "bad", "neutral", "good", "veryGood"];

        if (status.status === "submitted") {
            statusIcon.textContent = getMoodEmoji(status.entry.moodValue);
            statusText.textContent = `${t("today")} ${t(moodLabels[status.entry.moodValue - 1])}`;
            statusTime.textContent = `${t("submittedAt")} ${new Date(status.entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
            moodInputSection.style.display = "block";
            submitBtn.textContent = t("updateMood");
            // Pre-fill values
            if (status.entry.categories) {
                document.querySelectorAll(".star-rating").forEach((rating) => {
                    const cat = rating.dataset.cat;
                    const sub = rating.dataset.sub;
                    const val = status.entry.categories[cat]?.[sub] || 0;
                    rating.querySelectorAll(".star").forEach((s, i) => {
                        s.classList.toggle("active", i < val);
                    });
                    rating.dataset.selectedValue = val;
                });
            }
        } else {
            statusIcon.textContent = "📝";
            statusText.textContent = t("trackDaily");
            statusTime.textContent = "";
            moodInputSection.style.display = "block";
            submitBtn.textContent = t("submitMood");
        }
    }

    // Likert scale buttons
    document.querySelectorAll(".likert-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".likert-btn").forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            App.selectedMood = parseInt(btn.dataset.value);
        });
    });

    // Star rating handlers
    document.querySelectorAll(".star-rating .star").forEach((star) => {
        star.addEventListener("click", () => {
            const rating = star.parentElement;
            const value = parseInt(star.dataset.value);
            rating.querySelectorAll(".star").forEach((s, i) => {
                s.classList.toggle("active", i < value);
            });
            rating.dataset.selectedValue = value;
        });
    });

    // Submit mood - FIXED: Allow overwrite
    document.getElementById("submitMood").addEventListener("click", async () => {
        if (!App.selectedMood) {
            showAlert("warning", t("selectMood"), t("selectMoodMsg"));
            return;
        }
        const today = getTodayKey();
        const existing = await Store.mood.get(today);

        const categories = {};
        document.querySelectorAll(".star-rating").forEach((rating) => {
            const cat = rating.dataset.cat;
            const sub = rating.dataset.sub;
            const val = parseInt(rating.dataset.selectedValue || 0);
            if (!categories[cat]) categories[cat] = {};
            if (val >= 1 && val <= 5) categories[cat][sub] = val;
        });

        await Store.mood.set({
            date: today,
            timestamp: new Date().toISOString(),
            moodValue: App.selectedMood,
            categories,
            reasonText: document.getElementById("moodReason").value.trim(),
            dayOfWeek: new Date().getDay(),
        });

        const moodLabels = ["veryBad", "bad", "neutral", "good", "veryGood"];
        showAlert(
            "success",
            existing ? t("moodUpdated") : t("moodRecorded"),
            `${t("today")} ${t(moodLabels[App.selectedMood - 1])}`
        );
        App.selectedMood = null;
        document.querySelectorAll(".likert-btn").forEach((b) => b.classList.remove("selected"));
        document.querySelectorAll(".star-rating .star").forEach((s) => s.classList.remove("active"));
        document.querySelectorAll(".star-rating").forEach((r) => delete r.dataset.selectedValue);
        document.getElementById("moodReason").value = "";
        await updateMoodUI();
        await renderMoodHistory(); // Auto-refresh mood history table
    });

    // Mood History with Pagination
    async function renderMoodHistory() {
        const allEntries = await Store.mood.getAllDescending();
        const container = document.getElementById("moodHistoryList");
        const paginationContainer = document.getElementById("moodHistoryPagination");

        if (!container || !paginationContainer) return;

        if (allEntries.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:2rem;color:hsl(var(--muted-foreground))">${t("noHistory")}</div>`;
            paginationContainer.innerHTML = "";
            return;
        }

        const totalPages = Math.ceil(allEntries.length / App.moodHistoryPerPage);
        const startIndex = (App.moodHistoryPage - 1) * App.moodHistoryPerPage;
        const endIndex = startIndex + App.moodHistoryPerPage;
        const pageEntries = allEntries.slice(startIndex, endIndex);

        const moodLabels = { 1: t("veryBad"), 2: t("bad"), 3: t("neutral"), 4: t("good"), 5: t("veryGood") };

        container.innerHTML = `
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.75rem;">
                    <thead>
                        <tr style="border-bottom:1px solid hsl(var(--border));">
                            <th style="padding:0.5rem;text-align:left;">${t("date")}</th>
                            <th style="padding:0.5rem;text-align:center;">${t("mood")}</th>
                            <th style="padding:0.5rem;text-align:left;">${t("notes")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageEntries.map(entry => `
                            <tr style="border-bottom:1px solid hsl(var(--border));">
                                <td style="padding:0.5rem;">${formatDate(entry.date)}</td>
                                <td style="padding:0.5rem;text-align:center;">${getMoodEmoji(entry.moodValue)} ${moodLabels[entry.moodValue]}</td>
                                <td style="padding:0.5rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${entry.reasonText || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Pagination
        paginationContainer.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;">
                <button class="btn btn-outline btn-sm" id="prevPage" ${App.moodHistoryPage === 1 ? 'disabled' : ''}>
                    ${t("previous")}
                </button>
                <span style="font-size:0.75rem;">${t("page")} ${App.moodHistoryPage} ${t("of")} ${totalPages}</span>
                <button class="btn btn-outline btn-sm" id="nextPage" ${App.moodHistoryPage === totalPages ? 'disabled' : ''}>
                    ${t("next")}
                </button>
            </div>
        `;

        document.getElementById("prevPage")?.addEventListener("click", () => {
            if (App.moodHistoryPage > 1) {
                App.moodHistoryPage--;
                renderMoodHistory();
            }
        });

        document.getElementById("nextPage")?.addEventListener("click", () => {
            if (App.moodHistoryPage < totalPages) {
                App.moodHistoryPage++;
                renderMoodHistory();
            }
        });
    }

    // Analytics - Auto-updating
    async function updateAnalytics() {
        const entries = await Store.mood.getAll();
        if (entries.length === 0) {
            document.getElementById("weeklyStats").innerHTML =
                `<div style="grid-column: span 4; text-align: center; padding: 2rem; color: hsl(var(--muted-foreground));">${t("noMoodData")}</div>`;
            document.getElementById("categoryAverages").innerHTML = "";
            return;
        }

        entries.sort((a, b) => new Date(a.date) - new Date(b.date));
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 14);

        const thisWeekEntries = entries.filter((e) => new Date(e.date) >= weekAgo);
        const lastWeekEntries = entries.filter((e) => new Date(e.date) >= lastWeek && new Date(e.date) < weekAgo);

        const thisWeekAvg = thisWeekEntries.length
            ? (thisWeekEntries.reduce((sum, e) => sum + e.moodValue, 0) / thisWeekEntries.length).toFixed(1)
            : "-";
        const lastWeekAvg = lastWeekEntries.length
            ? lastWeekEntries.reduce((sum, e) => sum + e.moodValue, 0) / lastWeekEntries.length
            : null;

        document.getElementById("weekAvg").textContent = thisWeekAvg !== "-" ? `${thisWeekAvg}/5` : "-";
        if (lastWeekAvg !== null) {
            const change = (((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100).toFixed(0);
            document.getElementById("weekChange").textContent = change > 0 ? `+${change}%` : `${change}%`;
        } else document.getElementById("weekChange").textContent = "-";

        if (thisWeekEntries.length > 0) {
            const best = thisWeekEntries.reduce((max, e) => (e.moodValue > max.moodValue ? e : max));
            const worst = thisWeekEntries.reduce((min, e) => (e.moodValue < min.moodValue ? e : min));
            document.getElementById("bestDay").textContent = new Date(best.date).toLocaleDateString("en", { weekday: "short" });
            document.getElementById("worstDay").textContent = new Date(worst.date).toLocaleDateString("en", { weekday: "short" });
        }

        document.getElementById("totalEntries").textContent = entries.length;
        let streak = 0;
        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);
        while (true) {
            const dateStr = checkDate.toISOString().split("T")[0];
            const hasEntry = entries.some((e) => e.date === dateStr);
            if (hasEntry) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (dateStr === new Date().toISOString().split("T")[0]) {
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        document.getElementById("currentStreak").textContent = streak;

        const dayAverages = {};
        for (let i = 0; i < 7; i++) {
            const dayEntries = entries.filter((e) => e.dayOfWeek === i);
            if (dayEntries.length > 0)
                dayAverages[i] = dayEntries.reduce((sum, e) => sum + e.moodValue, 0) / dayEntries.length;
        }

        let insights = [];
        const weekendAvg = (dayAverages[0] + dayAverages[6]) / 2;
        const weekdayAvg = (dayAverages[1] + dayAverages[2] + dayAverages[3] + dayAverages[4] + dayAverages[5]) / 5;
        if (weekendAvg > weekdayAvg + 0.3) insights.push("📊 Mood tends to be higher on weekends.");
        if (weekdayAvg > weekendAvg + 0.3) insights.push("📊 Mood tends to be higher on weekdays.");
        const trend = thisWeekAvg > (lastWeekAvg || thisWeekAvg) ? "improving" : thisWeekAvg < (lastWeekAvg || thisWeekAvg) ? "declining" : "stable";
        if (trend === "improving") insights.push("📈 Your mood is improving compared to last week.");
        if (trend === "declining") insights.push("📉 Your mood is slightly lower than last week.");
        if (streak >= 7) insights.push(`🔥 Great job! You're on a ${streak}-day streak!`);
        document.getElementById("weekInsights").textContent = insights.join(" ") || "Keep tracking for more insights!";

        const trendChart = document.getElementById("trendChart");
        trendChart.innerHTML = "";
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const entry = entries.find((e) => e.date === d.toISOString().split("T")[0]);
            const bar = document.createElement("div");
            bar.className = "trend-bar";
            bar.style.height = entry ? `${(entry.moodValue / 5) * 100}%` : "4px";
            bar.style.background = entry ? `hsl(${142 + (entry.moodValue - 1) * 20}, 76%, 36%)` : "hsl(var(--border))";
            bar.title = `${d.toLocaleDateString("en", { weekday: "short" })}: ${entry ? entry.moodValue + "/5" : "No data"}`;
            trendChart.appendChild(bar);
        }

        const catAverages = {};
        const catNamesEn = {
            relationships: "💞 Relationships",
            stability: "🏛️ Stability",
            mental: "🧠 Mental",
            physical: "💪 Physical",
            meaning: "🎯 Meaning",
        };
        const catNamesId = {
            relationships: "💞 Hubungan",
            stability: "🏛️ Stabilitas",
            mental: "🧠 Mental",
            physical: "💪 Fisik",
            meaning: "🎯 Makna",
        };
        const catNames = currentLang === "id" ? catNamesId : catNamesEn;
        entries.forEach((e) => {
            if (e.categories) {
                Object.entries(e.categories).forEach(([cat, subs]) => {
                    if (!catAverages[cat]) catAverages[cat] = [];
                    Object.values(subs).forEach((v) => catAverages[cat].push(v));
                });
            }
        });
        const catContainer = document.getElementById("categoryAverages");
        catContainer.innerHTML = "";
        Object.entries(catAverages).forEach(([cat, values]) => {
            const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
            const barWidth = (avg / 5) * 100;
            catContainer.innerHTML += `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 0.75rem; min-width: 100px;">${catNames[cat] || cat}</span>
                    <div style="flex: 1; height: 8px; background: hsl(var(--border)); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${barWidth}%; height: 100%; background: hsl(${142 + (avg - 1) * 20}, 76%, 36%); border-radius: 4px;"></div>
                    </div>
                    <span style="font-size: 0.75rem; min-width: 35px; text-align: right;">${avg}/5</span>
                </div>
            `;
        });

        const heatmap = document.getElementById("heatmap");
        heatmap.innerHTML = "";
        for (let i = 27; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const entry = entries.find((e) => e.date === d.toISOString().split("T")[0]);
            const cell = document.createElement("div");
            cell.className = "heatmap-cell" + (entry ? ` level-${entry.moodValue}` : " empty");
            cell.title = `${d.toLocaleDateString()}: ${entry ? entry.moodValue + "/5" : "No data"}`;
            heatmap.appendChild(cell);
        }
    }

    // ==================== ANALYTICS WITH CHART.JS ====================
    // Chart instances storage
    let moodTrendChart = null;
    let moodDistributionChart = null;
    let categoryRadarChart = null;
    let weeklyPatternChart = null;
    let sevenDayTrendChart = null;
    let currentDateRange = { start: null, end: null };
    let activeTimeFilter = 'custom'; // Track active filter

    // Initialize Date Range Selector with Time Filters
    function initDateRange() {
        const startDateInput = document.getElementById("dateRangeStart");
        const endDateInput = document.getElementById("dateRangeEnd");
        const applyBtn = document.getElementById("applyDateRange");
        const resetBtn = document.getElementById("resetDateRange");
        const dateRangeInfo = document.getElementById("dateRangeInfo");
        const timeFilterBtns = document.querySelectorAll(".time-filter");

        if (!startDateInput || !endDateInput) return;

        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        startDateInput.value = thirtyDaysAgo.toISOString().split("T")[0];
        endDateInput.value = today.toISOString().split("T")[0];
        startDateInput.max = today.toISOString().split("T")[0];
        endDateInput.max = today.toISOString().split("T")[0];
        currentDateRange = { start: thirtyDaysAgo, end: today };

        dateRangeInfo.textContent = `Showing data from ${thirtyDaysAgo.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US')} to ${today.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US')}`;

        // Time filter buttons
        timeFilterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                // Update active state
                timeFilterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeTimeFilter = btn.dataset.days;

                if (btn.dataset.days === 'custom') return;

                const days = parseInt(btn.dataset.days);
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);

                startDateInput.value = startDate.toISOString().split("T")[0];
                endDateInput.value = endDate.toISOString().split("T")[0];
                currentDateRange = { start: startDate, end: endDate };

                const daysLabel = days === 365 ? '1 year' : `${days} days`;
                dateRangeInfo.textContent = `Showing data from ${startDate.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US')} to ${endDate.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US')} (${daysLabel})`;
                updateAnalyticsWithRange();
            });
        });

        applyBtn?.addEventListener("click", () => {
            const start = new Date(startDateInput.value);
            const end = new Date(endDateInput.value);

            if (start > end) {
                showAlert("warning", "Invalid Range", "Start date must be before end date");
                return;
            }

            // Switch to custom mode
            timeFilterBtns.forEach(b => b.classList.remove("active"));
            document.querySelector('.time-filter[data-days="custom"]')?.classList.add("active");
            activeTimeFilter = 'custom';

            currentDateRange = { start, end };
            dateRangeInfo.textContent = `Showing data from ${start.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US')} to ${end.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US')}`;
            updateAnalyticsWithRange();
        });

        resetBtn?.addEventListener("click", () => {
            startDateInput.value = thirtyDaysAgo.toISOString().split("T")[0];
            endDateInput.value = today.toISOString().split("T")[0];
            currentDateRange = { start: thirtyDaysAgo, end: today };
            dateRangeInfo.textContent = `Showing data from ${thirtyDaysAgo.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US')} to ${today.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US')}`;
            updateAnalyticsWithRange();
        });
    }

    // Main Analytics Update Function with Chart.js
    async function updateAnalyticsWithRange() {
        console.log('[Analytics] Starting updateAnalyticsWithRange...');
        
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('[Analytics] Chart.js is not loaded!');
            return;
        }
        console.log('[Analytics] Chart.js is available');
        
        const entries = await Store.mood.getAll();
        console.log('[Analytics] Loaded entries:', entries.length);

        if (entries.length === 0) {
            console.log('[Analytics] No entries found, showing no data state');
            showNoDataState();
            return;
        }

        // Filter by date range
        const filteredEntries = entries.filter((e) => {
            const entryDate = new Date(e.date);
            return entryDate >= currentDateRange.start && entryDate <= currentDateRange.end;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log('[Analytics] Filtered entries:', filteredEntries.length);

        if (filteredEntries.length === 0) {
            console.log('[Analytics] No entries in date range, showing no data state');
            showNoDataState();
            return;
        }

        // Update Key Metrics
        updateKeyMetrics(filteredEntries);

        // Update all charts
        console.log('[Analytics] Updating charts...');
        updateMoodTrendChart(filteredEntries);
        updateMoodDistributionChart(filteredEntries);
        updateCategoryRadarChart(filteredEntries);
        updateWeeklyPatternChart(filteredEntries);
        updateSevenDayTrendChart(filteredEntries);
        updateCategoryBreakdown(filteredEntries);
        updateInsights(filteredEntries);
        updateHeatmap(filteredEntries);
        console.log('[Analytics] Charts updated successfully');
    }

    function showNoDataState() {
        document.getElementById("metricAvgMood").textContent = "-";
        document.getElementById("metricTotalEntries").textContent = "0";
        document.getElementById("metricStreak").textContent = "0";
        document.getElementById("metricBestDay").textContent = "-";
        document.getElementById("analyticsInsights").textContent = "No mood data available. Start tracking to see insights!";
        document.getElementById("categoryBreakdown").innerHTML = "";
        
        // Destroy all charts
        [moodTrendChart, moodDistributionChart, categoryRadarChart, weeklyPatternChart, sevenDayTrendChart].forEach(chart => {
            if (chart) chart.destroy();
        });
    }

    function updateKeyMetrics(entries) {
        const avgMood = (entries.reduce((sum, e) => sum + e.moodValue, 0) / entries.length).toFixed(1);
        const bestEntry = entries.reduce((max, e) => e.moodValue > max.moodValue ? e : max);
        
        // Calculate streak
        let streak = 0;
        let checkDate = new Date(currentDateRange.end);
        checkDate.setHours(0, 0, 0, 0);
        while (checkDate >= currentDateRange.start) {
            const dateStr = checkDate.toISOString().split("T")[0];
            const hasEntry = entries.some((e) => e.date === dateStr);
            if (hasEntry) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (dateStr === new Date().toISOString().split("T")[0]) {
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        const moodEmojis = { 1: "😞", 2: "😕", 3: "😐", 4: "🙂", 5: "🤩" };

        document.getElementById("metricAvgMood").textContent = `${avgMood}/5`;
        document.getElementById("metricTotalEntries").textContent = entries.length;
        document.getElementById("metricStreak").textContent = streak;
        document.getElementById("metricBestDay").textContent = `${moodEmojis[bestEntry.moodValue]} ${bestEntry.moodValue}/5`;

        // Update labels
        const daysDiff = Math.ceil((currentDateRange.end - currentDateRange.start) / (1000 * 60 * 60 * 24));
        document.getElementById("metricAvgLabel").textContent = `Last ${daysDiff} days`;
        document.getElementById("metricEntriesLabel").textContent = `${entries.length} of ${daysDiff} days`;
    }

    // Mood Trend Line Chart
    function updateMoodTrendChart(entries) {
        const ctx = document.getElementById("moodTrendChart");
        if (!ctx) return;

        const labels = entries.map(e => new Date(e.date).toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' }));
        const data = entries.map(e => e.moodValue);

        if (moodTrendChart) moodTrendChart.destroy();

        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        const [h, s, l] = primaryColor.split(' ').map(v => parseFloat(v));

        // Detect dark mode
        const colorScheme = document.documentElement.getAttribute('data-color-scheme');
        const isDarkMode = colorScheme !== 'light';
        const textColor = isDarkMode ? '#e5e5e5' : '#333333';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const pointBorderColor = isDarkMode ? '#1a1a2e' : '#ffffff';

        moodTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Score',
                    data: data,
                    borderColor: `hsl(${h}, ${s}%, ${l}%)`,
                    backgroundColor: `hsla(${h}, ${s}%, ${l}%, 0.15)`,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
                    pointBorderColor: pointBorderColor,
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDarkMode ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `Mood: ${context.parsed.y}/5`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0.5,
                        max: 5.5,
                        ticks: {
                            stepSize: 1,
                            color: textColor,
                            font: { size: 11 },
                            callback: (value) => value.toFixed(0)
                        },
                        grid: { color: gridColor }
                    },
                    x: {
                        ticks: { 
                            color: textColor, 
                            font: { size: 10 },
                            maxRotation: 45, 
                            minRotation: 45 
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Mood Distribution Doughnut Chart
    function updateMoodDistributionChart(entries) {
        const ctx = document.getElementById("moodDistributionChart");
        if (!ctx) return;

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        entries.forEach(e => distribution[e.moodValue]++);

        const moodLabels = { 1: 'Very Bad', 2: 'Bad', 3: 'Neutral', 4: 'Good', 5: 'Very Good' };
        const moodEmojis = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '🤩' };
        const colors = ['hsl(0, 84%, 60%)', 'hsl(25, 84%, 60%)', 'hsl(217, 33%, 50%)', 'hsl(142, 50%, 50%)', 'hsl(142, 76%, 36%)'];

        if (moodDistributionChart) moodDistributionChart.destroy();

        // Detect dark mode
        const colorScheme = document.documentElement.getAttribute('data-color-scheme');
        const isDarkMode = colorScheme !== 'light';
        const textColor = isDarkMode ? '#e5e5e5' : '#333333';
        const cardBg = isDarkMode ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        moodDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(distribution).map(k => `${moodEmojis[k]} ${moodLabels[k]}`),
                datasets: [{
                    data: Object.values(distribution),
                    backgroundColor: colors,
                    borderColor: isDarkMode ? '#1a1a2e' : '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 10,
                            font: { size: 10, weight: '500' }
                        }
                    },
                    tooltip: {
                        backgroundColor: cardBg,
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: borderColor,
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed} entries`
                        }
                    }
                }
            }
        });
    }

    // Category Radar Chart
    function updateCategoryRadarChart(entries) {
        const ctx = document.getElementById("categoryRadarChart");
        if (!ctx) return;

        const catNames = {
            relationships: currentLang === 'id' ? 'Relationships' : 'Relationships',
            stability: currentLang === 'id' ? 'Stability' : 'Stability',
            mental: currentLang === 'id' ? 'Mental' : 'Mental',
            physical: currentLang === 'id' ? 'Physical' : 'Physical',
            meaning: currentLang === 'id' ? 'Meaning' : 'Meaning'
        };
        const catIcons = { relationships: '💞', stability: '🏛️', mental: '🧠', physical: '💪', meaning: '🎯' };

        const catAverages = {};
        entries.forEach(e => {
            if (e.categories && Object.keys(e.categories).length > 0) {
                Object.entries(e.categories).forEach(([cat, subs]) => {
                    if (!catAverages[cat]) catAverages[cat] = [];
                    Object.values(subs).forEach(v => catAverages[cat].push(v));
                });
            }
        });

        const labels = Object.keys(catAverages).map(k => `${catIcons[k] || ''} ${catNames[k] || k}`);
        const data = Object.keys(catAverages).map(k => {
            const values = catAverages[k];
            return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
        });

        if (categoryRadarChart) categoryRadarChart.destroy();

        // Detect dark mode
        const colorScheme = document.documentElement.getAttribute('data-color-scheme');
        const isDarkMode = colorScheme !== 'light';
        const textColor = isDarkMode ? '#e5e5e5' : '#333333';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const cardBg = isDarkMode ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const pointBorderColor = isDarkMode ? '#1a1a2e' : '#ffffff';

        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        const [h, s, l] = primaryColor.split(' ').map(v => parseFloat(v));

        categoryRadarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Category Score',
                    data: data,
                    borderColor: `hsl(${h}, ${s}%, ${l}%)`,
                    backgroundColor: `hsla(${h}, ${s}%, ${l}%, 0.2)`,
                    pointBackgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
                    pointBorderColor: pointBorderColor,
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: cardBg,
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: borderColor,
                        borderWidth: 1
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            color: textColor,
                            backdropColor: 'transparent',
                            font: { size: 10 }
                        },
                        grid: { color: gridColor },
                        pointLabels: {
                            color: textColor,
                            font: { size: 11, weight: '500' }
                        }
                    }
                }
            }
        });
    }

    // Weekly Pattern Bar Chart
    function updateWeeklyPatternChart(entries) {
        const ctx = document.getElementById("weeklyPatternChart");
        if (!ctx) {
            console.error('[WeeklyPattern] Canvas element not found!');
            return;
        }
        console.log('[WeeklyPattern] Canvas found, entries:', entries.length);

        const dayNames = currentLang === 'id'
            ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Calculate day averages - handle missing dayOfWeek by calculating from date
        const dayAverages = {};
        for (let i = 0; i < 7; i++) {
            const dayEntries = entries.filter(e => {
                const entryDayOfWeek = e.dayOfWeek !== undefined ? e.dayOfWeek : new Date(e.date).getDay();
                return entryDayOfWeek === i;
            });
            dayAverages[i] = dayEntries.length
                ? (dayEntries.reduce((sum, e) => sum + e.moodValue, 0) / dayEntries.length).toFixed(1)
                : null;
        }
        console.log('[WeeklyPattern] Day averages:', dayAverages);

        if (weeklyPatternChart) weeklyPatternChart.destroy();

        // Detect dark mode
        const colorScheme = document.documentElement.getAttribute('data-color-scheme');
        const isDarkMode = colorScheme !== 'light';
        const textColor = isDarkMode ? '#e5e5e5' : '#333333';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const cardBg = isDarkMode ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        const colors = Object.values(dayAverages).map(avg => {
            if (!avg) return isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            const value = parseFloat(avg);
            if (value >= 4) return 'hsl(142, 76%, 36%)';
            if (value >= 3) return 'hsl(199, 89%, 48%)';
            return 'hsl(25, 84%, 60%)';
        });

        try {
            weeklyPatternChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: dayNames,
                    datasets: [{
                        label: 'Avg Mood',
                        data: Object.values(dayAverages).map(v => v || 0),
                        backgroundColor: colors,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: cardBg,
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: borderColor,
                            borderWidth: 1,
                            callbacks: {
                                label: (context) => context.parsed.y ? `Avg: ${context.parsed.y}/5` : 'No data'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5.5,
                            ticks: {
                                stepSize: 1,
                                color: textColor,
                                font: { size: 11 }
                            },
                            grid: { color: gridColor }
                        },
                        x: {
                            ticks: { color: textColor, font: { size: 11 } },
                            grid: { display: false }
                        }
                    }
                }
            });
            console.log('[WeeklyPattern] Chart created successfully');
        } catch (error) {
            console.error('[WeeklyPattern] Error creating chart:', error);
        }
    }

    // 7-Day Trend Chart
    function updateSevenDayTrendChart(entries) {
        const ctx = document.getElementById("sevenDayTrendChart");
        if (!ctx) {
            console.error('[7DayTrend] Canvas element not found!');
            return;
        }
        console.log('[7DayTrend] Canvas found, entries:', entries.length);

        const today = new Date(currentDateRange.end);
        const labels = [];
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            labels.push(d.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' }));

            const entry = entries.find(e => e.date === dateStr);
            data.push(entry ? entry.moodValue : null);
        }
        console.log('[7DayTrend] Data:', data);

        if (sevenDayTrendChart) sevenDayTrendChart.destroy();

        // Detect dark mode
        const colorScheme = document.documentElement.getAttribute('data-color-scheme');
        const isDarkMode = colorScheme !== 'light';
        const textColor = isDarkMode ? '#e5e5e5' : '#333333';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const cardBg = isDarkMode ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        const [h, s, l] = primaryColor.split(' ').map(v => parseFloat(v));

        try {
            sevenDayTrendChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Mood',
                        data: data,
                        backgroundColor: data.map(v => {
                            if (!v) return isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                            if (v >= 4) return `hsl(${h}, ${s}%, ${l}%)`;
                            if (v >= 3) return `hsl(${h}, ${s}%, ${l + 20}%)`;
                            return 'hsl(25, 84%, 60%)';
                        }),
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: cardBg,
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: borderColor,
                            borderWidth: 1,
                            callbacks: {
                                label: (context) => context.parsed.y ? `Mood: ${context.parsed.y}/5` : 'No entry'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5.5,
                            ticks: {
                                stepSize: 1,
                                color: textColor,
                                font: { size: 11 }
                            },
                            grid: { color: gridColor }
                        },
                        x: {
                            ticks: { color: textColor, font: { size: 10 } },
                            grid: { display: false }
                        }
                    }
                }
            });
            console.log('[7DayTrend] Chart created successfully');
        } catch (error) {
            console.error('[7DayTrend] Error creating chart:', error);
        }
    }

    // Category Breakdown (Progress Bars)
    function updateCategoryBreakdown(entries) {
        const container = document.getElementById("categoryBreakdown");
        if (!container) {
            console.error('[CategoryBreakdown] Container element not found!');
            return;
        }
        console.log('[CategoryBreakdown] Container found, entries:', entries.length);

        if (entries.length === 0) {
            container.innerHTML = '<div style="padding: 1rem; text-align: center; color: hsl(var(--muted-foreground));">No category data available</div>';
            return;
        }

        const catNamesEn = {
            relationships: "💞 Relationships",
            stability: "🏛️ Stability",
            mental: "🧠 Mental",
            physical: "💪 Physical",
            meaning: "🎯 Meaning"
        };
        const catNamesId = {
            relationships: "💞 Hubungan",
            stability: "🏛️ Stabilitas",
            mental: "🧠 Mental",
            physical: "💪 Fisik",
            meaning: "🎯 Makna"
        };
        const catNames = currentLang === "id" ? catNamesId : catNamesEn;

        const catAverages = {};
        let hasCategories = false;
        entries.forEach(e => {
            if (e.categories && Object.keys(e.categories).length > 0) {
                hasCategories = true;
                Object.entries(e.categories).forEach(([cat, subs]) => {
                    if (!catAverages[cat]) catAverages[cat] = [];
                    Object.values(subs).forEach(v => catAverages[cat].push(v));
                });
            }
        });
        console.log('[CategoryBreakdown] Has categories:', hasCategories, 'Cat averages:', catAverages);

        if (!hasCategories || Object.keys(catAverages).length === 0) {
            container.innerHTML = '<div style="padding: 1rem; text-align: center; color: hsl(var(--muted-foreground));">No category data available. Start tracking mood with categories!</div>';
            return;
        }

        container.innerHTML = "";
        Object.entries(catAverages).forEach(([cat, values]) => {
            const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
            const percentage = (avg / 5) * 100;
            const color = avg >= 4 ? 'hsl(142, 76%, 36%)' : avg >= 3 ? 'hsl(199, 89%, 48%)' : 'hsl(25, 84%, 60%)';

            container.innerHTML += `
                <div style="margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span style="font-size: 0.75rem; font-weight: 500;">${catNames[cat] || cat}</span>
                        <span style="font-size: 0.75rem; color: hsl(var(--muted-foreground));">${avg}/5</span>
                    </div>
                    <div style="height: 8px; background: hsl(var(--border)); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
        });
        console.log('[CategoryBreakdown] Breakdown rendered');
    }

    // Insights Generation
    function updateInsights(entries) {
        const container = document.getElementById("analyticsInsights");
        if (!container) {
            console.error('[Insights] Container element not found!');
            return;
        }
        console.log('[Insights] Container found, entries:', entries.length);

        if (entries.length === 0) {
            container.innerHTML = '<div style="padding: 1rem; text-align: center; color: hsl(var(--muted-foreground));">No data available for insights</div>';
            return;
        }

        const avgMood = entries.reduce((sum, e) => sum + e.moodValue, 0) / entries.length;
        console.log('[Insights] Avg mood:', avgMood);

        // Day of week analysis - handle missing dayOfWeek
        const dayAverages = {};
        for (let i = 0; i < 7; i++) {
            const dayEntries = entries.filter(e => {
                const entryDayOfWeek = e.dayOfWeek !== undefined ? e.dayOfWeek : new Date(e.date).getDay();
                return entryDayOfWeek === i;
            });
            if (dayEntries.length > 0) {
                dayAverages[i] = dayEntries.reduce((sum, e) => sum + e.moodValue, 0) / dayEntries.length;
            }
        }

        // Category analysis
        const catAverages = {};
        entries.forEach(e => {
            if (e.categories && Object.keys(e.categories).length > 0) {
                Object.entries(e.categories).forEach(([cat, subs]) => {
                    if (!catAverages[cat]) catAverages[cat] = [];
                    Object.values(subs).forEach(v => catAverages[cat].push(v));
                });
            }
        });

        const insights = [];

        // Overall mood insight
        if (avgMood >= 4) insights.push("🌟 Your overall mood is excellent! Keep up the positive momentum.");
        else if (avgMood >= 3) insights.push("👍 Your mood is generally good. Small improvements can make a big difference.");
        else insights.push("💪 Tracking is the first step. Consider focusing on lower-scoring areas.");

        // Best/worst day insight
        const bestDay = Object.entries(dayAverages).reduce((max, [day, avg]) => avg > max.avg ? { day, avg } : max, { day: 0, avg: 0 });
        const worstDay = Object.entries(dayAverages).reduce((min, [day, avg]) => avg < min.avg ? { day, avg } : min, { day: 0, avg: 5 });

        const dayNames = currentLang === 'id'
            ? ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
            : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        if (bestDay.avg > 0) insights.push(`📈 You tend to feel best on ${dayNames[bestDay.day]}s (avg: ${bestDay.avg.toFixed(1)}/5).`);
        if (worstDay.avg < 5 && worstDay.avg > 0) insights.push(`📉 ${dayNames[worstDay.day]}s can be challenging (avg: ${worstDay.avg.toFixed(1)}/5).`);

        // Category insight
        if (Object.keys(catAverages).length > 0) {
            const bestCat = Object.entries(catAverages).reduce((max, [cat, vals]) => {
                const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                return avg > max.avg ? { cat, avg } : max;
            }, { cat: '', avg: 0 });

            const worstCat = Object.entries(catAverages).reduce((min, [cat, vals]) => {
                const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                return avg < min.avg ? { cat, avg } : min;
            }, { cat: '', avg: 5 });

            const catNamesEn = { relationships: 'Relationships', stability: 'Stability', mental: 'Mental', physical: 'Physical', meaning: 'Meaning' };
            const catNamesId = { relationships: 'Hubungan', stability: 'Stabilitas', mental: 'Mental', physical: 'Fisik', meaning: 'Makna' };
            const catNames = currentLang === 'id' ? catNamesId : catNamesEn;

            if (bestCat.cat) insights.push(`✨ ${catNames[bestCat.cat] || bestCat.cat} is your strongest area (${bestCat.avg.toFixed(1)}/5).`);
            if (worstCat.cat && worstCat.cat !== bestCat.cat) insights.push(`🎯 Consider focusing on ${catNames[worstCat.cat] || worstCat.cat} (${worstCat.avg.toFixed(1)}/5).`);
        }

        // Trend insight
        if (entries.length >= 4) {
            const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
            const secondHalf = entries.slice(Math.floor(entries.length / 2));
            const firstAvg = firstHalf.length ? firstHalf.reduce((sum, e) => sum + e.moodValue, 0) / firstHalf.length : 0;
            const secondAvg = secondHalf.length ? secondHalf.reduce((sum, e) => sum + e.moodValue, 0) / secondHalf.length : 0;

            if (secondAvg > firstAvg + 0.3) insights.push("📈 Your mood is improving over time!");
            else if (secondAvg < firstAvg - 0.3) insights.push("📉 Your mood has been slightly declining. Consider self-care activities.");
        }

        container.innerHTML = insights.map(i => `<div style="padding: 0.5rem 0; border-bottom: 1px solid hsl(var(--border));">${i}</div>`).join('');
        console.log('[Insights] Insights rendered:', insights.length);
    }

    // Heatmap
    function updateHeatmap(entries) {
        const heatmap = document.getElementById("heatmap");
        if (!heatmap) {
            console.error('[Heatmap] Container element not found!');
            return;
        }
        console.log('[Heatmap] Container found, entries:', entries.length);

        heatmap.innerHTML = "";
        const now = new Date(currentDateRange.end);

        for (let i = 27; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const entry = entries.find(e => e.date === d.toISOString().split("T")[0]);
            const cell = document.createElement("div");
            cell.className = "heatmap-cell" + (entry ? ` level-${entry.moodValue}` : " empty");
            cell.title = `${d.toLocaleDateString()}: ${entry ? entry.moodValue + "/5" : "No data"}`;
            heatmap.appendChild(cell);
        }
        console.log('[Heatmap] Heatmap rendered');
    }

    // Breathing Exercise - FIXED: mm:ss format, counts up to 99:99
    document.getElementById("startBreathing").addEventListener("click", () => {
        const circle = document.getElementById("breathingCircle");
        const text = document.getElementById("breathText");
        document.getElementById("startBreathing").disabled = true;
        document.getElementById("stopBreathing").disabled = false;
        App.breathCycles = 0;
        App.breathTime = 0;
        App.breathPhase = "inhale";

        text.textContent = "Breathe In";
        circle.className = "breathing-circle inhale";
        App.breathCycles++;
        document.getElementById("breathCycles").textContent = App.breathCycles;

        App.breathingInterval = setInterval(() => {
            App.breathTime++;
            // Cap at 99 minutes 99 seconds (99:99 display)
            const maxSeconds = 99 * 60 + 99;
            if (App.breathTime > maxSeconds) {
                App.breathTime = maxSeconds;
            }
            document.getElementById("breathTime").textContent = formatTimeMMSS(App.breathTime);

            if (App.breathPhase === "inhale") {
                text.textContent = "Hold";
                circle.className = "breathing-circle hold";
                App.breathPhase = "hold";
            } else if (App.breathPhase === "hold") {
                text.textContent = "Breathe Out";
                circle.className = "breathing-circle exhale";
                App.breathPhase = "exhale";
            } else if (App.breathPhase === "exhale") {
                text.textContent = "Breathe In";
                circle.className = "breathing-circle inhale";
                App.breathPhase = "inhale";
                App.breathCycles++;
                document.getElementById("breathCycles").textContent = App.breathCycles;
            }
        }, 4000);
    });

    document.getElementById("stopBreathing").addEventListener("click", () => {
        clearInterval(App.breathingInterval);
        const circle = document.getElementById("breathingCircle");
        const text = document.getElementById("breathText");
        document.getElementById("startBreathing").disabled = false;
        document.getElementById("stopBreathing").disabled = true;
        circle.className = "breathing-circle";
        text.textContent = "Ready";
    });

    // Gratitude Journal
    document.getElementById("saveGratitude").addEventListener("click", () => {
        const entries = [
            document.getElementById("gratitude1").value.trim(),
            document.getElementById("gratitude2").value.trim(),
            document.getElementById("gratitude3").value.trim(),
        ].filter((e) => e);

        if (entries.length === 0) {
            showAlert("info", t("emptyEntry"), t("emptyEntryMsg"));
            return;
        }

        Store.gratitude.add({
            entries,
            timestamp: new Date().toISOString(),
        });
        showAlert("success", t("gratitudeSaved"), t("gratitudeSavedMsg"));
        document.getElementById("gratitude1").value = "";
        document.getElementById("gratitude2").value = "";
        document.getElementById("gratitude3").value = "";
        updateGratitudeCount();
        loadGratitudeList();
    });

    function updateGratitudeCount() {
        Store.gratitude.getAll().then((list) => {
            document.getElementById("gratitudeCount").textContent = `${list.length} entrie${list.length !== 1 ? "s" : ""}`;
        });
    }

    function loadGratitudeList() {
        Store.gratitude.getAll().then((list) => {
            const gratitudeList = document.getElementById("gratitudeList");
            gratitudeList.innerHTML = "";
            list.slice(-5).reverse().forEach((entry) => {
                const div = document.createElement("div");
                div.className = "gratitude-item";
                div.textContent = new Date(entry.timestamp).toLocaleDateString() + ": " + entry.entries.join(", ");
                gratitudeList.appendChild(div);
            });
        });
    }

    // Quick Relax
    let relaxInterval = null;
    let relaxTime = 60;
    let relaxSoundInterval = null;

    function playRelaxSound() {
        initAudio();
        const osc = App.audioCtx.createOscillator();
        const gain = App.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(App.audioCtx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.15, App.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, App.audioCtx.currentTime + 0.3);
        osc.start(App.audioCtx.currentTime);
        osc.stop(App.audioCtx.currentTime + 0.3);
    }

    document.getElementById("startRelax").addEventListener("click", () => {
        initAudio();
        document.getElementById("startRelax").disabled = true;
        document.getElementById("stopRelax").disabled = false;
        relaxTime = 60;
        document.getElementById("relaxTimer").textContent = formatTimeMMSS(relaxTime);

        relaxSoundInterval = setInterval(() => {
            if (relaxTime > 0) playRelaxSound();
        }, 4000);

        relaxInterval = setInterval(() => {
            relaxTime--;
            document.getElementById("relaxTimer").textContent = formatTimeMMSS(relaxTime);

            if (relaxTime <= 0) {
                clearInterval(relaxInterval);
                clearInterval(relaxSoundInterval);
                document.getElementById("startRelax").disabled = false;
                document.getElementById("stopRelax").disabled = true;
                playRelaxSound();
                setTimeout(() => playRelaxSound(), 200);
                setTimeout(() => playRelaxSound(), 400);
                showAlert("info", t("relaxationComplete"), t("relaxationCompleteMsg"));
            }
        }, 1000);
    });

    document.getElementById("stopRelax").addEventListener("click", () => {
        clearInterval(relaxInterval);
        clearInterval(relaxSoundInterval);
        document.getElementById("startRelax").disabled = false;
        document.getElementById("stopRelax").disabled = true;
        relaxTime = 60;
        document.getElementById("relaxTimer").textContent = formatTimeMMSS(relaxTime);
    });

    // Focus Timer - FIXED: Slider with 5-min increments, max 2 hours
    const timerTime = document.getElementById("timerTime");
    const timerLabel = document.getElementById("timerLabel");
    const timerToggle = document.getElementById("timerToggle");
    const timerReset = document.getElementById("timerReset");
    const timerProgress = document.getElementById("timerProgress");
    const timerSlider = document.getElementById("timerSlider");
    const timerDurationDisplay = document.getElementById("timerDurationDisplay");
    const alarmModal = document.getElementById("alarmModal");

    function formatTime(secs) {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return m + ":" + s;
    }

    function updateTimerDisplay() {
        timerTime.textContent = formatTime(App.timeLeft);
        const pct = ((App.totalTime - App.timeLeft) / App.totalTime) * 100;
        timerProgress.style.width = pct + "%";
    }

    function updateSliderDisplay() {
        const minutes = parseInt(timerSlider.value);
        App.currentMode = minutes;
        App.totalTime = minutes * 60;
        App.timeLeft = App.totalTime;
        timerDurationDisplay.textContent = `${minutes} ${t("minutes")}`;
        updateTimerDisplay();
    }

    timerSlider?.addEventListener("input", updateSliderDisplay);

    function initAudio() {
        if (!App.audioCtx)
            App.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    function playTone(freq, type, duration, startTime = 0) {
        const osc = App.audioCtx.createOscillator();
        const gain = App.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(App.audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(0.2, App.audioCtx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, App.audioCtx.currentTime + startTime + duration);
        osc.start(App.audioCtx.currentTime + startTime);
        osc.stop(App.audioCtx.currentTime + startTime + duration);
    }

    function playAlarm() {
        initAudio();
        const sounds = {
            digital: () => {
                [0, 0.15, 0.3, 0.45, 0.6, 0.75].forEach((t, i) => playTone(880 + i * 100, "square", 0.1, t));
            },
            chime: () => {
                [523, 659, 784, 1047].forEach((f, i) => playTone(f, "sine", 0.4, i * 0.15));
            },
            bell: () => {
                [392, 523, 784].forEach((f, i) => playTone(f, "triangle", 0.5, i * 0.2));
            },
        };
        sounds[App.alarmSound]();
    }

    let alarmLoop;
    function startAlarmLoop() {
        playAlarm();
        alarmLoop = setInterval(playAlarm, 1500);
    }
    function stopAlarmLoop() {
        if (alarmLoop) {
            clearInterval(alarmLoop);
            alarmLoop = null;
        }
    }

    timerToggle.addEventListener("click", () => {
        initAudio();
        if (App.isRunning) {
            clearInterval(App.timerInterval);
            timerToggle.innerHTML = "▶ Start";
            App.isRunning = false;
        } else {
            timerToggle.innerHTML = "⏸ Pause";
            App.timerInterval = setInterval(() => {
                App.timeLeft--;
                updateTimerDisplay();
                if (App.timeLeft <= 0) {
                    clearInterval(App.timerInterval);
                    App.isRunning = false;
                    timerToggle.innerHTML = "▶ Start";
                    if (App.soundEnabled) startAlarmLoop();
                    alarmModal.classList.add("active");
                    if (App.notifyEnabled && "Notification" in window && Notification.permission === "granted") {
                        const timerNotification = new Notification(t("timesUp"), {
                            body: App.currentMode === 25 ? t("focusComplete") : t("breakOver"),
                            icon: "./manifest.json",
                            tag: "pomodoro-timer",
                            requireInteraction: true,
                            silent: !App.soundEnabled,
                            vibrate: [200, 100, 200],
                            badge: "./manifest.json",
                            data: {
                                url: "./index.html?tab=pomodoro",
                                timestamp: Date.now()
                            }
                        });
                        setTimeout(() => {
                            timerNotification.close();
                        }, 30000);
                    }
                    Store.pomodoro.add({
                        duration: App.currentMode,
                        date: new Date().toISOString(),
                    });
                    App.timeLeft = App.totalTime;
                    updateTimerDisplay();
                }
            }, 1000);
            App.isRunning = true;
        }
    });

    timerReset.addEventListener("click", () => {
        clearInterval(App.timerInterval);
        App.isRunning = false;
        timerToggle.innerHTML = "▶ Start";
        App.timeLeft = App.totalTime;
        updateTimerDisplay();
    });

    document.getElementById("stopAlarm").addEventListener("click", () => {
        alarmModal.classList.remove("active");
        stopAlarmLoop();
    });
    document.getElementById("snoozeAlarm").addEventListener("click", () => {
        alarmModal.classList.remove("active");
        stopAlarmLoop();
        timerSlider.value = 5;
        updateSliderDisplay();
    });

    // Tasks
    let todos = Store.get("todos", []);
    function saveTodos() {
        Store.set("todos", todos);
        renderTodos();
    }
    function renderTodos() {
        const list = document.getElementById("todoList");
        list.innerHTML = "";
        todos.forEach((todo, i) => {
            const li = document.createElement("li");
            li.className = todo.completed ? "completed" : "";
            li.innerHTML = `<span onclick="toggleTodo(${i})" style="cursor:pointer;flex:1">${escapeHtml(todo.text)}</span><button class="btn btn-destructive btn-sm" onclick="deleteTodo(${i})">✕</button>`;
            list.appendChild(li);
        });
        document.getElementById("taskCount").textContent = `${todos.filter((t) => !t.completed).length}/${todos.length}`;
    }
    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
    window.addTodo = () => {
        const input = document.getElementById("todoInput");
        const text = input.value.trim();
        if (text) {
            todos.push({ text, completed: false });
            input.value = "";
            saveTodos();
        }
    };
    window.toggleTodo = (i) => {
        todos[i].completed = !todos[i].completed;
        saveTodos();
    };
    window.deleteTodo = (i) => {
        todos.splice(i, 1);
        saveTodos();
    };
    document.getElementById("addBtn").addEventListener("click", addTodo);
    document.getElementById("todoInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTodo();
    });
    document.getElementById("clearCompleted").addEventListener("click", () => {
        todos = todos.filter((t) => !t.completed);
        saveTodos();
    });
    document.getElementById("clearAll").addEventListener("click", () => {
        if (confirm(t("deleteTasks"))) {
            todos = [];
            saveTodos();
        }
    });

    // Settings
    function updateToggle(id, enabled) {
        document.getElementById(id).classList.toggle("active", enabled);
    }
    updateToggle("soundToggle", App.soundEnabled);
    updateToggle("notifyToggle", App.notifyEnabled);
    document.getElementById("alarmSound").value = App.alarmSound;

    document.getElementById("soundToggle").addEventListener("click", () => {
        App.soundEnabled = !App.soundEnabled;
        Store.set("soundEnabled", App.soundEnabled);
        updateToggle("soundToggle", App.soundEnabled);
    });
    document.getElementById("notifyToggle").addEventListener("click", async () => {
        App.notifyEnabled = !App.notifyEnabled;
        Store.set("notifyEnabled", App.notifyEnabled);
        updateToggle("notifyToggle", App.notifyEnabled);
        if (App.notifyEnabled && "Notification" in window) {
            const permission = await Notification.requestPermission();
            console.log("Notification permission:", permission);
            if (permission === "granted") {
                new Notification("Notifications enabled!", {
                    body: "You'll now receive timer alerts and reminders",
                    icon: "./manifest.json",
                    tag: "notification-test",
                    requireInteraction: true,
                    silent: true
                });
            }
        }
    });
    document.getElementById("alarmSound").addEventListener("change", function () {
        App.alarmSound = this.value;
        Store.set("alarmSound", this.value);
        initAudio();
        playAlarm();
    });

    // Export Data
    document.getElementById("exportData").addEventListener("click", async () => {
        const moods = await Store.mood.getAll();
        const pomodoro = await Store.pomodoro.getAll();
        const gratitude = await Store.gratitude.getAll();
        const exportData = {
            moods,
            pomodoro,
            gratitude,
            todos,
            settings: {
                theme: App.theme,
                colorScheme: App.colorScheme,
                language: currentLang,
                soundEnabled: App.soundEnabled,
                notifyEnabled: App.notifyEnabled,
                alarmSound: App.alarmSound
            },
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `focus-backup-${getTodayKey()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showAlert("success", t("exportSuccess"), t("exportSuccessMsg"));
    });

    // Import Data
    document.getElementById("importData").addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Import moods
                if (data.moods && Array.isArray(data.moods)) {
                    for (const mood of data.moods) {
                        await Store.mood.set(mood);
                    }
                }
                
                // Import settings
                if (data.settings) {
                    if (data.settings.theme) {
                        App.theme = data.settings.theme;
                        document.documentElement.setAttribute("data-theme", App.theme);
                        Store.set("theme", App.theme);
                    }
                    if (data.settings.language) {
                        currentLang = data.settings.language;
                        Store.set("language", currentLang);
                        applyLanguage();
                    }
                }
                
                // Import todos
                if (data.todos && Array.isArray(data.todos)) {
                    todos = data.todos;
                    Store.set("todos", todos);
                    renderTodos();
                }
                
                showAlert("success", t("importSuccess"), t("importSuccessMsg"));
                updateMoodUI();
                renderMoodHistory();
            } catch (err) {
                console.error("Import error:", err);
                showAlert("error", t("importError"), t("importErrorMsg"));
            }
        };
        input.click();
    });

    document.getElementById("resetAll").addEventListener("click", () => {
        showAlert("warning", t("resetConfirm"), t("resetConfirmMsg"), () => {
            localStorage.clear();
            const request = indexedDB.deleteDatabase(DB_NAME);
            request.onsuccess = () => {
                showAlert("success", t("resetComplete"), t("resetCompleteMsg"));
                setTimeout(() => location.reload(), 1500);
            };
        });
    });

    function showAlert(type, title, message, callback) {
        const modal = document.getElementById("alertModal");
        document.getElementById("alertIcon").textContent = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" }[type] || "ℹ️";
        document.getElementById("alertTitle").textContent = title;
        document.getElementById("alertMessage").textContent = message;
        modal.classList.add("active");
        document.getElementById("alertOk").onclick = () => {
            modal.classList.remove("active");
            if (callback) callback();
        };
    }

    // PWA Install - Enhanced visibility and handling
    let deferredPrompt = null;
    const installButton = document.getElementById("installApp");

    // Check if app is already installed (running in standalone mode)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                         (window.navigator.standalone === true);
    
    // Show install button after a short delay to ensure DOM is ready
    setTimeout(() => {
        if (installButton && !isStandalone) {
            // Button will be shown when beforeinstallprompt fires
            // For testing/debugging, you can uncomment below to always show:
            // installButton.style.display = "block";
        }
    }, 500);

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log("PWA install prompt available");
        if (installButton) {
            installButton.style.display = "block";
            // Add a visual indicator that install is available
            installButton.title = "Install this app on your device";
        }
    });

    window.addEventListener("appinstalled", () => {
        console.log("PWA was installed");
        if (installButton) {
            installButton.style.display = "none";
        }
        deferredPrompt = null;
    });

    if (installButton) {
        installButton.addEventListener("click", async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to install prompt: ${outcome}`);
                deferredPrompt = null;
                installButton.style.display = "none";
            } else {
                // If no prompt available, show instructions
                showAlert("info", "Install App", 
                    "To install this app:\n\n" +
                    "• Desktop (Chrome/Edge): Click the install icon in the address bar\n" +
                    "• Android (Chrome): Tap menu → Install app\n" +
                    "• iOS (Safari): Tap Share → Add to Home Screen"
                );
            }
        });
    }

    // Service Worker registration
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./sw.js").then((registration) => {
            console.log("Service Worker registered:", registration.scope);
        }).catch((error) => {
            console.log("Service Worker registration failed:", error);
        });
    }

    // Initialize UI
    await updateMoodUI();
    updateGratitudeCount();
    loadGratitudeList();
    renderTodos();
    renderMoodHistory();
    updateSliderDisplay();
    
    // Set initial slider value
    if (timerSlider) {
        timerSlider.value = 25;
        updateSliderDisplay();
    }
});
