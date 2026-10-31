// Owner-supplied website copy, 30 October 2026. Delivery override: 2–4 days.
export const DELIVERY_WINDOW = '2–4 calendar days';
export const DELIVERY_ESTIMATE = `${DELIVERY_WINDOW} after confirmation`;
export const EXCHANGE_SUMMARY = 'Eligible unused bags may be exchanged within 7 calendar days of delivery. No change-of-mind refunds; legal remedies for faulty or incorrect items remain available.';
export type CopySection = { title: string; paragraphs: string[] };

export const STORY: CopySection[] = [
  {title:'A different kind of premium.',paragraphs:[
    "We're a young team from Lahore with a love for fashion, an eye for detail and a belief that good style shouldn't be reserved for those willing to spend a fortune.",
    "That's the thinking behind VOSS.",
    'We wanted to build a brand that brings the look and feel of premium fashion closer to everyday life. Beautiful shapes, considered details, good quality and prices that actually make sense.',
    "Because to us, premium isn't just about how much something costs. It's about how it looks, how it feels and the confidence you carry with it.",
  ]},
  {title:'Young minds. A bigger vision.',paragraphs:[
    'Pakistan has no shortage of style, creativity or people with something new to bring to fashion.',
    "As a young, Pakistani-owned brand, we want to be part of that movement. We have our own taste, our own ideas and the ambition to build something that feels at home in Pakistan while one day earning recognition beyond it.",
    "We're not here to imitate the big names. We want VOSS to grow into a name with its own identity.",
  ]},
  {title:'This is only the beginning.',paragraphs:[
    "We've started with handbags because we believe the right bag can bring an entire look together.",
    "But our vision doesn't stop here.",
    'As VOSS grows, we plan to explore clothing, fragrances and more, all with the same approach: a premium experience at a price that stays within reach.',
    "We're at the beginning of something we believe in. And we're building it one collection at a time.",
    'VOSS. Made for your kind of style.',
  ]},
];

export const RETURNS: CopySection[] = [
  {title:'Seven-day exchanges',paragraphs:["Prefer another colour or style? Request an exchange within 7 calendar days of delivery. The bag must be unused, in its original condition, with its supplied tags, packaging and accessories. Keep your order number or proof of purchase.","Exchanges depend on stock availability; we'll confirm any price difference in advance."]},
  {title:'Faulty or incorrect items',paragraphs:["If your order arrives faulty, damaged or different from what you ordered, contact us as soon as possible with your order number, a short description and clear photographs. We'll review the issue and arrange an appropriate remedy, including any refund or other resolution required by law. Legal rights are not restricted to the voluntary exchange window."]},
  {title:'How to make a request',paragraphs:["Message us on WhatsApp with your order number and reason. We'll review the request and send return instructions. Please don't send an item until we've shared the address. Pack it securely and keep courier tracking. Once received, we'll inspect the item and confirm the next steps."]},
  {title:'Delivery costs',paragraphs:["Customers normally pay return delivery for voluntary exchanges. Replacement delivery charges, if any, will be confirmed beforehand. For faulty or incorrect items, we'll cover or reimburse shipping where applicable consumer law requires it."]},
  {title:'Refunds',paragraphs:['VOSS offers eligible exchanges rather than refunds for a change of mind. Refunds and other remedies remain available wherever required by applicable consumer law.']},
  {title:'Sale & clearance',paragraphs:['Regular discounted items may be exchanged if eligible. Products clearly marked Final Sale / Clearance before checkout are not eligible for voluntary exchanges. Statutory rights for faulty or incorrect products are unaffected.']},
  {title:'Exclusions',paragraphs:['Voluntary exchanges do not cover used, altered or improperly damaged bags, items missing supplied components, or clearly identified final-sale items. These exclusions do not override rights under consumer law.']},
];

export const SHIPPING: CopySection[] = [
  {title:'Where we deliver',paragraphs:['VOSS currently delivers within Lahore, Pakistan. Other cities are not yet covered by our standard service.']},
  {title:'When it arrives',paragraphs:[`Orders are estimated to arrive within ${DELIVERY_ESTIMATE}. Calendar days include weekends and holidays; actual courier operations may vary. Unexpected courier or weather delays can occur. Contact us if delivery goes beyond the estimate.`]},
  {title:'Delivery charges',paragraphs:['To welcome our first customers, the first 30 eligible successfully placed website orders receive free Lahore delivery. After that, delivery is Rs 150 per order. The applicable charge appears before you submit checkout. Adding a bag to cart does not reserve a free-delivery place.']},
  {title:'Payment',paragraphs:['We offer Cash on Delivery. Pay the total shown at checkout when the parcel arrives. No online card payment is available.']},
  {title:'Your details',paragraphs:['Please provide a complete Lahore address and an active phone number. For corrections or delivery problems, contact us promptly on WhatsApp with your order number. Changes may not be possible after dispatch.']},
];

export const ORDER_HELP: CopySection[] = [
  {title:'Place your order',paragraphs:['Choose your bag and colour, add it to your cart, review quantity and price, then enter your complete Lahore delivery address at checkout. Place your order using Cash on Delivery and save the order reference shown on the success screen.','You can order directly on voss.pk — no message required.']},
  {title:'After checkout',paragraphs:[`Once confirmed, we'll prepare your order. We'll contact you if something needs checking. Delivery is estimated at ${DELIVERY_ESTIMATE}; payment is collected when your parcel arrives.`]},
  {title:'Order status',paragraphs:["Want an update? Send your order number on WhatsApp. We'll share the delivery information currently available."]},
  {title:'Changes & cancellations',paragraphs:["Need a different colour, quantity or address? Message us promptly with your order number. We'll try to update or cancel the order before dispatch. Changes may not be possible once it's with the courier; legal rights remain unaffected."]},
  {title:'Checkout trouble',paragraphs:["If you don't know whether your order went through, contact us before trying again to avoid duplicates. Share what happened and any order reference shown."]},
];

