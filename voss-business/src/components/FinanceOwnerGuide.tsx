'use client';
import {useEffect,useRef,useState} from 'react';
const sections=[
 ['1. Create an account and get access',[
  'Open https://voss-business.pages.dev/ and select Continue with Google. Use your own Gmail / Google account. Your first successful sign-in creates your VOSS account; there is no separate VOSS password.',
  'A new owner waits for approval before seeing private records. Haseeb signs in with his technical account, opens Settings, and uses Approve your team to approve the correct email and owner role. A viewer can read records but cannot change them.',
  'After approval, select Check access again or sign out and back in with the same Google account. Never share a Google password or verification code. Check the email before approving anyone.'
 ]],
 ['2. What each main section does',[
  'Overview: current website order activity and the free-delivery offer count. Orders: customer details, status, courier tracking and collection. Finance: actual sales, bills, cost items, profit and reports.',
  'Stock: manually record quantities and the purchase cost of each bag colour. A stock count is your latest physical count; it needs reviewing after sales, returns and purchases. It is not a bank balance or a purchase bill.',
  'Social: connected metrics or the setup guide. Settings: team approval for the technical administrator, account information, notification status and service health.'
 ]],
 ['3. Record an offline sale at a different price',[
  'In Finance select Add a sale, choose the article and colour, then enter how many bags. The standard catalogue price fills in as a starting point.',
  'If you negotiated a different final price per bag, change Price for one bag to that agreed price and choose No discount. This changes only this sale, not the website price.',
  'Alternatively keep the standard price, choose Yes to a discount, and enter the total discount for the entire order. Do not enter both a reduced final price and the same discount again.',
  'Example only, not a real sale: two bags at Rs 2,649 each, minus a total Rs 200 discount, gives Rs 5,098 for the bags. Delivery charged to the customer is added separately.',
  'Choose Instagram, WhatsApp, Facebook or In person and add a useful customer / order reference. Next, record the actual delivery stage and whether money has reached VOSS. Check costs, then review and Save this sale.',
  'For different articles or different per-bag prices in one offline order, use separate sale entries with the same order reference. Enter shared courier / customer delivery amounts only once and count an eligible free delivery only once.'
 ]],
 ['4. Delivery, COD and returns',[
  'Lahore customer delivery is Rs150 after the first 30 eligible free deliveries. The customer charge is income; the courier bill is a separate VOSS cost. They need not be equal.',
  'For a qualifying past offline order, use the first-30 checkbox only once for the order. It makes customer delivery zero and updates the shared offer count. Website orders already do this at checkout; do not enter them again.',
  'Delivered means the bag reached the customer. Money received means VOSS actually received the payment. Finance counts revenue only when both are true.',
  'Returned or Refused orders must use the correct status. Record actual outward and return courier costs, COD fees, refunds actually paid and any damaged / lost stock. Reusable returned bags are not automatically a stock loss. Do not mark an expected refund as already paid.'
 ]],
 ['5. Add a bill or create your own cost item',[
  'Add expense is for a real bill. Choose packaging, marketing, delivery, content, tools, product purchases or other. Describe it, enter the amount/date/payer and whether it is paid. You may enter a one-off expense manually.',
  'Cost items is your reusable list: create any cost name, set an optional usual rate and choose the unit. Saving a cost item does not create spending.',
  'Select Record expense beside an item. Change quantity or actual rate if this bill differs; the total calculates automatically. Then enter payer and payment details and save. A usual rate and the total of past bills are different figures.',
  'Edit changes a rate or name. Archive hides an unused item; Include archived items lets you restore it. Past expenses keep their amounts. Correct or void a real bill through Sales & expenses, not by changing the usual rate.',
  'Do not record the same bill as an expense, a campaign spend entry and an order cost. Use one actual posting. New expense retries use a reference to prevent accidental duplicate saves.'
 ]],
 ['6. Bag costs and shared usual rates',[
  'Bag purchase cost is what VOSS paid for the bag, not its selling price. Stock stores a unit cost per colour. A sale uses a saved cost snapshot, so changing a later stock price does not rewrite an older sale.',
  'Under Cost items open Usual costs for new sales. The owners share those settings. Packaging may be recorded as bulk expense bills or as per-sale usage; choose the matching mode to avoid counting it twice.',
  'Marketing per bag is a planning allowance. Actual ad spend is recorded once as a bill or campaign day. An estimated allowance is not automatically an actual advertising payment.',
  'Leave unknown costs blank and leave Costs checked unticked until the cost of the bag and all charges are known. Missing costs mean profit is incomplete; zero should mean there really was no cost.'
 ]],
 ['7. Understand the totals, sheet and reports',[
  'Total spent includes recorded stock purchases, other bills and additional order / campaign costs. Recorded unpaid bills are included in cost totals, so this is not a bank balance. Cash movement uses payment dates and excludes unrecorded opening balances.',
  'Bags sold counts delivered-and-collected sale quantities. Money received in the profit summary is recognised income from delivered-and-collected orders. Customer payments pending are active uncollected amounts, not earned revenue yet.',
  'Profit = recognised revenue minus the cost of bags sold, order costs, operating expenses and campaign spend. Stock purchases are not deducted a second time. Margin = profit divided by recognised revenue, multiplied by 100; no margin is shown when revenue is zero or costs are incomplete.',
  'The Summary spending table groups costs by category. The reconciliation directly below explains why spending and loss differ. Tap a summary number for its calculation.',
  'Open Your original spreadsheet to see every source row, original amount and current amount. Those bills are already recorded, so do not add them again. Date warnings need checking against the original document.',
  'All dates includes the full history. Choose This month, This week or a custom range for a period report. Cost items shows clearly labelled all-date actual bill totals. Use CSV exports or Print / PDF to share a report.',
  'Weekly reports are private snapshots for weeks beginning Monday. The schedule is Monday 9:00 AM Pakistan time. Email copies require the email service to be connected; seeing a report in the app does not mean an email was sent.'
 ]],
 ['8. Daily routine and connection limits',[
  'Daily: check new orders, update delivery stages, record collected COD, add offline sales and real bills, and review any missing costs. Reconcile recorded collections with the courier settlement and actual cash / account records.',
  'Weekly: review profit and pending cash, stock counts, returns, campaign results and date warnings. At month end: choose the month, check the breakdown and export the reports.',
  'New-order browser alerts require permission and an open dashboard tab. Email and Meta metrics/messages require their own connected services. Social → Connections contains the setup steps; disconnected services must not be treated as live.',
  'If Google sign-in fails, check the selected Google account, browser/network access and the displayed message. If it says Waiting for approval, the account was created and needs team approval. Sign out on shared devices. These records help manage the business; accuracy still depends on recording the real sales, payments and costs.'
 ]]
] as const;
export function FinanceOwnerGuide(){
 const [open,setOpen]=useState(false);return <><button className="text-button finance-guide-link" onClick={()=>setOpen(true)}>How to use this dashboard</button>{open&&<GuideDialog close={()=>setOpen(false)}/>}</>;
}
function GuideDialog({close}:{close:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);useEffect(()=>{const e=dialog.current,previous=document.activeElement as HTMLElement;e?.showModal();return()=>{e?.close();previous?.focus();};},[]);
 function download(){const text='# VOSS owner dashboard guide\n\n'+sections.map(([title,steps])=>'## '+title+'\n\n'+steps.map((step,i)=>`${i+1}. ${step}`).join('\n\n')).join('\n\n');const u=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='VOSS-owner-dashboard-guide.txt';a.click();URL.revokeObjectURL(u);}
 return <dialog ref={dialog} className="order-dialog finance-dialog owner-guide-dialog" onCancel={e=>{e.preventDefault();close();}} aria-labelledby="owner-guide-title"><header><div><h2 id="owner-guide-title">VOSS owner guide</h2><p>Learn it here, then use the same guide to train the owners.</p></div><button className="icon-button" aria-label="Close owner guide" onClick={close}>×</button></header><div className="dialog-scroll"><button className="secondary" onClick={download}>Download the guide</button>{sections.map(([title,steps])=><section key={title}><h3>{title}</h3><ol>{steps.map(step=><li key={step}>{step}</li>)}</ol></section>)}</div></dialog>;
}
