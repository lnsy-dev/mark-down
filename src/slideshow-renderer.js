/**
 * Slideshow renderer for markdown content
 * @fileoverview Provides slideshow functionality with keyboard navigation
 */

import { addFootnotesToSlide } from './slideshow-footnotes.js';

/**
 * Reads slideshow configuration from container element attributes
 * @param {HTMLElement} container - The container element with attributes
 * @return {Object} Configuration object with slideshow settings
 */
function getSlideShowConfig(container) {
  // Parse show-controls attribute (check presence or "true" value)
  const showControlsAttr = container.getAttribute('show-controls');
  const showControls = showControlsAttr !== null && showControlsAttr !== 'false';
  
  // Parse back-icon attribute with default "◀"
  const backIcon = container.getAttribute('back-icon') || '◀';
  
  // Parse forward-icon attribute with default "▶"
  const forwardIcon = container.getAttribute('forward-icon') || '▶';
  
  // Parse bullet-point-animations attribute (check presence or "true" value)
  const bulletAnimationsAttr = container.getAttribute('bullet-point-animations');
  const bulletPointAnimations = bulletAnimationsAttr !== null && bulletAnimationsAttr !== 'false';
  
  return {
    showControls,
    backIcon,
    forwardIcon,
    bulletPointAnimations
  };
}

/**
 * Renders markdown content as a slideshow presentation
 * @param {string} html - The rendered HTML content
 * @param {Object} footnoteMap - Map of footnote IDs to their content
 * @param {HTMLElement} container - The container element
 * @return {void}
 */
export function renderSlideshow(html, footnoteMap, container) {
  // Read configuration from container attributes
  const config = getSlideShowConfig(container);
  
  // Split content by horizontal rules (---)
  const rawSlides = html.split('<hr>').map(slide => slide.trim()).filter(slide => slide.length > 0);
  
  // Add footnotes to each slide based on references
  const slides = rawSlides.map((slide, index) => addFootnotesToSlide(slide, footnoteMap, index));
  
  let currentSlide = 0;
  
  // Animation state tracking for bullet point animations
  const slideAnimationState = {};
  
  // Create slideshow container
  const slideshowContainer = document.createElement('div');
  slideshowContainer.className = 'slideshow-container';
  slideshowContainer.innerHTML = `
    <div class="slide-wrapper">
      <div class="slide-content"></div>
    </div>
  `;
  
  const slideContent = slideshowContainer.querySelector('.slide-content');
  
  // Create side navigation buttons if showControls is enabled
  let prevSideBtn = null;
  let nextSideBtn = null;
  
  if (config.showControls) {
    // Create previous side button
    prevSideBtn = document.createElement('button');
    prevSideBtn.className = 'slide-nav-side slide-nav-prev';
    prevSideBtn.textContent = config.backIcon;
    prevSideBtn.setAttribute('aria-label', 'Previous slide');
    
    // Create next side button
    nextSideBtn = document.createElement('button');
    nextSideBtn.className = 'slide-nav-side slide-nav-next';
    nextSideBtn.textContent = config.forwardIcon;
    nextSideBtn.setAttribute('aria-label', 'Next slide');
    
    // Insert side buttons into container
    slideshowContainer.insertBefore(prevSideBtn, slideshowContainer.firstChild);
    slideshowContainer.appendChild(nextSideBtn);
  }
  
  /**
   * Initializes bullet point animation for current slide
   */
  function initializeBulletAnimation() {
    if (!config.bulletPointAnimations) {
      return;
    }
    
    // Check if this slide has already been initialized
    if (slideAnimationState[currentSlide]) {
      return;
    }
    
    // Query all <li> elements within slide content
    const listItems = slideContent.querySelectorAll('li');
    
    if (listItems.length === 0) {
      return;
    }
    
    // Apply classes: first item visible, rest hidden
    listItems.forEach((item, index) => {
      if (index === 0) {
        item.classList.add('bullet-visible');
        item.classList.remove('bullet-hidden');
      } else {
        item.classList.add('bullet-hidden');
        item.classList.remove('bullet-visible');
      }
    });
    
    // Store state for this slide
    slideAnimationState[currentSlide] = {
      listItems: listItems,
      visibleCount: 1,
      totalCount: listItems.length
    };
  }
  
  /**
   * Reveals the next hidden bullet point
   * @return {boolean} True if a bullet was revealed, false otherwise
   */
  function revealNextBullet() {
    const state = slideAnimationState[currentSlide];
    
    if (!state || state.visibleCount >= state.totalCount) {
      return false;
    }
    
    // Get the next hidden item
    const nextItem = state.listItems[state.visibleCount];
    
    // Update CSS classes
    nextItem.classList.remove('bullet-hidden');
    nextItem.classList.add('bullet-visible');
    
    // Update visible count
    state.visibleCount++;
    
    return true;
  }
  
  /**
   * Hides the last visible bullet point
   * @return {boolean} True if a bullet was hidden, false otherwise
   */
  function hideLastBullet() {
    const state = slideAnimationState[currentSlide];
    
    if (!state || state.visibleCount <= 1) {
      return false;
    }
    
    // Get the last visible item (visibleCount - 1 because it's 1-based)
    const lastItem = state.listItems[state.visibleCount - 1];
    
    // Update CSS classes
    lastItem.classList.remove('bullet-visible');
    lastItem.classList.add('bullet-hidden');
    
    // Update visible count
    state.visibleCount--;
    
    return true;
  }
  
  /**
   * Updates the current slide display
   */
  function updateSlide() {
    slideContent.innerHTML = slides[currentSlide];
    
    // Initialize bullet point animation for this slide
    initializeBulletAnimation();
    
    // Update side navigation button states if they exist
    if (prevSideBtn) {
      prevSideBtn.disabled = currentSlide === 0;
    }
    if (nextSideBtn) {
      nextSideBtn.disabled = currentSlide === slides.length - 1;
    }
  }
  
  /**
   * Navigates to next slide or reveals next bullet
   */
  function nextSlide() {
    // Check if bullet animations are enabled and there are hidden bullets
    if (config.bulletPointAnimations) {
      const state = slideAnimationState[currentSlide];
      if (state && state.visibleCount < state.totalCount) {
        // Reveal next bullet instead of advancing slide
        revealNextBullet();
        return;
      }
    }
    
    // Advance to next slide
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      updateSlide();
    }
  }
  
  /**
   * Navigates to previous slide or hides last bullet
   */
  function prevSlide() {
    // Check if bullet animations are enabled and there are revealed bullets
    if (config.bulletPointAnimations) {
      const state = slideAnimationState[currentSlide];
      if (state && state.visibleCount > 1) {
        // Hide last bullet instead of retreating slide
        hideLastBullet();
        return;
      }
    }
    
    // Retreat to previous slide
    if (currentSlide > 0) {
      currentSlide--;
      updateSlide();
    }
  }
  
  // Add event listeners to side navigation buttons if they exist
  if (prevSideBtn) {
    prevSideBtn.addEventListener('click', prevSlide);
  }
  if (nextSideBtn) {
    nextSideBtn.addEventListener('click', nextSlide);
  }
  
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