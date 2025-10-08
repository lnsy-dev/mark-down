import DataroomElement from "dataroom-js";
import { parseDataroomMarkup, parseChapters } from "./mark-down-helpers.js";

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

  _setupPagingControls(wrapper, totalPages) {
    const prevBtn = wrapper.querySelector('.page-prev');
    const nextBtn = wrapper.querySelector('.page-next');

    const pages = () => Array.from(wrapper.querySelectorAll('.page'));
    let current = 1;

    const update = () => {
      const ps = pages();
      ps.forEach((p, i) => {
        p.classList.toggle('active', i === current - 1);
      });
      if (prevBtn) prevBtn.disabled = current <= 1;
      if (nextBtn) nextBtn.disabled = current >= ps.length;
    };

    prevBtn?.addEventListener('click', () => { if (current > 1) { current--; update(); } });
    nextBtn?.addEventListener('click', () => { const ps = pages(); if (current < ps.length) { current++; update(); } });

    // Keyboard navigation when wrapper is focused
    wrapper.setAttribute('tabindex', '0');
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { if (current > 1) { current--; update(); } }
      if (e.key === 'ArrowRight') { const ps = pages(); if (current < ps.length) { current++; update(); } }
    });

    update();
  }

  _createPageElement(pageNumber, headerText) {
    const page = document.createElement('div');
    page.className = `page ${pageNumber % 2 === 1 ? 'odd' : 'even'}`;
    page.setAttribute('data-page', String(pageNumber));

    const header = document.createElement('div');
    header.className = 'page-header';
    header.textContent = headerText || '';

    const body = document.createElement('div');
    body.className = 'page-body';

    const footer = document.createElement('div');
    footer.className = 'page-footer';
    const num = document.createElement('span');
    num.className = 'page-number';
    num.textContent = String(pageNumber);
    footer.appendChild(num);

    page.appendChild(header);
    page.appendChild(body);
    page.appendChild(footer);

    return { page, body };
  }

  _paginateChapters(pagesContainer, parsed, bookTitle) {
    let pageNumber = 1;

    (parsed.chapters || []).forEach((ch) => {
      // Temp container for chapter HTML to move nodes from
      const temp = document.createElement('div');
      temp.innerHTML = ch.html;

      while (temp.childNodes.length > 0) {
        const isOdd = pageNumber % 2 === 1;
        const headerText = isOdd ? (ch.title || '') : (bookTitle || '');
        const { page, body } = this._createPageElement(pageNumber, headerText);
        pagesContainer.appendChild(page);

        // Ensure measurable layout during pagination (override screen CSS)
        const prevDisplay = page.style.display;
        const prevVisibility = page.style.visibility;
        page.style.display = 'block';
        page.style.visibility = 'hidden';

        // Fill body with nodes that fit
        let appendedAny = false;
        while (temp.firstChild) {
          const next = temp.firstChild;
          body.appendChild(next); // move node into page body

          // Force reflow and then check overflow
          // Note: clientHeight relies on the page being display:block
          if (body.scrollHeight > body.clientHeight) {
            // Too tall, revert this node and start a new page
            body.removeChild(next);
            temp.insertBefore(next, temp.firstChild);
            break;
          } else {
            appendedAny = true;
          }
        }

        // Edge-case: if nothing fit (single node too large), force place it to avoid infinite loop
        if (!appendedAny && temp.firstChild) {
          const forceNode = temp.firstChild;
          body.appendChild(forceNode);
        }

        // Restore styles; non-active pages will be hidden by CSS again
        page.style.display = prevDisplay;
        page.style.visibility = prevVisibility;

        pageNumber++;
      }
    });

    return pageNumber - 1; // total pages created
  }

  async render() {
    let content = this.content;

    const isPaged = String(this.attrs["paged-rendering"]).toLowerCase() === "true";
    const pageSize = (this.attrs["page-size"] || "").toLowerCase();

    if (!isPaged) {
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
      return;
    }

    // Paged rendering
    const parsed = await parseChapters(content.trim(), this.attrs);

    // Attach YAML keys as attributes (e.g., title, author (array -> comma-joined))
    Object.keys(parsed.data || {}).forEach((key) => {
      const val = parsed.data[key];
      // Convert arrays/objects to a sensible string
      const attrVal = Array.isArray(val) ? val.join(', ') : (typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
      this.setAttribute(key, attrVal);
    });

    const bookTitleRaw = parsed.data?.title;
    const bookTitle = Array.isArray(bookTitleRaw) ? bookTitleRaw.join(', ') : (bookTitleRaw || '');

    const wrapperAttrs = [ 'md-paged' ];
    if (pageSize) { wrapperAttrs.push(`page-size-${pageSize}`); }

    // Build wrapper skeleton first so measuring works
    this.innerHTML = `
      <div class="md-paged ${wrapperAttrs.join(' ')}" data-page-size="${pageSize || ''}">
        <div class="pages"></div>
        <button class="page-prev" aria-label="Previous page" title="Previous">&#x2039;</button>
        <button class="page-next" aria-label="Next page" title="Next">&#x203A;</button>
      </div>
    `;

    const wrapper = this.querySelector('.md-paged');
    const pagesContainer = wrapper.querySelector('.pages');

    const total = this._paginateChapters(pagesContainer, parsed, bookTitle);

    // Activate first page for screen view
    const first = pagesContainer.querySelector('.page');
    if (first) first.classList.add('active');

    this._setupPagingControls(wrapper, total);
  }


}

// Check if the element is already defined to prevent re-registration during HMR
if (!customElements.get("mark-down")) {
  customElements.define("mark-down", dataroomCompiler);
}
