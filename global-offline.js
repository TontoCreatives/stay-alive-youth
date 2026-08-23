// ==========================================
// GLOBAL SCRIPT - COMPLETE IMPLEMENTATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject Header into every page automatically
  injectGlobalHeader();

  const dateEl = document.getElementById('current-study-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Hook up Scripture Search Form
  const bibleForm = document.getElementById('bible-form');
  if (bibleForm) {
    bibleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await searchScripturePassage();
    });
  }

  // Initialize features
  checkNotebookAuthMode();
  loadUserProfileAndStreak();
  loadCommunityInsights();
});

// ==========================================
// 0. HEADER INJECTION & PROFILE INTERACTION
// ==========================================
function injectGlobalHeader() {
  if (document.querySelector('header')) return; // Don't duplicate if already hardcoded

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
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
          <span class="text-amber-400 font-bold" id="user-streak-counter">0</span>
          <span class="text-[10px] text-zinc-400">Day Streak</span>
        </div>
        <button onclick="handleProfileClick()" class="cursor-pointer focus:outline-none" title="Account & Profile">
          <img id="user-profile-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest" alt="Profile" class="w-8 h-8 rounded-full object-cover border border-zinc-700 bg-zinc-800">
        </button>
      </div>
    </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

function handleProfileClick() {
  const client = window.supabaseClient || window.supabase;
  if (client) {
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const action = confirm(`Logged in as: ${session.user.email}\nWould you like to log out?`);
        if (action) {
          client.auth.signOut().then(() => {
            alert("Logged out successfully.");
            window.location.reload();
          });
        }
      } else {
        window.location.href = '/login.html';
      }
    }).catch(() => {
      window.location.href = '/login.html';
    });
  } else {
    window.location.href = '/login.html';
  }
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
  container.innerHTML = items.map(item => `
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
        <span class="text-[10px] text-zinc-500">${item.session_date} ${isLocal ? '(Local)' : ''}</span>
      </div>
      <p class="text-xs text-zinc-300 leading-relaxed">${item.notes_content}</p>
      ${item.image_url ? `<img src="${item.image_url}" class="w-full h-32 object-cover rounded-lg border border-zinc-800 mt-2">` : ''}
    </div>
  `).join('');
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

  if (!client) return;

  try {
    const { data: { session } } = await client.auth.getSession();
    if (!session) return;

    const { data: profile } = await client
      .from('profiles')
      .select('streak_count, avatar_url')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      if (streakEl && profile.streak_count !== undefined) {
        streakEl.textContent = profile.streak_count;
      }
      if (avatarEl && profile.avatar_url) {
        avatarEl.src = profile.avatar_url;
      }
    }
  } catch (err) {
    console.log("Profile streak sync check skipped.");
  }
}

// ==========================================
// 6. COMMUNITY FELLOWSHIP & MODAL LOGIC
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
    const { data, error } = await client
      .from('community_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      container.innerHTML = `<p class="text-xs text-zinc-500 text-center py-4">No community insights shared yet.</p>`;
      return;
    }

    container.innerHTML = data.map(item => `
      <div class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-emerald-400">${item.scripture_ref || 'Fellowship Insight'}</span>
          <span class="text-[10px] text-zinc-500">${new Date(item.created_at).toLocaleDateString()}</span>
        </div>
        <p class="text-xs text-zinc-300 leading-relaxed">${item.content}</p>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="text-xs text-zinc-500 text-center py-4">Unable to load community feed.</p>`;
  }
}

function openNewPostModal() {
  const modal = document.getElementById('post-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeNewPostModal() {
  const modal = document.getElementById('post-modal');
  if (modal) modal.classList.add('hidden');
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

    const { error } = await client
      .from('community_insights')
      .insert([{
        user_id: session.user.id,
        scripture_ref: scriptureRef || 'General Fellowship',
        content: content,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    alert("Your insight has been published successfully!");
    if (verseInput) verseInput.value = '';
    if (textInput) textInput.value = '';
    closeNewPostModal();
    loadCommunityInsights();
  } catch (err) {
    alert("Failed to publish post: " + err.message);
  }
}

// ==========================================
// 7. PUSH NOTIFICATION OPT-IN
// ==========================================
async function subscribeToPushNotifications() {
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
  } else {
    alert("Notification permission was denied.");
  }
}