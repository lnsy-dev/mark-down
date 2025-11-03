

# &lt;mark-down&gt; Element

An opinionated, dependency-free web vanilla js component that parses and renders markdown with extra sparkles. 

This component extends standard Markdown to include YAML front matter assigned variables, wiki style links, accessibility aware images and more. 

It is a little heavy (currently about 1mb, 372k gzipped), but it has a lot of "batteries included" features.

## Usage

Install via npm: 

```bash
npm install @lnsy/mark-down
```

Import the component into your project.

```js
import "@lnsy/mark-down";
```

or import via cdn: 

```js
import "https://cdn.jsdelivr.net/npm/@lnsy/mark-down/dist/mark-down.min.js"
```

or include as a regular script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@lnsy/mark-down/dist/mark-down.min.js"></script>
```

Then, use the `<mark-down>` custom element in your HTML.

### Loading External Files

Use the `src` attribute to fetch and render a remote Markdown file.

```html
<mark-down src="./path/to/your/file.md"></mark-down>
```

### Inline Markdown

You can also place Markdown directly inside the element.

```html
<mark-down>
  # My Document Title

  This is a paragraph with some **bold** and _italic_ text.
</mark-down>
```

---

# Features

The `<mark-down>` element supports standard Markdown syntax with some extras.

### YAML Front Matter

You can include a YAML block at the top of your Markdown to define metadata. This data is automatically parsed and attached as attributes to the `<mark-down>` element itself.

**Example:**

```markdown
---
title: My Awesome Document
author: John Doe
version: 1.2.3
---

# Document Content

This document is titled "${title}" and was written by ${author}.
```

The `title`, `author`, and `version` attributes will be set on the `<mark-down>` element, which you can inspect in the DOM.


### Slide Show

You can create a simple presentation by enabling the slide show mode. When active, the component will treat horizontal rules (`---`) as slide separators.

To enable it, add `updated: 2025-10-30T11:09:45.897467
updated: 2025-10-30T11:11:37.643255
slide-show: true` to your YAML front matter.

**Example:**

```markdown
---
updated: 2025-10-30T11:09:45.897467
updated: 2025-10-30T11:11:37.643255
slide-show: true
title: "My Presentation"
---

# Slide 1

This is the content of the first slide.

---

# Slide 2

And this is the second slide.
```

This will render the content as a slideshow, with navigation controls to move between slides. All other YAML front matter attributes are still applied to the `<mark-down>` element as usual.


### Variable Substitution

Variables defined in the YAML front matter can be injected directly into your Markdown content using a `${ }` format.

**Example:**

Given the front matter:
```yaml
---
username: Alex
status: active
---
```

This Markdown:
```markdown
User **${username}** is currently **${status}**.
```

Will be rendered as:
> User **Alex** is currently **active**.

### Custom Themes

For your convenience we use css variables to adjust color and sizes.

Override these variables in your css to change how it looks: 

```css
:root {  
  --background-color: #FFF8E7;            
  --foreground-color: #5b4931;
  --neutral-bg-color: #d7d0c5;    
  --neutral-fg-color: #5e5550;        
  --highlight-color: #FE7400;     
  --secondary-color: #564c2e;     
  --trinary-color: #475569;   
  --markdown-max-width: 40rem;  
  --markdown-aside-width: 20rem;  
  --code-secondary-highlight-color: var(--secondary-color);
  --code-foreground-color: var(--fg-color);
  --code-background-color: var(--neutral-bg-color);
  --code-highlight-color: var(--trinary-color);
  --code-neutral-color: var(--neutral-fg-color);
  --h1-font-size: 2rem;
  --h2-font-size: 1.8rem;
  --h3-font-size: 1.5rem;
  --font-size: 1.0rem;
  --line-height: 1.618rem;
}

```


### Task Lists

Create GitHub-style task lists. When a user clicks a checkbox, the component emits a `checkbox-clicked` custom event.

You can listen for this event to handle checkbox state changes. The event `detail` object contains the `content` of the clicked line and its `lineNumber` (0-indexed) in the source markdown.

**Example Event Listener:**

```javascript
document.querySelector('mark-down').addEventListener('checkbox-clicked', (e) => {
  console.log('Checkbox clicked:', e.detail);
  // e.g., { content: '- [ ] Write documentation', lineNumber: 2 }
});
```

**Example Markdown:**

```markdown
- [x] Complete initial setup
- [ ] Write documentation
- [ ] Deploy to production
```

renders

- [x] Complete initial setup
- [ ] Write documentation
- [ ] Deploy to production


### Wiki Style Links

Create internal links using the `[[Page Name]]` syntax, similar to Obsidian or TiddlyWiki. This is useful for creating links to other documents within the same site.

**Basic Links**

By default, `[[My Page]]` will generate a link to `/My%20Page.html`.

**Example:**
```markdown
This document links to another page: [[Getting Started]].
```

**Aliased Links**

To use different display text for a link, use a pipe `|` to separate the display text from the link target: `[[display text|link-target]]`.

**Example:**
```markdown
This is a link to [[a different page|Another Page]].
```
This will render a link with the text "a different page" that points to `Another%20Page.html`.

**Customizing Link Behavior**

You can customize the link behavior by setting the `wikilinks-search-prefix` attribute. If set, the link will become a search query instead of a direct link to an HTML file.

**Example with `wikilinks-search-prefix="q"`:**
```html
<mark-down wikilinks-search-prefix="q">
  This is a link to [[Another Page]].
