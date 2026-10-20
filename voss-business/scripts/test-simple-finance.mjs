import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(file,imports={}){const source=readFileSync(new URL('../src/lib/'+file+'.ts',import.meta.url),'utf8');const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:key=>{assert.ok(key in imports);return imports[key];},Intl,Date});return exports;}
const f=load('simple-finance');
assert.deepEqual(JSON.parse(JSON.stringify(f.salePricing('2649','2','200'))),{listed:5298,discount:200,subtotal:5098});
assert.equal(f.salePricing('2799','1','0').subtotal,2799);
assert.equal(f.salePricing('0.10','3','0.01').subtotal,0.29);
for(const args of [['2649','1','2649'],['2649','0','0'],['2649','1.5','0'],['2649','1','-1'],['1.001','1','0'],['NaN','1','0'],['99999999','100000','0']])assert.throws(()=>f.salePricing(...args));
assert.equal(f.monthDates('2028-02').to,'2028-02-29');assert.equal(f.monthDates('2026-02').to,'2026-02-28');assert.equal(f.monthDates('2026-10').to,'2026-10-31');assert.throws(()=>f.monthDates('2026-13'));
const saved=f.savedSalePricing('Article 13 · Kite Tote · Ivory. Price per bag: Rs 2,649. Quantity: 2. Discount for this order: Rs 200. Bags after discount: Rs 5,098. Sales channel: WhatsApp.');assert.equal(saved.price,'2649');assert.equal(saved.discount,'200');assert.equal(saved.channel,'WhatsApp');assert.equal(f.savedSalePricing('Imported note without pricing history'),null);
const finance=load('finance',{'./business':{cloud:{},csvCell:v=>String(v??'')}});
const sale={kind:'sale',fulfillment_status:'delivered',payment_status:'collected',amount_pkr:5098,delivery_charged_pkr:150,packaging_cost_pkr:0.1,delivery_cost_pkr:0.2,cod_fee_pkr:10,return_courier_pkr:20,returns_loss_pkr:30};
assert.equal(finance.entryRevenue(sale),5248);assert.equal(finance.entryRevenue({...sale,payment_status:'pending'}),0);assert.equal(finance.entryRevenue({...sale,fulfillment_status:'returned'}),0);assert.equal(finance.entryAdditionalCosts(sale),60.3);
console.log('PASS: discount totals, precision, input limits, month boundaries, saved pricing/channel, delivered-and-collected revenue and all courier/return cost fields. Synthetic data only.');
