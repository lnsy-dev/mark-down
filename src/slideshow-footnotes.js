/**
 * Slideshow footnote processor
 * @fileoverview Handles footnote extraction and distribution across slides
 */

/**
 * Extracts footnote definitions from markdown content
 * @param {string} markdown - The markdown content
 * @return {Object} Object with footnoteMap and markdownWithoutDefinitions
 */
export function extractFootnoteDefinitions(markdown) {
  const footnoteMap = {};
  const lines = markdown.split('\n');
  const cleanedLines = [];
  
  // Regex to match footnote definitions: [^1]: Footnote text
  const footnoteDefRegex = /^\[\^([^\]]+)\]:\s*(.+)$/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(footnoteDefRegex);
    
    if (match) {
      const id = match[1];
      let content = match[2];
      
      // Check if next lines are continuation (indented)
      let j = i + 1;
      while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t'))) {
        content += '\n' + lines[j].trim();
        j++;
      }
      
      footnoteMap[id] = content;
      i = j - 1; // Skip the continuation lines
    } else {
      cleanedLines.push(line);
    }
  }
  
  return {
    footnoteMap,
    markdownWithoutDefinitions: cleanedLines.join('\n')
  };
}

/**
 * Finds all footnote references in a slide's HTML
 * @param {string} slideHtml - The HTML content of a slide
 * @return {Array<string>} Array of footnote IDs referenced in the slide
 */
export function getFootnoteReferencesInSlide(slideHtml) {
  // Match [^1] style references in the HTML
  const refRegex = /\[\^([^\]]+)\]/g;
  const footnoteIds = [];
  let match;
  
  while ((match = refRegex.exec(slideHtml)) !== null) {
    const id = match[1];
    if (!footnoteIds.includes(id)) {
      footnoteIds.push(id);
    }
  }
  
  return footnoteIds;
}

/**
 * Converts footnote references in HTML to superscript links
 * @param {string} html - The HTML content
 * @param {number} slideIndex - The current slide index
 * @return {string} HTML with footnote references converted to links
 */
export function convertFootnoteReferences(html, slideIndex) {
  // Replace [^1] with <sup><a href="#fn-slide0-1" id="fnref-slide0-1">[1]</a></sup>
  return html.replace(/\[\^([^\]]+)\]/g, (match, id) => {
    return `<sup class="footnote-ref"><a href="#fn-slide${slideIndex}-${id}" id="fnref-slide${slideIndex}-${id}">[${id}]</a></sup>`;
  });
}

/**
 * Generates footnote HTML for a slide
 * @param {Array<string>} footnoteIds - Array of footnote IDs to include
 * @param {Object} footnoteMap - Map of footnote IDs to their content
 * @param {number} slideIndex - The current slide index
 * @return {string} HTML for the footnotes section
 */
export function generateFootnotesHtml(footnoteIds, footnoteMap, slideIndex) {
  if (footnoteIds.length === 0) {
    return '';
  }
  
  let html = '<div class="slide-footnotes"><ol class="slide-footnotes-list">';
  
  footnoteIds.forEach(id => {
    if (footnoteMap[id]) {
      html += `<li id="fn-slide${slideIndex}-${id}">`;
      html += footnoteMap[id];
      html += ` <a href="#fnref-slide${slideIndex}-${id}" class="footnote-backref">↩</a>`;
      html += `</li>`;
    }
  });
  
  html += '</ol></div>';
  
  return html;
}

/**
 * Processes a slide to add footnotes
 * @param {string} slideHtml - The HTML content of a slide
 * @param {Object} footnoteMap - Map of footnote IDs to their content
 * @param {number} slideIndex - The current slide index
 * @return {string} Slide HTML with footnotes added
 */
export function addFootnotesToSlide(slideHtml, footnoteMap, slideIndex) {
  // Find footnote references in the slide
  const footnoteIds = getFootnoteReferencesInSlide(slideHtml);
  
  // Convert [^1] references to proper HTML links
  let processedHtml = convertFootnoteReferences(slideHtml, slideIndex);
  
  // Add footnotes section at the bottom
  const footnotesHtml = generateFootnotesHtml(footnoteIds, footnoteMap, slideIndex);
  
  return processedHtml + footnotesHtml;
}
