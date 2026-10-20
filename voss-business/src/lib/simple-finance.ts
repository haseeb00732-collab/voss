export const lahoreToday=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Karachi'}).format(new Date());
export function savedSalePricing(notes:string){
  const match=notes.match(/^Article [^\n]+Price per bag: Rs ([\d,.]+)\. Quantity: (\d+)\. Discount for this order: Rs ([\d,.]+)\./);
  if(!match)return null;
  const price=Number(match[1].replaceAll(',','')),discount=Number(match[3].replaceAll(',',''));
  if(!Number.isFinite(price)||!Number.isFinite(discount))return null;
  return {price:String(price),discount:String(discount),channel:notes.match(/Sales channel: ([^.]+)\./)?.[1]};
}
export function monthDates(month:string){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw new Error('Choose a month.');
  const [year,m]=month.split('-').map(Number);
  return {from:`${month}-01`,to:`${month}-${new Date(Date.UTC(year,m,0)).getUTCDate()}`};
}
export function salePricing(price:string,quantity:string,discount:string){
  const amount=(value:string)=>{if(!/^\d+(\.\d{1,2})?$/.test(value))throw new Error('Use a positive rupee amount with up to two decimal places.');const cents=Math.round(Number(value)*100);if(!Number.isSafeInteger(cents)||cents>9999999900)throw new Error('Amount is too large.');return cents;};
  if(!/^\d+$/.test(quantity)||Number(quantity)<1||Number(quantity)>100000)throw new Error('Enter a whole number of bags.');
  const unit=amount(price),off=amount(discount||'0'),listed=unit*Number(quantity);
  if(!Number.isSafeInteger(listed)||listed>9999999900)throw new Error('Order total is too large.');
  if(unit<=0||off>=listed)throw new Error('The discount must be less than the bag total.');
  return {listed:listed/100,discount:off/100,subtotal:(listed-off)/100};
}
