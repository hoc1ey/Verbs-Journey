// text-challenge.js
document.addEventListener('DOMContentLoaded', () => {
    // 1) Datos de preguntas/respuestas
    const qa = [
        { q: "I didn't even bother ____ (ask).",               a: "I didn't even bother TO ASK / ASKING." },
        { q: "I hate ____ (do) the dishes!",                   a: "I hate TO DO / DOING the dishes!" },
        { q: "I prefer ____ (work) in teams.",                 a: "I prefer TO WORK / WORKING in teams." },
        { q: "We can't continue ____ (ignore) the Earth's issues.", a: "We can't continue TO IGNORE / IGNORING the Earth's issues." },
        { q: "Chris likes ____ (go out).",                     a: "Chris likes TO GO OUT / GOING OUT." },
        { q: "You need to start ____ (study) harder.",         a: "You need to start TO STUDY / STUDYING harder." },
        { q: "I can't bear ____ (see) homeless people or animals.", a: "I can't bear TO SEE / SEEING homeless people or animals." },
        { q: "They decided ____ (postpone) the meeting.",       a: "They decided TO POSTPONE the meeting." },
        { q: "She enjoys ____ (read) mystery novels.",         a: "She enjoys READING mystery novels." },
        { q: "We hope ____ (visit) Paris next year.",          a: "We hope TO VISIT Paris next year." }
    ];

    // 2) Selectores
    const tiles          = document.querySelectorAll('.game-tile');
    const modal          = document.getElementById('question-modal');
    const questionTeam   = document.getElementById('question-team');
    const questionText   = document.getElementById('question-text');
    const checkBtn       = document.getElementById('check-answer-btn');
    const answerSection  = document.getElementById('answer-section');
    const answerText     = document.getElementById('answer-text');
    const correctBtn     = document.getElementById('correct-btn');
    const incorrectBtn   = document.getElementById('incorrect-btn');

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

    // 4) Deshabilitar todo fuera del modal
    function disableOutside() {
        // selecciona todo lo foco‐able fuera del modal
        const all = Array.from(document.querySelectorAll(
            'a[href], button:not(.modal *), textarea, input, select, [tabindex]'));
        outsideElements = all.filter(el => !modal.contains(el)).map(el => {
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

    // 5) Abre modal
    function openModal(index, tile) {
        lastFocused = document.activeElement;
        activeTile  = tile;

        // rellena
        questionTeam.textContent = `Team ${currentTeam}`;
        questionText .textContent = qa[index].q;
        answerText   .textContent = qa[index].a;

        // estado inicial
        answerSection.classList.add('hidden');
        checkBtn.classList.remove('hidden');

        // deshabilita el resto y muestra modal
        disableOutside();
        modal.style.setProperty('display', 'flex', 'important');
        modal.addEventListener('keydown', trapTabKey);

        // foco al botón
        checkBtn.focus();
    }

    // 6) Cierra modal
    function closeModal(wasCorrect) {
        // reset de vista
        answerSection.classList.add('hidden');
        checkBtn.classList.remove('hidden');

        // oculta modal y restaura UI
        modal.style.setProperty('display', 'none', 'important');
        modal.removeEventListener('keydown', trapTabKey);
        restoreOutside();

        // marca tarjeta respondida
        activeTile.classList.add('bg-gray-200', 'cursor-not-allowed');
        activeTile.removeAttribute('tabindex');
        activeTile.removeAttribute('role');
        activeTile.removeAttribute('aria-label');

        // suma puntos
        if (wasCorrect) {
            if (currentTeam === 1) {
                const pts = parseInt(team1ScoreEl.textContent, 10) + 15;
                team1ScoreEl.textContent = `${pts} points`;
            } else {
                const pts = parseInt(team2ScoreEl.textContent, 10) + 15;
                team2ScoreEl.textContent = `${pts} points`;
            }
        }

        // cambia turno y ring
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

        // devuelve foco a la próxima tarjeta
        const next = document.querySelector('.game-tile[tabindex="0"]');
        if (next) next.focus();
    }

    // 7) Listeners en tarjetas
    tiles.forEach(tile => {
        const idx = +tile.dataset.tile - 1;
        tile.addEventListener('click',  () => openModal(idx, tile));
        tile.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(idx, tile);
            }
        });
    });

    // 8) “Check Answer”
    checkBtn.addEventListener('click', () => {
        checkBtn.classList.add('hidden');
        answerSection.classList.remove('hidden');
        answerSection.querySelector('[tabindex="0"]').focus();
    });
    checkBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkBtn.click();
        }
    });

    // 9) “Correct” / “Incorrect”
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
