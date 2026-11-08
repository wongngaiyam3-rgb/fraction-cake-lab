'use strict';

const app = document.querySelector('#app');
const classes = ['4A', '4B', '4C'];
const range = n => Array.from({ length: n }, (_, i) => i);
const fraction = (n, d) => `<span class="fraction" aria-label="${d}分之${n}"><span>${n}</span><span>${d}</span></span>`;
const f = fraction;
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const times = (a, b, c, d) => `${f(a,b)} <span>×</span> ${f(c,d)}`;
const chosen = (value, key) => value === key ? 'true' : 'false';

const choices = (id, title, text, options, answer, feedback, extra = {}) =>
  ({ id, title, text, options, answer, feedback, kind: 'choice', ...extra });
const fields = (id, title, text, inputs, feedback, extra = {}) =>
  ({ id, title, text, inputs, feedback, kind: 'fields', ...extra });
const input = (name, label, answer) => ({ name, label, answer });
const card = (id, title, text, kind, more = {}) => ({ id, title, text, kind, ...more });
const sizeOptions = [['less','較少'],['same','一樣多'],['more','較多']];

const halfHalf = { id:'hh', a:1, b:2, c:1, d:2, intro:true };
const halfThird = { id:'ht', a:1, b:2, c:1, d:3 };
const threeQuarter = { id:'tq', a:3, b:4, c:2, d:3 };
const practiceModel = { id:'pm', a:2, b:3, c:1, d:2 };

function modelSteps(q) {
  const {id,a,b,c,d} = q;
  const p = f(a,b), r = f(c,d), top = a*c, bottom = b*d, divisor = gcd(top,bottom);
  const steps = [];
  if (!q.intro) {
    steps.push(
      choices(id+'-columns', '先找出原有部分', `要表示整個蛋糕的 ${p}，先把蛋糕直分成多少等份？`,
        [2,3,4,5].map(n => [String(n), n+' 等份']), String(b), `整個蛋糕直分成 ${b} 等份。`,
        { q, part:'columns', hint:'分母表示把整個蛋糕平均分成多少份。' }),
      card(id+'-pick-cols', '選出剩下的蛋糕', `點選 ${a} 直欄，表示原來整個蛋糕的 ${p}。再點一次可取消。`,
        'pick-cols', { q, part:'pick-cols', feedback:`淺綠色部分是原來整個蛋糕的 ${p}。`, hint:'分子告訴你要選多少欄。' })
    );
  }
  steps.push(
    choices(id+'-rows', '再把剩下的蛋糕等分', `取剩下部分的 ${r}。應把這部分橫分成多少等份？`,
      [2,3,4,5].map(n => [String(n), n+' 等份']), String(d), `把剩下部分橫分成 ${d} 等份。`,
      { q, part:'rows', hint:`看第二個分數 ${r} 的分母。這次要分的是淺綠色部分。` }),
    card(id+'-pick-rows', '從剩下部分取出蛋糕', `點選 ${c} 橫行。斜線會標出在淺綠色部分中最後取走的蛋糕。`,
      'pick-rows', { q, part:'pick-rows', feedback:`你取出了剩下部分的 ${r}。`, hint:'看第二個分數的分子，然後點選相應數目的橫行。' }),
    fields(id+'-count', '數一數整個外框', '分割線延伸至原來的外框。數出整個蛋糕的格數，以及畫了斜線的格數。',
      [input('total','整個外框共有多少格',bottom),input('taken','畫了斜線的有多少格',top)],
      `原來整個蛋糕有 ${bottom} 格，取走的部分有 ${top} 格。`,
      { q, part:'count', hint:'整個外框包括米白色部分。只數斜線格便能找出取走的部分。' }),
    fields(id+'-result', '填寫取走部分的分數', '取走的部分佔原來整個蛋糕的幾分之幾？先按圖填寫分數。',
      [input('n','分子',top),input('d','分母',bottom)],
      `${times(a,b,c,d)} = ${f(top,bottom)}`,
      { q, part:'result', fraction:true, hint:'分子是畫了斜線的格數。分母是整個外框的格數。' })
  );
  if (divisor > 1 && !q.practice) {
    steps.push(fields(id+'-simplify', '把答案約成最簡分數', `將 ${f(top,bottom)} 約分。`,
      [input('n','分子',top/divisor),input('d','分母',bottom/divisor)],
      `${f(top,bottom)} = ${f(top/divisor,bottom/divisor)}`,
      { q, part:'result', fraction:true, hint:'找一個能同時整除分子和分母的數。' }));
  }
  return steps;
}

