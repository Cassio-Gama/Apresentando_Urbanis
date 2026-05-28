document.addEventListener('DOMContentLoaded', () => {
    const scenes = document.querySelectorAll('.scene');
    const progressBar = document.querySelector('.progress-fill');
    
    // Intro Screen Elements
    const introScreen = document.getElementById('intro-screen');
    const presentationWrapper = document.getElementById('presentation-wrapper');
    const btnStart = document.getElementById('btn-start');
    const btnNotes = document.getElementById('btn-notes');

    // HUD — Dynamic Island
    const dynamicIsland = document.getElementById('dynamic-island');
    const islandSpeakerName = document.getElementById('island-speaker-name');
    const islandSlideTime = document.getElementById('island-slide-time');
    const islandGlobalTime = document.getElementById('island-global-time');
    const islandBarFill = document.getElementById('island-bar-fill');

    // Notes
    const notesOverlay = document.getElementById('notes-overlay');
    const notesContent = document.querySelector('.notes-content');
    const notesSpeaker = document.querySelector('.notes-speaker');

    // Rehearsal Panel
    const rehearsalPanel = document.getElementById('rehearsal-panel');
    const rTotalTime = document.getElementById('r-total-time');
    const rDeltaTime = document.getElementById('r-delta-time');
    const rSlideCurrent = document.getElementById('r-slide-current');
    const rNextSpeaker = document.getElementById('r-next-speaker');

    let currentScene = 0;
    let isAnimating = false;
    let isStarted = false; 
    let presentationTimerInterval;
    let globalSeconds = 300; // 5 minutos regressivo
    let isTimerPaused = false;
    
    let slideSeconds = 0;
    let currentSlideDuration = 0;
    const animationLockTime = 1000; 
    let showRehearsal = false;
    let showNotes = false;

    // =============================================
    // INIT
    // =============================================
    function init() {
        checkRecoveryState();
        if (!isStarted) {
            updateScenes(true);
        }
        setupEvents();
        setupIntro();
    }

    // =============================================
    // FORMATAÇÃO
    // =============================================
    function fmtTime(totalSec) {
        const abs = Math.abs(totalSec);
        const m = Math.floor(abs / 60);
        const s = abs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function fmtGlobal(sec) {
        if (sec < 0) return `+${fmtTime(sec)}`;
        return fmtTime(sec);
    }

    function formatDelta(s) {
        if (s > 0) return `+${s}s`;
        return `${s}s`;
    }

    // =============================================
    // PERSISTÊNCIA (SAFE MODE)
    // =============================================
    function saveState() {
        if (!isStarted) return;
        const state = {
            slide: currentScene,
            started: true,
            globalSec: globalSeconds,
            slideSec: slideSeconds,
            paused: isTimerPaused,
            islandVisible: !dynamicIsland.classList.contains('hidden'),
            rehearsalVisible: showRehearsal,
            notesVisible: !notesOverlay.classList.contains('hidden')
        };
        localStorage.setItem('urbanis_state', JSON.stringify(state));
        window.location.hash = `slide-${currentScene + 1}`;
    }

    function clearState() {
        localStorage.removeItem('urbanis_state');
        window.location.hash = '';
    }

    function checkRecoveryState() {
        const hash = window.location.hash;
        let slideToLoad = null;
        let shouldAutoStart = false;

        if (hash && hash.startsWith('#slide-')) {
            slideToLoad = parseInt(hash.replace('#slide-', '')) - 1;
        }

        const json = localStorage.getItem('urbanis_state');
        let saved = null;

        if (json) {
            try {
                saved = JSON.parse(json);
                if (saved.started) {
                    shouldAutoStart = true;
                    if (slideToLoad === null) slideToLoad = saved.slide;
                }
            } catch (e) {}
        }

        if (shouldAutoStart && slideToLoad !== null) {
            currentScene = slideToLoad;
            globalSeconds = saved ? saved.globalSec : 300;
            slideSeconds = saved ? saved.slideSec : 0;
            isTimerPaused = saved ? saved.paused : false;
            showRehearsal = saved ? saved.rehearsalVisible : false;
            
            const loader = document.getElementById('cinematic-loader');
            if (loader) {
                loader.style.transition = 'none';
                loader.classList.add('active');
                
                startPresentationInstant(true);
                
                if (saved) {
                    if (!saved.islandVisible) dynamicIsland.classList.add('hidden');
                    if (showRehearsal) rehearsalPanel.classList.remove('hidden');
                    if (saved.notesVisible) toggleNotes();
                }
                
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        loader.style.transition = '';
                        setTimeout(() => {
                            loader.classList.remove('active');
                        }, 600);
                    });
                });
            } else {
                startPresentationInstant(true);
            }
        }
    }

    // =============================================
    // INTRO / LOBBY
    // =============================================
    function setupIntro() {
        if (btnStart) {
            btnStart.addEventListener('click', () => {
                if (isStarted) return;
                clearState();
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => {});
                }
                const loader = document.getElementById('cinematic-loader');
                if (loader) {
                    loader.classList.add('active');
                    setTimeout(() => {
                        startPresentationInstant();
                        setTimeout(() => loader.classList.remove('active'), 500);
                    }, 3500); 
                } else {
                    startPresentationInstant();
                }
            });
        }
        if (btnNotes) {
            btnNotes.addEventListener('click', () => toggleNotes());
        }
        const btnInstructions = document.getElementById('btn-instructions');
        const modalInstructions = document.getElementById('instructions-modal');
        const btnCloseInstructions = document.getElementById('btn-close-instructions');
        if (btnInstructions) {
            btnInstructions.addEventListener('click', () => modalInstructions.classList.remove('hidden'));
        }
        if (btnCloseInstructions) {
            btnCloseInstructions.addEventListener('click', () => modalInstructions.classList.add('hidden'));
        }
    }

    // =============================================
    // APRESENTAÇÃO
    // =============================================
    function startPresentationInstant(isRestore = false) {
        isStarted = true;
        introScreen.style.display = 'none';
        presentationWrapper.classList.add('cinematic-reveal-wrapper');
        presentationWrapper.classList.remove('hidden-start');
        presentationWrapper.classList.add('started');
        dynamicIsland.classList.remove('hidden');
        
        if (!isRestore) {
            currentScene = 0;
            globalSeconds = 300;
            slideSeconds = 0;
            isTimerPaused = false;
        }
        startGlobalTimer();
        updateScenes();
    }

    function updateScenes() {
        scenes.forEach((scene, index) => {
            scene.classList.remove('active', 'past', 'future');
            if (index === currentScene) {
                scene.classList.add('active');
                updatePresenterTools(scene);
            } else if (index < currentScene) {
                scene.classList.add('past');
            } else {
                scene.classList.add('future');
            }
        });
        progressBar.style.width = `${(currentScene / (scenes.length - 1)) * 100}%`;
        saveState();
    }

    function parseDuration(str) {
        if (!str) return 30;
        return parseInt(str.replace('s', ''));
    }

    function updatePresenterTools(activeScene) {
        const name = activeScene.getAttribute('data-speaker') || 'Urbanis';
        const dur = activeScene.getAttribute('data-duration') || '30';
        const notes = activeScene.getAttribute('data-notes') || 'Sem notas para este slide.';
        
        if (islandSpeakerName.textContent !== name) {
            islandSpeakerName.textContent = name;
            dynamicIsland.classList.add('expanding');
            setTimeout(() => dynamicIsland.classList.remove('expanding'), 500);
        }

        notesSpeaker.textContent = `Apresentador: ${name}`;
        notesContent.textContent = notes;
        
        slideSeconds = 0;
        currentSlideDuration = parseDuration(dur);
        updateIslandDisplay();
        updateRehearsalPanel();
    }

    // =============================================
    // ISLAND DISPLAY — CORE VISUAL UPDATE
    // =============================================
    function updateIslandDisplay() {
        // --- Slide Time ---
        islandSlideTime.textContent = `(${fmtTime(slideSeconds)})`;

        // --- Global Time ---
        islandGlobalTime.textContent = fmtGlobal(globalSeconds);
        islandGlobalTime.style.color = globalSeconds < 0 ? '#EE0000' : '#F5F5F7';

        // --- Progress Bar Color (based on slide) ---
        const dur = currentSlideDuration;
        if (dur <= 0) return;

        const pct = slideSeconds / dur; // 0..1+
        let barColor = '#30D158'; // verde

        if (dur <= 25) {
            // Slides curtos: percentual puro
            if (pct >= 0.8) barColor = '#FF453A';
            else if (pct >= 0.5) barColor = '#FFD60A';
        } else {
            // Slides longos: últimos 10s são vermelhos
            const remaining = dur - slideSeconds;
            if (remaining <= 0) barColor = '#EE0000';
            else if (remaining <= 10) barColor = '#FF453A';
            else if (pct >= 0.5) barColor = '#FFD60A';
        }

        // Se estourou o tempo do slide
        if (slideSeconds > dur) barColor = '#EE0000';

        // Se o global estourou, força vermelho intenso
        if (globalSeconds < 0) barColor = '#EE0000';

        // --- Aplicar Barra ---
        const fillPct = Math.min(pct * 100, 100);
        islandBarFill.style.width = `${fillPct}%`;
        islandBarFill.style.backgroundColor = isTimerPaused ? 'rgba(255,255,255,0.15)' : barColor;

        // Pulso sutil ao estourar o slide
        if (slideSeconds > dur) {
            islandBarFill.style.boxShadow = `0 0 8px ${barColor}`;
        } else {
            islandBarFill.style.boxShadow = 'none';
        }

        // --- Rehearsal Updates ---
        if (rTotalTime) rTotalTime.textContent = fmtGlobal(globalSeconds);
        if (rDeltaTime) {
            let idealElapsed = 0;
            for (let i = 0; i < currentScene; i++) {
                idealElapsed += parseDuration(scenes[i].getAttribute('data-duration'));
            }
            idealElapsed += slideSeconds;
            const realElapsed = 300 - globalSeconds;
            const delta = realElapsed - idealElapsed;
            rDeltaTime.textContent = formatDelta(delta);
            rDeltaTime.style.color = barColor;
        }
    }

    function updateRehearsalPanel() {
        if (rSlideCurrent) rSlideCurrent.textContent = `${currentScene + 1} / ${scenes.length}`;
        if (rNextSpeaker) {
            if (currentScene + 1 < scenes.length) {
                const ns = scenes[currentScene + 1].getAttribute('data-speaker') || 'N/A';
                const nr = scenes[currentScene + 1].getAttribute('data-role') || '';
                rNextSpeaker.textContent = nr ? `${ns} (${nr})` : ns;
            } else {
                rNextSpeaker.textContent = 'FIM';
            }
        }
    }

    // =============================================
    // TIMER GLOBAL
    // =============================================
    function startGlobalTimer() {
        if (presentationTimerInterval) clearInterval(presentationTimerInterval);
        presentationTimerInterval = setInterval(() => {
            if (isTimerPaused) return;
            globalSeconds--;
            slideSeconds++;
            updateIslandDisplay();
            if (globalSeconds % 5 === 0) saveState();
        }, 1000);
    }

    function resetGlobalTimer() {
        globalSeconds = 300;
        slideSeconds = 0;
        isTimerPaused = false;
        updateIslandDisplay();
    }

    function stopGlobalTimer() {
        if (presentationTimerInterval) clearInterval(presentationTimerInterval);
    }

    // =============================================
    // NAVEGAÇÃO
    // =============================================
    function returnToHome() {
        isStarted = false;
        currentScene = 0;
        presentationWrapper.classList.remove('started', 'cinematic-reveal-wrapper');
        presentationWrapper.classList.add('hidden-start');
        
        saveState();
        const str = localStorage.getItem('urbanis_state');
        if (str) {
            const obj = JSON.parse(str);
            obj.started = false;
            localStorage.setItem('urbanis_state', JSON.stringify(obj));
        }
        
        dynamicIsland.classList.add('hidden');
        rehearsalPanel.classList.add('hidden');
        stopGlobalTimer();
        
        scenes.forEach(scene => {
            scene.classList.remove('active');
            const v = scene.querySelector('video');
            if (v) v.pause();
        });
        
        introScreen.style.display = 'flex';
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }

    function nextScene() {
        if (isAnimating) return;
        if (currentScene >= scenes.length - 1) { returnToHome(); return; }
        isAnimating = true;
        currentScene++;
        updateScenes();
        setTimeout(() => isAnimating = false, animationLockTime);
    }

    function prevScene() {
        if (isAnimating || currentScene <= 0) return;
        isAnimating = true;
        currentScene--;
        updateScenes();
        setTimeout(() => isAnimating = false, animationLockTime);
    }

    function toggleNotes() {
        showNotes = !showNotes;
        if (showNotes) notesOverlay.classList.remove('hidden');
        else notesOverlay.classList.add('hidden');
        saveState();
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else if (document.exitFullscreen) document.exitFullscreen();
    }

    // =============================================
    // EVENTOS
    // =============================================
    function setupEvents() {
        document.addEventListener('keydown', (e) => {
            if (!isStarted) return;

            switch (e.key.toLowerCase()) {
                case 'n': toggleNotes(); return;
                case 's': dynamicIsland.classList.toggle('hidden'); saveState(); return;
                case 'e':
                    showRehearsal = !showRehearsal;
                    showRehearsal ? rehearsalPanel.classList.remove('hidden') : rehearsalPanel.classList.add('hidden');
                    saveState(); return;
                case 'f': toggleFullScreen(); return;
            }

            if (e.key === 't') { isTimerPaused = !isTimerPaused; updateIslandDisplay(); saveState(); return; }
            if (e.key === 'T') { resetGlobalTimer(); saveState(); return; }
            if (e.key === 'Escape') { returnToHome(); return; }
            if (e.key === 'R') {
                if (confirm("Reiniciar completamente? Todo o progresso será perdido.")) {
                    clearState(); location.reload();
                }
                return;
            }

            if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
                e.preventDefault(); nextScene();
            } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
                e.preventDefault(); prevScene();
            }
        });

        document.querySelector('.nav-btn.next').addEventListener('click', nextScene);
        document.querySelector('.nav-btn.prev').addEventListener('click', prevScene);

        let touchStartX = 0, touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            if (!isStarted) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!isStarted) return;
            const dx = touchStartX - e.changedTouches[0].clientX;
            const dy = touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 50) nextScene(); else if (dx < -50) prevScene();
            } else {
                if (dy > 50) nextScene(); else if (dy < -50) prevScene();
            }
        }, { passive: true });
    }

    init();
});
