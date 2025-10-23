#!/usr/bin/env node

/**
 * Command-line markdown compiler
 * @fileoverview Compiles markdown files to HTML using all configured plugins
 * Usage: node md-compile.js input.md [--template template.html] [--output output.html]
 */

import { readFile, writeFile } from 'fs/promises';
import { parseDataroomMarkup } from './src/mark-down-helpers.js';
import { resolve } from 'path';

/**
 * Parses command line arguments
 * @return {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node md-compile.js <input.md> [options]

Options:
  --template <file>    HTML template file with <mark-down> tag
  --output <file>      Output file (default: stdout)
  --help, -h           Show this help message

Examples:
  node md-compile.js README.md
  node md-compile.js README.md --template template.html --output output.html
    `);
    process.exit(0);
  }

  const result = {
    input: args[0],
    template: null,
    output: null
  };

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--template' && i + 1 < args.length) {
      result.template = args[i + 1];
      i++;
    } else if (args[i] === '--output' && i + 1 < args.length) {
      result.output = args[i + 1];
      i++;
    }
  }

  return result;
}

/**
 * Replaces <mark-down> tag in template with compiled markdown
 * @param {string} template - HTML template content
 * @param {string} compiledHtml - Compiled markdown HTML
 * @return {string} Template with markdown inserted
 */
function insertIntoTemplate(template, compiledHtml) {
  // Match <mark-down> tag with any attributes
  const markdownTagRegex = /<mark-down[^>]*>[\s\S]*?<\/mark-down>/gi;
  
  // If no closing tag found, try self-closing
  if (!markdownTagRegex.test(template)) {
    const selfClosingRegex = /<mark-down[^>]*\/>/gi;
    return template.replace(selfClosingRegex, compiledHtml);
  }
  
  return template.replace(markdownTagRegex, compiledHtml);
}

/**
 * Main compiler function
 */
async function compile() {
  try {
    const args = parseArgs();
    
    // Read the markdown file
    const inputPath = resolve(args.input);
    const markdownContent = await readFile(inputPath, 'utf-8');
    
    // Parse markdown with all plugins
    const parsed = await parseDataroomMarkup(markdownContent.trim(), {});
    let output = parsed.html;
    
    // If template is provided, insert compiled markdown into it
    if (args.template) {
      const templatePath = resolve(args.template);
      const templateContent = await readFile(templatePath, 'utf-8');
      output = insertIntoTemplate(templateContent, parsed.html);
    }
    
    // Write to output file or stdout
    if (args.output) {
      const outputPath = resolve(args.output);
      await writeFile(outputPath, output, 'utf-8');
      console.error(`✓ Compiled ${args.input} to ${args.output}`);
    } else {
      console.log(output);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

compile();
