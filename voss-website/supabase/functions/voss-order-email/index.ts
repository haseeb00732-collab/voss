import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

// Called by the checkout server or a private scheduled job, never by the browser.
Deno.serve(async request => {
  const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!service || request.headers.get('authorization')!==`Bearer ${service}`)return reply({error:'Unauthorized'},401);
  const key=Deno.env.get('BREVO_API_KEY'),sender=Deno.env.get('VOSS_EMAIL_FROM');
  // Explicit recipient approved by the business. Never accept recipients from requests.
  const recipient='haseeb00732@gmail.com';
  if(!key||!sender)return reply({configured:false},503);
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:jobs,error}=await admin.rpc('voss_email_claim');
  if(error)return reply({error:'Could not read email queue'},503);
  let accepted=0,failed=0;
  for(const job of jobs||[]) {
    let sent=false,message='';
    try {
      const result=await fetch('https://api.brevo.com/v3/smtp/email',{
        method:'POST',headers:{'content-type':'application/json','api-key':key},signal:AbortSignal.timeout(15000),
        body:JSON.stringify({sender:{name:'VOSS',email:sender},to:[{email:recipient}],
          subject:`New VOSS order: ${job.reference}`,
          textContent:`A website order has been received.\n\nReference: ${job.reference}\nCash on delivery: Rs ${job.total_pkr}\n\nSign in to view the bags, customer details and delivery address:\nhttps://voss-business.haseeb00732.workers.dev/\n\nThe customer has already placed this order on the website.`,
          headers:{idempotencyKey:job.mail_key}})
      });
      const body=await result.json();
      sent=(result.ok && typeof body.messageId==='string') || (!result.ok && body.code==='duplicate_parameter');
      message=typeof body.messageId==='string'?body.messageId:sent?'Previously accepted by Brevo':'';
    } catch { /* No credentials, provider bodies or customer data in logs. */ }
    const {data:finished,error:finishError}=await admin.rpc('voss_email_finish',{
      p_id:job.job_id,p_lease:job.lease,p_sent:sent,p_message:message
    });
    if(sent && finished && !finishError)accepted++;else failed++;
  }
  return reply({accepted,failed});
});
