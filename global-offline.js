// ==========================================
// UNIFIED GLOBAL SCRIPT - COMPLETE CODE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
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

  // Instantly load local notes so UI never hangs on "Loading notes..."
  loadLocalNotebooks();
  
  // Check cloud auth in background
  checkNotebookAuthMode();
});

// ==========================================
// 1. COMPREHENSIVE GREEK & HEBREW LEXICON DICTIONARY
// ==========================================
const lexiconDictionary = {
  // Greek New Testament Roots
  "agape": { original: "ἀγάπη (G26)", meaning: "Unconditional, sacrificial, divine love exercised intentionally as an act of will." },
  "phileo": { original: "φιλέω (G5368)", meaning: "Brotherly affection, tender regard, and warm interpersonal friendship." },
  "logos": { original: "λόγος (G3056)", meaning: "Word, divine expression, reason, or calculation manifesting God's mind and intent." },
  "pisteuo": { original: "πιστεύω (G4100)", meaning: "To entrust oneself, rely upon, have active faith, loyalty, and conviction." },
  "sozo": { original: "σῴζω (G4982)", meaning: "To save, keep safe, rescue from danger, heal, preserve, and deliver." },
  "charis": { original: "χάρις (G5485)", meaning: "Grace, unmerited favor, loving-kindness, and divine enablement." },
  "zoe": { original: "ζωή (G2222)", meaning: "Life in the absolute sense, divine spiritual life as opposed to mere physical existence." },
  "pneuma": { original: "πνεῦμα (G4151)", meaning: "Spirit, breath, wind, or the immaterial rational soul energized by God." },
  "metanoia": { original: "μετάνοια (G3341)", meaning: "A change of mind, turning away from sin, and a total turnaround in direction." },
  "dikaiosyne": { original: "δικαιοσύνη (G1343)", meaning: "Righteousness, justice, uprightness, and acting in accord with God's standard." },

  // Hebrew Old Testament Roots
  "chesed": { original: "חֶסֶד (H2617)", meaning: "Steadfast covenant love, loyalty, mercy, faithfulness, and lovingkindness." },
  "shalom": { original: "שָׁלוֹם (H7965)", meaning: "Completeness, wholeness, peace, safety, health, and holistic flourishing." },
  "yada": { original: "יָדַע (H3045)", meaning: "To know intimately through direct experience, observation, and personal relationship." },
  "nephesh": { original: "נֶפֶשׁ (H5315)", meaning: "Soul, living being, life, self, personhood, or deep inner desire." },
  "baruch": { original: "בָּרוּךְ (H1288)", meaning: "Blessed, praised, or invoked with divine favor and power for prosperity." },
  "tsedaqah": { original: "צְדָקָה (H6666)", meaning: "Moral righteousness, ethical justice, and right-living in community." },

  // Biblical Books / General Context Fallbacks
  "john": { original: "Ἰωάννης / Gospel Context", meaning: "Emphasizes the eternal pre-existence and deity of Christ as the incarnate Word (Logos)." },
  "romans": { original: "Ῥωμαῖος / Pauline Epistle", meaning: "A systematic exposition of justification by grace through faith and God's righteousness." },
  "genesis": { original: "בְּרֵאשִׁית / Torah Context", meaning: "The book of beginnings, addressing creation, covenant, and the origin of redemptive history." },
  "james": { original: "Ἰάκωβος / General Epistle", meaning: "Emphasizes practical Christian living, authentic active faith, trials, and ethical consistency." }
};

function inspectLexiconTerm(termKey) {
  if (!termKey) return;
  
  const cleanKey = termKey.toLowerCase().replace(/[^a-z]/g, '');
  let entry = lexiconDictionary[cleanKey];
  
  if (!entry) {
    const matchedKey = Object.keys(lexiconDictionary).find(k => cleanKey.includes(k));
    if (matchedKey) {
      entry = lexiconDictionary[matchedKey];
    } else {
      entry = { 
        original: `Original Language Study: "${termKey}"`, 
        meaning: "Examine this text through its historical framework, authorial intent, grammar, and broader redemptive narrative context." 
      };
    }
  }

  const modalBox = document.getElementById('lexicon-inspect-box');
  if (modalBox) {
    modalBox.innerHTML = `
      <div class="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-1.5 mt-3 text-left shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Original Language & Lexicon Tool</span>
          <button onclick="document.getElementById('lexicon-inspect-box').innerHTML=''" class="text-[10px] text-zinc-500 hover:text-white cursor-pointer">✕ Close</button>
        </div>
        <h5 class="text-xs font-bold text-white">${entry.original}</h5>
        <p class="text-[11px] text-zinc-300 leading-relaxed">${entry.meaning}</p>
      </div>
    `;
  }
}

