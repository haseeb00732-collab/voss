'use client';
import {useState} from 'react';

export type OrderProfitInputs={productSubtotal:number;deliveryCharged:number;quantity:number;unitCost:number|null;packaging:number;delivery:number;marketing:number;other:number};
export function calculateOrderProfit(input:OrderProfitInputs){
  const amounts=[input.productSubtotal,input.deliveryCharged,input.packaging,input.delivery,input.marketing,input.other,...(input.unitCost===null?[]:[input.unitCost])];
  if(!Number.isInteger(input.quantity)||input.quantity<1||input.quantity>100000||amounts.some(n=>!Number.isFinite(n)||n<0||n>99999999))throw new Error('Enter valid amounts and a whole-number quantity.');
  const paise=(value:number)=>Math.round(value*100);
  const revenue=paise(input.productSubtotal)+paise(input.deliveryCharged),product=input.unitCost===null?null:paise(input.unitCost)*input.quantity;
  const additionalCosts=paise(input.packaging)+paise(input.delivery)+paise(input.marketing)+paise(input.other);
  const totalCost=product===null?null:product+additionalCosts,profit=totalCost===null?null:revenue-totalCost;
  return {revenue:revenue/100,product:product===null?null:product/100,additionalCosts:additionalCosts/100,totalCost:totalCost===null?null:totalCost/100,profit:profit===null?null:profit/100};
}
export type ProfitInputs={salePrice:number;quantity:number;unitCost:number;packagingPerUnit:number;delivery:number;marketing:number;other:number;deliveryCharged?:number};
export function calculateProfit(input:ProfitInputs){
  const amounts=[input.salePrice,input.unitCost,input.packagingPerUnit,input.delivery,input.marketing,input.other,input.deliveryCharged||0];
  if(!Number.isInteger(input.quantity)||input.quantity<1||input.quantity>100000||amounts.some(n=>!Number.isFinite(n)||n<0||n>99999999))throw new Error('Enter valid amounts and a whole-number quantity.');
  const paise=(value:number)=>Math.round(value*100);
  const deliveryCharged=paise(input.deliveryCharged||0),revenue=paise(input.salePrice)*input.quantity+deliveryCharged;
  const product=paise(input.unitCost)*input.quantity;
  const packaging=paise(input.packagingPerUnit)*input.quantity;
  const delivery=paise(input.delivery),marketing=paise(input.marketing),other=paise(input.other);
  const totalCost=product+packaging+delivery+marketing+other,profit=revenue-totalCost;
  return {revenue:revenue/100,product:product/100,packaging:packaging/100,delivery:delivery/100,marketing:marketing/100,other:other/100,totalCost:totalCost/100,profit:profit/100,profitPerUnit:profit/input.quantity/100,margin:revenue?profit/revenue*100:null,breakEvenPrice:Math.max(0,Math.ceil((totalCost-deliveryCharged)/input.quantity))/100};
}
const currency=(value:number)=>`Rs ${value.toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const initial={salePrice:'',quantity:'1',unitCost:'',packagingPerUnit:'',delivery:'',marketing:'',other:'',deliveryCharged:''};
export function FinanceCalculator(){
  const [fields,setFields]=useState(initial);
  const ready=fields.salePrice!==''&&fields.unitCost!==''&&fields.quantity!=='';
  let result:ReturnType<typeof calculateProfit>|null=null,error='';
  if(ready){try{result=calculateProfit({salePrice:Number(fields.salePrice),quantity:Number(fields.quantity),unitCost:Number(fields.unitCost),packagingPerUnit:Number(fields.packagingPerUnit||0),delivery:Number(fields.delivery||0),marketing:Number(fields.marketing||0),other:Number(fields.other||0),deliveryCharged:Number(fields.deliveryCharged||0)});}catch(e){error=e instanceof Error?e.message:'Check your inputs.';}}
  function field(name:keyof typeof initial,label:string,required=false){return <label>{label}<input type="number" inputMode="decimal" min={name==='quantity'?1:0} max={name==='quantity'?100000:99999999} step={name==='quantity'?1:.01} value={fields[name]} required={required} placeholder={required?'Enter amount':'0.00'} onChange={e=>setFields(current=>({...current,[name]:e.target.value}))}/></label>;}
  return <section className="finance-calculator" aria-labelledby="calculator-title"><div className="finance-section-title"><div><h2 id="calculator-title">Profit calculator</h2><p>Try a sale before recording it. This calculation stays in this page and saves no business records.</p></div><button className="secondary" onClick={()=>setFields(initial)}>Clear</button></div><div className="calculator-layout"><div className="calculator-inputs panel"><h3>Sale and costs <span>PKR</span></h3><div className="calculator-fields">{field('salePrice','Sale price per unit',true)}{field('quantity','Quantity',true)}{field('deliveryCharged','Delivery charged · whole sale')}{field('unitCost','Product cost per unit',true)}{field('packagingPerUnit','Packaging per unit')}{field('delivery','Delivery · whole sale')}{field('marketing','Marketing · whole sale')}{field('other','Other costs · whole sale')}</div><p className="calculator-help">Product and packaging costs are multiplied by quantity. Delivery, marketing and other costs are totals for this sale. Empty optional costs count as zero.</p>{error&&<p className="alert" role="alert">{error}</p>}</div><div className="calculator-output panel" aria-live="polite"><h3>Sale estimate</h3>{result?<><table className="finance-table compact-report-table"><tbody><tr><th scope="row">Revenue</th><td>{currency(result.revenue)}</td></tr><tr><th scope="row">Product cost</th><td>{currency(result.product)}</td></tr><tr><th scope="row">Packaging</th><td>{currency(result.packaging)}</td></tr><tr><th scope="row">Delivery</th><td>{currency(result.delivery)}</td></tr><tr><th scope="row">Marketing</th><td>{currency(result.marketing)}</td></tr><tr><th scope="row">Other</th><td>{currency(result.other)}</td></tr><tr className="report-total"><th scope="row">Total cost</th><td>{currency(result.totalCost)}</td></tr><tr className={`calculator-profit ${result.profit<0?'is-loss':''}`}><th scope="row">Estimated {result.profit<0?'loss':'profit'}</th><td>{currency(result.profit)}</td></tr><tr><th scope="row">Profit per unit</th><td>{currency(result.profitPerUnit)}</td></tr><tr><th scope="row">Profit margin</th><td>{result.margin===null?'—':`${result.margin.toFixed(1)}%`}</td></tr><tr><th scope="row">Break-even price per unit</th><td>{currency(result.breakEvenPrice)}</td></tr></tbody></table><p className="calculator-help">Break-even product price covers entered costs after the delivery charged to the customer. Tax, returns and any unrecorded costs are excluded.</p></>:<p className="calculator-placeholder">Enter a sale price, quantity and product cost to see revenue, costs and estimated profit.</p>}</div></div></section>;
}
