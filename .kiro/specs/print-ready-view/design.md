# Design Document: Print-Ready View

## Overview

The print-ready view feature extends the mark-down component to support professional print output with pagination, chapter organization, and optional page imposition for booklet printing. The design follows the existing slideshow architecture pattern, creating a separate renderer module that processes markdown content into a print-optimized format.

The feature leverages CSS Paged Media specifications (@page rules, page breaks, margin boxes) to control print layout while providing an interactive browser preview with navigation controls similar to the slideshow mode.

## Architecture

### High-Level Flow

1. **Detection**: Component detects `print-ready: true` in YAML front matter
2. **Content Processing**: Markdown is parsed and organized into chapters based on H1 headers
3. **Footnote Processing**: Footnotes are extracted and associated with their respective chapters
4. **Page Layout**: CSS is dynamically generated based on configuration (page size, headers, etc.)
5. **Rendering**: Content is rendered with page breaks, headers, footers, and chapter-specific footnotes
6. **Navigation**: Browser preview includes navigation controls for page-by-page review
7. **Print Output**: CSS @page rules ensure correct pagination when printing or generating PDF

### Component Integration

The print-ready renderer integrates into the existing component architecture at the same level as the slideshow renderer:

```
mark-down.js (main component)
├── mark-down-helpers.js (markdown parsing)
├── slideshow-renderer.js (slideshow mode)
└── print-ready-renderer.js (NEW: print-ready mode)
    ├── print-ready-footnotes.js (NEW: chapter footnote handling)
    └── print-ready-imposition.js (NEW: page imposition calculations)
```

## Components and Interfaces

### 1. Print-Ready Renderer Module (`src/print-ready-renderer.js`)

**Purpose**: Main orchestrator for print-ready view rendering

**Key Functions**:

```javascript
/**
 * Renders markdown content in print-ready format
 * @param {string} html - Rendered HTML content
 * @param {Object} footnoteMap - Map of footnote IDs to content
 * @param {HTMLElement} container - The mark-down element
 * @param {Object} config - Configuration from YAML front matter
 */
export function renderPrintReady(html, footnoteMap, container, config)

/**
 * Extracts configuration from container attributes and YAML
 * @param {HTMLElement} container - The mark-down element
 * @return {Object} Configuration object
 */
function getPrintReadyConfig(container)

/**
 * Splits HTML content into chapters based on H1 headers
 * @param {string} html - The HTML content
 * @return {Array<Object>} Array of chapter objects with title and content
 */
function splitIntoChapters(html)

/**
 * Generates dynamic CSS for page layout
 * @param {Object} config - Configuration object
 * @return {string} CSS string for injection
 */
function generatePageCSS(config)

/**
 * Creates navigation controls for browser preview
 * @param {HTMLElement} container - The container element
 * @return {Object} Object with navigation elements and handlers
 */
function createNavigationControls(container)
```

**Configuration Object Structure**:
```javascript
{
  pageSize: 'letter' | 'a4' | 'a5' | 'a3' | 'legal',
  pageWidth: string,  // e.g., '8.5in', '210mm'
  pageHeight: string, // e.g., '11in', '297mm'
  title: string,
  author: string,
  pageImposed: boolean,
  pagesPerSheet: number,
  doubleSided: boolean,
  sheetSize: string
}
```

### 2. Print-Ready Footnotes Module (`src/print-ready-footnotes.js`)

**Purpose**: Handles footnote extraction and chapter-level organization

**Key Functions**:

```javascript
/**
 * Extracts footnote definitions from markdown (reuses slideshow function)
 * @param {string} markdown - The markdown content
 * @return {Object} Object with footnoteMap and cleaned markdown
 */
export function extractFootnoteDefinitions(markdown)

/**
 * Processes a chapter to add footnotes at the end
 * @param {string} chapterHtml - HTML content of the chapter
 * @param {Object} footnoteMap - Map of all footnotes
 * @param {number} chapterIndex - Index of the chapter
 * @return {string} Chapter HTML with footnotes appended
 */
export function addFootnotesToChapter(chapterHtml, footnoteMap, chapterIndex)

/**
 * Finds footnote references within a chapter
 * @param {string} chapterHtml - HTML content of the chapter
 * @return {Array<string>} Array of footnote IDs
 */
function getFootnoteReferencesInChapter(chapterHtml)

/**
 * Converts footnote references to proper HTML links
 * @param {string} html - HTML content
 * @param {number} chapterIndex - Chapter index for unique IDs
 * @return {string} HTML with converted references
 */
function convertFootnoteReferences(html, chapterIndex)

/**
 * Generates footnote HTML for end of chapter
 * @param {Array<string>} footnoteIds - IDs of footnotes to include
 * @param {Object} footnoteMap - Map of footnote content
 * @param {number} chapterIndex - Chapter index
 * @return {string} HTML for footnotes section
 */
function generateChapterFootnotesHtml(footnoteIds, footnoteMap, chapterIndex)
```