// ==========================================
// 2. UNIVERSAL BIBLE SEARCH (ANY VERSE/PASSAGE)
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

  if (cachedPassage) {
    renderPassageResult(textEl, query, cachedPassage, true);
    return;
  }

  if (!navigator.onLine) {
    textEl.innerHTML = `
      <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
        <p class="font-bold">You are offline and this passage is not cached.</p>
        <p class="text-zinc-400">Connect to the internet once to search and cache new passages.</p>
      </div>
    `;
    return;
  }

  textEl.innerHTML = `<p class="text-zinc-500 animate-pulse text-sm">Fetching scripture passage...</p>`;

  try {
    const encodedRef = encodeURIComponent(query);
    const res = await fetch(`https://bible-api.com/${encodedRef}`);

    if (!res.ok) throw new Error(`Passage not found`);
    const data = await res.json();

    if (data.text) {
      const passageText = data.text.trim();
      localStorage.setItem(cacheKey, passageText);
      renderPassageResult(textEl, query, passageText, false);
    } else {
      throw new Error('Passage not found');
    }
  } catch (err) {
    textEl.innerHTML = `
      <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2 text-zinc-300">
        <p class="text-amber-400 font-bold">⚠️ Reference Not Found</p>
        <p>Could not fetch "${query}". Check your spelling or explore the original context:</p>
        <div class="pt-2">
          <button onclick="inspectLexiconTerm('${query}')" class="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30 cursor-pointer">
            🔍 Inspect Original Context & Meaning
          </button>
        </div>
      </div>
      <div id="lexicon-inspect-box"></div>
    `;
  }
}

