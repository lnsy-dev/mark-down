# Implementation Plan

- [x] 1. Create print-ready footnotes module
  - Create `src/print-ready-footnotes.js` file
  - Implement `addFootnotesToChapter()` function to process chapter HTML and append footnotes
  - Implement `getFootnoteReferencesInChapter()` function to find footnote references in chapter HTML
  - Implement `convertFootnoteReferences()` function to convert [^1] syntax to HTML links with chapter-specific IDs
  - Implement `generateChapterFootnotesHtml()` function to create footnote section HTML for end of chapter
  - Reuse `extractFootnoteDefinitions()` from slideshow-footnotes.js via import
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Create print-ready renderer module with basic chapter splitting
  - Create `src/print-ready-renderer.js` file
  - Implement `getPrintReadyConfig()` function to extract configuration from container attributes
  - Implement `splitIntoChapters()` function to split HTML content on H1 headers into chapter objects
  - Implement basic `renderPrintReady()` function that creates container and renders chapters sequentially
  - Integrate footnote processing by calling `addFootnotesToChapter()` for each chapter
  - _Requirements: 1.1, 1.2, 1.3, 2.1_

- [x] 3. Implement page size configuration and CSS generation
  - Add `generatePageCSS()` function to create dynamic @page rules
  - Implement standard page size mapping (a3, a4, a5, letter, legal) to dimensions
  - Implement custom page dimension support (page-width, page-height with units)
  - Add CSS injection into component for @page rules
  - Implement page size validation and default fallback to 'letter'
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Implement page headers with title and author
  - Add CSS for page headers using @page :left and @page :right rules
  - Implement header content generation based on title and author attributes
  - Add fallback header implementation using positioned elements for browsers with limited margin box support
  - Handle cases where title or author are not specified
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Implement page numbering
  - Add CSS counter for page numbers
  - Implement page counter reset at document start
  - Add page number display in footer using CSS counter
  - Style page numbers appropriately for print output
  - _Requirements: 1.5_

- [x] 6. Create print-ready stylesheet
  - Create `styles/print-ready.css` file
  - Add base styles for print-ready container and chapters
  - Add page break controls (break-before for chapters, break-inside avoid for elements)
  - Add chapter heading styles
  - Add footnote styles for end-of-chapter placement
  - Add navigation control styles (visible in browser, hidden in print)
  - Import stylesheet in main component
  - _Requirements: 1.3, 1.4, 2.2_

- [x] 7. Implement browser preview navigation controls
  - Create `createNavigationControls()` function to generate forward/backward buttons
  - Implement page detection and scroll-to-page functionality
  - Add keyboard navigation support (arrow keys) for page preview
  - Style navigation controls similar to slideshow controls
  - Add CSS to hide navigation controls in print media query
  - Implement button state management (disable at first/last page)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 8. Integrate print-ready renderer into main component
  - Modify `src/mark-down.js` to detect `print-ready` attribute
  - Import `renderPrintReady` function
  - Add conditional rendering logic to call `renderPrintReady()` when print-ready mode is enabled
  - Ensure footnote extraction happens before rendering for print-ready mode
  - Pass configuration from YAML front matter to renderer
  - _Requirements: 1.1, 1.2_

- [x] 9. Create page imposition calculation module
  - Create `src/print-ready-imposition.js` file
  - Implement `validateImpositionConfig()` function to validate pages-per-sheet is even and other config
  - Implement `calculateBlankPages()` function to determine blank pages needed
  - Implement `generateDoubleSidedImposition()` function for duplex printing page arrangement
  - Implement `generateSingleSidedImposition()` function for simplex printing page arrangement
  - Implement main `calculateImpositionOrder()` function that orchestrates imposition calculation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Implement page imposition in renderer
  - Add imposition detection in `renderPrintReady()` based on `page-imposed` attribute
  - Implement page content extraction and pagination logic
  - Integrate `calculateImpositionOrder()` to reorder pages
  - Implement blank page insertion for incomplete sheets
  - Add sheet size configuration support
  - Validate sheet size can accommodate pages-per-sheet
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 8.1, 8.2, 8.3, 8.4_

- [x] 11. Create example HTML file
  - Create `print-ready.html` file in root directory
  - Add sample markdown content with multiple chapters (at least 3 H1 sections)
  - Include footnote examples within chapters
  - Add YAML front matter with title, author, and page-size configuration
  - Add commented examples showing page imposition settings
  - Include script tags to load the mark-down component
  - Add basic styling for the example page
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 12. Add error handling and validation
  - Add try-catch blocks in main rendering functions
  - Implement configuration validation with helpful error messages
  - Add fallback behavior for missing footnote definitions
  - Add fallback for malformed HTML during chapter splitting
  - Add console warnings for invalid configuration values
  - _Requirements: All requirements (error handling)_

- [x] 13. Update README documentation
  - Add "Print-Ready View" section to README.md
  - Document print-ready attribute and basic usage
  - Document page size configuration options
  - Document custom dimension configuration
  - Document header/footer configuration with title and author
  - Document page imposition feature and settings
  - Add example YAML front matter configurations
  - Add example of print-ready.html usage
  - _Requirements: 10.1_