</mark-down>
```
This will generate a link to `/?q=Another%20Page`. The same applies to aliased links.

### Asides

Create side notes or callouts using a `:::` block. This is useful for highlighting important information.

**Example:**

:::
This is an aside. It can contain any other Markdown content, including lists, links, and code blocks.
:::


```markdown
:::
This is an aside. It can contain any other Markdown content, including lists, links, and code blocks.
:::
```


### Figure with Caption

Convert embedded images in wiki-style format with a caption on the next line into a `<figure>` with a `<figcaption>`.


![[https://placehold.co/600x400/EEE/31343C]] this is alt text
this is a caption


**Example:**


```md
![[this-is-an-image.png]] this is alt text
this is a caption
```


would compile to:
```html
<figure>
  <img src="this-is-an-image.png" alt="this is alt text">
  <figcaption>this is a caption</figcaption>
</figure>
```

This feature supports `.jpg`, `.jpeg`, `.webp`, `.png`, and `.mp4` file endings.

### Citations

Add attributions or citations using the `cite:` marker.

**Example:**

```markdown
> The only thing we have to fear is fear itself.
cite: Franklin D. Roosevelt
```

**generates**
> The only thing we have to fear is fear itself.
cite: Franklin D. Roosevelt

### Footnotes

Add footnotes to your text for citations or additional information.

**Example:**

```markdown
Here is some text with a footnote.[^1]

[^1]: This is the footnote content.
```

This will render the footnote at the bottom of the document.

Here is some text with a footnote.[^5]

[^5]: This is the footnote content.


### Abbreviations

Define abbreviations with their expansions, then write the short form in your text. At render time, occurrences are converted to semantic <abbr> elements with a title attribute.

How to define
- Place one definition per line: `*[TERM]: Expansion`
- Definitions can appear anywhere (commonly near the top) and are not shown in the rendered HTML.

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

*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium


HTML is standardized by the W3C.

Notes
- Case-sensitive and whole-word matches.
- Expansions do not occur inside fenced code blocks or inline code spans.

### Subscript and Superscript

Use subscript and superscript notation for chemistry, math, and ordinals.

- Subscript: wrap content with `~` (tilde) — example: `H~2~O`
- Superscript: wrap content with `^` (caret) — example: `E = mc^2^`

**Example Markdown:**

```markdown
Water: H~2~O
Energy: E = mc^2^
Ordinal: 29^th^
```

**Compiles roughly to:**

```html
<p>Water: H<sub>2</sub>O</p>
<p>Energy: E = mc<sup>2</sup></p>
<p>Ordinal: 29<sup>th</sup></p>
```

Water: H~2~O
Energy: E = mc^2^
Ordinal: 29^th^


Notes:
- Works inline alongside other Markdown.
- Does not affect content inside code spans or fenced code blocks.


### Chart Blocks

Create interactive charts using YAML configuration in fenced code blocks. Supports bar charts, scatter plots, line graphs, and donut charts via the [dataroom-charts](https://github.com/DATAROOM-NETWORK/dataroom-charts/) library.

Import the dataroom-chart custom elements:

```html
  <script type="module" src="https://unpkg.com/dataroom-charts@0.0.5/dist/dataroom-charts.min.js"></script>
```


**Example:**

````markdown
```chart
type: bar
width: 500
height: 300
orientation: vertical
data:
  - label: "Q1"
    value: 100
    color: "#ff6b6b"
  - label: "Q2"
    value: 150
    color: "#4ecdc4"
  - label: "Q3"
    value: 200
    color: "#45b7d1"
  - label: "Q4"
    value: 175
    color: "#96ceb4"
```
````

```chart
type: bar
width: 500
height: 300
orientation: vertical
monochrome: true
data:
  - label: "Q1"
    value: 100
    color: "#ff6b6b"
  - label: "Q2"
    value: 150
    color: "#4ecdc4"
  - label: "Q3"
    value: 200
    color: "#45b7d1"
  - label: "Q4"
    value: 175
    color: "#96ceb4"
