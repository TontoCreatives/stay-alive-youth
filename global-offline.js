// global-offline.js

// 1. Auto-detect online/offline status and inject banner if missing
window.addEventListener('load', () => {
    // If you don't have the offline banner HTML in your markup yet, we can auto-inject it safely
    if (!document.querySelector('.offline-banner')) {
        const banner = document.createElement('div');
        banner.className = 'offline-banner';
        banner.innerHTML = 'You are currently offline. Check your connection.';
        document.body.prepend(banner);
    }

    const handleConnectionChange = () => {
        if (!navigator.onLine) {
            document.body.classList.add('is-offline');
        } else {
            document.body.classList.remove('is-offline');
        }
    };
    
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    handleConnectionChange();
});

// 2. Trigger streak milestone animation if user hits target days
const currentStreak = parseInt(localStorage.getItem('readingStreak') || '0', 10);
const streakCard = document.getElementById('streak-card-id');
if (streakCard && (currentStreak === 3 || currentStreak === 7 || currentStreak % 10 === 0)) {
    streakCard.classList.add('streak-milestone-pop');
}