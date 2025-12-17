        // Update copyright year immediately
        document.addEventListener('DOMContentLoaded', function() {
            const yearElement = document.getElementById('currentYear');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('nav');
        const body = document.body;

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                nav.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
                body.classList.toggle('menu-open');
            });

            // Close menu when clicking on a link
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    body.classList.remove('menu-open');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    nav.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    body.classList.remove('menu-open');
                }
            });
        }

        // Smooth scroll for anchor links
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

        // Careers section - Job card interactions
        const jobListingsContainer = document.getElementById('jobListingsContainer');
        const noJobsMessage = document.getElementById('noJobsMessage');

        if (jobListingsContainer && noJobsMessage) {
            const jobCards = jobListingsContainer.querySelectorAll('.job-card');

            if (jobCards.length === 0) {
                jobListingsContainer.style.display = 'none';
                noJobsMessage.style.display = 'block';
            }
        }

        // Hero Carousel Auto-rotation
        document.addEventListener('DOMContentLoaded', function() {
            const slides = document.querySelectorAll('.carousel-slide');
            const dots = document.querySelectorAll('.carousel-dot');
            let currentSlide = 0;
            let autoRotateInterval;

            // Function to show a specific slide
            function showSlide(index) {
                // Remove active class from all slides and dots
                slides.forEach(slide => {
                    slide.classList.remove('active');
                    slide.style.opacity = '0';
                });
                dots.forEach(dot => {
                    dot.classList.remove('active');
                    dot.style.background = 'rgba(255, 255, 255, 0.5)';
                    dot.style.boxShadow = 'none';
                });

                // Add active class to current slide and dot
                slides[index].classList.add('active');
                slides[index].style.opacity = '1';
                dots[index].classList.add('active');
                dots[index].style.background = 'white';
                dots[index].style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

                currentSlide = index;
            }

            // Function to go to next slide
            function nextSlide() {
                let next = (currentSlide + 1) % slides.length;
                showSlide(next);
            }

            // Start auto-rotation (change slide every 5 seconds)
            function startAutoRotate() {
                autoRotateInterval = setInterval(nextSlide, 5000);
            }

            // Stop auto-rotation
            function stopAutoRotate() {
                clearInterval(autoRotateInterval);
            }

            // Add click handlers to dots
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showSlide(index);
                    stopAutoRotate();
                    startAutoRotate(); // Restart auto-rotation after manual navigation
                });
            });

            // Start auto-rotation when page loads
            if (slides.length > 0 && dots.length > 0) {
                startAutoRotate();
            }

            // Pause auto-rotation when user hovers over carousel
            const carouselContainer = document.querySelector('.carousel-container');
            if (carouselContainer) {
                carouselContainer.addEventListener('mouseenter', stopAutoRotate);
                carouselContainer.addEventListener('mouseleave', startAutoRotate);
            }
        });
