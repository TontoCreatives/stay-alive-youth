// ==========================================
// GLOBAL SCRIPT - COMPLETE IMPLEMENTATION
// ==========================================

// Preconnect to Sanity and Supabase as early as possible — starts the
// network handshake (DNS, TLS) before any fetch actually happens,
// shaving real time off every content load on every page.
(function preconnectToServices() {
  const domains = [
    'https://y4q1h6a9.api.sanity.io',
    'https://cdn.sanity.io',
    'https://wgziqhahopomiyzvcvxd.supabase.co'
  ];
  domains.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  });
})();

// Catch Google Sign-In redirect coming back into the native app.
// Google/Supabase redirects to com.stay.app://auth-callback#access_token=...
// This listener grabs that URL, closes the in-app browser, and feeds
// the tokens into Supabase so the user ends up signed in inside the app.
if (window.Capacitor && window.Capacitor.isNativePlatform() && window.Capacitor.Plugins.App) {
  window.Capacitor.Plugins.App.addListener('appUrlOpen', async (event) => {
    const url = event.url || '';
    if (!url.startsWith('com.stay.app://auth-callback')) return;

    try {
      // Close the in-app browser tab if it's still open
      if (window.Capacitor.Plugins.Browser) {
        await window.Capacitor.Plugins.Browser.close();
      }

      const client = window.supabaseClient || window.supabase;
      if (!client) return;

      // Supabase puts the tokens after a # fragment
      const hashPart = url.split('#')[1];
      if (!hashPart) return;

      const params = new URLSearchParams(hashPart);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const { error } = await client.auth.setSession({ access_token, refresh_token });
        if (error) {
          console.error('Failed to complete sign-in:', error);
        } else {
          // Reload so the whole page picks up the new signed-in session
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Error handling auth redirect:', err);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  injectGlobalHeader();

  const dateEl = document.getElementById('current-study-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  const bibleForm = document.getElementById('bible-form');
  if (bibleForm) {
    bibleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await searchScripturePassage();
    });
  }

  checkNotebookAuthMode();
  loadUserProfileAndStreak();
  syncDailyStreak();
  setupPushNotifications();
  setupNativeAppExtras();
  loadCommunityInsights();
  initOnlinePresenceTracker();
  checkNotificationOptInState();
  initRepeatingSmokeAnimation();
});

// Global cache for community posts to allow clean editing via event delegation
window._communityPostsCache = {};

// ==========================================
// PULSING VERSE ATTENTION EFFECT
// ==========================================
function initRepeatingSmokeAnimation() {
  const banner = document.getElementById('memory-verse-banner');
  if (!banner) return;

  // Wrap content inside a mobile-friendly flex container with a pulse dot indicator
  let containerEl = banner.querySelector('.weekly-verse-container');
  if (!containerEl) {
    const originalText = banner.innerHTML.trim();
    banner.innerHTML = `
      <div class="weekly-verse-container">
        <span class="pulse-dot"></span>
        <span class="weekly-verse">${originalText}</span>
      </div>
    `;
  }
}

// ==========================================
// 0. HEADER INJECTION & PROFILE MODAL LOGIC
// ==========================================
function injectGlobalHeader() {
  if (document.querySelector('header')) return;

  const headerHTML = `
    <header class="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <a href="/" class="flex items-center gap-2">
        <img src="/Banner images and logo/bible study logo.png" alt="Logo" class="w-8 h-8 rounded-lg object-cover">
        <div>
          <h1 class="text-white text-xs font-bold tracking-wider">STAY ALIVE</h1>
          <p class="text-[10px] text-zinc-400">BIBLE STUDY</p>
        </div>
      </a>
      <div class="flex items-center gap-3">
        <!-- Personal Online Status Indicator -->
        <div id="my-presence-indicator" class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
          <span id="my-status-dot" class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span id="my-status-text" class="text-[10px] text-emerald-400 font-medium">Online</span>
        </div>

        <!-- Room Total Counter -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-emerald-500/30 text-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="text-emerald-400 font-bold" id="online-users-counter">1</span>
          <span class="text-[10px] text-zinc-400">Online</span>
        </div>
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
          <span class="text-amber-400 font-bold" id="user-streak-counter">0</span>
          <span class="text-[10px] text-zinc-400">Day Streak</span>
        </div>
        <button id="profile-trigger-btn" class="cursor-pointer focus:outline-none" title="Account & Profile">
          <img id="user-profile-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest" alt="Profile" class="w-8 h-8 rounded-full object-cover border border-zinc-700 bg-zinc-800">
        </button>
      </div>
    </header>

    <!-- Profile Account Modal with Google Sign-In & Password Reset -->
    <div id="profile-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 relative shadow-2xl space-y-4">
        <button id="profile-close-btn" class="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-all cursor-pointer">✕</button>
        <div>
          <h3 class="text-white font-bold text-base mb-1">Account & Profile</h3>
          <p id="profile-modal-email" class="text-xs text-zinc-400">Manage how you appear in community posts.</p>
        </div>

        <div class="space-y-3" id="profile-modal-body-container">
          <div>
            <label class="block text-[11px] font-medium text-zinc-400 mb-1">Display Name (Public)</label>
            <input type="text" id="profile-displayname-input" placeholder="e.g. David K." class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-[11px] font-medium text-zinc-400 mb-1">Avatar Image URL</label>
            <input type="text" id="profile-avatar-input" placeholder="https://example.com/avatar.png" class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500">
          </div>
          <button id="profile-update-btn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg cursor-pointer">
            Save Profile Settings
          </button>
          <button id="profile-signout-btn" class="w-full py-2.5 bg-zinc-800 hover:bg-red-600/20 hover:text-red-400 text-zinc-300 font-semibold rounded-xl text-xs transition-all cursor-pointer">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  document.getElementById('profile-trigger-btn')?.addEventListener('click', handleProfileClick);
  document.getElementById('profile-close-btn')?.addEventListener('click', closeProfileModal);
  document.getElementById('profile-update-btn')?.addEventListener('click', updateUserProfileSettings);
  document.getElementById('profile-signout-btn')?.addEventListener('click', handleUserSignOut);
}

// ==========================================
// REALTIME ONLINE USERS & PERSONAL STATUS TRACKER
// ==========================================
async function initOnlinePresenceTracker() {
  const client = window.supabaseClient || window.supabase;
  const counterEl = document.getElementById('online-users-counter');
  const statusText = document.getElementById('my-status-text');
  const statusDot = document.getElementById('my-status-dot');
  
  if (!client) {
    if (counterEl) counterEl.textContent = '1';
    return;
  }

  try {
    const { data: { session } } = await client.auth.getSession();
    const userIdentifier = session ? session.user.email : 'Guest-' + Math.floor(Math.random() * 1000);

    const presenceChannel = client.channel('room_stay_alive_online', {
      config: { 
        presence: { 
          key: userIdentifier 
        } 
      }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const totalOnline = Object.keys(state).length;
        if (counterEl) {
          counterEl.textContent = totalOnline > 0 ? totalOnline : 1;
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log(`User disconnected:`, key);
      });

    await presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          online_at: new Date().toISOString(),
          user: userIdentifier
        });
        if (statusText) {
          statusText.textContent = 'Online';
          statusText.className = 'text-[10px] text-emerald-400 font-medium';
        }
        if (statusDot) {
          statusDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
        }
      }
    });

    window.addEventListener('offline', () => {
      if (counterEl) counterEl.textContent = '1 (Offline)';
      if (statusText) {
        statusText.textContent = 'Offline';
        statusText.className = 'text-[10px] text-red-400 font-medium';
      }
      if (statusDot) {
        statusDot.className = 'w-2 h-2 rounded-full bg-red-500';
      }
    });

    window.addEventListener('online', () => {
      if (statusText) {
        statusText.textContent = 'Online';
        statusText.className = 'text-[10px] text-emerald-400 font-medium';
      }
      if (statusDot) {
        statusDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
      }
    });

  } catch (err) {
    console.log("Presence tracking running in fallback mode.");
    if (counterEl) counterEl.textContent = '1';
  }
}

async function handleProfileClick() {
  const client = window.supabaseClient || window.supabase;
  if (!client) return;

  const modal = document.getElementById('profile-modal');
  const emailEl = document.getElementById('profile-modal-email');
  const signoutBtn = document.getElementById('profile-signout-btn');
  const nameInput = document.getElementById('profile-displayname-input');

  try {
    const { data: { session } } = await client.auth.getSession();
    
    if (!session) {
      if (emailEl) emailEl.textContent = "Sign in instantly with Google or use your email account.";
      
      const parentBlock = nameInput ? nameInput.parentElement.parentElement : null;
      if (parentBlock) {
        parentBlock.innerHTML = `
          <button id="google-signin-btn" class="w-full py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.19v3.15C3.18 21.31 7.22 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.19C.43 8.13 0 9.87 0 12s.43 3.87 1.19 5.4l4.08-3.16z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.18 2.69 1.19 6.6l4.08 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            Continue with Google
          </button>

          <div class="flex items-center my-3">
            <div class="flex-grow border-t border-zinc-800"></div>
            <span class="px-2 text-[10px] text-zinc-500 uppercase tracking-wider">or email</span>
            <div class="flex-grow border-t border-zinc-800"></div>
          </div>

          <div>
            <label class="block text-[11px] font-medium text-zinc-400 mb-1">Email Address</label>
            <input type="email" id="auth-email-input" placeholder="you@example.com" class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-[11px] font-medium text-zinc-400">Password</label>
              <button id="forgot-password-link" class="text-[10px] text-amber-400 hover:underline cursor-pointer">Forgot password?</button>
            </div>
            <input type="password" id="auth-password-input" placeholder="••••••••" class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500">
          </div>
          <button id="profile-update-btn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg cursor-pointer">
            Sign In / Register
          </button>
          <button id="profile-signout-btn" class="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs transition-all cursor-pointer" style="display:none;">
            Sign Out
          </button>
        `;

   document.getElementById('google-signin-btn').onclick = async () => {
          // Check if Capacitor is available on the mobile build
          if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            const { data, error } = await client.auth.signInWithOAuth({
              provider: 'google',
              options: {
                skipBrowserRedirect: true,
                redirectTo: 'com.stay.app://auth-callback'
              }
            });
            if (error) {
              alert("Google Sign-In Error: " + error.message);
              return;
            }
            if (data?.url && window.Capacitor.Plugins.Browser) {
              await window.Capacitor.Plugins.Browser.open({ url: data.url });
            }
          } else {
            // Standard web fallback behavior
            const { error } = await client.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.origin }
            });
            if (error) alert("Google Sign-In Error: " + error.message);
          }
        };

        document.getElementById('forgot-password-link').onclick = async (e) => {
          e.preventDefault();
          const emailInput = document.getElementById('auth-email-input');
          const email = emailInput ? emailInput.value.trim() : '';
          if (!email) {
            alert("Please enter your email address above first, then click 'Forgot password?'.");
            emailInput?.focus();
            return;
          }

          const { error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
          });

          if (error) {
            alert("Error sending reset email: " + error.message);
          } else {
            alert("Password reset link sent! Check your email inbox to create a new password.");
          }
        };
        
        document.getElementById('profile-update-btn').onclick = async () => {
          const email = document.getElementById('auth-email-input').value.trim();
          const password = document.getElementById('auth-password-input').value.trim();
          
          if (!email || !password) {
            alert("Please enter both email and password.");
            return;
          }

          let { error } = await client.auth.signInWithPassword({ email, password });
          if (error) {
            let { error: signUpError } = await client.auth.signUp({ email, password });
            if (signUpError) {
              alert("Auth error: " + signUpError.message);
              return;
            } else {
              alert("Account created and signed in successfully!");
            }
          } else {
            alert("Signed in successfully!");
          }
          window.location.reload();
        };
      }

      if (modal) modal.classList.remove('hidden');
      return;
    }

    if (emailEl) emailEl.textContent = session.user.email;
    if (signoutBtn) signoutBtn.style.display = 'block';

    const { data: profile } = await client
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      if (nameInput) nameInput.value = profile.display_name || '';
      const avatarInput = document.getElementById('profile-avatar-input');
      if (avatarInput) avatarInput.value = profile.avatar_url || '';
    }

    if (modal) modal.classList.remove('hidden');
  } catch (e) {
    console.error("Profile modal error:", e);
  }
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.add('hidden');
}

async function updateUserProfileSettings() {
  const nameInput = document.getElementById('profile-displayname-input');
  const avatarInput = document.getElementById('profile-avatar-input');
  
  const displayName = nameInput ? nameInput.value.trim() : '';
  const newAvatarUrl = avatarInput ? avatarInput.value.trim() : '';

  const client = window.supabaseClient || window.supabase;
  if (!client) return;

  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  const { error } = await client
    .from('profiles')
    .upsert({ 
      id: session.user.id, 
      display_name: displayName, 
      avatar_url: newAvatarUrl,
      updated_at: new Date().toISOString()
    });

  if (error) {
    alert("Failed to update profile: " + error.message);
  } else {
    alert("Profile updated successfully!");
    closeProfileModal();
    loadUserProfileAndStreak();
    loadCommunityInsights();
  }
}

async function handleUserSignOut() {
  const client = window.supabaseClient || window.supabase;
  if (!client) return;
  await client.auth.signOut();
  alert("Signed out successfully.");
  window.location.reload();
}

// ==========================================
// 1. LEXICON ORIGINAL LANGUAGE DICTIONARY
// ==========================================
const lexiconDictionary = {
  "agape": { original: "ἀγάπη (G26)", meaning: "Unconditional, sacrificial, divine love exercised intentionally." },
  "logos": { original: "λόγος (G3056)", meaning: "Word, divine expression, reason, or calculation manifesting God's mind." },
  "chesed": { original: "חֶסֶד (H2617)", meaning: "Steadfast covenant love, loyalty, mercy, and lovingkindness." },
  "shalom": { original: "שָׁלוֹם (H7965)", meaning: "Completeness, wholeness, peace, welfare, and flourishing in all dimensions." },
  "pisteuo": { original: "πιστεύω (G4100)", meaning: "To entrust oneself, rely upon, have active faith or conviction." },
  "sozo": { original: "σῴζω (G4982)", meaning: "To save, keep safe, rescue from danger, heal, and preserve." }
};

function inspectLexiconTerm(termKey) {
  const cleanKey = termKey.toLowerCase().replace(/[^a-z]/g, '');
  const entry = lexiconDictionary[cleanKey] || { 
    original: "Original Root Lookup", 
    meaning: "Tap highlighted theological terms or type terms like 'agape', 'logos', or 'chesed' to view root meanings." 
  };

  const modalBox = document.getElementById('lexicon-inspect-box');
  if (modalBox) {
    modalBox.innerHTML = `
      <div class="p-3 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-1 mt-3 text-left">
        <span class="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Lexicon / Original Language</span>
        <h5 class="text-xs font-bold text-white">${entry.original}</h5>
        <p class="text-[11px] text-zinc-300 leading-relaxed">${entry.meaning}</p>
      </div>
    `;
  }
}

// ==========================================
// 2. OFFLINE & ONLINE SCRIPTURE SEARCH & CACHE
// ==========================================
async function searchScripturePassage() {
  const inputEl = document.getElementById('bible-input');
  const placeholderEl = document.getElementById('bible-placeholder');
  const contentEl = document.getElementById('bible-content');
  const refEl = document.getElementById('passage-reference');
  const textEl = document.getElementById('passage-text');
  
  const query = inputEl ? inputEl.value.trim() : '';
  if (!query) return;

  if (refEl) refEl.textContent = query;
  if (placeholderEl) placeholderEl.classList.add('hidden');
  if (contentEl) contentEl.classList.remove('hidden');

  const cacheKey = `stay_alive_passage_${query.toLowerCase().replace(/\s+/g, '_')}`;
  const cachedPassage = localStorage.getItem(cacheKey);

  if (!navigator.onLine) {
    if (cachedPassage) {
      renderPassageResult(textEl, query, cachedPassage, true);
    } else {
      textEl.innerHTML = `
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
          <p class="font-bold">You are offline and this passage is not cached.</p>
          <p class="text-zinc-400">Connect to the internet once to search and save passages for offline reading.</p>
        </div>
      `;
    }
    return;
  }

  textEl.innerHTML = `<p class="text-zinc-500 animate-pulse text-sm">Fetching scripture passage...</p>`;

  try {
    const encodedRef = encodeURIComponent(query);
    const res = await fetch(`https://api.esv.org/v3/passage/text/?q=${encodedRef}&include-footnotes=false&include-headings=false`, {
      headers: {
        'Authorization': 'Token 6979505527dc41c2c2f210d7e2e28328fa3f80c2'
      }
    });

    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();

    if (data.passages && data.passages.length > 0) {
      const passageText = data.passages.join('\n\n');
      localStorage.setItem(cacheKey, passageText);
      renderPassageResult(textEl, query, passageText, false);
    } else {
      textEl.innerHTML = `<p class="text-red-400 text-sm">Passage not found. Try another reference format (e.g. John 3:16).</p>`;
    }
  } catch (err) {
    if (cachedPassage) {
      renderPassageResult(textEl, query, cachedPassage, true);
    } else {
      textEl.innerHTML = `<p class="text-amber-400 text-xs">Could not fetch passage online and no offline cache found.</p>`;
    }
  }
}

