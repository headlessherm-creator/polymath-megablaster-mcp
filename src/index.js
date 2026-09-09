#!/usr/bin/env node
'use strict';

// polymath-megablaster-mcp — full-stack 100% local developer toolkit exposed as MCP tools.
// No network calls, no telemetry, no API keys. Fully open source, all tools free.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as t from './tools.js';

const server = new McpServer({ name: 'polymath-megablaster-mcp', version: '2.0.0' });

function text(obj) {
  return { content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }] };
}
function errorResult(e) {
  return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
}

function tool(name, description, schema, fn) {
  server.registerTool(name, { description, inputSchema: schema }, async (args) => {
    try {
      return text(fn(args));
    } catch (e) {
      return errorResult(e);
    }
  });
}

// ===== ALL TOOLS FREE — fully open source, nothing gated in code =====

tool('calc_subnet', 'Calculate subnet details (network, broadcast, usable hosts, mask) from a CIDR like 192.168.1.0/24', {
  cidr: z.string().describe('IPv4 address or CIDR, e.g. "192.168.1.0/24"'),
}, ({ cidr }) => t.calcSubnet(cidr));

tool('check_ip_type', 'Check if an IPv4 address is private/reserved and identify which range it falls in', {
  ip: z.string().describe('IPv4 address, e.g. "192.168.1.1"'),
}, ({ ip }) => t.checkIpType(ip));

tool('format_json', 'Pretty-print or minify a JSON string', {
  json: z.string().describe('Raw JSON text'),
  mode: z.enum(['pretty', 'minify']).optional().describe('Output mode, default pretty'),
}, ({ json, mode }) => t.formatJson(json, mode));

tool('decode_jwt', 'Decode a JWT (header + payload + expiry check) without verifying the signature', {
  token: z.string().describe('JWT string (three dot-separated base64url parts)'),
}, ({ token }) => t.decodeJwt(token));

tool('base64_encode', 'Encode text as base64', {
  text: z.string(),
}, ({ text: input }) => ({ base64: t.base64Encode(input) }));

tool('base64_decode', 'Decode a base64 string to text', {
  base64: z.string(),
}, ({ base64 }) => ({ text: t.base64Decode(base64) }));

tool('hash_text', 'Compute a hash digest of text (md5, sha1, sha256, sha384, sha512)', {
  text: z.string(),
  algo: z.enum(['md5', 'sha1', 'sha256', 'sha384', 'sha512']).optional(),
}, ({ text: input, algo }) => ({ algo: algo || 'sha256', digest: t.hashText(input, algo) }));

tool('parse_cron', 'Parse a 5-field cron expression and compute the next N run times', {
  expression: z.string().describe('Cron expression, e.g. "*/15 9-17 * * 1-5"'),
  count: z.number().int().min(1).max(50).optional().describe('Number of future run times to return, default 5'),
}, ({ expression, count }) => t.parseCron(expression, count));

tool('generate_uuid', 'Generate one or more random UUID v4 values', {
  count: z.number().int().min(1).max(100).optional().describe('How many UUIDs to generate, default 1'),
}, ({ count }) => ({ uuids: t.generateUuid(count) }));

tool('convert_timestamp', 'Convert a Unix timestamp (seconds or ms) to ISO 8601, or get the current time if omitted', {
  timestamp: z.union([z.string(), z.number()]).optional(),
}, ({ timestamp }) => t.convertTimestamp(timestamp));

tool('parse_date', 'Parse a human/ISO date string into ISO 8601 and Unix timestamp forms', {
  date: z.string().describe('Date string, e.g. "2026-01-01" or "Jan 1 2026"'),
}, ({ date }) => t.parseDateString(date));

tool('convert_color', 'Convert a color between hex, rgb(), and hsl() formats', {
  color: z.string().describe('Color in hex (#rrggbb), rgb(r,g,b), or hsl(h,s%,l%) form'),
}, ({ color }) => t.convertColor(color));

tool('diff_text', 'Line-by-line diff of two text blocks, returning added/removed/unchanged lines', {
  a: z.string().describe('Original text'),
  b: z.string().describe('Modified text'),
}, ({ a, b }) => t.diffText(a, b));

tool('convert_config_format', 'Convert config data between JSON, YAML, and TOML', {
  input: z.string(),
  from: z.enum(['json', 'yaml', 'yml', 'toml']),
  to: z.enum(['json', 'yaml', 'yml', 'toml']),
}, ({ input, from, to }) => ({ output: t.convertConfigFormat(input, from, to) }));

