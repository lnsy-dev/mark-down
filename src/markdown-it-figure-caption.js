function figureCaptionPlugin(md) {
  // Override the normalize function to preprocess figure syntax
  const originalNormalize = md.utils.normalizeReference;

  // Simple HTML escaping helpers
  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  
  // Preprocess the markdown text to convert figure syntax to standard markdown
  function preprocessMarkdown(src) {
    // Image URL heuristic (kept consistent with previous behavior)
    const imageRegex = /\.(jpg|jpeg|webp|png|gif|svg|mp4)$/i;

    // 1) New syntax: same-line alt text, next-line caption
    //    ![[url]] some alt text\ncaption
    const withAltPattern = /^!\[\[([^\]]+)\]\]\s+([^\n]+)\n([^\n]+)$/gm;

    let out = src.replace(withAltPattern, (match, imageUrl, altText, caption) => {
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

    // 2) Backwards-compatible syntax: next-line caption only
    //    ![[url]]\ncaption
    //    In this case, keep previous behavior where alt == caption
    const withoutAltPattern = /^!\[\[([^\]]+)\]\]\n([^\n]+)$/gm;

    out = out.replace(withoutAltPattern, (match, imageUrl, caption) => {
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
