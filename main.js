// ============================================
// INITIALIZE LUCIDE ICONS
// ============================================
// Guard: if the deferred Lucide library failed to load,
// the rest of the page functionality still works.
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// ============================================
// THREE.JS 3D BACKGROUND
// ============================================
function initThreeBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Graceful degradation: if the deferred Three.js library is not available,
    // skip the 3D background — the rest of the page keeps working normally.
    if (typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.position.z = 5;

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;

        colors[i] = 0.3 + Math.random() * 0.4;
        colors[i + 1] = 0.2 + Math.random() * 0.3;
        colors[i + 2] = 0.6 + Math.random() * 0.4;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const geometries = [
        new THREE.TorusGeometry(0.3, 0.1, 16, 100),
        new THREE.OctahedronGeometry(0.3),
        new THREE.TetrahedronGeometry(0.3),
    ];

    const material = new THREE.MeshPhongMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
    });

    const shapes = [];
    geometries.forEach((geometry, index) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        shapes.push(mesh);
        scene.add(mesh);
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4488ff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();

    function animate() {
        const elapsedTime = clock.getElapsedTime();

        particles.rotation.y = elapsedTime * 0.05;
        particles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;

        shapes.forEach((shape, index) => {
            shape.rotation.x = elapsedTime * (0.2 + index * 0.1);
            shape.rotation.y = elapsedTime * (0.3 + index * 0.1);
            shape.position.y = Math.sin(elapsedTime + index * 2) * 2;
        });

        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ============================================
// NAVBAR
// ============================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// PERF: rAF-throttled + passive scroll listener (no layout reads, one class toggle per frame)
let navbarScrollTicking = false;
window.addEventListener('scroll', () => {
    if (navbarScrollTicking) return;
    navbarScrollTicking = true;
    requestAnimationFrame(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        navbarScrollTicking = false;
    });
}, { passive: true });

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ============================================
// DOWNLOAD CV FUNCTION
// ============================================
function downloadCV() {
    const link = document.createElement('a');
    link.href = 'fazalrabbiabbasicv.pdf';
    link.download = 'Fazal_Rabi_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📄 Downloading CV...');
}

// ============================================
// API URL
// ============================================
const API_BASE_URL = "https://fazal-rabbi-abbasi-website-dcbx.vercel.app";
console.log('🚀 API URL:', API_BASE_URL);

// ============================================
// CONTACT FORM HANDLER
// ============================================
const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitButton = contactForm.querySelector("button[type='submit']");
        const originalText = submitButton.innerHTML;

        submitButton.disabled = true;
        submitButton.innerHTML = `
            <i data-lucide="loader" class="spin"></i>
            Sending...
        `;
        lucide.createIcons();

        const formData = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            subject: document.getElementById("subject").value.trim(),
            message: document.getElementById("message").value.trim()
        };

        console.log('📤 Sending:', formData);

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            showToast("⚠️ Please fill in all fields");
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            showToast("⚠️ Please enter a valid email address");
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: "POST",
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log('📥 Response:', data);

            if (response.ok && data.success) {
                showToast("✅ Message sent successfully!");
                contactForm.reset();
            } else {
                showToast(data.message || data.detail || "❌ Failed to send message.");
            }
        } catch (error) {
            console.error('❌ Error:', error);
            showToast("❌ Cannot connect to backend. Please try again.");
        }

        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        lucide.createIcons();
    });
}

// ============================================
// SERVICE CARDS - "Learn More" Functionality
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const serviceLinks = document.querySelectorAll('.service-learn-more');
    const contactSection = document.getElementById('contact');
    const subjectInput = document.getElementById('subject');
    
    serviceLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const serviceCard = this.closest('.service-card');
            const serviceName = serviceCard.querySelector('h3')?.textContent || 'Service';
            
            if (subjectInput) {
                subjectInput.value = `Inquiry about: ${serviceName}`;
                subjectInput.focus();
                subjectInput.classList.add('subject-highlight');
                setTimeout(() => {
                    subjectInput.classList.remove('subject-highlight');
                }, 2000);
            }
            
            if (contactSection) {
                contactSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            console.log(`📝 Service clicked: ${serviceName}`);
        });
    });
});

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '15px 25px';
        toast.style.borderRadius = '8px';
        toast.style.color = 'white';
        toast.style.fontWeight = '500';
        toast.style.zIndex = '9999';
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.3s ease';
        toast.style.maxWidth = '400px';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.backgroundColor = message.includes('✅') ? '#10b981' : '#ef4444';
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

// ============================================
// SCROLL TO TOP
// ============================================
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================
// INTERSECTION OBSERVER - Animations
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.skill-card, .project-card, .service-card, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// ============================================
// SKILL BARS ANIMATION
// ============================================
const skillProgressBars = document.querySelectorAll('.skill-progress');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
            skillObserver.unobserve(bar);
        }
    });
}, { threshold: 0.5 });

skillProgressBars.forEach(bar => {
    skillObserver.observe(bar);
});

// ============================================
// SPIN ANIMATION STYLE
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);

