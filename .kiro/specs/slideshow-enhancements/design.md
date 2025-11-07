# Design Document: Slideshow Enhancements

## Overview

This design extends the existing slideshow renderer to support configurable navigation controls, progressive bullet point animations, and inline footnote display. The implementation maintains the vanilla JavaScript architecture without CSS-in-JS, relying on CSS classes for all styling. The enhancements are controlled through HTML attributes on the mark-down element, following the existing pattern established by the `slide-show` attribute.

## Architecture

### Component Structure

The slideshow renderer (`slideshow-renderer.js`) will be refactored to use the dataroom-js framework. The component will extend `DataroomElement` and leverage its built-in features:

1. **Attribute Observation**: Automatic attribute change detection via `NODE-CHANGED` events
2. **Element Creation**: Use `create()` method for DOM manipulation
3. **Event System**: Use `event()` and `on()` for custom events
4. **Lifecycle Management**: Use `initialize()` and `disconnect()` methods

The enhanced slideshow will include:

1. **Conditional Navigation Controls**: Render side navigation buttons based on `show-controls` attribute
2. **Bullet Point Animation Manager**: Track and control progressive reveal of list items
3. **Footnote Processor**: Extract and position footnotes within slides

### Data Flow

```
mark-down element passes HTML and container
    ↓
renderSlideshow() function called
    ↓
Read attributes from container element
    ↓
Configure navigation controls (if show-controls enabled)
    ↓
Process slide content:
    - Extract footnotes
    - Identify list items for animation
    ↓
Render slide with:
    - Side navigation buttons (conditional)
    - Hidden/visible list items (conditional)
    - Footnotes at bottom
    ↓
Navigation events trigger:
    - Bullet point reveal/hide logic
    - Slide transitions
```

**Note**: The slideshow renderer remains a functional module (not a custom element) since it's called programmatically by the mark-down component. However, we'll use dataroom-js patterns for DOM manipulation and avoid CSS-in-JS.

## Components and Interfaces

### 1. Attribute Configuration Reader

**Purpose**: Extract configuration from mark-down element attributes

**Interface**:
```javascript
function getSlideShowConfig(container) {
  return {
    showControls: boolean,
    backIcon: string,
    forwardIcon: string,
    bulletPointAnimations: boolean
  };
}
```

**Implementation Details**:
- Read attributes from the container element passed to `renderSlideshow()`
- `show-controls`: Check for presence or string value "true"
- `back-icon`: Default to "◀" if not set
- `forward-icon`: Default to "▶" if not set
- `bullet-point-animations`: Check for presence or string value "true"

**Note**: While we're not creating a DataroomElement for the slideshow itself, we'll follow dataroom-js patterns by avoiding inline styles and using CSS classes exclusively.

### 2. Side Navigation Controls

**Purpose**: Render navigation buttons on left and right sides of slides

**DOM Structure**:
```html
<div class="slideshow-container">
  <button class="slide-nav-side slide-nav-prev" aria-label="Previous slide">
    {backIcon}
  </button>
  
  <div class="slide-wrapper">
    <div class="slide-content">
      <!-- slide content -->
    </div>
  </div>
  
  <button class="slide-nav-side slide-nav-next" aria-label="Next slide">
    {forwardIcon}
  </button>
  
  <!-- existing bottom controls remain -->
</div>
```

**CSS Classes**:
- `.slide-nav-side`: Base class for side navigation buttons
- `.slide-nav-prev`: Specific class for previous button (positioned left)
- `.slide-nav-next`: Specific class for next button (positioned right)

**Implementation Approach**:
- Use `document.createElement()` to create button elements
- Set `textContent` for icon display (no innerHTML for security)
- Apply CSS classes only (no inline styles)
- Only rendered when `showControls` is true
- Click handlers call existing `prevSlide()` and `nextSlide()` functions
- Disabled state mirrors bottom navigation buttons
- Keyboard navigation remains unchanged

### 3. Bullet Point Animation Manager

**Purpose**: Control progressive reveal of list items within slides

**State Management**:
```javascript
// Per-slide state tracking
const slideAnimationState = {
  [slideIndex]: {
    listItems: NodeList,      // All <li> elements in slide
    visibleCount: number       // Number of currently visible items
  }
};
```

**Implementation Details**:

1. **Initialization** (when slide loads):
   - Query all `<li>` elements within slide content
   - Apply `.bullet-hidden` class to all items except first
   - Apply `.bullet-visible` class to first item
   - Store list items and set `visibleCount = 1`

