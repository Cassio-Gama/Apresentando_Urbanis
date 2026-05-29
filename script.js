document.addEventListener('DOMContentLoaded', () => {
    const scenes = document.querySelectorAll('.scene');
    
    // Intro Screen Elements
    const introScreen = document.getElementById('intro-screen');
    const presentationWrapper = document.getElementById('presentation-wrapper');
    const btnStart = document.getElementById('btn-start');
    const btnNotes = document.getElementById('btn-notes');

    // HUD — Dynamic Island
    const dynamicIsland = document.getElementById('dynamic-island');
    const islandSpeakerName = document.getElementById('island-speaker-name');
    const islandSpeakerDot = document.getElementById('island-speaker-dot');

    // Notes
    const notesOverlay = document.getElementById('notes-overlay');
    const notesContent = document.querySelector('.notes-content');

    // Restart Modal
    const restartModal = document.getElementById('restart-modal');
    const btnCancelRestart = document.getElementById('btn-cancel-restart');
    const btnConfirmRestart = document.getElementById('btn-confirm-restart');

    let currentScene = 0;
    let isAnimating = false;
    let isStarted = false; 
    let showNotes = false;

    const animationLockTime = 1000; 

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
    // PERSISTÊNCIA (SAFE MODE - SISTEMA DE ACIDENTES)
    // =============================================
    function saveState() {
        if (!isStarted) return;
        const state = {
            slide: currentScene,
            started: true
        };
        localStorage.setItem('urbanis_state', JSON.stringify(state));
    }

    function clearState() {
        localStorage.removeItem('urbanis_state');
    }

    function checkRecoveryState() {
        const json = localStorage.getItem('urbanis_state');
        let shouldAutoStart = false;
        let slideToLoad = 0;

        if (json) {
            try {
                const saved = JSON.parse(json);
                if (saved.started) {
                    shouldAutoStart = true;
                    slideToLoad = saved.slide;
                }
            } catch (e) {}
        }

        if (shouldAutoStart) {
            currentScene = slideToLoad;
            
            const loader = document.getElementById('cinematic-loader');
            if (loader) {
                // Fade out ultra-rápido de acidente (0.5s)
                loader.style.transition = 'none';
                loader.classList.add('active');
                
                startPresentationInstant(true);
                
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        loader.style.transition = 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                        setTimeout(() => {
                            loader.classList.remove('active');
                        }, 500);
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
                    loader.style.transition = 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    loader.classList.add('active');
                    setTimeout(() => {
                        startPresentationInstant();
                        setTimeout(() => loader.classList.remove('active'), 500);
                    }, 2500);
                } else {
                    startPresentationInstant();
                }
            });
        }
        if (btnNotes) {
            btnNotes.addEventListener('click', () => toggleNotes());
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
        }
        updateScenes();
    }

    function updateScenes() {
        scenes.forEach((scene, index) => {
            scene.classList.remove('active', 'past', 'future');
            const videos = scene.querySelectorAll('video');

            if (index === currentScene) {
                scene.classList.add('active');
                updatePresenterTools(scene);
                
                videos.forEach(v => {
                    v.currentTime = 0;
                    v.play().catch(() => {});
                });
            } else {
                if (index < currentScene) {
                    scene.classList.add('past');
                } else {
                    scene.classList.add('future');
                }
                
                videos.forEach(v => {
                    v.pause();
                });
            }
        });
        saveState();
    }

    function updatePresenterTools(activeScene) {
        const name = activeScene.getAttribute('data-speaker') || 'Urbanis';
        const notes = activeScene.getAttribute('data-notes') || 'Sem notas para este slide.';
        
        // Dynamic Island Animation
        if (islandSpeakerName.textContent !== name) {
            dynamicIsland.classList.add('island-animating');
            
            setTimeout(() => {
                islandSpeakerName.textContent = name;
                
                // Color mapping
                islandSpeakerDot.className = 'speaker-dot-color'; // reset
                const normalized = name.toLowerCase().replace('á', 'a');
                if (['luiz', 'pedro', 'renan', 'henrique', 'cassio'].includes(normalized)) {
                    islandSpeakerDot.classList.add(`speaker-${normalized}`);
                }
                
                dynamicIsland.classList.remove('island-animating');
            }, 300);
        } else {
            // First run, just set it
            const normalized = name.toLowerCase().replace('á', 'a');
            islandSpeakerDot.className = 'speaker-dot-color';
            if (['luiz', 'pedro', 'renan', 'henrique', 'cassio'].includes(normalized)) {
                islandSpeakerDot.classList.add(`speaker-${normalized}`);
            }
        }

        if (notesContent) {
            notesContent.textContent = notes;
        }
    }

    // =============================================
    // NAVEGAÇÃO E CONTROLES BÁSICOS
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
        if (showNotes) {
            if(notesOverlay) notesOverlay.classList.remove('hidden');
        } else {
            if(notesOverlay) notesOverlay.classList.add('hidden');
        }
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else if (document.exitFullscreen) document.exitFullscreen();
    }

    // =============================================
    // EVENTOS (HOTKEYS MINIMALISTAS)
    // =============================================
    function setupEvents() {
        
        // Modal de Restart actions
        if(btnCancelRestart) btnCancelRestart.addEventListener('click', () => restartModal.classList.add('hidden'));
        if(btnConfirmRestart) btnConfirmRestart.addEventListener('click', () => {
            clearState(); location.reload();
        });

        document.addEventListener('keydown', (e) => {
            if (!isStarted) return;
            
            // Ignorar atalhos se o modal de reiniciar estiver aberto
            if (!restartModal.classList.contains('hidden')) {
                if (e.key === 'Escape') restartModal.classList.add('hidden');
                return;
            }

            // F → Fullscreen
            if (e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFullScreen(); return; }

            // H → Home
            if (e.key.toLowerCase() === 'h') { e.preventDefault(); returnToHome(); return; }

            // R → Confirmação de Restart
            if (e.key.toLowerCase() === 'r') {
                e.preventDefault();
                restartModal.classList.remove('hidden');
                return;
            }

            // ->, <- → Navegação
            if (['ArrowRight'].includes(e.key)) {
                e.preventDefault(); nextScene();
            } else if (['ArrowLeft'].includes(e.key)) {
                e.preventDefault(); prevScene();
            }
        });

        // Touch Navigation
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
