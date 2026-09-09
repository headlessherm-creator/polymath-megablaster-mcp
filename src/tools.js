// Core logic. Pure functions, no I/O, no network. Ported/adapted from the
// already-tested NetKit/DevKit/QuickUtils Chrome extension logic (same math,
// same edge-case handling), plus new computation-focused categories.
'use strict';

import { create, all } from 'mathjs';
const math = create(all, { number: 'BigNumber', precision: 64 });

// ============================================================
// NETWORKING (ported from NetKit, free tier, undercuts competitors who gate this)
// ============================================================

export function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => Number.isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export function intToIp(int) {
  return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
}

function maskFromPrefix(prefix) {
  if (prefix === 0) return 0;
  return (0xFFFFFFFF << (32 - prefix)) >>> 0;
}

export function calcSubnet(input) {
  input = input.trim();
  let ip, prefixStr;
  if (input.includes('/')) {
    [ip, prefixStr] = input.split('/');
  } else {
    ip = input;
    prefixStr = '32';
  }
  ip = ip.trim();
  const prefix = parseInt(prefixStr.trim(), 10);
  if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error('Prefix must be between 0 and 32');
  }
  const ipInt = ipToInt(ip);
  if (ipInt === null) throw new Error('Invalid IPv4 address');

  const mask = maskFromPrefix(prefix);
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalHosts = 2 ** (32 - prefix);
  let usableHosts, firstHost, lastHost;
  if (prefix >= 31) {
    usableHosts = prefix === 32 ? 1 : 2;
    firstHost = network;
    lastHost = broadcast;
  } else {
    usableHosts = totalHosts - 2;
    firstHost = network + 1;
    lastHost = broadcast - 1;
  }
  const wildcard = (~mask) >>> 0;
  return {
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    netmask: intToIp(mask),
    wildcard: intToIp(wildcard),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalHosts,
    usableHosts: Math.max(usableHosts, 0),
    cidr: `${intToIp(network)}/${prefix}`,
  };
}

const RESERVED_RANGES = [
  { cidr: '10.0.0.0/8', name: 'Private (RFC 1918)' },
  { cidr: '172.16.0.0/12', name: 'Private (RFC 1918)' },
  { cidr: '192.168.0.0/16', name: 'Private (RFC 1918)' },
  { cidr: '127.0.0.0/8', name: 'Loopback' },
  { cidr: '169.254.0.0/16', name: 'Link-local (APIPA)' },
  { cidr: '100.64.0.0/10', name: 'Carrier-grade NAT (RFC 6598)' },
  { cidr: '198.18.0.0/15', name: 'Benchmark testing' },
  { cidr: '192.0.2.0/24', name: 'Documentation (TEST-NET-1)' },
  { cidr: '198.51.100.0/24', name: 'Documentation (TEST-NET-2)' },
  { cidr: '203.0.113.0/24', name: 'Documentation (TEST-NET-3)' },
  { cidr: '224.0.0.0/4', name: 'Multicast' },
  { cidr: '240.0.0.0/4', name: 'Reserved (future use)' },
];

