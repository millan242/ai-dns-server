import 'dotenv/config'
import { startUdpServer, createResponse, createTxtAnswer } from 'denamed'
import { GoogleGenAI } from "@google/genai"
import NodeCache from 'node-cache'
import { createHash } from 'crypto'
import { evaluate } from 'mathjs'

const CONFIG = {
    PORT: process.env.DNS_PORT || 8000,
    CACHE_TTL: 3600, // 1 hour
    MAX_RESPONSE_LENGTH: 255, // DNS TXT record limit
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    RATE_LIMIT_MAX: 100 // requests per minute
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not set in environment variables')
    process.exit(1)
}