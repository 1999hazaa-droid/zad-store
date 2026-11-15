/* يستبدل الرموز التعبيرية (Emoji) برسومات زاد الكرتونية الموحّدة — للصفحات الداخلية */
(function(){
var B=(document.currentScript&&document.currentScript.src||"").replace(/js\/zad-ill\.js.*$/,"")+"images/ill/";
var M={"🏠":"home","🎮":"blocks","⭐":"star","🎒":"bag","📚":"books","1️⃣":"n1","2️⃣":"n2","3️⃣":"n3","4️⃣":"n4","🔬":"microscope","🧠":"brain","🗺":"map","🛒":"cart","🍼":"bottle","🧸":"teddy","🎈":"balloon","✏":"pencil","🔢":"numbers","✍":"pen","🧩":"puzzle","📖":"book","📘":"book","🔊":"sound","🎯":"target","🏝":"island","🌳":"tree","🏰":"castle","🛠":"tools","🔍":"search","🔒":"lock","🦉":"owl","🏅":"trophy","🏆":"trophy","🚀":"rocket","🎨":"palette","🖍":"pencils","📝":"notebook","🌟":"star","💬":"cloud"};
var RE=/(?:[0-9]️?⃣|[☀-➿⭐\uD83C-\uD83E][\uDC00-\uDFFF‍]?️?)/g;
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,OPTION:1,SELECT:1,TITLE:1,NOSCRIPT:1};
function key(s){return s.replace(/️/g,"")}
function fix(n){
  var t=n.nodeValue;if(!t||!RE.test(t)){RE.lastIndex=0;return}RE.lastIndex=0;
  var p=n.parentNode;if(!p||SKIP[p.nodeName])return;
  var out=document.createDocumentFragment(),last=0,m,hit=0;
  while((m=RE.exec(t))){var k=M[m[0]]||M[key(m[0])];if(!k)continue;hit=1;
    if(m.index>last)out.appendChild(document.createTextNode(t.slice(last,m.index)));
    var i=document.createElement("img");i.className="zem";i.src=B+k+".svg";i.alt="";i.setAttribute("aria-hidden","true");i.decoding="async";out.appendChild(i);last=m.index+m[0].length}
  RE.lastIndex=0;if(!hit)return;
  if(last<t.length)out.appendChild(document.createTextNode(t.slice(last)));p.replaceChild(out,n)}
function walk(r){var w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT,null),a=[],n;while((n=w.nextNode()))a.push(n);a.forEach(fix)}
function go(){walk(document.body);
  var q=0,mo=new MutationObserver(function(ms){if(q)return;q=1;requestAnimationFrame(function(){q=0;mo.disconnect();walk(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true})})});
  mo.observe(document.body,{childList:true,subtree:true,characterData:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();
})();
