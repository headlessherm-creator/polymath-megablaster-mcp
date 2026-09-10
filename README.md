# Polymath MegaBlaster MCP

AI models are bad at math, unit conversions, and at least a dozen other things, Polymath MegaBlaster MCP blasts math, and is here to answer all your questions and be the solution to every single one of your problems.

This is a local toolkit of 15 free tools that give AI agents a way to offload the kinds of computations reasoning models generally do not perform very well, computations are offloaded onto a deterministic calculator that uses classic deterministic methods to ascertain needed values. Deterministic and 100% local, no network calls, no telemetry, no API keys. Fully open source and built lean.

Every tool here exists because it fixes a specific, repeatable way models get math, dates, units, or counts wrong. See [`MCP_AND_AI_TOOL_OPPORTUNITY_RESEARCH.md`](https://github.com/headlessherm-creator/polymath-megablaster-mcp/blob/main/MCP_AND_AI_TOOL_OPPORTUNITY_RESEARCH.md) in this repo for the competitor research behind that decision — plenty of MCP servers already do JSON formatting, JWT decoding, hashing, and cron parsing well, so we don't duplicate that here.

**Useful things it does:**
- Does exact math on huge numbers without rounding errors
- Figures out dates correctly, including leap years and "the last day of the month" edge cases everyone gets wrong
- Converts between units (km/miles, C/F, kg/lb) without approximating
- Works out subnet math for networking
- Computes distance between two coordinates (great-circle, not "as the crow roughly flies")

**More technical things it does:**
- Arbitrary-precision arithmetic, factorials, permutations, combinations (avoids float64 overflow)
- Statistics (mean, median, stdev, variance, percentiles) on a list of numbers
- Base conversion (decimal, hex, binary, octal)
- Levenshtein edit distance and similarity ratio (deterministic fuzzy matching)
- Time zone conversion (IANA zone aware)
- Token counting (GPT tokenizer) so an agent can manage its own context budget

## Why local

Most AI dev tool MCP servers either charge a subscription or call out to a remote API. This one never touches the network. Every tool is pure local computation, verifiable in the source: read `src/tools.js`, there is no `fetch` or `http` import anywhere in it.

## Setup

**1. Install Node.js** (v18 or newer) if you don't have it: https://nodejs.org

**2. Clone this repo and install dependencies:**

```bash
git clone https://github.com/headlessherm-creator/polymath-megablaster-mcp.git
cd polymath-megablaster-mcp
npm install
```

**3. Point your MCP client at the local path:**

```json
{
  "mcpServers": {
    "polymath": {
      "command": "node",
      "args": ["/absolute/path/to/polymath-megablaster-mcp/src/index.js"]
    }
  }
}
```

Add that to your MCP client's config and restart it. Setup docs for common clients:
- Claude Desktop: https://modelcontextprotocol.io/quickstart/user
- Cursor: https://docs.cursor.com/context/model-context-protocol
- Claude Code: https://docs.claude.com/en/docs/claude-code/mcp

## Tools (15, all free)

- **Deterministic math**: `calculate` (arbitrary-precision expression evaluator),
  `factorial`, `permutations`, `combinations` (all arbitrary-precision, avoid float64
  overflow), `compute_statistics` (mean, median, stdev, variance, percentiles)
- **Date and time**: `date_add`, `date_diff` (leap years, month boundaries, business
  days handled correctly), `convert_timezone`
- **Conversion**: `convert_unit` (length, weight, volume, temperature), `convert_base`
  (decimal, hex, binary, octal)
- **Networking**: `calc_subnet` (CIDR math), `check_ip_type` (private/reserved range
  lookup)
- **Text**: `levenshtein_distance` (exact edit distance and similarity ratio)
- **Geo**: `haversine_distance` (exact great-circle distance between coordinates)
- **Agent utility**: `count_tokens` (GPT tokenizer, for managing context budget before
  a large prompt)

## Dependencies

- [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk): the MCP protocol implementation
- [`zod`](https://www.npmjs.com/package/zod): input schema validation
- [`mathjs`](https://www.npmjs.com/package/mathjs): arbitrary-precision math evaluation
- [`gpt-tokenizer`](https://www.npmjs.com/package/gpt-tokenizer): GPT tokenizer for `count_tokens`

All installed automatically by `npm install`. None of them make network calls at runtime.

## Development

```
npm install
npm test        # unit tests on the core logic plus real MCP protocol integration tests
node src/index.js   # run the server directly (waits on stdin)
```

## License

MIT.

## Pro features

4 additional tools (`hmac_text`, `compare_semver`, `aes_encrypt`, `aes_decrypt`) are available as a paid one-time unlock: **Polymath MegaBlaster Pro**. [Link to be added once the storefront is live.]

## Tags

mcp, model-context-protocol, mcp-server, ai-agents, developer-tools, deterministic-computation, llm-tools, vibe-coding, local-first, offline-first, no-hallucination, exact-math, subnet-calculator, date-math, unit-converter
