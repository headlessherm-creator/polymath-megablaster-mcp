import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(__dirname, '..', 'src', 'index.js');

const transport = new StdioClientTransport({ command: 'node', args: [indexPath] });
const client = new Client({ name: 'test-client', version: '1.0.0' });
await client.connect(transport);

const tools = await client.listTools();
console.log(`Registered ${tools.tools.length} tools`);

let failed = 0;
async function call(name, args, checkFn, label) {
  try {
    const res = await client.callTool({ name, arguments: args });
    const isErr = res.isError === true;
    const txt = res.content[0]?.text || '';
    const passed = checkFn(txt, isErr);
    if (passed) console.log('PASS:', label);
    else { console.log('FAIL:', label, '\n  got:', txt); failed++; }
  } catch (e) {
    console.log('FAIL:', label, '(threw)', e.message);
    failed++;
  }
}

await call('calc_subnet', { cidr: '192.168.1.0/24' }, (t) => t.includes('192.168.1.255'), 'MCP call: calc_subnet broadcast');
await call('check_ip_type', { ip: '10.0.0.1' }, (t) => t.includes('true'), 'MCP call: check_ip_type private');
await call('format_json', { json: '{"a":1}' }, (t) => t.includes('"a": 1'), 'MCP call: format_json pretty');
await call('generate_uuid', { count: 3 }, (t) => (t.match(/-/g) || []).length >= 12, 'MCP call: generate_uuid count 3');
await call('hash_text', { text: 'hello', algo: 'sha256' }, (t) => t.includes('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'), 'MCP call: hash_text sha256');
await call('convert_config_format', { input: '{"a":1}', from: 'json', to: 'yaml' }, (t) => t.includes('a: 1'), 'MCP call: convert_config_format json->yaml');
await call('parse_cron', { expression: '0 0 * * *', count: 2 }, (t) => t.includes('nextRuns'), 'MCP call: parse_cron');
await call('calc_subnet', { cidr: 'not-an-ip' }, (t, isErr) => isErr, 'MCP call: calc_subnet bad input returns clean error');

await call('calculate', { expression: '999999999999 * 999999999999' }, (t) => t.includes('999999999998000000000001'), 'MCP call: calculate large exact multiplication');
await call('count_tokens', { text: 'Hello, world!' }, (t) => t.includes('tokenCount'), 'MCP call: count_tokens');
await call('date_add', { date: '2026-01-31', amount: 1, unit: 'months' }, (t) => t.includes('2026-02-28'), 'MCP call: date_add clamps month overflow');
await call('date_diff', { a: '2026-01-01', b: '2026-12-31' }, (t) => t.includes('364'), 'MCP call: date_diff');
await call('compute_statistics', { numbers: [1, 2, 3, 4, 5] }, (t) => t.includes('"mean": 3'), 'MCP call: compute_statistics mean');

await call('convert_unit', { value: 100, fromUnit: 'km', toUnit: 'mi' }, (t) => t.includes('62.13'), 'MCP call: convert_unit km to miles');
await call('haversine_distance', { lat1: 40.7128, lon1: -74.006, lat2: 34.0522, lon2: -118.2437 }, (t) => t.includes('kilometers'), 'MCP call: haversine_distance');
await call('factorial', { n: 20 }, (t) => t.includes('2432902008176640000'), 'MCP call: factorial exact big value');
await call('combinations', { n: 52, r: 5 }, (t) => t.includes('2598960'), 'MCP call: combinations poker hands');
await call('convert_base', { value: '255', fromBase: 'decimal', toBase: 'hex' }, (t) => t.includes('ff'), 'MCP call: convert_base decimal to hex');
await call('levenshtein_distance', { a: 'kitten', b: 'sitting' }, (t) => t.includes('"distance": 3'), 'MCP call: levenshtein_distance');

console.log('\n---- MCP integration result:', failed === 0 ? 'ALL PASS' : failed + ' FAILED', '----');
await client.close();
process.exit(failed === 0 ? 0 : 1);
