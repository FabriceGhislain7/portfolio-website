/*
===========================================
NAVIGATION MODULE
===========================================
Gestisce navigazione, menu mobile, scroll effects
*/

(function() {
    'use strict';
    let header, navMenu, menuToggle, navLinks, backToTopBtn;
    let isMenuOpen = false;
    let lastScrollTop = 0;
    let isInitialized = false;

    /* ================================ */
    /* INIZIALIZZAZIONE                 */
    /* ================================ */
    function init() {
        if (isInitialized) return;
        header = document.getElementById('header');
        navMenu = document.getElementById('nav-menu');
        menuToggle = document.getElementById('menu-toggle');
        navLinks = document.querySelectorAll('.nav-link');
        backToTopBtn = document.getElementById('back-to-top') || document.getElementById('backToTop');

        if (!header) {
            console.warn('Header not found');
            return;
        }
        setupMobileMenu();
        setupNavigation();
        setupScrollEffects();
        setupBackToTop();
        window.PortfolioConfig.utils.log('debug', 'Navigation module initialized');
        isInitialized = true;
    }

    /* ================================ */
    /* MENU MOBILE                      */
    /* ================================ */
    function setupMobileMenu() {
        if (!menuToggle || !navMenu) return;
        menuToggle.addEventListener('click', toggleMobileMenu);
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    closeMobileMenu();
                    handleSmoothScroll(e, link);
                }
            });
        });
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMobileMenu();
            }
        });
        window.addEventListener('resize', window.PortfolioConfig.utils.debounce(() => {
            if (window.innerWidth > window.PortfolioConfig.breakpoints.md && isMenuOpen) {
                closeMobileMenu();
            }
        }, 250));
    }

    function toggleMobileMenu() {
        if (isMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        isMenuOpen = true;
        menuToggle.classList.add('active');
        navMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // Previeni scroll durante menu aperto
        
        window.PortfolioConfig.utils.log('debug', 'Mobile menu opened');
    }

    function closeMobileMenu() {
        isMenuOpen = false;
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = ''; // Ripristina scroll
        
        window.PortfolioConfig.utils.log('debug', 'Mobile menu closed');
    }

    /* ================================ */
    /* NAVIGAZIONE E SMOOTH SCROLL      */
    /* ================================ */
    function setupNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    handleSmoothScroll(e, link);
                }
            });
        });
        window.addEventListener('scroll', window.PortfolioConfig.utils.throttle(updateActiveNavLink, 100));
    }

    function handleSmoothScroll(e, link) {
        e.preventDefault();
        
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const offset = window.PortfolioConfig.ui.navigation.offset;
            window.PortfolioConfig.utils.scrollTo(targetElement, offset);
            if (history.pushState) {
                history.pushState(null, null, targetId);
            }
            
            window.PortfolioConfig.utils.log('debug', `Scrolled to section: ${targetId}`);
        }
    }

    function updateActiveNavLink() {
        const currentSection = window.PortfolioConfig.utils.getCurrentSection();
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            
            if (href === `#${currentSection}` || 
                (currentSection === '' && href === '#home')) {
                link.classList.add('active');
            }
        });
    }

    /* ================================ */
    /* EFFETTI SCROLL HEADER            */
    /* ================================ */
    function setupScrollEffects() {
        window.addEventListener('scroll', window.PortfolioConfig.utils.throttle(handleScrollEffects, 16));
    }

    function handleScrollEffects() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            if (!isMenuOpen) { // Non nascondere se menu è aperto
                header.classList.add('hide');
                header.classList.remove('show');
            }
        } else {
            header.classList.remove('hide');
            header.classList.add('show');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Previeni valori negativi
    }

    /* ================================ */
    /* BACK TO TOP BUTTON               */
    /* ================================ */
    function setupBackToTop() {
        if (!backToTopBtn) return;
        window.addEventListener('scroll', window.PortfolioConfig.utils.throttle(() => {
            const scrollTop = window.pageYOffset;
            const showOffset = window.PortfolioConfig.ui.scroll.backToTopOffset;

            if (scrollTop > showOffset) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, 100));
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            window.PortfolioConfig.utils.log('debug', 'Scrolled to top');
        });
    }

    /* ================================ */
    /* KEYBOARD NAVIGATION              */
    /* ================================ */
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                const sections = ['home', 'about', 'skills', 'projects', 'education', 'contact'];
                const sectionIndex = parseInt(e.key) - 1;
                
                if (sections[sectionIndex]) {
                    const targetElement = document.getElementById(sections[sectionIndex]);
                    if (targetElement) {
                        window.PortfolioConfig.utils.scrollTo(targetElement);
                    }
                }
            }
        });
    }

    /* ================================ */
    /* NAVIGATION UTILITIES             */
    /* ================================ */
    function highlightSection(sectionId) {
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('section-highlighted');
        });
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('section-highlighted');
        }
    }

    function getNavigationState() {
        return {
            isMenuOpen,
            currentSection: window.PortfolioConfig.utils.getCurrentSection(),
            scrollPosition: window.pageYOffset,
            headerVisible: !header.classList.contains('hide')
        };
    }

    /* ================================ */
    /* GESTIONE RESIZE                  */
    /* ================================ */
    function handleResize() {
        if (window.innerWidth > window.PortfolioConfig.breakpoints.md) {
            closeMobileMenu();
        }
    }

    /* ================================ */
    /* API PUBBLICA                     */
    /* ================================ */
    window.NavigationModule = {
        init,
        openMobileMenu,
        closeMobileMenu,
        scrollToSection: (sectionId) => {
            const element = document.getElementById(sectionId);
            if (element) {
                window.PortfolioConfig.utils.scrollTo(element);
            }
        },
        highlightSection,
        getState: getNavigationState
    };

    /* ================================ */
    /* AUTO-INIZIALIZZAZIONE            */
    /* ================================ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('resize', window.PortfolioConfig.utils.debounce(handleResize, 250));

})();