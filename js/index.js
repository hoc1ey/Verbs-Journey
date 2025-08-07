document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-button');
    const playModal = document.getElementById('play-modal');
    const closeHeader = document.getElementById('close-play-modal');
    const closeFooter = document.getElementById('close-play-modal-footer');

    let lastFocused;

    // Devuelve lista de nodos foco‐ables dentro de un contenedor
    function getFocusable(container) {
        return Array.from(
            container.querySelectorAll(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            )
        );
    }

    // Abre modal y gestiona foco
    function openModal() {
        lastFocused = document.activeElement;
        playModal.classList.remove('hidden');
        const focusables = getFocusable(playModal);
        focusables[0].focus(); // primer elemento foco‐able en modal

        // instala el trap de Tab
        playModal.addEventListener('keydown', trapTabKey);
    }

    // Cierra modal y restaura foco
    function closeModal() {
        playModal.classList.add('hidden');
        playModal.removeEventListener('keydown', trapTabKey);
        lastFocused && lastFocused.focus();
    }

    // Maneja Tab / Shift+Tab
    function trapTabKey(e) {
        if (e.key !== 'Tab') return;
        const focusables = getFocusable(playModal);
        const first = focusables[0];
        const last  = focusables[focusables.length - 1];
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

    // Abre con click o Enter en Play
    playBtn.addEventListener('click', openModal);
    playBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter') openModal();
    });

    // Cierra con botones de cabecera y pie
    [closeHeader, closeFooter].forEach(btn =>
        btn.addEventListener('click', closeModal)
    );

    // Cierra con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !playModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Nuevo: Shortcuts Modal
    const shortcutsBtn    = document.getElementById('shortcuts-btn');
    const shortcutsModal  = document.getElementById('shortcuts-modal');
    const shortcutsClose  = shortcutsModal.querySelector('.modal-close');
    let lastFocusedGlobal;

    function openShortcuts() {
        lastFocusedGlobal = document.activeElement;
        // Sobrescribimos el inline display:none !important
        shortcutsModal.style.setProperty('display', 'flex', 'important');

        shortcutsModal.classList.remove('hidden');
        const focusables = getFocusable(shortcutsModal);
        focusables[0].focus();
        shortcutsModal.addEventListener('keydown', trapTabKey);
    }

    function closeShortcuts() {
        // Restauramos el inline-style a hidden
        shortcutsModal.style.setProperty('display', 'none', 'important');

        shortcutsModal.classList.add('hidden');
        shortcutsModal.removeEventListener('keydown', trapTabKey);
        lastFocusedGlobal && lastFocusedGlobal.focus();
    }

    // Click o Enter en el botón flotante
    shortcutsBtn.addEventListener('click', openShortcuts);
    shortcutsBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter') openShortcuts();
    });

    // Cerrar con la “X”
    shortcutsClose.addEventListener('click', closeShortcuts);

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !shortcutsModal.classList.contains('hidden')) {
            closeShortcuts();
        }
    });

    // ——————————————————————————————————————————
    // Toggle respuestas y foco para cada tarjeta (show/hide)
    document.querySelectorAll('.toggle-answer-btn').forEach(btn => {
        const answerId = btn.getAttribute('aria-controls');
        const answerEl = document.getElementById(answerId);

        function toggleAnswer() {
            const isHidden = answerEl.classList.contains('hidden');
            if (isHidden) {
                // Mostrar
                answerEl.classList.remove('hidden');
                btn.setAttribute('aria-expanded', 'true');
                answerEl.focus();
            } else {
                // Ocultar
                answerEl.classList.add('hidden');
                btn.setAttribute('aria-expanded', 'false');
                btn.focus();
            }
        }

        btn.addEventListener('click', toggleAnswer);
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                toggleAnswer();
            }
        });
    });

    // ——————————————————————————————————————————
    // Redirect Play Mode cards to the right challenge
    document.querySelectorAll('.game-type-card').forEach(card => {
        const urlMap = {
            text:  'html/text-challenge.html',
            video: 'html/video-challenge.html',
            image: 'html/visual-discovery.html'
        };
        const mode = card.dataset.gameType;
        const target = urlMap[mode];
        if (!target) return;

        // clic
        card.addEventListener('click', () => {
            window.location.href = target;
        });

        // Enter o Space
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = target;
            }
        });
    });
});
