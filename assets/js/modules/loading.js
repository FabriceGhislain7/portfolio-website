/*
===========================================
LOADING MODULE
===========================================
Gestisce il loading screen e le animazioni di caricamento
*/

(function() {
    'use strict';

    /* ================================ */
    /* STATO DEL MODULO                 */
    /* ================================ */
    const LoadingState = {
        isLoading: true,
        loadingScreen: null,
        progressBar: null,
        percentageElement: null,
        currentProgress: 0,
        targetProgress: 0,
        animationFrame: null,
        startTime: performance.now(),
        minLoadingTime: null,
        resourcesLoaded: 0,
        totalResources: 0,
        particles: [],
        isInitialized: false
    };

    /* ================================ */
    /* MODULO PRINCIPALE                */
    /* ================================ */
    const LoadingModule = {
        
        /* ================================ */
        /* INIZIALIZZAZIONE                 */
        /* ================================ */
        init() {
            if (LoadingState.isInitialized) {
                window.PortfolioConfig.utils.log('warn', 'Loading module already initialized');
                return;
            }

            try {
                window.PortfolioConfig.utils.log('info', 'Initializing Loading module');
                this.setupDOMElements();
                this.setupConfiguration();
                this.setupAnimations();
                this.setupResourceMonitoring();
                this.setupEventListeners();
                this.startLoading();
                
                LoadingState.isInitialized = true;
                window.PortfolioConfig.utils.log('info', 'Loading module initialized successfully');
                
            } catch (error) {
                window.PortfolioConfig.utils.log('error', 'Loading module initialization failed', error);
                this.handleError(error);
            }
        },

        /* ================================ */
        /* SETUP DOM ELEMENTS               */
        /* ================================ */
        setupDOMElements() {
            LoadingState.loadingScreen = document.getElementById('loading-screen');
            LoadingState.progressBar = document.querySelector('.loading-progress-bar');
            LoadingState.percentageElement = document.querySelector('.loading-percentage');
            
            if (!LoadingState.loadingScreen) {
                window.PortfolioConfig.utils.log('warn', 'Loading screen element not found, creating dynamically');
                this.createLoadingScreen();
            }
            this.setupAccessibility();
        },

        /* ================================ */
        /* CREAZIONE LOADING SCREEN         */
        /* ================================ */
        createLoadingScreen() {
            const loadingScreen = document.createElement('div');
            loadingScreen.id = 'loading-screen';
            loadingScreen.className = 'loading-screen';
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="loading-logo">
                        <div class="loading-logo-icon">FG</div>
                        <div class="loading-logo-text">${window.PortfolioConfig.personal.name}</div>
                        <div class="loading-tagline">${window.PortfolioConfig.personal.title}</div>
                    </div>
                    
                    <div class="loading-spinner">
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                    </div>
                    
                    <div class="loading-text" aria-live="polite">
                        ${window.PortfolioConfig.messages.loading}
                    </div>
                    
                    <div class="loading-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                        <div class="loading-progress-bar"></div>
                    </div>
                    
                    <div class="loading-percentage">0%</div>
                    
                    <div class="loading-particles" aria-hidden="true">
                        ${Array.from({length: 8}, (_, i) => `<div class="loading-particle"></div>`).join('')}
                    </div>
                </div>
                
                <div class="loading-sr-only">
                    Caricamento del portfolio in corso. Attendere prego.
                </div>
            `;
            
            document.body.appendChild(loadingScreen);
            LoadingState.loadingScreen = loadingScreen;
            LoadingState.progressBar = loadingScreen.querySelector('.loading-progress-bar');
            LoadingState.percentageElement = loadingScreen.querySelector('.loading-percentage');
        },

        /* ================================ */
        /* SETUP CONFIGURAZIONE             */
        /* ================================ */
        setupConfiguration() {
            const config = window.PortfolioConfig.ui.loading;
            LoadingState.minLoadingTime = config.minDuration;
            this.calculateTotalResources();
        },

        /* ================================ */
        /* CALCOLO RISORSE TOTALI           */
        /* ================================ */
        calculateTotalResources() {
            const images = document.querySelectorAll('img[src]');
            const cssFiles = document.querySelectorAll('link[rel="stylesheet"]');
            const jsFiles = document.querySelectorAll('script[src]');
            const fontFiles = document.querySelectorAll('link[rel="preload"][as="font"]');
            
            LoadingState.totalResources = images.length + cssFiles.length + jsFiles.length + fontFiles.length;
            
            window.PortfolioConfig.utils.log('debug', `Total resources to load: ${LoadingState.totalResources}`);
        },

        /* ================================ */
        /* SETUP ANIMAZIONI                 */
        /* ================================ */
        setupAnimations() {
            this.animateProgress();
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.setupParticles();
            }
        },

        /* ================================ */
        /* SETUP PARTICELLE                 */
        /* ================================ */
        setupParticles() {
            const particleElements = document.querySelectorAll('.loading-particle');
            LoadingState.particles = Array.from(particleElements).map((element, index) => ({
                element,
                delay: index * 1000,
                started: false
            }));
        },

        /* ================================ */
        /* SETUP RESOURCE MONITORING        */
        /* ================================ */
        setupResourceMonitoring() {
            const images = document.querySelectorAll('img[src]');
            images.forEach(img => {
                if (img.complete) {
                    this.onResourceLoaded('image');
                } else {
                    img.addEventListener('load', () => this.onResourceLoaded('image'));
                    img.addEventListener('error', () => this.onResourceError('image'));
                }
            });
            const cssFiles = document.querySelectorAll('link[rel="stylesheet"]');
            cssFiles.forEach(link => {
                if (link.sheet) {
                    this.onResourceLoaded('css');
                } else {
                    link.addEventListener('load', () => this.onResourceLoaded('css'));
                    link.addEventListener('error', () => this.onResourceError('css'));
                }
            });
            const jsFiles = document.querySelectorAll('script[src]');
            jsFiles.forEach(() => this.onResourceLoaded('js'));
            if ('fonts' in document) {
                document.fonts.ready.then(() => {
                    this.onResourceLoaded('fonts');
                });
            }
        },

        /* ================================ */
        /* EVENTO RISORSA CARICATA          */
        /* ================================ */
        onResourceLoaded(type) {
            LoadingState.resourcesLoaded++;
            const progress = Math.min((LoadingState.resourcesLoaded / LoadingState.totalResources) * 100, 95);
            
            this.updateProgress(progress);
            
            window.PortfolioConfig.utils.log('debug', `Resource loaded (${type}): ${LoadingState.resourcesLoaded}/${LoadingState.totalResources}`);
            if (LoadingState.resourcesLoaded >= LoadingState.totalResources) {
                this.onAllResourcesLoaded();
            }
        },

        /* ================================ */
        /* EVENTO ERRORE RISORSA            */
        /* ================================ */
        onResourceError(type) {
            window.PortfolioConfig.utils.log('warn', `Resource failed to load: ${type}`);
            this.onResourceLoaded(type);
        },

        /* ================================ */
        /* TUTTE LE RISORSE CARICATE        */
        /* ================================ */
        onAllResourcesLoaded() {
            window.PortfolioConfig.utils.log('info', 'All resources loaded');
            this.updateProgress(100);
            const elapsed = performance.now() - LoadingState.startTime;
            const remainingTime = Math.max(0, LoadingState.minLoadingTime - elapsed);
            
            setTimeout(() => {
                this.finishLoading();
            }, remainingTime);
        },

        /* ================================ */
        /* AGGIORNAMENTO PROGRESS           */
        /* ================================ */
        updateProgress(targetProgress) {
            LoadingState.targetProgress = Math.min(targetProgress, 100);
        },

        /* ================================ */
        /* ANIMAZIONE PROGRESS              */
        /* ================================ */
        animateProgress() {
            const animate = () => {
                if (LoadingState.currentProgress < LoadingState.targetProgress) {
                    LoadingState.currentProgress += (LoadingState.targetProgress - LoadingState.currentProgress) * 0.1;
                    
                    if (LoadingState.progressBar) {
                        LoadingState.progressBar.style.width = `${LoadingState.currentProgress}%`;
                    }
                    
                    if (LoadingState.percentageElement) {
                        LoadingState.percentageElement.textContent = `${Math.round(LoadingState.currentProgress)}%`;
                    }
                    const progressElement = document.querySelector('.loading-progress');
                    if (progressElement) {
                        progressElement.setAttribute('aria-valuenow', Math.round(LoadingState.currentProgress));
                    }
                }
                
                if (LoadingState.isLoading) {
                    LoadingState.animationFrame = requestAnimationFrame(animate);
                }
            };
            
            animate();
        },

        /* ================================ */
        /* SETUP EVENT LISTENERS            */
        /* ================================ */
        setupEventListeners() {
            document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
            window.addEventListener('focus', this.handleWindowFocus.bind(this));
            window.addEventListener('blur', this.handleWindowBlur.bind(this));
            if (window.PortfolioConfig.dev.debug) {
                document.addEventListener('keydown', this.handleKeyboard.bind(this));
            }
        },

        /* ================================ */
        /* GESTIONE EVENTI                  */
        /* ================================ */
        handleVisibilityChange() {
            if (document.visibilityState === 'hidden' && LoadingState.isLoading) {
                if (LoadingState.animationFrame) {
                    cancelAnimationFrame(LoadingState.animationFrame);
                }
            } else if (document.visibilityState === 'visible' && LoadingState.isLoading) {
                this.animateProgress();
            }
        },

        handleWindowFocus() {
            if (LoadingState.isLoading) {
                this.animateProgress();
            }
        },

        handleWindowBlur() {
        },

        handleKeyboard(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                window.PortfolioConfig.utils.log('debug', 'Loading skipped (dev mode)');
                this.finishLoading();
            }
        },

        /* ================================ */
        /* INIZIO LOADING                   */
        /* ================================ */
        startLoading() {
            LoadingState.isLoading = true;
            LoadingState.startTime = performance.now();
            if (LoadingState.loadingScreen) {
                LoadingState.loadingScreen.classList.remove('hidden', 'fade-out');
                LoadingState.loadingScreen.style.display = 'flex';
            }
            this.updateProgress(10);
            
            window.PortfolioConfig.utils.log('info', 'Loading started');
            document.dispatchEvent(new CustomEvent('loadingStarted'));
        },

        /* ================================ */
        /* FINE LOADING                     */
        /* ================================ */
        finishLoading() {
            if (!LoadingState.isLoading) return;
            
            LoadingState.isLoading = false;
            this.updateProgress(100);
            if (LoadingState.animationFrame) {
                cancelAnimationFrame(LoadingState.animationFrame);
            }
            if (LoadingState.loadingScreen) {
                LoadingState.loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    LoadingState.loadingScreen.classList.add('hidden');
                    LoadingState.loadingScreen.style.display = 'none';
                    document.dispatchEvent(new CustomEvent('loadingCompleted', {
                        detail: {
                            duration: performance.now() - LoadingState.startTime,
                            resourcesLoaded: LoadingState.resourcesLoaded
                        }
                    }));
                    
                }, window.PortfolioConfig.ui.loading.fadeOutDuration);
            }
            
            const loadTime = performance.now() - LoadingState.startTime;
            window.PortfolioConfig.utils.log('info', `Loading completed in ${loadTime.toFixed(2)}ms`);
        },

        /* ================================ */
        /* SETUP ACCESSIBILITA'             */
        /* ================================ */
        setupAccessibility() {
            if (LoadingState.loadingScreen) {
                LoadingState.loadingScreen.setAttribute('role', 'status');
                LoadingState.loadingScreen.setAttribute('aria-label', 'Caricamento del portfolio');
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    LoadingState.loadingScreen.classList.add('reduced-motion');
                }
            }
        },

        /* ================================ */
        /* GESTIONE ERRORI                  */
        /* ================================ */
        handleError(error) {
            window.PortfolioConfig.utils.log('error', 'Loading module error', error);
            setTimeout(() => {
                this.finishLoading();
            }, 1000);
        },

        /* ================================ */
        /* API PUBBLICA                     */
        /* ================================ */
        show() {
            if (LoadingState.loadingScreen) {
                LoadingState.loadingScreen.classList.remove('hidden', 'fade-out');
                LoadingState.loadingScreen.style.display = 'flex';
                LoadingState.isLoading = true;
                this.animateProgress();
            }
        },
        hide() {
            this.finishLoading();
        },
        setProgress(progress) {
            this.updateProgress(Math.max(0, Math.min(100, progress)));
        },
        getState() {
            return {
                isLoading: LoadingState.isLoading,
                currentProgress: LoadingState.currentProgress,
                resourcesLoaded: LoadingState.resourcesLoaded,
                totalResources: LoadingState.totalResources
            };
        },

        /* ================================ */
        /* CLEANUP                          */
        /* ================================ */
        cleanup() {
            LoadingState.isLoading = false;
            
            if (LoadingState.animationFrame) {
                cancelAnimationFrame(LoadingState.animationFrame);
            }
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            window.removeEventListener('focus', this.handleWindowFocus);
            window.removeEventListener('blur', this.handleWindowBlur);
            
            if (window.PortfolioConfig.dev.debug) {
                document.removeEventListener('keydown', this.handleKeyboard);
            }
            
            window.PortfolioConfig.utils.log('info', 'Loading module cleaned up');
        }
    };

    /* ================================ */
    /* ESPORTAZIONE GLOBALE             */
    /* ================================ */
    window.LoadingModule = LoadingModule;

    window.PortfolioConfig.utils.log('debug', 'Loading module script loaded');

})();