function renderPassageResult(containerEl, queryRef, passageText, isOfflineCached) {
  containerEl.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md ${isOfflineCached ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}">
        ${isOfflineCached ? '⚡ Read Offline (Cached)' : '🌐 Live Online'}
      </span>
      <button onclick="saveCachedPassageToNotes('${queryRef}')" class="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer">
        + Send to Notebook
      </button>
    </div>
    <div class="whitespace-pre-line text-zinc-200 text-sm leading-relaxed">${passageText}</div>
    <div id="lexicon-inspect-box">
      <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 mt-4">
        💡 <span class="text-white font-semibold">Greek/Hebrew Quick Lexicon:</span> Try checking 
        <button onclick="inspectLexiconTerm('agape')" class="text-amber-400 underline cursor-pointer hover:text-amber-300">agape</button>, 
        <button onclick="inspectLexiconTerm('logos')" class="text-amber-400 underline cursor-pointer hover:text-amber-300">logos</button>, or 
        <button onclick="inspectLexiconTerm('chesed')" class="text-amber-400 underline cursor-pointer hover:text-amber-300">chesed</button>.
      </div>
    </div>
  `;
}

function saveCachedPassageToNotes(ref) {
  const cacheKey = `stay_alive_passage_${ref.toLowerCase().replace(/\s+/g, '_')}`;
  const passageText = localStorage.getItem(cacheKey);
  if (!passageText) return;

  const noteInput = document.getElementById('note-scripture-input');
  const contentInput = document.getElementById('note-content-input');
  
  if (noteInput) noteInput.value = ref;
  if (contentInput) contentInput.value = passageText;

  alert(`Loaded "${ref}" into your study notebook below!`);
  document.getElementById('session-notebook-section')?.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 3. NOTEBOOK AUTHENTICATION & SYNC MANAGEMENT
// ==========================================
async function checkNotebookAuthMode() {
  const indicator = document.getElementById('notebook-mode-indicator');
  const syncBtn = document.getElementById('sync-notes-btn');
  
  const client = window.supabaseClient || window.supabase;
  if (!client) {
    loadLocalNotebooks();
    return;
  }

  try {
    const { data: { session } } = await client.auth.getSession();
    if (session) {
      if (indicator) {
        indicator.textContent = 'Cloud Synced (Secure)';
        indicator.className = 'px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      }
      if (syncBtn) syncBtn.classList.add('hidden');
      loadCloudNotebooks(session.user.id);
    } else {
      if (indicator) {
        indicator.textContent = 'Guest Mode (Local)';
        indicator.className = 'px-3 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20';
      }
      const localNotes = JSON.parse(localStorage.getItem('stay_alive_local_notes') || '[]');
      if (localNotes.length > 0 && syncBtn) {
        syncBtn.classList.remove('hidden');
      }
      loadLocalNotebooks();
    }
  } catch (e) {
    loadLocalNotebooks();
  }
}

// ==========================================
// 4. NOTEBOOK STORAGE & RENDERING LOGIC
// ==========================================
async function saveSessionNotebookEntry() {
  const leaderRefEl = document.getElementById('leader-scripture-ref-input');
  const leaderTextEl = document.getElementById('leader-scripture-text-input');
  const scriptureRefEl = document.getElementById('note-scripture-input');
  const notesContentEl = document.getElementById('note-content-input');
  const imageInput = document.getElementById('note-image-input');

  const leaderRef = leaderRefEl ? leaderRefEl.value.trim() : '';
  const leaderText = leaderTextEl ? leaderTextEl.value.trim() : '';
  const scriptureRef = scriptureRefEl ? scriptureRefEl.value.trim() : '';
  const notesContent = notesContentEl ? notesContentEl.value.trim() : '';

  if (!notesContent && !leaderText) {
    alert('Please write something in your notes or leader focus section before saving.');
    return;
  }

  let imageUrl = null;
  let session = null;
  const client = window.supabaseClient || window.supabase;

  if (client && navigator.onLine) {
    try {
      const res = await client.auth.getSession();
      session = res.data.session;
    } catch(e) {
      session = null;
    }
  }

  if (session && imageInput && imageInput.files[0] && navigator.onLine) {
    const file = imageInput.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `study_notes/${fileName}`;

    const { error: uploadError } = await client.storage
      .from('session-assets')
      .upload(filePath, file);

    if (!uploadError) {
      const { data: publicURLData } = client.storage
        .from('session-assets')
        .getPublicUrl(filePath);
      imageUrl = publicURLData.publicUrl;
    }
  } else if (imageInput && imageInput.files[0]) {
    imageUrl = await convertFileToBase64(imageInput.files[0]);
  }

  const editId = document.getElementById('editing-notebook-id')?.value;

  if (editId) {
    if (session && navigator.onLine) {
      const { error } = await client
        .from('session_notebook')
        .update({
          leader_ref: leaderRef || 'Leader Focus',
          leader_text: leaderText,
          scripture_ref: scriptureRef || 'General Reflection',
          notes_content: notesContent,
          ...(imageUrl ? { image_url: imageUrl } : {})
        })
        .eq('id', editId);

      if (error) {
        alert('Failed to update cloud note: ' + error.message);
        return;
      }
      loadCloudNotebooks(session.user.id);
    } else {
      let localNotes = JSON.parse(localStorage.getItem('stay_alive_local_notes') || '[]');
      localNotes = localNotes.map(n => {
        if (n.id === editId) {
          return {
            ...n,
            leader_ref: leaderRef || 'Leader Focus',
            leader_text: leaderText,
            scripture_ref: scriptureRef || 'General Reflection',
            notes_content: notesContent,
            ...(imageUrl ? { image_url: imageUrl } : {})
          };
        }
        return n;
      });
      localStorage.setItem('stay_alive_local_notes', JSON.stringify(localNotes));
      loadLocalNotebooks();
    }

    const editInputEl = document.getElementById('editing-notebook-id');
    if (editInputEl) editInputEl.remove();

    alert('Study note updated successfully!');
  } else {
    const newEntry = {
      id: 'note_' + Date.now(),
      leader_ref: leaderRef || 'Leader Focus',
      leader_text: leaderText,
      scripture_ref: scriptureRef || 'General Reflection',
      notes_content: notesContent,
      image_url: imageUrl,
      session_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    if (session && navigator.onLine) {
      const { error } = await client
        .from('session_notebook')
        .insert([{
          user_id: session.user.id,
          leader_ref: newEntry.leader_ref,
          leader_text: newEntry.leader_text,
          scripture_ref: newEntry.scripture_ref,
          notes_content: newEntry.notes_content,
          image_url: newEntry.image_url,
          session_date: newEntry.session_date
        }]);

      if (error) {
        alert('Failed to save to cloud: ' + error.message);
        return;
      }
      loadCloudNotebooks(session.user.id);
    } else {
      const localNotes = JSON.parse(localStorage.getItem('stay_alive_local_notes') || '[]');
      localNotes.unshift(newEntry);
      localStorage.setItem('stay_alive_local_notes', JSON.stringify(localNotes));
      loadLocalNotebooks();
      
      const syncBtn = document.getElementById('sync-notes-btn');
      if (syncBtn && navigator.onLine && session) syncBtn.classList.remove('hidden');
    }
    alert('Study note saved successfully!');
  }

  if (leaderRefEl) leaderRefEl.value = '';
  if (leaderTextEl) leaderTextEl.value = '';
  if (scriptureRefEl) scriptureRefEl.value = '';
  if (notesContentEl) notesContentEl.value = '';
  if (imageInput) imageInput.value = '';
}

function loadLocalNotebooks() {
  const container = document.getElementById('saved-notebooks-container');
  if (!container) return;

  const localNotes = JSON.parse(localStorage.getItem('stay_alive_local_notes') || '[]');
  if (localNotes.length === 0) {
    container.innerHTML = `<p class="text-xs text-zinc-500 text-center py-2">No local notes saved yet. Start typing above!</p>`;
    return;
  }

  renderNotebookItems(localNotes, container, true);
}

async function loadCloudNotebooks(userId) {
  const container = document.getElementById('saved-notebooks-container');
  if (!container) return;

  if (!navigator.onLine) {
    loadLocalNotebooks();
    return;
  }

  const client = window.supabaseClient || window.supabase;
  if (!client) return;

  try {
    const { data, error } = await client
      .from('session_notebook')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(15);

    if (error || !data || data.length === 0) {
      loadLocalNotebooks();
      return;
    }

    renderNotebookItems(data, container, false);
  } catch (err) {
    loadLocalNotebooks();
  }
}

function renderNotebookItems(items, container, isLocal) {
  container.innerHTML = items.map(item => {
    const itemId = item.id;
    const itemDataJSON = encodeURIComponent(JSON.stringify(item));

    return `
      <div class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 relative">
        ${item.leader_text ? `
          <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-bold uppercase tracking-wider text-amber-400">Leader Focus</span>
              <span class="text-[9px] text-zinc-400 font-mono">${item.leader_ref || ''}</span>
            </div>
            <p class="text-xs text-zinc-300 italic">"${item.leader_text}"</p>
          </div>
        ` : ''}
        <div class="flex items-center justify-between pt-1">
          <span class="text-xs font-bold text-emerald-400">${item.scripture_ref}</span>
          <span class="text-[10px] text-zinc-500">${item.session_date || ''} ${isLocal ? '(Local)' : ''}</span>
        </div>
        <p class="text-xs text-zinc-300 leading-relaxed">${item.notes_content}</p>
        ${item.image_url ? `<img src="${item.image_url}" class="w-full h-32 object-cover rounded-lg border border-zinc-800 mt-2">` : ''}
        
        <!-- Edit & Delete Archive Buttons -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/60 mt-2 relative z-10">
          <button type="button" data-note-item="${itemDataJSON}" class="edit-notebook-btn text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-900/30 transition-all">
            Edit Archive
          </button>
          <button type="button" onclick="deleteNotebookEntry('${itemId}', ${isLocal})" class="text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer bg-red-950/30 px-2.5 py-1 rounded-lg border border-red-900/30 transition-all">
            Delete Archive
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.edit-notebook-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      try {
        const rawData = decodeURIComponent(e.currentTarget.getAttribute('data-note-item'));
        const item = JSON.parse(rawData);

        const leaderRefEl = document.getElementById('leader-scripture-ref-input');
        const leaderTextEl = document.getElementById('leader-scripture-text-input');
        const scriptureRefEl = document.getElementById('note-scripture-input');
        const notesContentEl = document.getElementById('note-content-input');

        if (leaderRefEl) leaderRefEl.value = item.leader_ref || '';
        if (leaderTextEl) leaderTextEl.value = item.leader_text || '';
        if (scriptureRefEl) scriptureRefEl.value = item.scripture_ref || '';
        if (notesContentEl) notesContentEl.value = item.notes_content || '';

        let editInputEl = document.getElementById('editing-notebook-id');
        if (!editInputEl) {
          editInputEl = document.createElement('input');
          editInputEl.type = 'hidden';
          editInputEl.id = 'editing-notebook-id';
          document.body.appendChild(editInputEl);
        }
        editInputEl.value = item.id;

        document.getElementById('session-notebook-section')?.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        console.error("Error opening notebook item for edit:", err);
      }
    });
  });
}

