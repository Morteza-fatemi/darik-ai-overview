// Real demo logic executed with a tiny offline DOM harness (no dependencies).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const html = readFileSync(new URL('../demo/index.html', import.meta.url), 'utf8');
function boot() {
  const ids = ['status','analyze','reset','current-label','prior-label','change-label','aov-label','current','prior','change','aov','trace'];
  const nodes = new Map(ids.map(id => [id, {
    value: id==='status' ? 'paid' : '',
    textContent: '',
    children: [],
    listeners: {},
    addEventListener(name, cb) { this.listeners[name]=cb; },
    replaceChildren(...children) { this.children=children; }
  }]));
  const document = {
    getElementById: id => { assert.ok(nodes.has(id), 'unknown DOM ID: '+id); return nodes.get(id); },
    createElement: () => ({className:'',textContent:''})
  };
  const js = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(js, 'inline script exists for file:// offline demo');
  runInNewContext(js, {document, Intl});
  const get=id=>nodes.get(id);
  return {get, select:val=>{get('status').value=val;get('analyze').listeners.click();}};
}
test('paid view reports only paid revenue and correct AOV',()=>{
  const {get}=boot();
  const fmt=n=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(n);
  assert.equal(get('current').textContent,fmt(1000)+' واحد');
  assert.equal(get('prior').textContent,fmt(1500)+' واحد');
  assert.equal(get('aov').textContent,fmt(500)+' واحد');
  assert.equal(get('change').textContent,fmt(-100/3)+'٪');
  assert.match(get('current-label').textContent,/فروش پرداخت‌شده/);
  assert.match(get('trace').children[4].textContent,/فقط سفارش‌های پرداخت‌شده/);
});
test('all-status view never labels sums including cancelled orders as revenue',()=>{
  const {get,select}=boot();select('all');
  const fmt=n=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(n);
  assert.equal(get('current').textContent,fmt(1100)+' واحد');
  assert.equal(get('prior').textContent,fmt(1700)+' واحد');
  for(const id of ['current-label','prior-label','change-label','aov-label']){
    assert.match(get(id).textContent,/نه (?:تغییر )?فروش|نه AOV فروش/);
  }
  assert.match(get('trace').children[4].textContent,/سفارش‌های لغوشده/);
  assert.match(get('trace').children[4].textContent,/فروش تحقق‌یافته نیست/);
});
test('reset returns paid semantics after all-status view',()=>{
  const {get,select}=boot();select('all');get('reset').listeners.click();
  assert.equal(get('status').value,'paid');
  assert.match(get('current-label').textContent,/فروش پرداخت‌شده/);
  assert.match(get('current').textContent,/۱٬۰۰۰/);
});
test('offline demo contains no networking entry points',()=>{
  assert.doesNotMatch(html,/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
  assert.match(html,/کاملاً ساختگی و آفلاین/);
});
