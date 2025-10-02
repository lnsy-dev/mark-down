export default function markdownitAbbr(md) {
  // Collect abbreviation definitions and strip their paragraphs
  md.core.ruler.after('inline', 'abbr_def', function abbrDef(state) {
    const tokens = state.tokens;
    const toRemove = new Set();
    const abbrs = {};

    for (let i = 0; i < tokens.length; i++) {
      const open = tokens[i];
      if (open.type !== 'paragraph_open') continue;
      const inline = tokens[i + 1];
      const close = tokens[i + 2];
      if (!inline || inline.type !== 'inline' || !close || close.type !== 'paragraph_close') continue;

      // Split into lines and consider only non-empty trimmed lines
      const lines = inline.content
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (lines.length === 0) continue;

      // Match only definition lines of the form: *[TERM]: Expansion
      let allDefs = true;
      for (const line of lines) {
        const m = line.match(/^\*\[([^\]]+)\]:\s+(.+)$/);
        if (!m) {
          allDefs = false;
          break;
        }
        const term = m[1];
        const title = m[2].trim();
        if (term) abbrs[term] = title;
      }

      // If the entire paragraph consists of definitions, mark it for removal
      if (allDefs) {
        toRemove.add(i);
        toRemove.add(i + 1);
        toRemove.add(i + 2);
        i += 2; // skip ahead
      }
    }

    // Persist on env for the replacement phase
    state.env = state.env || {};
    state.env.abbreviations = abbrs;

    // Remove definition paragraphs from token stream
    if (toRemove.size > 0) {
      state.tokens = tokens.filter((_, idx) => !toRemove.has(idx));
    }
  });

  // Replace occurrences in text with <abbr title="...">TERM</abbr>
  md.core.ruler.after('abbr_def', 'abbr_replace', function abbrReplace(state) {
    const env = state.env || {};
    const abbrs = env.abbreviations || {};
    let terms = Object.keys(abbrs);
    if (terms.length === 0) return;

    // Prefer longest matches first to avoid partial replacements
    terms.sort((a, b) => b.length - a.length);

    // Build a single alternation regex with word boundaries
    const pattern = terms.map(escapeRegExp).join('|');
    const re = new RegExp(`\\b(${pattern})\\b`, 'g');

    const Token = state.Token;

    for (const blk of state.tokens) {
      if (blk.type !== 'inline' || !blk.children) continue;

      const out = [];
      for (const child of blk.children) {
        if (child.type !== 'text') {
          out.push(child);
          continue;
        }

        const src = child.content;
        let last = 0;
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(src)) !== null) {
          if (m.index > last) {
            const t = new Token('text', '', 0);
            t.content = src.slice(last, m.index);
            out.push(t);
          }
          const term = m[1];
          const title = abbrs[term];

          const open = new Token('abbr_open', 'abbr', 1);
          open.attrSet('title', title);
          out.push(open);

          const text = new Token('text', '', 0);
          text.content = term;
          out.push(text);

          const close = new Token('abbr_close', 'abbr', -1);
          out.push(close);

          last = re.lastIndex;
        }

        if (last < src.length) {
          const t = new Token('text', '', 0);
          t.content = src.slice(last);
          out.push(t);
        }
      }

      blk.children = out;
    }
  });
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
