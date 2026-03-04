# 🚀 AI-Powered DNS Server

An advanced DNS server that uses AI to answer questions, perform calculations, translations, and more through DNS TXT records.

## ✨ Features

### 1. **Intelligent Caching**

- Caches responses for 1 hour to reduce API calls
- MD5-based cache keys
- Real-time cache hit rate tracking

### 2. **Specialized Handlers**

#### 🧮 **Math Calculator**

```bash
dig TXT @localhost -p 8000 calc.5.plus.3.times.2
dig TXT @localhost -p 8000 calc.sqrt.16
dig TXT @localhost -p 8000 calc.sin.45.deg
```

#### 🌍 **Translation**

```bash
dig TXT @localhost -p 8000 translate.en.es.hello.world
dig TXT @localhost -p 8000 translate.fr.en.bonjour
```

#### 💻 **Code Snippets**

```bash
dig TXT @localhost -p 8000 code.fibonacci.in.python
dig TXT @localhost -p 8000 code.reverse.string.javascript
```

#### 📖 **Dictionary**

```bash
dig TXT @localhost -p 8000 define.serendipity
dig TXT @localhost -p 8000 define.ephemeral
```

#### 🎲 **Fun Facts**

```bash
dig TXT @localhost -p 8000 fact.black.holes
dig TXT @localhost -p 8000 fact.ancient.egypt
```

#### 🌤️ **Weather Info**

```bash
  dig TXT @localhost -p 8000 convert.100.USD.EUR
  dig TXT @localhost -p 8000 unit.5.meters.to.feet
  dig TXT @localhost -p 8000 timezone.london
  dig TXT @localhost -p 8000 acronym.NASA
  dig TXT @localhost -p 8000 spell.recieve
  dig TXT @localhost -p 8000 onthisday.july.20
  dig TXT @localhost -p 8000 tip.productivity
dig TXT @localhost -p 8000 weather.new.york
```

#### 🌍 **Timezone Lookup**

```bash
dig TXT @localhost -p 8000 timezone.tokyo
dig TXT @localhost -p 8000 timezone.new.york
```

#### 💱 **Currency Conversion**

```bash
dig TXT @localhost -p 8000 convert.100.USD.EUR
dig TXT @localhost -p 8000 convert.50.GBP.JPY
```

#### ✏️ **Spelling Check**

```bash
dig TXT @localhost -p 8000 spell.recieve
dig TXT @localhost -p 8000 spell.necessary
```

#### 📅 **Historical Events**

```bash
dig TXT @localhost -p 8000 onthisday.july.20
dig TXT @localhost -p 8000 onthisday.december.25
```

#### 📏 **Unit Conversions**

```bash
dig TXT @localhost -p 8000 unit.5.meters.to.feet
dig TXT @localhost -p 8000 unit.100.celsius.to.fahrenheit
```

#### 🔤 **Acronym Decoder**

```bash
dig TXT @localhost -p 8000 acronym.NASA
dig TXT @localhost -p 8000 acronym.API
```

#### 💡 **Quick Tips**

```bash
dig TXT @localhost -p 8000 tip.productivity
dig TXT @localhost -p 8000 tip.javascript
```

### 3. **System Commands**

#### 📊 **Statistics**

```bash
dig TXT @localhost -p 8000 stats
```

Returns query count, cache performance, and error count.

#### ❓ **Help**

```bash
dig TXT @localhost -p 8000 help
```

Lists available commands.

### 4. **Rate Limiting**

- 100 requests per minute per IP
- Automatic cleanup of old entries
- Protects against abuse

### 5. **Advanced Logging**

- Timestamps for every query
- Client IP tracking
- Handler type identification
- Periodic statistics reports

### 6. **Response Optimization**

- Automatic truncation to DNS limits (255 chars)
- Smart formatting
- Error handling with fallbacks

## 🎯 Use Cases

### 1. **Development & DevOps**

- Quick calculations without leaving terminal
- Code snippet lookup
- IP address references
- System monitoring stats

### 2. **Education**

- Quick fact checking
- Word definitions
- Math problem solving
- Learning tool for students

### 3. **Multi-language Support**

- Rapid translations
- Language learning aid
- International communication

### 4. **API Alternative**

- No HTTP client needed
- Works through firewalls
- Minimal dependencies
- Can be queried from any system with DNS

### 5. **IoT & Embedded Systems**

- Lightweight query interface
- Minimal overhead
- Works on constrained devices
- No complex HTTP parsing

### 6. **Security & Privacy**

- Local deployment option
- No external APIs for cached queries
- Rate limiting built-in
- Query logging for audit

## 📦 Installation

```bash
npm install
```

Create `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
DNS_PORT=8000
```

## 🚀 Running

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## 🔧 Configuration

Edit `CONFIG` object in `index.js`:

```javascript
const CONFIG = {
  PORT: 8000, // DNS server port
  CACHE_TTL: 3600, // Cache time in seconds
  MAX_RESPONSE_LENGTH: 255, // DNS TXT limit
  RATE_LIMIT_WINDOW: 60000, // Rate limit window (ms)
  RATE_LIMIT_MAX: 100, // Max requests per window
};
```

## 🎨 Extending with Custom Handlers

Add your own handlers to the `handlers` object:

```javascript
handlers.myhandler = async (query) => {
  const input = query
    .replace(/myhandler\./i, "")
    .split(".")
    .join(" ");
  // Your logic here
  return {
    answer: "Your response",
    cached: false,
    handler: "myhandler",
  };
};
```

## 📊 Monitoring

Server logs stats every 5 minutes:

- Total queries processed
- Cache hit rate percentage
- Error count
- Breakdown by category

## 🔒 Security Considerations

1. **Rate Limiting**: Prevents abuse (currently 100 req/min per IP)
2. **Input Sanitization**: Query parsing prevents injection
3. **Error Handling**: Graceful degradation on failures
4. **API Key Security**: Stored in environment variables

## 🚦 Future Enhancements

- [ ] Database integration (PostgreSQL/Redis)
- [ ] WebSocket interface for real-time updates
- [ ] Multi-model AI support (Claude, GPT-4, etc.)
- [ ] DNSSEC support
- [ ] Web dashboard for monitoring
- [ ] Plugin system for community handlers
- [ ] Webhook notifications
- [ ] Prometheus metrics export
- [ ] Docker containerization
- [ ] Kubernetes deployment configs

## 🛠️ Advanced Use Cases

### Integration with CI/CD

```bash
# In your build script
ANSWER=$(dig TXT @dns-server -p 8000 code.fix.eslint.error +short)
echo $ANSWER
```

### Chatbot Backend

Use as a knowledge base for chatbots via DNS queries.

### Monitoring & Alerting

```bash
# Check system status
dig TXT @localhost -p 8000 stats +short
```

### Education Platform

Students can query facts and definitions without internet browsing.

### Smart Home

IoT devices can query information using minimal resources.

## 📝 Notes

- DNS TXT records have a 255-character limit
- Responses are automatically truncated if needed
- Cache reduces API costs significantly
- All queries are logged with timestamps
- Rate limiting protects against abuse

## 🤝 Contributing

1. Add new handlers in the `handlers` object
2. Test with `dig` commands
3. Update documentation
4. Submit pull request

## 📄 License

MIT
