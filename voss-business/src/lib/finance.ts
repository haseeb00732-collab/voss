import type {Analysis} from '@/components/FinanceInsights';
import { cloud, csvCell } from './business';

export const financeCategories = ['marketing','content','delivery','product','packaging','tools','other'] as const;
export type FinanceCategory = typeof financeCategories[number];
export const categoryLabels: Record<FinanceCategory,string> = { marketing:'Ads & marketing',content:'Content creation',delivery:'Delivery',product:'Product purchases',packaging:'Packaging',tools:'Tools & subscriptions',other:'Other costs' };
export type FinanceInput = {
  id?:string; version?:number; kind:'expense'|'sale'; entry_date:string; category:FinanceCategory;
  description:string; amount_pkr:number; payer:string; payment_status:'paid'|'unpaid'|'collected'|'pending';
  quantity:number; unit_cost_pkr:number|null; product_slug?:string|null; colour_key?:string|null; notes:string;
  settled_date?:string|null;
  packaging_cost_pkr?:number; delivery_cost_pkr?:number; marketing_cost_pkr?:number; other_cost_pkr?:number;
  delivery_charged_pkr?:number; free_delivery_offer?:boolean;
  costs_paid?:boolean; costs_settled_date?:string|null;
  cost_payer?:string; request_key?:string;
  fulfillment_status?:string; cod_fee_pkr?:number; return_courier_pkr?:number; returns_loss_pkr?:number; refund_pkr?:number; refund_date?:string|null; campaign_key?:string; post_id?:string; customer_key?:string; new_customer?:boolean|null; costs_complete?:boolean;
};
export type FinanceEntry = FinanceInput & {
  id:string; version:number; cogs_pkr:number|null; source_key:string|null;
  source_data:{file:string;row:number;original_row:string;gross_amount:number}|null;
  date_flag:string; voided_at:string|null; void_reason:string; created_at:string; updated_at:string;
};
export type FinanceSummary = {
  revenue_pkr:number; website_revenue_pkr:number; manual_revenue_pkr:number; cash_collected_pkr:number;
  expenses_pkr:number; cash_spent_pkr:number; product_purchases_pkr:number; operating_expenses_pkr:number;
  known_cogs_pkr:number; missing_cost_sales:number; sale_count:number; pending_cod_pkr:number;
  estimated_order_dates:number; delivery_revenue_pkr:number; cash_balance_pkr:number;
  gross_profit_estimate_pkr:number|null; net_profit_estimate_pkr:number|null;
};
export type InventoryItem = {
  product_slug:string; colour_key:string; name:string; article:string; colour_name:string;
  version:number; stock_on_hand:number|null; unit_cost_pkr:number|null; note:string;
  counted_at:string|null; sold_units:number;
};
export type InventoryInput = Pick<InventoryItem,'product_slug'|'colour_key'|'version'|'stock_on_hand'|'unit_cost_pkr'|'note'>;
export type FinanceHistory = {id:number;entity:string;entity_id:string;old_value:Record<string,unknown>|null;new_value:Record<string,unknown>;created_at:string;actor?:string};
export type FinanceData = {
  analysis?:Analysis;
  promotion?:{code:'FIRST30';used:number;maximum:number};
  entries:FinanceEntry[]; summary:FinanceSummary; weekly:(FinanceSummary & {week_start:string})[];
  categories:{category:FinanceCategory;amount_pkr:number}[]; payers:{payer:string;amount_pkr:number}[];
  inventory:InventoryItem[]; import:{count:number;original_total_pkr:number;flagged_dates:number};
  history:FinanceHistory[]; basis:Record<string,string>;
};
async function call<T>(name:string,parameters:Record<string,unknown>) {
  const {data,error}=await cloud.rpc(name,parameters);
  if(error) throw new Error(error.code==='42501'?'This account does not have owner access.':error.message);
  return data as T;
}
export const readFinance=(from:string|null=null,to:string|null=null)=>call<FinanceData>('voss_finance_read',{p_from:from||null,p_to:to||null});
export const saveFinance=(entry:FinanceInput)=>call<FinanceEntry>('voss_finance_save',{p_entry:entry});
export const voidFinance=(entry:Pick<FinanceEntry,'id'|'version'>,reason:string)=>call<FinanceEntry>('voss_finance_save',{p_entry:{id:entry.id,version:entry.version,void_reason:reason}});
export const saveInventory=(item:InventoryInput)=>call<InventoryItem>('voss_inventory_save',{p_item:item});
export const entryRevenue=(entry:FinanceEntry)=>entry.kind==='sale'?Math.round((entry.amount_pkr+(entry.delivery_charged_pkr||0))*100)/100:0;
export const entryAdditionalCosts=(entry:FinanceEntry)=>entry.kind==='sale'?Math.round(((entry.packaging_cost_pkr||0)+(entry.delivery_cost_pkr||0)+(entry.marketing_cost_pkr||0)+(entry.other_cost_pkr||0))*100)/100:entry.amount_pkr;
export function financeCsv(entries:FinanceEntry[]) {
  const rows=[['Date','Type','Category','Description','Product subtotal / expense PKR','Delivery charged PKR','Total sale revenue PKR','Paid by / received by','Payment','Payment date','Quantity','Unit cost PKR','COGS PKR','Packaging cost PKR','Delivery cost PKR','Marketing cost PKR','Other cost PKR','Additional costs paid','Costs payment date','Costs paid by','Counts toward first 30 deliveries','Notes','Source','Date warning','Voided','Void reason'],
    ...entries.map(e=>[e.entry_date,e.kind,categoryLabels[e.category],e.description,e.amount_pkr,e.delivery_charged_pkr||0,entryRevenue(e),e.payer,e.payment_status,e.settled_date,e.quantity,e.unit_cost_pkr,e.cogs_pkr,e.packaging_cost_pkr||0,e.delivery_cost_pkr||0,e.marketing_cost_pkr||0,e.other_cost_pkr||0,e.kind==='sale'?(e.costs_paid??true):'',e.costs_settled_date,e.cost_payer,e.free_delivery_offer??false,e.notes,e.source_key,e.date_flag,e.voided_at,e.void_reason])];
  return '\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
