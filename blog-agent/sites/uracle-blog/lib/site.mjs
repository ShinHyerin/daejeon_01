export const categories = ['전체', '회사 소식', 'AI', '모바일 플랫폼'];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
export const dateLabel = value => String(value).replaceAll('-', '.');

export function validatePosts(posts) {
  if (!Array.isArray(posts)) throw new Error('원고 목록이 필요합니다.');
  const slugs = new Set(), events = new Set();
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  for (const p of posts) {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(p.slug)) throw new Error('유효하지 않은 글 주소입니다.');
    if (slugs.has(p.slug) || events.has(p.eventKey)) throw new Error('중복 글 주소 또는 사건입니다.');
    slugs.add(p.slug); events.add(p.eventKey);
    if (!p.title?.trim() || !p.excerpt?.trim() || !categories.slice(1).includes(p.category) || !p.eventKey?.trim()) throw new Error('원고의 제목·요약·분류·사건 기록이 필요합니다.');
    if (!validDate(p.publishedAt) || p.publishedAt > today) throw new Error('게시일을 확인해 주세요.');
    if (p.thumbnail && (typeof p.thumbnail.src !== 'string' || !/^\/assets\/[a-z0-9-]+\.(?:png|webp|jpg)$/.test(p.thumbnail.src) || typeof p.thumbnail.alt !== 'string' || !p.thumbnail.alt.trim() || (p.thumbnail.width !== undefined && (!Number.isSafeInteger(p.thumbnail.width)||p.thumbnail.width<1)) || (p.thumbnail.height !== undefined && (!Number.isSafeInteger(p.thumbnail.height)||p.thumbnail.height<1)))) throw new Error('썸네일 파일과 대체 텍스트를 확인해 주세요.');
    if (p.readMinutes !== undefined && (!Number.isSafeInteger(p.readMinutes) || p.readMinutes < 1 || p.readMinutes > 120)) throw new Error('읽기 시간은 1~120분의 정수여야 합니다.');
    if (!Array.isArray(p.sections) || !p.sections.length || p.sections.some(s=>!Array.isArray(s.paragraphs) || !s.paragraphs.length || s.paragraphs.some(t=>typeof t !== 'string' || !t.trim()))) throw new Error('본문이 필요합니다.');
    if (p.sections.some(s=>s.heading !== undefined && typeof s.heading !== 'string')) throw new Error('소제목은 텍스트여야 합니다.');
    if (!Array.isArray(p.summary) || !p.summary.length || p.summary.length > 3 || p.summary.some(t=>typeof t !== 'string' || !t.trim())) throw new Error('핵심 요약이 필요합니다.');
    if (!Array.isArray(p.sources) || !p.sources.length) throw new Error('출처가 필요합니다.');
    for (const s of p.sources) {
      let url; try {url = new URL(s.url);} catch {throw new Error('출처 주소를 확인해 주세요.');}
      if (url.protocol !== 'https:' || url.username || url.password || !s.title?.trim() || !validDate(s.checkedAt) || s.checkedAt > today || (s.publishedAt && !validDate(s.publishedAt))) throw new Error('출처 정보가 올바르지 않습니다.');
    }
    if (p.sections.some(s=>s.sourceIndex !== undefined && (!Number.isInteger(s.sourceIndex) || !p.sources[s.sourceIndex]))) throw new Error('본문의 출처 연결을 확인해 주세요.');
  }
  return posts;
}

