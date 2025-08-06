document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.main-nav .nav-links');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close nav when a link is clicked (for mobile)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });

    // 2. Testimonial Carousel
    const carousel = document.querySelector('.testimonial-carousel');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.querySelector('.carousel-nav');
    let currentIndex = 0;
    let slideInterval;

    if (carousel && slides.length > 0) {
        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.carousel-nav .dot');

        const goToSlide = (index) => {
            currentIndex = index;
            const offset = -currentIndex * slides[0].offsetWidth; // Assumes all slides have same width
            carousel.style.transform = `translateX(${offset}px)`;

            // Update active dot
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentIndex].classList.add('active');
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % slides.length;
            goToSlide(currentIndex);
        };

        const startSlideShow = () => {
            slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        };

        const pauseSlideShow = () => {
            clearInterval(slideInterval);
        };

        // Start slideshow
        startSlideShow();

        // Pause on hover
        carousel.addEventListener('mouseenter', pauseSlideShow);
        carousel.addEventListener('mouseleave', startSlideShow);

        // Optional: Re-calculate slide position on window resize
        window.addEventListener('resize', () => goToSlide(currentIndex));
    }


    // 3. Scroll-triggered Animations (Fade In Sections)
    const fadeElements = document.querySelectorAll('.fade-in-section');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // 4. Services Page Accordion
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling; // The accordion-content div

            // Close other open accordions (optional, but good for single open view)
            document.querySelectorAll('.accordion-item.active').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('active');
                    openItem.querySelector('.accordion-content').style.maxHeight = 0;
                }
            });

            // Toggle current accordion
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                // Set max-height to scrollHeight for smooth transition
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = 0;
            }
        });
    });

    // If a service ID is present in the URL (e.g., services.html#gst), open that accordion
    const hash = window.location.hash;
    if (hash) {
        const targetAccordion = document.querySelector(hash);
        if (targetAccordion && targetAccordion.classList.contains('accordion-item')) {
            // Give a slight delay to ensure CSS is rendered before opening
            setTimeout(() => {
                targetAccordion.querySelector('.accordion-header').click();
                // Scroll to the accordion
                targetAccordion.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }


    // 5. Pop-up for Queries (Linked to Google Sheet)
    const consultationPopup = document.getElementById('consultation-popup');
    const openPopupButtons = document.querySelectorAll('a[href="#consultation-popup"]');
    const closeButton = consultationPopup ? consultationPopup.querySelector('.close-button') : null;
    const consultationForm = consultationPopup ? document.getElementById('consultation-form') : null;
    const formMessage = consultationForm ? document.getElementById('form-message') : null;

    // Open popup
    openPopupButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            consultationPopup.style.display = 'flex';
            // Pre-fill service if coming from services page CTA
            const urlParams = new URLSearchParams(window.location.search);
            const serviceParam = urlParams.get('service');
            if (serviceParam) {
                const queryTextarea = document.getElementById('popup-query');
                queryTextarea.value = `Enquiry for ${serviceParam} Services.`;
            }
        });
    });

    // Close popup
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            consultationPopup.style.display = 'none';
            consultationForm.reset(); // Clear form on close
            formMessage.textContent = ''; // Clear message
        });
    }

    // Close when clicking outside the modal content
    if (consultationPopup) {
        window.addEventListener('click', (event) => {
            if (event.target === consultationPopup) {
                consultationPopup.style.display = 'none';
                consultationForm.reset();
                formMessage.textContent = '';
            }
        });
    }

    // Google Sheet Integration for pop-up form
    if (consultationForm) {
        consultationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formMessage.textContent = 'Submitting your query...';
            formMessage.style.color = '#004D40';

            const formData = new FormData(consultationForm);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });

            // IMPORTANT: Replace with your actual Google Apps Script Web App URL
            // Instructions for setting this up are below this code block
            const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Use 'no-cors' for Google Apps Script
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                // Since we use 'no-cors', we can't directly read response.ok or response.json()
                // We assume success if no error is thrown by the fetch request itself.
                formMessage.textContent = 'Query submitted successfully! We will get back to you shortly.';
                formMessage.style.color = '#388E3C';
                consultationForm.reset();
                setTimeout(() => {
                    consultationPopup.style.display = 'none';
                    formMessage.textContent = '';
                }, 3000); // Close popup after 3 seconds
            } catch (error) {
                console.error('Error submitting form:', error);
                formMessage.textContent = 'There was an error submitting your query. Please try again or contact us directly.';
                formMessage.style.color = '#D32F2F'; // Red color for error
            }
        });
    }

    // 6. Main Contact Form (contact.html) - Optional: Link to a separate Google Sheet or email service
    const mainContactForm = document.getElementById('main-contact-form');
    const mainFormMessage = document.getElementById('contact-form-message');

    if (mainContactForm) {
        mainContactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            mainFormMessage.textContent = 'Sending your message...';
            mainFormMessage.style.color = '#004D40';

            const formData = new FormData(mainContactForm);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });

            // This could go to a different Google Sheet or a dedicated email service (e.g., Formspree, Netlify Forms, custom backend)
            // For simplicity, I'll use a placeholder for a different script URL.
            const CONTACT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxb5UdKoHlY_pBwP9uW5heln4nOgNCFa_sK9PPXMSy7B9mKn5il7BaRcANr9BNiUdi0gQ/exec';

            try {
                const response = await fetch(CONTACT_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                mainFormMessage.textContent = 'Message sent successfully! We will get back to you soon.';
                mainFormMessage.style.color = '#388E3C';
                mainContactForm.reset();
            } catch (error) {
                console.error('Error sending message:', error);
                mainFormMessage.textContent = 'Failed to send message. Please try again or use direct contact details.';
                mainFormMessage.style.color = '#D32F2F';
            }
        });
    }

    // Initialize carousel on window load to ensure element widths are correct
    window.addEventListener('load', () => {
        if (carousel && slides.length > 0) {
            goToSlide(0); // Set initial slide position
        }
    });

});

