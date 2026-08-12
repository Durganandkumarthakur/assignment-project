/* global common logic */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------
    // 1) Global Zoom Control (Mobile + Desktop)
    // -------------------------
    // Disable Desktop Zoom (Ctrl/Cmd +/- and Mousewheel zoom)
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
            e.preventDefault();
        }
    });
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
        }
    }, { passive: false });

    // -------------------------
    // 2) Red Shadow Cursor Effect (Global)
    // -------------------------
    (function initCursorEffect() {
        if (window.innerWidth < 992) return; // Only for desktop

        // Inject Styles
        const style = document.createElement('style');
        style.textContent = `
            .cursor-circle {
                position: fixed;
                top: 0;
                left: 0;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                pointer-events: none;
                filter: blur(25px);
                z-index: 1;
                background: radial-gradient(circle at center, var(--color-primary, #E51A4B) 0, color-mix(in srgb, var(--color-primary, #E51A4B) 60%, transparent) 40%, color-mix(in srgb, var(--color-primary, #E51A4B) 30%, transparent) 70%, transparent 100%);
                mix-blend-mode: lighten;
                opacity: 0.6;
                will-change: transform;
                transform: translate(-100px, -100px);
            }
            .behind-cursor {
                z-index: 2;
                isolation: isolate;
            }
            .bubble {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                pointer-events: none;
                filter: blur(25px);
                position: fixed;
                background: radial-gradient(circle at center, var(--color-primary, #E51A4B) 0, transparent 70%);
                opacity: 0.4;
                animation: bubbleFade 0.9s forwards;
            }
            @keyframes bubbleFade {
                to { opacity: 0; transform: scale(1.5); }
            }
        `;
        document.head.appendChild(style);

        // Inject Cursor Element
        const cursorCircle = document.createElement('div');
        cursorCircle.className = 'cursor-circle';
        document.body.appendChild(cursorCircle);

        // Logic
        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
        let lastBubbleX = 0, lastBubbleY = 0, lastBubbleTime = 0;
        const bubbleGap = 80;
        const bubbleInterval = 100;

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            
            const dx = targetX - lastBubbleX;
            const dy = targetY - lastBubbleY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const now = performance.now();
            
            if (distance > bubbleGap && now - lastBubbleTime > bubbleInterval) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.style.left = `${targetX - 40}px`;
                bubble.style.top = `${targetY - 40}px`;
                document.body.appendChild(bubble);
                setTimeout(() => bubble.remove(), 900);
                
                lastBubbleX = targetX;
                lastBubbleY = targetY;
                lastBubbleTime = now;
            }
        });

        function animateCursor() {
            currentX += (targetX - currentX) * 0.15;
            currentY += (targetY - currentY) * 0.15;
            cursorCircle.style.transform = `translate(${currentX - 40}px, ${currentY - 40}px)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    })();

    // -------------------------
    // 3) Mobile menu toggle
    // -------------------------
    const toggleHeader = document.getElementById('toggleHeader');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (toggleHeader && mobileMenu) {
        // Ensure menu is moved to body if it's inside a container that might have overflow issues
        // (Optional, but safer for fixed positioning)
        
        // Create overlay if not exists
        let overlay = document.querySelector('.mobile-menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            document.body.appendChild(overlay);
        }

        // Add Header to mobile menu if not exists
        if (!mobileMenu.querySelector('.mobile-menu-header')) {
            const isServicePage = window.location.pathname.includes('/services/');
            const assetPath = isServicePage ? '../frontend-assets/' : 'frontend-assets/';
            
            const header = document.createElement('div');
            header.className = 'mobile-menu-header';
            header.innerHTML = `
                <img src="${assetPath}images/svgs/logo.svg" alt="tcongs" height="30" />
                <div class="mobile-menu-close">×</div>
            `;
            mobileMenu.insertBefore(header, mobileMenu.firstChild);
            
            header.querySelector('.mobile-menu-close').addEventListener('click', () => {
                closeMenu();
            });
        }

        const openMenu = () => {
            mobileMenu.classList.add('shown');
            overlay.classList.add('shown');
            document.body.style.overflow = 'hidden';
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('shown');
            overlay.classList.remove('shown');
            document.body.style.overflow = '';
        };

        toggleHeader.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (mobileMenu.classList.contains('shown')) closeMenu();
            else openMenu();
        });

        overlay.addEventListener('click', closeMenu);
        
        // Close on link click (except dropdown toggle)
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.closest('.services-dropdown')) return; // handled by services-dropdown.js
                closeMenu();
            });
        });
    }

    // -------------------------
    // Navbar: ensure Connect exists everywhere
    // -------------------------
    ensureConnectNavLink();

    // -------------------------
    // Lead modal + Thank you modal
    // -------------------------
    ensureLeadModals();
    wireLeadTriggers();
    wireConnectPageForm();
    initSolutionsToggle();

    // -------------------------
    // AI Chatbot (static responses / API-ready)
    // -------------------------
    ensureChatbot();

    // -------------------------
    // Navbar: highlight active link
    // -------------------------
    highlightActiveNavLink();

    // -------------------------
    // Auto-open lead modal on homepage
    // -------------------------
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || currentPath === '' || currentPath.endsWith('index.html');
    if (isHomePage) {
        setTimeout(() => {
            // Check if modal exists and isn't already open
            const modal = document.getElementById('tcongs-lead-modal');
            if (modal && modal.classList.contains('hidden')) {
                if (typeof openLeadModal === 'function') {
                    openLeadModal();
                }
            }
        }, 5000); // 5-second delay for premium experience
    }
});

function highlightActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Handle "Solution" dropdown highlighting for service pages
        if (!href || href === '#' || href === 'javascript:void(0)') {
            if (currentPath.includes('/services/') && link.textContent.trim().toLowerCase() === 'solution') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
            return;
        }

        // Normalize paths for comparison
        const normalizedPath = currentPath === '/' || currentPath === '' ? '/index.html' : currentPath;
        const normalizedHref = href.startsWith('/') ? href : '/' + href;

        // Check if path matches href exactly or ends with it
        if (normalizedPath === normalizedHref || normalizedPath.endsWith(normalizedHref)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function ensureConnectNavLink() {
    const navList = document.getElementById('mobile-menu');
    if (!navList) return;

    const anchors = Array.from(navList.querySelectorAll('a.nav-link'));
    const hasConnect = anchors.some(a => (a.textContent || '').trim().toLowerCase() === 'connect');
    if (hasConnect) {
        anchors.forEach(a => {
            if ((a.textContent || '').trim().toLowerCase() === 'connect') a.setAttribute('href', '/work-with-us.html');
        });
        return;
    }

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'nav-link fs_18 lh_27 ff_inter text_white';
    a.href = '/work-with-us.html';
    a.textContent = 'Connect';
    li.appendChild(a);
    navList.appendChild(li);
}

function ensureLeadModals() {
    if (document.getElementById('tcongs-lead-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'tcongs-lead-modal';
    modal.className = 'tcongs-modal hidden';
    modal.innerHTML = `
        <div class="tcongs-modal__backdrop" data-modal-close="lead"></div>
        <div class="tcongs-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="tcongs-lead-title">
            <button class="tcongs-modal__close" type="button" aria-label="Close" data-modal-close="lead">×</button>
            <div class="tcongs-modal__brand">
                <img src="/frontend-assets/images/svgs/logo.svg" alt="Tcongs Infotech" width="90" height="26" />
            </div>
            <h2 id="tcongs-lead-title" class="tcongs-modal__title">Let’s Talk</h2>
            <p class="tcongs-modal__subtitle">Tell us a bit about your project and we’ll reach out shortly.</p>

            <form class="tcongs-form" id="tcongs-lead-form" novalidate>
                <div class="tcongs-form__row">
                    <label class="tcongs-label" for="tcongs_name">Full Name</label>
                    <input class="tcongs-input" id="tcongs_name" name="full_name" type="text" placeholder="Full Name*" autocomplete="name" required />
                    <div class="tcongs-error" data-error-for="full_name"></div>
                </div>

                <div class="tcongs-form__row">
                    <label class="tcongs-label" for="tcongs_email">Email Address</label>
                    <input class="tcongs-input" id="tcongs_email" name="email" type="email" placeholder="Email Address*" autocomplete="email" required />
                    <div class="tcongs-error" data-error-for="email"></div>
                </div>

                <div class="tcongs-form__row">
                    <label class="tcongs-label" for="tcongs_phone">Phone Number</label>
                    <input class="tcongs-input" id="tcongs_phone" name="phone" type="tel" placeholder="Phone Number*" required />
                    <div class="tcongs-error" data-error-for="phone"></div>
                </div>

                <div class="tcongs-form__row">
                    <textarea class="tcongs-textarea" id="tcongs_message" name="about_project" placeholder="Tell us about your project*" rows="3" required></textarea>
                    <div class="tcongs-error" data-error-for="about_project"></div>
                </div>

                <div class="tcongs-form__row">
                    <div class="math-verification-wrapper" style="border: 1px solid #333; padding: 8px 10px; border-radius: 6px; background: rgba(255,255,255,0.02);">
                        <p class="fs_14 ff_inter text_gray_200" style="margin-bottom: 10px;">Human Verification: <span id="math-question">...</span></p>
                        <input class="tcongs-input" id="math-answer" name="math_answer" placeholder="Enter Sum*" required type="number" />
                        <div class="tcongs-error" data-error-for="math_answer"></div>
                    </div>
                </div>

                <div class="tcongs-form__row">
                    <div class="tcongs-error tcongs-error--top" data-error-for="form"></div>
                    <button class="tcongs-btn" id="tcongs-lead-submit" type="submit">Submit Inquiry</button>
                </div>
            </form>
        </div>
    `;

    const thankYou = document.createElement('div');
    thankYou.id = 'tcongs-thankyou-modal';
    thankYou.className = 'tcongs-modal hidden';
    thankYou.innerHTML = `
        <div class="tcongs-modal__backdrop" data-modal-close="thanks"></div>
        <div class="tcongs-modal__dialog tcongs-modal__dialog--sm" role="dialog" aria-modal="true" aria-labelledby="tcongs-thankyou-title">
            <button class="tcongs-modal__close" type="button" aria-label="Close" data-modal-close="thanks">×</button>
            <div class="tcongs-modal__brand">
                <img src="/frontend-assets/images/svgs/logo.svg" alt="Tcongs Infotech" width="140" height="40" />
            </div>
            <div class="tcongs-thanks-content" style="text-align: center;">
                <h2 id="tcongs-thankyou-title" class="tcongs-modal__title" style="color: var(--color-primary); margin-bottom: 15px;">SUCCESS!</h2>
                <p class="tcongs-modal__subtitle" style="margin-bottom: 25px;">We have successfully received your enquiry. Our specialized team will get back to you within 24 hours.</p>
                
                <div class="flex flex-col items-center" style="gap: 15px;">
                    <a class="btn-component btn-light btn-slide-in relative overflow-hidden ff_inter" href="https://calendly.com/tcongsinfotech/30min" target="_blank" style="width: 100%; max-width: 280px; height: 50px;">
                        <span class="default-text absolute">Schedule Call</span>
                        <span class="hover-content absolute flex items-center w-full justify-start" style="gap: 16px; padding: 0 3px">
                            <img alt="talk" src="/frontend-assets/images/svgs/lets-talk.svg" />
                            <span class="hover-text">Lets Talk 🚀</span>
                        </span>
                    </a>

                    <a href="https://wa.me/919833011764" target="_blank" class="tcongs-btn" style="width: 100%; max-width: 280px; display: block; text-decoration: none; text-align: center; background: #25D366; color: white; border-radius: 9999px; padding: 12px 24px; font-weight: 600;">CONNECT ON WHATSAPP</a>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.appendChild(thankYou);

    initializeAllPhoneInputs();

    // Close handlers (backdrop + X)
    document.body.addEventListener('click', (e) => {
        const close = e.target.closest('[data-modal-close]');
        if (!close) return;
        const which = close.getAttribute('data-modal-close');
        if (which === 'lead') closeLeadModal();
        if (which === 'thanks') closeThankYouModal();
    });

    // Escape key closes any open modal
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (!document.getElementById('tcongs-thankyou-modal')?.classList.contains('hidden')) closeThankYouModal();
        if (!document.getElementById('tcongs-lead-modal')?.classList.contains('hidden')) closeLeadModal();
    });

    // Form submit
    const form = document.getElementById('tcongs-lead-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitLeadForm(form);
        });
    }
}