export {searchPosts} from './search.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
function postImage(post) {
  return post.thumbnail ? {...post.thumbnail,caption:'글 내용을 바탕으로 제작한 이미지'} : {src:'/assets/uracle-office.png',alt:'유라클 공식 회사소개 페이지의 사무 공간',width:1536,height:710,caption:'사진: 유라클 공식 홈페이지'};
}
function imageTag(post,lazy=false) {
  const img=postImage(post);
  return `<img src="${esc(img.src)}" width="${esc(img.width||1536)}" height="${esc(img.height||1024)}" alt="${esc(img.alt)}"${lazy?' loading="lazy"':''}>`;
}
function header() {
  return `<a class="skip-link" href="#main">본문 바로가기</a><header class="site-header"><div class="container header-inner"><a class="brand" href="/" aria-label="유라클 블로그 홈"><img src="/assets/uracle-logo.png" width="358" height="92" alt="uracle"><span class="brand-divider"></span><span class="brand-blog">블로그</span></a><nav aria-label="주 메뉴"><a href="/#journal">전체 글</a><a class="external-nav" href="https://uracle.co.kr/" target="_blank" rel="noopener noreferrer">유라클 홈페이지 ${arrow}</a></nav></div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="container footer-top"><a href="/" class="footer-brand"><img src="/assets/uracle-logo.png" alt="uracle" width="358" height="92"><span>유라클 블로그</span></a><p>기술의 변화와 유라클의 이야기를 기록합니다.</p><a href="https://uracle.co.kr/" target="_blank" rel="noopener noreferrer">유라클 홈페이지 ${arrow}</a></div><div class="container footer-bottom"><span>기사와 공식 자료를 바탕으로 정리한 콘텐츠입니다.</span><span>사진·로고 출처: 유라클</span></div></footer>`;
}
function shell(title, description, body, pageClass='') {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#ffffff"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${pageClass === 'article-page' ? 'article':'website'}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/style.css"><script type="module" src="/assets/app.js"></script></head><body class="${pageClass}">${header()}${body}${footer()}</body></html>`;
}
export function renderHome(posts) {
  const cards = posts.map((p,i)=>`<article class="post-card" data-post data-title="${esc(p.title)}" data-excerpt="${esc(p.excerpt)}" data-category="${esc(p.category)}"><a class="post-image-link" href="/posts/${esc(p.slug)}/" tabindex="-1" aria-hidden="true">${imageTag(p,true)}</a><div class="post-copy"><div class="post-meta"><span>${esc(p.category)}</span><span class="meta-divider"></span><time datetime="${esc(p.publishedAt)}">${dateLabel(p.publishedAt)}</time>${i === 0 ? '<span class="new-tag">NEW</span>':''}</div><h3><a href="/posts/${esc(p.slug)}/">${esc(p.title)}<span class="card-arrow" aria-hidden="true">↗</span></a></h3><p>${esc(p.excerpt)}</p><a class="text-link" href="/posts/${esc(p.slug)}/">이야기 읽기 <span aria-hidden="true">→</span></a></div></article>`).join('');
  const tabs = categories.map((c,i)=>`<button type="button" data-category-filter="${c}" aria-pressed="${i === 0}" class="category-tab${i === 0 ? ' active':''}">${c}</button>`).join('');
  return shell('유라클 블로그 | 기술과 소식을 한곳에서','유라클의 AI·모바일 기술과 회사 소식을 기사와 공식 자료로 살펴봅니다.',`<main id="main"><section class="hero container" aria-labelledby="hero-title"><div class="hero-top"><div><p class="eyebrow"><span></span> URACLE BLOG</p><h1 id="hero-title">유라클의 기술과 소식,<br><em>한곳에서.</em></h1></div><p class="hero-description">AI부터 모바일까지.<br>유라클이 만드는 기술과<br>그 안의 이야기를 전합니다.</p></div><div class="hero-photo"><img src="/assets/uracle-office.png" width="1536" height="710" alt="유라클 회사소개 페이지에 소개된 사무 공간"><div class="photo-label"><span class="label-dot"></span> PEOPLE · TECHNOLOGY · URACLE</div></div><div class="hero-bottom"><span>기술을 이해하는 또 하나의 시선</span><a href="#journal">최신 이야기 살펴보기 <span aria-hidden="true">↓</span></a></div></section><section class="journal container" id="journal" aria-labelledby="journal-title"><div class="section-heading"><div><p class="eyebrow">JOURNAL</p><h2 id="journal-title">새로운 이야기<span class="red-dot">.</span></h2></div><p>유라클의 오늘을 차근차근 읽어보세요.</p></div><div class="journal-toolbar"><div class="category-tabs" role="group" aria-label="글 분류">${tabs}</div><form class="search-form" role="search"><label class="sr-only" for="post-search">글 검색</label><svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10.8" cy="10.8" r="7.3"/><path d="m16.3 16.3 4.7 4.7"/></svg><input id="post-search" type="search" placeholder="어떤 이야기가 궁금하세요?" autocomplete="off"><button type="submit" class="search-submit">검색</button></form></div><div class="results-line"><p id="results-count" aria-live="polite">전체 <strong>${posts.length}</strong>개의 이야기</p><span>최신순</span></div><div class="post-list">${cards}</div><div class="empty-state" id="empty-state" hidden><span aria-hidden="true">⌕</span><h3>아직 해당하는 이야기가 없어요.</h3><p>다른 검색어나 분류로 찾아보세요.</p><button type="button" id="reset-search">전체 이야기 보기 <span aria-hidden="true">→</span></button></div></section><section class="explore-section"><div class="container explore-inner"><div><p class="eyebrow">EXPLORE URACLE</p><h2>어떤 기술을<br>만들고 있을까요<span class="red-dot">?</span></h2><p>유라클 공식 홈페이지에서<br>제품과 기술을 더 자세히 만나보세요.</p></div><div class="product-links"><a href="https://uracle.co.kr/athena-suite" target="_blank" rel="noopener noreferrer"><span><small>AI AGENT</small>Athena</span>${arrow}</a><a href="https://uracle.co.kr/aurda" target="_blank" rel="noopener noreferrer"><span><small>AI INFRA</small>AURDA</span>${arrow}</a><a href="https://uracle.co.kr/code-assistant" target="_blank" rel="noopener noreferrer"><span><small>AI CODING</small>Code Assistant</span>${arrow}</a><a href="https://uracle.co.kr/morpheus-suite" target="_blank" rel="noopener noreferrer"><span><small>MOBILE PLATFORM</small>Morpheus Suite</span>${arrow}</a></div></div></section></main>`);
}
export function renderPost(post) {
  post={...post,readMinutes:Number.isSafeInteger(post.readMinutes)&&post.readMinutes>0&&post.readMinutes<=120?post.readMinutes:3};
  const paragraphs=post.sections.map((s,i)=>`<section class="article-section"${s.heading ? ` aria-labelledby="section-${i}"`:''}>${s.heading ? `<h2 id="section-${i}">${esc(s.heading)}</h2>`:''}${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}${s.highlight ? `<p class="article-highlight"><strong>${esc(s.highlight)}</strong></p>`:''}${s.sourceIndex !== undefined ? `<a class="section-source" href="${esc(post.sources[s.sourceIndex].url)}" target="_blank" rel="noopener noreferrer">공식 제품 소개 ${arrow}</a>`:''}</section>`).join('');
  const sources = post.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ${arrow}</a><span>${s.publishedAt ? `원문 발행 ${dateLabel(s.publishedAt)} · `:''}확인 ${dateLabel(s.checkedAt)}</span></li>`).join('');
  const toc=post.sections.map((s,i)=>s.heading ? `<a href="#section-${i}">${esc(s.heading.replace(/^\d+\.\s*/,''))}</a>`:'').join('');
  return shell(`${post.title} | 유라클 블로그`,post.excerpt,`<main id="main" class="container"><div class="article-breadcrumb"><a href="/">홈</a><span aria-hidden="true">/</span><a href="/#journal">이야기</a><span aria-hidden="true">/</span><span>${esc(post.category)}</span></div><article><header class="article-header"><p class="eyebrow">${esc(post.category)} <span class="meta-divider"></span> URACLE JOURNAL</p><h1>${esc(post.title)}</h1><p class="article-deck">${esc(post.excerpt)}</p><div class="article-byline"><span class="byline-icon" aria-hidden="true">U</span><span>유라클 블로그</span><span class="byline-date">게시 <time datetime="${esc(post.publishedAt)}">${dateLabel(post.publishedAt)}</time> · ${post.readMinutes || 3}분 읽기</span></div></header><figure class="article-cover">${imageTag(post)}<figcaption>${esc(postImage(post).caption)}</figcaption></figure><div class="article-layout"><div class="article-body">${paragraphs}<section class="article-summary" aria-labelledby="summary-title"><p class="eyebrow">KEY TAKEAWAYS</p><h2 id="summary-title">핵심 요약</h2><ul>${post.summary.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section><section class="article-sources" aria-labelledby="sources-title"><h2 id="sources-title">자료와 출처</h2><p>아래 원문을 확인하고 내용을 정리했습니다.</p><ul>${sources}</ul></section><div class="article-end"><span class="end-symbol" aria-hidden="true">U</span><p>기술과 소식을 꾸준히 기록합니다.</p><a class="text-link" href="/#journal">다른 이야기 살펴보기 <span aria-hidden="true">→</span></a></div></div><aside class="article-toc" aria-label="글 목차"><p>이 글에서 다루는 이야기</p>${toc}<a href="#summary-title">핵심 요약</a></aside></div></article></main>`,'article-page');
}

export function renderNotFound() {
  return shell('페이지를 찾을 수 없어요 | 유라클 블로그','유라클 블로그에서 다른 이야기를 찾아보세요.','<main id="main" class="container not-found"><p class="eyebrow">404</p><h1>이야기를 찾을 수 없어요.</h1><p>주소를 확인하거나 전체 글에서 찾아보세요.</p><a class="text-link" href="/">블로그 홈으로 →</a></main>');
}
