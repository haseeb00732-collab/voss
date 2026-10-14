// Direct upload helper. Session/completion credentials stay in ignored runtime/.
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = path.resolve('out');
const runtime = path.resolve('runtime');
const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.txt':'text/plain; charset=utf-8','.png':'image/png','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json'};
async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes:true});
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir,e.name)) : path.join(dir,e.name)))).flat();
}
await mkdir(runtime,{recursive:true});
if(process.argv[2]==='manifest') {
  const manifest={};
  for(const file of await walk(root)) {
    const relative='/'+path.relative(root,file).replaceAll('\\','/');
    if(relative==='/_headers'||relative==='/_redirects') continue;
    const bytes=await readFile(file);
    manifest[relative]={hash:createHash('sha256').update(bytes).digest('hex').slice(0,32),size:bytes.length};
  }
  await writeFile(path.join(runtime,'assets-manifest.json'),JSON.stringify(manifest));
  console.log(JSON.stringify(manifest));
} else if(process.argv[2]==='upload') {
  const session=JSON.parse(await readFile(path.join(runtime,'assets-session.json'),'utf8'));
  const manifest=JSON.parse(await readFile(path.join(runtime,'assets-manifest.json'),'utf8'));
  let completion=session.buckets.length===0 ? session.jwt : null;
  for(const bucket of session.buckets) {
    const form=new FormData();
    for(const hash of bucket) {
      const relative=Object.keys(manifest).find(p=>manifest[p].hash===hash);
      if(!relative) throw new Error('Asset absent from local manifest');
      const bytes=await readFile(path.join(root,relative.slice(1)));
      if(createHash('sha256').update(bytes).digest('hex').slice(0,32)!==hash) throw new Error('Build changed since manifest');
      form.append(hash,new Blob([bytes.toString('base64')],{type:mime[path.extname(relative)]||'application/octet-stream'}),hash);
    }
    const response=await fetch('https://api.cloudflare.com/client/v4/accounts/9d0d63daf3c22d34aa586059e6069f64/workers/assets/upload?base64=true',{
      method:'POST',headers:{Authorization:`Bearer ${session.jwt}`},body:form,signal:AbortSignal.timeout(90000)
    });
    const body=await response.json();
    if(!response.ok||!body.success) throw new Error(`Asset upload failed (${response.status}): ${JSON.stringify(body.errors)}`);
    if(body.result?.jwt) completion=body.result.jwt;
  }
  if(!completion) throw new Error('No completion token returned');
  await writeFile(path.join(runtime,'assets-completion.json'),JSON.stringify({jwt:completion}));
  console.log('All static dashboard assets uploaded.');
} else { throw new Error('Use manifest or upload'); }
