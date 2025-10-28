// Wedding Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initCountdown();
    initNavigation();
    initScrollAnimations();
    initTransferSection();
    initGallery();
    initSmoothScroll();

});

// Countdown Timer
function initCountdown() {
    const weddingDate = new Date('2025-11-08T14:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            // Wedding day has arrived
            document.getElementById('countdown').innerHTML = '<h2 style="color: #d4af37;">🎉 Ngày cưới đã đến! 🎉</h2>';
        }
    }
    
    // Update countdown immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Navigation functionality
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger
        const bars = navToggle.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            if (navMenu.classList.contains('active')) {
                if (index === 0) bar.style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                if (index === 1) bar.style.opacity = '0';
                if (index === 2) bar.style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            }
        });
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            });
        });
    });
    
    // Change navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.event-card, .gallery-item, .couple-photo');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .event-card, .gallery-item, .couple-photo {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .event-card.animate, .gallery-item.animate, .couple-photo.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .event-card:nth-child(2).animate {
            transition-delay: 0.2s;
        }
        
        .event-card:nth-child(3).animate {
            transition-delay: 0.4s;
        }
    `;
    document.head.appendChild(style);
}

// Transfer Section functionality
function initTransferSection() {
    const transferCards = document.querySelectorAll('.transfer-card');

    transferCards.forEach(card => {
        card.addEventListener('click', function(event) {
            const accountNumberEl = event.target.closest('.account-number');
            if (accountNumberEl) {
                const accountNumber = accountNumberEl.dataset.account;
                if (accountNumber) {
                    copyToClipboard(accountNumber);
                }
            }
        });
    });
    
    // Add hover effects to QR codes
    const qrCodes = document.querySelectorAll('.qr-code img');
    qrCodes.forEach(qrCode => {
        qrCode.addEventListener('click', function() {
            // Tạo hiệu ứng click cho QR code
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }, 100);
        });
    });
}

// Copy to clipboard function
function copyToClipboard(text) {
    // Try to use the modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function() {
            showCopyNotification('Đã sao chép số tài khoản: ' + text);
        }).catch(function(err) {
            // Fallback to older method
            fallbackCopyToClipboard(text);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(text);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyNotification('Đã sao chép số tài khoản: ' + text);
        } else {
            showCopyNotification('Không thể sao chép. Vui lòng copy thủ công.', 'error');
        }
    } catch (err) {
        showCopyNotification('Không thể sao chép. Vui lòng copy thủ công.', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Show copy notification
function showCopyNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    if (type === 'error') {
        notification.style.background = '#dc3545';
    }
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Gallery functionality
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            openLightbox(this.src, this.alt);
        });
    });
}

// Lightbox for gallery images
function openLightbox(src, alt) {
    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${src}" alt="${alt}" class="lightbox-img">
            <div class="lightbox-caption">${alt}</div>
        </div>
    `;
    
    // Add lightbox styles
    const lightboxStyles = `
        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .lightbox.show {
            opacity: 1;
        }
        
        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            text-align: center;
        }
        
        .lightbox-img {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
        }
        
        .lightbox-close {
            position: absolute;
            top: -40px;
            right: -40px;
            color: white;
            font-size: 3rem;
            cursor: pointer;
            transition: opacity 0.3s ease;
        }
        
        .lightbox-close:hover {
            opacity: 0.7;
        }
        
        .lightbox-caption {
            color: white;
            margin-top: 1rem;
            font-size: 1.1rem;
        }
        
        @media (max-width: 768px) {
            .lightbox-close {
                top: 10px;
                right: 10px;
                font-size: 2rem;
            }
        }
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#lightbox-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'lightbox-styles';
        styleSheet.textContent = lightboxStyles;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(lightbox);
    
    // Show lightbox with animation
    requestAnimationFrame(() => {
        lightbox.classList.add('show');
    });
    
    // Close lightbox functionality
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const closeLightbox = () => {
        lightbox.classList.remove('show');
        setTimeout(() => {
            if (lightbox.parentNode) {
                document.body.removeChild(lightbox);
            }
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Close with escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    
    document.addEventListener('keydown', handleEscape);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .notification-success {
            background: #28a745;
        }
        
        .notification-error {
            background: #dc3545;
        }
        
        .notification-info {
            background: #17a2b8;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        @media (max-width: 768px) {
            .notification {
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = notificationStyles;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add some extra interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add heart animation on couple photos
    const couplePhotos = document.querySelectorAll('.couple-photo');
    couplePhotos.forEach(photo => {
        photo.addEventListener('click', function() {
            createHeartAnimation(this);
        });
    });
});

function createHeartAnimation(element) {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.cssText = `
        position: absolute;
        pointer-events: none;
        font-size: 2rem;
        z-index: 1000;
        animation: heartFloat 2s ease-out forwards;
    `;
    
    // Add heart float animation
    const heartAnimation = `
        @keyframes heartFloat {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-100px) scale(1.5);
            }
        }
    `;
    
    if (!document.querySelector('#heart-animation-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'heart-animation-styles';
        styleSheet.textContent = heartAnimation;
        document.head.appendChild(styleSheet);
    }
    
    const rect = element.getBoundingClientRect();
    heart.style.left = (rect.left + rect.width / 2 - 20) + 'px';
    heart.style.top = (rect.top + rect.height / 2 - 20) + 'px';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        if (heart.parentNode) {
            document.body.removeChild(heart);
        }
    }, 2000);
}