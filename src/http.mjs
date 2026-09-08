import { timingSafeEqual } from 'node:crypto';
export function authorized(req,secret){const a=req.headers.authorization??'',e='Bearer '+secret;return secret.length>=32&&Buffer.byteLength(a)===Buffer.byteLength(e)&&timingSafeEqual(Buffer.from(a),Buffer.from(e))}
export async function body(req,limit=16384){let size=0,parts=[];for await(const c of req){size+=c.length;if(size>limit)throw Error('Payload too large');parts.push(c)}return JSON.parse(Buffer.concat(parts).toString('utf8'))}
export function send(res,status,value){res.writeHead(status,{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(value))}
export function safeMessage(e){return String(e?.message??'Unexpected error').replace(/https?:\/\/[^\s]+/g,'[provider URL redacted]').slice(0,300)}
export function log(event,data={}){console.log(JSON.stringify({at:new Date().toISOString(),event,...data}))}
