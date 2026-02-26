/*
===========================================
MAIN APPLICATION SCRIPT
===========================================
Coordinatore principale di tutti i moduli del portfolio
*/
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 1000);
        }, 500); // Minimum loading time
    }
});

(function() {
    'use strict';
    const AppState = {
        isLoaded: false,
        modules: [],
        performance: {
            startTime: performance.now(),
            loadTime: null,
            domReadyTime: null
        },
        errors: []
    };

    /* ================================ */
    /* INIZIALIZZAZIONE PRINCIPALE      */
    /* ================================ */
    function initializeApp() {
        AppState.performance.domReadyTime = performance.now();
        
        window.PortfolioConfig.utils.log('info', 'Initializing Portfolio Application');

        try {
            initializeModules();
            setupGlobalEventListeners();
            setupPerformanceMonitoring();
            setupGlobalErrorHandling();
            setupAccessibilityFeatures();
            finalizeInitialization();

        } catch (error) {
            handleInitializationError(error);
        }
    }

    /* ================================ */
    /* INIZIALIZZAZIONE MODULI          */
    /* ================================ */
    function initializeModules() {
        const modules = [
            {
                name: 'Theme',
                instance: window.ThemeModule,
                required: true,
                priority: 1
            },
            {
                name: 'Navigation',
                instance: window.NavigationModule,
                required: true,
                priority: 2
            },
            {
                name: 'Skills',
                instance: window.SkillsModule,
                required: false,
                priority: 3
            },
            {
                name: 'Projects',
                instance: window.ProjectsModule,
                required: false,
                priority: 4
            },
            {
                name: 'Contact',
                instance: window.ContactModule,
                required: false,
                priority: 5
            },
            {
                name: 'Animations',
                instance: window.AnimationsModule,
                required: false,
                priority: 6
            }
        ];
        modules.sort((a, b) => a.priority - b.priority);
        modules.forEach(module => {
            try {
                if (module.instance && typeof module.instance.init === 'function') {
                    module.instance.init();
                    AppState.modules.push(module.name);
                    window.PortfolioConfig.utils.log('debug', `Module ${module.name} initialized`);
                } else if (module.required) {
                    throw new Error(`Required module ${module.name} not found or missing init method`);
                } else {
                    window.PortfolioConfig.utils.log('warn', `Optional module ${module.name} not available`);
                }
            } catch (error) {
                const errorMsg = `Failed to initialize module ${module.name}: ${error.message}`;
                AppState.errors.push(errorMsg);
                
                if (module.required) {
                    throw new Error(errorMsg);
                } else {
                    console.warn(errorMsg);
                }
            }
        });

        window.PortfolioConfig.utils.log('info', `Initialized ${AppState.modules.length} modules`);
    }

    /* ================================ */
    /* EVENT LISTENERS GLOBALI          */
    /* ================================ */
    function setupGlobalEventListeners() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                handleWindowResize();
            }, 250);
        });
        window.addEventListener('focus', handleWindowFocus);
        window.addEventListener('blur', handleWindowBlur);
        if (typeof document.visibilityState !== 'undefined') {
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }
        window.addEventListener('online', handleOnlineStatus);
        window.addEventListener('offline', handleOfflineStatus);
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('keydown', handleGlobalKeyboard);
        document.addEventListener('click', handleGlobalClick);

        window.PortfolioConfig.utils.log('debug', 'Global event listeners setup completed');
    }

    /* ================================ */
    /* GESTIONE EVENTI                  */
    /* ================================ */
    function handleWindowResize() {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        const event = new CustomEvent('portfolioResize', {
            detail: { width: newWidth, height: newHeight }
        });
        document.dispatchEvent(event);

        window.PortfolioConfig.utils.log('debug', `Window resized to ${newWidth}x${newHeight}`);
    }

    function handleWindowFocus() {
        document.body.classList.remove('window-blurred');
        window.PortfolioConfig.utils.log('debug', 'Window focused');
    }

    function handleWindowBlur() {
        document.body.classList.add('window-blurred');
        window.PortfolioConfig.utils.log('debug', 'Window blurred');
    }

    function handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            document.body.classList.remove('page-hidden');
            window.PortfolioConfig.utils.log('debug', 'Page visible');
        } else {
            document.body.classList.add('page-hidden');
            window.PortfolioConfig.utils.log('debug', 'Page hidden');
        }
    }

    function handleOnlineStatus() {
        document.body.classList.remove('offline');
        showConnectionStatus('online');
        window.PortfolioConfig.utils.log('info', 'Connection restored');
    }

    function handleOfflineStatus() {
        document.body.classList.add('offline');
        showConnectionStatus('offline');
        window.PortfolioConfig.utils.log('warn', 'Connection lost');
    }

    function handleBeforeUnload() {
        AppState.modules.forEach(moduleName => {
            const moduleInstance = window[`${moduleName}Module`];
            if (moduleInstance && typeof moduleInstance.cleanup === 'function') {
                try {
                    moduleInstance.cleanup();
                } catch (error) {
                    console.warn(`Error cleaning up module ${moduleName}:`, error);
                }
            }
        });
    }

    function handleGlobalKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '/':
                    e.preventDefault();
                    showKeyboardShortcuts();
                    break;
                case 'k':
                    e.preventDefault();
                    focusSearch();
                    break;
            }
        }
        if (e.key === 'Escape') {
            closeAllModals();
        }
    }

    function handleGlobalClick(e) {
        const target = e.target;
        const tagName = target.tagName.toLowerCase();
        const className = target.className;
        if (tagName === 'a' || tagName === 'button' || target.closest('.clickable')) {
            window.PortfolioConfig.utils.log('debug', 'User interaction', {
                element: tagName,
                className: className,
                text: target.textContent?.trim().substring(0, 50)
            });
        }
    }

    /* ================================ */
    /* PERFORMANCE MONITORING           */
    /* ================================ */
    function setupPerformanceMonitoring() {
        if ('web-vital' in window) {
            measureWebVitals();
        }
        window.addEventListener('load', () => {
            AppState.performance.loadTime = performance.now();
            
            const loadDuration = AppState.performance.loadTime - AppState.performance.startTime;
            window.PortfolioConfig.utils.log('info', `Page loaded in ${loadDuration.toFixed(2)}ms`);
            if (window.PortfolioConfig.dev.showPerformanceMetrics) {
                showPerformanceMetrics();
            }
        });
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.duration > 50) {
                            window.PortfolioConfig.utils.log('warn', `Long task detected: ${entry.duration.toFixed(2)}ms`);
                        }
                    });
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (error) {
                console.warn('Performance monitoring not available');
            }
        }
    }

    function measureWebVitals() {
        window.PortfolioConfig.utils.log('debug', 'Web Vitals monitoring setup');
    }

    function showPerformanceMetrics() {
        const metrics = {
            'DOM Ready': `${(AppState.performance.domReadyTime - AppState.performance.startTime).toFixed(2)}ms`,
            'Page Load': `${(AppState.performance.loadTime - AppState.performance.startTime).toFixed(2)}ms`,
            'Modules': AppState.modules.length,
            'Errors': AppState.errors.length
        };

        console.table(metrics);
    }

    /* ================================ */
    /* ERROR HANDLING                   */
    /* ================================ */
    function setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            const error = {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error?.stack
            };
            
            AppState.errors.push(error);
            window.PortfolioConfig.utils.log('error', 'Global error caught', error);
            if (!window.PortfolioConfig.dev.debug) {
            }
        });
        window.addEventListener('unhandledrejection', (e) => {
            const error = {
                reason: e.reason,
                promise: e.promise
            };
            
            AppState.errors.push(error);
            window.PortfolioConfig.utils.log('error', 'Unhandled promise rejection', error);
            e.preventDefault();
        });
    }

    function handleInitializationError(error) {
        console.error('Portfolio initialization failed:', error);
        showErrorMessage('Si è verificato un errore durante il caricamento del portfolio. Ricarica la pagina.');
        document.body.classList.add('app-error');
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    /* ================================ */
    /* ACCESSIBILITY                    */
    /* ================================ */
    function setupAccessibilityFeatures() {
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector('#main');
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        createAriaLiveRegion();

        window.PortfolioConfig.utils.log('debug', 'Accessibility features setup completed');
    }

    function createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
    }

    /* ================================ */
    /* UTILITY FUNCTIONS                */
    /* ================================ */
    function showConnectionStatus(status) {
        const message = status === 'online' ? 'Connessione ripristinata' : 'Connessione persa';
        const type = status === 'online' ? 'success' : 'warning';
        
        showToast(message, type);
    }

    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'});
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }

    function getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'global-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h2>Errore</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="btn btn-primary">
                    Ricarica Pagina
                </button>
            </div>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;
        
        document.body.appendChild(errorDiv);
    }

    function showKeyboardShortcuts() {
        window.PortfolioConfig.utils.log('info', 'Keyboard shortcuts: Ctrl+Shift+T (theme), Ctrl+/ (help)');
    }

    function focusSearch() {
        window.PortfolioConfig.utils.log('info', 'Search functionality not implemented yet');
    }

    function closeAllModals() {
        const modals = document.querySelectorAll('.project-modal.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    /* ================================ */
    /* FINALIZZAZIONE                   */
    /* ================================ */
    function finalizeInitialization() {
        AppState.isLoaded = true;
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, window.PortfolioConfig.ui.loading.minDuration);
        }
        document.body.classList.add('app-loaded');
        const event = new CustomEvent('portfolioLoaded', {
            detail: {
                modules: AppState.modules,
                loadTime: AppState.performance.loadTime - AppState.performance.startTime,
                errors: AppState.errors
            }
        });
        document.dispatchEvent(event);

        window.PortfolioConfig.utils.log('info', 'Portfolio initialization completed successfully');
        if (window.PortfolioConfig.dev.debug) {
            console.log('Portfolio State:', AppState);
        }
    }

    /* ================================ */
    /* API PUBBLICA                     */
    /* ================================ */
    window.PortfolioApp = {
        getState: () => ({ ...AppState }),
        getModules: () => [...AppState.modules],
        getErrors: () => [...AppState.errors],
        showToast,
        isLoaded: () => AppState.isLoaded
    };

    /* ================================ */
    /* AUTO-INIZIALIZZAZIONE            */
    /* ================================ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

})();