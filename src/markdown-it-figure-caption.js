/**
 * Markdown-it plugin for handling figure captions
 * @fileoverview Processes special image syntax to create figures with captions
 */

/**
 * Plugin function for markdown-it to handle figure captions
 * @param {Object} md - The markdown-it instance
 */
function figureCaptionPlugin(md) {
  // Override the normalize function to preprocess figure syntax
  const originalNormalize = md.utils.normalizeReference;

  /**
   * Escapes HTML special characters in a string
   * @param {string} [str=''] - String to escape
   * @return {string} HTML-escaped string
   */
  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Escapes HTML attribute values
   * @param {string} [str=''] - String to escape for use in HTML attributes
   * @return {string} Attribute-escaped string
   */
  function escapeAttr(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  
  /**
   * Preprocesses markdown text to convert figure syntax to standard markdown
   * NOTE: This function is fence-aware and will not transform content inside fenced code blocks
   * @param {string} src - The source markdown content
   * @return {string} Preprocessed markdown with figure syntax converted
   */
  function preprocessMarkdown(src) {
    // Image URL heuristic (kept consistent with previous behavior)
    const imageRegex = /\.(jpg|jpeg|webp|png|gif|svg|mp4)$/i;

    // 1) New syntax: same-line alt text, next-line caption
    //    ![[url]] some alt text\ncaption
    const withAltPattern = /^!\[\[([^\]]+)\]\]\s+([^\n]+)\n([^\n]+)$/gm;

    // 2) Backwards-compatible syntax: next-line caption only
    //    ![[url]]\ncaption
    //    In this case, keep previous behavior where alt == caption
    const withoutAltPattern = /^!\[\[([^\]]+)\]\]\n([^\n]+)$/gm;

    // We'll split the input into segments outside/inside fenced code blocks and
    // only apply replacements to the outside segments.
    const lines = src.split('\n');
    let out = '';
    let buffer = '';
    let inFence = false;
    let fenceChar = null; // '`' or '~'
    let fenceLen = 0;     // opening fence length (>= 3)

    function applyReplacements(text) {
      if (!text) return '';
      let replaced = text.replace(withAltPattern, (match, imageUrl, altText, caption) => {
        const isImageUrl = imageRegex.test(imageUrl) ||
          imageUrl.includes('placehold') ||
          imageUrl.includes('placeholder') ||
          imageUrl.startsWith('http') ||
          imageUrl.startsWith('/');

        if (!isImageUrl) return match; // Not an image-like URL; leave unchanged

        const srcEsc = escapeAttr(imageUrl.trim());
        const altEsc = escapeAttr(altText.trim());
        const captionEsc = escapeHtml(caption.trim());

        return `<figure><img src="${srcEsc}" alt="${altEsc}"><figcaption>${captionEsc}</figcaption></figure>`;
      });

      replaced = replaced.replace(withoutAltPattern, (match, imageUrl, caption) => {
        const isImageUrl = imageRegex.test(imageUrl) ||
          imageUrl.includes('placehold') ||
          imageUrl.includes('placeholder') ||
          imageUrl.startsWith('http') ||
          imageUrl.startsWith('/');

        if (!isImageUrl) return match;

        const srcEsc = escapeAttr(imageUrl.trim());
        const captionTrimmed = caption.trim();
        const captionEsc = escapeHtml(captionTrimmed);
        const altEsc = escapeAttr(captionTrimmed);

        return `<figure><img src="${srcEsc}" alt="${altEsc}"><figcaption>${captionEsc}</figcaption></figure>`;
      });

      return replaced;
    }

    function flushBuffer() {
      if (buffer.length) {
        out += applyReplacements(buffer);
        buffer = '';
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!inFence) {
        // Detect fence opening: ```lang or ~~~lang (3 or more)
        const openMatch = line.match(/^\s*([`~]{3,})(.*)$/);
        if (openMatch) {
          // Flush and start fence
          flushBuffer();
          out += line + '\n';
          const marker = openMatch[1];
          fenceChar = marker[0];
          fenceLen = marker.length;
          inFence = true;
          continue;
        }
        // Accumulate outside-fence content
        buffer += line + '\n';
      } else {
        // Inside a fence, copy verbatim
        out += line + '\n';
        // Detect fence closing: same char repeated at least as many times, only spaces otherwise
        const closeRe = new RegExp('^\\s*' + (fenceChar === '`' ? '`' : '~') + '{' + fenceLen + ',}\\s*$');
        if (closeRe.test(line)) {
          inFence = false;
          fenceChar = null;
          fenceLen = 0;
        }
      }
    }

    // Flush any trailing outside-fence content
    flushBuffer();

    return out;
  }
  
  // Hook into the markdown-it processing pipeline
  const originalParse = md.parse;
  md.parse = function(src, env) {
    const processedSrc = preprocessMarkdown(src);
    return originalParse.call(this, processedSrc, env);
  };

  md.renderer.rules.figcaption_open = function (tokens, idx, options, env, self) {
    return '<figcaption>';
  };
  
  md.renderer.rules.figcaption_close = function (tokens, idx, options, env, self) {
    return '</figcaption>';
  };
}

export default figureCaptionPlugin;