const stages = [
  { name:'暖身', minutes:'0–3 分鐘', steps:[
    choices('warm-fraction','認一認蛋糕的分數','整個蛋糕平均分成 4 份。淺綠色部分佔原來整個蛋糕的幾分之幾？',
      [['1/4',f(1,4)],['3/4',f(3,4)],['3/3',f(3,3)]], '3/4',
      `完整蛋糕有 4 等份，淺綠色部分有 3 份，所以是 ${f(3,4)}。`,
      { art:'warm', hint:'先數整個外框，再數淺綠色的份數。' }),
    choices('warm-repeat','四份半個蛋糕','每人吃半個蛋糕，4 人共吃多少個蛋糕？',
      [['1','1 個'],['2','2 個'],['4','4 個']], '2',
      `${f(1,2)} × 4 = 2。四份半個蛋糕，可以拼成兩個完整蛋糕。`,
      { art:'halves', hint:'每兩份半個蛋糕可以拼成一個完整蛋糕。' })
  ]},
  { name:'蛋糕店訂單', minutes:'3–8 分鐘', steps:[
    choices('order-guess','客人想買 4 個蛋糕的一半','先猜一猜。客人買的分量和原來的 4 個蛋糕相比，會怎樣？',
      [...sizeOptions,['unsure','還未確定']], null, '已記下你的猜想。下一步用蛋糕驗證。',
      { art:'order', action:'記下猜想' }),
    card('order-group','把 4 個蛋糕平均分成兩組','把每個蛋糕拖到托盤。也可以先點蛋糕，再點托盤。',
      'group', { art:'order', feedback:'兩個托盤各有 2 個蛋糕。', hint:'兩組的蛋糕數量要一樣多。' }),
    choices('order-pick','取走其中一組','要取 4 個蛋糕的一半，請選一個托盤。',
      [['A','取托盤 A'],['B','取托盤 B']], ['A','B'], '任選其中一個托盤，都是取 4 個蛋糕的一半。',
      { art:'order' }),
    fields('order-count','客人買了多少個蛋糕？','數一數所選托盤上的蛋糕。', [input('value','取走的蛋糕數量',2)],
      `4 × ${f(1,2)} = 2。把 4 個蛋糕平均分成 2 組，取其中 1 組。`,
      { art:'order', hint:'看你剛才選的那個托盤。' })
  ]},
  { name:'半個再取一半', minutes:'8–14 分鐘', steps:[
    choices('bridge-one','如果只剩 1 個蛋糕','客人同樣要買一半。請點選一份，再確認你的選擇。',
      [['left','取左半'],['right','取右半']], ['left','right'],
      `1 × ${f(1,2)} = ${f(1,2)}。一個蛋糕的二分之一，就是半個蛋糕。`, { art:'one' }),
    choices('bridge-guess','如果只剩半個蛋糕','客人買了「這半個的一半」。和原來剩下的半個相比，你估計他買了多少？',
      [...sizeOptions,['unsure','還未確定']], null, '已記下你的猜想。接下來看看半個蛋糕可以怎樣再等分。',
      { q:halfHalf, part:'original', action:'記下猜想' }),
    ...modelSteps(halfHalf),
    card('bridge-review','每次都取原來數量的一半','想一想。這三張訂單中，哪一個數在改變？',
      'info', { art:'bridge', feedback:'第一個數是原來的數量。第二個數都是二分之一，表示取原來數量的一半。' })
  ]},
  { name:'分數乘法探究', minutes:'14–24 分鐘', steps:[
    ...modelSteps(halfThird).map(step => ({...step, context:'訂單 A　半個蛋糕的三分之一'})),
    ...modelSteps(threeQuarter).map(step => ({...step, context:'訂單 B　四分之三個蛋糕的三分之二'}))
  ]},
  { name:'發現計算規律', minutes:'24–29 分鐘', steps:[
    fields('rule-total','分母從哪裏來？','看看整個外框。填出每行格數及總行數。',
      [input('per','每行格數',4),input('rows','總行數',3)],
      '4 × 3 = 12。兩個分母相乘，得到整個外框的格數。',{q:threeQuarter,part:'result',hint:'整個外框包括米白色部分。'}),
    fields('rule-pick','分子從哪裏來？','只看有斜線的部分。填出每個選中行的斜線格數及選中的行數。',
      [input('per','每行斜線格數',3),input('rows','選中的行數',2)],
      '3 × 2 = 6。兩個分子相乘，得到最後取走的格數。',{q:threeQuarter,part:'result',hint:'橫着數一行斜線格，再數有斜線的橫行。'}),
    card('rule-summary','把圖像連成算式','分子乘分子，分母乘分母，最後把答案約成最簡分數。',
      'info',{art:'rule',feedback:'圖中的分母是全體格數，分子是最後取走的格數。'})
  ]},
  { name:'獨立練習', minutes:'29–37 分鐘', steps:[
    fields('practice-a','看圖完成乘法',`用蛋糕圖找出 ${times(2,3,1,2)}，把答案約成最簡分數。`,
      [input('n','分子',1),input('d','分母',3)],
      `${times(2,3,1,2)} = ${f(2,6)} = ${f(1,3)}`,
      { q:practiceModel,part:'practice',fraction:true,hint:'先在淺綠色部分選一橫行。數出斜線格與整體格數，再約分。' }),
    fields('practice-b','用計算方法完成',`計算 ${times(2,3,3,5)}。答案寫成最簡分數。`,
      [input('n','分子',2),input('d','分母',5)],
      `${times(2,3,3,5)} = ${f(6,15)} = ${f(2,5)}`,
      {fraction:true,art:'practice',hint:'分子相乘、分母相乘，再把結果約分。',hintModel:true}),
    choices('practice-size','不用計算也能比較',`${times(4,5,1,2)} 的積和 ${f(4,5)} 相比，會怎樣？`,sizeOptions,'less',
      `積比 ${f(4,5)} 小。接下來選出原因。`,
      {art:'size',hint:'乘以二分之一，就是從原來的數量取一半。'}),
    choices('practice-why','選出你的理由','為甚麼剛才的積比原來的數量小？',
      [['half','只取原來數量的一半'],['multiply','做乘法後，數量一定增加'],['denominator','只看分母就知道答案']],
      'half','正數乘以大於 0、小於 1 的分數，表示取原來數量的一部分，所以積比原數小。',{art:'size'})
  ]},
  { name:'離堂挑戰', minutes:'37–40 分鐘', steps:[
    card('exit','完成最後三張訂單','答完三題再一起提交。提交後可以逐題看回饋。','exit')
  ]}
];