export const TERMS: CopySection[] = [
  {title:'Orders & availability',paragraphs:['Order directly through voss.pk. Adding an item to your bag does not reserve it. Successful checkout shows an order reference. Orders remain subject to stock and confirmation.']},
  {title:'Prices & payment',paragraphs:['Prices are in PKR. The final amount, including delivery, appears before order submission. Cash on Delivery is currently available; online card payments are not.']},
  {title:'Delivery',paragraphs:[`Lahore only. Estimated ${DELIVERY_ESTIMATE}. First 30 eligible website orders receive free delivery; then Rs 150 per order.`]},
  {title:'Changes & cancellations',paragraphs:['Contact us before dispatch to request changes or cancellation. Once dispatched, some changes may not be possible.']},
  {title:'Returns & exchanges',paragraphs:['Eligible unused bags can be exchanged within 7 calendar days. Returns are for faulty, damaged or incorrect items. No change-of-mind refunds. Return shipping normally paid by customer, subject to applicable law. See the full Returns & Exchanges policy.']},
  {title:'Product information',paragraphs:['We aim to describe and photograph products accurately. Slight colour differences can occur due to lighting and screens.']},
  {title:'Privacy & data',paragraphs:['We handle order and support information as described in our Privacy Notice.']},
  {title:'Consumer rights',paragraphs:['Nothing in these terms excludes or limits consumer rights and remedies that cannot lawfully be excluded.']},
  {title:'Contact',paragraphs:['WhatsApp: 0310 7417990. VOSS is an online-only brand based in Lahore, Pakistan.']},
];

export const PRIVACY: CopySection[] = [
  {title:'What we collect',paragraphs:['Names, phone numbers, delivery addresses, order items, totals and information customers choose to send to support. Optional email, postal code or delivery notes may also be provided.']},
  {title:'Why we use it',paragraphs:['To process orders, arrange deliveries, respond to requests, maintain records and protect the website. An order phone number does not itself subscribe anyone to marketing.']},
  {title:'Who receives it',paragraphs:['Authorised VOSS team members; couriers and hosting, database and other service providers as needed for fulfilment and operations.']},
  {title:'Browser & security',paragraphs:['The cart is saved in the customer browser; checkout uses a temporary retry identifier. Hosting/security providers may process technical information such as IP addresses.']},
  {title:'Payments & social apps',paragraphs:["COD is used; card numbers are not collected by the website. WhatsApp, Instagram and Facebook messages are also subject to those platforms' policies."]},
  {title:'Internal dashboard',paragraphs:['A separate business dashboard uses Google sign-in for approved team accounts and basic profile information. It does not request Gmail message or Drive file access.','Signing in does not grant access to business records: a VOSS administrator must approve the account first. Team account details are used for access control and to record who changes business records.']},
  {title:'Retention & requests',paragraphs:['Records are retained as needed for orders, support and legal requirements. Customers may contact VOSS to request access, correction or deletion where appropriate.']},
  {title:'Contact',paragraphs:['For privacy questions, message VOSS privately on WhatsApp: 0310 7417990.']},
];

export const FAQS = [
  {title:'Orders',questions:[
    ['How do I order?','Choose a bag and colour, add it to your cart and place the order directly on voss.pk.'],
    ['How do I know it worked?','Save the order reference shown after successful checkout. If unsure, ask us before trying again.'],
    ['Can I change or cancel an order?','Message us before dispatch with your order number; changes depend on order status.'],
    ['What if a colour is unavailable?','Browse other shades or message us to ask about availability.'],
  ]},
  {title:'Delivery & payment',questions:[
    ['Where do you deliver?','Lahore only, for now.'],
    ['How long does delivery take?',`Usually ${DELIVERY_WINDOW} after order confirmation.`],
    ['How much is delivery?','Rs 150 per order, except the first 30 eligible website orders, which receive free delivery.'],
    ['How will I know if delivery is free?','The qualifying free-delivery amount appears in your checkout total.'],
    ['Can I pay on arrival?','Yes. We currently offer Cash on Delivery.'],
    ['How can I track an order?','Send your order number on WhatsApp for a status update.'],
  ]},
  {title:'Returns & exchanges',questions:[
    ['Can I exchange a bag?','Eligible unused bags can be exchanged within 7 calendar days after delivery.'],
    ['Can I change to another colour?','Yes, if available. Any price difference is confirmed first.'],
    ['Do you refund change-of-mind orders?','No. We offer eligible exchanges instead.'],
    ['What if I receive a faulty or incorrect bag?','Send your order number and photos promptly; legal remedies remain available.'],
    ['Who pays return shipping?','Customers normally pay for voluntary exchanges; applicable legal rights take priority.'],
    ['Can sale items be exchanged?','Regular discounted items may qualify; clearly marked Final Sale/Clearance items do not qualify for voluntary exchanges.'],
  ]},
  {title:'Products & VOSS',questions:[
    ['Will colours match the photographs?','We aim for accuracy, but lighting and screens can cause slight differences.'],
    ['How do I check the size or material?','See the product page, or ask us if a detail is missing.'],
    ['Do you have a store?','Not currently. VOSS is online only and based in Lahore.'],
    ['What else is VOSS planning?','We started with handbags and hope to expand into clothing, fragrances and more.'],
  ]},
];