async function deleteNotebookEntry(id, isLocal) {
  if (!confirm("Are you sure you want to delete this archive?")) return;

  if (isLocal) {
    let localNotes = JSON.parse(localStorage.getItem('stay_alive_local_notes') || '[]');
    localNotes = localNotes.filter(n => n.id !== id);
    localStorage.setItem('stay_alive_local_notes', JSON.stringify(localNotes));
    loadLocalNotebooks();
  } else {
    const client = window.supabaseClient || window.supabase;
    if (!client) return;
    const { error } = await client.from('session_notebook').delete().eq('id', id);
    if (error) {
      alert("Failed to delete note: " + error.message);
    } else {
      const { data: { session } } = await client.auth.getSession();
      if (session) loadCloudNotebooks(session.user.id);
    }
  }
}

async function syncLocalNotesToCloud() {
  const client = window.supabaseClient || window.supabase;
  if (!client || !navigator.onLine) return;
  
  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  const localNotes = JSON.parse(localStorage.getItem('stay_alive_local_notes') || '[]');
  if (localNotes.length === 0) return;

  for (const note of localNotes) {
    await client.from('session_notebook').insert([{
      user_id: session.user.id,
      leader_ref: note.leader_ref,
      leader_text: note.leader_text,
      scripture_ref: note.scripture_ref,
      notes_content: note.notes_content,
      image_url: note.image_url,
      session_date: note.session_date
    }]);
  }

  localStorage.removeItem('stay_alive_local_notes');
  alert('All local notes successfully synced to your cloud account!');
  checkNotebookAuthMode();
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// ==========================================
// 5. PROFILE & STREAK TRACKING (SUPABASE)
// ==========================================
async function loadUserProfileAndStreak() {
  const client = window.supabaseClient || window.supabase;
  const streakEl = document.getElementById('user-streak-counter');
  const avatarEl = document.getElementById('user-profile-avatar');
  const greetingEl = document.getElementById('user-greeting');

  if (!client) return;

  try {
    const { data: { session } } = await client.auth.getSession();
    if (!session) return;

    let defaultAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;

    const { data: profile } = await client
      .from('profiles')
      .select('streak_count, avatar_url, display_name')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      if (streakEl && profile.streak_count !== undefined) {
        streakEl.textContent = profile.streak_count;
      }
      if (avatarEl) {
        avatarEl.src = profile.avatar_url || defaultAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`;
      }
      if (greetingEl) {
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
        const name = (profile.display_name || session.user.user_metadata?.full_name || '').trim();
        greetingEl.textContent = name ? `${timeGreeting}, ${name.split(' ')[0]}` : timeGreeting;
        greetingEl.classList.remove('hidden');
      }
    } else if (defaultAvatar && avatarEl) {
      avatarEl.src = defaultAvatar;
    }
  } catch (err) {
    console.log("Profile streak sync check skipped.");
  }
}

// ==========================================
// 6. COMMUNITY FELLOWSHIP & ADMIN EDIT/DELETE
// ==========================================
async function loadCommunityInsights() {
  const container = document.getElementById('community-feed-container');
  if (!container) return;

  const client = window.supabaseClient || window.supabase;
  if (!client || !navigator.onLine) {
    container.innerHTML = `<p class="text-xs text-zinc-500 text-center py-4">Connect online to view community feed.</p>`;
    return;
  }

  try {
    const { data: sessionData } = await client.auth.getSession();
    const currentUser = sessionData?.session?.user;
    
    const { data, error } = await client
      .from('community_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      container.innerHTML = `<p class="text-xs text-zinc-500 text-center py-4">No community insights shared yet.</p>`;
      return;
    }

    // 🕒 24-HOUR EXPIRATION FILTER 🕒
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeData = data.filter(item => {
      const postDate = new Date(item.created_at);
      return postDate > twentyFourHoursAgo;
    });

    if (activeData.length === 0) {
      container.innerHTML = `<p class="text-xs text-zinc-500 text-center py-4">No active community insights from the last 24 hours. Be the first to share one!</p>`;
      return;
    }

    window._communityPostsCache = {};
    activeData.forEach(item => {
      window._communityPostsCache[item.id] = item;
    });

    const userIds = [...new Set(activeData.map(item => item.user_id))];
    const { data: profilesData } = await client
      .from('profiles')
      .select('id, display_name, avatar_url, is_admin')
      .in('id', userIds);

    const profileMap = {};
    let currentUserIsAdmin = false;

    if (currentUser) {
      const { data: myProfile } = await client
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .single();
      if (myProfile && myProfile.is_admin) {
        currentUserIsAdmin = true;
      }
    }

    if (profilesData) {
      profilesData.forEach(p => {
        profileMap[p.id] = p;
      });
    }

    container.innerHTML = activeData.map(item => {
      const author = profileMap[item.user_id] || {};
      const avatarUrl = item.avatar_url || author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id}`;
      let displayName = item.user_name || (author.display_name && author.display_name.trim() !== '' 
        ? author.display_name 
        : `Member_${item.user_id.substring(0, 6)}`);

      const isOwner = currentUser && currentUser.id === item.user_id;
      const canManage = currentUser && (currentUserIsAdmin || isOwner);
      
      return `
        <div class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5 relative">
          <div class="flex items-center justify-between border-b border-zinc-800/60 pb-2">
            <div class="flex items-center gap-2">
              <img src="${avatarUrl}" alt="Avatar" class="w-6 h-6 rounded-full object-cover border border-zinc-700 bg-zinc-800">
              <span class="text-[11px] font-medium text-zinc-300 truncate max-w-[180px]">${displayName}</span>
            </div>
            <span class="text-[10px] text-zinc-500">${new Date(item.created_at).toLocaleDateString()}</span>
          </div>

          <div class="space-y-1">
            ${item.scripture_ref ? `<span class="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">${item.scripture_ref}</span>` : ''}
            <p class="text-xs text-zinc-300 leading-relaxed mt-1">${item.insight || ''}</p>
          </div>

          ${canManage ? `
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/60 mt-2">
              ${isOwner ? `
                <button data-post-id="${item.id}" class="edit-community-btn text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-900/30 transition-all">
                  Edit Post
                </button>
              ` : ''}
              <button onclick="deleteCommunityInsight('${item.id}')" class="text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer bg-red-950/30 px-2.5 py-1 rounded-lg border border-red-900/30 transition-all">
                ${currentUserIsAdmin && !isOwner ? 'Admin Delete' : 'Delete Post'}
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p class="text-xs text-zinc-500 text-center py-4">Unable to load community feed.</p>`;
  }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.edit-community-btn');
  if (!btn) return;

  const postId = btn.getAttribute('data-post-id');
  const item = window._communityPostsCache[postId];
  if (!item) return;

  const verseInput = document.getElementById('post-verse-input');
  const textInput = document.getElementById('post-text-input');

  if (verseInput) verseInput.value = item.scripture_ref !== 'General' ? item.scripture_ref : '';
  if (textInput) textInput.value = item.insight || '';

  let editPostIdEl = document.getElementById('editing-community-post-id');
  if (!editPostIdEl) {
    editPostIdEl = document.createElement('input');
    editPostIdEl.type = 'hidden';
    editPostIdEl.id = 'editing-community-post-id';
    document.body.appendChild(editPostIdEl);
  }
  editPostIdEl.value = item.id;

  const modal = document.getElementById('post-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
});

async function deleteCommunityInsight(id) {
  if (!confirm("Are you sure you want to delete this insight?")) return;

  const client = window.supabaseClient || window.supabase;
  if (!client) return;

  const { error } = await client
    .from('community_insights')
    .delete()
    .eq('id', id);

  if (error) {
    alert("Failed to delete post: " + error.message);
  } else {
    loadCommunityInsights();
  }
}

function openNewPostModal() {
  const modal = document.getElementById('post-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeNewPostModal() {
  const modal = document.getElementById('post-modal');
  if (modal) modal.classList.add('hidden');
  
  const editPostIdEl = document.getElementById('editing-community-post-id');
  if (editPostIdEl) editPostIdEl.remove();
  const verseInput = document.getElementById('post-verse-input');
  const textInput = document.getElementById('post-text-input');
  if (verseInput) verseInput.value = '';
  if (textInput) textInput.value = '';
}

async function submitCommunityPost() {
  const verseInput = document.getElementById('post-verse-input');
  const textInput = document.getElementById('post-text-input');
  const publicToggle = document.getElementById('post-public-toggle');

  const scriptureRef = verseInput ? verseInput.value.trim() : '';
  const content = textInput ? textInput.value.trim() : '';
  const isPublic = publicToggle ? publicToggle.checked : true;

  if (!content) {
    alert("Please write your insight or note before publishing.");
    return;
  }

  if (!isPublic) {
    alert("Post is set to private. Save it in your personal study notebook instead.");
    closeNewPostModal();
    return;
  }

  const client = window.supabaseClient || window.supabase;
  if (!client || !navigator.onLine) {
    alert("You must be online to publish to the community feed.");
    return;
  }

  try {
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
      alert("Please log in to publish posts to the community.");
      return;
    }

    let displayName = session.user.email?.split('@')[0] || 'Member';
    let avatarUrl = session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`;

    const { data: profile } = await client
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      if (profile.display_name && profile.display_name.trim() !== '') displayName = profile.display_name;
      if (profile.avatar_url && profile.avatar_url.trim() !== '') avatarUrl = profile.avatar_url;
    }

    const editPostId = document.getElementById('editing-community-post-id')?.value;

    if (editPostId) {
      const { error } = await client
        .from('community_insights')
        .update({
          scripture_ref: scriptureRef || 'General',
          insight: content
        })
        .eq('id', editPostId);

      if (error) throw error;
      alert("Your post has been updated successfully!");
    } else {
      const { error } = await client
        .from('community_insights')
        .insert([{
          user_id: session.user.id,
          user_name: displayName,
          avatar_url: avatarUrl,
          scripture_ref: scriptureRef || 'General',
          insight: content,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      alert("Your insight has been published successfully!");
    }

    closeNewPostModal();
    loadCommunityInsights();
  } catch (err) {
    alert("Failed to publish post: " + err.message);
  }
}

// ==========================================
// 7. PUSH NOTIFICATION OPT-IN
// ==========================================
function checkNotificationOptInState() {
  const isNative = window.Capacitor && window.Capacitor.isNativePlatform();

  // Native app: hide the card once permission is already granted
  if (isNative && window.Capacitor.Plugins.PushNotifications) {
    window.Capacitor.Plugins.PushNotifications.checkPermissions().then((status) => {
      if (status.receive === 'granted') {
        hideNotificationOptInCard();
      }
    });
    return;
  }

  // Browser/PWA fallback: use the old Web Notifications API
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    hideNotificationOptInCard();
  }
}

function hideNotificationOptInCard() {
  const notifCards = document.querySelectorAll('div');
  notifCards.forEach(card => {
    if (card.textContent.includes("Never Miss a Devotion") && card.textContent.includes("Enable Daily Notifications")) {
      card.style.display = 'none';
    }
  });
}

async function subscribeToPushNotifications() {
  const isNative = window.Capacitor && window.Capacitor.isNativePlatform();

  // Native app: request native push permission instead of the browser API
  if (isNative && window.Capacitor.Plugins.PushNotifications) {
    await setupPushNotifications();
    alert("Daily notifications enabled successfully!");
    checkNotificationOptInState();
    return;
  }

  // Browser/PWA fallback
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notifications.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    alert("Daily notifications enabled successfully!");
    new Notification("Stay Alive Fellowship", {
      body: "You are all set to receive daily devotion reminders.",
      icon: "/Banner images and logo/bible study logo.png"
    });
    checkNotificationOptInState();
  } else {
    alert("Notification permission was denied.");
  }
}
// ==========================================
// DAILY STREAK SYNC
// ==========================================
// Called once per app load, right after loadUserProfileAndStreak().
// Adds today's visit to the streak: +1 if they were here yesterday,
// resets to 1 if there was a gap, does nothing if already counted today.
async function syncDailyStreak() {
  const client = window.supabaseClient || window.supabase;
  if (!client) return;

  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

  const { data: profile, error: fetchError } = await client
    .from('profiles')
    .select('streak_count, last_active_date')
    .eq('id', session.user.id)
    .single();

  if (fetchError || !profile) return;

  // Already logged today — nothing to do
  if (profile.last_active_date === todayStr) return;

  let newStreak = 1; // default: gap in days, or first-ever visit
  if (profile.last_active_date) {
    const last = new Date(profile.last_active_date);
    const today = new Date(todayStr);
    const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newStreak = (profile.streak_count || 0) + 1; // consecutive day
    }
  }

  const { error: updateError } = await client
    .from('profiles')
    .update({ streak_count: newStreak, last_active_date: todayStr })
    .eq('id', session.user.id);

  if (!updateError) {
    const streakEl = document.getElementById('user-streak-counter');
    if (streakEl) streakEl.textContent = newStreak;
  }
}
// ==========================================
// PUSH NOTIFICATIONS (Capacitor native)
// ==========================================
// Call this once per app load, after the user is signed in.
// Registers the device for push notifications and saves the
// device token to Supabase so we know where to send pushes.
async function setupPushNotifications() {
  // Only runs inside the native Capacitor app, not in a regular browser
  if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return;

  const { PushNotifications } = window.Capacitor.Plugins;
  if (!PushNotifications) return;

  const client = window.supabaseClient || window.supabase;
  if (!client) return;

  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  // Ask permission
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  if (permStatus.receive !== 'granted') {
    console.log('Push notification permission denied');
    return;
  }

  // Register with FCM
  await PushNotifications.register();

  // When registration succeeds, save the token to Supabase
  PushNotifications.addListener('registration', async (token) => {
    console.log('Push registration token:', token.value);
    const { error } = await client
      .from('profiles')
      .update({ push_token: token.value })
      .eq('id', session.user.id);
    if (error) console.error('Failed to save push token:', error);
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration error:', err);
  });

  // Optional: log when a notification is tapped/received while app is open
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received:', notification);
  });
}
// ==========================================
// SCROLL PROGRESS BAR + BACK-TO-TOP BUTTON
// ==========================================
// Injects on every page automatically since global-offline.js
// already loads everywhere. Purely additive, no existing IDs touched.
function setupScrollPolish() {
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress-bar';
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px; width: 0%;
    background: #FACC15; z-index: 9999; transition: width 0.1s ease-out;
  `;
  document.body.appendChild(progressBar);

  const backToTop = document.createElement('button');
  backToTop.id = 'back-to-top-btn';
  backToTop.innerHTML = '&uarr;';
  backToTop.style.cssText = `
    position: fixed; bottom: 90px; right: 16px; width: 44px; height: 44px;
    border-radius: 9999px; background: rgba(250, 204, 21, 0.95); color: #000;
    font-size: 20px; font-weight: bold; border: none; z-index: 9998;
    box-shadow: 0 4px 14px rgba(0,0,0,0.35); opacity: 0; pointer-events: none;
    transition: opacity 0.25s ease, transform 0.25s ease; transform: scale(0.8);
    cursor: pointer;
  `;
  document.body.appendChild(backToTop);

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';

    if (scrollTop > 400) {
      backToTop.style.opacity = '1';
      backToTop.style.pointerEvents = 'auto';
      backToTop.style.transform = 'scale(1)';
    } else {
      backToTop.style.opacity = '0';
      backToTop.style.pointerEvents = 'none';
      backToTop.style.transform = 'scale(0.8)';
    }
  });
}

document.addEventListener('DOMContentLoaded', setupScrollPolish);

// ==========================================
// NATIVE APP EXTRAS: status bar, splash screen, haptics, share
// ==========================================
async function setupNativeAppExtras() {
  if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return;
  const { StatusBar, SplashScreen, CapacitorUpdater } = window.Capacitor.Plugins;

  // Show a friendly toast once a live update has finished downloading.
  // The update itself applies on the NEXT app restart automatically —
  // this just lets the user know something changed, so it doesn't feel invisible.
  if (CapacitorUpdater) {
    CapacitorUpdater.addListener('downloadComplete', (event) => {
      console.log('Live update downloaded:', event.bundle?.version);
      showUpdateToast('✨ App updated! Changes will appear next time you open it.');
    });
    CapacitorUpdater.addListener('updateFailed', (event) => {
      console.log('Live update failed:', event);
    });
  }

  // Tell Capgo the app is ready — this also confirms the update was
  // good (auto-rollback protection if this line never runs after an update)
  if (CapacitorUpdater) {
    try {
      await CapacitorUpdater.notifyAppReady();
    } catch (err) {
      console.log('CapacitorUpdater notifyAppReady skipped:', err);
    }
  }

  // Match the status bar to the app's dark/gold theme
  if (StatusBar) {
    try {
      await StatusBar.setBackgroundColor({ color: '#09090b' });
      await StatusBar.setStyle({ style: 'DARK' }); // light icons on dark background
    } catch (err) {
      console.log('StatusBar setup skipped:', err);
    }
  }

  // Hide the splash screen once the page is ready (Capacitor shows it automatically on launch)
  if (SplashScreen) {
    try {
      await SplashScreen.hide();
    } catch (err) {
      console.log('SplashScreen hide skipped:', err);
    }
  }
}

// Call this on any tappable element for a subtle native "tap" feel.
// Usage: <button onclick="hapticTap()">...</button>
async function hapticTap(style) {
  if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return;
  const { Haptics } = window.Capacitor.Plugins;
  if (!Haptics) return;
  try {
    await Haptics.impact({ style: style || 'LIGHT' });
  } catch (err) {
    // silently ignore on devices without haptics support
  }
}

// Share any piece of content (article, event, devotion) via the native share sheet.
// Usage: shareContent("Slow Fade - Sunday Bible Study", "Join us this Sunday...", "https://stay-alive-youth.vercel.app/events.html")
async function shareContent(title, text, url) {
  hapticTap('MEDIUM');

  if (window.Capacitor && window.Capacitor.isNativePlatform() && window.Capacitor.Plugins.Share) {
    try {
      await window.Capacitor.Plugins.Share.share({
        title: title || 'Stay Alive Fellowship',
        text: text || '',
        url: url || window.location.href,
        dialogTitle: 'Share with a friend'
      });
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
    return;
  }

  // Browser/PWA fallback: use the Web Share API if available, else copy link
  if (navigator.share) {
    navigator.share({ title, text, url: url || window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url || window.location.href);
    alert('Link copied to clipboard!');
  }
}

// Share an actual IMAGE (like an event poster) so it can be posted to
// WhatsApp Status or shared as a real picture, not just a text link.
// Usage: shareEventPoster("https://cdn.sanity.io/...jpg", "Slow Fade - Sunday Bible Study")
async function shareEventPoster(imageUrl, title) {
  hapticTap('MEDIUM');

  const isNative = window.Capacitor && window.Capacitor.isNativePlatform();
  const { Share, Filesystem } = isNative ? window.Capacitor.Plugins : {};

  if (isNative && Share && Filesystem && imageUrl) {
    try {
      // Download the poster image
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert to base64 so it can be written to the device's cache
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const fileName = `event-poster-${Date.now()}.jpg`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: 'CACHE'
      });

      await Share.share({
        title: title || 'Stay Alive Event',
        text: `Check out this event: ${title || ''} 🙌`,
        files: [savedFile.uri],
        dialogTitle: 'Share this event'
      });
    } catch (err) {
      console.log('Poster share failed, falling back to link share:', err);
      shareContent(title, 'Check out this event at Stay Alive Fellowship!', window.location.href);
    }
    return;
  }

  // Browser/PWA fallback: just share the link (can't share files from a normal browser easily)
  shareContent(title, 'Check out this event at Stay Alive Fellowship!', window.location.href);
}

// ==========================================
// GLOBAL SAFETY NET
// ==========================================
// Catches unexpected JS errors so the app never shows a silent blank
// screen. Doesn't change any existing behavior — just shows a friendly
// recovery message in the rare case something genuinely breaks.
window.addEventListener('error', function (event) {
  console.error('Unhandled error caught by safety net:', event.error || event.message);
  showSafetyNetBanner();
});

window.addEventListener('unhandledrejection', function (event) {
  console.error('Unhandled promise rejection caught by safety net:', event.reason);
});

let safetyNetShown = false;
function showSafetyNetBanner() {
  if (safetyNetShown) return; // only show once per page load, don't spam
  safetyNetShown = true;

  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed; bottom: 90px; left: 16px; right: 16px; z-index: 9997;
    background: #1c1c1e; border: 1px solid #FACC15; border-radius: 14px;
    padding: 14px 16px; color: #fff; font-size: 13px; font-family: sans-serif;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: flex;
    align-items: center; justify-content: space-between; gap: 12px;
  `;
  banner.innerHTML = `
    <span>Something didn't load quite right. Try refreshing.</span>
    <button style="background:#FACC15;color:#000;border:none;border-radius:8px;padding:6px 12px;font-weight:bold;font-size:12px;cursor:pointer;flex-shrink:0;" onclick="window.location.reload()">Refresh</button>
  `;
  document.body.appendChild(banner);
}