```

This renders as an interactive `<dataroom-chart>` component with the specified configuration.

**Supported Chart Types:**
- `bar` or `barchart` - Bar charts with vertical/horizontal orientation
- `scatter` or `scatterchart` - Scatter plots with optional bubble sizing
- `line`, `line-graph`, or `linegraph` - Line graphs with multiple series
- `donut` or `donutchart` - Donut charts with optional labels

**Common Attributes:**
- `type`: Chart type (required)
- `width`, `height`: Dimensions in pixels
- `monochrome`: Enable pattern-based monochrome mode for accessibility
- `color`: Override default color scheme
- `data`: Chart data as YAML array

### Network Visualizations

Create interactive network diagrams using the `network` code block syntax. Network visualizations support nodes, edges, and connections with attributes, allowing you to create graph-like diagrams.

Import the network-visualization cusotm html element: 

```html
  <script type="module" src="https://unpkg.com/@lnsy/network-visualization@0.0.1/dist/network-visualization.min.js"></script>

```

**Basic Syntax:**

````markdown
```network
---
attribute: value
---

Node Name:
	Node content here (supports markdown)

Another Node:
	# Header
	Some text

---

(Node Name) --> (Another Node)
```
````

A network block has three sections:
1. **Front Matter** (optional): YAML-style attributes for the entire visualization
2. **Definitions**: Define nodes and edges with their content
3. **Connections**: Define relationships between nodes

**Example with Nodes and Simple Connections:**

````markdown
```network

Database:
	# PostgreSQL
	Stores application data

API Server:
	# Node.js API
	Handles business logic

Frontend:
	# React App
	User interface

---

(Frontend) --> (API Server)
(API Server) --> (Database)
```
````

This creates a visualization with three nodes connected in sequence.

```network
---
---
Database:
  # PostgreSQL
  Stores application data
API Server:
  # Node.js API
  Handles business logic
Frontend:
  # React App
  User interface

---
(Frontend) --> (API Server)
(API Server) --> (Database)
```

**Node Attributes:**

Add visual or data attributes to nodes inline in the connection syntax:

````markdown
```network
---
---

Start:
	Beginning state

End:
	Final state

---

(Start|color:green;size:large) --> (End|color:red;size:small)
```
````

Attributes are specified as `key:value` pairs separated by semicolons after a pipe `|` character.

**Bidirectional Connections:**

Use `<--` for reverse direction:

````markdown
```network
---
---
---

(Client) --> (Server)
(Client) <-- (Server)
```
````

**Complete Example:**

````markdown
```network
---
theme: dark
layout: hierarchical
---

User Interface:
	# Frontend Layer
	React components
	Tailwind CSS

Business Logic:
	# Service Layer  
	Validation
	Authentication

Data Layer:
	# Persistence
	PostgreSQL database

Authentication Edge:
	**OAuth 2.0**
	Secure token-based auth

---

(User Interface|layer:1) --> (Business Logic|layer:2)
(Business Logic) -[Authentication Edge]-> (Data Layer|layer:3)
```
````

This renders as a `<network-visualization>` custom element with `<network-node>` and `<network-edge>` children, ready to be styled and made interactive with custom CSS and JavaScript.

### Code Syntax Highlighting

Code blocks are automatically highlighted using `highlight.js`. The language is auto-detected, but you can also specify it.

**Example:**

````markdown
```javascript
function greet() {
  console.log("Hello, world!");
}
```
````

renders:

```javascript
function greet() {
  console.log("Hello, world!");
}
```

### Print Ready Style Sheets

Reasonable print style sheets for easy printing / PDF production.

### Load New Markdown File By Setting `src` attribute

When you use setAttribute on the `src` attribute the component will 
fetch the new file and re-render the content.

```html
<mark-down id="mark_down" src="old-file.md"></mark-down>
<script>
  mark_down.setAttribute("src", "new-file.md")
</script>

```

---




# Local Development

### Output Filename

You can customize the build output by creating a `.env` file in the root of the project.

To change the name of the output file, set the `OUTPUT_FILE_NAME` variable in your `.env` file.

**.env**
```
OUTPUT_FILE_NAME=my-custom-filename.js
```

If this variable is not set, the output file will default to `dist/main.min.js`.

### Development Server Port

You can also change the development server port by setting the `PORT` variable in your `.env` file.

**.env**
```
PORT=8080
```

If this variable is not set, the port will default to `3000`.

## Running the Project

To run the project in development mode, use the following command:

```bash
npm run start
```

This will start a development server. By default, it runs on port 3000. You can view the project in your browser.

## Building the Project

To build the project for production, use the following command:

```bash
npm run build
```

This will create a `dist` folder with the bundled and optimized files.
