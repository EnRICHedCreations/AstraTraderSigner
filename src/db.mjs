import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const T={meta:'astratrader_signer_meta',events:'astratrader_signer_events',orders:'astratrader_signer_orders'};
function fail(label,error){throw new Error(`${label}: ${error?.message??error}`)}

export class Store{
  constructor(c){
    if(!c.supabaseUrl||!c.supabaseServiceRoleKey)throw new Error('Supabase persistence is required');
    this.db=createClient(c.supabaseUrl,c.supabaseServiceRoleKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  }
  async init(){
    const {error}=await this.db.from(T.meta).select('key').limit(1);
    if(error)fail('Supabase signer persistence unavailable',error);
  }
  async get(k,f=null){
    const {data,error}=await this.db.from(T.meta).select('value').eq('key',k).maybeSingle();
    if(error)fail('Supabase meta read failed',error);
    return data?data.value:f;
  }
  async set(k,v){
    const {error}=await this.db.from(T.meta).upsert({key:k,value:v,updated_at:new Date().toISOString()},{onConflict:'key'});
    if(error)fail('Supabase meta write failed',error);
  }
  async event(kind,body){
    const {error}=await this.db.from(T.events).insert({id:randomUUID(),at:Date.now(),kind,body});
    if(error)fail('Supabase event write failed',error);
  }
  async order(id){
    const {data,error}=await this.db.from(T.orders).select('body,state').eq('id',id).maybeSingle();
    if(error)fail('Supabase order read failed',error);
    return data?{...data.body,state:data.state}:null;
  }
  async orders(){
    const {data,error}=await this.db.from(T.orders).select('body,state').order('updated',{ascending:false});
    if(error)fail('Supabase orders read failed',error);
    return (data??[]).map(r=>({...r.body,state:r.state}));
  }
  async saveOrder(o){
    const {error}=await this.db.from(T.orders).upsert({id:o.id,state:o.state,body:o,updated:Date.now()},{onConflict:'id'});
    if(error)fail('Supabase order write failed',error);
  }
  async reserve(id,amount,cap){
    const {error}=await this.db.rpc('astratrader_signer_reserve',{p_id:id,p_amount:amount,p_cap:cap});
    if(error){
      if(/Daily spending limit/i.test(error.message))throw new Error('Daily spending limit');
      if(/Reservation id conflict/i.test(error.message))throw new Error('Reservation id conflict');
      fail('Supabase reservation failed',error);
    }
  }
  close(){}
}