// ==========================================
// AUTOMATIC IMAGE LAZY LOADING (performance)
// ==========================================
// Since most images (devotion photos, event posters, article banners)
// are injected dynamically after fetching from Sanity, this watches
// the page for new <img> elements and marks them for lazy loading —
// meaning images below the fold only load once the user scrolls near
// them, instead of every image loading immediately on page open.
function setupLazyImageLoading() {
  function tagImage(img) {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  }

  // Tag any images already on the page
  document.querySelectorAll('img').forEach(tagImage);

  // Watch for images added later (e.g. after Sanity content loads)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return; // only element nodes
        if (node.tagName === 'IMG') tagImage(node);
        if (node.querySelectorAll) {
          node.querySelectorAll('img').forEach(tagImage);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', setupLazyImageLoading);

// ==========================================
// AMBIENT BOKEH BACKGROUND (decorative, on-brand)
// ==========================================
// Adds soft, blurred glowing shapes behind all content, fixed in
// place so they don't move with scroll. Purely decorative — sits
// behind everything, never interferes with taps or content.
function setupBokehBackground() {
  if (document.getElementById('bokeh-bg')) return; // don't duplicate

  const bokeh = document.createElement('div');
  bokeh.id = 'bokeh-bg';
  bokeh.setAttribute('aria-hidden', 'true');
  bokeh.innerHTML = `
    <div class="bokeh-blob bokeh-1"></div>
    <div class="bokeh-blob bokeh-2"></div>
    <div class="bokeh-blob bokeh-3"></div>
  `;
  document.body.prepend(bokeh);
}

document.addEventListener('DOMContentLoaded', setupBokehBackground);

// ==========================================
// UPDATE NOTIFICATION TOAST
// ==========================================
// Small, friendly banner shown once when a live update finishes
// downloading in the background — reuses the same visual style as
// the safety-net banner, so it feels consistent.
function showUpdateToast(message) {
  // Don't stack multiple toasts if one is already showing
  if (document.getElementById('ota-update-toast')) return;

  const toast = document.createElement('div');
  toast.id = 'ota-update-toast';
  toast.style.cssText = `
    position: fixed; bottom: 90px; left: 16px; right: 16px; z-index: 9996;
    background: #1c1c1e; border: 1px solid #22c55e; border-radius: 14px;
    padding: 14px 16px; color: #fff; font-size: 13px; font-family: sans-serif;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: flex;
    align-items: center; justify-content: space-between; gap: 12px;
  `;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:#22c55e;color:#000;border:none;border-radius:8px;padding:6px 12px;font-weight:bold;font-size:12px;cursor:pointer;flex-shrink:0;" onclick="this.parentElement.remove()">Got it</button>
  `;
  document.body.appendChild(toast);
  // No auto-dismiss — stays visible until the person taps "Got it"
  // or closes/reopens the app.
}