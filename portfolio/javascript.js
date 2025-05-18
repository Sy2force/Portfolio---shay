// Portfolio Setup
document.addEventListener('DOMContentLoaded', () => {
  // DOM Cache
const DOM = {
    navLinks: document.querySelectorAll('.nav-link'),
    contactForm: document.getElementById('contactForm'),
    downloadButtons: document.querySelectorAll('.download-btn'),
    sections: Array.from(document.querySelectorAll('section[id]')),
    skillIcons: document.querySelectorAll('.skill-icon'),
    projectCards: document.querySelectorAll('.projects .project-card, .glass-card'),
    profilePic: document.querySelector('.profile-pic'),
    lazyImages: document.querySelectorAll('img[loading="lazy"]')
};

  // Init Functions
initPortfolio();

function initPortfolio() {
    initDownloadButtons();
    initLogoAnimations();
    initSmoothNavigation();
    initDownloadHandlers();
    initContactForm();
    initLazyLoading();
    initVisualEffects();
    
    updateActiveNavLink();
    window.addEventListener('scroll', throttle(updateActiveNavLink, 100), { passive: true });
}

  // Logo Effects
function initLogoAnimations() {
    const icons = {
    html: document.querySelector('.skill-icon.html-icon'),
    css: document.querySelector('.skill-icon.css-icon'),
    js: document.querySelector('.skill-icon.js-icon')
    };
    
    if (icons.html) setTimeout(() => icons.html.classList.add('logo-animate'), 100);
    if (icons.css) setTimeout(() => icons.css.classList.add('logo-animate'), 300);
    if (icons.js) setTimeout(() => icons.js.classList.add('logo-animate'), 500);
    
    document.addEventListener('click', event => {
    const icon = event.target.closest('.skill-icon');
    if (!icon) return;
    
    icon.style.transform = 'scale(0.95)';
    setTimeout(() => icon.style.transform = '', 150);
    
    createTooltip(icon);
    });
    
    function createTooltip(icon) {
    if (document.querySelector('.skill-tooltip')) return;
    
    const messages = {
        'html-icon': 'HTML5 - The standard markup language for the web',
        'css-icon': 'CSS3 - The standard for styling web pages',
        'js-icon': 'JavaScript - The programming language that makes the web interactive'
    };
    
    const iconClass = Array.from(icon.classList).find(cls => messages[cls]);
    if (!iconClass) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip';
    tooltip.textContent = messages[iconClass];
    tooltip.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 30px;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(tooltip);
    requestAnimationFrame(() => tooltip.style.opacity = '1');
    
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.addEventListener('transitionend', () => tooltip.remove());
    }, 3000);
    }
}

  // Fix Buttons
function initDownloadButtons() {
    DOM.downloadButtons.forEach(button => {
    if (button.outerHTML.includes('class="download-btn">class="download-btn"')) {
        button.outerHTML = button.outerHTML.replace('class="download-btn">class="download-btn"', 'class="download-btn">');
    }
    
    let downloadPath = button.getAttribute('data-download');
    
    if (!downloadPath || downloadPath === '') {
        const parentContainer = button.closest('.project-card-container');
        if (parentContainer) {
        const heading = parentContainer.querySelector('h3');
        if (heading) {
            const fileName = heading.textContent.trim().replace(/\s+/g, '') + '.zip';
            downloadPath = 'assets/downloads/' + fileName;
            button.setAttribute('data-download', downloadPath);
        }
        }
    } else if (downloadPath && !downloadPath.startsWith('assets/')) {
        button.setAttribute('data-download', 'assets/downloads/' + downloadPath);
    }
    });
}

  // Smooth Scroll
function initSmoothNavigation() {
    DOM.navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        
        const targetId = this.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        DOM.navLinks.forEach(navLink => navLink.classList.remove('active'));
        this.classList.add('active');
        }
    });
    });
}

  // Enhanced Navigation
function initSmoothNavigation() {
    // Create section-to-nav map for faster lookup
    const navMap = {};
    DOM.navLinks.forEach(link => {
    const targetId = link.getAttribute('href')?.substring(1);
    if (targetId) {
        navMap[targetId] = link;
    }
    
    link.addEventListener('click', function(event) {
        event.preventDefault();
        
        const targetId = this.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // More precise offset calculation
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        
          // Set active class immediately for better UX
        DOM.navLinks.forEach(navLink => navLink.classList.remove('active'));
        this.classList.add('active');
        
          // Smooth scroll with callback
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
          // Set URL hash without scroll jump
        if (history.pushState) {
            history.pushState(null, null, '#' + targetId);
        } else {
            location.hash = '#' + targetId;
        }
        }
    });
    });
    
    // Check for URL hash on page load
    if (location.hash) {
    const targetId = location.hash.substring(1);
    const targetLink = navMap[targetId];
    if (targetLink) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
        targetLink.click();
        }, 100);
    }
    }
}

  // Enhanced Active Navigation
