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
            const expression = query.replace(/calc\./i, '').split('.').join(' ')
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

    // Timezone lookup
    timezone: async (query) => {
        const location = query.replace(/timezone\./i, '').split('.').join(' ')
        const prompt = `What is the current timezone for ${location}? Reply with timezone name and UTC offset only (e.g., "EST UTC-5").`
        return await callAI(prompt, 'timezone')
    },

    // Currency conversion
    convert: async (query) => {
        const parts = query.replace(/convert\./i, '').split('.')
        const [amount, from, to] = parts
        const prompt = `Convert ${amount} ${from} to ${to}. Reply with just the converted amount and currency (e.g., "100 USD = 85 EUR").`
        return await callAI(prompt, 'conversion')
    },

    // Quick spelling check
    spell: async (query) => {
        const word = query.replace(/spell\./i, '').split('.').join(' ')
        const prompt = `Is "${word}" spelled correctly? If not, provide the correct spelling. Reply in format: "Correct" or "Incorrect: [correct spelling]".`
        return await callAI(prompt, 'spell')
    },

    // Historical events
    onthisday: async (query) => {
        const date = query.replace(/onthisday\./i, '').split('.').join(' ')
        const prompt = `What significant event happened on ${date}? Reply with one brief historical fact.`
        return await callAI(prompt, 'history')
    },

    // Quick unit conversions
    unit: (query) => {
        try {
            const input = query.replace(/unit\./i, '').split('.').join(' ')
            // mathjs supports unit conversions!
            const result = evaluate(input)
            return { answer: `${input} = ${result}`, cached: false, handler: 'unit' }
        } catch (error) {
            return { answer: `Conversion error: ${error.message}`, cached: false, handler: 'unit' }
        }
    },

    // Acronym decoder
    acronym: async (query) => {
        const abbr = query.replace(/acronym\./i, '').split('.').join(' ')
        const prompt = `What does the acronym "${abbr}" stand for? Provide the most common meaning in one sentence.`
        return await callAI(prompt, 'acronym')
    },

    // Quick reminders/tips
    tip: async (query) => {
        const topic = query.replace(/tip\./i, '').split('.').join(' ')
        const prompt = `Give one practical tip about ${topic} in one sentence.`
        return await callAI(prompt, 'tip')
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
        const commands = 'Commands: calc translate code timezone convert spell onthisday unit acronym tip weather fact define stats help'
        return { answer: commands, cached: false, handler: 'help' }
    }
}

async function callAI(prompt, category = 'general') {
    try {
        const result = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 100
            }
        })
        const answer = result.text || 'No response generated.'
        if (answer.length > CONFIG.MAX_RESPONSE_LENGTH) {
            answer = answer.substring(0, CONFIG.MAX_RESPONSE_LENGTH - 3) + '...'
        }

        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1

        return { answer, cached: false, handler: 'ai' }
    } catch (error) {
        console.log(`AI API Error: ${error.message}`)
        stats.errors++
        throw error
    }
}