# MCP and AI-tool opportunity research

Status: evidence-backed working memo, September 2026.

## Answer

MCP is not the only worthwhile category. OpenAI’s Codex documentation treats project instructions, Skills, MCP, and subagents as complementary layers: Skills package reusable workflows, while MCP connects agents to external tools and systems.[11] Agent Skills are also a real cross-client format: Codex uses them in CLI, IDE, and app form, and Claude Code supports the open Agent Skills standard.[11][12]

Polymath has room to grow only as a **small, local deterministic-computation product**.[unverified] It should not try to win as a general developer-tools bundle or by adding hundreds of utilities.[3][4]

## Why the calculation niche remains valid

- Broad calculator MCPs prove demand but also establish direct competition: MCP Mathematics exposes 52 math functions and 158 unit conversions, while TinyFn advertises 500+ deterministic utilities across math, conversion, validation, hashes, dates, and more.[1][2]
- Those direct competitors are not proven adoption winners: at the time of this research TinyFn had 1 GitHub star and MCP Mathematics had 14.[unverified] GitHub stars are a weak adoption proxy, so this means "no demonstrated moat," not "no users."[unverified]
- More tools can worsen agents rather than help them. AWS specifically warns that too many exposed MCP tools confuse tool selection and can lead to hallucinations.[4]
- RAG-MCP measured 43.13% tool-selection accuracy with retrieval versus 13.62% baseline in its stress test, while reducing prompt tokens by over 50%.[3]
- Redis reports that four ordinary servers reached 167 tools and about 60K initial prompt tokens; its own filtering experiment claimed 98% fewer tool tokens. This is vendor evidence, not independent measurement, but points in the same direction as AWS and RAG-MCP.[5]
- One recent r/mcp post reports a 67% token reduction from lazy schema loading for 12 tools. This is anecdotal community evidence only.[13]

## Current Polymath state

Local verification on this machine: `polymath-megablaster-mcp` registers 27 tools and its complete unit plus MCP-protocol integration test suite passes.[unverified]

Its defensible core is exact arithmetic, date arithmetic, time-zone conversion, statistics, unit conversion, distance, combinatorics, base conversion, and string distance.[unverified] Its current surface also includes generic developer helpers such as JSON formatting, JWT decoding, Base64, UUIDs, cron parsing, hashes, and config conversion.[unverified] The second group weakens a strict "small and curated" position; adding more generic helpers would make that worse.[3][4]

## Competitor map and ruled-out directions

- **Broad deterministic bundle:** reject. TinyFn is the direct 500+ tool competitor, and MCP Mathematics already covers a large math/conversion surface.[1][2]
- **Generic MCP testing:** reject. `mcp-assert` already does protocol linting, assertions, fuzzing, and real transport testing.[7]
- **Generic AI-code validation loop:** reject. Agent Validator runs build, lint, type checks, tests, security scanning, optional AI review, and fix/rerun workflows.[8]
- **Local test receipt:** reject. ProofRun binds executed checks to the current Git state and marks a result stale after code changes.[9]
- **Local agent evidence recorder:** reject. Agent Blackbox already captures terminal output, diffs, test output, and policy matches in a local report.[10]
- **Skill linter/quality checker:** reject. `skill-validator` already validates specification compliance, links, token costs, content quality, and more.
- **Generic MCP configuration doctor:** reject. Community tool `fixmcp` already discovers several client configurations, validates commands/environment, and performs real initialization handshakes; this is anecdotal product evidence, not an adoption measurement.[14]
- **Generic homelab or firewall MCP:** reject for now. Dedicated homelab bundles and a firewall-rule MCP already exist; a product here needs a specific, unserved pre-change failure scenario.

The underlying verification problem is real: Sonar’s 2026 survey of 1,149 respondents reports 95% spend time reviewing, testing, or correcting AI output, and 61% say AI-generated code often looks correct but is unreliable.[6] That does not make generic verification an open product category, because the direct implementations above already exist.

## Recommendation: sharpen Polymath rather than expand it

Position it as:[unverified]

> A small, local deterministic-computation layer for agents. It handles exact calculations and structured transformations that should not be guessed.

The required product rules are:

1. Keep only tools with a documented, repeatable LLM failure mode and deterministic output.[unverified]
2. Do not add random developer conveniences just to increase the count.[3][4]
3. Make tool descriptions and schemas as narrow as possible, because tool selection is part of product quality.[3][4]
4. Build an optional cross-client **Polymath Agent Skill/plugin** that teaches Codex and Claude Code when to call the MCP: money, dates, time zones, conversions, exact counts, and network calculations.[unverified] Skills supply the reusable workflow; Polymath supplies deterministic execution.[11][12]
5. Publish a reproducible benchmark before marketing any performance claim: compare no tools, Polymath, and a broad tool bundle on the same calculation/task-routing prompts using actual models.[unverified] Measure correctness, correct tool selection, and context/tool-definition cost.[3][4]

## Adjacent lanes worth retaining

- **Agent Skills/plugins:** valid distribution and product lane, but only for a workflow with proven repeated value; do not build a generic Skill linter.
- **CLI:** use it instead of MCP when the job is a local deterministic operation that does not need typed, discoverable calls. This is a delivery choice, not a category rivalry.[11]
- **Narrow network pre-change verification:** possible future research because it fits actual IT experience, but no build unless we identify a concrete failure case that current firewall/network tools do not handle.

## Sources

[1] https://github.com/SHSharkar/MCP-Mathematics
[2] https://github.com/tinyfn-io/tinyfn-mcp
[3] https://arxiv.org/html/2505.03275v1
[4] https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-strategies/mcp-tool-strategy.html
[5] https://redis.io/blog/from-reasoning-to-retrieval-solving-the-mcp-tool-overload-problem
[6] https://www.sonarsource.com/state-of-code-developer-survey-report.pdf
[7] https://github.com/blackwell-systems/mcp-assert
[8] https://github.com/Codagent-AI/agent-validator
[9] https://github.com/yebiguo/ProofRun
[10] https://github.com/latifv/agent-blackbox
[11] https://developers.openai.com/codex/concepts/customization
[12] https://developers.openai.com/codex/skills
[13] https://www.reddit.com/r/mcp/comments/1w4o1xg/past_10_mcp_tools_the_agent_started_picking_worse/
[14] https://www.reddit.com/r/mcp/comments/1vy0fix/i_built_a_doctor_for_mcp_configs_it_handshakes/
