document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-button');
    const mobileTabButtons = document.querySelectorAll('.mobile-tab-button');
    const mobileMenu = document.querySelector('.services-mobile-menu');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const servicesDropdown = document.querySelector('.services-dropdown');
    const solutionsLink = servicesDropdown ? servicesDropdown.querySelector('a') : null;

    // Set default active tab to Web & App Development
    const firstTabButton = document.querySelector('.tab-button[data-tab="web-app"]');
    const firstTabPanel = document.getElementById('web-app-panel');
    if (firstTabButton && firstTabPanel) {
        firstTabButton.classList.add('active');
        firstTabPanel.classList.add('active');
    }

    // Toggle dropdown on click (Desktop & Mobile)
    if (solutionsLink) {
        solutionsLink.addEventListener('click', (e) => {
            if (window.innerWidth >= 992) {
                // Desktop Toggle
                e.preventDefault();
                e.stopPropagation();
                servicesDropdown.classList.toggle('open');
            } else {
                // Mobile Toggle (when clicking the label directly)
                e.preventDefault();
                e.stopPropagation();
                const parentLi = solutionsLink.closest('.services-dropdown');
                const panel = parentLi ? parentLi.querySelector('.services-mobile-menu') : null;
                if (panel) {
                    panel.classList.toggle('active');
                    if (parentLi) parentLi.classList.toggle('active');
                }
            }
        });
    }

    // Tab switching logic (Desktop & Mobile Accordion)
    tabButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            if (window.innerWidth >= 992) {
                e.stopPropagation();
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                button.classList.add('active');
                if (tabPanels[index]) {
                    tabPanels[index].classList.add('active');
                }
            } else {
                // Mobile: Sub-accordion logic
                e.preventDefault();
                e.stopPropagation();
                
                const panelId = button.getAttribute('data-tab') + '-panel';
                const panel = document.getElementById(panelId);
                
                if (panel) {
                    const isActive = button.classList.contains('active');
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabPanels.forEach(p => p.classList.remove('active'));
                    
                    if (!isActive) {
                        button.classList.add('active');
                        panel.classList.add('active');
                        setTimeout(() => {
                            button.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 300);
                    }
                }
            }
        });
    });

    // Mobile menu logic (Main Solutions Toggle for the whole LI)
    mobileTabButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            if (window.innerWidth < 992) {
                // Ignore clicks inside the actual menu content
                if (e.target.closest('.services-mobile-menu')) return;

                e.preventDefault();
                const panel = button.querySelector('.services-mobile-menu');
                if (panel) {
                    panel.classList.toggle('active');
                    button.classList.toggle('active');
                }
            }
        });
    });

    // Close on click outside (Desktop)
    document.addEventListener('click', (e) => {
        if (window.innerWidth >= 992 && servicesDropdown && !servicesDropdown.contains(e.target)) {
            servicesDropdown.classList.remove('open');
        }
    });
});
