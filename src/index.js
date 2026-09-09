#!/usr/bin/env node
'use strict';

// polymath-megablaster-mcp: local deterministic-computation MCP server for AI agents.
// v3: scoped down to computation only — exact math, dates, units, stats, networking
// math — after auditing that commodity dev-utilities (JSON/JWT/hash/cron/etc.)
// were already covered by larger existing bundles. See
// MCP_AND_AI_TOOL_OPPORTUNITY_RESEARCH.md for the competitor research behind this.
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

// ===== ALL TOOLS FREE, fully open source, nothing gated in code =====

tool('calc_subnet', 'Calculate subnet details (network, broadcast, usable hosts, mask) from a CIDR like 192.168.1.0/24', {
  cidr: z.string().describe('IPv4 address or CIDR, e.g. "192.168.1.0/24"'),
}, ({ cidr }) => t.calcSubnet(cidr));

tool('check_ip_type', 'Check if an IPv4 address is private/reserved and identify which range it falls in', {
  ip: z.string().describe('IPv4 address, e.g. "192.168.1.1"'),
}, ({ ip }) => t.checkIpType(ip));

// ===== computation (fixes documented LLM weak spots) =====

tool('calculate', 'Evaluate an arbitrary-precision math expression exactly (fixes LLM multi-digit arithmetic errors). Supports +,-,*,/,^,sqrt(),sin(),log(), etc.', {
  expression: z.string().describe('Math expression, e.g. "123456789 * 987654321" or "sqrt(2)^10"'),
}, ({ expression }) => t.calculate(expression));

tool('count_tokens', 'Count tokens in text using the GPT-3.5/4 (cl100k_base) tokenizer. Useful for managing context budget before sending a large prompt', {
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