function wireLeadTriggers() {
    // Treat the full CTA button as trigger when it contains the swapped "lets-talk" span.
    document.querySelectorAll('a.btn-animate-swap, button.btn-animate-swap').forEach(el => {
        if (el.querySelector('.lets-talk')) el.setAttribute('data-open-lead', '1');
    });

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-open-lead], .lets-talk');
        if (!trigger) return;

        // If it's an actual link, stop navigation.
        e.preventDefault();
        openLeadModal();
    });
}

function openLeadModal() {
    const modal = document.getElementById('tcongs-lead-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.classList.add('tcongs-modal-open');

    // Reset errors and focus first input
    clearLeadErrors();
    
    // Generate new math challenge
    if (typeof generateGlobalMath === 'function') {
        generateGlobalMath();
    }

    const first = document.getElementById('tcongs_name');
    if (first) first.focus();
}

function closeLeadModal() {
    const modal = document.getElementById('tcongs-lead-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.classList.remove('tcongs-modal-open');
}

let _thankYouTimer = null;
let _mathAnswer = 0;

function openThankYouModal() {
    const modal = document.getElementById('tcongs-thankyou-modal');
    if (!modal) return;

    // Math logic removed from here as it moves to main forms
    modal.classList.remove('hidden');
    document.body.classList.add('tcongs-modal-open');

    // Auto-close after ~10 seconds
    if (_thankYouTimer) window.clearTimeout(_thankYouTimer);
    _thankYouTimer = window.setTimeout(() => closeThankYouModal(), 10000);
}

// expose minimal APIs for legacy scripts (e.g., jQuery validation)
window.openLeadModal = openLeadModal;
window.openThankYouModal = openThankYouModal;

function initializeAllPhoneInputs() {
    if (!window.intlTelInput) {
        // If script is not loaded yet (deferred), retry in a bit
        setTimeout(initializeAllPhoneInputs, 100);
        return;
    }
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        if (input.dataset.itiInitialized) return;
        
        // Remove existing select if next to it (from old static forms)
        const select = input.parentElement.querySelector('select[name="country_code"]');
        if (select) select.remove();

        const iti = window.intlTelInput(input, {
            initialCountry: 'auto',
            strictMode: true,
            utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@23/build/js/utils.js',
            geoIpLookup: function (cb) {
                fetch('https://ipapi.co/json')
                    .then(r => r.json())
                    .then(d => cb(d.country_code))
                    .catch(() => cb('in'));
            },
        });
        input.dataset.itiInitialized = "true";
        input._iti = iti;
    });
}

