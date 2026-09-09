# Polymath MegaBlaster MCP

A local MCP toolkit that gives AI agents deterministic calculation instead of guessing. 27 free tools: exact math, precise date/calendar arithmetic, unit conversion, hashing, encoding, networking, and more. 100% local, no network calls, no telemetry, no API keys. Fully open source.

## The problem this solves

LLMs are known to get arithmetic, calendar math, and multi-digit calculations wrong when they compute "by reasoning" instead of by actual execution. Confident and wrong is worse than an error message. This toolkit gives an AI agent real deterministic functions to call instead, so answers about subnet math, dates, statistics, base conversion, and more come from actual code execution, not a guess dressed up as an answer.

## Why local

Most AI dev tool MCP servers either charge a subscription or call out to a remote API. This one never touches the network. Every tool is pure local computation, verifiable in the source: read `src/tools.js`, there is no `fetch` or `http` import anywhere in it.

## Install

Clone this repo and run it directly:

```bash
git clone https://github.com/headlessherm-creator/polymath-megablaster-mcp.git
cd polymath-megablaster-mcp
npm install
```

Then point your MCP client at the local path:

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

Add that to your MCP client's config (Claude Desktop, Cursor, etc.) and restart it.

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

## Development

```
npm install
npm test        # unit tests on the core logic plus real MCP protocol integration tests
node src/index.js   # run the server directly (waits on stdin)
```

## License

MIT. Source fully open, that's the actual trust story here, not a marketing claim.

## Pro features

4 additional tools (`hmac_text`, `compare_semver`, `aes_encrypt`, `aes_decrypt`) are available as a paid one-time unlock: **Polymath MegaBlaster Pro**. [Link to be added once the storefront is live.]

## Tags

mcp, model-context-protocol, ai-agent-tools, deterministic-computation, llm-tools, ai-coding-assistant, vibe-coding, claude-mcp, cursor-mcp, local-first, offline-tools, developer-utilities, no-hallucination, exact-math, subnet-calculator, cron-parser, date-math, unit-converter, base64, jwt-decoder, uuid-generator
