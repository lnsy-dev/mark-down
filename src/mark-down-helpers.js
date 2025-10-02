import yaml from 'js-yaml';
import markdownit from 'markdown-it';
import markdownItAttribution from 'markdown-it-attribution';
import markdownitTaskLists from 'markdown-it-task-lists';
import wikilinksPlugin from './markdown-it-wikilinks.js';
import figureCaptionPlugin from './markdown-it-figure-caption.js';
import markdownitFootnote from 'markdown-it-footnote';
import markdownitAbbr from 'markdown-it-abbr';
import mermaidPlugin from './markdown-it-mermaid.js';


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




export async function parseDataroomMarkup(content, attributes = {}) {

  const md = markdownit({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  }).use(markdownItAttribution, {
    marker: 'cite:',
  }).use(markdownitTaskLists, { enabled: true })
  .use(wikilinksPlugin, { wikilinksSearchPrefix: attributes['wikilinks-search-prefix'] })
  .use(figureCaptionPlugin)
  .use(markdownitFootnote)
  .use(markdownitAbbr)
  .use(mermaidPlugin)
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

  // add line numbers to list items
  const originalListItemOpen = md.renderer.rules.list_item_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.list_item_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    if (token.map && token.map.length) {
      token.attrSet('data-line', String(token.map[0]));
    }
    return originalListItemOpen(tokens, idx, options, env, self);
  };

  const data = extractYamlFrontMatter(content);
  const template_without_yaml = removeYamlFrontMatter(content);
  const new_value = replaceVariables(template_without_yaml, data)
  const renderedContent = md.render(new_value);
  return {data:data, html: renderedContent};
}
