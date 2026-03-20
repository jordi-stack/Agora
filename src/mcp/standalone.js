#!/usr/bin/env node
import 'dotenv/config'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { initMCP } from './server.js'

const mcpServer = await initMCP(process.env.WDK_SEED)
await mcpServer.connect(new StdioServerTransport())