const hk = new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'numeric',timeZone:'Asia/Hong_Kong'})
  .formatToParts(new Date());
const year = Number(hk.find(p=>p.type==='year').value) - (Number(hk.find(p=>p.type==='month').value)<9 ? 1 : 0);
const sessionKey = 'fraction-cake-lab:session';
const fresh = () => ({ stage:0, unlocked:0, steps:stages.map(()=>0), done:{}, data:{}, models:{}, trays:['','','',''] });
let student = null;
let teacher = false;
let state = fresh();
let activeCake = null;
let hintOpen = false;
let message = '';
let storeError = false;

function validStudent(value) {
  return value && value.year === year && classes.includes(value.className) &&
    Number.isInteger(value.number) && value.number >= 1 && value.number <= 25;
}
function progressKey(s) { return `fraction-cake-lab:v2:${s.year}:${s.className}:${s.number}`; }
function startStudent(next) {
  if (!validStudent(next)) return;
  student = next;
  teacher = false;
  state = fresh();
  storeError = false;
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey(student)));
    if (saved && Number.isInteger(saved.stage) && saved.stage >= 0 && saved.stage < stages.length &&
        saved.steps?.length === stages.length && saved.done && saved.data && saved.models && saved.trays?.length === 4) state = saved;
    sessionStorage.setItem(sessionKey, JSON.stringify(next));
  } catch { storeError = true; }
}
function save() {
  if (!student) return;
  try { localStorage.setItem(progressKey(student),JSON.stringify(state)); }
  catch { storeError = true; }
}
function getStep() { return stages[state.stage].steps[state.steps[state.stage]]; }
function values(step = getStep()) { return state.data[step.id] ||= {}; }
function modelData(q) {
  return state.models[q.id] ||= { cols:q.intro ? [0] : q===practiceModel ? [0,1] : [], rows:[], marks:[] };
}
function clearView() { activeCake = null; hintOpen = false; message = ''; }
function header() {
  const identity = teacher ? '教師示範' : student ? `${student.className} · ${student.number} 號` : '';
  return `<header class="site-header"><div class="header-inner">
    <div class="brand"><span class="brand-icon" aria-hidden="true">♧</span><div><strong>分數蛋糕店</strong><small>THE FRACTION BAKERY</small></div></div>
    ${identity ? `<div class="session"><span class="identity">${identity}</span><button type="button" class="quiet" data-action="leave">${teacher ? '返回入口' : '切換學生'}</button></div>` : '<span class="identity">小四數學</span>'}
  </div></header>`;
}
function entrance() {
  return `${header()}<main id="main" class="entrance">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><span class="tag">今日訂單 · 分數乘法</span>
      <h1 id="hero-title">歡迎來到<br><em>分數蛋糕店</em></h1>
      <p>從 4 個蛋糕的一半出發，把分數切開、看清楚，再寫成乘法算式。</p>
      <div class="hero-steps"><span>01 先猜一猜</span><span>02 動手分蛋糕</span><span>03 發現乘法規律</span></div></div>
      <div class="hero-art"><img src="./strawberry-cake.png" alt="草莓鮮奶油蛋糕"><span aria-hidden="true" class="spark one">✧</span><span aria-hidden="true" class="spark two">✦</span></div>
    </section>
    <section class="entry-panel" aria-labelledby="entry-title">
      <div><span class="eyebrow">開始接單</span><h2 id="entry-title">選擇班別和學號</h2><p>進度保存在這部裝置的瀏覽器。</p></div>
      <form id="entry-form">
        <label>班別<select name="className" required><option value="">選擇班別</option>${classes.map(c=>`<option>${c}</option>`).join('')}</select></label>
        <label>學號<select name="number" required><option value="">選擇學號</option>${range(25).map(i=>`<option value="${i+1}">${i+1} 號</option>`).join('')}</select></label>
        <button class="primary" type="submit">開始學習 <span aria-hidden="true">→</span></button>
      </form>
    </section>
    <footer class="entry-footer"><button type="button" class="quiet" data-action="teacher">教師示範</button><span>40 分鐘 · 7 個學習環節</span></footer>
  </main>`;
}
function cakeBoard({cols, rows, original=[], picked=[], mode='', marks=[], label='原來 1 個蛋糕', id='', locked=false, partial=false}) {
  return `<div class="cake-board"><div class="whole-label"><span></span>${label}<span></span></div>
    <div class="cake-grid${partial?' partial':''}" style="--columns:${cols};--rows:${rows}" role="group" aria-label="${label}，${cols}欄${rows}行">
      ${range(rows).map(r=> {
        const rowButton = mode==='row' && !locked;
        const cells = range(cols).map(c=>{
          const index = r*cols+c;
          const type = original.includes(c) ? picked.includes(r) ? 'taken' : 'original' : 'plain';
          const cell = `class="cell ${type}${marks.includes(index)?' marked':''}"`;
          const columnButton = mode==='column' && !locked;
          const markButton = mode==='mark' && !locked;
          if (columnButton || markButton) {
            const pressed = columnButton ? original.includes(c) : marks.includes(index);
            const name = columnButton ? `第 ${c+1} 欄` : `第 ${r+1} 行第 ${c+1} 格${type==='taken'?'，斜線格':''}`;
            return `<button type="button" ${cell} aria-label="${name}" aria-pressed="${pressed}" data-action="${columnButton?'column':'mark'}" data-value="${columnButton?c:index}">${marks.includes(index)?'✓':''}</button>`;
          }
          return `<span ${cell}>${marks.includes(index)?'✓':''}</span>`;
        }).join('');
        return rowButton
          ? `<button class="cake-row" type="button" data-action="row" data-value="${r}" aria-label="第 ${r+1} 橫行" aria-pressed="${picked.includes(r)}">${cells}</button>`
          : `<div class="cake-row">${cells}</div>`;
      }).join('')}
    </div>
    ${id ? `<div class="model-id">${id}</div>` : ''}
  </div>`;
}
function legend() {
  return '<div class="legend"><span><i class="original"></i>原有部分（包括斜線）</span><span><i class="taken"></i>最後取走</span></div>';
}
function modelArt(step, locked) {
  const q = step.q;
  const model = modelData(q);
  const part = step.part;
  const cols = part==='columns' && !locked ? 1 : q.b;
  const rows = ['original','columns','pick-cols'].includes(part) || (part==='rows'&&!locked) ? 1 : q.d;
  const fixed = step.id.startsWith('rule-') && !model.cols.length;
  const original = fixed ? range(q.a) : model.cols;
  const picked = fixed ? range(q.c) : model.rows;
  const mode = { 'pick-cols':'column','pick-rows':'row',count:'mark',practice:'row' }[part] || '';
  return cakeBoard({cols,rows,original,picked,mode,marks:part==='count'?model.marks:[],locked,partial:part==='rows'||part==='pick-rows'}) + legend();
}
function cakeIcon(index, {clickable=false,draggable=false}={}) {
  const selected = activeCake===index;
  const graphic = '<span class="cake-drawing" aria-hidden="true"><i></i><i></i><i></i></span>';
  return clickable ? `<button type="button" class="cake-token ${selected?'active':''}" data-action="cake" data-value="${index}" aria-pressed="${selected}" draggable="${draggable}" aria-label="蛋糕 ${index+1}">${graphic}</button>` : `<span class="cake-token static" aria-label="完整蛋糕">${graphic}</span>`;
}
function orderArt(step, locked) {
  if (step.id==='order-guess') return `<div class="cake-counter">${range(4).map(i=>cakeIcon(i)).join('')}</div><p class="figure-note">原來有 4 個蛋糕</p>`;
  const editable = step.kind==='group' && !locked;
  const picked = values(stages[1].steps[2]).selected;
  const unplaced = state.trays.map((t,i)=>t===''?i:-1).filter(i=>i>=0);
  return `<div class="order-board">
    ${editable ? `<div class="unplaced" data-drop="">${unplaced.length ? unplaced.map(i=>cakeIcon(i,{clickable:true,draggable:true})).join('') : '<span>蛋糕已放入托盤</span>'}
      ${activeCake!==null && state.trays[activeCake] ? '<button class="quiet" type="button" data-action="tray" data-value="">放回桌面</button>' : ''}</div>` : ''}
    <div class="trays">${['A','B'].map(t=>{
      const cakes = state.trays.map((place,i)=>place===t?i:-1).filter(i=>i>=0);
      const fallback = teacher && !editable && !state.trays.some(Boolean) ? (t==='A'?[0,1]:[2,3]) : cakes;
      return `<div class="tray ${picked===t?'selected':''}" data-drop="${t}">
      <div class="tray-title">托盤 ${t}${picked===t?' · 已選':''}</div>
      <div class="tray-cakes">${fallback.map(i=>cakeIcon(i,{clickable:editable,draggable:editable})).join('')}</div>
      ${editable ? `<button class="secondary tray-button" type="button" data-action="tray" data-value="${t}" aria-disabled="${activeCake===null}">放入托盤 ${t}</button>` : ''}
      </div>`;
    }).join('')}</div>
  </div>`;
}
function artwork(step, locked) {
  if (step.q) return modelArt(step, locked);
  if (step.art==='order') return orderArt(step, locked);
  if (step.art==='warm') return cakeBoard({cols:4,rows:1,original:[0,1,2]})+legend();
  if (step.art==='halves') {
    return locked ? `<div class="cake-counter">${range(2).map(i=>cakeIcon(i)).join('')}</div><p class="figure-note">拼成 2 個完整蛋糕</p>`
      : `<div class="half-counter">${range(4).map(i=>`<div><span class="half-piece"></span><small>第 ${i+1} 人</small></div>`).join('')}</div>`;
  }
  if (step.art==='one') {
    const selected = values(step).selected;
    return cakeBoard({cols:2,rows:1,original:selected ? [selected==='left'?0:1] : [],mode:'column',locked});
  }
  if (step.art==='bridge') return `<div class="math-cards">
    <div><small>4 個蛋糕</small><div class="mini-cakes" aria-label="4 個蛋糕中選了 2 個">${range(4).map(i=>`<i class="${i<2?'taken':''}"></i>`).join('')}</div><div>4 × ${f(1,2)} = 2</div></div>
    <div><small>1 個蛋糕</small>${cakeBoard({cols:2,rows:1,original:[0],picked:[0],label:'1 個'})}<div>1 × ${f(1,2)} = ${f(1,2)}</div></div>
    <div><small>半個蛋糕</small>${cakeBoard({cols:2,rows:2,original:[0],picked:[0],label:'1 個'})}<div>${times(1,2,1,2)} = ${f(1,4)}</div></div></div>`;
  if (step.art==='rule') return `${cakeBoard({cols:4,rows:3,original:[0,1,2],picked:[0,1]})}
    <div class="math-display">${times(3,4,2,3)} = ${f('3 × 2','4 × 3')} = ${f(6,12)} = ${f(1,2)}</div>`;
  if (step.art==='practice' && hintOpen) return cakeBoard({cols:3,rows:5,original:[0,1],picked:[0,1,2]})+legend();
  if (step.art==='practice') return `<div class="math-display standalone">${times(2,3,3,5)} = ?</div>`;
  return `${cakeBoard({cols:5,rows:1,original:[0,1,2,3]})}<p class="figure-note">原有 ${f(4,5)} 個蛋糕</p>`;
}