2. **Forward Navigation Logic**:
   ```javascript
   function handleForwardNavigation() {
     if (bulletPointAnimations && hasHiddenBullets(currentSlide)) {
       revealNextBullet(currentSlide);
     } else {
       nextSlide();
     }
   }
   ```

3. **Backward Navigation Logic**:
   ```javascript
   function handleBackwardNavigation() {
     if (bulletPointAnimations && hasRevealedBullets(currentSlide)) {
       hideLastBullet(currentSlide);
     } else {
       prevSlide();
     }
   }
   ```

4. **Bullet Reveal/Hide**:
   - Remove `.bullet-hidden` and add `.bullet-visible` to reveal
   - Remove `.bullet-visible` and add `.bullet-hidden` to hide
   - Increment/decrement `visibleCount`

**CSS Classes**:
- `.bullet-hidden`: Applied to hidden list items
- `.bullet-visible`: Applied to visible list items

### 4. Footnote Processor

**Purpose**: Extract footnotes from slide content and position them at the bottom

**Implementation Strategy**:

1. **Footnote Detection**:
   - After slide HTML is inserted, query for footnote elements
   - Markdown-it generates footnotes with class `.footnotes`
   - Individual footnotes are in `<li>` elements within `.footnotes ol`

2. **Footnote Extraction and Positioning**:
   ```javascript
   function processFootnotes(slideElement) {
     const footnotesSection = slideElement.querySelector('.footnotes');
     if (!footnotesSection) return;
     
     // Wrap in custom container for positioning
     const footnoteContainer = document.createElement('div');
     footnoteContainer.className = 'slide-footnotes';
     
     // Move footnote items to container
     const footnoteList = footnotesSection.querySelector('ol');
     if (footnoteList) {
       footnoteList.classList.add('slide-footnotes-list');
       footnoteContainer.appendChild(footnoteList);
     }
     
     // Remove original footnotes section
     footnotesSection.remove();
     
     // Append to slide content
     slideElement.appendChild(footnoteContainer);
   }
   ```

3. **DOM Structure**:
   ```html
   <div class="slide-content">
     <!-- main slide content -->
     
     <div class="slide-footnotes">
       <ol class="slide-footnotes-list">
         <li class="slide-footnote-item">Footnote text...</li>
       </ol>
     </div>
   </div>
   ```

**CSS Classes**:
- `.slide-footnotes`: Container for footnote section
- `.slide-footnotes-list`: The ordered list of footnotes
- `.slide-footnote-item`: Individual footnote items (optional, for granular styling)

## Data Models

### Configuration Object
```javascript
{
  showControls: boolean,        // Whether to show side navigation
  backIcon: string,             // Unicode symbol for back button
  forwardIcon: string,          // Unicode symbol for forward button
  bulletPointAnimations: boolean // Whether to enable progressive reveal
}
```

### Slide Animation State
```javascript
{
  listItems: NodeList,          // All list items in current slide
  visibleCount: number,         // Number of visible bullets (1-based)
  totalCount: number            // Total number of bullets
}
```

## Error Handling

### Invalid Attribute Values

**Scenario**: Attributes contain unexpected values

**Handling**:
- Boolean attributes: Treat any value other than explicit "false" as true when present
- Icon attributes: Use default icons if value is empty or undefined
- No error messages needed; fail gracefully to defaults

### Missing List Items

**Scenario**: Bullet point animations enabled but slide has no list items

**Handling**:
- Skip animation logic for that slide
- Navigation behaves normally (advances/retreats slides)
- No visual indication needed

### Malformed Footnotes

**Scenario**: Footnote HTML structure doesn't match expected format

**Handling**:
- Check for existence of `.footnotes` element before processing
- If structure is unexpected, leave footnotes in original position
- No error thrown; graceful degradation

### Rapid Navigation

**Scenario**: User rapidly clicks navigation buttons or presses keys

**Handling**:
- Existing disabled button states prevent issues
- Animation state updates synchronously before next navigation
- No debouncing needed due to state-based logic

## Testing Strategy

### Unit Testing Approach

**Configuration Reading**:
- Test attribute parsing with various values (present, "true", "false", absent)
- Test default icon values
- Test reading from container element

**Bullet Point Animation**:
- Test list item detection in slide content
- Test visibility state transitions
- Test navigation logic with hidden/visible bullets
- Test slides without list items

