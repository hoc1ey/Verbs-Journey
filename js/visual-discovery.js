// visual-discovery.js

document.addEventListener('DOMContentLoaded', () => {
    // 1) Data: titles, image paths, questions (answers to be filled later)
    const images = [
        {
            title: "Couple in Paris",
            src: "../img/IMG1.jpeg",
            alt: "A young couple smiles while taking a selfie in front of the Eiffel Tower. The woman is holding a map and the man extends his arm with a phone, enjoying their visit to Paris.",
            q: "What do you see in this image?",
            a: "They are tourists enjoying their time in Paris, taking a selfie in front of the Eiffel Tower."
        },
        {
            title: "Frustrated Teen Indoors",
            src: "../img/IMG2.jpeg",
            alt: "A young man stands with his arms crossed and a frustrated expression, looking away while a woman works in the background. The scene takes place indoors with warm tones.",
            q: "What do you see in this image?",
            a: "The boy is clearly upset, possibly after an argument or frustration with the situation around him."
        },
        {
            title: "Angry Dishwashing",
            src: "../img/IMG3.jpeg",
            alt: "A woman with an angry expression washes dishes at the sink. She holds a plate and sponge under running water in a simple kitchen with tiled walls.",
            q: "What do you see in this image?",
            a: "She is reluctantly washing the dishes, visibly angry, perhaps after being forced to do so."
        },
        {
            title: "Team Collaboration",
            src: "../img/IMG4.jpeg",
            alt: "Three coworkers sit around a round table collaborating. They are using notebooks and a laptop, smiling and actively participating in a team discussion.",
            q: "What do you see in this image?",
            a: "The team is actively collaborating in a positive environment, working together on a task."
        },
        {
            title: "Sad Earth, Worried Boy",
            src: "../img/IMG5.jpeg",
            alt: "A cartoon Earth with a sad face stands on cracked ground next to a worried boy covering his face. The scene symbolizes concern over environmental issues.",
            q: "What do you see in this image?",
            a: "The Earth appears sad and the boy worried, symbolizing global concern for environmental problems."
        },
        {
            title: "Chris Going Out",
            src: "../img/IMG6.jpeg",
            alt: "A young man named Chris smiles and waves as he steps out of a brick building. He carries a crossbody bag and looks happy to go out.",
            q: "What do you see in this image?",
            a: "Chris is happily stepping outside, maybe going to meet someone or explore the city."
        },
        {
            title: "Seeing Homelessness",
            src: "../img/IMG7.jpeg",
            alt: "A sad woman walks past a homeless man sitting on the sidewalk with his dog. She covers her mouth in shock while the man sits quietly on a blanket.",
            q: "What do you see in this image?",
            a: "The woman is emotionally affected by seeing the homeless man and his dog, feeling empathy and sorrow."
        },
        {
            title: "Focused Study Time",
            src: "../img/IMG8.jpeg",
            alt: "A girl sits at her desk, focused on writing in an open notebook. There are stacked books and a desk lamp illuminating the scene.",
            q: "What do you see in this image?",
            a: "The girl is deeply focused on her studies, showing dedication and discipline."
        },
        {
            title: "Meeting Postponed",
            src: "../img/IMG9.jpeg",
            alt: "A man in a suit points at a flip chart showing a clock, during a meeting. Two colleagues are seated, and the board says 'Meeting,' indicating a decision to postpone it.",
            q: "What do you see in this image?",
            a: "The man is pointing out the clock to announce that the meeting is being postponed."
        },
        {
            title: "Reading a Mystery Novel",
            src: "../img/IMG10.jpeg",
            alt: "A smiling woman sits and reads a mystery novel. The book cover reads 'Mystery' with a magnifying glass icon, and she looks content and focused.",
            q: "What do you see in this image?",
            a: "She is enjoying reading a mystery novel, likely intrigued by the story and plot twists."
        }
    ];


    // 2) Selectors
    const tiles               = document.querySelectorAll('#image-game-board [data-tile]');
    const modal               = document.getElementById('image-question-modal');
    const imageQuestionTitle  = document.getElementById('image-question-title');
    const modalImage          = document.getElementById('modal-image');
    const questionText        = document.getElementById('image-question-text');
    const showAnswerBtn       = document.getElementById('show-image-answer-btn');
    const answerSection       = document.getElementById('image-answer-section');
    const answerText          = document.getElementById('image-answer-text');
    const correctBtn          = document.getElementById('image-correct-btn');
    const incorrectBtn        = document.getElementById('image-incorrect-btn');

    const team1ScoreEl        = document.getElementById('team1-score');
    const team2ScoreEl        = document.getElementById('team2-score');
    const currentTeamEl       = document.getElementById('current-team');

    const imagesRevealedEl    = document.getElementById('images-revealed');
    const questionsLeftEl     = document.getElementById('questions-left');

    const zoomInBtn           = document.getElementById('zoom-in-btn');
    const zoomOutBtn          = document.getElementById('zoom-out-btn');
    const zoomResetBtn        = document.getElementById('zoom-reset-btn');

    const galleryViewBtn      = document.getElementById('gallery-view');
    const galleryModal        = document.getElementById('gallery-modal');
    const galleryGrid         = document.getElementById('gallery-grid');
    const galleryCloseBtns    = galleryModal.querySelectorAll('.modal-close, .close-modal-btn');

    const hamburgerBtn        = document.getElementById('hamburger-btn');
    const mobileMenu          = document.getElementById('mobile-menu');
    const mobileMenuCloseBtn  = document.getElementById('close-menu-btn');

    const fullscreenToggleBtn = document.getElementById('fullscreen-toggle');
    const zoomToggleBtn       = document.getElementById('zoom-toggle');

    // 3) State variables
    let currentTeam    = 1;
    let revealedCount  = 0;
    const totalTiles   = images.length;
    let lastFocused    = null;
    let activeTile     = null;
    let outsideElements = [];
    let zoomLevel      = 1;
    const ZOOM_STEP    = 0.1;

    // 4) Focus-trap helpers
    function getFocusable(container) {
        return Array.from(container.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        ));
    }
    function trapTabKey(e) {
        if (e.key !== 'Tab') return;
        const focusables = getFocusable(e.currentTarget);
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    // 5) Disable/restore outside focus
    function disableOutside(container) {
        const all = Array.from(document.querySelectorAll(
            'a[href], button:not(.modal *), textarea, input, select, [tabindex]'
        ));
        outsideElements = all
            .filter(el => !container.contains(el))
            .map(el => {
                const prevTab = el.getAttribute('tabindex');
                const prevDisabled = el.disabled;
                el.setAttribute('tabindex', '-1');
                if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') el.disabled = true;
                return { el, prevTab, prevDisabled };
            });
    }
    function restoreOutside() {
        outsideElements.forEach(({ el, prevTab, prevDisabled }) => {
            if (prevTab === null) el.removeAttribute('tabindex');
            else el.setAttribute('tabindex', prevTab);
            if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') el.disabled = prevDisabled;
        });
        outsideElements = [];
    }

    // 6) Open image modal
    function openImageModal(idx, tile) {
        lastFocused = document.activeElement;
        activeTile  = tile;

        // Update counters
        revealedCount++;
        imagesRevealedEl.textContent = revealedCount;
        questionsLeftEl.textContent = totalTiles - revealedCount;

        // Populate modal
        const { title, src, alt, q, a } = images[idx];
        imageQuestionTitle.textContent = `${title} — Team ${currentTeam}`;
        modalImage.src               = src;
        modalImage.alt               = alt;
        questionText.textContent     = q;
        answerText.textContent       = a || '[Respuesta pendiente]';

        // Reset zoom
        zoomLevel = 1;
        modalImage.style.transform = 'scale(1)';

        // Reset show-answer state
        answerSection.classList.add('hidden');
        showAnswerBtn.classList.remove('hidden');
        showAnswerBtn.setAttribute('aria-expanded', 'false');
        answerSection.setAttribute('aria-hidden', 'true');

        // Show modal
        disableOutside(modal);
        modal.style.setProperty('display', 'flex', 'important');
        modal.addEventListener('keydown', trapTabKey);

        // Focus check button
        imageQuestionTitle.focus();
    }

    // 7) Close image modal
    function closeImageModal(wasCorrect) {
        // Hide modal UI
        modal.style.setProperty('display', 'none', 'important');
        modal.removeEventListener('keydown', trapTabKey);
        restoreOutside();

        // Disable tile
        activeTile.classList.add('bg-gray-200', 'cursor-not-allowed', 'pointer-events-none');
        activeTile.removeAttribute('tabindex');
        activeTile.removeAttribute('role');
        activeTile.removeAttribute('aria-label');

        // Update score
        const scoreEl = currentTeam === 1 ? team1ScoreEl : team2ScoreEl;
        if (wasCorrect) {
            const pts = parseInt(scoreEl.textContent, 10) + 15;
            scoreEl.textContent = `${pts} points`;
        }

        // Switch turn
        currentTeam = currentTeam === 1 ? 2 : 1;
        currentTeamEl.textContent = `Team ${currentTeam}`;

        // Return focus
        const next = document.querySelector('#image-game-board [data-tile][tabindex="0"]');
        (next || lastFocused).focus();
    }

    // 8) Bind tiles
    tiles.forEach(tile => {
        const idx = Number(tile.dataset.tile) - 1;
        tile.addEventListener('click',  () => openImageModal(idx, tile));
        tile.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openImageModal(idx, tile);
            }
        });
    });

    // 9) Show Answer
    showAnswerBtn.addEventListener('click', () => {
        showAnswerBtn.classList.add('hidden');
        answerSection.classList.remove('hidden');
        showAnswerBtn.setAttribute('aria-expanded', 'true');
        answerSection.setAttribute('aria-hidden', 'false');
        answerSection.querySelector('[tabindex="0"]').focus();
    });

    // 10) Correct / Incorrect
    [correctBtn, incorrectBtn].forEach(btn => {
        btn.addEventListener('click', () => closeImageModal(btn === correctBtn));
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // 11) Zoom controls
    zoomInBtn.addEventListener('click', () => {
        zoomLevel += ZOOM_STEP;
        modalImage.style.transform = `scale(${zoomLevel})`;
    });
    zoomOutBtn.addEventListener('click', () => {
        zoomLevel = Math.max(0.5, zoomLevel - ZOOM_STEP);
        modalImage.style.transform = `scale(${zoomLevel})`;
    });
    zoomResetBtn.addEventListener('click', () => {
        zoomLevel = 1;
        modalImage.style.transform = 'scale(1)';
    });

    // 12) Fullscreen toggle
    fullscreenToggleBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    // 13) Gallery view of revealed images
    let revealedIndices = [];
    // track revealed tiles
    tiles.forEach(tile => {
        const idx = Number(tile.dataset.tile) - 1;
        tile.addEventListener('click', () => {
            if (!revealedIndices.includes(idx)) revealedIndices.push(idx);
        });
    });

    function openGallery() {
        // clear and populate gallery
        galleryGrid.innerHTML = '';
        revealedIndices.forEach(i => {
            const img = document.createElement('img');
            img.src = images[i].src;
            img.alt = images[i].alt;
            img.className = 'w-full rounded-lg shadow';
            galleryGrid.appendChild(img);
        });

        disableOutside(galleryModal);
        galleryModal.classList.remove('hidden');
        galleryModal.addEventListener('keydown', trapTabKey);
        galleryCloseBtns[0].focus();
    }
    function closeGallery() {
        galleryModal.classList.add('hidden');
        galleryModal.removeEventListener('keydown', trapTabKey);
        restoreOutside();
        lastFocused && lastFocused.focus();
    }
    galleryViewBtn.addEventListener('click', openGallery);
    galleryCloseBtns.forEach(btn => btn.addEventListener('click', closeGallery));

    // 14) Mobile menu
    mobileMenu.classList.add('hidden');
    hamburgerBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        mobileMenuCloseBtn.focus();
    });
    mobileMenuCloseBtn.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        hamburgerBtn.focus();
    });

    // 15) Hint mode (stub for future implementation)
    document.getElementById('hint-mode').addEventListener('click', () => {
        // TODO: implement hint overlay on tiles
        console.log('Hint mode toggled');
    });
});