function renderPassageResult(containerEl, queryRef, passageText, isOfflineCached) {
  // Automatically scan and highlight known theological/lexicon words inside the verse text
  let formattedText = passageText;
  const searchableWords = Object.keys(lexiconDictionary);
  
  searchableWords.forEach(word => {
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    formattedText = formattedText.replace(regex, `<span onclick="inspectLexiconTerm('$1')" class="text-amber-400 underline decoration-amber-500/40 cursor-pointer font-medium hover:text-amber-300" title="Tap to inspect original language">$1</span>`);
  });

  containerEl.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md ${isOfflineCached ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}">
        ${isOfflineCached ? '⚡ Read Offline (Cached)' : '🌐 Live Online'}
      </span>
      <button onclick="saveCachedPassageToNotes('${queryRef}')" class="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer">
        + Send to Notebook
      </button>
    </div>
    <p class="text-[10px] text-zinc-500 italic mb-2">💡 Tap any highlighted word in the text below to view its original language background.</p>
    <div class="whitespace-pre-line text-zinc-200 text-sm leading-relaxed">${formattedText}</div>
    <div class="mt-4 pt-3 border-t border-zinc-800">
      <button onclick="inspectLexiconTerm('${queryRef}')" class="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer">
        📖 Explore Full Passage Background & Context
      </button>
      <div id="lexicon-inspect-box"></div>
    </div>
  `;
}

function saveCachedPassageToNotes(ref) {
  const cacheKey = `stay_alive_passage_${ref.toLowerCase().replace(/\s+/g, '_')}`;
  const passageText = localStorage.getItem(cacheKey) || ref;

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
  if (!client) return;

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
      setGuestModeUI(syncBtn, indicator);
    }
  } catch (e) {
    setGuestModeUI(syncBtn, indicator);
  }
}

function setGuestModeUI(syncBtn, indicator) {
  if (indicator) {
    indicator.textContent = 'Guest Mode (Local)';
    indicator.className = 'px-3 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20';
  }
  const localNotes = JSON.parse(localStorage.getItem('stay_alive_local_notes') || '[]');
  if (localNotes.length > 0 && syncBtn) {
    syncBtn.classList.remove('hidden');
  }
}

// ==========================================
// 4. NOTEBOOK STORAGE, RENDERING & DELETION
// ==========================================
async function saveSessionNotebookEntry() {
  const leaderRef = document.getElementById('leader-scripture-ref-input')?.value.trim() || '';
  const leaderText = document.getElementById('leader-scripture-text-input')?.value.trim() || '';
  const scriptureRef = document.getElementById('note-scripture-input')?.value.trim() || '';
  const notesContent = document.getElementById('note-content-input')?.value.trim() || '';
  const imageInput = document.getElementById('note-image-input');

  if (!notesContent && !leaderText && !scriptureRef) {
    alert('Please write something in your notes or scripture section before saving.');
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

  if (session && imageInput && imageInput.files && imageInput.files[0] && navigator.onLine) {
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
  } else if (imageInput && imageInput.files && imageInput.files[0]) {
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

  const localNotes = JSON.parse(localStorage.getItem('stay_alive_local_notes') || '[]');
  localNotes.unshift(newEntry);
  localStorage.setItem('stay_alive_local_notes', JSON.stringify(localNotes));
  loadLocalNotebooks();

  if (session && navigator.onLine) {
    client.from('session_notebook').insert([{
      user_id: session.user.id,
      leader_ref: newEntry.leader_ref,
      leader_text: newEntry.leader_text,
      scripture_ref: newEntry.scripture_ref,
      notes_content: newEntry.notes_content,
      image_url: newEntry.image_url,
      session_date: newEntry.session_date
    }]).then(({ error }) => {
      if (!error) loadCloudNotebooks(session.user.id);
    });
  }

  alert('Study note saved successfully!');
  if (document.getElementById('leader-scripture-ref-input')) document.getElementById('leader-scripture-ref-input').value = '';
  if (document.getElementById('leader-scripture-text-input')) document.getElementById('leader-scripture-text-input').value = '';
  if (document.getElementById('note-scripture-input')) document.getElementById('note-scripture-input').value = '';
  if (document.getElementById('note-content-input')) document.getElementById('note-content-input').value = '';
  if (imageInput) imageInput.value = '';
}

function loadLocalNotebooks() {
  const container = document.getElementById('saved-notebooks-container');
  if (!container) return;

  const localNotes = JSON.parse(localStorage.getItem('stay_alive_local_notes') || '[]');
  if (localNotes.length === 0) {
    container.innerHTML = `<p class="text-xs text-zinc-500 text-center py-4">No session archives saved yet. Fill out the notebook above to record your takeaways!</p>`;
    return;
  }

  renderNotebookItems(localNotes, container, true);
}

async function loadCloudNotebooks(userId) {
  const container = document.getElementById('saved-notebooks-container');
  if (!container || !navigator.onLine) return;

  const client = window.supabaseClient || window.supabase;
  if (!client) return;

  try {
    const { data, error } = await client
      .from('session_notebook')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      renderNotebookItems(data, container, false);
    }
  } catch (err) {}
}

function renderNotebookItems(items, container, isLocal) {
  container.innerHTML = items.map(item => `
    <div class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 relative group">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-emerald-400">${item.scripture_ref || 'Reflection'}</span>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-zinc-500">${item.session_date || ''} ${isLocal ? '(Local)' : ''}</span>
          <button onclick="deleteNotebookEntry('${item.id}', ${isLocal})" class="text-[10px] text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 cursor-pointer">
            🗑️ Delete
          </button>
        </div>
      </div>
      ${item.leader_text ? `
        <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
          <span class="text-[9px] font-bold uppercase tracking-wider text-amber-400">Leader Focus: ${item.leader_ref || ''}</span>
          <p class="text-xs text-zinc-300 italic">"${item.leader_text}"</p>
        </div>
      ` : ''}
      <p class="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">${item.notes_content || ''}</p>
      ${item.image_url ? `<img src="${item.image_url}" class="w-full h-32 object-cover rounded-lg border border-zinc-800 mt-2">` : ''}
    </div>
  `).join('');
}

async function deleteNotebookEntry(id, isLocal) {
  if (!confirm('Are you sure you want to delete this session archive?')) return;

  if (isLocal) {
    let localNotes = JSON.parse(localStorage.getItem('stay_alive_local_notes') || '[]');
    localNotes = localNotes.filter(n => n.id !== id);
    localStorage.setItem('stay_alive_local_notes', JSON.stringify(localNotes));
    loadLocalNotebooks();
  } else {
    const client = window.supabaseClient || window.supabase;
    if (client) {
      await client.from('session_notebook').delete().eq('id', id);
      const { data: { session } } = await client.auth.getSession();
      if (session) loadCloudNotebooks(session.user.id);
      else loadLocalNotebooks();
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