### 3. Print-Ready Imposition Module (`src/print-ready-imposition.js`)

**Purpose**: Calculates page ordering for booklet printing

**Key Functions**:

```javascript
/**
 * Calculates page imposition order for booklet printing
 * @param {number} totalPages - Total number of pages in document
 * @param {Object} config - Imposition configuration
 * @return {Array<number>} Array of page indices in print order
 */
export function calculateImpositionOrder(totalPages, config)

/**
 * Determines if blank pages are needed
 * @param {number} totalPages - Total number of pages
 * @param {number} pagesPerSheet - Pages per sheet
 * @return {number} Number of blank pages to add
 */
function calculateBlankPages(totalPages, pagesPerSheet)

/**
 * Generates imposition layout for double-sided printing
 * @param {number} totalPages - Total pages including blanks
 * @param {number} pagesPerSheet - Pages per sheet
 * @return {Array<Array<number>>} 2D array of page arrangements per sheet
 */
function generateDoubleSidedImposition(totalPages, pagesPerSheet)

/**
 * Generates imposition layout for single-sided printing
 * @param {number} totalPages - Total pages including blanks
 * @param {number} pagesPerSheet - Pages per sheet
 * @return {Array<Array<number>>} 2D array of page arrangements per sheet
 */
function generateSingleSidedImposition(totalPages, pagesPerSheet)

/**
 * Validates imposition configuration
 * @param {Object} config - Configuration to validate
 * @throws {Error} If configuration is invalid
 */
function validateImpositionConfig(config)
```

### 4. Print-Ready Stylesheet (`styles/print-ready.css`)

**Purpose**: Defines print-specific styles and page layout

**Key Sections**:

- `@page` rules for page dimensions and margins
- Page break controls (break-before, break-after, break-inside)
- Header and footer styling using CSS margin boxes
- Chapter styling and spacing
- Footnote styling for end-of-chapter placement
- Navigation control styling (hidden in print)
- Page numbering using CSS counters

### 5. Example File (`print-ready.html`)

**Purpose**: Demonstrates print-ready features and provides testing environment

**Contents**:
- Sample markdown with multiple chapters
- Footnote examples within chapters
- YAML front matter with various configuration options
- Comments explaining each feature
- Examples of both standard and imposed printing configurations

## Data Models

### Chapter Object
```javascript
{
  index: number,           // Chapter number (0-based)
  title: string,           // H1 header text
  content: string,         // HTML content of chapter
  footnotes: Array<string> // Footnote IDs referenced in chapter
}
```

### Page Object (for imposition)
```javascript
{
  pageNumber: number,      // Logical page number
  chapterIndex: number,    // Which chapter this page belongs to
  content: string,         // HTML content for this page
  isBlank: boolean         // Whether this is a filler page
}
```

### Imposition Sheet
```javascript
{
  sheetNumber: number,     // Physical sheet number
  frontPages: Array<number>, // Page numbers for front of sheet
  backPages: Array<number>   // Page numbers for back of sheet (if double-sided)
}
```

## Error Handling

### Configuration Validation

1. **Invalid Page Size**: If an unrecognized page size is specified, default to 'letter' and log a warning
2. **Invalid Dimensions**: If custom dimensions lack units or use invalid units, log error and fall back to default
3. **Invalid Pages-Per-Sheet**: If value is odd or non-numeric, log error and default to 4
4. **Insufficient Sheet Size**: If sheet size cannot accommodate pages-per-sheet, log error and disable imposition

### Content Processing

