# Highlight.js CDN Assets

[![install size](https://packagephobia.now.sh/badge?p=highlight.js)](https://packagephobia.now.sh/result?p=highlight.js)

**This package contains only the CDN build assets of highlight.js.**

This may be what you want if you'd like to install the pre-built distributable highlight.js client-side assets via NPM. If you're wanting to use highlight.js mainly on the server-side you likely want the [highlight.js][1] package instead.

To access these files via CDN:<br>
https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@latest/build/

**If you just want a single .js file with the common languages built-in:
<https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@latest/build/highlight.min.js>**

---

## Highlight.js

Highlight.js is a syntax highlighter written in JavaScript. It works in
the browser as well as on the server. It works with pretty much any
markup, doesn’t depend on any framework, and has automatic language
detection.

If you'd like to read the full README:<br>
<https://github.com/highlightjs/highlight.js/blob/main/README.md>

## License

Highlight.js is released under the BSD License. See [LICENSE][7] file
for details.

## Links

The official site for the library is at <https://highlightjs.org/>.

The Github project may be found at: <https://github.com/highlightjs/highlight.js>

Further in-depth documentation for the API and other topics is at
<http://highlightjs.readthedocs.io/>.

A list of the Core Team and contributors can be found in the [CONTRIBUTORS.md][8] file.

[1]: https://www.npmjs.com/package/highlight.js
[7]: https://github.com/highlightjs/highlight.js/blob/main/LICENSE
[8]: https://github.com/highlightjs/highlight.js/blob/main/CONTRIBUTORS.md

---

## Abbreviations (markdown-it-abbr)

This repository enables the markdown-it-abbr plugin in the Markdown-It pipeline to turn known abbreviations into semantic <abbr> elements with a title attribute.

Where it’s enabled
- Wired into the parser at: `src/mark-down-helpers.js` (via `.use(markdownitAbbr)`).

Syntax
- Define abbreviations anywhere in your Markdown (commonly at the top):
  - `*[TERM]: Expansion`
- Definitions are stripped from the rendered output; only the in-text occurrences are transformed.

Example

```
*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium

HTML is standardized by the W3C.
```

Renders roughly as:

```
<p><abbr title="HyperText Markup Language">HTML</abbr> is standardized by the <abbr title="World Wide Web Consortium">W3C</abbr>.</p>
```

Notes and behavior
- Case-sensitive matching: the TERM is matched exactly as written.
- Whole-word matching: expansions typically apply to standalone terms, not substrings.
- Safe contexts: expansions do not apply inside fenced code blocks or inline code.
- Accessibility: the resulting <abbr> elements include the long form via the `title` attribute.