function closeThankYouModal() {
    const modal = document.getElementById('tcongs-thankyou-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.classList.remove('tcongs-modal-open');
}

function clearLeadErrors() {
    document.querySelectorAll('.tcongs-error[data-error-for]').forEach(el => (el.textContent = ''));
}

function setLeadError(field, message) {
    const el = document.querySelector(`.tcongs-error[data-error-for="${field}"]`);
    if (el) el.textContent = message || '';
}

function validateLeadFormValues(values, formElement = null) {
    const errors = {};
    
    // Normalize field names
    const name = (values.full_name || values.name || '').trim();
    const email = (values.email || '').trim();
    const phone = (values.phone || values.mobile || '').trim();
    const message = (values.about_project || values.message || '').trim();

    if (!name) errors.full_name = errors.name = 'Name is required';
    if (name && !/^[a-zA-Z\s]{3,60}$/.test(name)) {
        errors.full_name = errors.name = 'Only letters (min 3) are allowed';
    }
    
    if (!email) errors.email = 'Email is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
    
    if (!phone) {
        errors.phone = errors.mobile = 'Phone number is required';
    } else {
        // Try to find the specific input within the form if provided
        let phoneInput = null;
        if (formElement) {
            phoneInput = formElement.querySelector('input[type="tel"]');
        } else {
            phoneInput = document.querySelector('input[type="tel"][name="phone"], input[type="tel"][name="mobile"]');
        }

        if (phoneInput && phoneInput._iti) {
            if (!phoneInput._iti.isValidNumber()) {
                const validationError = phoneInput._iti.getValidationError();
                const msgs = {
                    1: 'Invalid country code',
                    2: 'Phone number is too short',
                    3: 'Phone number is too long',
                    4: 'Enter a valid phone number'
                };
                errors.phone = errors.mobile = msgs[validationError] || 'Enter a valid phone number';
            }
        } else if (!/^\+?[0-9]{7,16}$/.test(phone.replace(/\s/g, ''))) {
            errors.phone = errors.mobile = 'Enter a valid phone number';
        }
    }

    if (!message) errors.about_project = errors.message = 'Message is required';

    return { 
        errors, 
        cleaned: { 
            full_name: name, 
            name: name,
            email, 
            phone: phone,
            mobile: phone,
            about_project: message,
            message: message
        } 
    };
}

async function submitLeadForm(form) {
    clearLeadErrors();

    const submitBtn = document.getElementById('tcongs-lead-submit');
    const raw = Object.fromEntries(new FormData(form).entries());
    const { errors, cleaned } = validateLeadFormValues(raw, form);

    if (Object.keys(errors).length) {
        Object.entries(errors).forEach(([k, v]) => setLeadError(k, v));
        return;
    }

    // Check captcha
    const mathInput = form.querySelector('input[name="math_answer"]');
    if (mathInput && parseInt(mathInput.value) !== window._globalMathAnswer) {
        setLeadError('math_answer', 'Incorrect answer');
        if (typeof generateGlobalMath === 'function') generateGlobalMath();
        return;
    }

    const payload = {
        ...cleaned,
        source: 'popup',
        page: window.location.pathname
    };

    // Use full phone number from intl-tel-input if available
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput && phoneInput._iti) {
        payload.phone_full = phoneInput._iti.getNumber();
        payload.phone = payload.phone_full;
        payload.mobile = payload.phone_full;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }

        const scripts = document.getElementsByTagName('script');
        let apiUrl = 'lead-submit.php';
        for (let i = 0; i < scripts.length; i++) {
            const src = scripts[i].getAttribute('src') || '';
            if (src.indexOf('common.js') !== -1) {
                apiUrl = src.replace('frontend-assets/js/common.js', 'lead-submit.php');
                break;
            }
        }

        const formData = new URLSearchParams();
        Object.entries(payload).forEach(([k, v]) => formData.append(k, v));

        const res = await fetch(apiUrl + '?' + formData.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        const text = await res.text();
        let data = {};
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Invalid JSON response:', text);
        }

        if (!res.ok || !data.ok) {
            throw new Error(data.error || `Server Error ${res.status} at ${apiUrl}: ${text.substring(0, 100)}...`);
        }

        form.reset();
        closeLeadModal();
        openThankYouModal();
    } catch (err) {
        setLeadError('form', err?.message || 'Something went wrong. Please try again.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }
}

function wireConnectPageForm() {
    const forms = document.querySelectorAll('#tcongs-connect-form, #contactForm');
    
    // --- Math Verification Logic (Global) ---
    window._globalMathAnswer = 0;
    window.generateGlobalMath = function() {
        const qEls = document.querySelectorAll('#math-question');
        const aEls = document.querySelectorAll('#math-answer, input[name="math_answer"]');
        if (qEls.length === 0) return;
        
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        window._globalMathAnswer = n1 + n2;
        
        qEls.forEach(el => { el.textContent = `${n1} + ${n2} =`; });
        aEls.forEach(el => { el.value = ''; });
    }
    
    generateGlobalMath();

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Check math
            const aEl = form.querySelector('#math-answer, input[name="math_answer"]');
            if (aEl && parseInt(aEl.value) !== window._globalMathAnswer) {
                if (window.toastr) {
                    toastr.error('Incorrect math answer. Please try again.');
                } else {
                    alert('Incorrect math answer. Please try again.');
                }
                generateGlobalMath();
                return;
            }

            const raw = Object.fromEntries(new FormData(form).entries());
            const { errors, cleaned } = validateLeadFormValues(raw, form);

            // Clear and set errors
            form.querySelectorAll('.tcongs-error[data-error-for], .error-message').forEach(el => (el.textContent = ''));
            const setErr = (field, msg) => {
                const el = form.querySelector(`.tcongs-error[data-error-for="${field}"], .error-for-${field}`);
                if (el) el.textContent = msg || '';
                else if (field === 'full_name' || field === 'name') {
                    // fallback for some static forms
                    const nameInput = form.querySelector('input[name="full_name"], input[name="name"]');
                    if (nameInput && nameInput.nextElementSibling && nameInput.nextElementSibling.classList.contains('error-message')) {
                        nameInput.nextElementSibling.textContent = msg;
                    }
                }
            };

            if (Object.keys(errors).length) {
                Object.entries(errors).forEach(([k, v]) => setErr(k, v));
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Submitting...';
                }

                const pagePath = window.location.pathname;
                const serviceName = pagePath.includes('/services/') 
                    ? pagePath.split('/').pop().replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : 'Digital Solution';

                const payload = {
                    ...cleaned,
                    source: pagePath,
                    service: serviceName
                };

                const phoneInput = form.querySelector('input[type="tel"]');
                if (phoneInput && phoneInput._iti) {
                    payload.phone_full = phoneInput._iti.getNumber();
                    payload.phone = payload.phone_full;
                    payload.mobile = payload.phone_full;
                } else {
                    payload.phone_full = `${cleaned.country_code || ''}${cleaned.mobile || cleaned.phone || ''}`;
                }

                const scripts = document.getElementsByTagName('script');
                let apiUrl = 'lead-submit.php';
                for (let i = 0; i < scripts.length; i++) {
                    const src = scripts[i].getAttribute('src') || '';
                    if (src.indexOf('common.js') !== -1) {
                        apiUrl = src.replace('frontend-assets/js/common.js', 'lead-submit.php');
                        break;
                    }
                }

                const formData = new URLSearchParams();
                Object.entries(payload).forEach(([k, v]) => formData.append(k, v));

                const res = await fetch(apiUrl + '?' + formData.toString(), {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                const text = await res.text();
                let data = {};
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Invalid JSON response:', text);
                }

                if (!res.ok || !data.ok) {
                    throw new Error(data.error || `Server Error ${res.status} at ${apiUrl}: ${text.substring(0, 100)}...`);
                }

                form.reset();
                openThankYouModal();
            } catch (err) {
                alert(err.message || 'Something went wrong.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    });
}

function ensureChatbot() {
    // Remove WhatsApp widget if present (Disabled to allow manual links)
    // document.querySelectorAll('a[href*="wa.me"], a[aria-label*="WhatsApp"]').forEach(a => a.remove());

    if (document.getElementById('tcongs-chatbot')) return;

    const root = document.createElement('div');
    root.id = 'tcongs-chatbot';
    root.innerHTML = `
        <button class="tcongs-chatbot__fab" type="button" aria-label="Open chat">
            <span class="tcongs-chatbot__fab-dot"></span>
            Chat
        </button>
        <div class="tcongs-chatbot__panel hidden" role="dialog" aria-label="Chatbot">
            <div class="tcongs-chatbot__header">
                <div class="tcongs-chatbot__avatar-container">
                    <img class="tcongs-chatbot__avatar-img" src="/frontend-assets/images/favicon.png" alt="Tcongs" />
                    <span class="tcongs-chatbot__status-dot"></span>
                </div>
                <div class="tcongs-chatbot__title-container">
                    <div class="tcongs-chatbot__title">Tcongs Assistant</div>
                    <p class="tcongs-chatbot__status">● Online</p>
                </div>
                <button class="tcongs-chatbot__close" type="button" aria-label="Close chat">×</button>
            </div>
            <div class="tcongs-chatbot__messages" aria-live="polite"></div>
            <form class="tcongs-chatbot__composer">
                <input class="tcongs-chatbot__input" type="text" placeholder="Type your message..." autocomplete="off" />
                <button class="tcongs-chatbot__send" type="submit">Send</button>
            </form>
        </div>
    `;
    document.body.appendChild(root);

    const fab = root.querySelector('.tcongs-chatbot__fab');
    const panel = root.querySelector('.tcongs-chatbot__panel');
    const closeBtn = root.querySelector('.tcongs-chatbot__close');
    const messagesEl = root.querySelector('.tcongs-chatbot__messages');
    const form = root.querySelector('.tcongs-chatbot__composer');
    const input = root.querySelector('.tcongs-chatbot__input');

    const chatbotData = {
        name: '',
        phone: '',
        email: '',
        service: '',
        step: 0,
        inContactFlow: false
    };

    const steps = [
        { 
            key: 'name', 
            question: "Great! Let's get your details so our team can reach out. First, could you please tell me your Full Name?",
            validate: (val) => /^[a-zA-Z\s]{3,60}$/.test(val) ? null : "Please enter a valid name (at least 3 characters, letters only)."
        },
        { 
            key: 'phone', 
            question: "Thanks {name}! What is your Phone Number?",
            validate: (val) => /^\+?[0-9\s\-]{7,16}$/.test(val) ? null : "Please enter a valid phone number (at least 7 digits)."
        },
        { 
            key: 'email', 
            question: "Got it. And your Email Address?",
            validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : "Please enter a valid email address."
        },
        { key: 'service', question: "Lastly, what Service are you looking for?" },
        { key: 'finished', question: "Thank you! I've sent your details to our team. They will reach out to you within 24 hours. Anything else you'd like to know?" }
    ];

    const botReplies = {
        services: `We offer specialized digital solutions to help you scale:<br>1. <strong>Web & App Development</strong> - Fast, scalable, and responsive custom websites & mobile apps.<br>2. <strong>Software Development</strong> - Custom business software, APIs, and cloud integrations.<br>3. <strong>E-commerce Solutions</strong> - Build high-converting Shopify/WooCommerce stores and optimize Amazon/eBay marketplaces.<br>4. <strong>Branding & UI/UX</strong> - Modern interfaces and brand identities designed to convert.<br>5. <strong>Digital Marketing</strong> - Result-driven SEO, PPC, and Generative Engine Optimization (GEO).`,
        about: `We are a premier IT solutions agency with 8+ years of experience in custom web development, e-commerce marketplace optimization, and digital marketing. Based in Mumbai, India, we serve global brands and startups, helping them build, launch, and scale successfully.`,
        careers: `Interested in joining Tcongs Infotech? We are always looking for passionate developers, designers, and marketers. Drop your CV directly at <a href="mailto:info@tcongsinfotech.com" style="color:var(--color-primary); text-decoration:underline;">info@tcongsinfotech.com</a>.`
    };

    const addMsg = (role, text) => {
        const item = document.createElement('div');
        item.className = `tcongs-chatbot__msg tcongs-chatbot__msg--${role}`;
        item.innerHTML = text;
        messagesEl.appendChild(item);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const appendQuickReplyChips = () => {
        const existing = messagesEl.querySelector('.tcongs-chatbot__chips');
        if (existing) existing.remove();

        const chipsWrap = document.createElement('div');
        chipsWrap.className = 'tcongs-chatbot__chips';

        const chips = [
            { text: 'Our Services', reply: 'services' },
            { text: 'Contact Details', reply: 'contact' },
            { text: 'About Us', reply: 'about' },
            { text: 'Careers', reply: 'careers' }
        ];

        chips.forEach(chip => {
            const btn = document.createElement('button');
            btn.className = 'tcongs-chatbot__chip-btn';
            btn.type = 'button';
            btn.setAttribute('data-reply', chip.reply);
            btn.textContent = chip.text;
            btn.addEventListener('click', () => handleChipClick(chip.reply, chip.text));
            chipsWrap.appendChild(btn);
        });

        messagesEl.appendChild(chipsWrap);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const handleChipClick = (replyKey, chipText) => {
        const existing = messagesEl.querySelector('.tcongs-chatbot__chips');
        if (existing) existing.remove();

        addMsg('user', chipText);

        if (replyKey === 'contact') {
            chatbotData.inContactFlow = true;
            chatbotData.step = 0;
            chatbotData.name = '';
            chatbotData.phone = '';
            chatbotData.email = '';
            chatbotData.service = '';

            setTimeout(() => {
                const step = steps[0];
                addMsg('bot', step.question);
            }, 600);
        } else {
            setTimeout(() => {
                const botResponse = botReplies[replyKey] || "How else can I assist you today?";
                addMsg('bot', botResponse);
                setTimeout(appendQuickReplyChips, 500);
            }, 600);
        }
    };

    const open = () => {
        panel.classList.remove('hidden');
        if (messagesEl.children.length === 0) {
            addMsg('bot', "Hi! Welcome to Tcongs Infotech. How can we help you today?");
            appendQuickReplyChips();
        }
        // Only auto-focus input on desktop — prevents keyboard popping up on mobile
        if (input && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            input.focus();
        }
    };

    const close = () => panel.classList.add('hidden');

    fab?.addEventListener('click', () => (panel.classList.contains('hidden') ? open() : close()));
    closeBtn?.addEventListener('click', close);

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = (input?.value || '').trim();
        if (!text) return;
        input.value = '';
        addMsg('user', text);

        const existing = messagesEl.querySelector('.tcongs-chatbot__chips');
        if (existing) existing.remove();

        if (chatbotData.inContactFlow) {
            if (chatbotData.step < steps.length - 1) {
                const step = steps[chatbotData.step];
                const error = step.validate ? step.validate(text) : null;
                
                if (error) {
                    setTimeout(() => {
                        addMsg('bot', error);
                    }, 400);
                    return;
                }

                chatbotData[step.key] = text;
                chatbotData.step++;
                
                if (chatbotData.step === steps.length - 1) {
                    await sendChatbotLead();
                    chatbotData.inContactFlow = false;
                    setTimeout(() => {
                        addMsg('bot', steps[steps.length - 1].question);
                        setTimeout(appendQuickReplyChips, 500);
                    }, 600);
                } else {
                    setTimeout(() => {
                        let q = steps[chatbotData.step].question.replace('{name}', chatbotData.name);
                        addMsg('bot', q);
                    }, 600);
                }
            }
        } else {
            setTimeout(() => {
                const t = text.toLowerCase();
                if (t.includes('price') || t.includes('cost') || t.includes('quote')) {
                    addMsg('bot', 'A specialized team member will discuss pricing once they reach out to you. Feel free to choose **Contact Details** to submit your inquiry.');
                } else if (t.includes('service') || t.includes('solution')) {
                    addMsg('bot', 'We do UI/UX, web & app design, branding, and custom software. Check our Solutions menu or select **Our Services** below!');
                } else {
                    addMsg('bot', 'Got it. To help us assist you better, please choose one of the options below or select **Contact Details** to leave your info.');
                }
                setTimeout(appendQuickReplyChips, 500);
            }, 600);
        }
    });

    async function sendChatbotLead() {
        const payload = {
            full_name: chatbotData.name,
            phone: chatbotData.phone,
            email: chatbotData.email,
            about_project: `Service Required: ${chatbotData.service}`,
            source: 'chatbot',
            page: window.location.pathname
        };

        try {
            const scripts = document.getElementsByTagName('script');
            let apiUrl = 'lead-submit.php';
            for (let i = 0; i < scripts.length; i++) {
                const src = scripts[i].getAttribute('src') || '';
                if (src.indexOf('common.js') !== -1) {
                    apiUrl = src.replace('frontend-assets/js/common.js', 'lead-submit.php');
                    break;
                }
            }

            const formData = new URLSearchParams();
            Object.entries(payload).forEach(([k, v]) => formData.append(k, v));

            await fetch(apiUrl + '?' + formData.toString(), {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
        } catch (err) {
            console.error('Chatbot submission failed:', err);
        }
    }
}
function initSolutionsToggle() {
    const triggers = document.querySelectorAll('.solutions-toggle-trigger');
    const solutionsDropdown = document.querySelector('.services-dropdown');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (solutionsDropdown) {
                const isMobile = window.innerWidth < 992;
                const targetTab = trigger.getAttribute('data-service-tab');
                
                if (isMobile) {
                    const mobileMegaMenu = solutionsDropdown.querySelector('.services-mega-menu');
                    if (mobileMegaMenu) {
                        mobileMegaMenu.classList.add('active');
                    }
                } else {
                    solutionsDropdown.classList.add('open');
                }
                
                // If data-service-tab is present, activate that tab/accordion
                if (targetTab) {
                    const tabBtn = document.querySelector(`.tab-button[data-tab="${targetTab}"]`);
                    if (tabBtn) tabBtn.click();
                }

                // If it was already open and clicked again without a specific tab, toggle desktop
                if (!isMobile && !targetTab && solutionsDropdown.classList.contains('open')) {
                    // This part is for the main header link
                    // If we want it to toggle, we'd need to know if it was ALREADY open before this click
                    // But our logic above always does .add('open'). Let's fix that.
                }
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (solutionsDropdown && !solutionsDropdown.contains(e.target)) {
            solutionsDropdown.classList.remove('open');
        }
    });
}
