# Agent Context Architect

A visual tool to build AGENTS.md files for AI coding assistants (Cursor, GitHub Copilot, Windsurf).

Configure your project's mission, tech stack, and rules - then generate a context file that guides AI agents to write better code.

## Features

- **Visual Configuration**: Build your agent context through an intuitive UI
- **LLM Helper Prompts**: Copy prompts to use with any LLM of your choice (ChatGPT, Claude, Gemini, etc.)
- **JSON Import**: Paste LLM responses directly to auto-fill configuration fields
- **Export Options**: Download as AGENTS.md or copy system prompts for different AI tools

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

## Build for Production

```bash
npm run build
npm run preview
```

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch.

### Setup Instructions

1. Go to your repository settings on GitHub
2. Navigate to **Pages** in the left sidebar
3. Under **Source**, select **GitHub Actions**
4. Push changes to the main branch to trigger the deployment

The site will be available at: `https://voku.github.io/your_agent_config/`

### Manual Deployment

The deployment workflow can also be triggered manually:
1. Go to the **Actions** tab in your repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## How It Works

1. Fill in your project details in the left panel
2. Use the "LLM Helpers" tab to generate suggestions using your preferred LLM
3. Copy the generated prompts and paste them into ChatGPT, Claude, or any other LLM
4. Import the JSON responses back into the tool
5. Download your AGENTS.md file or copy the system prompt