1. **Missing Footnote Definitions**: If a footnote is referenced but not defined, render the reference as plain text and log warning
2. **Malformed HTML**: If chapter splitting fails, render entire content as single chapter
3. **Empty Chapters**: If a chapter has no content, include it with just the header

### Runtime Errors

1. **Navigation Failures**: If page scrolling fails, log error but don't crash the component
2. **CSS Injection Failures**: If dynamic CSS cannot be injected, log error and use default print styles
3. **Imposition Calculation Errors**: If imposition fails, fall back to sequential page order

## Testing Strategy

### Unit Tests

1. **Configuration Parsing**
   - Test extraction of all YAML attributes
   - Test default value application
   - Test validation of page sizes and dimensions

2. **Chapter Splitting**
   - Test splitting on H1 headers
   - Test handling of content before first H1
   - Test empty chapters
   - Test chapters with various content types

3. **Footnote Processing**
   - Test footnote extraction from markdown
   - Test footnote association with chapters
   - Test footnote numbering within chapters
   - Test bidirectional linking

4. **Imposition Calculations**
   - Test double-sided 4-page imposition
   - Test single-sided imposition
   - Test blank page insertion
   - Test various pages-per-sheet values
   - Test edge cases (1 page, odd pages, etc.)

5. **CSS Generation**
   - Test page size CSS generation
   - Test custom dimension CSS
   - Test header/footer CSS
   - Test page counter CSS

### Integration Tests

1. **End-to-End Rendering**
   - Test complete print-ready rendering pipeline
   - Test with various markdown content types
   - Test with different configuration combinations

2. **Browser Preview**
   - Test navigation control functionality
   - Test keyboard navigation
   - Test page scrolling behavior

3. **Print Output**
   - Visual regression tests for PDF output
   - Test page breaks occur at correct locations
   - Test headers and footers appear correctly
   - Test footnotes appear at chapter ends

### Manual Testing

1. **Print/PDF Generation**
   - Generate PDFs with various configurations
   - Verify page numbering
   - Verify headers and footers
   - Verify footnote placement

2. **Booklet Printing**
   - Print imposed documents
   - Fold and verify page order
   - Test double-sided and single-sided
   - Test various pages-per-sheet values

3. **Cross-Browser Testing**
   - Test in Chrome, Firefox, Safari
   - Verify CSS @page support
   - Verify print preview behavior

## Implementation Notes

### CSS Paged Media

The design relies on CSS Paged Media Module Level 3 specifications:
- `@page` rules for page dimensions
- `@page :left` and `@page :right` for different headers on left/right pages
- `page-break-before`, `page-break-after`, `page-break-inside` for controlling breaks
- CSS counters for page numbering
- Margin boxes for headers and footers (limited browser support)

**Browser Support Considerations**:
- Chrome/Edge: Good support for @page rules and page breaks
- Firefox: Good support, some limitations with margin boxes
- Safari: Moderate support, may need fallbacks
- For margin boxes (headers/footers), provide fallback using positioned elements

### Page Imposition Algorithm

For 4-pages-per-sheet double-sided booklet:
1. Calculate total sheets needed: `ceil(totalPages / 4)`
2. Add blank pages to reach multiple of 4
3. For each sheet, arrange pages:
   - Front: [last page, first page]
   - Back: [second page, second-to-last page]
4. Continue pattern for all sheets

Example with 8 pages:
- Sheet 1 Front: [8, 1]
- Sheet 1 Back: [2, 7]
- Sheet 2 Front: [6, 3]
- Sheet 2 Back: [4, 5]

### Reusing Slideshow Code

The print-ready renderer reuses several patterns from slideshow:
- Configuration extraction from attributes
- Navigation control creation and styling
- Keyboard event handling
- Footnote extraction (same function)

This promotes code consistency and reduces duplication.

### Dynamic CSS Injection

CSS is generated dynamically and injected into a `<style>` element within the component's shadow DOM (if using shadow DOM) or as a child element. This allows per-instance configuration without affecting other mark-down elements on the page.

### Performance Considerations

- Chapter splitting is done once during initial render
- Footnote processing is done per-chapter, not per-page
- Imposition calculations are done once and cached
- Navigation uses CSS scroll-behavior for smooth scrolling
- Large documents may need pagination optimization for browser preview