function optionButtons(options, value, {action='option',locked=false,key=''}={}) {
  return `<div class="options">${options.map(([v,t])=>
    `<button type="button" class="option" aria-pressed="${chosen(value,v)}" data-action="${action}" data-value="${v}" data-key="${key}" ${locked?'disabled':''}>${t}</button>`
  ).join('')}</div>`;
}
function numberField(field, val, locked, prefix='') {
  const name = prefix+field.name;
  const safeValue = /^\d{1,3}$/.test(val??'') ? val : '';
  return `<label class="number-field"><span>${field.label}</span><input type="text" inputmode="numeric" autocomplete="off" maxlength="3" aria-label="${field.label}" data-field="${name}" value="${safeValue}" ${locked?'readonly':''}></label>`;
}
function answers(step, locked) {
  const data = values(step);
  if (step.kind==='choice') return optionButtons(step.options,data.selected,{locked});
  if (step.kind==='fields') return `<div class="fields ${step.fraction?'fraction-fields':''}">${step.inputs.map(field=>numberField(field,data[field.name],locked)).join('')}</div>`;
  if (step.kind==='group' && !locked) return '<p class="helper">把 4 個蛋糕都放好，再檢查兩組是否一樣多。</p>';
  return '';
}
function sidebar() {
  const progress = stages.filter(s=>state.done[s.steps.at(-1).id]).length;
  return `<aside class="sidebar"><div class="sidebar-head"><span class="eyebrow">今天的學習路線</span><strong>${progress} / 7</strong></div>
    <nav aria-label="學習環節">${stages.map((s,i)=>{
      const active = i===state.stage;
      const finished = !!state.done[s.steps.at(-1).id];
      return `<button type="button" class="stage-button ${active?'current':''}" data-action="stage" data-value="${i}" ${active?'aria-current="step"':''} ${!teacher&&i>state.unlocked?'disabled':''}>
        <span class="stage-number">${finished?'✓':String(i+1).padStart(2,'0')}</span><span><strong>${s.name}</strong><small>${s.minutes}</small></span>
      </button>`;
    }).join('')}</nav>
    ${teacher ? '<p class="sidebar-note">可按課堂需要選擇環節。揭示答案只影響示範畫面。</p>' : ''}</aside>`;
}
function reportLine(step, locked) {
  const copy = locked && step.feedback ? step.feedback : message;
  return `<div id="feedback" role="status" tabindex="-1" class="feedback ${copy?locked?'success':'notice':'empty'}">${copy?'<span aria-hidden="true">'+(locked?'✓':'↳')+'</span><div>'+copy+'</div>':''}</div>`;
}
function regularStep(step) {
  const locked = !!state.done[step.id];
  const visualLabel = step.art==='order' ? '訂單操作枱' : step.q || step.art==='warm' || step.art==='one' ? '蛋糕模型' : '蛋糕工作枱';
  const action = locked ? (state.steps[state.stage]===stages[state.stage].steps.length-1 ? '下一環節' : '下一步') : step.action || (step.kind==='info'?'我明白了':'檢查');
  return `<section class="workspace"><div class="visual">
      <div class="visual-label"><span class="small-dot"></span>${visualLabel}</div>
      <div class="visual-body">${artwork(step,locked)}</div>
      ${step.kind==='group'&&!locked&&activeCake!==null?'<div class="visual-tip">已選蛋糕，請點一個托盤。</div>':''}
    </div>
    <div class="controls"><span class="eyebrow">${step.context || '本步任務'}</span>
      <h2 id="step-title" tabindex="-1">${step.title}</h2><p class="instruction">${step.text}</p>
      ${answers(step,locked)}${reportLine(step,locked)}
      ${hintOpen && step.hint ? `<div class="hint"><strong>小提示</strong><p>${step.hint}</p></div>` : ''}
      <div class="control-actions">
        <button type="button" class="primary" data-action="${locked?'next':'check'}">${action} <span aria-hidden="true">→</span></button>
        ${step.hint&&!locked ? `<button type="button" class="secondary" aria-expanded="${hintOpen}" data-action="hint">${hintOpen?'收起提示':'給我提示'}</button>` : ''}
      </div>
      <div class="extra-actions">
        ${teacher&&!locked&&step.kind!=='info' ? '<button type="button" class="quiet" data-action="reveal">顯示此步答案</button>' : ''}
        ${step.q&&!locked&&['pick-cols','pick-rows','count','practice'].includes(step.part) ? '<button type="button" class="quiet" data-action="clear">清除圖上選取</button>' : ''}
      </div>
    </div></section>`;
}

