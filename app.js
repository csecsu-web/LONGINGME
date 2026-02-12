// A Quiet Space - Supabase Version
(function () {
    'use strict';

    // ─── Supabase Config ────────────────────────────────────────────────────────
    const SUPABASE_URL = 'https://hapkolokdrzwprilmpce.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_V_zCthxiaKw9jBam5Ztjgg_8SRaG8rj';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ─── State ───────────────────────────────────────────────────────────────────
    let selectedState = null;
    let currentOffset  = 0;
    const PAGE_SIZE    = 10;

    // ─── Mirror messages ─────────────────────────────────────────────────────────
    const mirrorMessages = {
        'out-of-control': "Sometimes control shows up when safety was missing.",
        'empty':          "Emptiness can be the space left behind when feeling became too much.",
        'scared':         "Fear of letting go can mean something mattered deeply.",
        'unreal':         "Disconnection is sometimes protection.",
        'overwhelmed':    "Being overwhelmed doesn't mean you're failing.",
        'unknown':        "Not knowing is still knowing something is wrong.",
        'skip':           null
    };

    // ─── Safety filters ──────────────────────────────────────────────────────────
    const dangerousPatterns = [
        /\b(\d+)\s*(pills?|tablets?|capsules?)\b/i,
        /\b(\d+)\s*(cuts?|slashes?)\b/i,
        /\b(\d+)\s*(lbs?|kg|pounds?|kilos?)\b/i,
        /\b(\d+)\s*(calories?|cal)\b/i,
        /\bhow\s+to\s+(kill|hurt|harm|cut|overdose)/i,
        /\bstep\s+by\s+step\s+(suicide|self[\s-]?harm)/i,
        /\byou\s+should\s+(kill|hurt|harm)\s+yourself/i,
    ];

    const crisisPatterns = [
        /\b(want|going|plan|planning)\s+to\s+(die|kill\s+myself|end\s+it)\b/i,
        /\bsuicide\s+(plan|attempt|note)\b/i,
        /\bcan'?t\s+live\s+anymore\b/i,
        /\bno\s+reason\s+to\s+(live|continue|go\s+on)\b/i
    ];

    // ─── DOM refs ────────────────────────────────────────────────────────────────
    const $ = id => document.getElementById(id);

    const screens = {
        loading: $('loading'),
        entry:   $('entry-screen'),
        main:    $('main-screen')
    };

    const sections = {
        write: $('write-section'),
        read:  $('read-section'),
        about: $('about-section')
    };

    (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app.js b/app.js
index 655be1e186337810cd7dc85e2e97bf4146d53445..1019cd0843ac33f6d94f9b67b07b6bda1a89fb8d 100644
--- a/app.js
+++ b/app.js
@@ -58,76 +58,90 @@
 
     const fragmentInput    = $('fragment-input');
     const submitBtn        = $('submit-btn');
     const charCount        = $('char-count');
     const confirmation     = $('confirmation');
     const writeAnother     = $('write-another');
     const mirrorEl         = $('mirror-message');
     const fragmentsContainer = $('fragments-container');
     const loadMoreBtn      = $('load-more');
 
     // ─── Init ────────────────────────────────────────────────────────────────────
     async function init() {
         setupListeners();
         // Small delay so "preparing space..." is visible
         setTimeout(() => switchScreen('entry'), 900);
     }
 
     // ─── Listeners ───────────────────────────────────────────────────────────────
     function setupListeners() {
         document.querySelectorAll('.state-btn').forEach(btn =>
             btn.addEventListener('click', onStateSelect));
 
         document.querySelectorAll('.nav-btn').forEach(btn =>
             btn.addEventListener('click', onNavClick));
 
+        document.querySelectorAll('[data-quick-nav]').forEach(btn =>
+            btn.addEventListener('click', onQuickNavigate));
+
         fragmentInput.addEventListener('input', onInputChange);
         submitBtn.addEventListener('click', onSubmit);
         writeAnother.addEventListener('click', resetWrite);
         loadMoreBtn.addEventListener('click', loadFragments);
     }
 
     // ─── State selection ─────────────────────────────────────────────────────────
     function onStateSelect(e) {
         selectedState = e.target.dataset.state;
 
         const msg = mirrorMessages[selectedState];
         if (msg) {
             mirrorEl.textContent = msg;
             mirrorEl.classList.add('visible');
         }
 
         switchScreen('main');
         loadFragments(true);
     }
 
     // ─── Navigation ──────────────────────────────────────────────────────────────
     function onNavClick(e) {
         const target = e.target.id.replace('nav-', '');
+        navigateToSection(target);
+    }
+
+    function onQuickNavigate(e) {
+        const target = e.target.dataset.quickNav;
+        selectedState = selectedState || 'skip';
+        switchScreen('main');
+        navigateToSection(target);
+    }
 
+    function navigateToSection(target) {
         document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

+        const activeNav = document.getElementById(`nav-${target}`);
+        if (activeNav) activeNav.classList.add('active');
 
         Object.keys(sections).forEach(k => sections[k].classList.remove('active'));
         sections[target].classList.add('active');
 
         if (target === 'read') loadFragments(true);
     }
 
     // ─── Input ───────────────────────────────────────────────────────────────────
     function onInputChange() {
         const len = fragmentInput.value.length;
         charCount.textContent = `${len} / 500`;
         submitBtn.disabled = len === 0;
     }
 
     // ─── Submit ──────────────────────────────────────────────────────────────────
     async function onSubmit() {
         const text = fragmentInput.value.trim();
         if (!text) return;
 
         if (!isSafe(text)) {
             showCrisis();
             return;
         }
 
         submitBtn.disabled = true;
 
EOF
)
        submitBtn.disabled = true;
        submitBtn.textContent = 'releasing...';

        const { error } = await supabase
            .from('fragments')
            .insert([{
                text:    text,
                state:   selectedState || 'unknown',
                flagged: false
            }]);

        if (error) {
            console.error('Submit error:', error);
            alert('Something went wrong. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'release';
            return;
        }

        // Show confirmation
        fragmentInput.value = '';
        charCount.textContent = '0 / 500';
        document.querySelector('.write-area').style.display = 'none';
        confirmation.classList.remove('hidden');
    }

    // ─── Reset write area ────────────────────────────────────────────────────────
    function resetWrite() {
        confirmation.classList.add('hidden');
        document.querySelector('.write-area').style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.textContent = 'release';
        fragmentInput.focus();
    }

    // ─── Load fragments ───────────────────────────────────────────────────────────
    async function loadFragments(reset = false) {
        if (reset) {
            currentOffset = 0;
            fragmentsContainer.innerHTML = '<p class="loading-text">loading...</p>';
            loadMoreBtn.style.display = 'none';
        }

        const { data, error } = await supabase
            .from('fragments')
            .select('text, state')
            .eq('flagged', false)
            .order('created_at', { ascending: false })
            .range(currentOffset, currentOffset + PAGE_SIZE - 1);

        if (error) {
            console.error('Load error:', error);
            fragmentsContainer.innerHTML = '<p class="loading-text">Could not load fragments.</p>';
            return;
        }

        if (reset) fragmentsContainer.innerHTML = '';

        if (!data || data.length === 0) {
            if (currentOffset === 0) {
                fragmentsContainer.innerHTML = '<p class="loading-text">No fragments yet. Be the first to write.</p>';
            }
            loadMoreBtn.style.display = 'none';
            return;
        }

        data.forEach(f => addFragmentCard(f.text));
        currentOffset += data.length;

        loadMoreBtn.style.display = data.length < PAGE_SIZE ? 'none' : 'block';
        loadMoreBtn.textContent = 'see more';
        loadMoreBtn.disabled = false;
    }

    // ─── Add card to DOM ─────────────────────────────────────────────────────────
    function addFragmentCard(text) {
        const card = document.createElement('div');
        card.className = 'fragment-card';

        const p = document.createElement('p');
        p.className = 'fragment-text';
        p.textContent = text;

        card.appendChild(p);
        fragmentsContainer.appendChild(card);
    }

    // ─── Safety ──────────────────────────────────────────────────────────────────
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

    // ─── Screen switcher ─────────────────────────────────────────────────────────
    function switchScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        setTimeout(() => screens[name].classList.add('active'), 100);
    }

    // ─── Start ───────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
