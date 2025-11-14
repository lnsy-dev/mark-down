/**
 * Markdown-it plugin for handling wikilinks
 * @fileoverview Processes [[wikilink]] syntax and converts to regular links
 */

/**
 * Plugin function for markdown-it to handle wikilinks
 * @param {Object} md - The markdown-it instance
 * @param {Object} options - Plugin options
 * @param {string} [options.wikilinksSearchPrefix] - Prefix for search URLs
 */
function wikilinksPlugin(md, options) {
  const wikilinkRegex = /!\[\[([^|\]]+)(?:\|([^\]]+))?\]\]|\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g;
  const imageRegex = /\.(jpg|jpeg|webp|png|gif|svg|mp4)$/i;

  /**
   * Checks if a URL is likely an image
   * @param {string} url - The URL to check
   * @return {boolean} True if the URL appears to be an image
   */
  function isImageUrl(url) {
    return imageRegex.test(url) ||
      url.includes('placehold') ||
      url.includes('placeholder') ||
      url.startsWith('http') ||
      url.startsWith('/');
  }

  /**
   * Rule function for processing wikilinks in markdown tokens
   * @param {Object} state - The markdown-it state object
   */
  function wikilinkRule(state) {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'inline' && tokens[i].content.match(wikilinkRegex)) {
        const inlineTokens = [];
        let lastIndex = 0;
        let match;

        while ((match = wikilinkRegex.exec(tokens[i].content)) !== null) {
          const isImage = match[0].startsWith('!');
          const linkTitle = isImage ? match[1] : match[3];
          const linkAlias = isImage ? match[2] : match[4];
          const linkTarget = linkAlias || linkTitle;

          // Add text before the match
          if (match.index > lastIndex) {
            const textToken = new state.Token('text', '', 0);
            textToken.content = tokens[i].content.slice(lastIndex, match.index);
            inlineTokens.push(textToken);
          }

          if (isImage && isImageUrl(linkTitle)) {
            // Create image tokens
            const imgToken = new state.Token('image', 'img', 0);
            imgToken.attrSet('src', linkTitle);
            imgToken.attrSet('alt', linkAlias || '');
            imgToken.content = '';
            imgToken.children = [];
            inlineTokens.push(imgToken);
          } else {
            // Create link tokens
            const linkHref = options.wikilinksSearchPrefix
              ? `#&${options.wikilinksSearchPrefix}=${encodeURIComponent(linkTarget)}`
              : `${linkTarget}.html`;

            const linkOpen = new state.Token('link_open', 'a', 1);
            linkOpen.attrSet('href', linkHref);
            inlineTokens.push(linkOpen);

            const text = new state.Token('text', '', 0);
            text.content = linkTitle;
            inlineTokens.push(text);

            const linkClose = new state.Token('link_close', 'a', -1);
            inlineTokens.push(linkClose);
          }

          lastIndex = wikilinkRegex.lastIndex;
        }

        // Add remaining text
        if (lastIndex < tokens[i].content.length) {
          const textToken = new state.Token('text', '', 0);
          textToken.content = tokens[i].content.slice(lastIndex);
          inlineTokens.push(textToken);
        }

        // Replace the original inline token with the new tokens
        tokens.splice(i, 1, ...inlineTokens);
      }
    }
  }

  md.core.ruler.push('wikilink', wikilinkRule);
}

export default wikilinksPlugin;