// ===== FREE TIER: computation (fixes documented LLM weak spots) =====

tool('calculate', 'Evaluate an arbitrary-precision math expression exactly (fixes LLM multi-digit arithmetic errors). Supports +,-,*,/,^,sqrt(),sin(),log(), etc.', {
  expression: z.string().describe('Math expression, e.g. "123456789 * 987654321" or "sqrt(2)^10"'),
}, ({ expression }) => t.calculate(expression));

tool('count_tokens', 'Count tokens in text using the GPT-3.5/4 (cl100k_base) tokenizer — useful for managing context budget before sending a large prompt', {
  text: z.string(),
}, ({ text: input }) => t.countTokens(input));

tool('date_add', 'Add or subtract days/weeks/months/years/businessDays from a date, handling leap years and month boundaries correctly', {
  date: z.string().describe('ISO 8601 date/datetime, e.g. "2026-03-03"'),
  amount: z.number().int().describe('Positive or negative integer amount'),
  unit: z.enum(['days', 'weeks', 'months', 'years', 'businessDays']),
}, ({ date, amount, unit }) => t.dateAdd(date, amount, unit));

tool('date_diff', 'Compute the exact difference between two dates in days, business days, and hours', {
  a: z.string().describe('First ISO 8601 date/datetime'),
  b: z.string().describe('Second ISO 8601 date/datetime'),
}, ({ a, b }) => t.dateDiff(a, b));

tool('convert_timezone', 'Convert a UTC/ISO date into a formatted date+time string for any IANA time zone', {
  date: z.string().describe('ISO 8601 date/datetime'),
  timeZone: z.string().describe('IANA time zone name, e.g. "America/New_York", "Asia/Tokyo"'),
}, ({ date, timeZone }) => t.convertTimezone(date, timeZone));

tool('compute_statistics', 'Compute mean, median, stdev, variance, min/max, and percentiles (25/75/90) for a list of numbers', {
  numbers: z.array(z.number()).min(1).describe('Array of numbers'),
}, ({ numbers }) => t.computeStatistics(numbers));

tool('convert_unit', 'Convert a value between units of length, weight, volume, or temperature (fixes LLM unit-math errors)', {
  value: z.union([z.string(), z.number()]),
  fromUnit: z.string().describe('e.g. "km", "lb", "celsius", "gal"'),
  toUnit: z.string().describe('e.g. "mi", "kg", "fahrenheit", "l"'),
}, ({ value, fromUnit, toUnit }) => t.convertUnit(value, fromUnit, toUnit));

tool('haversine_distance', 'Compute exact great-circle distance in km/miles between two lat/long coordinates', {
  lat1: z.number(), lon1: z.number(), lat2: z.number(), lon2: z.number(),
}, ({ lat1, lon1, lat2, lon2 }) => t.haversineDistance(lat1, lon1, lat2, lon2));

tool('factorial', 'Compute n! exactly using arbitrary-precision integer math (avoids float64 overflow past ~18)', {
  n: z.number().int().min(0).max(10000),
}, ({ n }) => t.factorial(n));

tool('permutations', 'Compute nPr (permutations) exactly using arbitrary-precision integer math', {
  n: z.number().int().min(0), r: z.number().int().min(0),
}, ({ n, r }) => t.permutations(n, r));

tool('combinations', 'Compute nCr (combinations) exactly using arbitrary-precision integer math', {
  n: z.number().int().min(0), r: z.number().int().min(0),
}, ({ n, r }) => t.combinations(n, r));

tool('convert_base', 'Convert a number between decimal, hex, binary, and octal', {
  value: z.union([z.string(), z.number()]),
  fromBase: z.enum(['decimal', 'hex', 'binary', 'octal']),
  toBase: z.enum(['decimal', 'hex', 'binary', 'octal']),
}, ({ value, fromBase, toBase }) => t.convertBase(value, fromBase, toBase));

tool('levenshtein_distance', 'Compute exact edit distance and similarity ratio between two strings (deterministic fuzzy matching)', {
  a: z.string(), b: z.string(),
}, ({ a, b }) => t.levenshteinDistance(a, b));

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('polymath-megablaster-mcp running on stdio (fully open source, all tools free)');
