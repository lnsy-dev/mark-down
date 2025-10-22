/**
 * markdown-it plugin for parsing network visualization code blocks
 * 
 * Converts code blocks with language "network" into custom HTML elements
 * with network-node and network-edge components
 * 
 * @param {object} md - markdown-it instance
 */
export default function networkVisualizationPlugin(md) {
  const defaultFenceRenderer = md.renderer.rules.fence.bind(md.renderer.rules);

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    
    if (token.info.trim() === 'network') {
      return parseNetworkBlock(token.content);
    }
    
    return defaultFenceRenderer(tokens, idx, options, env, self);
  };
}

/**
 * Parse the content of a network code block
 * 
 * @param {string} content - The raw content of the network block
 * @returns {string} HTML string for the network visualization
 */
function parseNetworkBlock(content) {
  const lines = content.split('\n');
  let frontMatter = {};
  let nodes = [];
  let edges = [];
  let connections = [];
  
  let currentSection = null; // 'frontmatter', 'definitions', 'connections'
  let currentItem = null;
  let currentItemContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect front matter boundaries
    if (line.trim() === '---') {
      if (currentSection === null) {
        currentSection = 'frontmatter';
        continue;
      } else if (currentSection === 'frontmatter') {
        currentSection = 'definitions';
        continue;
      } else if (currentSection === 'definitions') {
        currentSection = 'connections';
        continue;
      }
    }
    
    // Parse front matter
    if (currentSection === 'frontmatter') {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        frontMatter[match[1]] = match[2];
      }
      continue;
    }
    
    // Parse definitions (nodes and edges)
    if (currentSection === 'definitions') {
      // Check if line starts a new node/edge (no leading whitespace)
      if (line.length > 0 && !line.match(/^\s/)) {
        // Save previous item
        if (currentItem) {
          saveItem(currentItem, currentItemContent, nodes, edges);
        }
        
        // Start new item
        currentItem = line.replace(':', '').trim();
        currentItemContent = [];
      } else if (line.trim().length > 0) {
        // Content line (indented)
        currentItemContent.push(line.replace(/^\t/, ''));
      }
      continue;
    }
    
    // Parse connections
    if (currentSection === 'connections') {
      if (line.trim().length > 0) {
        connections.push(line.trim());
      }
    }
  }
  
  // Save last item
  if (currentItem) {
    saveItem(currentItem, currentItemContent, nodes, edges);
  }
  
  // Parse attributes from connections
  const nodeAttributes = parseConnectionAttributes(connections);
  
  return generateHTML(frontMatter, nodes, edges, connections, nodeAttributes);
}

/**
 * Save a parsed item as either a node or edge
 * 
 * @param {string} name - Name of the node or edge
 * @param {string[]} contentLines - Content lines for this item
 * @param {array} nodes - Array to add nodes to
 * @param {array} edges - Array to add edges to
 */
function saveItem(name, contentLines, nodes, edges) {
  const content = contentLines.join('\n');
  const html = parseMarkdownContent(content);
  
  // Determine if this is an edge (contains "Edge" in name) or a node
  if (name.toLowerCase().includes('edge')) {
    edges.push({ name, html });
  } else {
    nodes.push({ name, html });
  }
}

/**
 * Parse markdown content within node/edge definitions
 * Simple parser for headers and paragraphs
 * 
 * @param {string} content - Markdown content
 * @returns {string} HTML content
 */
function parseMarkdownContent(content) {
  const lines = content.split('\n');
  let html = '';
  let currentParagraph = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('#')) {
      // Flush current paragraph
      if (currentParagraph.length > 0) {
        html += `\t\t<p>${currentParagraph.join(' ')}</p>\n`;
        currentParagraph = [];
      }
      
      // Parse header
      const match = trimmed.match(/^(#+)\s*(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        html += `\t\t<h${level}>${text}</h${level}>\n`;
      }
    } else if (trimmed.length > 0) {
      currentParagraph.push(trimmed);
    } else if (currentParagraph.length > 0) {
      // Empty line flushes paragraph
      html += `\t\t<p>${currentParagraph.join(' ')}</p>\n`;
      currentParagraph = [];
    }
  }
  
  // Flush remaining paragraph
  if (currentParagraph.length > 0) {
    html += `\t\t<p>${currentParagraph.join(' ')}</p>\n`;
  }
  
  return html;
}

/**
 * Parse attributes from connection syntax
 * 
 * @param {array} connections - Array of connection strings
 * @returns {object} Map of node names to their attributes
 */
function parseConnectionAttributes(connections) {
  const nodeAttributes = {};
  
  for (const connection of connections) {
    // Match node references with attributes: (Node Name|attr1:val1;attr2:val2)
    const nodePattern = /\(([^|)]+)(?:\|([^)]+))?\)/g;
    let match;
    
    while ((match = nodePattern.exec(connection)) !== null) {
      const nodeName = match[1].trim();
      const attributesStr = match[2];
      
      if (attributesStr) {
        const attrs = {};
        const attrPairs = attributesStr.split(';');
        
        for (const pair of attrPairs) {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            attrs[key] = value;
          }
        }
        
        // Merge attributes if node already has some
        if (nodeAttributes[nodeName]) {
          Object.assign(nodeAttributes[nodeName], attrs);
        } else {
          nodeAttributes[nodeName] = attrs;
        }
      }
    }
  }
  
  return nodeAttributes;
}

/**
 * Generate the final HTML output
 * 
 * @param {object} frontMatter - Parsed front matter attributes
 * @param {array} nodes - Array of node objects
 * @param {array} edges - Array of edge objects
 * @param {array} connections - Array of connection strings
 * @param {object} nodeAttributes - Map of node names to their attributes
 * @returns {string} Complete HTML string
 */
function generateHTML(frontMatter, nodes, edges, connections, nodeAttributes) {
  let html = '<network-visualization';
  
  // Add front matter as attributes
  for (const [key, value] of Object.entries(frontMatter)) {
    html += ` ${key}="${value}"`;
  }
  
  html += '>\n';
  
  // Add nodes
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    html += `\t<network-node id="${i}" name="${node.name}"`;
    
    // Add attributes from connections if they exist
    if (nodeAttributes[node.name]) {
      for (const [key, value] of Object.entries(nodeAttributes[node.name])) {
        html += ` ${key}="${value}"`;
      }
    }
    
    html += '>\n';
    html += node.html;
    html += `\t</network-node>\n`;
    if (i < nodes.length - 1 || edges.length > 0) {
      html += '\t\n';
    }
  }
  
  // Add edges
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    html += `\t<network-edge name="${edge.name}">\n`;
    html += edge.html;
    html += `\t</network-edge>\n`;
  }
  
  html += '</network-visualization>';
  
  return html;
}
