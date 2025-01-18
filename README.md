# any-chat-completions-mcp MCP Server

Integrate Claude with Any OpenAI SDK Compatible Chat Completion API - OpenAI, Perplexity, Groq, xAI, PyroPrompts and more.

This implements the Model Context Protocol Server. Learn more: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)

## Quick Start with npx

The fastest way to get started is using npx by adding the server config to Claude Desktop:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `C:\Users\NAME\AppData\Roaming\Claude\claude_desktop_config.json`

This is an example implementing the OpenAI o1 preview model and Perplexity, but you can include any compatible provider or model:

```json
{
  "mcpServers": {
    "chat-openai": {
      "command": "npx",
      "args": [
        "@felores/multichat-mcp-server"
      ],
      "env": {
        "AI_CHAT_KEY": "OPENAI_KEY",
        "AI_CHAT_NAME": "OpenAI",
        "AI_CHAT_MODEL": "o1-preview",
        "AI_CHAT_BASE_URL": "https://api.openai.com/v1"
      }
    },
    "chat-perplexity": {
      "command": "npx",
      "args": [
        "@felores/multichat-mcp-server"
      ],
      "env": {
        "AI_CHAT_KEY": "PERPLEXITY_KEY",
        "AI_CHAT_NAME": "Perplexity",
        "AI_CHAT_MODEL": "llama-3.1-sonar-small-128k-online",
        "AI_CHAT_BASE_URL": "https://api.perplexity.ai"
      }
    }
  }
}
```

## Alternative Installation Methods

### Local Development

If you want to contribute or modify the server, you can install it locally:

```bash
git clone https://github.com/felores/multichat-mcp-server.git
cd multichat-mcp-server
npm install
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

To add OpenAI to Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `C:\Users\NAME\AppData\Roaming\Claude\claude_desktop_config.json`

```json

{
  "mcpServers": {
    "chat-openai": {
      "command": "node",
      "args": [
        "/path/to/any-chat-completions-mcp/build/index.js"
      ],
      "env": {
        "AI_CHAT_KEY": "OPENAI_KEY",
        "AI_CHAT_NAME": "OpenAI",
        "AI_CHAT_MODEL": "gpt-4o",
        "AI_CHAT_BASE_URL": "https://api.openai.com/v1"
      }
    }
  }
}
```

You can add multiple providers by referencing the same MCP server multiple times, but with different env arguments:

```json

{
  "mcpServers": {
    "chat-pyroprompts": {
      "command": "node",
      "args": [
        "/path/to/any-chat-completions-mcp/build/index.js"
      ],
      "env": {
        "AI_CHAT_KEY": "PYROPROMPTS_KEY",
        "AI_CHAT_NAME": "PyroPrompts",
        "AI_CHAT_MODEL": "ash",
        "AI_CHAT_BASE_URL": "https://api.pyroprompts.com/openaiv1"
      }
    },
    "chat-perplexity": {
      "command": "node",
      "args": [
        "/path/to/any-chat-completions-mcp/build/index.js"
      ],
      "env": {
        "AI_CHAT_KEY": "PERPLEXITY_KEY",
        "AI_CHAT_NAME": "Perplexity",
        "AI_CHAT_MODEL": "llama-3.1-sonar-small-128k-online",
        "AI_CHAT_BASE_URL": "https://api.perplexity.ai"
      }
    },
    "chat-openai": {
      "command": "node",
      "args": [
        "/path/to/any-chat-completions-mcp/build/index.js"
      ],
      "env": {
        "AI_CHAT_KEY": "OPENAI_KEY",
        "AI_CHAT_NAME": "OpenAI",
        "AI_CHAT_MODEL": "gpt-4o",
        "AI_CHAT_BASE_URL": "https://api.openai.com/v1"
      }
    }
  }
}
```

With these three, you'll see a tool for each in the Claude Desktop Home:

![Claude Desktop Home with Chat Tools](img/claude_desktop_home.png)

And then you can chat with other LLMs and it shows in chat like this:

![Claude Chat with OpenAI](img/claude_chat_openai.png)

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.