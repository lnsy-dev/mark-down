import DataroomElement from "dataroom-js";
import { parseDataroomMarkup } from "./mark-down-helpers.js";
import { hljs } from "./vendor/highlight/highlight.min.js";


const MERMAID_CDN = 'https://unpkg.com/mermaid@11.12.0/dist/mermaid.min.js';

async function ensureMermaid() {
  if (typeof window === 'undefined') return undefined;
  if (window.mermaid) return window.mermaid;
  let script = document.querySelector('script[data-mermaid-cdn]');
  if (!script) {
    script = document.createElement('script');
    script.src = MERMAID_CDN;
    script.async = true;
    script.dataset.mermaidCdn = 'true';
    document.head.appendChild(script);
  }
  await new Promise((resolve, reject) => {
    if (window.mermaid) return resolve();
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', (e) => reject(e));
  });
  return window.mermaid;
}

function readCSSVar(name, fallback = '') {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v || fallback).trim();
  } catch (_) {
    return fallback;
  }
}

function getMermaidThemeFromCSS() {
  const bg = readCSSVar('--bg-color', '#ffffff');
  const fg = readCSSVar('--fg-color', '#222222');
  const highlight = readCSSVar('--highlight-color', '#ff8800');
  const secondary = readCSSVar('--secondary-color', '#334155');
  const trinary = readCSSVar('--trinary-color', '#475569');
  const fontFamily = (function () {
    try { return getComputedStyle(document.body).fontFamily || 'ui-sans-serif, system-ui, sans-serif'; } catch (_) { return 'ui-sans-serif, system-ui, sans-serif'; }
  })();

  // Map project variables to Mermaid theme variables
  return {
    background: bg,
    mainBkg: bg,
    clusterBkg: bg,
    clusterBorder: fg,
    primaryColor: bg,
    primaryBorderColor: fg,
    primaryTextColor: fg,
    secondaryColor: secondary,
    tertiaryColor: trinary,
    noteBkgColor: bg,
    noteTextColor: fg,
    edgeLabelBackground: bg,
    lineColor: fg,
    textColor: fg,
    titleColor: fg,
    // Use highlight for accents (e.g., special states)
    signalColor: highlight,
    fontFamily,
  };
}

class dataroomCompiler extends DataroomElement {
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

    this.innerHTML = parsed_markup.html;

    // Ensure Mermaid is available and initialize once
    let mermaidLib;
    try {
      mermaidLib = await ensureMermaid();
      if (mermaidLib && !this._mermaidInitialized && typeof mermaidLib.initialize === 'function') {
        const themeVariables = getMermaidThemeFromCSS();
        mermaidLib.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'base',
          themeVariables
        });
        this._mermaidInitialized = true;
      }
    } catch (e) {
      console.warn("Mermaid load/initialize failed:", e);
    }

    // Convert fenced mermaid code blocks into .mermaid containers
    const mermaidSelectors = [
      "pre code.language-mermaid",
      "pre code.lang-mermaid",
      "code.language-mermaid",
      "code.lang-mermaid"
    ];
    this.querySelectorAll(mermaidSelectors.join(", ")).forEach((code) => {
      const src = code.textContent;
      const container = document.createElement("div");
      container.className = "mermaid";
      container.textContent = src;
      const pre = code.closest("pre");
      if (pre) {
        pre.replaceWith(container);
      } else {
        code.replaceWith(container);
      }
    });

    // Also support <pre class="mermaid"> blocks if any
    this.querySelectorAll("pre.mermaid").forEach((pre) => {
      const src = pre.textContent;
      const container = document.createElement("div");
      container.className = "mermaid";
      container.textContent = src;
      pre.replaceWith(container);
    });

    // Render any .mermaid blocks
    try {
      const nodes = this.querySelectorAll(".mermaid");
      if (nodes.length && mermaidLib) {
        if (typeof mermaidLib.run === "function") {
          await mermaidLib.run({ nodes });
        } else if (typeof mermaidLib.init === "function") {
          mermaidLib.init(undefined, nodes);
        }
      }
    } catch (e) {
      console.warn("Mermaid render failed:", e);
    }

    // Highlight remaining code blocks
    this.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block);
    });
  }


}

// Check if the element is already defined to prevent re-registration during HMR
if (!customElements.get("mark-down")) {
  customElements.define("mark-down", dataroomCompiler);
}
