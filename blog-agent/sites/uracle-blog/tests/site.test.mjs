import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePosts, renderHome, renderPost, searchPosts } from '../lib/site.mjs';

const post = {slug:'company-overview',title:'유라클 AI와 모바일',category:'회사 소식',publishedAt:'2026-11-03',excerpt:'공식 홈페이지에서 살펴본 사업 영역',sections:[{heading:'사업 소개',paragraphs:['제품을 소개합니다.'],highlight:'공식 자료를 확인했습니다.'}],summary:['네 가지 사업 영역'],sources:[{title:'유라클 홈페이지',url:'https://uracle.co.kr/',checkedAt:'2026-11-03'}],eventKey:'overview-2026-11-03'};

test('rejects duplicate URLs and unsafe slugs before publishing',()=>{
  assert.throws(()=>validatePosts([post,post]),/중복/);
  assert.throws(()=>validatePosts([{...post,slug:'../private'}]),/주소/);
});
test('requires trustworthy source metadata and valid publication dates',()=>{
  assert.throws(()=>validatePosts([{...post,sources:[]}]),/출처/);
  assert.throws(()=>validatePosts([{...post,sources:[{title:'bad',url:'javascript:alert(1)',checkedAt:'2026-11-03'}]}]),/출처/);
  assert.throws(()=>validatePosts([{...post,publishedAt:'2999-11-03'}]),/게시일/);
  assert.throws(()=>validatePosts([{...post,publishedAt:'2026-02-31'}]),/게시일/);
});
test('articles contain the complete readable body without JavaScript',()=>{
  const html=renderPost(post);
  assert.ok(html.includes('제품을 소개합니다.'));
  assert.ok(html.includes('핵심 요약'));
  assert.ok(html.includes('2026.11.03'));
  assert.ok(html.includes('https://uracle.co.kr/'));
});
test('untrusted characters remain text in titles and article paragraphs',()=>{
  const html=renderPost({...post,title:'<script>alert(1)</script>',sections:[{paragraphs:['<img src=x onerror=alert(1)> & text']}]});
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt; &amp; text'));
  assert.ok(!html.includes('<img src=x'));
});
test('home includes the actual article URL and usable search controls',()=>{
  const html=renderHome([post]);
  assert.ok(html.includes('/posts/company-overview/'));
  assert.ok(html.includes('type="search"'));
  assert.ok(html.includes('aria-live="polite"'));
});
test('search combines category and Korean whitespace-separated terms',()=>{
  const ai={...post,slug:'ai',category:'AI',title:'아테나 AI 에이전트',excerpt:'기업의 업무를 지원합니다.'};
  assert.equal(searchPosts([post,ai],{query:'  아테나   기업 ',category:'AI'}).length,1);
  assert.equal(searchPosts([post,ai],{query:'없는검색',category:'전체'}).length,0);
  assert.equal(searchPosts([post,ai],{query:'아테나',category:'모바일 플랫폼'}).length,0);
  assert.equal(searchPosts([post,ai],{query:'',category:'전체'}).length,2);
});

test('unsafe reading time and malformed headings cannot enter an article',()=>{
  assert.throws(()=>validatePosts([{...post,readMinutes:'<img src=x onerror=alert(1)>'}]),/읽기 시간/);
  assert.throws(()=>validatePosts([{...post,readMinutes:0}]),/읽기 시간/);
  assert.throws(()=>validatePosts([{...post,sections:[{heading:42,paragraphs:['본문']}]}]),/소제목/);
  const html=renderPost({...post,readMinutes:'<img src=x onerror=alert(1)>'});
  assert.ok(!html.includes('<img src=x'));
});

test('each article uses its own artwork while the homepage keeps its company photo',()=>{
  const illustrated={...post,thumbnail:{src:'/assets/thumb-example.png',alt:'AI 권한과 비용 관리',width:1536,height:1024}};
  const home=renderHome([illustrated]);
  const article=renderPost(illustrated);
  assert.ok(home.includes('src="/assets/thumb-example.png"'));
  assert.equal((home.match(/src="\/assets\/uracle-office.png"/g)||[]).length,1);
  assert.ok(article.includes('src="/assets/thumb-example.png"'));
  assert.ok(article.includes('AI 권한과 비용 관리'));
  assert.ok(!article.includes('src="/assets/uracle-office.png"'));
  assert.ok(!article.includes('사진: 유라클 공식 홈페이지'));
});
test('thumbnail metadata only permits local image assets and requires alternative text',()=>{
  assert.throws(()=>validatePosts([{...post,thumbnail:{src:'https://untrusted.example/image.png',alt:'image'}}]),/썸네일/);
  assert.throws(()=>validatePosts([{...post,thumbnail:{src:'/assets/../private.png',alt:'image'}}]),/썸네일/);
  assert.throws(()=>validatePosts([{...post,thumbnail:{src:'/assets/thumb-example.png',alt:''}}]),/썸네일/);
});
