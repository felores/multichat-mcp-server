#!/usr/bin/env node

import dotenv from "dotenv";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import OpenAI from 'openai';

dotenv.config();

const AI_CHAT_BASE_URL = process.env.AI_CHAT_BASE_URL;
const AI_CHAT_KEY = process.env.AI_CHAT_KEY;
const AI_CHAT_MODEL = process.env.AI_CHAT_MODEL;
const AI_CHAT_NAME = process.env.AI_CHAT_NAME;

if (!AI_CHAT_BASE_URL) {
  console.error("AI_CHAT_BASE_URL is required");
  process.exit(1);
}

if (!AI_CHAT_KEY) {
  console.error("AI_CHAT_KEY is required");
  process.exit(1);
}

if (!AI_CHAT_MODEL) {
  console.error("AI_CHAT_MODEL is required");
  process.exit(1);
}

if (!AI_CHAT_NAME) {
  console.error("AI_CHAT_NAME is required");
  process.exit(1);
}
const AI_CHAT_NAME_CLEAN = AI_CHAT_NAME.toLowerCase().replace(' ', '-');

let server: Server;
let transport: StdioServerTransport;

try {
  server = new Server(
    {
      name: "any-chat-completions-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {},
      },
    }
  );

  /**
   * Handler for listing resources.
   */
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [],
    };
  });

  /**
   * Handler for reading the contents of a specific resource.
   */
  server.setRequestHandler(ReadResourceRequestSchema, async () => {
    throw new Error(`Resource not found`);
  });

  /**
   * Handler that lists available tools.
   * Exposes a single "chat" tool that lets clients chat with another AI.
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: `chat-with-${AI_CHAT_NAME_CLEAN}`,
          description: `Text chat with ${AI_CHAT_NAME}`,
          inputSchema: {
            type: "object",
            properties: {
              content: {
                type: "string",
                description: `The content of the chat to send to ${AI_CHAT_NAME}`,
              }
            },
            required: ["content"]
          }
        }
      ]
    };
  });

  /**
   * Handler for the chat tool.
   * Connects to an OpenAI SDK compatible AI Integration.
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      switch (request.params.name) {
        case `chat-with-${AI_CHAT_NAME_CLEAN}`: {
          const content = String(request.params.arguments?.content);
          if (!content) {
            throw new Error("Content is required");
          }

          const client = new OpenAI({
            apiKey: AI_CHAT_KEY,
            baseURL: AI_CHAT_BASE_URL,
          });

          try {
            const chatCompletion = await client.chat.completions.create({
              messages: [{ role: 'user', content: content }],
              model: AI_CHAT_MODEL,
            });

            return {
              content: [
                {
                  type: "text",
                  text: chatCompletion.choices[0]?.message?.content || "No response from AI"
                }
              ]
            };
          } catch (apiError: unknown) {
            console.error("OpenAI API error:", apiError);
            const errorMessage = apiError instanceof Error ? apiError.message : "Unknown error";
            return {
              content: [
                {
                  type: "text",
                  text: `Error communicating with ${AI_CHAT_NAME}: ${errorMessage}`
                }
              ]
            };
          }
        }

        default:
          throw new Error("Unknown tool");
      }
    } catch (error: unknown) {
      console.error("Error in tool call handler:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error processing request: ${errorMessage}`
          }
        ]
      };
    }
  });

  /**
   * Handler that lists available prompts.
   */
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: []
    };
  });

  /**
   * Handler for the get prompt.
   */
  server.setRequestHandler(GetPromptRequestSchema, async () => {
    throw new Error("Unknown prompt");
  });

} catch (setupError) {
  console.error("Error during server setup:", setupError);
  process.exit(1);
}

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  try {
    transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP server started successfully!");
  } catch (error) {
    console.error("Server connection error:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
process.on('uncaughtException', (error) => {
  console.error("Uncaught exception:", error);
  handleShutdown();
});
process.on('unhandledRejection', (reason) => {
  console.error("Unhandled rejection:", reason);
  handleShutdown();
});

async function handleShutdown() {
  console.error("Shutting down MCP server...");
  try {
    if (server) {
      if (transport) {
        transport.close?.();
      }
    }
  } catch (error) {
    console.error("Error during server shutdown:", error);
  } finally {
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});


