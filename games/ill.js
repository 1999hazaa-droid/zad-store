/* رسومات زاد بدل الإيموجي في واجهة الألعاب (الأزرار والنجوم والشخصية)، دون لمس محتوى الأسئلة */
(function(){
var B="../images/zad/i_";
var M={"⭐":"star","🌟":"star","☆":"star0","🔒":"lock","🔊":"sound","🗣":"sound","🎵":"music","🎶":"music","💡":"bulb","✈":"rocket","🟢":"ok","💪":"star","💛":"heart","🎉":"star","👏":"star","😊":"smile","🌱":"sprout","🏠":"home","🎮":"blocks","🏅":"trophy","🏆":"trophy","🗺":"map","🧭":"rocket","🧠":"puzzle","📈":"chart","📊":"chart","🏡":"home","🔁":"eraser","☁":"cloud","💾":"cloud","🔎":"search","🔍":"search","🦉":"owl","🖨":"notebook","🚀":"rocket","🎯":"target","📚":"books","🎒":"bag","✅":"ok","✓":"ok","⏳":"clock","⌛":"clock"};
var RE=/[☀-➿⭐\uD83C-\uD83E][\uDC00-\uDFFF]?️?/g;
var SEL=".zic,.lve,.lvs,.zpb,.bb,.hs,.zrp,.hintbtn,.zo-in,.zo-toast,.zpo,.zkf,.zkg .stars,.zknav,.zkhd,.zkstats,.hubgrid,.cta2,.achcard,.stg-e,.zpe,.zh1,.zh2,.zdock,.top .pill,.worldcard,.zbdg,.zkbig,.zkchips2,.zrow2,.zrcem,.zhub .zpo";
function key(s){return s.replace(/️/g,"")}
window.__zill={SEL:SEL,has:function(e){return !!M[key(e)]}};
function fix(n){
  var t=n.nodeValue;if(!t)return;RE.lastIndex=0;if(!RE.test(t))return;RE.lastIndex=0;
  var p=n.parentNode;if(!p||!p.closest||!p.closest(SEL)||p.closest("input,textarea,script,style"))return;
  var out=document.createDocumentFragment(),last=0,m,hit=0;
  while((m=RE.exec(t))){var k=M[key(m[0])];if(!k)continue;hit=1;
    if(m.index>last)out.appendChild(document.createTextNode(t.slice(last,m.index)));
    var i=document.createElement("img");i.className="zem";i.src=B+k+".webp";i.alt="";i.setAttribute("aria-hidden","true");i.decoding="async";out.appendChild(i);last=m.index+m[0].length}
  RE.lastIndex=0;if(!hit)return;
  if(last<t.length)out.appendChild(document.createTextNode(t.slice(last)));p.replaceChild(out,n)}
function walk(r){var w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT,null),a=[],n;while((n=w.nextNode()))a.push(n);a.forEach(fix)}
function go(){walk(document.body);var q=0,mo=new MutationObserver(function(){if(q)return;q=1;requestAnimationFrame(function(){q=0;mo.disconnect();walk(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true})})});mo.observe(document.body,{childList:true,subtree:true,characterData:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();
})();
