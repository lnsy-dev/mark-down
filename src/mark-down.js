import DataroomElement from "dataroom-js";
import { parseDataroomMarkup } from "./mark-down-helpers.js";
import { hljs } from "./vendor/highlight/highlight.min.js";

class dataroomCompiler extends DataroomElement {
  async initialize() {
    const editor_id = this.attrs["editor-id"];

    // --- Event Delegation Setup ---
    // This single listener is attached once and handles all checkbox clicks.
    this.addEventListener('click', (e) => {
      // Check if the clicked element is one of our checkboxes
      if (e.target && e.target.matches('.task-list-item-checkbox')) {
        const checkbox = e.target;
        e.preventDefault(); // Prevent the checkbox from toggling visually

        const line_number = checkbox.getAttribute("data-line");
        const editor = document.getElementById(editor_id);

        if (editor && typeof editor.findAndReplace === "function" && line_number) {
          const old_substring = checkbox.checked ? "[ ]" : "[x]";
          const new_substring = checkbox.checked ? "[x]" : "[ ]";

          editor.findAndReplace(
            parseInt(line_number),
            old_substring,
            new_substring
          );
        }
      }
    });

    if (editor_id) {
      // 1. Wait for the browser to define the <lnsy-edit> component.
      await customElements.whenDefined('lnsy-edit');
      
      const editor = document.getElementById(editor_id);

      // 2. Wait for that specific editor instance to finish its internal setup.
      if (editor && editor.ready instanceof Promise) {
        await editor.ready;
      }

      // 3. Now it's safe to interact with the editor.
      if (editor && typeof editor.getValue === 'function') {
        editor.on("change", (content) => {
          this.content = content;
          this.render();
        });

        this.content = editor.getValue();
        await this.render();
      }
    } else {
      // Fallback for when there's no editor
      if (typeof this.attrs["src"] !== "undefined") {
        this.content = await fetch(this.attrs["src"]).then((res) => res.text());
      } else {
        this.content = this.textContent;
        this.innerHTML = " ";
      }
      await this.render();
    }
  }

  async render() {
    let content = this.content;
    for (const key in this.attrs) {
      content = content.replace(
        new RegExp(`{{${key}}}`, "g"),
        this.attrs[key]
      );
    }

    const parsed_markup = await parseDataroomMarkup(content.trim(), this.attrs);
    Object.keys(parsed_markup.data).forEach((key) => {
      this.setAttribute(key, parsed_markup.data[key]);
    });

    this.innerHTML = parsed_markup.html;

    this.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block);
    });
  }


}

// Check if the element is already defined to prevent re-registration during HMR
if (!customElements.get("mark-down")) {
  customElements.define("mark-down", dataroomCompiler);
}
