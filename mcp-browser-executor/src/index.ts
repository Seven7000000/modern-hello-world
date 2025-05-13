#!/usr/bin/env node

/**
 * Browser MCP server that provides browser automation capabilities
 * - Navigate to URL
 * - Get page content
 * - Take screenshot
 * - Click elements
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import puppeteer from "puppeteer";
import { HttpServerTransport } from "./http-transport.js";

// Create an MCP server with capabilities for tools
const server = new Server(
  {
    name: "mcp-browser-executor",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Browser instance and page
let browser: puppeteer.Browser | null = null;
let page: puppeteer.Page | null = null;

// Handler that lists available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "goto",
        description: "Navigate to a URL",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL to navigate to"
            }
          },
          required: ["url"]
        }
      },
      {
        name: "content",
        description: "Get the HTML content of the current page",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "screenshot",
        description: "Take a screenshot of the current page",
        inputSchema: {
          type: "object",
          properties: {
            fullPage: {
              type: "boolean",
              description: "Whether to take a screenshot of the full page or just the viewport"
            }
          }
        }
      },
      {
        name: "click",
        description: "Click an element on the page",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "CSS selector of the element to click"
            }
          },
          required: ["selector"]
        }
      }
    ]
  };
});

// Initialize browser
async function ensureBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  
  if (!page) {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  }
  
  return { browser, page };
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = request.params.name;
  const args = request.params.arguments || {};

  try {
    await ensureBrowser();
    
    if (!page) {
      throw new Error("Failed to initialize browser page");
    }

    switch (tool) {
      case "goto": {
        const url = String(args.url);
        
        try {
          await page.goto(url, { waitUntil: 'networkidle2' });
          return {
            content: [{
              type: "text",
              text: `Successfully navigated to ${url}`
            }]
          };
        } catch (err: any) {
          throw new Error(`Failed to navigate: ${err.message}`);
        }
      }
      
      case "content": {
        try {
          const content = await page.content();
          return {
            content: [{
              type: "text",
              text: content
            }]
          };
        } catch (err: any) {
          throw new Error(`Failed to get content: ${err.message}`);
        }
      }
      
      case "screenshot": {
        try {
          const fullPage = Boolean(args.fullPage);
          const screenshot = await page.screenshot({ 
            encoding: 'base64',
            fullPage
          });
          
          return {
            content: [{
              type: "text",
              text: `data:image/png;base64,${screenshot}`
            }]
          };
        } catch (err: any) {
          throw new Error(`Failed to take screenshot: ${err.message}`);
        }
      }
      
      case "click": {
        try {
          const selector = String(args.selector);
          await page.click(selector);
          
          return {
            content: [{
              type: "text",
              text: `Successfully clicked element with selector: ${selector}`
            }]
          };
        } catch (err: any) {
          throw new Error(`Failed to click element: ${err.message}`);
        }
      }
      
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  } catch (error: any) {
    console.error(`Error in tool ${tool}:`, error);
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Close browser when server exits
process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});

// Start the server
async function main() {
  try {
    // Check if HTTP transport is enabled
    const useHttp = process.env.USE_HTTP === 'true' || process.env.HTTP_PORT !== undefined;
    const httpPort = parseInt(process.env.HTTP_PORT || '5004', 10);
    const authToken = process.env.AUTH_TOKEN || 'dev123';
    
    console.error(`Starting browser executor with ${useHttp ? 'HTTP' : 'stdio'} transport ${useHttp ? `on port ${httpPort}` : ''}`);
    console.error(`Auth token: ${authToken}`);
    
    if (useHttp) {
      // Use HTTP transport
      const transport = new HttpServerTransport(httpPort);
      await server.connect(transport);
      console.error(`Browser executor HTTP server started on port ${httpPort}`);
    } else {
      // Use stdio transport (default)
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error('Browser executor stdio server started');
    }
    
    // Initialize the browser
    await ensureBrowser();
    console.error('Browser initialized successfully');
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
}); 