const exitTitles = ['理解圖像','計算與約分','比較大小'];
const exitPictures = [
  { id:'A', original:[0,1,2], picked:[], label:'圖 A' },
  { id:'B', original:[0,1,2], picked:[0], label:'圖 B' },
  { id:'C', original:[0,1,2,3], picked:[0], label:'圖 C' }
];
const exitFeedback = [
  '圖 B 先標出四分之三，再在這部分取一半。',
  '分子相乘得 2，分母相乘得 12。12 格中取了 2 格，約分得 1/6。',
  '乘以二分之一是取原來的一半，所以積比原來的正數小。'
];
// Keep the three original answers together so the first result reflects an independent attempt.
function gradeExit(data) {
  return [data.picture==='B',Number(data.n)===1&&Number(data.d)===6,data.size==='less'&&data.why==='half'];
}
function exitStep(step) {
  const data = values(step);
  const locked = !!state.done[step.id];
  const result = locked ? gradeExit(data) : [];
  const item = (i, body) => `<section class="exit-card"><span class="eyebrow">訂單 ${i+1} · ${exitTitles[i]}</span>${body}
    ${locked ? `<p class="exit-feedback ${result[i]?'right':'review'}"><strong>${result[i]?'已掌握':'再看看'}</strong> ${exitFeedback[i]}</p>` : ''}</section>`;
  return `<section class="exit-workspace"><h2 id="step-title" tabindex="-1">${step.title}</h2><p class="instruction">${step.text}</p>
    ${item(0,`<h3>哪幅圖的斜線表示四分之三個蛋糕的一半？</h3><div class="exit-pictures">
      ${exitPictures.map(p=>`<div class="picture-option" data-picked="${chosen(data.picture,p.id)}">
        ${cakeBoard({cols:4,rows:2,original:p.original,picked:p.picked})}
        <button type="button" class="option" aria-pressed="${chosen(data.picture,p.id)}" data-action="exit-option" data-key="picture" data-value="${p.id}" ${locked?'disabled':''}>選擇${p.label}</button></div>`).join('')}</div>`)}
    ${item(1,`<h3>計算 ${times(1,4,2,3)}，把答案寫成最簡分數。</h3>
      <div class="fields fraction-fields">${numberField(input('n','分子'),data.n,locked)}${numberField(input('d','分母'),data.d,locked)}</div>`)}
    ${item(2,`<h3>正數乘以二分之一，積和原來的數相比會怎樣？</h3>
      ${optionButtons(sizeOptions,data.size,{action:'exit-option',key:'size',locked})}
      <p class="instruction">再選出原因。</p>
      ${optionButtons([['half','只取原來的一半'],['whole','取了原來的全部'],['more','取了比原來更多的數量']],data.why,{action:'exit-option',key:'why',locked})}`)}
    ${reportLine(step,locked)}
    ${locked ? `<div class="result-strip">${result.map((ok,i)=>`<span><strong>${exitTitles[i]}</strong>${ok?'已掌握':'再看看'}</span>`).join('')}</div>`
      : `<div class="control-actions"><button class="primary" type="button" data-action="check">提交三張訂單 →</button>
      ${teacher?'<button class="quiet" type="button" data-action="reveal">顯示答案</button>':''}</div>`}
    </section>`;
}
function learning() {
  const stage = stages[state.stage];
  const step = getStep();
  const index = state.steps[state.stage];
  return `${header()}<div class="layout">${sidebar()}<main id="main" class="learning">
    <div class="lesson-heading"><div><span class="eyebrow">環節 ${String(state.stage+1).padStart(2,'0')} · ${stage.minutes}</span><h1>${stage.name}</h1></div>
      <div class="step-status"><span>第 ${index+1} / ${stage.steps.length} 步</span>${index>0?'<button type="button" class="quiet" data-action="back">上一步</button>':''}</div></div>
    <div class="progress" role="progressbar" aria-label="目前環節進度" aria-valuenow="${index+1}" aria-valuemin="0" aria-valuemax="${stage.steps.length}"><span style="width:${100*(index+1)/stage.steps.length}%"></span></div>
    ${step.kind==='exit'?exitStep(step):regularStep(step)}
    <footer class="lesson-footer">${storeError?'這部裝置暫時無法保存進度。':teacher?'教師示範 · 可從左側選擇環節':'學習進度只保存在這部裝置'}<span>分數料理研究所</span></footer>
  </main></div>`;
}
function render(target) {
  const previousScroll = app.querySelector('.sidebar nav')?.scrollLeft || 0;
  app.innerHTML = student || teacher ? learning() : entrance();
  const nav = app.querySelector('.sidebar nav');
  if (nav) {
    nav.scrollLeft = previousScroll;
    const current = nav.querySelector('.current');
    const outer = nav.getBoundingClientRect(), inner = current.getBoundingClientRect();
    if (inner.left < outer.left) nav.scrollLeft += inner.left - outer.left - 6;
    if (inner.right > outer.right) nav.scrollLeft += inner.right - outer.right + 6;
  }
  if (target) app.querySelector(target)?.focus({preventScroll:true});
}
function gotoStep() {
  clearView();
  save();
  render('#step-title');
  window.scrollTo(0,0);
}
function respond(text) {
  message = text;
  render('#feedback');
}
function pass(step) {
  state.done[step.id] = true;
  if (state.steps[state.stage]===stages[state.stage].steps.length-1) {
    state.unlocked = Math.min(stages.length-1,Math.max(state.unlocked,state.stage+1));
  }
  save();
  respond('');
}
function check(step) {
  const data = values(step);
  if (step.kind==='info') return pass(step);
  if (step.kind==='choice') {
    if (!data.selected) return respond('先選一個答案，再繼續。');
    const correct = step.answer===null || [step.answer].flat().includes(data.selected);
    return correct ? pass(step) : respond(step.hint || '再想想題目的意思，試另一個選項。');
  }
  if (step.kind==='group') {
    return ['A','B'].every(t=>state.trays.filter(x=>x===t).length===2) ?
      pass(step) : respond('請把 4 個蛋糕全部放入托盤，兩個托盤要一樣多。');
  }
  if (step.kind==='pick-cols' || step.kind==='pick-rows') {
    const m = modelData(step.q);
    const columns = step.kind==='pick-cols';
    const count = columns ? m.cols.length : m.rows.length;
    return count===(columns?step.q.a:step.q.c) ? pass(step) : respond(step.hint);
  }
  if (step.kind==='exit') {
    if (!data.picture || !data.n || Number(data.d)<1 || !data.d || !data.size || !data.why) return respond('請答完三題，並填上大於 0 的分母。');
    return pass(step);
  }
  if (step.inputs.some(({name})=>!data[name])) return respond('先填上每個空格的數字。');
  if (step.fraction && Number(data.d)<1) return respond('分母要大於 0。');
  if (step.part==='practice' && modelData(step.q).rows.length!==1) return respond('先在蛋糕圖上選一橫行，再檢查答案。');
  if (step.inputs.every(({name,answer})=>Number(data[name])===answer)) return pass(step);
  if (step.fraction) {
    const [n,d] = step.inputs.map(field=>field.answer);
    if (Number(data.n)*d===n*Number(data.d)) return respond(step.id.endsWith('-result')
      ? '這個分數的大小正確。請先填寫圖上的斜線格數和總格數。'
      : '這個分數的大小正確。請再約成最簡分數。');
    if (step.id==='practice-b' && Number(data.n)===6 && Number(data.d)===8) {
      return respond('分母要相乘。可開啟圖像提示，看看 3 欄和 5 行組成多少格。');
    }
  }
  return respond(step.hint || '再看看圖上的資料，然後試一次。');
}
function reveal(step) {
  const data = values(step);
  if (step.kind==='choice') data.selected = [step.answer].flat()[0] || 'unsure';
  if (step.kind==='group') state.trays = ['A','A','B','B'];
  if (step.kind==='pick-cols') modelData(step.q).cols = range(step.q.a);
  if (step.kind==='pick-rows' || step.part==='practice') modelData(step.q).rows = range(step.q.c);
  if (step.kind==='fields') step.inputs.forEach(({name,answer})=>{data[name]=String(answer);});
  if (step.kind==='exit') Object.assign(data,{picture:'B',n:'1',d:'6',size:'less',why:'half'});
  pass(step);
}
function toggle(list, value) {
  return list.includes(value) ? list.filter(v=>v!==value) : [...list,value];
}
function placeCake(index, tray) {
  if (getStep().kind!=='group' || state.done[getStep().id] || !range(4).includes(index) || !['','A','B'].includes(tray)) return;
  state.trays[index] = tray;
  activeCake = null;
  message = '';
  save();
  render(`[data-action="cake"][data-value="${index}"]`);
}

