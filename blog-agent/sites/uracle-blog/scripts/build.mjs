import {readFile, mkdir, mkdtemp, writeFile, cp, access, rename, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validatePosts, renderHome, renderPost, renderNotFound} from '../lib/site.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const posts=validatePosts(JSON.parse(await readFile(path.join(root,'content/posts.json'),'utf8'))).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
const assets=['style.css','app.js','uracle-logo.png','uracle-office.png','favicon.svg'];
await Promise.all(assets.map(f=>access(path.join(root,'assets',f))));
await Promise.all(posts.filter(p=>p.thumbnail).map(p=>access(path.join(root,p.thumbnail.src.slice(1)))));
const staging=await mkdtemp(path.join(root,'.build-staging-'));
async function cleanOwnedDirectory(target) {
  const resolved=path.resolve(target);
  if(path.dirname(resolved)!==root||!(path.basename(resolved)==='dist'||path.basename(resolved).startsWith('.build-staging-'))) throw new Error('Unexpected build output directory');
  await rm(resolved,{recursive:true,force:true});
}
try {
  await cp(path.join(root,'assets'),path.join(staging,'assets'),{recursive:true});
  await cp(path.join(root,'lib/search.mjs'),path.join(staging,'assets/search.mjs'));
  await writeFile(path.join(staging,'index.html'),renderHome(posts));
  await writeFile(path.join(staging,'404.html'),renderNotFound());
  for (const post of posts) {
    const dir=path.join(staging,'posts',post.slug);
    await mkdir(dir,{recursive:true});
    await writeFile(path.join(dir,'index.html'),renderPost(post));
  }
  const output=path.join(root,'dist');
  await cleanOwnedDirectory(output);
  await rename(staging,output);
  console.log(`Built ${posts.length} article(s), homepage and 404 into ${output}`);
} finally {
  await cleanOwnedDirectory(staging);
}
