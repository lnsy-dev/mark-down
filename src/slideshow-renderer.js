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
  
  // Add slideshow styles
  addSlideshowStyles();
  
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

/**
 * Adds CSS styles for slideshow presentation
 */
function addSlideshowStyles() {
  if (document.getElementById('slideshow-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'slideshow-styles';
  style.textContent = `
    .slideshow-mode {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      max-width: 100vw !important;
      background: var(--bg-color, #1a1a1a);
      color: var(--fg-color, #ffffff);
      z-index: 9999;
      font-family: inherit;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    
    .slideshow-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .slide-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      overflow: hidden;
    }
    
    .slide-content {
      width: 100%;
      max-width: 1000px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      font-size: 1.5rem;
      line-height: 1.6;
      overflow-y: auto;
    }
    
    .slide-content h1 {
      font-size: 3.5rem;
      margin: 0 0 2rem 0;
      color: var(--fg-color, #ffffff);
    }
    
    .slide-content h2 {
      font-size: 3rem;
      margin: 0 0 1.5rem 0;
      color: var(--fg-color, #ffffff);
    }
    
    .slide-content h3 {
      font-size: 2.5rem;
      margin: 0 0 1.5rem 0;
      color: var(--fg-color, #ffffff);
    }
    
    .slide-content p {
      font-size: 1.8rem;
      margin: 0 0 1.5rem 0;
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .slide-content ul, .slide-content ol {
      text-align: left;
      font-size: 1.6rem;
      max-width: 700px;
      margin: 1rem auto;
      padding-left: 2rem;
    }
    
    .slide-content li {
      margin-bottom: 1rem;
      line-height: 1.8;
    }
    
    .slide-content code {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.9em;
    }
    
    .slide-content pre {
      text-align: left;
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem;
      border-radius: 5px;
      overflow: auto;
      font-size: 1rem;
    }
    
    .slide-controls {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 2rem;
      background: rgba(0, 0, 0, 0.7);
      padding: 1rem 2rem;
      border-radius: 25px;
      backdrop-filter: blur(10px);
    }
    
    .slide-counter {
      color: var(--fg-color, #ffffff);
      font-size: 1rem;
      font-weight: 500;
    }
    
    .slide-nav {
      display: flex;
      gap: 1rem;
    }
    
    .slide-nav button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: var(--fg-color, #ffffff);
      font-size: 1.5rem;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .slide-nav button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .slide-nav button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .slide-nav button:focus {
      outline: 2px solid var(--fg-color, #ffffff);
      outline-offset: 2px;
    }
  `;
  
  document.head.appendChild(style);
}