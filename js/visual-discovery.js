// visual-discovery.js

document.addEventListener('DOMContentLoaded', () => {
    // 1) Data: titles, image paths, questions (answers to be filled later)
    const images = [
        { title: 'Nature Scene',       src: '../img/IMG1.jpeg', alt: 'Nature Scene',       q: 'What do you see in this image?', a: '' },
        { title: 'City Skyline',       src: '../img/IMG2.jpeg', alt: 'City Skyline',       q: 'What do you see in this image?', a: '' },
        { title: 'Mountain View',      src: '../img/IMG3.jpeg', alt: 'Mountain View',      q: 'What do you see in this image?', a: '' },
        { title: 'Tropical Beach',     src: '../img/IMG4.jpeg', alt: 'Tropical Beach',     q: 'What do you see in this image?', a: '' },
        { title: 'Desert Landscape',   src: '../img/IMG5.jpeg', alt: 'Desert Landscape',   q: 'What do you see in this image?', a: '' },
        { title: 'Forest Path',        src: '../img/IMG6.jpeg', alt: 'Forest Path',        q: 'What do you see in this image?', a: '' },
        { title: 'Underwater Reef',    src: '../img/IMG7.jpeg', alt: 'Underwater Reef',    q: 'What do you see in this image?', a: '' },
        { title: 'Snowy Mountain',     src: '../img/IMG8.jpeg', alt: 'Snowy Mountain',     q: 'What do you see in this image?', a: '' },
        { title: 'Autumn Leaves',      src: '../img/IMG9.jpeg', alt: 'Autumn Leaves',      q: 'What do you see in this image?', a: '' },
        { title: 'Starry Night',       src: '../img/IMG10.jpeg', alt: 'Starry Night',      q: 'What do you see in this image?', a: '' },
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
        showAnswerBtn.focus();
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
