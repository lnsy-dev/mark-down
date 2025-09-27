function figureCaptionPlugin(md) {
  // Override the normalize function to preprocess figure syntax
  const originalNormalize = md.utils.normalizeReference;
  
  // Preprocess the markdown text to convert figure syntax to standard markdown
  function preprocessMarkdown(src) {
    // Pattern to match: ![[url]] followed by newline and caption
    const figurePattern = /^!\[\[([^\]]+)\]\]\n(.+?)$/gm;
    
    return src.replace(figurePattern, (match, imageUrl, caption) => {
      // Check if it's likely an image URL
      const imageRegex = /\.(jpg|jpeg|webp|png|gif|svg|mp4)$/i;
      const isImageUrl = imageRegex.test(imageUrl) || 
                       imageUrl.includes('placehold') || 
                       imageUrl.includes('placeholder') ||
                       imageUrl.startsWith('http') || 
                       imageUrl.startsWith('/');
      
      if (isImageUrl) {
        // Convert to a custom HTML block that we'll render properly
        return `<figure><img src="${imageUrl}" alt="${caption}"><figcaption>${caption}</figcaption></figure>`;
      }
      
      return match; // Return original if not an image
    });
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