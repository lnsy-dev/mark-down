export default function markdownitAbbr(md) {
  // 1) Collect abbreviation definitions and hide their paragraphs
  md.core.ruler.after('inline', 'abbr_def', function abbrDef(state) {
    const tokens = state.tokens;
    const abbrs = {};

    for (let i = 0; i < tokens.length - 2; i++) {
      const open = tokens[i];
      const inline = tokens[i + 1];
      const close = tokens[i + 2];
      if (open.type !== 'paragraph_open' || !inline || inline.type !== 'inline' || !close || close.type !== 'paragraph_close') {
        continue;
      }

      // Build logical lines from inline children using softbreaks
      if (!inline.children) continue;
      const lines = [];
      let buf = '';
      let onlyTextAndBreaks = true;
      for (const child of inline.children) {
        if (child.type === 'softbreak') {
          lines.push(buf);
          buf = '';
          continue;
        }
        if (child.type !== 'text') {
          onlyTextAndBreaks = false;
          break;
        }
        buf += child.content;
      }
      if (!onlyTextAndBreaks) continue;
      if (buf.length > 0) lines.push(buf);

      // Parse definition lines: *[TERM]: Expansion
      let foundAny = false;
      for (let k = 0; k < lines.length; k++) {
        const s = lines[k].trim();
        if (s.length === 0) continue;
        const m = s.match(/^\*\[([^\]]+)\]:\s+(.+)$/);
        if (!m) {
          foundAny = false;
          break;
        }
        const term = m[1];
        const title = m[2].trim();
        if (term) {
          abbrs[term] = title;
          foundAny = true;
        }
      }

      // If this paragraph is purely definitions, hide it
      if (foundAny) {
        open.hidden = true;
        inline.hidden = true;
        close.hidden = true;
        // Prevent accidental rendering of inline children
        inline.children = [];
        i += 2; // skip to token after paragraph_close
      }
    }

    // Persist for replacement phase
    state.env = state.env || {};
    state.env.abbreviations = abbrs;
  });

  // 2) Replace occurrences in text with <abbr title="...">TERM</abbr>
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
      if (blk.type !== 'inline' || !blk.children || blk.hidden) continue;

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
