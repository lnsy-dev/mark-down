# Footnotes Implementation

## Overview

We've implemented a custom footnote handler for slideshow mode that distributes footnotes to individual slides, while maintaining compatibility with markdown-it-footnote for regular markdown documents.

## How It Works

### Regular Markdown (Non-Slideshow)
- Uses the standard `markdown-it-footnote` plugin
- Footnotes appear at the bottom of the entire document
- All footnote definitions are collected and rendered in a single `.footnotes` section

### Slideshow Mode
- Uses custom footnote processing (`src/slideshow-footnotes.js`)
- Footnotes are extracted from markdown BEFORE parsing
- Each slide only shows footnotes that are referenced on that slide
- Slides without footnote references don't show a footnotes section

## Implementation Details

### 1. Footnote Extraction (`slideshow-footnotes.js`)

**`extractFootnoteDefinitions(markdown)`**
- Parses markdown to find footnote definitions: `[^1]: Footnote text`
- Removes definitions from markdown (so markdown-it doesn't process them)
- Returns a map of footnote IDs to their content

**`getFootnoteReferencesInSlide(slideHtml)`**
- Scans slide HTML for footnote references: `[^1]`
- Returns array of footnote IDs referenced in that slide

**`convertFootnoteReferences(html, slideIndex)`**
- Converts `[^1]` to proper HTML: `<sup class="footnote-ref"><a href="#fn-slide0-1">[1]</a></sup>`
- Uses slide-specific IDs to avoid conflicts between slides

**`generateFootnotesHtml(footnoteIds, footnoteMap, slideIndex)`**
- Generates the footnotes section HTML for a slide
- Only includes footnotes that are referenced on that slide
- Adds back-reference links (↩) to jump back to the reference

**`addFootnotesToSlide(slideHtml, footnoteMap, slideIndex)`**
- Main function that processes a slide
- Converts references to links
- Adds footnotes section at the bottom

### 2. Integration (`mark-down.js`)

```javascript
// Check if in slideshow mode
const isSlideshow = this.attrs["slide-show"] === "true" || this.hasAttribute("slide-show");

// Extract footnotes BEFORE markdown parsing (slideshow only)
let footnoteMap = {};
if (isSlideshow) {
  const footnoteResult = extractFootnoteDefinitions(content);
  footnoteMap = footnoteResult.footnoteMap;
  content = footnoteResult.markdownWithoutDefinitions;
}

// Parse markdown
const parsed_markup = await parseDataroomMarkup(content, this.attrs);

// Render
if (isSlideshow) {
  renderSlideshow(parsed_markup.html, footnoteMap, this);
} else {
  this.innerHTML = parsed_markup.html; // Regular markdown uses markdown-it-footnote
}
```

### 3. Slideshow Rendering (`slideshow-renderer.js`)

```javascript
export function renderSlideshow(html, footnoteMap, container) {
  // Split into slides
  const rawSlides = html.split('<hr>').map(slide => slide.trim()).filter(slide => slide.length > 0);
  
  // Add footnotes to each slide
  const slides = rawSlides.map((slide, index) => 
    addFootnotesToSlide(slide, footnoteMap, index)
  );
  
  // ... rest of slideshow logic
}
```

## CSS Classes

The following CSS classes are applied to footnote elements:

- `.footnote-ref` - Applied to footnote reference superscripts
- `.slide-footnotes` - Container for the footnotes section at bottom of slide
- `.slide-footnotes-list` - The ordered list of footnotes
- `.footnote-backref` - The back-reference link (↩)

## Testing

### Test Files Created

1. **`test-regular-footnotes.html`** - Tests regular markdown footnotes
2. **`test-footnotes-slideshow.html`** - Tests slideshow footnotes (existing)
3. **`test-footnotes-comprehensive.html`** - Comprehensive test of both modes

### Expected Behavior

**Regular Markdown:**
- ✓ Footnotes appear at bottom of document
- ✓ Clickable footnote numbers
- ✓ Back-reference links work
- ✓ Multiple references to same footnote work

**Slideshow:**
- ✓ Footnotes appear at bottom of each slide
- ✓ Only relevant footnotes shown per slide
- ✓ Slides without footnotes have no footnotes section
- ✓ Clickable footnote numbers (slide-specific IDs)
- ✓ Back-reference links work within each slide

## Why Custom Implementation?

The `markdown-it-footnote` plugin collects ALL footnote definitions and renders them in a single section at the end of the entire HTML output. When we split the HTML by `<hr>` tags for slides, all footnotes end up on the last slide.

Our custom implementation:
1. Extracts footnotes before markdown parsing
2. Removes them from the markdown source
3. Distributes them to slides based on where they're referenced
4. Generates proper HTML with links and back-references

This gives us fine-grained control over footnote placement while maintaining compatibility with regular markdown documents.
