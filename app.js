// Main Application Logic
(function() {
    'use strict';

    // State
    let currentUser = null;
    let selectedState = null;
    let lastVisible = null;

    // Mirror messages (system-generated reflections)
    const mirrorMessages = {
        'out-of-control': "Sometimes control shows up when safety was missing.",
        'empty': "Emptiness can be the space left behind when feeling became too much.",
        'scared': "Fear of letting go can mean something mattered deeply.",
        'unreal': "Disconnection is sometimes protection.",
        'overwhelmed': "Being overwhelmed doesn't mean you're failing.",
        'unknown': "Not knowing is still knowing something is wrong.",
        'skip': null
    };

    // Safety filters (basic content moderation)
    const dangerousPatterns = [
        /\b(\d+)\s*(pills?|tablets?|capsules?)\b/i,
        /\b(\d+)\s*(cuts?|slashes?)\b/i,
        /\b(\d+)\s*(lbs?|kg|pounds?|kilos?)\b/i,
        /\b(\d+)\s*(calories?|cal)\b/i,
        /\bhow\s+to\s+(kill|hurt|harm|cut|overdose)/i,
        /\bstep\s+by\s+step\s+(suicide|self[\s-]?harm)/i,
        /\byou\s+should\s+(kill|hurt|harm)\s+yourself/i,
        /detailed\s+(method|plan|instructions?)\s+(suicide|self[\s-]?harm)/i
    ];

    // Crisis keywords (triggers resource display)
    const crisisKeywords = [
        /\b(want|going|plan|planning)\s+to\s+(die|kill\s+myself|end\s+it)\b/i,
        /\bsuicide\s+(plan|attempt|note)\b/i,
        /\bcan'?t\s+live\s+anymore\b/i,
        /\bno\s+reason\s+to\s+(live|continue|go\s+on)\b/i
    ];

    // DOM Elements
    const screens = {
        loading: document.getElementById('loading'),
        entry: document.getElementById('entry-screen'),
        main: document.getElementById('main-screen')
    };

    const sections = {
        write: document.getElementById('write-section'),
        read: document.getElementById('read-section'),
        about: document.getElementById('about-section')
    };

    const elements = {
        stateButtons: document.querySelectorAll('.state-btn'),
        navButtons: document.querySelectorAll('.nav-btn'),
        fragmentInput: document.getElementById('fragment-input'),
        submitBtn: document.getElementById('submit-btn'),
        charCount: document.getElementById('char-count'),
        confirmation: document.getElementById('confirmation'),
        writeAnother: document.getElementById('write-another'),
        mirrorMessage: document.getElementById('mirror-message'),
        fragmentsContainer: document.getElementById('fragments-container'),
        loadMore: document.getElementById('load-more')
    };

    // Initialize
    async function init() {
        try {
            // Sign in anonymously
            const userCredential = await window.firebaseAuth.signInAnonymously();
            currentUser = userCredential.user;
            
            // Setup event listeners
            setupEventListeners();
            
            // Show entry screen
            setTimeout(() => {
                switchScreen('entry');
            }, 800);
        } catch (error) {
            console.error('Initialization error:', error);
            alert('Unable to connect. Please refresh the page.');
        }
    }

    // Event Listeners
    function setupEventListeners() {
        // State selection
        elements.stateButtons.forEach(btn => {
            btn.addEventListener('click', handleStateSelection);
        });

        // Navigation
        elements.navButtons.forEach(btn => {
            btn.addEventListener('click', handleNavigation);
        });

        // Fragment input
        elements.fragmentInput.addEventListener('input', handleInputChange);
        elements.submitBtn.addEventListener('click', handleSubmit);

        // Write another
        elements.writeAnother.addEventListener('click', resetWriteSection);

        // Load more fragments
        elements.loadMore.addEventListener('click', loadFragments);
    }

    // Handle state selection
    function handleStateSelection(e) {
        const state = e.target.dataset.state;
        selectedState = state;

        // Show mirror message if applicable
        const message = mirrorMessages[state];
        if (message) {
            elements.mirrorMessage.textContent = message;
            elements.mirrorMessage.classList.add('visible');
        }

        // Go to main screen
        switchScreen('main');
        
        // If not skip, load some initial fragments
        if (state !== 'skip') {
            loadFragments();
        }
    }

    // Handle navigation
    function handleNavigation(e) {
        const target = e.target.id.replace('nav-', '');
        
        // Update active states
        elements.navButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        // Show section
        Object.keys(sections).forEach(key => {
            sections[key].classList.remove('active');
        });
        sections[target].classList.add('active');

        // Load fragments if navigating to read section
        if (target === 'read' && elements.fragmentsContainer.children.length === 1) {
            loadFragments();
        }
    }

    // Handle input change
    function handleInputChange() {
        const length = elements.fragmentInput.value.length;
        elements.charCount.textContent = `${length} / 500`;
        
        // Enable/disable submit button
        elements.submitBtn.disabled = length === 0;
    }

    // Handle fragment submission
    async function handleSubmit() {
        const text = elements.fragmentInput.value.trim();
        
        if (!text) return;

        // Safety check
        const isSafe = checkSafety(text);
        if (!isSafe) {
            showCrisisResources();
            return;
        }

        // Disable submit button
        elements.submitBtn.disabled = true;
        elements.submitBtn.textContent = 'releasing...';

        try {
            // Submit to Firestore
            await window.firebaseDB.collection('fragments').add({
                text: text,
                userId: currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                state: selectedState || 'unknown',
                flagged: false
            });

            // Show confirmation
            elements.fragmentInput.value = '';
            elements.charCount.textContent = '0 / 500';
            document.querySelector('.write-area').style.display = 'none';
            elements.confirmation.classList.remove('hidden');

        } catch (error) {
            console.error('Submission error:', error);
            alert('Unable to submit. Please try again.');
            elements.submitBtn.disabled = false;
            elements.submitBtn.textContent = 'release';
        }
    }

    // Safety check
    function checkSafety(text) {
        // Check for dangerous patterns
        for (let pattern of dangerousPatterns) {
            if (pattern.test(text)) {
                return false;
            }
        }

        // Check for crisis keywords
        for (let pattern of crisisKeywords) {
            if (pattern.test(text)) {
                return false;
            }
        }

        return true;
    }

    // Show crisis resources
    function showCrisisResources() {
        const message = `
We understand you're struggling, but this space cannot provide the immediate help you may need.

If you're in crisis, please reach out:

• 988 Suicide & Crisis Lifeline: Call or text 988 (US)
• Crisis Text Line: Text HOME to 741741 (US)
• International: findahelpline.com

Your words matter, but your safety matters more.
        `.trim();

        alert(message);
    }

    // Reset write section
    function resetWriteSection() {
        elements.confirmation.classList.add('hidden');
        document.querySelector('.write-area').style.display = 'block';
        elements.submitBtn.disabled = true;
        elements.submitBtn.textContent = 'release';
        elements.fragmentInput.focus();
    }

    // Load fragments
    async function loadFragments() {
        try {
            elements.loadMore.disabled = true;
            elements.loadMore.textContent = 'loading...';

            let query = window.firebaseDB.collection('fragments')
                .where('flagged', '==', false)
                .orderBy('createdAt', 'desc')
                .limit(10);

            if (lastVisible) {
                query = query.startAfter(lastVisible);
            }

            const snapshot = await query.get();

            if (snapshot.empty) {
                elements.loadMore.textContent = 'no more to show';
                return;
            }

            // Clear loading text on first load
            if (!lastVisible) {
                elements.fragmentsContainer.innerHTML = '';
            }

            // Add fragments
            snapshot.forEach(doc => {
                const fragment = doc.data();
                addFragmentToDOM(fragment);
            });

            // Update pagination
            lastVisible = snapshot.docs[snapshot.docs.length - 1];
            elements.loadMore.disabled = false;
            elements.loadMore.textContent = 'see more';

        } catch (error) {
            console.error('Load fragments error:', error);
            elements.loadMore.textContent = 'error loading';
        }
    }

    // Add fragment to DOM
    function addFragmentToDOM(fragment) {
        const card = document.createElement('div');
        card.className = 'fragment-card';
        
        const text = document.createElement('p');
        text.className = 'fragment-text';
        text.textContent = fragment.text;
        
        card.appendChild(text);
        elements.fragmentsContainer.appendChild(card);
    }

    // Switch screens
    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        setTimeout(() => {
            screens[screenName].classList.add('active');
        }, 100);
    }

    // Start the app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