function isInRange(ipInt, cidr) {
  const [rangeIp, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  const mask = maskFromPrefix(prefix);
  const rangeInt = ipToInt(rangeIp);
  return (ipInt & mask) === (rangeInt & mask);
}

export function checkIpType(ip) {
  const ipInt = ipToInt(ip.trim());
  if (ipInt === null) throw new Error('Invalid IPv4 address');
  for (const range of RESERVED_RANGES) {
    if (isInRange(ipInt, range.cidr)) {
      return { ip, isPrivate: true, matchedRange: range.cidr, type: range.name };
    }
  }
  return { ip, isPrivate: false, type: 'Public (routable)' };
}

// ============================================================
// ENCODING / HASHING removed in the v2 scope audit — see MCP_AND_AI_TOOL_OPPORTUNITY_RESEARCH.md.
// These were commodity dev-utility functions (JSON pretty-print, JWT decode,
// Base64, hashing) with no deterministic-LLM-failure rationale; kept out of a
// crowded 60+ tool dev-utility category rather than added to it.
// ============================================================


// mathjs's evaluate() is a sandboxed expression parser, NOT JS eval. It does not
// execute arbitrary JS, only arithmetic/math-function syntax. Safe on untrusted input.

export function calculate(expression) {
  const result = math.evaluate(expression.trim());
  // BigNumber.toString() switches to scientific notation above ~1e21, which is
  // harder for a downstream consumer to parse reliably than plain digits.
  // math.format with notation:'fixed' keeps full precision in plain decimal form.
  const formatted = (result && typeof result.toFixed === 'function')
    ? math.format(result, { notation: 'fixed' })
    : String(result);
  return { expression, result: formatted };
}

// ============================================================
// NEW: Token counting (agent-specific: manage context budget before sending a prompt)
// ============================================================

import { encode as gptEncode } from 'gpt-tokenizer';

export function countTokens(text) {
  const tokens = gptEncode(text);
  return { tokenCount: tokens.length, charCount: text.length, tokenizer: 'cl100k_base (GPT-3.5/4 family)' };
}

// ============================================================
// NEW: Date arithmetic (fixes LLM calendar/leap-year/DST errors)
// ============================================================

export function dateAdd(dateStr, amount, unit) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) throw new Error('Could not parse date. Try ISO 8601 format.');
  const n = parseInt(amount, 10);
  if (Number.isNaN(n)) throw new Error('amount must be an integer');
  const validUnits = ['days', 'weeks', 'months', 'years', 'businessDays'];
  if (!validUnits.includes(unit)) throw new Error(`unit must be one of: ${validUnits.join(', ')}`);

  const result = new Date(d);
  if (unit === 'days') result.setUTCDate(result.getUTCDate() + n);
  else if (unit === 'weeks') result.setUTCDate(result.getUTCDate() + n * 7);
  else if (unit === 'months' || unit === 'years') {
    const originalDay = result.getUTCDate();
    if (unit === 'months') result.setUTCMonth(result.getUTCMonth() + n);
    else result.setUTCFullYear(result.getUTCFullYear() + n);
    // JS date rollover doesn't clamp (e.g. Jan 31 + 1 month silently becomes
    // Mar 3, not Feb 28). Detect overflow and clamp to the target month's
    // actual last day instead, matching normal calendar-math expectations.
    if (result.getUTCDate() !== originalDay) {
      result.setUTCDate(0); // rolls back to the last day of the previous (correct) month
    }
  }
  else if (unit === 'businessDays') {
    let remaining = Math.abs(n);
    const step = n >= 0 ? 1 : -1;
    while (remaining > 0) {
      result.setUTCDate(result.getUTCDate() + step);
      const dow = result.getUTCDay();
      if (dow !== 0 && dow !== 6) remaining--;
    }
  }
  return { input: dateStr, amount: n, unit, result: result.toISOString() };
}

export function dateDiff(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) throw new Error('Could not parse one or both dates. Try ISO 8601 format.');
  const msDiff = b.getTime() - a.getTime();
  const totalDays = Math.trunc(msDiff / 86400000);

  let businessDays = 0;
  const step = totalDays >= 0 ? 1 : -1;
  const cursor = new Date(a);
  for (let i = 0; i < Math.abs(totalDays); i++) {
    cursor.setUTCDate(cursor.getUTCDate() + step);
    const dow = cursor.getUTCDay();
    if (dow !== 0 && dow !== 6) businessDays++;
  }
  return {
    a: a.toISOString(), b: b.toISOString(),
    totalDays, businessDays: totalDays >= 0 ? businessDays : -businessDays,
    totalHours: Math.trunc(msDiff / 3600000),
  };
}

export function convertTimezone(dateStr, toTimeZone) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) throw new Error('Could not parse date. Try ISO 8601 format.');
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: toTimeZone, dateStyle: 'full', timeStyle: 'long',
    }).format(d);
    return { utc: d.toISOString(), timeZone: toTimeZone, formatted };
  } catch (e) {
    throw new Error(`Invalid IANA time zone name: "${toTimeZone}" (e.g. "America/New_York", "Asia/Tokyo")`);
  }
}

// ============================================================
// NEW: Statistics (fixes LLM eyeballing errors on multi-value data)
// ============================================================

