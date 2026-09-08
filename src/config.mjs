import { strategy } from './strategy.mjs';

export const USDC='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',TOKEN='TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',ASSOCIATED='ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',JUPITER='JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';

function integer(v,n,min,max){
  const x=Number(v);
  if(!Number.isSafeInteger(x)||x<min||x>max)throw Error('Invalid '+n);
  return x;
}

function optionalUsdRaw(v,n,maxUsd){
  if(v===undefined||v===null||String(v).trim()===''||String(v).trim()==='0')return 0;
  const s=String(v).trim();
  if(!/^\d+(?:\.\d{1,6})?$/.test(s))throw Error('Invalid '+n);
  const [whole,fraction='']=s.split('.');
  const raw=BigInt(whole)*1000000n+BigInt((fraction+'000000').slice(0,6));
  if(raw<=0n||raw>BigInt(maxUsd)*1000000n)throw Error('Invalid '+n);
  return Number(raw);
}

export function config(e=process.env){
  const c={
    mode:e.TRADING_MODE??'paper',
    port:integer(e.PORT??8080,'PORT',1,65535),
    rpc:e.SOLANA_RPC_URL??'https://api.mainnet-beta.solana.com',
    jupiterKey:e.JUPITER_API_KEY??'',
    signerToken:e.SIGNER_TOKEN??'',
    signerEnabled:e.SIGNER_ENABLE_LIVE==='true',
    keyPath:e.SIGNER_KEYPAIR_FILE??'',
    keyBase64:e.SIGNER_KEYPAIR_BASE64??'',
    supabaseUrl:e.SUPABASE_URL??'',
    supabaseServiceRoleKey:e.SUPABASE_SERVICE_ROLE_KEY??'',
    hardBudgetRaw:optionalUsdRaw(e.LIVE_BUDGET_USDC,'LIVE_BUDGET_USDC',1000000),
    hardMaxOrderRaw:optionalUsdRaw(e.LIVE_MAX_ORDER_USDC,'LIVE_MAX_ORDER_USDC',100000),
    hardMaxDailyRaw:optionalUsdRaw(e.LIVE_DAILY_BUY_LIMIT_USDC,'LIVE_DAILY_BUY_LIMIT_USDC',1000000),
    hardMaxLossRaw:optionalUsdRaw(e.LIVE_DAILY_LOSS_LIMIT_USDC,'LIVE_DAILY_LOSS_LIMIT_USDC',100000),
    maxLamports:integer(e.MAX_NATIVE_COST_LAMPORTS??5000000,'MAX_NATIVE_COST_LAMPORTS',5000,10000000),
    minReserve:integer(e.MIN_SOL_RESERVE_LAMPORTS??10000000,'MIN_SOL_RESERVE_LAMPORTS',1000000,1000000000),
    quoteAgeMs:5000,
    slippageBps:integer(e.MAX_SLIPPAGE_BPS??50,'MAX_SLIPPAGE_BPS',1,100)
  };

  if(c.mode!=='live')throw Error('Signer requires TRADING_MODE=live');
  if(new URL(c.rpc).protocol!=='https:')throw Error('RPC must use HTTPS');
  if(!c.supabaseUrl||new URL(c.supabaseUrl).protocol!=='https:')throw Error('SUPABASE_URL must use HTTPS');
  if(!c.supabaseServiceRoleKey)throw Error('SUPABASE_SERVICE_ROLE_KEY is required');
  return c;
}

export function liveConfiguration(c){
  strategy();
  return [
    ['Explicit live mode',c.mode==='live'],
    ['Signer enabled',c.signerEnabled],
    ['Dedicated RPC',!c.rpc.includes('api.mainnet-beta.solana.com')],
    ['Jupiter credentials',!!c.jupiterKey],
    ['Signer authentication',c.signerToken.length>=32],
    ['Supabase persistence',!!c.supabaseUrl&&!!c.supabaseServiceRoleKey]
  ];
}
