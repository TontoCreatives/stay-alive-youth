// ==========================================
// 1. SUPABASE CONFIGURATION & AUTH CONTROLLER
// ==========================================
const SUPABASE_URL = 'https://wgziqhahopomiyzvcvxd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4_Tb-2FKevFc-YE42kTqyw_eod0wy_R';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

document.addEventListener("DOMContentLoaded", () => {
  // Inject Global Header with Active Online Indicator
  const headerHTML = `
    <header class="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <a href="/" class="flex items-center gap-2">
        <img src="/Banner images and logo/bible%20study%20logo.png" alt="Logo" class="w-8 h-8 rounded-lg object-cover">
        <div>
          <h1 class="text-white text-xs font-bold tracking-wider">STAY ALIVE</h1>
          <p class="text-[10px] text-zinc-400">BIBLE STUDY</p>
        </div>
      </a>
      <div class="flex items-center gap-3">
        <!-- Live Online Counter Badge -->
        <div id="online-counter-badge" class="hidden sm:inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-xs text-zinc-300 shadow-lg">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span id="online-count-text">0 Online</span>
        </div>
        <div id="streak-badge" class="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-300 shadow-lg">
          <svg class="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 24 24">
            <path d="M17.56 10.59c-.83-.82-1.5-1.74-2-2.73-.55-1.04-.8-2.14-.95-3.26-.05-.4-.42-.7-.83-.7-.41 0-.78.3-.83.7-.22 1.62-.77 3.19-1.63 4.59-.86 1.4-2 2.6-3.4 3.52C6.34 13.92 6 14.85 6 15.82c0 2.21 1.79 4 4 4s4-1.79 4-4c0-.75-.2-1.48-.59-2.11l2.15-3.12z"/>
          </svg>
          <span><strong id="streak-count" class="text-white">0</strong>-Day Streak</span>
        </div>
        <button onclick="openProfileModal()" id="header-avatar-btn" class="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-sm overflow-hidden hover:border-emerald-500 transition-all shadow-lg focus:outline-none cursor-pointer">
          <span id="header-avatar-initial">👤</span>
        </button>
      </div>
    </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // Inject Floating WhatsApp-style Profile Encouragement Bubble
  const floatingHTML = `
    <div id="floating-encouragement" class="fixed top-20 right-4 z-40 max-w-xs bg-zinc-900/90 border border-zinc-800/80 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md hidden transition-all">
      <div class="flex items-start space-x-3">
        <div id="floating-avatar-container" class="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden shrink-0 shadow-inner mt-0.5">U</div>
        <div class="overflow-hidden space-y-1">
          <div class="flex items-center gap-1.5">
            <h4 id="floating-name" class="text-[10px] font-bold text-emerald-400 truncate">Encouragement</h4>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p id="floating-verse" class="text-xs font-semibold text-white truncate"></p>
          <p id="floating-note" class="text-[11px] text-zinc-300 italic line-clamp-2"></p>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', floatingHTML);

  // Inject Profile Modal Overlay with Privacy Toggle & Encouragement Fields
  const modalHTML = `
    <div id="profile-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div class="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <button onclick="closeProfileModal()" class="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-all cursor-pointer">
          ✕
        </button>
        <div class="mb-5">
          <h3 class="text-white font-bold text-lg">Account & Progress</h3>
          <p class="text-xs text-zinc-400">Manage your profile and sync your devotions.</p>
        </div>

        <!-- Logged Out View -->
        <div id="modal-logged-out" class="text-center py-6">
          <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-zinc-800 flex items-center justify-center text-amber-400 font-bold text-lg border border-zinc-700">✨</div>
          <h4 class="text-white font-bold text-sm mb-1">Your Personal Sanctuary</h4>
          <p class="text-xs text-zinc-400 mb-6 leading-relaxed">Sign in to track reading streaks and connect with the community.</p>
          <button onclick="loginWithSupabase()" class="w-full py-3 px-4 bg-white text-zinc-950 font-semibold rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all text-sm shadow-lg cursor-pointer">
            Continue with Google
          </button>
        </div>

        <!-- Logged In View -->
        <div id="modal-logged-in" class="hidden space-y-3.5">
          <div class="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <div id="modal-user-avatar" class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">U</div>
            <div class="overflow-hidden">
              <h4 id="modal-user-name" class="text-white text-sm font-bold truncate">Believer</h4>
              <p id="modal-user-email" class="text-xs text-zinc-400 truncate">user@example.com</p>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-0.5">Reading Streak</p>
              <p class="text-base font-black text-white"><span id="modal-streak-display">0</span> Days 🔥</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active Sync</span>
          </div>

          <div class="space-y-1.5">
            <label class="block text-[11px] font-medium text-zinc-400">Display Name</label>
            <input type="text" id="modal-name-input" class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500">
          </div>

          <div class="space-y-1.5">
            <label class="block text-[11px] font-medium text-zinc-400">Favorite Verse Reference</label>
            <input type="text" id="modal-verse-input" placeholder="e.g. Hebrews 10:23" class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500">
          </div>

          <div class="space-y-1.5">
            <label class="block text-[11px] font-medium text-zinc-400">Personal Encouragement / Hope Note</label>
            <textarea id="modal-note-input" rows="2" placeholder="e.g. God is faithful through every season..." class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"></textarea>
          </div>

          <!-- Privacy Toggle for Online Presence -->
          <div class="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <p class="text-xs font-medium text-white">Show Online Presence</p>
              <p class="text-[10px] text-zinc-400">Let others see when you're online</p>
            </div>
            <input type="checkbox" id="modal-privacy-toggle" class="w-4 h-4 accent-emerald-500 rounded cursor-pointer">
          </div>

          <div class="flex gap-2 pt-1">
            <button onclick="saveProfileChanges()" class="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs hover:bg-emerald-500 transition-all cursor-pointer shadow-lg">Save Changes</button>
            <button onclick="clearEncouragementData()" class="px-3 py-2.5 bg-zinc-800 text-red-400 hover:text-red-300 font-medium rounded-xl text-xs transition-all cursor-pointer border border-zinc-700">Clear</button>
          </div>

          <button onclick="logoutFromSupabase()" class="w-full py-2 px-4 bg-zinc-800/40 text-zinc-400 font-medium rounded-xl hover:bg-zinc-800 hover:text-white transition-all text-xs border border-zinc-800/80 cursor-pointer">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Close modal event listener
  const modalEl = document.getElementById('profile-modal');
  if (modalEl) {
    modalEl.addEventListener('click', (e) => {
      if (e.target.id === 'profile-modal') closeProfileModal();
    });
  }

  // Initialize Auth & Presence
  if (supabaseClient) {
    initAuthSession();
  }
});

// Modal Controls
function openProfileModal() {
  document.getElementById('profile-modal')?.classList.remove('hidden');
}

function closeProfileModal() {
  document.getElementById('profile-modal')?.classList.add('hidden');
}

// Supabase Session Logic & Presence Tracker
async function initAuthSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  updateAuthUI(session);

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    updateAuthUI(session);
  });
}

function updateAuthUI(session) {
  const loggedOutView = document.getElementById('modal-logged-out');
  const loggedInView = document.getElementById('modal-logged-in');
  const headerAvatarInitial = document.getElementById('header-avatar-initial');
  
  if (session) {
    loggedOutView?.classList.add('hidden');
    loggedInView?.classList.remove('hidden');
    
    const user = session.user;
    const email = user.email || '';
    const metadata = user.user_metadata || {};
    const displayName = metadata.full_name || email.split('@')[0];
    const avatarUrl = metadata.avatar_url;

    document.getElementById('modal-user-email').textContent = email;
    document.getElementById('modal-user-name').textContent = displayName;
    document.getElementById('modal-name-input').value = displayName;

    const modalAvatar = document.getElementById('modal-user-avatar');
    if (avatarUrl) {
      modalAvatar.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="w-full h-full object-cover">`;
    } else {
      modalAvatar.textContent = displayName.charAt(0).toUpperCase();
    }

    if (headerAvatarInitial) {
      if (avatarUrl) {
        headerAvatarInitial.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="w-full h-full object-cover">`;
      } else {
        headerAvatarInitial.textContent = displayName.charAt(0).toUpperCase();
      }
    }

    fetchUserProfileData(user.id, displayName, avatarUrl);
  } else {
    loggedOutView?.classList.remove('hidden');
    loggedInView?.classList.add('hidden');
    if (headerAvatarInitial) headerAvatarInitial.textContent = '👤';
  }
}

async function fetchUserProfileData(userId, displayName, avatarUrl) {
  if (!supabaseClient || !userId) return;

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('streak_count, favorite_verse, encouragement_note, full_name, avatar_url, show_online_status')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Profile table entry missing or not initialized yet:', error.message);
      return;
    }

    if (data) {
      const streakValue = data.streak_count || 0;
      
      const streakCountEl = document.getElementById('streak-count');
      if (streakCountEl) streakCountEl.textContent = streakValue;

      const modalStreakEl = document.getElementById('modal-streak-display');
      if (modalStreakEl) modalStreakEl.textContent = streakValue;

      const verseInput = document.getElementById('modal-verse-input');
      const noteInput = document.getElementById('modal-note-input');
      const privacyToggle = document.getElementById('modal-privacy-toggle');
      const floatingCard = document.getElementById('floating-encouragement');

      if (verseInput) verseInput.value = data.favorite_verse || '';
      if (noteInput) noteInput.value = data.encouragement_note || '';
      if (privacyToggle) privacyToggle.checked = data.show_online_status ?? true;

      if ((data.favorite_verse && data.favorite_verse.trim() !== "") || (data.encouragement_note && data.encouragement_note.trim() !== "")) {
        document.getElementById('floating-name').textContent = data.full_name || 'Encouragement';
        document.getElementById('floating-verse').textContent = data.favorite_verse ? `📖 ${data.favorite_verse}` : '';
        document.getElementById('floating-note').textContent = data.encouragement_note ? `"${data.encouragement_note}"` : '';
        
        const floatingAvatarContainer = document.getElementById('floating-avatar-container');
        if (data.avatar_url) {
          floatingAvatarContainer.innerHTML = `<img src="${data.avatar_url}" alt="Avatar" class="w-full h-full object-cover">`;
        } else {
          floatingAvatarContainer.textContent = (data.full_name || 'U').charAt(0).toUpperCase();
        }

        floatingCard?.classList.remove('hidden');
      } else {
        floatingCard?.classList.add('hidden');
      }

      // Initialize Presence Tracking if allowed
      if (data.show_online_status !== false) {
        initPresenceChannel(userId, displayName, avatarUrl);
      }
    }
  } catch (err) {
    console.error('Error fetching user profile data:', err);
  }
}

// Supabase Realtime Presence Channel for Online Counter
function initPresenceChannel(userId, name, avatar) {
  const channel = supabaseClient.channel('online-believers', {
    config: { presence: { key: userId } }
  });

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ name, avatar, online_at: new Date().toISOString() });
    }
  });

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    const count = Object.keys(state).length;
    const badge = document.getElementById('online-counter-badge');
    const text = document.getElementById('online-count-text');
    if (text) text.textContent = `${count} Online`;
    if (badge) badge.classList.remove('hidden');
  });
}

async function loginWithSupabase() {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) alert('Error logging in: ' + error.message);
}

async function logoutFromSupabase() {
  await supabaseClient.auth.signOut();
  window.location.reload();
}

async function saveProfileChanges() {
  const newName = document.getElementById('modal-name-input').value.trim();
  const newVerse = document.getElementById('modal-verse-input').value.trim();
  const newNote = document.getElementById('modal-note-input').value.trim();
  const showOnline = document.getElementById('modal-privacy-toggle').checked;
  
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session || !supabaseClient) return;

  const userId = session.user.id;

  await supabaseClient.auth.updateUser({ data: { full_name: newName } });

  const { error } = await supabaseClient
    .from('profiles')
    .upsert({ 
      id: userId, 
      full_name: newName, 
      favorite_verse: newVerse,
      encouragement_note: newNote,
      show_online_status: showOnline,
      updated_at: new Date()
    });

  if (error) {
    alert('Failed to update profile: ' + error.message);
  } else {
    alert('Profile updated successfully!');
    document.getElementById('modal-user-name').textContent = newName;
    closeProfileModal();
    window.location.reload(); // Refresh to apply presence settings instantly
  }
}

async function clearEncouragementData() {
  document.getElementById('modal-verse-input').value = '';
  document.getElementById('modal-note-input').value = '';
  
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session || !supabaseClient) return;

  const { error } = await supabaseClient
    .from('profiles')
    .upsert({ 
      id: session.user.id, 
      favorite_verse: '',
      encouragement_note: '',
      updated_at: new Date()
    });

  if (error) {
    alert('Failed to clear encouragement: ' + error.message);
  } else {
    document.getElementById('floating-encouragement')?.classList.add('hidden');
    alert('Encouragement cleared!');
    closeProfileModal();
  }
}