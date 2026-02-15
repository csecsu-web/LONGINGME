// Longingme — app.js v3 (Dark Cocoon)
(function () {
    'use strict';

    const SUPABASE_URL = 'https://hapkolokdrzwprilmpce.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_V_zCthxiaKw9jBam5Ztjgg_8SRaG8rj';
    const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const PRIVATE_KEY  = 'longingme_private';
    const ANON_ID_KEY  = 'longingme_anon_id';
    const PATH_KEY     = 'longingme_path';

    function getAnonId() {
        let id = localStorage.getItem(ANON_ID_KEY);
        if (!id) {
            id = 'anon_' + Math.random().toString(36).substr(2,12) + Date.now().toString(36);
            localStorage.setItem(ANON_ID_KEY, id);
        }
        return id;
    }
    const ANON_ID = getAnonId();

    let selectedTag  = '';
    let activeFilter = '';
    let wallOffset   = 0;
    let myOffset     = 0;
    const PAGE_SIZE  = 10;

    // ── Companion greetings ───────────────────────────────────────
    const companionGreetings = [
        "I'm here with you.",
        "Take your time.",
        "You don't have to explain anything.",
        "This is a quiet place. You're safe here.",
        "Nothing you write here will judge you.",
        "I'm glad you're here."
    ];

    // ── Companion responses after submission ──────────────────────
    const companionResponses = [
        "I'm here with you.",
        "That sounds heavy.",
        "You're not dramatic.",
        "It makes sense you feel this.",
        "Thank you for trusting this space.",
        "I hear you.",
        "You didn't have to say that, and you did anyway.",
        "That took something to write."
    ];

    // ── Affirmations after submission ─────────────────────────────
    const affirmations = [
        "You showed up for yourself.",
        "You are not broken.",
        "You don't have to carry this alone.",
        "It makes sense that this feels heavy.",
        "Your feelings are valid.",
        "Being here is enough.",
        "You are allowed to feel this.",
        "You are not too much."
    ];

    // ── Reflection prompts ────────────────────────────────────────
    const reflectionSets = [
        ["What triggered this?", "What do I need right now?", "What would kindness look like here?"],
        ["What part of this feels hardest?", "What do you wish someone understood?", "If this feeling had a voice, what would it say?"],
        ["Where do you feel this in your body?", "What are you really asking for?", "What would you tell a friend who felt this way?"]
    ];

    // ── Grounding messages ────────────────────────────────────────
    const groundMessages = [
        "You don't have to solve anything right now.",
        "Being here is enough. You showed up.",
        "It's okay to not be okay.",
        "This moment is just this moment.",
        "Your nervous system is doing its best.",
        "You are allowed to take up space.",
        "Whatever brought you here — you were brave enough to come."
    ];

    // ── Guided Paths data ─────────────────────────────────────────
    const paths = {
        anxiety: {
            name: "Understanding My Anxiety",
            sub: "A gentle 4-week exploration of what anxiety is, where it comes from, and how to be with it.",
            weeks: [
                {
                    title: "Awareness",
                    prompts: [
                        "When did you first notice anxiety showing up in your life?",
                        "What does anxiety feel like in your body, right now?",
                        "What situations tend to bring it up?"
                    ]
                },
                {
                    title: "Triggers",
                    prompts: [
                        "What happened before the last time you felt anxious?",
                        "Is there a pattern — certain times, places, or people?",
                        "What are you afraid of, underneath the anxiety?"
                    ]
                },
                {
                    title: "Patterns",
                    prompts: [
                        "How do you usually respond when anxiety appears?",
                        "What does anxiety make you avoid?",
                        "Has anxiety ever protected you from something?"
                    ]
                },
                {
                    title: "Self-compassion",
                    prompts: [
                        "What would you say to a friend who felt this way?",
                        "What does your anxious self need most right now?",
                        "What is one small thing you can offer yourself today?"
                    ]
                }
            ]
        },
        control: {
            name: "Breaking Control Patterns",
            sub: "Understanding where the need for control comes from — gently, without judgment.",
            weeks: [
                { title: "Noticing", prompts: ["What do you try to control most in your life?", "When did controlling things start to feel necessary?", "What would happen if you lost control of that?"] },
                { title: "Origins", prompts: ["Was there a time when things felt unsafe or unpredictable?", "What did control protect you from?", "Who taught you that control was necessary?"] },
                { title: "The cost", prompts: ["What has needing control cost you?", "What relationships has it affected?", "What would you do differently if you didn't need control?"] },
                { title: "Softening", prompts: ["What would it feel like to let go of just one thing?", "What do you trust, even a little?", "What is already okay, right now?"] }
            ]
        },
        selfworth: {
            name: "Self-Worth",
            sub: "Coming back to yourself — slowly, on your own terms.",
            weeks: [
                { title: "Where am I now?", prompts: ["How do you feel about yourself today, honestly?", "What do you believe you deserve?", "When did you start believing that?"] },
                { title: "The voice", prompts: ["What does the critical voice in your head say most?", "Whose voice does it sound like?", "What would you say back to it?"] },
                { title: "Evidence", prompts: ["What have you survived that you don't give yourself credit for?", "What do people who love you see in you?", "What small things do you do well?"] },
                { title: "Returning", prompts: ["What would it mean to be gentle with yourself?", "What do you deserve, that you haven't allowed yourself?", "What would you say to the younger version of you?"] }
            ]
        },
        emotions: {
            name: "Emotional Regulation",
            sub: "Making sense of what you feel — not controlling it, just understanding it.",
            weeks: [
                { title: "Meeting emotions", prompts: ["What emotions do you struggle with most?", "How do you usually handle strong feelings?", "What emotion feels most dangerous to feel?"] },
                { title: "Understanding", prompts: ["What is this emotion trying to tell you?", "What need is underneath this feeling?", "When did you learn to handle emotion this way?"] },
                { title: "The body", prompts: ["Where do you feel emotion in your body?", "What does anger feel like? Sadness? Fear?", "What does your body need right now?"] },
                { title: "Staying with it", prompts: ["What would it feel like to sit with an emotion instead of escaping it?", "What would you need to feel safe enough to do that?", "What emotion are you ready to make peace with?"] }
            ]
        },
        addiction: {
            name: "Addiction & Urges",
            sub: "Understanding the pull — without shame, without instructions, without pressure.",
            weeks: [
                { title: "What it does", prompts: ["What does this thing do for you, honestly?", "What does it give you that you can't get elsewhere?", "When does the urge show up most?"] },
                { title: "What's underneath", prompts: ["What are you trying to escape when the urge comes?", "What pain does it temporarily quiet?", "What do you feel before the urge?"] },
                { title: "The cycle", prompts: ["What happens after — emotionally?", "What do you tell yourself in that after-space?", "What do you wish was different?"] },
                { title: "Compassion", prompts: ["What does the part of you that reaches for this need?", "What would it say if it could speak?", "What could you offer it instead?"] }
            ]
        },
        identity: {
            name: "Identity & Self-Discovery",
            sub: "Who you are when no one is watching — a slow exploration.",
            weeks: [
                { title: "Who am I?", prompts: ["How would you describe yourself when no one is judging?", "What parts of yourself do you hide?", "What do you pretend not to want?"] },
                { title: "Where I came from", prompts: ["How did your environment shape who you are?", "What were you taught to be?", "What were you taught to hide?"] },
                { title: "What I actually feel", prompts: ["What do you actually value, separate from what you were told to value?", "What makes you feel most like yourself?", "What relationships feel most real?"] },
                { title: "Becoming", prompts: ["Who do you want to be, without anyone's permission?", "What would it take to be more yourself?", "What would you do if you weren't afraid?"] }
            ]
        }
    };

    const $ = id => document.getElementById(id);
    const $$ = sel => document.querySelectorAll(sel);
    const rand = arr => arr[Math.floor(Math.random() * arr.length)];

    // ── Init ──────────────────────────────────────────────────────
    function init() {
        setupNavigation();
        setupWritePage();
        setupReadPage();
        setupMyPage();
        setupPathsPage();
        setupGrounding();
        setupPauseModal();
        loadPrivateEntries();
        setTimeout(() => switchScreen('landing'), 1000);
    }

    // ── Navigation ────────────────────────────────────────────────
    function setupNavigation() {
        document.addEventListener('click', e => {
            const target = e.target.closest('[data-page]');
            if (!target) return;
            const page = target.dataset.page;
            switchScreen(page);
            if (page === 'read-page')   loadWall(true);
            if (page === 'my-page')     loadMy(true);
            if (page === 'ground-page') setGroundMessage();
            if (page === 'write-page')  setCompanionGreeting();
        });
    }

    function switchScreen(id) {
        $$('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
        const el = $(id);
        if (el) { el.style.display = 'block'; requestAnimationFrame(() => el.classList.add('active')); }
        window.scrollTo(0, 0);
    }

    // ── Companion greeting ────────────────────────────────────────
    function setCompanionGreeting() {
        const el = $('companion-text');
        if (el) el.textContent = rand(companionGreetings);
    }

    // ── Write page ────────────────────────────────────────────────
    function setupWritePage() {
        const textarea   = $('entry-input');
        const charCount  = $('write-char-count');
        const saveBtn    = $('save-private-btn');
        const shareBtn   = $('share-anon-btn');
        const response   = $('companion-response');
        const responseText = $('companion-response-text');
        const affirmEl   = $('confirm-affirmation');
        const againBtn   = $('write-again-btn');
        const reflectBtn = $('reflect-btn');
        const reflectSec = $('reflect-section');
        const reflectQs  = $('reflect-questions');
        const reflectClose = $('reflect-close');

        // Tags
        $$('.etag').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.etag').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTag = btn.dataset.tag;
            });
        });

        // Input
        textarea.addEventListener('input', () => {
            const len = textarea.value.length;
            charCount.textContent = `${len} / 1000`;
            saveBtn.disabled  = len === 0;
            shareBtn.disabled = len === 0;
        });

        // Save privately
        saveBtn.addEventListener('click', () => {
            const text = textarea.value.trim();
            if (!text) return;
            if (!isSafe(text)) { showCrisis(); return; }
            savePrivate(text);
            showResponse(textarea, charCount, saveBtn, shareBtn, response, responseText, affirmEl);
        });

        // Share anonymously
        shareBtn.addEventListener('click', async () => {
            const text = textarea.value.trim();
            if (!text) return;
            if (!isSafe(text)) { showCrisis(); return; }
            shareBtn.disabled = true;
            shareBtn.textContent = 'sharing...';

            const { error } = await db.from('fragments').insert([{
                text: text,
                state: selectedTag || 'unknown',
                flagged: false,
                anon_id: ANON_ID
            }]);

            if (error) {
                console.error('Supabase error:', error);
                alert('Something went wrong. Please try again.');
                shareBtn.disabled = false;
                shareBtn.textContent = 'Share anonymously';
                return;
            }
            showResponse(textarea, charCount, saveBtn, shareBtn, response, responseText, affirmEl);
        });

        // Write again
        againBtn.addEventListener('click', () => {
            response.classList.add('hidden');
            reflectSec.classList.add('hidden');
            textarea.value = '';
            charCount.textContent = '0 / 1000';
            saveBtn.disabled = true;
            shareBtn.disabled = true;
            shareBtn.textContent = 'Share anonymously';
            textarea.focus();
        });

        // Reflect
        reflectBtn.addEventListener('click', () => {
            const set = reflectionSets[Math.floor(Math.random() * reflectionSets.length)];
            reflectQs.innerHTML = '';
            set.forEach(q => {
                const d = document.createElement('div');
                d.className = 'reflect-q';
                d.textContent = q;
                reflectQs.appendChild(d);
            });
            reflectSec.classList.remove('hidden');
            reflectSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        reflectClose.addEventListener('click', () => reflectSec.classList.add('hidden'));
    }

    function showResponse(textarea, charCount, saveBtn, shareBtn, response, responseText, affirmEl) {
        textarea.value = '';
        charCount.textContent = '0 / 1000';
        saveBtn.disabled = true;
        shareBtn.disabled = true;
        shareBtn.textContent = 'Share anonymously';
        responseText.textContent = rand(companionResponses);
        affirmEl.textContent = rand(affirmations);
        response.classList.remove('hidden');
        loadPrivateEntries();
        response.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ── Private entries ───────────────────────────────────────────
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
        if (entries.length === 0) { list.innerHTML = '<p style="font-size:0.82rem;color:var(--text-muted);font-style:italic">Nothing saved yet.</p>'; return; }
        list.innerHTML = '';
        entries.slice(0, 5).forEach(e => {
            const card = document.createElement('div');
            card.className = 'private-entry-card';
            card.textContent = e.text;
            list.appendChild(card);
        });
    }

    // ── Guided paths ──────────────────────────────────────────────
    function setupPathsPage() {
        $$('.path-card').forEach(card => {
            card.addEventListener('click', () => {
                const key = card.dataset.path;
                openPath(key);
            });
        });
    }

    function openPath(key) {
        const path = paths[key];
        if (!path) return;
        $('path-detail-name').textContent = path.name;
        $('path-detail-sub').textContent  = path.sub;
        const weeksEl = $('path-weeks');
        weeksEl.innerHTML = '';
        path.weeks.forEach((week, i) => {
            const card = document.createElement('div');
            card.className = 'week-card';
            card.innerHTML = `
                <p class="week-label">Week ${i + 1}</p>
                <p class="week-title">${week.title}</p>
                <div class="week-prompts">
                    ${week.prompts.map(p => `<div class="week-prompt" data-prompt="${p}">${p}</div>`).join('')}
                </div>
            `;
            weeksEl.appendChild(card);
        });

        // Clicking a prompt navigates to write page with prompt as placeholder
        weeksEl.querySelectorAll('.week-prompt').forEach(el => {
            el.addEventListener('click', () => {
                const prompt = el.dataset.prompt;
                switchScreen('write-page');
                const textarea = $('entry-input');
                if (textarea) {
                    textarea.placeholder = prompt;
                    textarea.focus();
                }
                setCompanionGreeting();
            });
        });

        switchScreen('path-detail');
    }

    // ── Read wall ─────────────────────────────────────────────────
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
        const wall = $('shared-wall');
        const btn  = $('wall-load-more');
        if (!wall) return;
        if (reset) { wallOffset = 0; wall.innerHTML = '<p class="loading-note">loading...</p>'; btn.style.display = 'none'; }
        let q = db.from('fragments').select('text, state')
            .eq('flagged', false).order('id', { ascending: false })
            .range(wallOffset, wallOffset + PAGE_SIZE - 1);
        if (activeFilter) q = q.eq('state', activeFilter);
        const { data, error } = await q;
        if (error) { wall.innerHTML = '<p class="loading-note">Could not load. Please refresh.</p>'; return; }
        if (reset) wall.innerHTML = '';
        if (!data || data.length === 0) {
            if (wallOffset === 0) wall.innerHTML = '<p class="loading-note">Nothing here yet. Be the first to share.</p>';
            btn.style.display = 'none'; return;
        }
        data.forEach(e => addCard(wall, e.text, e.state));
        wallOffset += data.length;
        btn.style.display = data.length < PAGE_SIZE ? 'none' : 'block';
    }

    // ── My submissions + patterns ─────────────────────────────────
    function setupMyPage() {
        const btn = $('my-load-more');
        if (btn) btn.addEventListener('click', () => loadMy(false));
    }

    async function loadMy(reset = false) {
        const container = $('my-submissions-list');
        const loadBtn   = $('my-load-more');
        if (!container) return;
        if (reset) { myOffset = 0; container.innerHTML = '<p class="loading-note">loading...</p>'; if (loadBtn) loadBtn.style.display = 'none'; }

        const { data, error } = await db.from('fragments').select('text, state')
            .eq('anon_id', ANON_ID).order('id', { ascending: false })
            .range(myOffset, myOffset + PAGE_SIZE - 1);

        if (error) { container.innerHTML = '<p class="loading-note">Could not load. Please refresh.</p>'; return; }
        if (reset) container.innerHTML = '';

        if (!data || data.length === 0) {
            if (myOffset === 0) container.innerHTML = '<p class="loading-note">You haven\'t shared anything yet.</p>';
            if (loadBtn) loadBtn.style.display = 'none'; return;
        }

        data.forEach(e => addCard(container, e.text, e.state));
        myOffset += data.length;
        if (loadBtn) loadBtn.style.display = data.length < PAGE_SIZE ? 'none' : 'block';

        // Show pattern reflection if enough entries
        if (reset && data.length >= 3) showPattern(data);
    }

    function showPattern(data) {
        const section = $('pattern-section');
        const textEl  = $('pattern-text');
        if (!section || !textEl) return;

        const tagCounts = {};
        data.forEach(e => { if (e.state && e.state !== 'unknown') tagCounts[e.state] = (tagCounts[e.state] || 0) + 1; });
        const topTag = Object.entries(tagCounts).sort((a,b) => b[1]-a[1])[0];
        const insights = [];

        if (topTag && topTag[1] >= 2) {
            insights.push(`You often write about <em>${topTag[0]}</em>.`);
        }
        if (data.length >= 5) {
            insights.push(`You have shared ${data.length} things here. That took something.`);
        }
        insights.push(`You keep coming back. That matters.`);

        textEl.innerHTML = insights.map(i => `<p>${i}</p>`).join('');
        section.classList.remove('hidden');
    }

    // ── Card builder ──────────────────────────────────────────────
    function addCard(container, text, state) {
        const card = document.createElement('div');
        card.className = 'fragment-card';
        const p = document.createElement('p');
        p.className = 'fragment-text';
        p.textContent = text;
        card.appendChild(p);
        if (state && state !== 'unknown') {
            const tag = document.createElement('span');
            tag.className = 'fragment-tag';
            tag.textContent = state;
            card.appendChild(tag);
        }
        container.appendChild(card);
    }

    // ── Grounding ─────────────────────────────────────────────────
    function setGroundMessage() {
        const el = $('ground-message-text');
        if (el) el.textContent = rand(groundMessages);
    }

    function setupGrounding() {
        const ring    = $('breath-ring');
        const phase   = $('breath-phase');
        const num     = $('breath-num');
        const toggle  = $('breath-toggle');
        if (!ring) return;
        let running = false, timer = null, stepIdx = 0;
        const steps = [
            { label: 'Breathe in',  cls: 'inhale', dur: 4 },
            { label: 'Hold',        cls: 'hold',   dur: 4 },
            { label: 'Breathe out', cls: 'exhale', dur: 4 },
            { label: 'Hold',        cls: 'hold',   dur: 2 }
        ];
        function runStep() {
            const s = steps[stepIdx];
            ring.className = 'breath-ring ' + s.cls;
            phase.textContent = s.label;
            let t = s.dur; num.textContent = t;
            clearInterval(timer);
            timer = setInterval(() => {
                t--; num.textContent = t;
                if (t <= 0) {
                    clearInterval(timer);
                    stepIdx = (stepIdx + 1) % steps.length;
                    if (running) runStep();
                }
            }, 1000);
        }
        toggle.addEventListener('click', () => {
            running = !running;
            toggle.textContent = running ? 'Stop' : 'Begin';
            if (running) { stepIdx = 0; runStep(); }
            else { clearInterval(timer); ring.className = 'breath-ring'; phase.textContent = '·'; num.textContent = ''; }
        });
    }

    // ── Pause modal ───────────────────────────────────────────────
    function setupPauseModal() {
        const btn    = $('pause-btn');
        const modal  = $('pause-modal');
        const close  = $('pause-close');
        const ring   = $('pause-ring');
        const label  = $('pause-label');
        if (!btn) return;
        let timer = null;
        function cycle() {
            ring.className = 'pause-ring inhale';
            label.textContent = 'breathe in';
            timer = setTimeout(() => {
                ring.className = 'pause-ring exhale';
                label.textContent = 'breathe out';
                timer = setTimeout(cycle, 4000);
            }, 4000);
        }
        btn.addEventListener('click', () => { modal.classList.remove('hidden'); cycle(); });
        close.addEventListener('click', () => { modal.classList.add('hidden'); clearTimeout(timer); ring.className = 'pause-ring'; });
    }

    // ── Safety ────────────────────────────────────────────────────
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
