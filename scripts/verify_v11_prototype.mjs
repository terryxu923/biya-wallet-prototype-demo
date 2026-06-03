#!/usr/bin/env node
/**
 * Static regression for prototype-v11.html (V1.1.0 delivery).
 * Run: node scripts/verify_v11_prototype.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.join(__dirname, '..', 'prototype-v11.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

const V11_NETWORKS = [
  'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism',
  'avalanche', 'base', 'zksync', 'solana', 'tron',
];

const checks = [
  ['title V1.1.0', () => /<title>SUC-01 Biya钱包 V1\.1\.0/.test(html)],
  ['PROTOTYPE_MVP = false', () => /const PROTOTYPE_MVP = false/.test(html)],
  ['PROTOTYPE_V11 = true', () => /const PROTOTYPE_V11 = true/.test(html)],
  ['applyV11PrototypeMode', () => /function applyV11PrototypeMode/.test(html)],
  ['applyMvp skips when V11', () => /function applyMvpPrototypeMode[\s\S]*?PROTOTYPE_V11\) return/.test(html)],
  ['init calls both modes', () => /applyMvpPrototypeMode\(\);\s*\napplyV11PrototypeMode\(\)/.test(html)],
  ['guardV11DeferFeature', () => /function guardV11DeferFeature/.test(html)],
  ['asSingleChainTokenRows', () => /function asSingleChainTokenRows/.test(html)],
  ['applyWalletScopeToTokenList', () => /function applyWalletScopeToTokenList/.test(html)],
  ['onHomeCopyAddressClick', () => /function onHomeCopyAddressClick/.test(html)],
  ['refreshWeb3MnemonicBackupBanner', () => /function refreshWeb3MnemonicBackupBanner/.test(html)],
  ['addPrototypeSelfCustodyWallet', () => /function addPrototypeSelfCustodyWallet/.test(html)],
  ['openImportSeedScanModal', () => /function openImportSeedScanModal/.test(html)],
  ['validateSendAddress sol/tron/evm', () => {
    const fn = html.match(/function validateSendAddress[\s\S]*?^}/m);
    if (!fn) return false;
    return fn[0].includes("'solana'") && fn[0].includes("'tron'") && fn[0].includes('0x');
  }],
  ['getReceiveAssets V11 branch', () => /function getReceiveAssets[\s\S]*?PROTOTYPE_V11[\s\S]*?asSingleChainTokenRows/.test(html)],
  ['getSendAssets V11 branch', () => /function getSendAssets[\s\S]*?PROTOTYPE_V11[\s\S]*?asSingleChainTokenRows/.test(html)],
  ['openMultiChainDetail V11 fallback', () => /function openMultiChainDetail[\s\S]*?PROTOTYPE_V11[\s\S]*?openSingleChainDetail/.test(html)],
  ['openCustomAssetForm guarded', () => /function openCustomAssetForm[\s\S]*?guardV11DeferFeature/.test(html)],
  ['openTokenManageScreen guarded', () => /function openTokenManageScreen[\s\S]*?guardV11DeferFeature/.test(html)],
  ['openTxHistoryScreen guarded', () => /function openTxHistoryScreen[\s\S]*?guardV11DeferFeature/.test(html)],
  ['openTxDetail guarded', () => /function openTxDetail[\s\S]*?guardV11DeferFeature/.test(html)],
  ['openSendConfirm uses passkey', () => /function openSendConfirm[\s\S]*?startWalletPasskeyFlow/.test(html)],
  ['buildSingleChainBodyHTML V11 slim', () => /function buildSingleChainBodyHTML[\s\S]*?if \(PROTOTYPE_V11\)/.test(html)],
  ['CSS hide defer overlays', () => /body\.prototype-v11 #tokenManageScreen/.test(html) && /body\.prototype-v11 #txDetail/.test(html)],
  ['CSS hide multiChainDetail', () => /body\.prototype-v11 #multiChainDetail/.test(html)],
  ['HD screens not in prototype-v11 hide', () => !/body\.prototype-v11 #screen-wallet-create-guide/.test(html)],
  ['walletLoginMnemonicCards visible in V11', () => !html.includes('id="walletLoginMnemonicCards" class="mvp-hidden"')],
  ['no _groupMultiChain in V11 homepage path', () => {
    const fn = html.match(/function getFilteredAndSortedTokens[\s\S]*?^}/m);
    if (!fn) return false;
    return fn[0].includes('PROTOTYPE_V11') && fn[0].includes('asSingleChainTokenRows');
  }],
];

for (const net of V11_NETWORKS) {
  checks.push([`NETWORK id ${net}`, () => new RegExp(`id: '${net}'`).test(html)]);
  checks.push([`CHAIN_ADDRESSES.${net}`, () => new RegExp(`${net}:\\s*'[^']+'`).test(html.match(/const CHAIN_ADDRESSES = \{[\s\S]*?\};/)[0])]);
}

const hdWalletIds = ['w-mnemonic-2', 'w-private-4', 'w-private-evm'];
for (const id of hdWalletIds) {
  checks.push([`WALLET_LIST_DATA ${id}`, () => html.includes(`id: '${id}'`)]);
}

let fail = 0;
for (const [name, fn] of checks) {
  let ok = false;
  try { ok = !!fn(); } catch { ok = false; }
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) fail++;
}

console.log(`\n${checks.length - fail}/${checks.length} passed`);
process.exit(fail ? 1 : 0);
