# Polymath MegaBlaster MCP

Polymath MegaBlaster is the calculator your Agent keeps in its back pocket.

AI models are bad at math, unit conversions, and a dozen other things a pocket calculator does perfectly.

This is a local toolkit of 27 free tools that gives AI agents a way to offload the kinds of computations reasoning models generally do not do very well. Deterministic in, deterministic out. 100% local, no network calls, no telemetry, no API keys. Fully open source.

**Useful things it does:**
- Does exact math on huge numbers without rounding errors
- Figures out dates correctly, including leap years and "the last day of the month" edge cases everyone gets wrong
- Converts between units (km/miles, C/F, kg/lb) without approximating
- Works out subnet math for networking
- Generates real random UUIDs instead of made-up-looking ones
- Diffs two blocks of text and tells you exactly what changed

**More technical things it does:**
- Arbitrary-precision arithmetic, factorials, permutations, combinations (avoids float64 overflow)
- Statistics (mean, median, stdev, variance, percentiles) on a list of numbers
- Cron expression parsing with computed next-run times
- JWT decoding, base64 encode/decode, hashing (md5/sha1/sha256/sha384/sha512)
- Haversine great-circle distance between coordinates
- JSON/YAML/TOML conversion
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

## Tools (27, all free)

- **Deterministic math**: `calculate` (arbitrary-precision expression evaluator),
  `factorial`, `permutations`, `combinations` (all arbitrary-precision, avoid float64
  overflow), `compute_statistics` (mean, median, stdev, variance, percentiles)
- **Date and time**: `date_add`, `date_diff` (leap years, month boundaries, business
  days handled correctly), `convert_timestamp`, `parse_date`, `convert_timezone`
- **Conversion**: `convert_unit` (length, weight, volume, temperature), `convert_base`
  (decimal, hex, binary, octal), `convert_color` (hex, rgb, hsl), `convert_config_format`
  (JSON, YAML, TOML)
- **Networking**: `calc_subnet` (CIDR math), `check_ip_type` (private/reserved range
  lookup)
- **Encoding and hashing**: `format_json`, `decode_jwt`, `base64_encode`,
  `base64_decode`, `hash_text` (md5/sha1/sha256/sha384/sha512)
- **Text**: `diff_text` (line-level diff), `levenshtein_distance` (exact edit distance
  and similarity ratio)
- **Scheduling**: `parse_cron` (5-field cron parsing, computes next run times)
- **Generators and geo**: `generate_uuid`, `haversine_distance` (exact great-circle
  distance between coordinates)
- **Agent utility**: `count_tokens` (GPT tokenizer, for managing context budget before
  a large prompt)

## Dependencies

- [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk): the MCP protocol implementation
- [`zod`](https://www.npmjs.com/package/zod): input schema validation
- [`mathjs`](https://www.npmjs.com/package/mathjs): arbitrary-precision math evaluation
- [`gpt-tokenizer`](https://www.npmjs.com/package/gpt-tokenizer): GPT tokenizer for `count_tokens`
- [`js-yaml`](https://www.npmjs.com/package/js-yaml): YAML parsing/serialization
- [`smol-toml`](https://www.npmjs.com/package/smol-toml): TOML parsing/serialization

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

mcp, model-context-protocol, mcp-server, ai-agents, developer-tools, deterministic-computation, llm-tools, vibe-coding, local-first, offline-first, no-hallucination, exact-math, subnet-calculator, cron-parser, date-math, unit-converter, base64, jwt-decoder, uuid-generator