function updateActiveNavLink() {
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    const sections = DOM.sections.filter(section => section !== null);
    
    // Find the active section
    let activeSection = null;
    
    // Reverse loop to prioritize later sections for better accuracy
    for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
      // Check if we're at or past section's top edge
    if (scrollPosition >= section.offsetTop) {
        activeSection = section;
        break;
    }
    }
    
    // If we're at the very top, use the first section
    if (!activeSection && sections.length > 0) {
    activeSection = sections[0];
    }
    
    // Update active nav link
    if (activeSection) {
    const sectionId = activeSection.id;
    DOM.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href === '#' + sectionId) {
        link.classList.add('active');
        } else {
        link.classList.remove('active');
        }
    });
    }
}

  // Download Handler
function initDownloadHandlers() {
    function downloadFile(zipPath) {
    if (!zipPath) {
        console.error('Missing download path');
        alert('Download link not available. Please try again later.');
        return false;
    }
    
    const tempLink = document.createElement('a');
    tempLink.href = zipPath;
    tempLink.download = zipPath.split('/').pop();
    tempLink.style.display = 'none';
    
    document.body.appendChild(tempLink);
    
    try {
    tempLink.click();
    setTimeout(() => tempLink.remove(), 100);
    return true;
    } catch (e) {
    console.error('Download error:', e);
    alert('Error during download. Please try again.');
    tempLink.remove();
    return false;
    }
    }
    
    document.addEventListener('click', event => {
    const button = event.target.closest('.play-center .download-btn');
    if (!button) return;
    
    event.preventDefault();
    
    if (button.innerHTML.includes('class="download-btn">')) {
        button.innerHTML = '<div class="download-icon"></div><span>DOWNLOAD</span>';
    }
    
    let zipPath = button.getAttribute('data-download');
    if (zipPath && !zipPath.startsWith('assets/')) {
        zipPath = 'assets/downloads/' + zipPath;
    }
    
    button.classList.add('downloading');
    
    const success = downloadFile(zipPath);
    
    if (success) {
        setTimeout(() => {
        button.classList.add('shake');
        setTimeout(() => {
            button.classList.remove('downloading', 'shake');
        }, 600);
        }, 400);
    } else {
        button.classList.remove('downloading');
    }
    });
    
    document.addEventListener('click', event => {
    const button = event.target.closest('.projects .tech-tag.download-tag a');
    if (!button) return;
    
    event.preventDefault();
    
    const downloadPath = button.getAttribute('href');
    if (downloadPath && downloadPath.includes('.zip')) {
        const tag = button.closest('.tech-tag');
        tag.classList.add('pulse');
        setTimeout(() => tag.classList.remove('pulse'), 500);
        
        downloadFile(downloadPath);
    }
    });
}

  // Contact Validation
function initContactForm() {
    if (!DOM.contactForm) return;
    
    DOM.contactForm.addEventListener('submit', event => {
    event.preventDefault();
    
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();
    
    if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    const submitButton = DOM.contactForm.querySelector('button[type="submit"]');
    if (!submitButton) return;
    
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        alert('Message sent successfully!');
        DOM.contactForm.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 1000);
    });
}

  // Image Loading
function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) return;
    
    if ('IntersectionObserver' in window) {
    const lazyObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            }
            lazyObserver.unobserve(img);
        }
        });
    });
    
    DOM.lazyImages.forEach(img => lazyObserver.observe(img));
    } else {
    const lazyLoad = throttle(function() {
        DOM.lazyImages.forEach(img => {
        if (!img.dataset.src) return;
        
        const rect = img.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
        
        if (isVisible) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
        });
    }, 200);
    
    lazyLoad();
    window.addEventListener('scroll', lazyLoad, { passive: true });
    window.addEventListener('resize', lazyLoad, { passive: true });
    }
}

  // Visual Effects
function initVisualEffects() {
    document.body.classList.add('js-loaded');
    
    document.addEventListener('mouseenter', event => {
    const card = event.target.closest('.project-card, .glass-card');
    if (card) {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
    }
    }, true);
    
    document.addEventListener('mouseleave', event => {
    const card = event.target.closest('.project-card, .glass-card');
    if (card) {
        card.style.transform = '';
        card.style.boxShadow = '';
    }
    }, true);
    
    if (DOM.profilePic) {
    DOM.profilePic.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.borderColor = '#ec1a1a';
    });
    
    DOM.profilePic.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.borderColor = '';
    });
    }
}

  // Performance Helper
function throttle(callback, delay) {
    let lastCall = 0;
    return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
        lastCall = now;
        return callback.apply(this, args);
    }
    };
}
});