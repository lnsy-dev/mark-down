function wikilinksPlugin(md, options) {
  const wikilinkRegex = /\[\[([^\]]+)\]\]/g;

  function wikilinkRule(state) {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'inline' && tokens[i].content.match(wikilinkRegex)) {
        const inlineTokens = [];
        let lastIndex = 0;
        let match;

        while ((match = wikilinkRegex.exec(tokens[i].content)) !== null) {
          const [fullMatch, linkText] = match;
          const linkHref = options.wikilinksSearchPrefix
            ? `/?${options.wikilinksSearchPrefix}=${encodeURIComponent(linkText)}`
            : `${linkText}.html`;

          // Add text before the match
          if (match.index > lastIndex) {
            const textToken = new state.Token('text', '', 0);
            textToken.content = tokens[i].content.slice(lastIndex, match.index);
            inlineTokens.push(textToken);
          }

          // Add link tokens
          const linkOpen = new state.Token('link_open', 'a', 1);
          linkOpen.attrSet('href', linkHref);
          inlineTokens.push(linkOpen);

          const text = new state.Token('text', '', 0);
          text.content = linkText;
          inlineTokens.push(text);

          const linkClose = new state.Token('link_close', 'a', -1);
          inlineTokens.push(linkClose);

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