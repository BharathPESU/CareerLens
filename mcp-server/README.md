# CareerLens MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes the CareerLens AI capabilities as tools, enabling AI coding assistants like [OpenCode](https://opencode.ai) to call them directly.

## Tools

| Tool | Description |
|---|---|
| `analyze_resume` | Analyze a resume for ATS compatibility, readability, keyword density, impact, and overall quality |
| `analyze_skill_gap` | Perform a skill gap analysis between a candidate's current skills and a target role |
| `generate_career_recommendations` | Generate personalized career path recommendations from a user profile |
| `generate_interview_questions` | Generate interview questions with model answers for a specific role |
| `optimize_resume` | Optimize a resume for a target role with keyword and ATS feedback |

## Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

## Setup

```bash
# 1. Install dependencies
cd mcp-server
npm install

# 2. Build the TypeScript server
npm run build
```

## Connecting to OpenCode

The repository root contains an `opencode.json` that registers this server automatically when you run OpenCode inside the project:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "careerlens": {
      "type": "local",
      "command": "node",
      "args": ["./mcp-server/dist/server.js"],
      "env": {
        "GEMINI_API_KEY": "${GEMINI_API_KEY}"
      }
    }
  }
}
```

Make sure the `GEMINI_API_KEY` environment variable is set before starting OpenCode:

```bash
export GEMINI_API_KEY=your_api_key_here
opencode
```

## Running manually (for testing)

```bash
cd mcp-server
GEMINI_API_KEY=your_api_key_here npm start
```

The server communicates over **stdio** (standard input/output), which is the default MCP transport used by OpenCode and most MCP clients.

## Development

```bash
cd mcp-server
npm run dev   # runs directly with tsx (no build step needed)
```
