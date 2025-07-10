// LoanBuddy Pro - JavaScript Puro

// Inicialização dos ícones Lucide
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
});

// Navegação para autenticação
function navigateToAuth(tab) {
    if (tab) {
        // Simula navegação - em produção seria window.location.href = `/auth?tab=${tab}`;
        alert(`Redirecionando para página de ${tab === 'register' ? 'cadastro' : 'login'}...`);
    } else {
        alert('Redirecionando para página de login...');
    }
}

// Scroll suave para demonstração
function scrollToDemo() {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
        demoSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Prompt de instalação PWA (simulado)
function showInstallPrompt() {
    if ('serviceWorker' in navigator) {
        alert('Funcionalidade de instalação PWA disponível! Em produção, isso abriria o prompt de instalação.');
    } else {
        alert('Seu navegador não suporta PWA. Tente usar Chrome, Firefox ou Safari.');
    }
}

// FAQ Toggle
function toggleFaq(index) {
    const faqItems = document.querySelectorAll('.faq-item');
    const currentItem = faqItems[index];
    
    // Fecha todas as outras FAQs
    faqItems.forEach((item, i) => {
        if (i !== index) {
            item.classList.remove('active');
        }
    });
    
    // Toggle da FAQ atual
    currentItem.classList.toggle('active');
}

// Animações de scroll
function handleScrollAnimations() {
    const cards = document.querySelectorAll('.feature-card, .pricing-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Efeito parallax suave no hero
function initParallax() {
    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        
        if (hero) {
            hero.style.transform = `translateY(${parallax}px)`;
        }
    });
}

// Contador animado (para futuras métricas)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        element.textContent = Math.floor(start);
        
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

// Smooth scroll para links internos
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Loading do video demo (simulado)
function loadDemoVideo() {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    
    if (videoPlaceholder) {
        videoPlaceholder.addEventListener('click', function() {
            this.innerHTML = `
                <div style="width: 100%; height: 100%; background: linear-gradient(45deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                    <div style="text-align: center;">
                        <div style="margin-bottom: 1rem;">📹</div>
                        <div>Demonstração do loanBuddy</div>
                        <div style="font-size: 1rem; opacity: 0.8; margin-top: 0.5rem;">Funcionalidades completas em ação</div>
                    </div>
                </div>
            `;
        });
    }
}

// Efeito de typing no hero title (opcional)
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const originalText = heroTitle.innerHTML;
    const words = originalText.split(' ');
    let currentWordIndex = 0;
    
    // Implementação simplificada do efeito typing
    // Em produção, você poderia usar uma biblioteca como Typed.js
}

// Detectar tema preferido do usuário
function initThemeDetection() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-theme');
    }
    
    // Listener para mudanças de tema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (e.matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    });
}

// Lazy loading para imagens (futuro)
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Analytics simplificado (simulado)
function trackEvent(eventName, eventData = {}) {
    console.log('Analytics Event:', eventName, eventData);
    
    // Em produção, aqui você enviaria para Google Analytics, Facebook Pixel, etc.
    // gtag('event', eventName, eventData);
}

// Event listeners para tracking
function initAnalytics() {
    // Track clicks nos botões principais
    document.querySelectorAll('.btn-hero, .btn-accent').forEach(btn => {
        btn.addEventListener('click', () => {
            trackEvent('cta_click', {
                button_text: btn.textContent.trim(),
                section: btn.closest('section')?.className || 'unknown'
            });
        });
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            if (maxScroll % 25 === 0) { // Track a cada 25%
                trackEvent('scroll_depth', { percent: maxScroll });
            }
        }
    });
}

// Feedback visual para interações
function initFeedback() {
    // Ripple effect nos botões
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// CSS para animação do ripple
const rippleCSS = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;

// Adicionar CSS dinamicamente
function addCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// Inicialização principal
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos os módulos
    handleScrollAnimations();
    initSmoothScroll();
    loadDemoVideo();
    initThemeDetection();
    initLazyLoading();
    initAnalytics();
    initFeedback();
    
    // Adicionar CSS para animações
    addCSS(rippleCSS);
    
    // Opcional: efeito parallax (pode impactar performance em dispositivos móveis)
    if (window.innerWidth > 768) {
        initParallax();
    }
    
    console.log('LoanBuddy Pro - Website carregado com sucesso! 🚀');
});

// Service Worker para PWA (básico)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha ao registrar SW:', error);
            });
    });
}

// Exportar funções para uso global se necessário
window.LoanBuddyApp = {