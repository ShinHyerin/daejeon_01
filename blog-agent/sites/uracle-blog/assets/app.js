import {searchPosts} from '/assets/search.mjs';

const items=[...document.querySelectorAll('[data-post]')];
const input=document.querySelector('#post-search');
if (input) {
  let category='전체';
  const tabs=[...document.querySelectorAll('[data-category-filter]')];
  const count=document.querySelector('#results-count');
  const empty=document.querySelector('#empty-state');
  function update() {
    const matches=new Set(searchPosts(items.map((el,i)=>({id:i,title:el.dataset.title,excerpt:el.dataset.excerpt,category:el.dataset.category})),{query:input.value,category}).map(p=>p.id));
    items.forEach((el,i)=>el.hidden=!matches.has(i));
    count.textContent=`${input.value.trim() ? '검색 결과' : category} ${matches.size}개의 이야기`;
    empty.hidden=matches.size>0;
    tabs.forEach(tab=>{const active=tab.dataset.categoryFilter===category; tab.classList.toggle('active',active); tab.setAttribute('aria-pressed',String(active));});
  }
  input.addEventListener('input',update);
  document.querySelector('.search-form').addEventListener('submit',e=>{e.preventDefault();update();});
  tabs.forEach(tab=>tab.addEventListener('click',()=>{category=tab.dataset.categoryFilter;update();}));
  document.querySelector('#reset-search').addEventListener('click',()=>{input.value='';category='전체';update();input.focus();});
}
