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

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
const cache = new NodeCache({ stdTTL: CONFIG.CACHE_TTL }) // standard Time-To-Live - which defines the default expiration time (in seconds) for every item added to the cache.
const rateLimitMap = new Map()
const stats = {
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    byCategory: {}
}

// ============================================
// SPECIALIZED HANDLERS
// ============================================

const handlers = {
    // Math calculations
    calc: (query) => {
        try {
            const expression = query.replace(/calc\./i, '').split('.').join(' ') // query.replace(/calc\./i, '') - Removes the calc. prefix(case-insensitive) using regex
            const result = evaluate(expression)
            return { answer: `${expression} = ${result}`, cached: false, handler: 'calc' }
        } catch (error) {
            return { answer: `Math error: ${error.message}`, cached: false, handler: 'calc' }
        }
    },

    // Translation
    translate: async (query) => {
        const parts = query.replace(/translate\./i, '').split('.')
        const [from, to, ...words] = parts
        const text = words.join(' ')

        const prompt = `Translate "${text}" from ${from} to ${to}. Reply with ONLY the translation, no explanations.`
        return await callAI(prompt, 'translation')
    },

    // Code snippets
    code: async (query) => {
        const request = query.replace(/code\./i, '').split('.').join(' ')
        const prompt = `Provide a one-line code snippet for: ${request}. Format as: language: code`
        return await callAI(prompt, 'code')
    },

    // IP lookup for locations
    ip: async (query) => {
        const location = query.replace(/ip\./i, '').split('.').join(' ')
        const prompt = `What is a common public DNS server IP for ${location}? Reply with ONLY the IP address.`
        return await callAI(prompt, 'ip')
    },

    // Weather (conceptual - would need real API)
    weather: async (query) => {
        const location = query.replace(/weather\./i, '').split('.').join(' ')
        const prompt = `Describe the typical weather in ${location} in one sentence.`
        return await callAI(prompt, 'weather')
    },

    // Fun facts
    fact: async (query) => {
        const topic = query.replace(/fact\./i, '').split('.').join(' ')
        const prompt = `Share one interesting fact about ${topic} in one sentence.`
        return await callAI(prompt, 'fact')
    },

    // Define words
    define: async (query) => {
        const word = query.replace(/define\./i, '').split('.').join(' ')
        const prompt = `Define "${word}" in one concise sentence.`
        return await callAI(prompt, 'definition')
    },

    // System commands
    stats: () => {
        const summary = `Queries:${stats.totalQueries} Cache:${stats.cacheHits}/${stats.totalQueries} Errors:${stats.errors}`
        return { answer: summary, cached: false, handler: 'stats' }
    },

    help: () => {
        const commands = 'Commands: calc math translate code ip weather fact define stats help'
        return { answer: commands, cached: false, handler: 'help' }
    }
}