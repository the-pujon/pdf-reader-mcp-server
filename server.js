#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// Use require for CommonJS modules
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - Update this path to your specific PDF or use environment variable
const PDF_PATH = process.env.PDF_PATH || path.join(__dirname, "./pdf/bdFare.pdf");
let pdfContent = null;
let pdfMetadata = null;

// Load PDF content on startup
async function loadPDF() {
  try {
    // Check if file exists
    try {
      await fs.access(PDF_PATH);
    } catch (error) {
      console.error(`PDF file not found at: ${PDF_PATH}`);
      console.error("Please update the PDF_PATH variable to point to your PDF file.");
      return;
    }

    const pdfBuffer = await fs.readFile(PDF_PATH);
    const data = await pdfParse(pdfBuffer);
    
    pdfContent = data.text;
    pdfMetadata = {
      pages: data.numpages,
      filename: path.basename(PDF_PATH),
      info: data.info || {}
    };
    
    console.error(`PDF loaded: ${pdfMetadata.filename} (${pdfMetadata.pages} pages)`);
  } catch (error) {
    console.error(`Failed to load PDF: ${error.message}`);
    console.error("Make sure the PDF file exists and is readable.");
  }
}

// Create server instance
const server = new Server(
  {
    name: "pdf-reader-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_pdf_content",
        description: "Get the full text content of the loaded PDF document",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "search_pdf",
        description: "Search for specific text within the PDF document",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Text to search for in the PDF"
            },
            case_sensitive: {
              type: "boolean",
              description: "Whether to perform case-sensitive search",
              default: false
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_pdf_info",
        description: "Get metadata and information about the loaded PDF",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "get_pdf_excerpt",
        description: "Get a specific excerpt from the PDF by character range",
        inputSchema: {
          type: "object",
          properties: {
            start: {
              type: "number",
              description: "Starting character position"
            },
            length: {
              type: "number",
              description: "Number of characters to extract",
              default: 1000
            }
          },
          required: ["start"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!pdfContent) {
    return {
      content: [
        {
          type: "text",
          text: "PDF not loaded. Please ensure the PDF file exists at the specified path."
        }
      ]
    };
  }

  switch (name) {
    case "get_pdf_content":
      return {
        content: [
          {
            type: "text",
            text: `# PDF Content: ${pdfMetadata.filename}\n\n${pdfContent}`
          }
        ]
      };

    case "search_pdf":
      const query = args.query;
      const caseSensitive = args.case_sensitive || false;
      
      const searchText = caseSensitive ? pdfContent : pdfContent.toLowerCase();
      const searchQuery = caseSensitive ? query : query.toLowerCase();
      
      const matches = [];
      let index = searchText.indexOf(searchQuery);
      
      while (index !== -1) {
        // Get context around the match (50 characters before and after)
        const start = Math.max(0, index - 50);
        const end = Math.min(pdfContent.length, index + searchQuery.length + 50);
        const context = pdfContent.substring(start, end);
        
        matches.push({
          position: index,
          context: context,
          preview: context.replace(/\n/g, ' ').trim()
        });
        
        index = searchText.indexOf(searchQuery, index + 1);
      }

      return {
        content: [
          {
            type: "text",
            text: `# Search Results for "${query}"\n\nFound ${matches.length} matches:\n\n${matches.map((match, i) => 
              `**Match ${i + 1}** (position ${match.position}):\n...${match.preview}...\n`
            ).join('\n')}`
          }
        ]
      };

    case "get_pdf_info":
      return {
        content: [
          {
            type: "text",
            text: `# PDF Information\n\n**Filename:** ${pdfMetadata.filename}\n**Pages:** ${pdfMetadata.pages}\n**Characters:** ${pdfContent.length}\n**Words:** ${pdfContent.split(/\s+/).length}\n\n**PDF Metadata:**\n${JSON.stringify(pdfMetadata.info, null, 2)}`
          }
        ]
      };

    case "get_pdf_excerpt":
      const start = args.start;
      const length = args.length || 1000;
      
      if (start < 0 || start >= pdfContent.length) {
        return {
          content: [
            {
              type: "text",
              text: "Invalid start position. Must be between 0 and " + (pdfContent.length - 1)
            }
          ]
        };
      }
      
      const excerpt = pdfContent.substring(start, start + length);
      
      return {
        content: [
          {
            type: "text",
            text: `# PDF Excerpt (${start}-${start + excerpt.length})\n\n${excerpt}`
          }
        ]
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "pdf://document",
        name: pdfMetadata ? pdfMetadata.filename : "PDF Document",
        description: "The loaded PDF document content",
        mimeType: "text/plain"
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === "pdf://document") {
    if (!pdfContent) {
      throw new Error("PDF not loaded");
    }
    
    return {
      contents: [
        {
          uri: uri,
          mimeType: "text/plain",
          text: pdfContent
        }
      ]
    };
  }
  
  throw new Error(`Unknown resource: ${uri}`);
});

// Start the server
async function main() {
  // Load the PDF first
  await loadPDF();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PDF Reader MCP Server started");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});