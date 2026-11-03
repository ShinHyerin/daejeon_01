import test from 'node:test';
import assert from 'node:assert/strict';
import {cp,mkdir,mkdtemp,writeFile,access,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('a retry cannot resurrect a removed article from an interrupted build',async()=>{
  const fixture=await mkdtemp(path.join(tmpdir(),'uracle-build-test-'));
  try {
    for(const dir of ['scripts','lib','assets','content']) await cp(path.join(root,dir),path.join(fixture,dir),{recursive:true});
    const stale=path.join(fixture,'.build-staging/posts/retracted');
    await mkdir(stale,{recursive:true});
    await writeFile(path.join(stale,'index.html'),'RETRACTED ARTICLE');
    execFileSync(process.execPath,[path.join(fixture,'scripts/build.mjs')],{stdio:'pipe'});
    await assert.rejects(access(path.join(fixture,'dist/posts/retracted/index.html')));
    assert.ok((await readFile(path.join(fixture,'dist/index.html'),'utf8')).includes('유라클'));
    const current=JSON.parse(await readFile(path.join(fixture,'content/posts.json'),'utf8'));
    await writeFile(path.join(fixture,'content/posts.json'),JSON.stringify([current[0],current[0]]));
    assert.throws(()=>execFileSync(process.execPath,[path.join(fixture,'scripts/build.mjs')],{stdio:'pipe'}));
    assert.ok((await readFile(path.join(fixture,'dist/index.html'),'utf8')).includes('유라클'));
  } finally {
    const absolute=path.resolve(fixture);
    if(path.dirname(absolute)!==path.resolve(tmpdir())||!path.basename(absolute).startsWith('uracle-build-test-')) throw new Error('Unexpected fixture directory');
    await rm(absolute,{recursive:true,force:true});
  }
});
