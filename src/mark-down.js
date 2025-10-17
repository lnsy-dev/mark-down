/**
 * Custom Web Component for rendering markdown content with Dataroom
 * @fileoverview Defines a custom element that processes markdown content with YAML front matter support
 */

import DataroomElement from "dataroom-js";
import { parseDataroomMarkup } from "./mark-down-helpers.js";
import { renderSlideshow } from "./slideshow-renderer.js";

/**
 * Custom element for compiling and rendering markdown content
 * @class dataroomCompiler
 * @extends DataroomElement
 */
class dataroomCompiler extends DataroomElement {
  /**
   * Initializes the markdown component with event handlers and content loading
   * @return {Promise<void>}
   */
  async initialize() {

    // --- Event Delegation Setup ---
    // This single listener is attached once and handles all checkbox clicks.
    this.addEventListener('click', (e) => {
      // Check if the clicked element is one of our checkboxes
      if (e.target && e.target.matches('.task-list-item-checkbox')) {
        const checkbox = e.target;
        e.preventDefault(); // Prevent the checkbox from toggling visually

        const listItem = checkbox.closest('li');
        if (listItem) {
            const lineNumber = listItem.getAttribute("data-line");
            if (lineNumber) {
              const lines = this.content.split('\n');
              const content = lines[parseInt(lineNumber)];
    
              const event = new CustomEvent('checkbox-clicked', {
                bubbles: true,
                composed: true,
                detail: {
                  content: content,
                  lineNumber: parseInt(lineNumber)
                }
              });
              this.dispatchEvent(event);
            }
        }
      }
    });

    if (typeof this.attrs["src"] !== "undefined") {
      this.content = await fetch(this.attrs["src"]).then((res) => res.text());
    } else {
      this.content = this.textContent;
      this.innerHTML = " ";
    }
    await this.render();
  }

  /**
   * Renders the markdown content to HTML and updates the component's innerHTML
   * @return {Promise<void>}
   */
  async render() {
    let content = this.content;

    const parsed_markup = await parseDataroomMarkup(content.trim(), this.attrs);
    Object.keys(parsed_markup.data).forEach((key) => {
      this.setAttribute(key, parsed_markup.data[key]);
    });

    // replace attr variables
    for (const key in this.attrs) {
      content = content.replace(
        new RegExp(`{{${key}}}`, "g"),
        this.attrs[key]
      );
    }

    // Check if slide-show attribute is present
    if (this.attrs["slide-show"] === "true" || this.hasAttribute("slide-show")) {
      renderSlideshow(parsed_markup.html, this);
    } else {
      this.innerHTML = parsed_markup.html;
    }

    console.log("emitting event:");
    this.event("MARKDOWN-RENDERED");
  }


}

// Check if the element is already defined to prevent re-registration during HMR
if (!customElements.get("mark-down")) {
  customElements.define("mark-down", dataroomCompiler);
}
