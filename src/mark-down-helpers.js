import yaml from 'js-yaml';
import markdownit from 'markdown-it';
import markdownItAttribution from 'markdown-it-attribution';
import markdownitTaskLists from 'markdown-it-task-lists';
import wikilinksPlugin from './markdown-it-wikilinks.js';


export function extractYamlFrontMatter(inputString) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = inputString.match(frontMatterRegex);
    if (match) {
        // Parse the YAML front matter
        const yamlContent = match[1];
        try {
            return yaml.load(yamlContent);  // Parse YAML content and return as an object
        } catch (e) {
            console.error("Failed to parse YAML front matter:", e);
            return null;
        }
    }
    return {};
}

export function removeYamlFrontMatter(inputString) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    return inputString.replace(frontMatterRegex, '').trim();
}

const variablePattern = /\$[a-zA-Z_][a-zA-Z0-9_-]*/g;

function replaceVariables(str, attributes) {
  return str.replace(variablePattern, (match) => {
    const varName = match.substring(1);
    return attributes[varName] || match;
  });
}



function figureCaptionPlugin(md) {
  function replaceImageWithFigure(state) {
    const tokens = state.tokens;
    let i = 0;
    while (i < tokens.length) {
      if (tokens[i].type === 'inline' && tokens[i].children && tokens[i].children.length > 0) {
        const inlineChildren = tokens[i].children;
        let j = 0;
        while (j < inlineChildren.length) {
          const imageToken = inlineChildren[j];
          if (imageToken.type === 'text') {
            const textContent = imageToken.content;
            const imageMarkdownRegex = /^!\[([^\]]+)\]$/;
            const match = textContent.match(imageMarkdownRegex);

            if (match) {
              const imageUrl = match[1]; // The content inside the brackets is the URL
              const imageRegex = /\.(jpg|jpeg|webp|png|mp4)$/i;

              if (imageRegex.test(imageUrl)) {
                // Check for softbreak and text token immediately after the image within the same inline token
                if (j + 2 < inlineChildren.length && inlineChildren[j + 1].type === 'softbreak' && inlineChildren[j + 2].type === 'text') {
                  const figcaptionContent = inlineChildren[j + 2].content;

                  const figureOpen = new state.Token('figure_open', 'figure', 1);
                  const newImageToken = new state.Token('image', 'img', 0);
                  newImageToken.attrs = [['src', imageUrl], ['alt', imageUrl]];
                  newImageToken.children = [new state.Token('text', '', 0)];
                  newImageToken.children[0].content = imageUrl;

                  const figcaptionOpen = new state.Token('figcaption_open', 'figcaption', 1);
                  figcaptionOpen.children = [new state.Token('text', '', 0)];
                  figcaptionOpen.children[0].content = figcaptionContent;
                  const figcaptionClose = new state.Token('figcaption_close', 'figcaption', -1);

                  const figureClose = new state.Token('figure_close', 'figure', -1);

                  const newTokens = [
                    figureOpen,
                    newImageToken,
                    figcaptionOpen,
                    figcaptionClose,
                    figureClose
                  ];

                  // Replace the original paragraph_open, inline, and paragraph_close tokens with the new figure structure
                  tokens.splice(i, 3, ...newTokens);
                  i += newTokens.length;
                  // Break from outer loop as we've processed a block-level change
                  break;
                } else {
                  j++;
                }
              } else {
                j++;
              }
            } else {
              j++;
            }
          } else {
            j++;
          }
        }
        // If we reached here, it means no figure was created within this inline token
        // So we just increment i to move to the next block token
        i++;
      } else {
        i++; // Increment outer loop counter
      }
    }
  }

  md.core.ruler.push('replace_image_with_figure', replaceImageWithFigure);

  md.renderer.rules.figcaption_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    let result = '<figcaption>';
    if (token.children) {
      result += self.renderInline(token.children, options, env);
    }
    return result;
  };
  md.renderer.rules.figcaption_close = function (tokens, idx, options, env, self) {
    return '</figcaption>';
  };
}

export async function parseDataroomMarkup(content, attributes = {}) {

  const md = markdownit({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  }).use(markdownItAttribution, {
    marker: 'cite:',
  }).use(markdownitTaskLists, { enabled: true, disabled: true })
  .use(wikilinksPlugin, { wikilinksSearchPrefix: attributes['wikilinks-search-prefix'] })
  .use(figureCaptionPlugin)
  .use(function(md) {
    function aside(state, startLine, endLine) {
      let pos = state.bMarks[startLine] + state.tShift[startLine];
      let max = state.eMarks[startLine];

      if (state.src.charCodeAt(pos) !== 58 /* : */) { return false; }

      let marker_count = 1;
      let marker_pos = pos;
      while (marker_pos < max && state.src.charCodeAt(++marker_pos) === 58 /* : */) {
        marker_count++;
      }

      if (marker_count < 3) { return false; }

      const marker = state.src.slice(pos, marker_pos);

      // Find the end of the block
      let nextLine = startLine;
      let auto_closed = false;
      while (nextLine < endLine) {
        nextLine++;
        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        if (pos < max && state.sCount[nextLine] < state.blkIndent) {
          // non-empty line with negative indent should stop the list:
          break;
        }
        if (state.src.slice(pos, max).trim() === marker) {
          auto_closed = true;
          break;
        }
      }

      const old_parent = state.parentType;
      const old_line_max = state.lineMax;
      state.parentType = 'aside';

      // this will prevent the parser from rendering the ::: markers
      state.lineMax = nextLine;

      let token = state.push('aside_open', 'aside', 1);
      token.markup = marker;
      token.map = [ startLine, nextLine ];

      state.md.block.tokenize(state, startLine + 1, nextLine);

      token = state.push('aside_close', 'aside', -1);
      token.markup = marker;

      state.parentType = old_parent;
      state.lineMax = old_line_max;
      state.line = nextLine + (auto_closed ? 1 : 0);

      return true;
    }

    md.block.ruler.before('fence', 'aside', aside, {
      alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
    });
    md.renderer.rules.aside_open = function() { return '<aside>\n'; };
    md.renderer.rules.aside_close = function() { return '</aside>\n'; };
  });
  const data = extractYamlFrontMatter(content);
  const template_without_yaml = removeYamlFrontMatter(content);
  const new_value = replaceVariables(template_without_yaml, data)
  const renderedContent = md.render(new_value);
  return {data:data, html: renderedContent};
}
