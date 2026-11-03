export function searchPosts(posts, {query='', category='전체'}={}) {
  const terms=query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean);
  return posts.filter(p=>(category==='전체'||p.category===category)&&terms.every(t=>`${p.title} ${p.excerpt} ${p.category}`.toLocaleLowerCase('ko').includes(t)));
}
