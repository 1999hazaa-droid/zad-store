/* زر رجوع موحّد لصفحات المتجر والصفحات المستقلة (الألعاب لها نظامها الداخلي) */
(function(){
var sc=document.currentScript,base="/";try{base=new URL(sc.src).pathname.replace(/js\/zad-back\.js$/,"")}catch(e){}
var depth=0,ps=history.pushState;
history.pushState=function(){depth++;return ps.apply(this,arguments)};
var st=document.createElement("style");
st.textContent=".zbk-bar{max-width:1120px;margin:0 auto;padding:8px 14px 0;box-sizing:border-box;text-align:start;direction:rtl;width:100%;align-self:stretch}.zbk-bar[hidden]{display:none}.zbk{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px 0 12px;border:1px solid #E6DFFA;border-radius:12px;background:#fff;color:#5526B8;font:inherit;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 2px 6px #2a175c12;-webkit-tap-highlight-color:transparent}.zbk svg{width:18px;height:18px;fill:none;stroke:#5526B8;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}.zbk:hover{background:#F0EAFE}.zbk:active{transform:scale(.97)}.zbk:focus-visible{outline:3px solid #FFC83A;outline-offset:2px}";
document.head.appendChild(st);
var bar=document.createElement("div");bar.className="zbk-bar";bar.id="zbk";bar.hidden=true;
bar.innerHTML='<button type="button" class="zbk" aria-label="رجوع"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg><span>رجوع</span></button>';
function isHome(){var v=document.getElementById("view");if(v&&v.dataset&&v.dataset.route)return v.dataset.route==="home"&&!v.dataset.lib;var p=location.pathname.replace(/index\.html$/,"");return p===base||p==="/"}
function sync(){bar.hidden=isHome()}
function go(){var ref="";try{ref=document.referrer&&new URL(document.referrer).origin===location.origin}catch(e){}
if(depth>0||ref){history.back()}else{location.href=base}}
bar.querySelector("button").addEventListener("click",go);
function mount(){var h=document.querySelector("header.top,header.ztop,header");if(h&&h.parentNode)h.parentNode.insertBefore(bar,h.nextSibling);else document.body.insertBefore(bar,document.body.firstChild);sync();
var v=document.getElementById("view");if(v)new MutationObserver(sync).observe(v,{attributes:true,attributeFilter:["data-route","data-lib"]});addEventListener("popstate",function(){setTimeout(sync,0)})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount()})();
