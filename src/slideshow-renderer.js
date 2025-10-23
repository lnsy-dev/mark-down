/**
 * Slideshow renderer for markdown content
 * @fileoverview Provides slideshow functionality with keyboard navigation
 */

/**
 * Renders markdown content as a slideshow presentation
 * @param {string} html - The rendered HTML content
 * @param {HTMLElement} container - The container element
 * @return {void}
 */
export function renderSlideshow(html, container) {
  // Split content by horizontal rules (---)
  const slides = html.split('<hr>').map(slide => slide.trim()).filter(slide => slide.length > 0);
  
  let currentSlide = 0;
  
  // Create slideshow container
  const slideshowContainer = document.createElement('div');
  slideshowContainer.className = 'slideshow-container';
  slideshowContainer.innerHTML = `
    <div class="slide-wrapper">
      <div class="slide-content"></div>
    </div>
    <div class="slide-controls">
      <span class="slide-counter">1 / ${slides.length}</span>
      <div class="slide-nav">
        <button class="prev-btn" aria-label="Previous slide">‹</button>
        <button class="next-btn" aria-label="Next slide">›</button>
      </div>
    </div>
  `;
  
  const slideContent = slideshowContainer.querySelector('.slide-content');
  const slideCounter = slideshowContainer.querySelector('.slide-counter');
  const prevBtn = slideshowContainer.querySelector('.prev-btn');
  const nextBtn = slideshowContainer.querySelector('.next-btn');
  
  /**
   * Updates the current slide display
   */
  function updateSlide() {
    slideContent.innerHTML = slides[currentSlide];
    slideCounter.textContent = `${currentSlide + 1} / ${slides.length}`;
    
    // Update button states
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === slides.length - 1;
  }
  
  /**
   * Navigates to next slide
   */
  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      updateSlide();
    }
  }
  
  /**
   * Navigates to previous slide
   */
  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlide();
    }
  }
  
  // Event listeners
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  
  // Keyboard navigation
  function handleKeydown(e) {
    switch(e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'Home':
        e.preventDefault();
        currentSlide = 0;
        updateSlide();
        break;
      case 'End':
        e.preventDefault();
        currentSlide = slides.length - 1;
        updateSlide();
        break;
    }
  }
  
  
  // Add keyboard listener
  document.addEventListener('keydown', handleKeydown);
  

  // Initialize slideshow immediately
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.zIndex = '9999';
  container.classList.add('slideshow-mode');
  container.innerHTML = '';
  container.appendChild(slideshowContainer);
  updateSlide();
  
  // Focus container for keyboard events
  container.setAttribute('tabindex', '0');
  container.focus();

}