/* زاد — رسومات كرتونية موحّدة بدل الإيموجي داخل الألعاب.
   النص الأصلي يبقى في الصفحة (مخفيًا بصريًا) حتى لا تتغير الأسئلة أو الإجابات أو منطق اللعب. */
(function(){
var M={"1⃣":"31","2⃣":"32","3⃣":"33","4⃣":"34","ℹ":"2139","↔":"2194","⌛":"231b","⏰":"23f0","⏳":"23f3","▶":"25b6","◀":"25c0","☀":"2600","☁":"2601","⚖":"2696","⚽":"26bd","⛈":"26c8","✅":"2705","✈":"2708","✉":"2709","✍":"270d","✏":"270f","✖":"2716","✨":"2728","❓":"2753","❗":"2757","➕":"2795","➖":"2796","➗":"2797","➿":"27bf","⬆":"2b06","⬇":"2b07","⭐":"2b50","🃏":"1f0cf","🌈":"1f308","🌐":"1f310","🌙":"1f319","🌛":"1f31b","🌟":"1f31f","🌧":"1f327","🌱":"1f331","🌳":"1f333","🌴":"1f334","🌷":"1f337","🌸":"1f338","🌹":"1f339","🌻":"1f33b","🌼":"1f33c","🌾":"1f33e","🌿":"1f33f","🍆":"1f346","🍇":"1f347","🍉":"1f349","🍊":"1f34a","🍋":"1f34b","🍌":"1f34c","🍎":"1f34e","🍏":"1f34f","🍒":"1f352","🍓":"1f353","🍕":"1f355","🍞":"1f35e","🍪":"1f36a","🍫":"1f36b","🍬":"1f36c","🍯":"1f36f","🍼":"1f37c","🍽":"1f37d","🎂":"1f382","🎃":"1f383","🎈":"1f388","🎉":"1f389","🎒":"1f392","🎨":"1f3a8","🎭":"1f3ad","🎮":"1f3ae","🎯":"1f3af","🎵":"1f3b5","🎶":"1f3b6","🎺":"1f3ba","🏃":"1f3c3","🏅":"1f3c5","🏆":"1f3c6","🏙":"1f3d9","🏝":"1f3dd","🏠":"1f3e0","🏡":"1f3e1","🐄":"1f404","🐊":"1f40a","🐋":"1f40b","🐍":"1f40d","🐑":"1f411","🐓":"1f413","🐔":"1f414","🐘":"1f418","🐙":"1f419","🐝":"1f41d","🐟":"1f41f","🐢":"1f422","🐣":"1f423","🐥":"1f425","🐦":"1f426","🐧":"1f427","🐨":"1f428","🐪":"1f42a","🐬":"1f42c","🐭":"1f42d","🐯":"1f42f","🐰":"1f430","🐱":"1f431","🐲":"1f432","🐳":"1f433","🐴":"1f434","🐵":"1f435","🐶":"1f436","🐷":"1f437","🐸":"1f438","🐹":"1f439","🐺":"1f43a","🐻":"1f43b","🐼":"1f43c","🐾":"1f43e","🐿":"1f43f","👀":"1f440","👁":"1f441","👆":"1f446","👏":"1f44f","👑":"1f451","👕":"1f455","👣":"1f463","👤":"1f464","👩":"1f469","💛":"1f49b","💜":"1f49c","💡":"1f4a1","💧":"1f4a7","💨":"1f4a8","💪":"1f4aa","💾":"1f4be","📅":"1f4c5","📆":"1f4c6","📈":"1f4c8","📊":"1f4ca","📋":"1f4cb","📏":"1f4cf","📖":"1f4d6","📚":"1f4da","📡":"1f4e1","📥":"1f4e5","📿":"1f4ff","🔁":"1f501","🔄":"1f504","🔊":"1f50a","🔍":"1f50d","🔎":"1f50e","🔑":"1f511","🔒":"1f512","🔗":"1f517","🔟":"1f51f","🔠":"1f520","🔢":"1f522","🔤":"1f524","🔥":"1f525","🔬":"1f52c","🔭":"1f52d","🔴":"1f534","🔷":"1f537","🕋":"1f54b","🕌":"1f54c","🕒":"1f552","🕞":"1f55e","🕰":"1f570","🕷":"1f577","🖌":"1f58c","🖐":"1f590","🖨":"1f5a8","🗑":"1f5d1","🗓":"1f5d3","🗝":"1f5dd","🗣":"1f5e3","🗺":"1f5fa","😄":"1f604","😊":"1f60a","😠":"1f620","😢":"1f622","😨":"1f628","😴":"1f634","🙏":"1f64f","🚀":"1f680","🚁":"1f681","🚂":"1f682","🚌":"1f68c","🚗":"1f697","🚜":"1f69c","🚢":"1f6a2","🚪":"1f6aa","🚲":"1f6b2","🚶":"1f6b6","🛒":"1f6d2","🟢":"1f7e2","🤔":"1f914","🤧":"1f927","🤲":"1f932","🥁":"1f941","🥒":"1f952","🥕":"1f955","🥛":"1f95b","🦀":"1f980","🦁":"1f981","🦄":"1f984","🦅":"1f985","🦆":"1f986","🦉":"1f989","🦊":"1f98a","🦋":"1f98b","🦒":"1f992","🦓":"1f993","🦕":"1f995","🦘":"1f998","🦚":"1f99a","🦠":"1f9a0","🦴":"1f9b4","🦷":"1f9b7","🧀":"1f9c0","🧒":"1f9d2","🧠":"1f9e0","🧩":"1f9e9","🧭":"1f9ed","🧰":"1f9f0","🧸":"1f9f8","🧺":"1f9fa","🧼":"1f9fc","🪁":"1fa81","🪥":"1faa5","🪻":"1fabb","🫐":"1fad0","🫧":"1fae7"};
var RE=/(?:\p{Extended_Pictographic}[\uFE0F\u{1F3FB}-\u{1F3FF}]?(?:\u200D\p{Extended_Pictographic}[\uFE0F\u{1F3FB}-\u{1F3FF}]?)*|[0-9#*]\uFE0F?\u20E3)/gu;
var SKIP=/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|SELECT|NOSCRIPT)$/;
function key(s){return s.replace(/\uFE0F/g,"")}
function file(s){var k=key(s);if(M[k])return M[k];var b=k.replace(/[\u{1F3FB}-\u{1F3FF}]/gu,"");return M[b]||null}
function bad(el){for(var e=el;e&&e!==document.body;e=e.parentElement){if(SKIP.test(e.tagName)||e.namespaceURI==="http://www.w3.org/2000/svg"||e.isContentEditable||(e.dataset&&e.dataset.noemo!=null))return true;if(e.classList&&e.classList.contains("zxe"))return "in"}return false}
function doText(t){
  var v=t.nodeValue;if(!v||!/[\u2190-\u2BFF\u{1F000}-\u{1FAFF}\u20E3\u00A9\u00AE\u203C\u2049\u2122\u2139\u3030\u303D\u3297\u3299]/u.test(v))return;
  var p=t.parentNode;if(!p)return;var b=bad(p);
  if(b==="in"){var z=p.closest(".zxe");if(z&&p===z){var tn=document.createTextNode(z.textContent);z.replaceWith(tn);doText(tn)}return}
  if(b)return;
  RE.lastIndex=0;var m,last=0,frag=null;
  var Z=window.__zill,ch=Z&&p.closest&&p.closest(Z.SEL);
  while((m=RE.exec(v))){if(ch&&Z.has(m[0]))continue;var f=file(m[0]);if(!f)continue;frag=frag||document.createDocumentFragment();
    if(m.index>last)frag.appendChild(document.createTextNode(v.slice(last,m.index)));
    var s=document.createElement("span");s.className="zxe";s.style.backgroundImage='url("../images/emo/'+f+'.svg")';
    var i=document.createElement("i");i.textContent=m[0];s.appendChild(i);frag.appendChild(s);last=m.index+m[0].length}
  if(!frag)return;if(last<v.length)frag.appendChild(document.createTextNode(v.slice(last)));p.replaceChild(frag,t)}
function walk(n){if(n.nodeType===3)return doText(n);if(n.nodeType!==1||SKIP.test(n.tagName)||(n.classList&&n.classList.contains("zxe")))return;
  var w=document.createTreeWalker(n,4),a=[],x;while((x=w.nextNode()))a.push(x);for(var k=0;k<a.length;k++)doText(a[k])}
var css=document.createElement("style");css.textContent=".zxe{display:inline-block;position:relative;width:1.18em;height:1.18em;vertical-align:-.22em;background:center/contain no-repeat;pointer-events:none;line-height:1}.zxe>i{position:absolute;inset:0;opacity:0;font-style:normal;overflow:hidden;white-space:nowrap;line-height:1}";
document.head.appendChild(css);
function run(rs){for(var r=0;r<rs.length;r++){var q=rs[r];if(q.type==="characterData")doText(q.target);else for(var k=0;k<q.addedNodes.length;k++)walk(q.addedNodes[k])}}
function start(){walk(document.body);new MutationObserver(run).observe(document.body,{childList:true,subtree:true,characterData:true});window.__zemo={walk:walk,M:M}}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();
})();
