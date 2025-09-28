# Mark-Down Element

An opinionated, dependency-free web component that parses and renders Markdown with a suite of advanced features. Drop it into any project to bring rich text formatting to your content.

This component extends standard Markdown to include YAML Front Matter, wikilinks, task lists, asides, and more, making it a versatile tool for documentation, note-taking apps, and content-heavy websites.

It styles your markdown using [tufte-css](https://edwardtufte.github.io/tufte-css/) for good initial styles.

## Installation

Clone the repository and install the dependencies.

```bash
git clone git@github.com:lnsy-dev/pochade-js.git
npm install
```

## Usage

Import the component into your project.

```js
import "@lnsy/mark-down";
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

### Two-Way Binding with an Editor

The `<mark-down>` element can be linked to a text editor for live previews. By providing an `editor-id`, the component will listen for changes from the specified editor and update the rendered output in real-time.

```html
<!-- Editor Element -->
<lnsy-edit id="my-editor">
# Initial Markdown
- list item
</lnsy-edit>

<!-- Live Preview -->
<mark-down editor-id="my-editor"></mark-down>
```

## Features

The `<mark-down>` element supports standard Markdown syntax and includes several powerful extensions.

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

This document is titled "$title" and was written by $author.
```

The `title`, `author`, and `version` attributes will be set on the `<mark-down>` element, which you can inspect in the DOM.

### Variable Substitution

Variables defined in the YAML front matter can be injected directly into your Markdown content using a `$` prefix.

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
User **$username** is currently **$status**.
```

Will be rendered as:
> User **Alex** is currently **active**.

### Task Lists

Create GitHub-style task lists. When used with an `editor-id`, clicking a checkbox will update the source Markdown in the connected editor.

**Example:**

```markdown
- [x] Complete initial setup
- [ ] Write documentation
- [ ] Deploy to production
```

renders

- [x] Complete initial setup
- [ ] Write documentation
- [ ] Deploy to production


### Wikilinks

Create internal links using the `[[Page Name]]` syntax, similar to Obsidian or TiddlyWiki.

By default, `[[My Page]]` will generate a link to `/My Page.html`.

**Example:**

```markdown
This document links to another page: [[Getting Started]].
```

You can customize the link behavior by setting the `wikilinks-search-prefix` attribute. If set, the link will become a search query.

**Example with `wikilinks-search-prefix="q"`:**

```html
<mark-down wikilinks-search-prefix="q">
  This is a link to [[Another Page]].
</mark-down>
```

This will generate a link to `/?q=Another%20Page`.

### Asides

Create side notes or callouts using a `:::` block. This is useful for highlighting important information.

**Example:**

:::
This will be rendered inside an `<aside>` HTML tag.
:::


```markdown
:::
This is an aside. It can contain any other Markdown content, including lists, links, and code blocks.
:::
```


### Figure with Caption

Convert embedded images in wiki-style format with a caption on the next line into a `<figure>` with a `<figcaption>`.


![[https://placehold.co/600x400/EEE/31343C]]
this is a caption


**Example:**

```markdown
![[this-is-an-image.png]]
this is a caption
```

would compile to:
```html
<figure><img src="this-is-an-image.png"><figcaption>this is a caption</figcaption></figure>
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

## Customizing the Build

You can customize the build output by creating a `.env` file in the root of the project.

### Output Filename

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
