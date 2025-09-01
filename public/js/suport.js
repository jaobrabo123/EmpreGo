 // Mobile Menu Toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Back to Top Button
        const backToTopButton = document.getElementById('back-to-top');
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (!mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            });
        });
        
        // Logo glitch effect on hover
        const logoContainer = document.getElementById('logo-container');
        let isGlitching = false;
        
        logoContainer.addEventListener('mouseenter', () => {
            if (isGlitching) return;
            isGlitching = true;
            
            // Trigger the glitch animation
            logoContainer.classList.add('animate-text-glitch');
            
            // Add a temporary class for more intense glitch
            setTimeout(() => {
                logoContainer.classList.add('text-glitch-active');
            }, 100);
            
            // Stop the glitch after 1 second
            setTimeout(() => {
                logoContainer.classList.remove('animate-text-glitch', 'text-glitch-active');
                isGlitching = false;
            }, 1000);
        });
        
        // Page load animations
        document.addEventListener('DOMContentLoaded', () => {
            // Animate the support content in
            anime({
                targets: '#support-content',
                opacity: [0, 1],
                translateY: [40, 0],
                duration: 1000,
                easing: 'easeOutExpo'
            });
            
            // Make the fuse box image shake continuously
            const fuseBox = document.querySelector('.animate-shake');
            setInterval(() => {
                fuseBox.classList.add('animate-shake');
                setTimeout(() => {
                    fuseBox.classList.remove('animate-shake');
                }, 80);
            }, 3000);
        });