app.addEventListener('submit', event=>{
  if (event.target.id!=='entry-form') return;
  event.preventDefault();
  const form = new FormData(event.target);
  startStudent({year,className:form.get('className'),number:Number(form.get('number'))});
  if (student) gotoStep();
});
app.addEventListener('input', event=>{
  const field = event.target.dataset.field;
  if (!field || (!student&&!teacher) || state.done[getStep().id]) return;
  event.target.value = event.target.value.replace(/\D/g,'').slice(0,3);
  values()[field] = event.target.value;
  save();
});
app.addEventListener('keydown', event=>{
  if (event.key==='Enter' && event.target.dataset.field && !event.target.readOnly) {
    event.preventDefault();
    check(getStep());
  }
});
app.addEventListener('click', event=>{
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const {action,value,key} = button.dataset;
  if (action==='teacher') {
    student=null;teacher=true;state=fresh();gotoStep();return;
  }
  if (action==='leave') {
    save();
    student=null;teacher=false;state=fresh();clearView();
    try { sessionStorage.removeItem(sessionKey); } catch {}
    render('#hero-title');window.scrollTo(0,0);return;
  }
  if (!student&&!teacher) return;
  const step = getStep();
  if (action==='stage') {
    const stage=Number(value);
    if (stage===state.stage || !stages[stage] || (!teacher&&stage>state.unlocked)) return;
    state.stage=stage;gotoStep();return;
  }
  if (action==='back' && state.steps[state.stage]>0) {
    state.steps[state.stage]--;gotoStep();return;
  }
  if (action==='next' && state.done[step.id]) {
    if (state.steps[state.stage]<stages[state.stage].steps.length-1) state.steps[state.stage]++;
    else if (state.stage<stages.length-1) state.stage++;
    gotoStep();return;
  }
  if (state.done[step.id]) return;
  if (action==='hint') {
    hintOpen=!hintOpen;render('[data-action="hint"]');return;
  }
  if (action==='reveal' && teacher) return reveal(step);
  if (action==='check') return check(step);
  if (action==='tray') {
    return activeCake===null ? respond('先點選一個蛋糕。') : placeCake(activeCake,value);
  }
  if (action==='cake') activeCake=activeCake===Number(value)?null:Number(value);
  if (action==='option') values(step).selected=value;
  if (action==='exit-option') values(step)[key]=value;
  if (action==='column') {
    if (step.art==='one') values(step).selected=Number(value)===0?'left':'right';
    else {
      const m=modelData(step.q);
      m.cols=toggle(m.cols,Number(value));
    }
  }
  if (action==='row' || action==='mark') {
    const m=modelData(step.q);
    if (action==='row') {
      m.rows=step.part==='practice' ? (m.rows.includes(Number(value))?[]:[Number(value)]) : toggle(m.rows,Number(value));
    } else m.marks=toggle(m.marks,Number(value));
  }
  if (action==='clear') {
    const m=modelData(step.q);
    if (step.part==='pick-cols') m.cols=[];
    else if (step.part==='count') m.marks=[];
    else m.rows=[];
  }
  message='';
  save();
  const selector = `[data-action="${action}"]${value===undefined?'':`[data-value="${value}"]`}${key?`[data-key="${key}"]`:''}`;
  render(selector);
});
app.addEventListener('dragstart', event=>{
  const token=event.target.closest('[data-action="cake"][draggable="true"]');
  if (token && event.dataTransfer) {
    event.dataTransfer.setData('text/plain',token.dataset.value);
    event.dataTransfer.effectAllowed='move';
  }
});
app.addEventListener('dragover', event=>{
  if (event.target.closest('[data-drop]')) event.preventDefault();
});
app.addEventListener('drop', event=>{
  const target=event.target.closest('[data-drop]');
  const value=event.dataTransfer?.getData('text/plain');
  if (!target || !/^[0-3]$/.test(value||'')) return;
  event.preventDefault();
  placeCake(Number(value),target.dataset.drop);
});

try {
  const savedStudent=JSON.parse(sessionStorage.getItem(sessionKey));
  if (validStudent(savedStudent)) startStudent(savedStudent);
} catch {}
render();