export function computeStatistics(numbers) {
  const nums = numbers.map(Number);
  if (nums.some(Number.isNaN) || nums.length === 0) throw new Error('numbers must be a non-empty array of valid numbers');
  const sorted = [...nums].sort((a, b) => a - b);
  const n = nums.length;
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = nums.reduce((acc, x) => acc + (x - mean) ** 2, 0) / n;
  const stdev = Math.sqrt(variance);

  const percentile = (p) => {
    const idx = (p / 100) * (n - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  const median = percentile(50);

  return {
    count: n, sum, mean, median, stdev,
    variance, min: sorted[0], max: sorted[n - 1],
    p25: percentile(25), p75: percentile(75), p90: percentile(90),
  };
}

// ============================================================
// NEW: Unit conversion (fixes LLM errors on length/weight/temp/volume math)
// ============================================================

// Base units: meters (length), kilograms (weight), liters (volume). Temperature
// handled separately since it's not a simple multiplicative factor.
const UNIT_FACTORS = {
  length: {
    m: 1, meter: 1, meters: 1,
    km: 1000, kilometer: 1000, kilometers: 1000,
    cm: 0.01, centimeter: 0.01, centimeters: 0.01,
    mm: 0.001, millimeter: 0.001, millimeters: 0.001,
    mi: 1609.344, mile: 1609.344, miles: 1609.344,
    yd: 0.9144, yard: 0.9144, yards: 0.9144,
    ft: 0.3048, foot: 0.3048, feet: 0.3048,
    in: 0.0254, inch: 0.0254, inches: 0.0254,
  },
  weight: {
    kg: 1, kilogram: 1, kilograms: 1,
    g: 0.001, gram: 0.001, grams: 0.001,
    lb: 0.45359237, lbs: 0.45359237, pound: 0.45359237, pounds: 0.45359237,
    oz: 0.028349523125, ounce: 0.028349523125, ounces: 0.028349523125,
    ton: 907.18474, tons: 907.18474,
    tonne: 1000, tonnes: 1000,
  },
  volume: {
    l: 1, liter: 1, liters: 1, litre: 1, litres: 1,
    ml: 0.001, milliliter: 0.001, milliliters: 0.001,
    gal: 3.785411784, gallon: 3.785411784, gallons: 3.785411784,
    qt: 0.946352946, quart: 0.946352946, quarts: 0.946352946,
    pt: 0.473176473, pint: 0.473176473, pints: 0.473176473,
    cup: 0.2365882365, cups: 0.2365882365,
    floz: 0.0295735295625, 'fl oz': 0.0295735295625,
  },
};

function findUnitCategory(unit) {
  const u = unit.toLowerCase().trim();
  for (const [category, table] of Object.entries(UNIT_FACTORS)) {
    if (u in table) return { category, table, key: u };
  }
  return null;
}

export function convertUnit(value, fromUnit, toUnit) {
  const v = Number(value);
  if (Number.isNaN(v)) throw new Error('value must be a number');

  const fromLower = fromUnit.toLowerCase().trim();
  const toLower = toUnit.toLowerCase().trim();
  const tempUnits = ['c', 'celsius', 'f', 'fahrenheit', 'k', 'kelvin'];
  if (tempUnits.includes(fromLower) || tempUnits.includes(toLower)) {
    return convertTemperature(v, fromLower, toLower);
  }

  const from = findUnitCategory(fromUnit);
  const to = findUnitCategory(toUnit);
  if (!from) throw new Error(`Unknown unit: "${fromUnit}"`);
  if (!to) throw new Error(`Unknown unit: "${toUnit}"`);
  if (from.category !== to.category) {
    throw new Error(`Cannot convert between different unit categories: "${fromUnit}" (${from.category}) and "${toUnit}" (${to.category})`);
  }
  const baseValue = v * from.table[from.key];
  const result = baseValue / to.table[to.key];
  return { value: v, fromUnit, toUnit, category: from.category, result };
}

function convertTemperature(v, fromLower, toLower) {
  const norm = (u) => (u[0] === 'c' ? 'c' : u[0] === 'f' ? 'f' : 'k');
  const from = norm(fromLower), to = norm(toLower);
  let celsius;
  if (from === 'c') celsius = v;
  else if (from === 'f') celsius = (v - 32) * (5 / 9);
  else if (from === 'k') celsius = v - 273.15;
  else throw new Error(`Unknown temperature unit: "${fromLower}"`);

  let result;
  if (to === 'c') result = celsius;
  else if (to === 'f') result = celsius * (9 / 5) + 32;
  else if (to === 'k') result = celsius + 273.15;
  else throw new Error(`Unknown temperature unit: "${toLower}"`);

  return { value: v, fromUnit: fromLower, toUnit: toLower, category: 'temperature', result };
}

// ============================================================
// NEW: Geographic distance (haversine, exact great-circle distance)
// ============================================================

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const [a1, o1, a2, o2] = [lat1, lon1, lat2, lon2].map(Number);
  if ([a1, o1, a2, o2].some(Number.isNaN)) throw new Error('All coordinates must be numeric');
  if (Math.abs(a1) > 90 || Math.abs(a2) > 90) throw new Error('Latitude must be between -90 and 90');
  if (Math.abs(o1) > 180 || Math.abs(o2) > 180) throw new Error('Longitude must be between -180 and 180');

  const R_KM = 6371.0088; // mean Earth radius
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(a2 - a1);
  const dLon = toRad(o2 - o1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a1)) * Math.cos(toRad(a2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  const km = R_KM * c;
  return { from: [a1, o1], to: [a2, o2], kilometers: km, miles: km * 0.621371 };
}

// ============================================================
// NEW: Combinatorics / probability (fixes LLM factorial/nCr overflow & errors)
// ============================================================

function factorialBig(n) {
  if (n < 0 || !Number.isInteger(n)) throw new Error('n must be a non-negative integer');
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) result *= i;
  return result;
}

export function factorial(n) {
  const result = factorialBig(n);
  return { n, result: result.toString() };
}

export function permutations(n, r) {
  if (r > n || r < 0 || n < 0) throw new Error('Require 0 <= r <= n');
  const result = factorialBig(n) / factorialBig(n - r);
  return { n, r, result: result.toString() };
}

export function combinations(n, r) {
  if (r > n || r < 0 || n < 0) throw new Error('Require 0 <= r <= n');
  const result = factorialBig(n) / (factorialBig(r) * factorialBig(n - r));
  return { n, r, result: result.toString() };
}

// ============================================================
// NEW: Base conversion (ported from NetKit's hex/binary/decimal converter)
// ============================================================

const VALID_BASES = { binary: 2, decimal: 10, hex: 16, octal: 8 };

export function convertBase(value, fromBase, toBase) {
  const from = VALID_BASES[fromBase.toLowerCase()];
  const to = VALID_BASES[toBase.toLowerCase()];
  if (!from) throw new Error(`fromBase must be one of: ${Object.keys(VALID_BASES).join(', ')}`);
  if (!to) throw new Error(`toBase must be one of: ${Object.keys(VALID_BASES).join(', ')}`);

  const cleaned = String(value).trim().replace(/^0x/i, '').replace(/^0b/i, '');
  let n;
  try {
    n = BigInt(from === 10 ? cleaned : (from === 16 ? '0x' + cleaned : from === 2 ? '0b' + cleaned : parseInt(cleaned, 8).toString()));
  } catch {
    throw new Error(`"${value}" is not a valid ${fromBase} number`);
  }
  if (from === 8) n = BigInt(parseInt(cleaned, 8));
  if (Number.isNaN(Number(n))) throw new Error(`"${value}" is not a valid ${fromBase} number`);

  const result = n.toString(to);
  return { value, fromBase, toBase, result };
}

// ============================================================
// NEW: Levenshtein distance / string similarity (deterministic fuzzy matching)
// ============================================================

export function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return { distance: n, similarity: n === 0 ? 1 : 0 };
  if (n === 0) return { distance: m, similarity: 0 };

  let prevRow = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const currRow = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,      // deletion
        currRow[j - 1] + 1,  // insertion
        prevRow[j - 1] + cost // substitution
      );
    }
    prevRow = currRow;
  }
  const distance = prevRow[n];
  const maxLen = Math.max(m, n);
  const similarity = maxLen === 0 ? 1 : 1 - distance / maxLen;
  return { a, b, distance, similarity };
}
