# Polymath MegaBlaster MCP

Full-stack, 100% local developer toolkit exposed as MCP tools — networking, encoding/hashing, config formats, text diff, arbitrary-precision math, date arithmetic, statistics, and more. Runs as a local process on your own machine. **No network calls, no telemetry, no API keys, no account. 100% free and open source — nothing in this repo is gated.**

## Why

Most "AI dev tool" MCP servers either charge a subscription or call out to a remote API. This one doesn't call the network at all — every tool is pure local computation. Verify it yourself: read `src/tools.js`, there's no `fetch`/`http` import anywhere in it.

It also targets documented LLM weak spots directly — multi-digit arithmetic, calendar/leap-year math, and multi-value statistics are all things models get wrong by "reasoning" about them instead of computing exactly.

## Install

**Note:** this package is not yet published to the npm registry, so `npx polymath-megablaster-mcp` won't work until that happens. The install method that works right now is running it from a local clone of this repo:

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

Add that to your MCP client's config (Claude Desktop, etc.) and restart it.

**Once published to npm**, the simpler no-clone install will work instead:

```json
{
  "mcpServers": {
    "polymath": {
      "command": "npx",
      "args": ["-y", "polymath-megablaster-mcp"]
    }
  }
}
```

## Tools (27, all free)

- **Networking**: `calc_subnet`, `check_ip_type`
- **Encoding**: `format_json`, `decode_jwt`, `base64_encode`, `base64_decode`, `hash_text`
- **Scheduling**: `parse_cron`
- **Generators**: `generate_uuid`, `convert_timestamp`, `parse_date`, `convert_color`
- **Diff & config**: `diff_text`, `convert_config_format` (JSON/YAML/TOML)
- **Computation** (fixes documented LLM weak spots): `calculate` (arbitrary-precision
  math), `count_tokens` (GPT tokenizer, for context-budget management), `date_add`,
  `date_diff`, `convert_timezone`, `compute_statistics` (mean/median/stdev/percentiles),
  `convert_unit` (length/weight/volume/temperature), `haversine_distance` (exact
  great-circle distance), `factorial`/`permutations`/`combinations` (arbitrary-precision,
  avoids float64 overflow), `convert_base` (decimal/hex/binary/octal),
  `levenshtein_distance` (exact string similarity/edit distance)

## A note on the paid add-on

There's a separate **Polymath (MegaBlaster Pro)** add-on (HMAC, semver compare, AES encrypt/decrypt) sold as a paid one-time unlock. It's **not gated by a license key check in this code** — a real code-based license check can't work for a genuinely local, open-source tool (there's no server to verify against, and anyone can read the source and bypass it). Instead, the pro tools are a separate small package only distributed through the actual point of sale — the gate is the storefront, not the code. This repo has nothing to do with that gate; everything here is unconditionally free.

## Development

```
npm install
npm test        # unit tests on the core logic + real MCP protocol integration tests
node src/index.js   # run the server directly (waits on stdin)
```

## License

MIT. Source fully open — that's the actual trust story here, not a marketing claim.
