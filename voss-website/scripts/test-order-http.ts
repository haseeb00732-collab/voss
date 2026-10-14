import assert from 'node:assert/strict';
import { POST } from '../src/app/api/orders/route';
import { cloudCheckout } from '../src/lib/server/cloud-checkout';
import { isReceipt } from '../src/lib/receipt';

async function main() {
  const originalFetch=globalThis.fetch;
  let sent:Record<string,unknown>={};
  const receipt={reference:'VOSS-ABCDEF123456',subtotal:2999,delivery:150,total:3149,freeDelivery:false};
  let reply:unknown=receipt;
  globalThis.fetch=async (_url,options)=>{
    sent=JSON.parse(String(options?.body));
    return Response.json(reply);
  };
  const request=(body:unknown,origin='https://www.voss.pk')=>new Request('https://www.voss.pk/api/orders',{
    method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)
  });
  const input={items:[{slug:'sample',colour:'black',quantity:1}],customer:{name:'Test'},expectedTotal:3149,idempotencyKey:'test',payment:'cod',consent:true};
  try {
    assert.equal((await POST(request(input,'https://invalid.example'))).status,403);
    assert.equal((await POST(request({...input,consent:false}))).status,400);
    const valid=await POST(request({...input,action:'config',price:1}));
    assert.equal(valid.status,201); assert.deepEqual(await valid.json(),receipt);
    assert.equal(sent.action,'place-order'); assert.equal(sent.price,undefined);
    await cloudCheckout('place-order',{action:'config'}); assert.equal(sent.action,'place-order');
    reply={enabled:true}; assert.equal((await POST(request(input))).status,502);
    reply={...receipt,total:1}; assert.equal((await POST(request(input))).status,502);
    assert.equal(isReceipt({...receipt,freeDelivery:null}),false);
    assert.equal(isReceipt({...receipt,delivery:0,total:2999,freeDelivery:true}),true);
    assert.equal((await POST(request({...input,padding:'x'.repeat(25000)}))).status,413);
    console.log('PASS: order action cannot be overridden; malformed receipts rejected; request origin/size/consent enforced. All network requests mocked.');
  } finally {globalThis.fetch=originalFetch;}
}
void main().catch(e=>{console.error(e);process.exitCode=1;});
