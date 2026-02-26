/*
===========================================
COUNTERS MODULE - Portfolio
===========================================
Modulo per l'animazione dei contatori numerici
nella sezione About con Intersection Observer
*/

class CountersModule {
    constructor() {
        this.counters = [];
        this.observer = null;
        this.isAnimating = false;
        
        this.init();
    }

    /**
     * Inizializza il modulo contatori
     */
    init() {
        this.bindEvents();
        this.setupIntersectionObserver();
        console.log('🔢 Counters Module: Initialized');
    }

    /**
     * Imposta gli event listeners
     */
    bindEvents() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.handleVisibilityChange();
            }
        });
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    /**
     * Configura l'Intersection Observer per attivare le animazioni
     */
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-50px 0px -50px 0px', // Attiva quando è visibile al 50%
            threshold: 0.3
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isAnimating) {
                    this.startCounterAnimations();
                }
            });
        }, options);
        const statsSection = document.querySelector('.about-stats');
        if (statsSection) {
            this.observer.observe(statsSection);
        }
    }

    /**
     * Avvia le animazioni dei contatori
     */
    startCounterAnimations() {
        this.isAnimating = true;
        const counterElements = document.querySelectorAll('.stat-number[data-count]');
        
        if (counterElements.length === 0) {
            console.warn('⚠️ Counters Module: No counter elements found');
            return;
        }
        this.resetCounters(counterElements);
        counterElements.forEach((counter, index) => {
            setTimeout(() => {
                this.animateCounter(counter);
            }, index * 150); // Delay progressivo di 150ms
        });

        console.log('🎬 Counters Module: Animation started');
    }

    /**
     * Resetta i contatori al valore iniziale
     */
    resetCounters(counterElements) {
        counterElements.forEach(counter => {
            counter.textContent = '0';
            counter.classList.remove('animated');
            counter.offsetHeight;
        });
    }

    /**
     * Anima un singolo contatore
     */
    animateCounter(element) {
        const targetValue = parseInt(element.getAttribute('data-count')) || 0;
        const duration = this.getAnimationDuration(targetValue);
        const startTime = performance.now();
        const startValue = 0;
        element.classList.add('animated');

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeOutQuart(progress);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);
            element.textContent = this.formatNumber(currentValue, targetValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = this.formatNumber(targetValue, targetValue);
                this.onCounterComplete(element, targetValue);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Calcola la durata dell'animazione basata sul valore target
     */
    getAnimationDuration(targetValue) {
        const baseDuration = 1500; // 1.5 secondi
        const extraDuration = Math.min(targetValue * 2, 1000); // Max 1 secondo extra
        return baseDuration + extraDuration;
    }

    /**
     * Funzione di easing per animazione più naturale
     */
    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    /**
     * Formatta il numero per la visualizzazione
     */
    formatNumber(value, targetValue) {
        if (targetValue >= 1000) {
            return value.toLocaleString('it-IT');
        }
        return value.toString();
    }

    /**
     * Callback quando un contatore completa l'animazione
     */
    onCounterComplete(element, finalValue) {
        this.addCompletionEffect(element);
        
        console.log(`✅ Counter completed: ${finalValue}`);
    }

    /**
     * Aggiunge un effetto visuale al completamento
     */
    addCompletionEffect(element) {
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.2s ease-out';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            setTimeout(() => {
                element.style.transform = '';
                element.style.transition = '';
            }, 200);
        }, 100);
    }

    /**
     * Gestisce il cambio di visibilità della pagina
     */
    handleVisibilityChange() {
        const statsSection = document.querySelector('.about-stats');
        if (statsSection && this.isElementInViewport(statsSection)) {
            const counters = statsSection.querySelectorAll('.stat-number[data-count]');
            const allAtZero = Array.from(counters).every(counter => 
                counter.textContent === '0'
            );
            
            if (allAtZero) {
                this.isAnimating = false;
                this.startCounterAnimations();
            }
        }
    }

    /**
     * Gestisce il resize della finestra
     */
    handleResize() {
        if (window.innerWidth <= 768) {
            this.resetAnimationState();
        }
    }

    /**
     * Resetta lo stato delle animazioni
     */
    resetAnimationState() {
        this.isAnimating = false;
        const counters = document.querySelectorAll('.stat-number[data-count]');
        counters.forEach(counter => {
            counter.classList.remove('animated');
        });
    }

    /**
     * Verifica se un elemento è nel viewport
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Metodo pubblico per riavviare manualmente le animazioni
     */
    restart() {
        this.resetAnimationState();
        const statsSection = document.querySelector('.about-stats');
        if (statsSection && this.isElementInViewport(statsSection)) {
            setTimeout(() => {
                this.startCounterAnimations();
            }, 100);
        }
    }

    /**
     * Pulisce gli observer e event listeners
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.resetAnimationState();
        console.log('🗑️ Counters Module: Destroyed');
    }
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CountersModule;
}
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.countersModule = new CountersModule();
        });
    } else {
        window.countersModule = new CountersModule();
    }
}