**Footnote Processing**:
- Test footnote detection and extraction
- Test positioning within slide
- Test slides without footnotes
- Test multiple footnotes in single slide

**Side Navigation Controls**:
- Test conditional rendering based on `showControls`
- Test custom icon display
- Test button disabled states
- Test click handlers

### Integration Testing

**End-to-End Scenarios**:
1. Slideshow with all features enabled
2. Slideshow with only side controls
3. Slideshow with only bullet animations
4. Slideshow with footnotes on multiple slides
5. Mixed slides (some with bullets, some without)

**Browser Compatibility**:
- Test in Chrome, Firefox, Safari, Edge
- Verify Unicode symbols render correctly
- Verify CSS class application

### Manual Testing Checklist

- [ ] Side navigation buttons appear when `show-controls` is set
- [ ] Custom icons display correctly
- [ ] Bullet points reveal one at a time when enabled
- [ ] Forward navigation reveals bullets before advancing slide
- [ ] Backward navigation hides bullets before retreating slide
- [ ] Footnotes appear at bottom of slides in small text
- [ ] All elements have appropriate CSS classes
- [ ] Keyboard navigation works with bullet animations
- [ ] Disabled button states work correctly
- [ ] Slides without lists/footnotes behave normally

## CSS Styling Requirements

### New CSS Classes to Add

The following classes need to be added to `styles/slide-show.css`:

```css
/* Side Navigation Controls */
.slide-nav-side {
  /* Position on left/right sides */
  /* Styling for side buttons */
}

.slide-nav-prev {
  /* Position on left */
}

.slide-nav-next {
  /* Position on right */
}

/* Bullet Point Animations */
.bullet-hidden {
  /* Hide list item (display: none or opacity: 0) */
}

.bullet-visible {
  /* Show list item with optional fade-in transition */
}

/* Footnotes */
.slide-footnotes {
  /* Position at bottom of slide */
  /* Smaller font size */
  /* Spacing from main content */
}

.slide-footnotes-list {
  /* List styling for footnotes */
}

.slide-footnote-item {
  /* Individual footnote styling (optional) */
}
```

### Design Considerations

- Side navigation buttons should be visually distinct from bottom controls
- Bullet animations should be smooth but not distracting
- Footnotes should be clearly separated from main content
- All interactive elements need hover and focus states
- Maintain existing CSS variable system for theming

## Implementation Notes

### Backward Compatibility

- All new features are opt-in via attributes
- Existing slideshows without new attributes work unchanged
- No breaking changes to existing API

### Performance Considerations

- List item queries happen once per slide load
- Animation state updates are synchronous and lightweight
- No DOM manipulation during navigation (only class changes)
- Footnote processing happens once per slide load

### Accessibility

- Side navigation buttons have `aria-label` attributes
- Keyboard navigation continues to work
- Disabled states communicated via `disabled` attribute
- Footnote references maintain semantic HTML structure

## Documentation Updates Required

The README.md should be updated with:

1. **Slideshow Controls Section**:
   - Document `show-controls` attribute
   - Document `back-icon` and `forward-icon` attributes
   - Provide example with custom icons

2. **Bullet Point Animations Section**:
   - Document `bullet-point-animations` attribute
   - Explain progressive reveal behavior
   - Show example markdown with lists

3. **Footnotes in Slides Section**:
   - Explain automatic footnote positioning
   - Show example with footnotes in slides
   - Document CSS classes for styling

4. **CSS Customization Section**:
   - List all new CSS classes
   - Provide styling examples
   - Show how to customize side navigation appearance

### Example Documentation Snippets

```markdown
### Slideshow Navigation Controls

Control the visibility and appearance of navigation buttons using attributes.

**show-controls**: Display navigation buttons on the left and right sides of slides.

```html
<mark-down src="presentation.md" slide-show show-controls></mark-down>
```

**Custom Icons**: Customize navigation button icons with Unicode symbols.

```html
<mark-down 
  src="presentation.md" 
  slide-show 
  show-controls
  back-icon="⬅"
  forward-icon="➡">
</mark-down>
```

### Bullet Point Animations

Enable progressive reveal of list items for dramatic effect.

```html
<mark-down 
  src="presentation.md" 
  slide-show 
  bullet-point-animations>
</mark-down>
```

When enabled, pressing forward will reveal one bullet point at a time before advancing to the next slide.
```
