# Polymath MegaBlaster MCP — Deterministic Math, Date, Unit Conversion & Networking Tools for AI Agents

A free, local, 16-tool MCP server that gives AI agents exact, deterministic answers for math, date arithmetic, unit conversion, subnet/networking calculations, statistics, token counting, and real random UUID generation — no network calls, no API keys, no telemetry.

If your AI agent is miscounting days between dates, rounding large numbers incorrectly, getting unit conversions slightly wrong, or messing up subnet/CIDR math, this MCP server exists specifically to fix that class of problem.

## The problem this solves

Local and open-weight models (Llama, Qwen, Mistral, etc.) are consistently unreliable at exact math, date arithmetic, unit conversion, and similar deterministic tasks — they "reason" their way to an answer instead of computing it, and get it subtly wrong. (Frontier hosted models like Claude and GPT-4 already handle most of this correctly unaided — this toolkit is aimed at closing the gap for smaller/local models, not replacing what those already do well.) Every tool here uses classical deterministic methods instead of model reasoning, so the answer is always exactly right.

**Everyday things it fixes:**
- Exact math on huge numbers, no float rounding errors
- Correct date math, including leap years and "last day of the month" edge cases
- Unit conversion (km/miles, °C/°F, kg/lb) without approximation
- Subnet/CIDR math for networking tasks
- Great-circle distance between coordinates

**More technical tools:**
- Arbitrary-precision arithmetic, factorials, permutations, combinations (no float64 overflow)
- Statistics (mean, median, stdev, variance, percentiles) on a list of numbers
- Base conversion (decimal, hex, binary, octal)
- Levenshtein edit distance and similarity ratio (deterministic fuzzy matching)
- IANA-aware time zone conversion
- GPT tokenizer-based token counting, so an agent can manage its own context budget
- Real cryptographically-random UUID (v4) generation — LLMs reliably fabricate plausible-looking but non-random, potentially colliding UUID strings instead

## Why local

Most AI dev tool MCP servers either charge a subscription or call out to a remote API. This one never touches the network. Every tool is pure local computation, verifiable directly in the source: open `src/tools.js` — there is no `fetch` or `http` import anywhere in it.

## Setup

**1. Install Node.js** (v18+) if you don't have it: https://nodejs.org

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

## Tools (16, all free)

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
  a large prompt), `generate_uuid` (real cryptographically-random v4 UUIDs, 1-100 at a time)

## Dependencies

- [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk): the MCP protocol implementation
- [`zod`](https://www.npmjs.com/package/zod): input schema validation
- [`mathjs`](https://www.npmjs.com/package/mathjs): arbitrary-precision math evaluation
- [`gpt-tokenizer`](https://www.npmjs.com/package/gpt-tokenizer): GPT tokenizer for `count_tokens`

All installed automatically by `npm install`. None of them make network calls at runtime.

## Keywords

deterministic math MCP server, MCP date calculator, MCP unit converter, subnet CIDR calculator MCP, local MCP server no API key, Claude MCP math tools, AI agent exact arithmetic, token counter MCP server.

## Related tools

Same local-first philosophy, different problems:
- [json-mender-mcp](https://github.com/headlessherm-creator/json-mender-mcp) — fix malformed JSON, validate JSON Schema, test regex
- [hiring-mender-mcp](https://github.com/headlessherm-creator/hiring-mender-mcp) — BambooHR + Greenhouse ATS write tools, one vocabulary
- [helpdesk-mender-mcp](https://github.com/headlessherm-creator/helpdesk-mender-mcp) — Zendesk + Freshdesk + Help Scout write tools, one vocabulary

## License

MIT
