

function mermaidPlugin(md, options = {}) {
  const defaultRender = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    const langName = info ? info.split(/\s+/g)[0] : '';

    // Check if this is a mermaid code block
    if (langName === 'mermaid') {
      // Return a div with class="mermaid" containing the diagram code
      return `<div class="mermaid">${token.content}</div>\n`;
    }

    // For all other code blocks, use the default renderer
    return defaultRender(tokens, idx, options, env, self);
  };
}

export default mermaidPlugin;