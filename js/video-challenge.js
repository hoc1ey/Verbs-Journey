// video-challenge.js
document.addEventListener('DOMContentLoaded', () => {
    // 1) Tus datos de video (añadida 't' para ruta de subtítulos/transcripción)
    const videos = [
        {
            l: 'https://www.youtube.com/embed/7V8oFI4GYMY?si=_69VGfq50iXYKd9o',
            q: 'What is the main topic discussed in this video?',
            a: 'The main topic is sustainable development and environmental protection.',
            t: '../resources/VID1.txt'
        },
        {
            l: 'https://www.youtube.com/embed/DHAI_gR0HgA?si=mUrpfWj2-4leHOag',
            q: 'Which technique was demonstrated in the video?',
            a: 'The video demonstrates active listening techniques for better communication',
            t: '../resources/VID2.txt'
        },
        {
            l: 'https://www.youtube.com/embed/19bsbbyklOc?si=0NhJk3nMR7Vw06Rc',
            q: 'What was the conclusion of the experiment shown?',
            a: 'The experiment concluded that collaborative learning improves retention by 40%.',
            t: '../resources/VID3.txt'
        },
        {
            l: 'https://www.youtube.com/embed/iONDebHX9qk?si=4TxINsq9rM9c5xzO',
            q: 'What problem was solved in the video?',
            a: 'The video solved the problem of effective time management in academic settings.',
            t: '../resources/VID4.txt'
        },
        {
            l: 'https://www.youtube.com/embed/75GFzikmRY0?si=r2ZPyIjCO7ciKEms',
            q: 'What new concept was introduced?',
            a: 'The concept of growth mindset was introduced as a learning strategy.',
            t: '../resources/VID5.txt'
        },
        {
            l: 'https://www.youtube.com/embed/fV-F8FVH868?si=DVkOkTTR6vi_mS5b',
            q: 'What was the key takeaway from the presentation?',
            a: 'The key takeaway is that practice and feedback are essential for skill development.',
            t: '../resources/VID6.txt'
        },
    ];

    // 2) Selectores
    const tiles               = document.querySelectorAll('#video-game-board [role="button"]');
    const modal               = document.getElementById('video-question-modal');
    const iframe              = modal.querySelector('iframe');
    const questionText        = document.getElementById('video-question-text');
    const showBtn             = document.getElementById('show-video-answer-btn');
    const answerSection       = document.getElementById('video-answer-section');
    const answerText          = document.getElementById('video-answer-text');
    const transcriptSection   = document.getElementById('video-transcript-section');
    const toggleTranscriptBtn = document.getElementById('toggle-transcript-btn');
    const correctBtn          = document.getElementById('video-correct-btn');
    const incorrectBtn        = document.getElementById('video-incorrect-btn');

    const team1Container = document.getElementById('team1-container');
    const team2Container = document.getElementById('team2-container');
    const team1ScoreEl   = document.getElementById('team1-score');
    const team2ScoreEl   = document.getElementById('team2-score');
    const currentTeamEl  = document.getElementById('current-team');

    let lastFocused, activeTile, currentTeam = 1;
    let outsideElements = [];

    // 3) Helpers de foco
    function getFocusable(container) {
        return Array.from(
            container.querySelectorAll(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            )
        );
    }
    function trapTabKey(e) {
        if (e.key !== 'Tab') return;
        const focusables = getFocusable(modal);
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
    }

    // 4) Deshabilitar fuera del modal
    function disableOutside() {
        const all = Array.from(document.querySelectorAll(
            'a[href], button:not(.modal *), textarea, input, select, [tabindex]'
        ));
        outsideElements = all
            .filter(el => !modal.contains(el))
            .map(el => {
                const prevTab     = el.getAttribute('tabindex');
                const prevDisabled = el.disabled;
                el.setAttribute('tabindex','-1');
                if (el.tagName==='BUTTON'||el.tagName==='INPUT') el.disabled = true;
                return { el, prevTab, prevDisabled };
            });
    }
    function restoreOutside() {
        outsideElements.forEach(({el, prevTab, prevDisabled}) => {
            if (prevTab === null) el.removeAttribute('tabindex');
            else el.setAttribute('tabindex', prevTab);
            if (el.tagName==='BUTTON'||el.tagName==='INPUT') el.disabled = prevDisabled;
        });
        outsideElements = [];
    }

    // 5) Abrir modal
    function openModal(idx, tile) {
        lastFocused = document.activeElement;
        activeTile  = tile;

        // Rellenar
        iframe.src               = videos[idx].l;
        questionText.textContent = videos[idx].q;
        answerText.textContent   = videos[idx].a;

        // Reset respuesta + transcript
        answerSection.classList.add('hidden');
        showBtn.classList.remove('hidden');
        showBtn.setAttribute('aria-expanded','false');
        answerSection.setAttribute('aria-hidden','true');

        transcriptSection.classList.add('hidden');
        toggleTranscriptBtn.setAttribute('aria-expanded','false');
        transcriptSection.setAttribute('aria-hidden','true');
        transcriptSection.querySelector('p').textContent = ''; // limpiar

        // Carga transcripción
        const tUrl = videos[idx].t;
        if (tUrl) {
            fetch(tUrl)
                .then(res => res.text())
                .then(txt => {
                    transcriptSection.querySelector('p').textContent = txt;
                })
                .catch(() => {
                    transcriptSection.querySelector('p').textContent = '[Error cargando transcripción]';
                });
        }

        // Deshabilitar UI externa y mostrar modal
        disableOutside();
        modal.style.setProperty('display','flex','important');
        modal.addEventListener('keydown', trapTabKey);

        // Foco en “Show Answer”
        showBtn.focus();
    }

    // 6) Cerrar modal
    function closeModal(wasCorrect) {
        // Reset respuesta + transcript
        answerSection.classList.add('hidden');
        showBtn.classList.remove('hidden');
        showBtn.setAttribute('aria-expanded','false');
        answerSection.setAttribute('aria-hidden','true');

        transcriptSection.classList.add('hidden');
        toggleTranscriptBtn.setAttribute('aria-expanded','false');
        transcriptSection.setAttribute('aria-hidden','true');

        // Ocultar modal y restaurar UI
        modal.style.setProperty('display','none','important');
        modal.removeEventListener('keydown', trapTabKey);
        restoreOutside();

        // Limpiar iframe
        iframe.src = '';

        // Marcar tarjeta respondida
        activeTile.classList.remove(
            'bg-gradient-to-br','from-purple-600','to-blue-600',
            'hover:shadow-xl','hover:scale-105','shadow-lg'
        );
        activeTile.classList.add('bg-gray-400','cursor-not-allowed','pointer-events-none','text-gray-500');
        activeTile.removeAttribute('tabindex');
        activeTile.removeAttribute('role');
        activeTile.removeAttribute('aria-label');
        activeTile.removeEventListener('click', activeTile._handler);

        // Sumar puntos
        if (wasCorrect) {
            const ptsEl = currentTeam === 1 ? team1ScoreEl : team2ScoreEl;
            const pts = parseInt(ptsEl.textContent,10) + 15;
            ptsEl.textContent = `${pts} points`;
        }

        // Cambiar turno y ring
        if (currentTeam === 1) {
            team1Container.classList.remove('ring-4','ring-pink-400');
            team2Container.classList.add('ring-4','ring-blue-400');
            currentTeam = 2;
        } else {
            team2Container.classList.remove('ring-4','ring-blue-400');
            team1Container.classList.add('ring-4','ring-pink-400');
            currentTeam = 1;
        }
        currentTeamEl.textContent = `Team ${currentTeam}`;

        // Focus al primer vídeo aún seleccionable
        const first = document.querySelector('#video-game-board [role="button"][tabindex="0"]');
        if (first) first.focus();
        else if (lastFocused) lastFocused.focus();
    }

    // 7) Bind a cada tarjeta
    tiles.forEach((tile, idx) => {
        const handler = () => openModal(idx, tile);
        tile._handler = handler;
        tile.addEventListener('click', handler);
        tile.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler();
            }
        });
    });

    // 8) Show Answer
    showBtn.addEventListener('click', () => {
        showBtn.classList.add('hidden');
        answerSection.classList.remove('hidden');
        showBtn.setAttribute('aria-expanded','true');
        answerSection.setAttribute('aria-hidden','false');
        answerSection.querySelector('[tabindex="0"]').focus();
    });

    showBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            showBtn.click();
        }
    });

    // 9) Toggle Transcript
    toggleTranscriptBtn.addEventListener('click', () => {
        const hidden = transcriptSection.classList.toggle('hidden');
        toggleTranscriptBtn.setAttribute('aria-expanded', String(!hidden));
        transcriptSection.setAttribute('aria-hidden', String(hidden));
        if (!hidden) transcriptSection.focus();
    });

    // 10) Correct / Incorrect
    [correctBtn, incorrectBtn].forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn === correctBtn));
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btn.click();
            }
        });
    });
});