// ============================================
// PARALLAX EFFECT
// ============================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-right');
    
    parallaxElements.forEach(el => {
        const speed = 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ============================================
// DOM CONTENT LOADED - Three.js Starts Here
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // PERFORMANCE: initialize the 3D background lazily.
    // It runs only after the browser is idle and the main content has painted,
    // so it never delays First Contentful Paint / initial visible content.
    const startThreeBackground = () => {
        if (typeof THREE === 'undefined') return;
        initThreeBackground();
    };
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(startThreeBackground, { timeout: 2000 });
    } else {
        window.setTimeout(startThreeBackground, 300);
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.8s ease-out';
        
        setTimeout(() => {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        sectionObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            sectionObserver.observe(section);
        }, index * 100);
    });
});

// ============================================
// CURSOR TRAIL - WORKS ON ALL DEVICES
// ============================================

// Create trail dots
const trailDots = [];
const numDots = 15;

for (let i = 0; i < numDots; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
        position: fixed;
        width: ${8 - (i * 0.4)}px;
        height: ${8 - (i * 0.4)}px;
        background: ${i === 0 ? '#3b82f6' : `rgba(59, 130, 246, ${0.8 - (i / numDots)})`};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: all 0.05s ease;
        box-shadow: ${i === 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'};
        opacity: 0;
    `;
    document.body.appendChild(dot);
    trailDots.push({
        element: dot,
        x: 0,
        y: 0
    });
}

let mouseX = 0;
let mouseY = 0;
let isActive = false;
let hideTimeout;

// Update dots position
function updateDots() {
    if (!isActive) {
        requestAnimationFrame(updateDots);
        return;
    }
    
    trailDots.forEach((dot, index) => {
        if (index === 0) {
            dot.x = mouseX;
            dot.y = mouseY;
        } else {
            const dx = trailDots[index - 1].x - dot.x;
            const dy = trailDots[index - 1].y - dot.y;
            dot.x += dx * 0.3;
            dot.y += dy * 0.3;
        }
        
        dot.element.style.left = dot.x + 'px';
        dot.element.style.top = dot.y + 'px';
    });
    
    requestAnimationFrame(updateDots);
}

// Track mouse (for desktop)
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isActive = true;
    
    trailDots.forEach((dot, index) => {
        dot.element.style.opacity = 1 - (index / numDots * 0.5);
    });
    
    clearTimeout(hideTimeout);
    
    hideTimeout = setTimeout(() => {
        trailDots.forEach(dot => {
            dot.element.style.opacity = '0';
        });
        isActive = false;
    }, 3000);
});

// Track touch (for mobile/tablet)
document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (touch) {
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        isActive = true;
        
        trailDots.forEach((dot, index) => {
            dot.element.style.opacity = 1 - (index / numDots * 0.5);
        });
        
        clearTimeout(hideTimeout);
        
        hideTimeout = setTimeout(() => {
            trailDots.forEach(dot => {
                dot.element.style.opacity = '0';
            });
            isActive = false;
        }, 3000);
    }
}, { passive: true });

// Track touch start
document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (touch) {
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        isActive = true;
        
        trailDots.forEach((dot, index) => {
            dot.element.style.opacity = 1 - (index / numDots * 0.5);
        });
        
        clearTimeout(hideTimeout);
    }
}, { passive: true });

// Show dots when mouse enters (desktop)
document.addEventListener('mouseenter', () => {
    isActive = true;
    trailDots.forEach((dot, index) => {
        dot.element.style.opacity = 1 - (index / numDots * 0.5);
    });
});

// Start animation
updateDots();

console.log('🖱️ Cursor trail enabled for all devices');

// ============================================
// INTERACTIVE ELEMENTS
// ============================================
const interactiveElements = document.querySelectorAll('a, button, .project-card, .service-card, .skill-card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.style.cursor = 'pointer';
    });
    
    el.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'default';
    });
});

window.downloadCV = downloadCV;

// ============================================
// PAGE LOAD ANIMATION
// ============================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ============================================
// KONAMI CODE EASTER EGG
// ============================================
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            showToast('🎮 Konami Code Activated! You found the easter egg!');
            document.body.style.animation = 'rainbow 2s infinite';
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

// ============================================
// LAZY LOAD IMAGES
// ============================================
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// ============================================
// CONSOLE LOGS
// ============================================
console.log('%c👋 Hey there, curious developer!', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
console.log('%cInterested in the code? Check out the GitHub repo!', 'font-size: 14px; color: #8b5cf6;');
console.log('%c🚀 Built with HTML, CSS, JavaScript & Three.js', 'font-size: 12px; color: #94a3b8;');

// ============================================
// DARK/LIGHT MODE TOGGLE
// ============================================
if (!document.getElementById('theme-toggle')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'theme-toggle';
    toggleBtn.className = 'theme-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle Dark/Light Mode');
    toggleBtn.innerHTML = '<i data-lucide="moon"></i>';
    document.body.appendChild(toggleBtn);
    lucide.createIcons();
}

const themeToggle = document.getElementById('theme-toggle');

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

function updateThemeIcon(theme) {
    const icon = themeToggle?.querySelector('i');
    if (icon) {
        icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
    }
}

updateThemeIcon(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        showToast(`🌙 ${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`);
    });
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
if (!localStorage.getItem('theme')) {
    const systemTheme = prefersDark.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', systemTheme);
    updateThemeIcon(systemTheme);
}

prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    }
});

// NOTE: Project cards are defined statically in index.html (5 projects).
// A stale dynamic project loader (dead code, never called) was removed here:
// its hardcoded project array no longer matched the live cards.
