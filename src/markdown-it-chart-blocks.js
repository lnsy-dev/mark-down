/**
 * Markdown-it plugin for processing chart code blocks
 * @fileoverview Converts ```chart blocks with YAML content to dataroom-chart HTML components
 */

import yaml from 'js-yaml';

/**
 * Converts YAML chart configuration to dataroom-chart HTML attributes
 * @param {Object} config - Parsed YAML configuration object
 * @return {string} HTML string for dataroom-chart element
 */
function yamlToDataroomChart(config) {
  const attributes = [];
  
  // Handle required type attribute
  if (config.type) {
    attributes.push(`type="${config.type}"`);
  }
  
  // Handle dimension attributes
  if (config.width) {
    attributes.push(`width="${config.width}"`);
  }
  if (config.height) {
    attributes.push(`height="${config.height}"`);
  }
  
  // Handle chart-specific attributes
  if (config.orientation) {
    attributes.push(`orientation="${config.orientation}"`);
  }
  if (config.monochrome !== undefined) {
    attributes.push(`monochrome="${config.monochrome}"`);
  }
  if (config.color) {
    attributes.push(`color="${config.color}"`);
  }
  if (config['line-width']) {
    attributes.push(`line-width="${config['line-width']}"`);
  }
  if (config.radius) {
    attributes.push(`radius="${config.radius}"`);
  }
  if (config['min-radius']) {
    attributes.push(`min-radius="${config['min-radius']}"`);
  }
  if (config['max-radius']) {
    attributes.push(`max-radius="${config['max-radius']}"`);
  }
  if (config.labels !== undefined) {
    attributes.push(`labels="${config.labels}"`);
  }
  
  const attributeString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
  
  // Handle data - either inline or as element content
  let chartContent = '';
  if (config.data) {
    const dataJson = JSON.stringify(config.data);
    chartContent = dataJson;
  }
  
  return `<dataroom-chart${attributeString}>${chartContent}</dataroom-chart>`;
}

/**
 * Custom renderer for chart fenced code blocks
 * @param {Object} md - Markdown-it instance
 * @return {Function} Renderer function
 */
function chartBlockRenderer(md) {
  const originalFenceRenderer = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  return function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    
    // Check if this is a chart block
    if (info === 'chart') {
      try {
        // Parse the YAML content
        const yamlContent = token.content.trim();
        const config = yaml.load(yamlContent);
        
        // Convert to dataroom-chart HTML
        return yamlToDataroomChart(config) + '\n';
      } catch (error) {
        console.error('Error parsing chart YAML:', error);
        // Fall back to original renderer on error
        return originalFenceRenderer(tokens, idx, options, env, self);
      }
    }
    
    // Use original renderer for non-chart blocks
    return originalFenceRenderer(tokens, idx, options, env, self);
  };
}

/**
 * Markdown-it plugin for chart blocks
 * @param {Object} md - Markdown-it instance
 * @param {Object} options - Plugin options
 */
export default function chartBlocksPlugin(md, options = {}) {
  // Override the fence renderer to handle chart blocks
  md.renderer.rules.fence = chartBlockRenderer(md);
}