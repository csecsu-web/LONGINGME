// Longingme — app.js
(function () {
    'use strict';

    const SUPABASE_URL = 'https://hapkolokdrzwprilmpce.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_V_zCthxiaKw9jBam5Ztjgg_8SRaG8rj';
    const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const PRIVATE_KEY = 'longingme_private';
    let selectedTag  = '';
    let activeFilter = '';
    let wallOffset   = 0;
    const PAGE_SIZE  = 10;

    const dailyPrompts = [
        "What feels heavier than it looks?",
        "What would you say if no one could judge you?",
        "What have you been carrying alone?",
        "What does it feel like right now, in your body?",
        "What do you wish someone understood about you?",
        "What are you pretending is okay?",
        "What would you tell yourself from a year ago?",
        "What do you keep almost saying?",
        "What does tired feel like for you?",
        "What would it mean to let yourself rest?"
    ];

    const dangerousPatterns = [
        /\b(\d+)\s*(pills?|tablets?|capsules?)\b/i,
        /\b(\d+)\s*(cuts?|slashes?)\b/i,
        /\b(\d+)\s*(lbs?|kg|pounds?|kilos?)\b/i,
        /\b(\d+)\s*(calories?|cal)\b/i,
        /\bhow\s+to\s+(kill|hurt|harm|cut|overdose)/i,
        /\byou\s+should\s+(kill|hurt|harm)\s+yourself/i,
    ];
    const crisisPatterns = [
        /\b(want|going|plan|planning)\s+to\s+(die|kill\s+myself|end\s+it)\b/i,
        /\bsuicide\s+(plan|attempt|note)\b/i,
        /\bcan'?t\s+live\s+anymore\b/i,
        /\bno\s+reason\s+to\s+(live|continue|go\s+on)\b/i
    ];

    const $ = id => document.getElementById(id);
    const $$ = sel => document.querySelectorAll(sel);

    function init() {
        setDailyPrompt();
        setupNavigation();
        setupWritePage();
        setupReadPage();
        loadPrivateEntries();
        setTimeout(() => switchScreen('home-screen'), 900);
    }

    function setDailyPrompt() {
        const idx = new Date().getDate() % dailyPrompts.length;
        const el = $('daily-prompt-text');
        if (el) el.textContent = dailyPrompts[idx];
    }

    function setupNavigation() {
        document.addEventListener('click', e => {
            const target = e.target.closest('[data-page]');
            if (!target) return;
            const page = target.dataset.page;
            switchScreen(page);
            if (page === 'read-page') loadWall(true);
        });
    }

    function switchScreen(id) {
        $$('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
        const el = $(id);
        if (el) { el.style.display = 'block'; requestAnimationFrame(() => el.classList.add('active')); }
        window.scrollTo(0, 0);
    }

    function setupWritePage() {
        const textarea  = $('entry-input');
        const charCount = $('write-char-count');
        const saveBtn   = $('save-private-btn');
        const shareBtn  = $('share-anon-btn');
        const confirm   = $('write-confirmation');
        const againBtn  = $('write-again-btn');

        $$('.etag').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.etag').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTag = btn.dataset.tag;
            });
        });

        textarea.addEventListener('input', () => {
            const len = textarea.value.length;
            charCount.textContent = `${len} / 1000`;
            saveBtn.disabled  = len === 0;
            shareBtn.disabled = len === 0;
        });

        saveBtn.addEventListener('click', () => {
            const text = textarea.value.trim();
            if (!text) return;
            if (!isSafe(text)) { showCrisis(); return; }
            savePrivate(text);
            resetWriteArea(textarea, charCount, saveBtn, shareBtn, confirm);
        });

        shareBtn.addEventListener('click', async () => {
            const text = textarea.value.trim();
            if (!text) return;
            if (!isSafe(text)) { showCrisis(); return; }
            shareBtn.disabled = true;
            shareBtn.textContent = 'sharing...';

            const { error } = await db.from('fragments').insert([{
                text:    text,
                state:   selectedTag || 'unknown',
                flagged: false
            }]);

            if (error) {
                console.error('Share error:', error);
                alert('Something went wrong. Please try again.');
                shareBtn.disabled = false;
                shareBtn.textContent = 'Share anonymously';
                return;
            }
            resetWriteArea(textarea, charCount, saveBtn, shareBtn, confirm);
        });

        againBtn.addEventListener('click', () => {
            confirm.classList.add('hidden');
            textarea.value = '';
            charCount.textContent = '0 / 1000';
            saveBtn.disabled = true;
            shareBtn.disabled = true;
            shareBtn.textContent = 'Share anonymously';
            textarea.focus();
        });
    }

    function resetWriteArea(textarea, charCount, saveBtn, shareBtn, confirm) {
        textarea.value = '';
        charCount.textContent = '0 / 1000';
        saveBtn.disabled = true;
        shareBtn.disabled = true;
        shareBtn.textContent = 'Share anonymously';
        confirm.classList.remove('hidden');
        loadPrivateEntries();
    }

    function savePrivate(text) {
        const entries = getPrivate();
        entries.unshift({ text, timestamp: Date.now(), tag: selectedTag });
        localStorage.setItem(PRIVATE_KEY, JSON.stringify(entries.slice(0, 50)));
    }

    function getPrivate() {
        try { return JSON.parse(localStorage.getItem(PRIVATE_KEY)) || []; }
        catch { return []; }
    }

    function loadPrivateEntries() {
        const list = $('private-entries-list');
        if (!list) return;
        const entries = getPrivate();
        if (entries.length === 0) { list.innerHTML = '<p class="empty-note">Nothing saved yet.</p>'; return; }
        list.innerHTML = '';
        entries.forEach(e => {
            const card = document.createElement('div');
            card.className = 'private-entry-card';
            card.textContent = e.text;
            list.appendChild(card);
        });
    }

    function setupReadPage() {
        $$('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = btn.dataset.filter;
                loadWall(true);
            });
        });
        $('wall-load-more').addEventListener('click', () => loadWall(false));
    }

    async function loadWall(reset = false) {
        const wall    = $('shared-wall');
        const loadBtn = $('wall-load-more');
        if (!wall) return;

        if (reset) {
            wallOffset = 0;
            wall.innerHTML = '<p class="loading-note">loading...</p>';
            loadBtn.style.display = 'none';
        }

        let query = db
            .from('fragments')
            .select('text, state')
            .eq('flagged', false)
            .order('created_at', { ascending: false })
            .range(wallOffset, wallOffset + PAGE_SIZE - 1);

        if (activeFilter) query = query.eq('state', activeFilter);

        const { data, error } = await query;

        if (error) {
            console.error('Wall load error:', error);
            wall.innerHTML = '<p class="loading-note">Could not load. Please refresh.</p>';
            return;
        }

        if (reset) wall.innerHTML = '';

        if (!data || data.length === 0) {
            if (wallOffset === 0) wall.innerHTML = '<p class="loading-note">Nothing here yet. Be the first to share.</p>';
            loadBtn.style.display = 'none';
            return;
        }

        data.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'fragment-card';
            const text = document.createElement('p');
            text.className = 'fragment-text';
            text.textContent = entry.text;
            card.appendChild(text);
            if (entry.state && entry.state !== 'unknown') {
                const tag = document.createElement('span');
                tag.className = 'fragment-tag';
                tag.textContent = entry.state;
                card.appendChild(tag);
            }
            wall.appendChild(card);
        });

        wallOffset += data.length;
        loadBtn.style.display = data.length < PAGE_SIZE ? 'none' : 'block';
    }

    function isSafe(text) {
        for (const p of dangerousPatterns) if (p.test(text)) return false;
        for (const p of crisisPatterns)   if (p.test(text)) return false;
        return true;
    }

    function showCrisis() {
        alert(
            "We understand you're struggling, but this space cannot provide the immediate help you may need.\n\n" +
            "If you're in crisis, please reach out:\n\n" +
            "• 988 Suicide & Crisis Lifeline: Call or text 988 (US)\n" +
            "• Crisis Text Line: Text HOME to 741741 (US)\n" +
            "• International: findahelpline.com\n\n" +
            "Your words matter, but your safety matters more."
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
