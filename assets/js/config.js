/*
===========================================
PORTFOLIO CONFIGURATION
===========================================
Configurazioni globali per il portfolio di Fabrice Ghislain Tebou
*/
window.PortfolioConfig = {
    
    /* ================================ */
    /* INFORMAZIONI PERSONALI          */
    /* ================================ */
    personal: {
        name: "Fabrice Ghislain Tebou",
        title: "Python Developer | AI/ML Enthusiast", 
        email: "ghislaintebou@gmail.com",
        phone: "+39 351 995 7025",
        location: "Genova, Italy",
        github: "https://github.com/FabriceGhislain7",
        linkedin: "#", // Da aggiornare quando disponibile
        website: "#"
    },

    /* ================================ */
    /* PERCORSI FILE E API              */
    /* ================================ */
    paths: {
        data: {
            skills: "data/skills.json",
            projects: "data/projects.json"
        },
        images: {
            hero: "assets/images/hero/",
            about: "assets/images/about/", 
            projects: "assets/images/projects/",
            icons: "assets/images/icons/"
        }
    },

    /* ================================ */
    /* CONFIGURAZIONI UI                */
    /* ================================ */
    ui: {
        theme: {
            default: "light",
            storageKey: "portfolio-theme",
            transitions: true
        },
        navigation: {
            offset: 80, // Offset per scroll smooth
            highlightOffset: 100,
            mobileBreakpoint: 768
        },
        scroll: {
            smoothDuration: 800,
            backToTopOffset: 300,
            progressBarEnabled: true
        },
        loading: {
            minDuration: 1000, // Durata minima loading screen
            fadeOutDuration: 500
        },
        animations: {
            observerThreshold: 0.1,
            observerRootMargin: "50px",
            staggerDelay: 100, // Delay tra animazioni multiple
            defaultDuration: 600
        }
    },

    /* ================================ */
    /* CONFIGURAZIONI COMPONENTI        */
    /* ================================ */
    components: {
        skills: {
            animateCounters: true,
            counterDuration: 2000,
            loadDelay: 200
        },
        projects: {
            defaultFilter: "all",
            animationDelay: 100,
            loadImagesLazy: true,
            githubIconClass: "fab fa-github"
        },
        contact: {
            validateOnType: false,
            validateOnBlur: true,
            successMessage: "Messaggio inviato con successo!",
            errorMessage: "Errore nell'invio del messaggio. Riprova.",
            emailService: null // Da configurare se serve invio email
        },
        hero: {
            typewriterEffect: true,
            typewriterSpeed: 100,
            typewriterLoop: true,
            particlesEnabled: true
        }
    },

    /* ================================ */
    /* BREAKPOINTS                      */
    /* ================================ */
    breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        "2xl": 1536
    },

    /* ================================ */
    /* ANALYTICS & TRACKING             */
    /* ================================ */
    analytics: {
        googleAnalyticsId: null, // GA4 ID se necessario
        trackPageViews: false,
        trackEvents: false
    },

    /* ================================ */
    /* SOCIAL LINKS                     */
    /* ================================ */
    social: {
        github: {
            url: "https://github.com/FabriceGhislain7",
            icon: "fab fa-github",
            label: "GitHub Profile"
        },
        linkedin: {
            url: "#",
            icon: "fab fa-linkedin",
            label: "LinkedIn Profile"
        },
        email: {
            url: "mailto:ghislaintebou@gmail.com",
            icon: "fas fa-envelope", 
            label: "Send Email"
        }
    },

    /* ================================ */
    /* CONFIGURAZIONI SVILUPPO          */
    /* ================================ */
    dev: {
        debug: false, // Modalità debug
        logLevel: "warn", // "debug", "info", "warn", "error"
        showPerformanceMetrics: false,
        enableServiceWorker: false
    },

    /* ================================ */
    /* MESSAGGI E TESTI                 */
    /* ================================ */
    messages: {
        loading: "Caricamento in corso...",
        error: {
            generic: "Si è verificato un errore. Riprova.",
            network: "Errore di connessione. Controlla la tua connessione internet.",
            fileNotFound: "File non trovato.",
            jsonParse: "Errore nel caricamento dei dati."
        },
        success: {
            dataLoaded: "Dati caricati con successo",
            formSubmitted: "Messaggio inviato con successo!"
        }
    },

    /* ================================ */
    /* UTILITY FUNCTIONS                */
    /* ================================ */
    utils: {
        isMobile: () => window.innerWidth < window.PortfolioConfig.breakpoints.md,
        isTablet: () => {
            const width = window.innerWidth;
            return width >= window.PortfolioConfig.breakpoints.md && 
                   width < window.PortfolioConfig.breakpoints.lg;
        },
        isDesktop: () => window.innerWidth >= window.PortfolioConfig.breakpoints.lg,
        log: (level, message, data = null) => {
            const config = window.PortfolioConfig.dev;
            const levels = ["debug", "info", "warn", "error"];
            const currentLevelIndex = levels.indexOf(config.logLevel);
            const messageLevelIndex = levels.indexOf(level);
            
            if (config.debug && messageLevelIndex >= currentLevelIndex) {
                if (data) {
                    console[level](`[Portfolio] ${message}`, data);
                } else {
                    console[level](`[Portfolio] ${message}`);
                }
            }
        },
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        throttle: (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        },
        scrollTo: (element, offset = 80) => {
            const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        },
        getCurrentSection: () => {
            const sections = document.querySelectorAll('section[id]');
            let currentSection = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                const scroll = window.pageYOffset;
                
                if (scroll >= (sectionTop - 200)) {
                    currentSection = section.getAttribute('id');
                }
            });
            
            return currentSection;
        },
        createObserver: (callback, options = {}) => {
            const defaultOptions = {
                threshold: window.PortfolioConfig.ui.animations.observerThreshold,
                rootMargin: window.PortfolioConfig.ui.animations.observerRootMargin
            };
            
            return new IntersectionObserver(callback, { ...defaultOptions, ...options });
        },
        storage: {
            set: (key, value) => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    console.warn('Could not save to localStorage:', e);
                }
            },
            get: (key, defaultValue = null) => {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultValue;
                } catch (e) {
                    console.warn('Could not read from localStorage:', e);
                    return defaultValue;
                }
            },
            remove: (key) => {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn('Could not remove from localStorage:', e);
                }
            }
        }
    }
};

/* ================================ */
/* INIZIALIZZAZIONE CONFIG          */
/* ================================ */
document.addEventListener('DOMContentLoaded', () => {
    window.PortfolioConfig.utils.log('info', 'Portfolio configuration loaded');
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.protocol === 'file:') {
        window.PortfolioConfig.dev.debug = true;
        window.PortfolioConfig.dev.logLevel = 'debug';
        window.PortfolioConfig.utils.log('debug', 'Development mode enabled');
    }
    const savedTheme = window.PortfolioConfig.utils.storage.get(
        window.PortfolioConfig.ui.theme.storageKey, 
        window.PortfolioConfig.ui.theme.default
    );
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        window.PortfolioConfig.utils.log('debug', `Theme set to: ${savedTheme}`);
    }
    if (window.PortfolioConfig.ui.scroll.progressBarEnabled) {
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) {
            window.addEventListener('scroll', window.PortfolioConfig.utils.throttle(() => {
                const scrollTop = window.pageYOffset;
                const docHeight = document.body.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                progressBar.style.width = scrollPercent + '%';
            }, 10));
        }
    }
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            window.PortfolioConfig.utils.log('debug', 'Loading screen hidden');
        }
    }, window.PortfolioConfig.ui.loading.minDuration);
});
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.PortfolioConfig;
}