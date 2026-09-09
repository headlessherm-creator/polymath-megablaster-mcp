import * as t from '../src/tools.js';

let failed = 0;
function eq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.log('FAIL:', label, '\n  got:', a, '\n  want:', e); failed++; }
  else console.log('PASS:', label);
}
function ok(cond, label) {
  if (!cond) { console.log('FAIL:', label); failed++; } else console.log('PASS:', label);
}
function throws(fn, label) {
  try { fn(); console.log('FAIL:', label, '(did not throw)'); failed++; }
  catch (e) { console.log('PASS:', label); }
}

// Networking
let r = t.calcSubnet('192.168.1.0/24');
eq(r.network, '192.168.1.0', 'subnet network');
eq(r.broadcast, '192.168.1.255', 'subnet broadcast');
eq(r.usableHosts, 254, 'subnet usable hosts');
r = t.calcSubnet('10.0.0.4/31');
eq(r.usableHosts, 2, 'subnet /31 point-to-point');
throws(() => t.calcSubnet('999.1.1.1/24'), 'subnet rejects bad octet');

r = t.checkIpType('192.168.1.1');
eq(r.isPrivate, true, 'private IP detection');
r = t.checkIpType('172.32.0.1');
eq(r.isPrivate, false, 'boundary just outside 172.16/12 is public');
r = t.checkIpType('8.8.8.8');
eq(r.isPrivate, false, 'public IP detection');

// JSON / JWT / encoding / hashing / cron / UUID / timestamp / color / diff / config-format
// tests removed with the v2 scope audit (see MCP_AND_AI_TOOL_OPPORTUNITY_RESEARCH.md);
// those tools were pulled from the free tier as commodity dev-utilities.

// Calculator (arbitrary precision)
r = t.calculate('123456789 * 987654321');
eq(r.result, '121932631112635269', 'calculate exact large multiplication');
r = t.calculate('2 + 2');
eq(r.result, '4', 'calculate basic arithmetic');
r = t.calculate('sqrt(16)');
eq(r.result, '4', 'calculate sqrt function');
throws(() => t.calculate('this is not math'), 'calculate rejects non-math input');

// Token counting
r = t.countTokens('Hello, world!');
ok(r.tokenCount > 0 && r.tokenCount < 10, 'count_tokens returns plausible small count');
eq(t.countTokens('').tokenCount, 0, 'count_tokens empty string is 0 tokens');

// Date arithmetic
r = t.dateAdd('2026-01-31', 1, 'months');
eq(r.result.slice(0, 10), '2026-02-28', 'date_add month-end rolls to Feb 28 (non-leap boundary)');
r = t.dateAdd('2024-02-28', 1, 'days');
eq(r.result.slice(0, 10), '2024-02-29', 'date_add crosses leap day correctly');
r = t.dateAdd('2026-09-04', 5, 'businessDays');
eq(r.result.slice(0, 10), '2026-09-11', 'date_add businessDays skips weekend');
throws(() => t.dateAdd('not-a-date', 1, 'days'), 'date_add rejects invalid date');

r = t.dateDiff('2026-01-01', '2026-12-31');
eq(r.totalDays, 364, 'date_diff full non-leap-adjacent year is 364 days');
r = t.dateDiff('2026-09-04', '2026-09-11');
eq(r.businessDays, 5, 'date_diff counts business days excluding weekend');

r = t.convertTimezone('2026-01-01T12:00:00Z', 'America/New_York');
ok(r.formatted.includes('7:00:00 AM') || r.formatted.includes('07:00:00'), 'convert_timezone UTC to New York (EST, -5)');
throws(() => t.convertTimezone('2026-01-01T12:00:00Z', 'Not/AZone'), 'convert_timezone rejects invalid zone');

// Statistics
r = t.computeStatistics([1, 2, 3, 4, 5]);
eq(r.mean, 3, 'statistics mean of 1-5');
eq(r.median, 3, 'statistics median of 1-5');
eq(r.min, 1, 'statistics min');
eq(r.max, 5, 'statistics max');
r = t.computeStatistics([2, 4, 4, 4, 5, 5, 7, 9]);
ok(Math.abs(r.stdev - 2) < 0.001, 'statistics stdev known textbook example ~2.0');
throws(() => t.computeStatistics([]), 'statistics rejects empty array');
throws(() => t.computeStatistics(['a', 'b']), 'statistics rejects non-numeric input');

// Unit conversion
r = t.convertUnit(100, 'km', 'mi');
ok(Math.abs(r.result - 62.137) < 0.01, 'unit convert km to miles');
r = t.convertUnit(0, 'c', 'f');
eq(r.result, 32, 'unit convert 0C to 32F');
r = t.convertUnit(212, 'f', 'c');
eq(r.result, 100, 'unit convert 212F to 100C');
r = t.convertUnit(1, 'kg', 'lb');
ok(Math.abs(r.result - 2.20462) < 0.001, 'unit convert kg to lb');
throws(() => t.convertUnit(1, 'kg', 'meters'), 'unit convert rejects mismatched categories');
throws(() => t.convertUnit(1, 'kg', 'bananas'), 'unit convert rejects unknown unit');

// Haversine distance
r = t.haversineDistance(40.7128, -74.0060, 34.0522, -118.2437); // NYC to LA
ok(Math.abs(r.kilometers - 3936) < 20, 'haversine NYC to LA matches known ~3935km');
r = t.haversineDistance(0, 0, 0, 0);
eq(r.kilometers, 0, 'haversine same point is 0 distance');
throws(() => t.haversineDistance(999, 0, 0, 0), 'haversine rejects out-of-range latitude');

// Combinatorics
eq(t.factorial(10).result, '3628800', 'factorial 10! known value');
eq(t.factorial(20).result, '2432902008176640000', 'factorial 20! exact big value (overflows float64 silently otherwise)');
eq(t.combinations(52, 5).result, '2598960', 'combinations 52 choose 5 (poker hands, known value)');
eq(t.permutations(5, 3).result, '60', 'permutations 5P3 known value');
throws(() => t.combinations(3, 5), 'combinations rejects r > n');
throws(() => t.factorial(-1), 'factorial rejects negative n');

// Base conversion
eq(t.convertBase('255', 'decimal', 'hex').result, 'ff', 'base convert 255 decimal to hex');
eq(t.convertBase('FF', 'hex', 'decimal').result, '255', 'base convert FF hex to decimal');
eq(t.convertBase('10', 'decimal', 'binary').result, '1010', 'base convert 10 decimal to binary');
eq(t.convertBase('17', 'decimal', 'octal').result, '21', 'base convert 17 decimal to octal');
throws(() => t.convertBase('xyz', 'hex', 'decimal'), 'base convert rejects invalid hex digits');

// Levenshtein / string similarity
eq(t.levenshteinDistance('kitten', 'sitting').distance, 3, 'levenshtein kitten/sitting known textbook value');
eq(t.levenshteinDistance('same', 'same').distance, 0, 'levenshtein identical strings is 0');
eq(t.levenshteinDistance('', 'abc').distance, 3, 'levenshtein empty string vs abc is 3');

console.log('\n---- Result:', failed === 0 ? 'ALL PASS' : failed + ' FAILED', '(' + (failed === 0 ? 'ready' : 'NOT ready') + ') ----');
process.exit(failed === 0 ? 0 : 1);
