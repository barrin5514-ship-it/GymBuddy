const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../exercise-api.js'),'utf8'),fixture=require(require('node:path').resolve(process.env.GYMBUDDY_FIXTURE));
let passed=0;
async function context(handler){const c={window:{},URL,AbortController,Date,TypeError,SyntaxError,Map,Set,fetch:handler,setTimeout:(f,t)=>t>=10000?setTimeout(f,20):setTimeout(f,0),clearTimeout};vm.createContext(c);vm.runInContext(code,c);return c.window.GymExercises;}
async function rejects(fetch,rx){const api=await context(fetch);await assert.rejects(()=>api.load(['squat']),rx);passed++;}
(async()=>{
 await rejects(async()=>({ok:false,status:429}),/Wait one minute/);
 await rejects(async()=>({ok:false,status:401}),/401/);
 await rejects(async()=>({ok:false,status:503}),/503/);
 await rejects(async()=>{throw new TypeError('network')},/connection/);
 await rejects(async()=>({ok:true,json:async()=>{throw new SyntaxError('bad')}}),/invalid data/);
 await rejects(async()=>({ok:true,json:async()=>({success:false,data:[]})}),/unreadable/);
 await rejects((url,o)=>new Promise((r,j)=>o.signal.addEventListener('abort',()=>j(Object.assign(new Error(),{name:'AbortError'})))),/too long/);
 let calls=0;const api=await context(async()=>{calls++;return {ok:true,json:async()=>({success:true,data:[null,{exerciseId:'bad'},fixture[0],fixture[0]],meta:{hasNextPage:true,nextCursor:'same'}})}});
 const data=await api.load(['band']);assert.equal(data.length,1);assert.equal(calls,2);passed+=2;await api.load(['band']);assert.equal(calls,2);passed++;
 const empty=await context(async()=>({ok:true,json:async()=>({success:true,data:[]})}));assert.equal((await empty.load(['x'])).length,0);passed++;
 await rejects(async()=>({ok:false,status:503,text:async()=>'error code: 1102'}),/resource limit/);
 await rejects(async()=>({ok:false,status:403,text:async()=>'error code: 1015',headers:{get:()=> '120'}}),/retry period/);
 let cacheCalls=0;
 const retained=await context(async()=>{cacheCalls++;return cacheCalls===1?{ok:true,json:async()=>({success:true,data:[fixture[0]],meta:{hasNextPage:false}})}:{ok:false,status:429,headers:{get:()=> '120'}};});
 await retained.load(['cached']);await assert.rejects(()=>retained.load(['uncached']),/busy/);passed++;
 assert.equal((await retained.load(['cached'])).length,1);assert.equal(cacheCalls,2);passed++;
 await assert.rejects(()=>retained.load(['uncached']),/busy/);assert.equal(cacheCalls,2);passed++;
 console.log('PASS '+passed+' API failure/cache/pagination checks.');
})().catch(e=>{console.error(e);process.exitCode=1});
