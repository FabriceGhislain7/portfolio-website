/*
===========================================
SKILLS MODULE - OTTIMIZZATO
===========================================
Carica e gestisce la sezione competenze
*/

(function() {
    'use strict';
    let skillsData = null;
    let skillsGrid = null;
    let filterButtons = null;
    let currentFilter = 'all';
    let skillsLoaded = false;
    let isInitialized = false;

    /* ================================ */
    /* INIZIALIZZAZIONE                 */
    /* ================================ */
    function init() {
        if (isInitialized) return;
        skillsGrid = document.getElementById('skills-grid');
        filterButtons = document.querySelectorAll('.skills-filter .filter-btn');

        if (!skillsGrid) {
            console.warn('Skills grid not found');
            return;
        }
        setupFilters();
        loadSkillsData();

        window.PortfolioConfig.utils.log('debug', 'Skills module initialized');
        isInitialized = true;
    }

    /* ================================ */
    /* CARICAMENTO DATI                 */
    /* ================================ */
    async function loadSkillsData() {
        try {
            const response = await fetch(window.PortfolioConfig.paths.data.skills);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            skillsData = await response.json();
            if (!skillsData || !skillsData.skills || !Array.isArray(skillsData.skills)) {
                throw new Error('Invalid skills data format');
            }
            renderSkills();
            setupSkillsAnimations();
            
            skillsLoaded = true;
            window.PortfolioConfig.utils.log('info', `Loaded ${skillsData.skills.length} skills`);

        } catch (error) {
            console.error('Error loading skills data:', error);
            showErrorMessage();
        }
    }

    /* ================================ */
    /* RENDERING SKILLS                 */
    /* ================================ */
    function renderSkills() {
        if (!skillsData || !skillsGrid) return;
        const filteredSkills = filterSkills(skillsData.skills, currentFilter);
        const skillsHTML = filteredSkills.map(skill => createSkillCard(skill)).join('');
        skillsGrid.innerHTML = skillsHTML;
        animateSkillCards();
    }

    function createSkillCard(skill) {
        return `
            <div class="skill-card" data-category="${skill.category}">
                <div class="skill-header">
                    <div class="skill-icon">
                        <i class="${skill.icon}"></i>
                    </div>
                    <div class="skill-info">
                        <h3 class="skill-name">${skill.name}</h3>
                    </div>
                </div>
                
                <p class="skill-description">${skill.description}</p>
                
                <div class="skill-tags">
                    ${skill.tags.map(tag => `
                        <span class="skill-tag">${tag}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /* ================================ */
    /* FILTRI SKILLS                    */
    /* ================================ */
    function setupFilters() {
        if (!filterButtons.length) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const category = button.getAttribute('data-category');
                if (category && category !== currentFilter) {
                    updateFilter(category);
                }
            });
        });
    }

    function updateFilter(newFilter) {
        currentFilter = newFilter;
        filterButtons.forEach(button => {
            const category = button.getAttribute('data-category');
            button.classList.toggle('active', category === currentFilter);
        });
        if (skillsLoaded) {
            renderSkills();
        }

        window.PortfolioConfig.utils.log('debug', `Skills filtered by: ${currentFilter}`);
    }

    function filterSkills(skills, category) {
        if (category === 'all') {
            return skills;
        }
        return skills.filter(skill => skill.category === category);
    }

    /* ================================ */
    /* ANIMAZIONI                       */
    /* ================================ */
    function setupSkillsAnimations() {
        const observer = window.PortfolioConfig.utils.createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillCards();
                    observer.unobserve(entry.target);
                }
            });
        });
        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
            observer.observe(skillsSection);
        }
    }

    function animateSkillCards() {
        const skillCards = skillsGrid.querySelectorAll('.skill-card');
        
        skillCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /* ================================ */
    /* UTILITIES                        */
    /* ================================ */
    function showErrorMessage() {
        if (!skillsGrid) return;
        
        skillsGrid.innerHTML = `
            <div class="skills-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Errore nel caricamento delle competenze</h3>
                <p>Non è stato possibile caricare i dati delle competenze. Riprova più tardi.</p>
                <button class="btn btn-primary" onclick="window.SkillsModule.reload()">
                    <i class="fas fa-redo"></i>
                    Riprova
                </button>
            </div>
        `;
    }

    /* ================================ */
    /* SEARCH SEMPLIFICATA              */
    /* ================================ */
    function searchSkills(query) {
        if (!skillsData || !query.trim()) {
            renderSkills();
            return;
        }

        const searchTerm = query.toLowerCase();
        const filteredSkills = skillsData.skills.filter(skill => 
            skill.name.toLowerCase().includes(searchTerm) ||
            skill.description.toLowerCase().includes(searchTerm) ||
            skill.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );

        const skillsHTML = filteredSkills.map(skill => createSkillCard(skill)).join('');
        skillsGrid.innerHTML = skillsHTML;
        animateSkillCards();

        window.PortfolioConfig.utils.log('debug', `Found ${filteredSkills.length} skills for query: ${query}`);
    }

    /* ================================ */
    /* API PUBBLICA                     */
    /* ================================ */
    window.SkillsModule = {
        init,
        reload: () => {
            skillsLoaded = false;
            loadSkillsData();
        },
        filter: updateFilter,
        search: searchSkills,
        getData: () => skillsData,
        getCurrentFilter: () => currentFilter
    };

    /* ================================ */
    /* AUTO-INIZIALIZZAZIONE            */
    /* ================================ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();