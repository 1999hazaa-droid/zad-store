(function(q){"use strict";const c=q.ATHR,s=c.escape,n=c.t,w=c.L,a=c.views={};a.ctx=function(e){const t=e.cfg,i=(e.products||[]).filter($=>$.is_visible!==!1).slice().sort(($,v)=>($.sort_order??0)-(v.sort_order??0)),r=(e.categories||[]).slice().sort(($,v)=>($.sort_order??0)-(v.sort_order??0)),o=new Map(i.map($=>[$.id,$])),l=new Map(r.map($=>[$.id,$])),d=new Map,f=c.buildGroups(i,t),u=new Set;i.forEach($=>{const v=f.get($.id);if(v){if(u.has(v))return;u.add(v)}d.set($.category_id,(d.get($.category_id)||0)+1)});const h=(e.reviews||[]).filter($=>$&&$.text),g=new Map;h.forEach($=>{if(!$.product_id)return;const v=f.get($.product_id);(v?v.map(b=>b.id):[$.product_id]).forEach(b=>{g.has(b)||g.set(b,[]),g.get(b).push($)})});const p=e.proof&&e.proof.p?e.proof:null,m=new Map;if(p){const $=(Number(new Date(p.at))||Date.now())+Math.max(0,Date.now()-(Number(p.recv)||Date.now())),v=M=>`${M.category_id||""}|${String(M.name||"").trim()}`;i.forEach(M=>{const b=f.get(M.id)||[M];let T=0,A=0,N=0;b.forEach(P=>{const O=p.p[P.id];if(!O)return;T=Math.max(T,Number(O.n)||0),A+=Number(O.f)||0;const _=O.last&&Number(new Date(O.last))||0;_>N&&(N=_)});const C=new Set(b.map(v)),L=b.length>1&&C.size===1&&p.g&&p.g[[...C][0]]?Number(p.g[[...C][0]]):T;(L||A||N)&&m.set(M.id,{n:L,f:A,ago:N?Math.max(0,$-N):null})})}return{cfg:t,products:i,categories:r,reviews:h,proof:p,proofById:m,country:e.country||c.BASE_COUNTRY,cartQty:e.cartQty||(()=>0),cartCustom:e.cartCustom||(()=>null),savedChild:e.savedChild||(()=>null),photoThumb:e.photoThumb||(()=>""),isFav:e.isFav||(()=>!1),prerender:!!e.prerender,byId:o,catById:l,counts:d,groups:f,reviewsByProduct:g,colorById:new Map((t.colors||[]).map($=>[$.id,$]))}};const S=(e,t,i)=>c.fill(t,e.cfg,i),y=(e,t)=>c.ct(e.cfg,t),B=(e,t)=>c.money(t,e.cfg),I=e=>e.country===c.BASE_COUNTRY,k=(e,t)=>c.moneyIn(t,e.cfg,e.country),F=()=>n("، ");a.money=B,a.local=k,a.fill=S,a.ct=y;const x={truck:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h11v9.5H3z"/><path d="M14 9.5h4l3 3.2V16h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>',card:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg>',check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',share:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4M8.2 13.2l7.6 4"/></svg>',gift:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5C10 4 6.5 5 7.5 7.2 8.2 8.5 12 8.5 12 8.5ZM12 8.5c2-4.5 5.5-3.5 4.5-1.3-.7 1.3-4.5 1.3-4.5 1.3Z"/></svg>',tag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.2V4.5h7.7l9.3 9.3-7.7 7.7z"/><circle cx="8" cy="9" r="1.4"/></svg>',file:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h7.5l4 4v13h-11.5z"/><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5"/></svg>',inbox:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v10M8 9.8l4 3.7 4-3.7"/><path d="M4 13.5v5.5h16v-5.5"/></svg>',printer:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3.5h10V8"/><rect x="3.5" y="8" width="17" height="8.5" rx="1.6"/><path d="M7 13.5h10V20.5H7z"/></svg>',chevron:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg>',home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5"/><path d="M6 9v10.5h4.5V14h3v5.5H18V9"/></svg>',sun:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',moon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z"/></svg>',auto:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4v16a8 8 0 0 0 0-16Z" class="fill"/></svg>',user:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5"/></svg>',users:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c.9-3.3 3.2-4.9 6-4.9s5.1 1.6 6 4.9"/><path d="M15.2 5.6a3.2 3.2 0 0 1 0 6M17.3 14.9c1.8.6 3 2.1 3.7 4.6"/></svg>',clock:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',verified:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.9 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.9-2.6-2.2-1.6.9-2.6-.9-2.6 2.2-1.6.9-2.6 2.7.2Z"/><path d="M8.6 12.2l2.3 2.3 4.6-4.8"/></svg>',grid:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/></svg>',globe:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5S9.6 5.9 12 3.5Z"/></svg>',side:'<svg class="side" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6l-6 6 6 6"/></svg>',heart:'<svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.8-4.6-7.8-10.3A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 7.8 2.7c0 5.7-7.8 10.3-7.8 10.3Z"/></svg>',star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',bell:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15l1.5-2Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" class="fill"/></svg>',tiktok:'<svg class="solid" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>'};a.icon=x,a.waIcon=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6a9.3 9.3 0 0 0-8 14.1L2.7 21.4l4.8-1.3A9.3 9.3 0 1 0 12 2.6Z"/><path class="wa-glyph" d="M8.4 7.6c.2-.4.4-.4.7-.4h.6c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.7.8c.7 1.3 1.7 2.3 3 3l.8-.7c.2-.2.4-.2.7-.1l1.8.8c.3.1.4.3.4.5v.6c0 .3-.1.5-.4.7-.4.3-1 .5-1.6.5-1.4 0-3.2-.8-4.7-2.3S8 9.9 8 8.5c0-.4.1-.7.4-.9Z"/></svg>';const H=[{re:/instagram\.com/i,key:"instagram",label:"Instagram"},{re:/tiktok\.com/i,key:"tiktok",label:"TikTok"},{re:/snapchat\.com/i,key:"snapchat",label:"Snapchat"},{re:/(^|\/\/|\.)(x|twitter)\.com/i,key:"x",label:"X"},{re:/facebook\.com/i,key:"facebook",label:"Facebook"},{re:/youtube\.com|youtu\.be/i,key:"youtube",label:"YouTube"}];a.socials=function(e,t="soc"){return(e.cfg.texts.socials||[]).filter(i=>i.name&&c.isUrl(i.url)).map(i=>{const r=H.find(l=>l.re.test(i.url));if(!r)return`<a class="${t}" href="${s(i.url)}" target="_blank" rel="noopener">${s(i.name)}</a>`;const o=i.name||r.label;return`<a class="${t} ${t}-icon" href="${s(i.url)}" target="_blank" rel="noopener" aria-label="${s(o)}" title="${s(o)}"><span class="soc-ico" style="--icon:url('https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${r.key}.svg')" aria-hidden="true"></span></a>`}).join("")},a.colorOf=(e,t)=>e.colorById.get(t.color_id)||null,a.label=(e,t)=>c.displayLabel(t,e.cfg),a.pname=e=>w(e,"name"),a.cname=e=>w(e,"name"),a.img=e=>e.thumb_url||c.thumb(e.image_url,"s"),a.big=e=>c.thumb(e.image_url,"m"),a.catOf=(e,t)=>e.catById.get(t.category_id)||null,a.description=(e,t)=>{const i=String(w(t,"description")||"").trim();if(i)return i;const r=a.catOf(e,t);return r?String(w(r,"description")||"").trim():""},a.countryName=e=>w(e,"name"),a.listings=function(e,t){const i=new Set,r=[];return t.forEach(o=>{const l=e.groups.get(o.id);if(l){if(i.has(l))return;i.add(l);const d=l.find(f=>f.is_available!==!1&&t.includes(f))||o;r.push(d);return}r.push(o)}),r},a.sortList=function(e,t){const i=e.slice();return t==="asc"&&i.sort((r,o)=>r.price-o.price),t==="desc"&&i.sort((r,o)=>o.price-r.price),i},a.reviewStats=function(e){if(!e||!e.length)return null;const t=e.reduce((i,r)=>i+Number(r.rating||0),0)/e.length;return{avg:Math.round(t*10)/10,count:e.length}},a.stars=function(e,t=""){const i=Math.max(0,Math.min(5,Number(e)||0)),r=Math.round(i);return`<span class="stars ${t}" role="img" aria-label="${s(n("{r} من 5",{r:i}))}">${"★".repeat(r)}<span class="off">${"★".repeat(5-r)}</span></span>`},a.proofOf=function(e,t){const i=e.cfg.proof||{},r=e.proofById&&e.proofById.get(t.id);if(!r)return null;const l={n:i.counts!==!1&&r.n>=Math.max(1,Number(i.min_buyers)||3)?r.n:0,f:i.favs!==!1&&e.cfg.sales.favorites!==!1&&r.f>=Math.max(1,Number(i.min_favs)||5)?r.f:0,ago:i.last!==!1&&r.ago!==null&&r.ago<=Math.max(1,Number(i.recent_days)||7)*864e5?r.ago:null};return l.n||l.f||l.ago!==null?l:null},a.ago=function(e){const t=Math.floor(e/36e5),i=Math.floor(e/864e5);return c.isEn()?t<1?"less than an hour ago":i<1?t===1?"1 hour ago":`${t} hours ago`:i===1?"yesterday":`${i} days ago`:t<1?"قبل أقل من ساعة":i<1?t===1?"قبل ساعة":t===2?"قبل ساعتين":t<=10?`قبل ${t} ساعات`:`قبل ${t} ساعة`:i===1?"أمس":i===2?"قبل يومين":i<=10?`قبل ${i} أيام`:`قبل ${i} يوماً`},a.buyersText=function(e){return c.isEn()?e===1?"1 customer ordered this":`${e} customers ordered this`:e===1?"عميل واحد طلبه":e===2?"عميلان طلباه":e<=10?`${e} عملاء طلبوه`:`${e} عميلاً طلبوه`},a.favsText=function(e){return c.isEn()?e===1?"Saved by 1 person":`Saved by ${e} people`:`أضافه ${e===1?"شخص واحد":e===2?"شخصان":e<=10?`${e} أشخاص`:`${e} شخصاً`} للمفضلة`},a.storeTotal=function(e){const t=e.cfg.proof||{},i=e.proof&&Number(e.proof.total);if(t.total===!1||!i||i<Math.max(1,Number(t.min_total)||20))return"";const r=c.storeName(e.cfg);return c.isEn()?`${i} customers ordered from ${r}`:i===1?`عميل واحد طلب من ${r}`:i===2?`عميلان طلبا من ${r}`:i<=10?`${i} عملاء طلبوا من ${r}`:`${i} عميلاً طلبوا من ${r}`},a.cardProof=function(e,t){const i=a.proofOf(e,t);return i&&i.n?`<span class="card-proof">${x.users}<span>${s(a.buyersText(i.n))}</span></span>`:""},a.pdpProof=function(e,t){const i=a.proofOf(e,t);if(!i)return"";const r=[];return i.n&&r.push(`<li>${x.users}<span>${s(a.buyersText(i.n))}</span></li>`),i.ago!==null&&r.push(`<li>${x.clock}<span>${s(c.isEn()?`Last ordered ${a.ago(i.ago)}`:`آخر طلب ${a.ago(i.ago)}`)}</span></li>`),i.f&&r.push(`<li>${x.heart}<span>${s(a.favsText(i.f))}</span></li>`),r.length?`<ul class="pdp-proof">${r.join("")}</ul>`:""},a.reviewCount=e=>c.isEn()?e===1?"1 review":`${e} reviews`:e===1?"تقييم واحد":e===2?"تقييمان":`${e} تقييمات`,a.priceHTML=function(e,t,{big:i=!1}={}){if(c.isFree(t))return`<div class="price${i?" big":""}"><b class="free-tag">${s(n("مجاني"))}</b></div>`;const r=Number(t.old_price)>Number(t.price),o=r?Number(t.old_price)-Number(t.price):0;return`<div class="price${i?" big":""}">
            <b>${k(e,t.price)}</b>
            ${r?`<s>${k(e,t.old_price)}</s>`:""}
            ${r&&i?`<span class="save">${s(n("وفّر {amount}",{amount:k(e,o)}))}</span>`:""}
            ${I(e)?"":`<small class="base-price">${B(e,t.price)}</small>`}
        </div>`},a.dot=function(e){return`<span class="dot" style="background:${e&&/^#[0-9a-f]{6}$/i.test(e.hex||"")?e.hex:"#cccccc"}"></span>`},a.colorTag=function(e,t){const i=a.colorOf(e,t);return i?`<span class="color-tag">${a.dot(i)}${s(w(i,"name"))}</span>`:""},a.cardSwatches=function(e,t){const i=e.groups.get(t.id);return i?`<div class="swatches" role="group" aria-label="${s(n("الألوان"))}">
            ${i.map(r=>{const o=a.colorOf(e,r);return`<button type="button" class="sw${r.id===t.id?" on":""}" data-swap="${s(r.id)}" aria-pressed="${r.id===t.id}" aria-label="${s(o?w(o,"name"):"")}"${r.is_available===!1?' data-out="1"':""}>${a.dot(o)}</button>`}).join("")}
            <span class="sw-name">${s(w(a.colorOf(e,t)||{},"name"))}</span>
        </div>`:a.colorTag(e,t)},a.maxQty=e=>Math.max(1,Math.min(99,Number(e.cfg.order.max_qty)||10)),a.maxFor=(e,t)=>{const i=c.stockOf(t);return i===null?a.maxQty(e):Math.min(a.maxQty(e),i)},a.lowStock=(e,t)=>{const i=c.stockOf(t),r=Number(e.cfg.sales.low_stock)||0;return e.cfg.sales.low_stock_show!==!1&&i!==null&&i>0&&r>0&&i<=r&&t.is_available!==!1?i:0},a.freeBtn=function(e,{block:t=!1}={}){return`<a class="btn btn-primary free-dl${t?" btn-block":""}" href="${s(c.fileHref(e))}" download="${s((e.slug||"zad-file")+".pdf")}" data-free-dl="${s(e.id)}" rel="noopener">⬇ ${s(n("تحميل مجاني"))}</a>`},a.cardAction=function(e,t){if(t.is_available===!1)return e.cfg.sales.restock!==!1?`<a class="btn btn-ghost notify-link" href="${c.url.product(t)}#notify">${x.bell}${s(n("أخبرني عند التوفر"))}</a>`:`<button class="btn btn-ghost" type="button" disabled>${s(y(e,"texts.sold_out"))}</button>`;if(c.isFree(t))return a.freeBtn(t);const i=e.cartQty(t.id);return c.isStory(t)?i>0?`<a class="btn btn-ghost in-cart" href="${c.url.page("cart")}">${x.check}${s(n("في السلة"))}</a>`:`<a class="btn btn-primary story-cta" href="${c.url.product(t)}#personalize">${s(n("خصص القصة لطفلك"))}</a>`:i>0&&a.maxFor(e,t)<=1?`<a class="btn btn-ghost in-cart" href="${c.url.page("cart")}">${x.check}${s(n("في السلة"))}</a>`:i>0?`<div class="stepper" role="group" aria-label="${s(n("الكمية في السلة"))}">
                <button type="button" data-inc="${s(t.id)}" aria-label="${s(n("زيادة"))}"${i>=a.maxFor(e,t)?" disabled":""}>+</button>
                <output aria-live="polite">${i}</output>
                <button type="button" data-dec="${s(t.id)}" aria-label="${s(n("إنقاص"))}">−</button>
            </div>`:`<button class="btn btn-primary" type="button" data-add="${s(t.id)}">${s(y(e,"texts.add_to_cart"))}</button>`},a.storyCard=function(e,t,{eager:i=!1,high:r=!1}={}){const o=c.url.product(t),l=Number(t.old_price)>Number(t.price),d=l?Math.round((1-t.price/t.old_price)*100):0,f=a.reviewStats(e.reviewsByProduct.get(t.id)),u=a.img(t),h=c.proOn(e.cfg,t.story)&&!c.isActivity(t),g=a.storyBlurb(t);return`<article class="ks-card" data-card="${s(t.id)}">
            <div class="ks-media"><a class="ks-img" href="${o}" tabindex="-1" aria-hidden="true">
                ${u?`<img src="${s(u)}" alt="" width="400" height="500"${i?"":' loading="lazy"'}${r?' fetchpriority="high"':""} decoding="async">`:""}
                <span class="ks-badge">${c.isActivity(t)?t.story==="abc"?"🔤 "+s(n("تعليمي")):"🖍️ "+s(n("للتلوين")):"👦👧 "+s(n("للأولاد والبنات"))}</span>
                ${l?`<span class="ks-sale">${s(n("خصم {pct}%",{pct:d}))}</span>`:h?`<span class="ks-sale pro">🌟 ${s(n("متاحة بوجه طفلك"))}</span>`:""}
            </a>
            <button class="ks-peek" type="button" data-flip="${s(t.id)}" aria-label="${s(n("تصفّح القصة"))}">👁</button></div>
            <div class="ks-body">
                <a class="ks-name" href="${o}">${s(a.storyShort(t))}</a>
                ${g?`<p class="ks-blurb">${s(g)}</p>`:""}
                ${f?`<span class="card-rate">${a.stars(f.avg,"sm")}<small>(${f.count})</small></span>`:""}
                <div class="ks-price">${l?`<s>${k(e,t.old_price)}</s>`:""}<b>${k(e,t.price)}</b></div>
            </div>
            ${t.is_available===!1?`<div class="ks-act">${a.cardAction(e,t)}</div>`:`<a class="ks-cta" href="${o}#personalize">✏️ ${s(c.isActivity(t)?n("اكتب اسم طفلك"):n("خصّص القصة لطفلك"))}</a>`}
        </article>`},a.card=function(e,t,{eager:i=!1,high:r=!1}={}){if(c.isStory(t))return a.storyCard(e,t,{eager:i,high:r});const o=t.is_available===!1,l=!o&&Number(t.old_price)>Number(t.price),d=l?Math.round((1-t.price/t.old_price)*100):0,f=c.url.product(t),u=a.reviewStats(e.reviewsByProduct.get(t.id));let h="";o?h=`<span class="badge out">${s(y(e,"texts.sold_out"))}</span>`:l?h=`<span class="badge sale">${s(n("خصم {pct}%",{pct:d}))}</span>`:t.is_best_seller&&(h=`<span class="badge hot">${s(c.isEn()?"Best seller":y(e,"sales.best_title")||n("الأكثر طلباً"))}</span>`);const g=a.img(t);return`<article class="card${o?" soldout":""}" data-card="${s(t.id)}">
            <a class="card-img" href="${f}" tabindex="-1" aria-hidden="true">
                ${g?`<img src="${s(g)}" alt="" width="400" height="500"${i?"":' loading="lazy"'}${r?' fetchpriority="high"':""} decoding="async">`:""}
                ${h}
            </a>
            ${a.favBtn(e,t)}
            <div class="card-body">
                <a class="card-name" href="${f}">${s(a.pname(t))}</a>
                ${u?`<span class="card-rate">${a.stars(u.avg,"sm")}<small>(${u.count})</small></span>`:""}
                ${a.cardProof(e,t)}
                ${a.cardSwatches(e,t)}
                ${a.priceHTML(e,t)}
                ${a.lowStock(e,t)?`<span class="card-low">🔥 ${s(n("باقي {n} فقط",{n:a.lowStock(e,t)}))}</span>`:""}
            </div>
            <div class="card-action" data-action-for="${s(t.id)}">${a.cardAction(e,t)}</div>
        </article>`},a.favBtn=function(e,t,{big:i=!1}={}){if(e.cfg.sales.favorites===!1)return"";const r=e.isFav(t.id);return`<button class="fav-btn${i?" big":""}${r?" on":""}" type="button" data-fav="${s(t.id)}" aria-pressed="${r}" aria-label="${s(n(r?"إزالة من المفضلة":"أضف للمفضلة"))}">${x.heart}${i?`<span>${s(n(r?"في المفضلة":"أضف للمفضلة"))}</span>`:""}</button>`},a.grid=function(e,t,{eagerCount:i=4}={}){return t.length?`<div class="grid${Number(e.cfg.theme.grid_mobile)===1?" one":""}">${t.map((o,l)=>a.card(e,o,{eager:l<i,high:l<2})).join("")}</div>`:""},a.rail=function(e,{id:t,title:i,link:r,items:o,cards:l}){const d=l||(o||[]).map(f=>a.card(e,f)).join("");return d?`<section class="section" id="${t}" aria-labelledby="${t}-t">
            <div class="wrap">
                <div class="section-head">
                    <h2 id="${t}-t">${s(i)}</h2>
                    ${r?`<a class="more" href="${r.href}">${s(r.text)}</a>`:""}
                </div>
                <div class="rail">${d}</div>
            </div>
        </section>`:""},a.validBundles=function(e){return(e.cfg.sales.bundles||[]).filter(t=>{if(!t.enabled||!t.a||!t.b||t.a===t.b)return!1;const i=e.byId.get(t.a),r=e.byId.get(t.b);return i&&r&&i.is_available!==!1&&r.is_available!==!1})};const z=(e,t,i)=>Math.round((Number(e.price)+Number(t.price)*(1-i/100))*1e3)/1e3;a.bundleCard=function(e,t){const i=e.byId.get(t.a),r=e.byId.get(t.b),o=Math.max(1,Math.min(90,Number(t.pct)||0)),l=Number(i.price)+Number(r.price);return`<article class="set-card">
            <a class="set-imgs" href="${c.url.product(i)}" aria-label="${s(a.label(e,i))}">
                <span>${a.img(i)?`<img src="${s(a.img(i))}" alt="" loading="lazy" decoding="async" width="300" height="375">`:""}</span>
                <i aria-hidden="true">+</i>
                <span>${a.img(r)?`<img src="${s(a.img(r))}" alt="" loading="lazy" decoding="async" width="300" height="375">`:""}</span>
            </a>
            <div class="set-body">
                <b class="set-name">${s(a.pname(i))} + ${s(a.pname(r))}</b>
                <div class="price"><b>${k(e,z(i,r,o))}</b><s>${k(e,l)}</s></div>
                <span class="set-save">${s(n("{name} بخصم {pct}%",{name:a.pname(r),pct:o}))}</span>
            </div>
            <button class="btn btn-primary btn-sm" type="button" data-add-bundle="${s(t.a)}|${s(t.b)}">${s(n("أضف الطقم"))}</button>
        </article>`},a.setCards=function(e,t=12){const i=new Set,r=[];return a.validBundles(e).forEach(o=>{const l=e.groups.get(o.a),d=`${l?l[0].id:o.a}|${o.b}`;i.has(d)||(i.add(d),r.push(o))}),r.slice(0,t).map(o=>a.bundleCard(e,o)).join("")},a.bundleOffers=function(e,t){return a.validBundles(e).filter(i=>i.a===t.id||i.b===t.id).map(i=>{const r=e.byId.get(i.a),o=e.byId.get(i.b),l=i.a===t.id?o:r,d=Number(i.pct)||0,f=Number(r.price)+Number(o.price),u=i.a===t.id?n("أكمل الطقم: «{name}» بخصم {pct}%",{name:a.label(e,o),pct:d}):n("اشترِ «{name}» واحصل على هذا المنتج بخصم {pct}%",{name:a.label(e,r),pct:d});return`<div class="offer">
                <a href="${c.url.product(l)}">${a.img(l)?`<img src="${s(a.img(l))}" alt="" loading="lazy" width="104" height="130">`:""}</a>
                <div>
                    <strong>${s(u)}</strong>
                    <span class="price"><b>${s(n("الطقم {price}",{price:k(e,z(r,o,d))}))}</b><s>${k(e,f)}</s></span>
                </div>
                <button class="btn btn-primary btn-sm" type="button" data-add-bundle="${s(i.a)}|${s(i.b)}">${s(n("أضف الطقم"))}</button>
            </div>`}).join("")},a.volumeTeaser=function(e){const t=c.volumeTiers(e.cfg);if(!t.length)return"";const i=t.map((r,o)=>n(o===t.length-1?"{pieces} أو أكثر خصم {pct}%":"{pieces} خصم {pct}%",{pieces:c.piecesText(r.min),pct:r.pct}));return`<div class="volume">${x.tag}<span><b>${s(n("وفّر أكثر كلما زادت القطع:"))}</b> ${s(i.join(F()))}. ${s(n("يُطبَّق تلقائيًا في السلة."))}</span></div>`},a.deliveryPriceLabel=function(e,t){return t.pricing==="per_kg"?n("{price} لكل كيلو",{price:B(e,t.price)}):Number(t.price)>0?B(e,t.price):n("مجاني")},a.countriesText=e=>e.map(t=>`${t.flag} ${a.countryName(t)}`).join(F()),a.flagsFor=(e,t)=>c.countries(e.cfg).filter(i=>i.enabled&&c.inCountries(t,i.code)),a.paymentGroups=function(e){const t=new Map;return c.countries(e.cfg).filter(i=>i.enabled).forEach(i=>{const r=c.paymentsFor(e.cfg,i.code).map(l=>w(l,"name"));if(!r.length)return;const o=r.join(F());t.has(o)||t.set(o,[]),t.get(o).push(i)}),Array.from(t.entries()).map(([i,r])=>({names:i,countries:r}))},a.freeLine=function(e){const t=e.cfg;if(!t.order.free_enabled||!(Number(t.order.free_min)>0))return"";const i=c.countries(t).filter(l=>l.enabled),r=i.filter(l=>c.freeAppliesTo(t,l.code)),o=r.length===1&&r[0].code==="OM"?n("داخل عُمان"):r.length<i.length?n("إلى {countries}",{countries:a.countriesText(r)}):"";return n("التوصيل مجاني {where} للطلبات من {free} أو أكثر.",{where:o,free:B(e,t.order.free_min)}).replace(/\s+/g," ")},a.deliveryLines=function(e){const t=c.countries(e.cfg).filter(l=>l.enabled).length,i=(e.cfg.order.delivery||[]).filter(l=>l.enabled).map(l=>{const d=a.flagsFor(e,l),f=d.length&&d.length<t?` — ${d.map(u=>u.flag).join(" ")}`:"";return`${w(l,"name")}: ${a.deliveryPriceLabel(e,l)}${l.duration?` (${c.duration(l.duration)})`:""}${f}`}),r=a.freeLine(e);r&&i.push(r);const o=a.paymentGroups(e);return o.length===1?i.push(n("طرق الدفع: {names}.",{names:o[0].names})):o.forEach(l=>i.push(n("{flags} الدفع: {names}.",{flags:l.countries.map(d=>d.flag).join(" "),names:l.names}))),i},a.deliveryBox=function(e,t){const i=e.cfg,r=c.country(i,e.country);if(c.isDigital(i)){const h=c.deliveriesFor(i,r.code),g=c.paymentsFor(i,r.code),p=c.countries(i).filter(m=>m.enabled).length>1;return`<div class="info-box">
            <div class="info-row">${x.inbox}<div>
                <b>${s(n("الاستلام"))}</b>
                ${h.length?h.map(m=>`<span>${s(w(m,"name"))}${m.duration?` · ${s(c.duration(m.duration))}`:""}</span>${w(m,"note")?`<span class="muted">${s(w(m,"note"))}</span>`:""}`).join(""):`<span>${s(n("تواصل معنا عبر واتساب."))}</span>`}
            </div></div>
            ${g.length?`<div class="info-row">${x.card}<div><b>${s(n("الدفع"))}</b><span>${s(g.map(m=>w(m,"name")).join(F()))}</span></div></div>`:""}
            ${p?`<button class="link-btn" type="button" data-open-currency>${s(n("لست في {country}؟ غيّر الدولة",{country:a.countryName(r)}))}</button>`:""}
        </div>`}const o=c.deliveriesFor(i,r.code),l=c.paymentsFor(i,r.code),d=c.countries(i).filter(h=>h.enabled).length>1,f=i.order.free_enabled&&Number(i.order.free_min)>0&&c.freeAppliesTo(i,r.code),u=o.map(h=>{let g=a.deliveryPriceLabel(e,h);if(h.pricing==="per_kg"&&t){const p=c.shippingFor(h,[{product:t,qty:1}],i);g=n("{price} لكل كيلو (هذا المنتج {cost})",{price:B(e,h.price),cost:B(e,p.cost)})}return`<span>${s(w(h,"name"))}: <b>${s(g)}</b>${h.duration?` · ${s(c.duration(h.duration))}`:""}</span>`});return`<div class="info-box">
            <div class="info-row">${x.truck}<div>
                <b>${s(n("التوصيل إلى {flag} {country}",{flag:r.flag,country:a.countryName(r)}))}</b>
                ${u.length?u.join(""):`<span>${s(n("غير متاح حاليًا، تواصل معنا عبر واتساب."))}</span>`}
                ${f?`<span class="ok">${s(n("مجاني للطلبات من {free} أو أكثر",{free:B(e,i.order.free_min)}))}</span>`:""}
            </div></div>
            ${l.length?`<div class="info-row">${x.card}<div><b>${s(n("الدفع"))}</b><span>${s(l.map(h=>w(h,"name")).join(F()))}</span></div></div>`:""}
            ${d?`<button class="link-btn" type="button" data-open-currency>${s(n("لست في {country}؟ غيّر الدولة",{country:a.countryName(r)}))}</button>`:""}
        </div>`},a.trust=function(e){const t=e.cfg;if(!t.sales.trust_show)return"";const i=c.paymentsFor(t,e.country),r=[];(y(e,"sales.trust_custom")||[]).filter(Boolean).slice(0,3).forEach(l=>r.push(S(e,l))),i.some(l=>l.type==="cod")&&r.push(n("الدفع عند الاستلام")),i.some(l=>l.type==="bank")&&r.push(i.some(l=>l.type==="bank"&&/دولي/.test(l.name))?n("تحويل بنكي دولي"):n("تحويل بنكي مباشر")),i.some(l=>l.type==="online")&&r.push(n("دفع إلكتروني آمن"));const o=(t.order.delivery||[]).some(l=>l.enabled&&Array.isArray(l.countries)&&l.countries.some(d=>d!=="OM"));return c.isDigital(t)?r.push(n("تصلك القصة على واتساب")):r.push(n(o?"توصيل لكل دول الخليج":"توصيل داخل سلطنة عُمان")),c.isValidWhatsapp(t.order.whatsapp)&&r.push(n("تواصل مباشر عبر واتساب")),`<ul class="trust">${r.map(l=>`<li>${x.check}${s(l)}</li>`).join("")}</ul>`},a.ad=function(e){if(!e.cfg.ad.show)return"";const t=c.adSlides(e.cfg).map((r,o)=>a.adSlide(e,r,o)).filter(Boolean);if(!t.length)return"";if(t.length===1)return`<section class="ad wrap" id="ad">${t[0]}</section>`;const i=t.length;return`<section class="ad wrap ad-multi" id="ad" aria-roledescription="carousel" aria-label="${s(n("العروض"))}"${e.cfg.ad.auto===!1?' data-manual=""':""}>
            <div class="ad-track">${t.map((r,o)=>`<div class="ad-slide" role="group" aria-roledescription="slide" aria-label="${o+1} / ${i}">${r}</div>`).join("")}</div>
            <div class="ad-dots">${t.map((r,o)=>`<button type="button" data-ad-dot="${o}" aria-label="${s(n("إعلان {n}",{n:o+1}))}"${o?"":' aria-current="true"'}></button>`).join("")}</div>
        </section>`},a.adSlide=function(e,t,i){if(!c.adReady(t))return"";const r=i===0,o=m=>r?y(e,`ad.${m}`):c.L(t,m),l=c.isSafeLink(t.link)&&t.link?t.link:"",d=l&&!/^https?:/i.test(l)&&!l.startsWith("#")?c.base()+l.replace(/^\//,""):l,f=/^https?:/i.test(d),u=(m,$)=>d?`<a class="${$}" href="${s(d)}"${f?' target="_blank" rel="noopener"':""}>${m}</a>`:`<div class="${$}">${m}</div>`;if(t.type==="image"&&t.image_url)return u(`<img src="${s(a.asset(t.image_url))}" alt="${s(o("image_alt")||"")}"${r?' fetchpriority="high"':' loading="lazy" decoding="async"'}>`,"ad-media");if(t.type==="video"&&t.video_url){const m=typeof ATHR_CATALOG<"u"&&ATHR_CATALOG&&ATHR_CATALOG.ad?ATHR_CATALOG.ad[t.video_url]:null,$=m?c.base()+m.v:t.video_url,v=m?c.base()+m.p:t.image_url?a.asset(t.image_url):"";return u(`<video muted loop playsinline${r?' autoplay preload="auto"':' preload="none"'} src="${s($)}"${v?` poster="${s(v)}"`:""}${m&&m.w&&m.h?` width="${m.w}" height="${m.h}"`:""} aria-label="${s(o("video_alt")||"")}"></video><span class="ad-play" aria-hidden="true"></span>`,"ad-media")}const h=o("title"),g=o("text"),p=o("button");if(t.type==="text"&&(h||g)){const m=/^#[0-9a-f]{6}$/i.test(t.bg)?t.bg:e.cfg.theme.primary,$=d||"#catalog";return`<div class="ad-text" style="background:${s(m)}">
                ${h?`<h2>${s(S(e,h))}</h2>`:""}
                ${g?`<p>${s(S(e,g))}</p>`:""}
                ${p?`<a class="btn" href="${s($)}"${f?' target="_blank" rel="noopener"':""}>${s(S(e,p))}</a>`:""}
            </div>`}return""},a.storePoints=function(e){const t=e.cfg,i=c.countries(t).some(l=>l.enabled&&l.code!==c.BASE_COUNTRY),r=t.order.free_enabled&&Number(t.order.free_min)>0,o=(t.order.payments||[]).some(l=>l.enabled&&l.type==="cod");return c.isDigital(t)?[[a.icon.file,n("PDF للطباعة")],[a.icon.inbox,n("عبر واتساب")],[a.icon.card,n(o?"الدفع عند الاستلام":"تحويل بنكي")]]:[r?[a.icon.tag,n("توصيل مجاني فوق {amount}",{amount:c.trimZeros(B(e,t.order.free_min))})]:null,[a.icon.card,n(o?"الدفع عند الاستلام":"تحويل بنكي آمن")],[a.icon.truck,n(i?"توصيل للخليج":"توصيل لكل عُمان")]].filter(Boolean)},a.heroTitle=function(e){const t=S(e,y(e,"texts.hero_title"))||"",i=t.match(/^(.+?)\s*[،,]\s*(.+)$/);return i?`${s(i[1])}<span class="hl">${s(i[2])}</span>`:s(t)},a.hero=function(e){const t=e.cfg;if(!t.theme.hero_show)return`<h1 class="sr-only">${s(c.storeName(t))}</h1>`;if(t.theme.hero_compact!==!1&&!t.theme.hero_image)return`<section class="hero hero-compact${t.theme.hero_pattern?" pattern":""}">
            <div class="wrap hero-inner">
                <h1>${a.heroTitle(e)}</h1>
                <ul class="hero-mini">${a.storePoints(e).map(([l,d])=>`<li>${l}<span>${s(d)}</span></li>`).join("")}</ul>
                ${a.storeTotal(e)?`<p class="hero-proof">${x.users}<span>${s(a.storeTotal(e))}</span></p>`:""}
            </div>
        </section>`;const i=(y(e,"texts.hero_features")||[]).filter(Boolean).slice(0,4).map(l=>`<li>${x.check}${s(S(e,l))}</li>`).join(""),r=t.theme.hero_image&&(c.isUrl(t.theme.hero_image)||!t.theme.hero_image.includes(":"))?t.theme.hero_image:"",o=y(e,"texts.hero_text");return`<section class="hero${t.theme.hero_pattern?" pattern":""}${r?" has-image":""}">
            ${r?`<div class="hero-bg"><img data-deferred-src="${s(a.asset(r))}" alt=""></div>`:""}
            <div class="wrap hero-inner">
                <h1>${a.heroTitle(e)}</h1>
                ${o?`<p>${s(S(e,o))}</p>`:""}
                ${i?`<ul class="hero-features">${i}</ul>`:""}
                ${a.storeTotal(e)?`<p class="hero-proof">${x.users}<span>${s(a.storeTotal(e))}</span></p>`:""}
                ${r?"":a.heroShots(e)}
            </div>
        </section>`},a.heroShots=function(e){const t=a.listings(e,e.products.filter(o=>o.is_available!==!1&&a.img(o))),i=t.filter(o=>o.is_best_seller),r=(i.length>=3?i:t).slice(0,3);return r.length<3?"":`<div class="hero-shots" aria-hidden="true">${r.map((o,l)=>`<span class="hs hs${l+1}"><img src="${s(a.img(o))}" alt="" loading="lazy" decoding="async" width="200" height="250"></span>`).join("")}</div>`},a.categoryImage=function(e,t){if(t.image_url)return c.thumb(t.image_url,"s");const i=e.products.find(r=>r.category_id===t.id&&a.img(r));return i?a.img(i):""},a.catIcons={kids:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.5-1.9-.4-1.2.3-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5-4-10-9-10z"/><circle cx="7.6" cy="11.2" r="1"/><circle cx="10.2" cy="7.2" r="1"/><circle cx="15" cy="7.6" r="1"/>',book:'<path d="M3 5.5c3-1 6-.8 9 1v13c-3-1.8-6-2-9-1z"/><path d="M21 5.5c-3-1-6-.8-9 1v13c3-1.8 6-2 9-1z"/>',cap:'<path d="M2.5 9.5 12 5l9.5 4.5L12 14z"/><path d="M6.5 11.8V16c0 1.3 2.5 2.5 5.5 2.5s5.5-1.2 5.5-2.5v-4.2"/><path d="M21.5 9.5v5"/>',board:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8M7 9h6M7 12h4"/>',file:'<path d="M6.5 3.5h7.5l4 4v13h-11.5z"/><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5"/>'},a.catKey=function(e){const t=String(e&&(e.name||e.name_en)||"");return/معلم|teacher/i.test(t)?"board":/طلاب|صف|student|grade/i.test(t)?"cap":/أنشطة|انشطة|كتب|book|activit/i.test(t)?"book":/أطفال|اطفال|kid|child/i.test(t)?"kids":"file"},a.catIcon=e=>`<svg viewBox="0 0 24 24" aria-hidden="true">${a.catIcons[a.catKey(e)]}</svg>`,a.tiles=function(e,t){const i=e.categories.filter(r=>e.counts.get(r.id));return i.length?`<nav class="tiles wrap" aria-label="${s(n("الأقسام"))}">
            ${i.map(r=>`<a class="tile${t&&t.id===r.id?" on":""}" data-k="${a.catKey(r)}" href="${c.url.category(r)}"${t&&t.id===r.id?' aria-current="page"':""}>
                    <span class="tile-img">${a.catIcon(r)}</span>
                    <span class="tile-name">${s(a.cname(r))}</span>
                </a>`).join("")}
        </nav>`:""},a.sortSelect=function(e,t){return e.cfg.theme.show_sort===!1?"":`<label class="sr-only" for="sortSelect">${s(n("ترتيب حسب السعر"))}</label>
            <select class="select" id="sortSelect">
                <option value="default"${t==="default"||!t?" selected":""}>${s(n("الترتيب الافتراضي"))}</option>
                <option value="asc"${t==="asc"?" selected":""}>${s(n("السعر: الأقل أولاً"))}</option>
                <option value="desc"${t==="desc"?" selected":""}>${s(n("السعر: الأعلى أولاً"))}</option>
            </select>`},a.curNote=function(e){if(I(e))return"";const t=c.country(e.cfg,e.country);return`<p class="cur-note">${s(n("{flag} الأسعار ب{currency} تقريبية، ويُحسب الطلب بالريال العماني.",{flag:t.flag,currency:w(t,"currency_def")}))} <button class="link-btn" type="button" data-open-currency>${s(n("تغيير"))}</button></p>`},a.bestSellers=function(e){const t=a.listings(e,e.products.filter(i=>i.is_best_seller&&i.is_available!==!1));return t.length>=2?t.slice(0,12):[]},a.newArrivals=function(e){let t=a.listings(e,e.products.filter(i=>i.is_new_arrival&&i.is_available!==!1));return t.length<2&&(t=a.listings(e,e.products.filter(i=>i.is_available!==!1).slice().sort((i,r)=>String(r.created_at||"").localeCompare(String(i.created_at||""))))),t.slice(0,10)},a.storeReviews=function(e){const i=(e.cfg.contact.reviews||[]).filter(l=>l.text).map(l=>({...l,rating:l.stars,curated:!0})),r=e.reviews.slice().sort((l,d)=>String(d.created_at||"").localeCompare(String(l.created_at||""))).slice(0,10),o=i.concat(r);return o.length?`<section class="section reviews" id="reviews" aria-labelledby="reviews-t">
            <div class="wrap">
                <div class="section-head"><h2 id="reviews-t">${s(y(e,"contact.reviews_title"))}</h2></div>
                <div class="rail">${o.map(l=>a.reviewCard(e,l,{withProduct:!0})).join("")}</div>
            </div>
        </section>`:""},a.reviewCard=function(e,t,{withProduct:i=!1}={}){const r=i&&t.product_id?e.byId.get(t.product_id):null;return`<figure class="review">
            ${a.stars(t.rating||t.stars||5)}
            <blockquote>${s(t.text)}</blockquote>
            ${(t.images||[]).length||t.video?`<div class="review-media">
                ${(t.images||[]).slice(0,3).map(o=>`<img src="${s(o)}" alt="${s(n("صورة من العميل"))}" loading="lazy">`).join("")}
                ${t.video?`<video src="${s(t.video)}" controls playsinline preload="metadata"></video>`:""}
            </div>`:""}
            <figcaption>${t.name?s(t.name):s(n("عميل"))}${t.verified&&e.cfg.proof&&e.cfg.proof.verified!==!1?` <span class="rv-verified">${x.verified}${s(c.isEn()?"Verified buyer":"مشتري موثّق")}</span>`:""}${r?` · <a href="${c.url.product(r)}">${s(a.pname(r))}</a>`:""}</figcaption>
        </figure>`},a.giftSub=e=>e.cfg.sales.gift_card!==!1?y(e,"gift.cta_sub")||n("بطاقة إهداء رقمية فيها رسالتك، وبدون ذكر السعر"):n("نوصلها لمن تحب، وبدون ذكر السعر"),a.giftCta=function(e,{attrs:t="",href:i="",title:r,sub:o=a.giftSub(e)}){const l=`<span class="gcta-ico">${a.icon.gift}</span><span class="gcta-txt"><b>${s(r)}</b>${o?`<small>${s(o)}</small>`:""}</span><span class="gcta-go">${a.icon.side}</span>`;return i?`<a class="gift-cta" href="${i}" ${t}>${l}</a>`:`<button class="gift-cta" type="button" ${t}>${l}</button>`},a.giftBanner=function(e){const t=e.cfg.sales;return!t.gift_enabled||t.gift_banner===!1?"":`<section class="wrap gift-promo" aria-label="${s(n("أرسل هدية"))}">
            <a class="gp" href="${c.url.page("checkout","gift=1")}" data-gift-start>
                <span class="gp-art" aria-hidden="true">${a.icon.gift}</span>
                <span class="gp-text"><b>${s(y(e,"gift.banner_title")||n("أرسلها هدية لمن تحب"))}</b><small>${s(y(e,"gift.banner_text")||(t.gift_card!==!1?n("نوصلها لمن تحب مع بطاقة إهداء رقمية فيها رسالتك، وبدون ذكر السعر."):n("نوصلها لمن تحب مع رسالتك، وبدون ذكر السعر.")))}</small></span>
                <span class="gp-go">${s(y(e,"gift.banner_button")||n("ابدأ"))}${a.icon.side}</span>
            </a>
        </section>`},a.giftStyle=function(e,t=""){const i=e.cfg.gift||{},r=c.giftColors(e.cfg,t);return`--g-bg:${r.bg};--g-box:${r.box};--g-ribbon:${r.ribbon};--g-paper:${r.paper};--g-ink:${r.ink};--g-accent:${r.accent};--g-font:"Cairo"`},a.giftPage=function(e,t){const i=e.cfg,r=i.gift||{},o=c.storeName(i);if(!t||!t.to)return`<div class="wrap empty page"><p>${s(n("رابط بطاقة الإهداء غير صحيح."))}</p><a class="btn btn-primary" href="${c.base()}">${s(n("العودة للمتجر"))}</a></div>`;const l={to:t.to,from:t.from||"",store:o},d=(M,b)=>c.giftFill(y(e,`gift.${M}`)||b,l),f=c.giftOccasion(t.occasion,i,t.occasionText),u=a.asset(i.logo_url||c.DEFAULTS.logo_url),h=c.giftGendersOn(i)&&c.giftFor(t.gender,i)?t.gender:"",g=r.stars===!1?"":Array.from({length:12},(M,b)=>`<i style="--x:${(b*61+7)%100}%;--y:${(b*37+11)%100}%;--d:${(b*.53%4).toFixed(2)}s;--s:${.6+b*7%5/10}"></i>`).join(""),p=r.confetti!==!1,m=p?Array.from({length:16},(M,b)=>`<i style="--a:${b*(360/16)}deg;--r:${90+b*37%60}px;--d:${b%4*50}ms"></i>`).join(""):"",$=p?Array.from({length:18},(M,b)=>`<i style="--x:${(b*37+5)%100}%;--d:${b*151%1100}ms;--t:${(2.8+b*7%10/6).toFixed(2)}s;--r:${(b%2?1:-1)*(120+b*53%200)}deg"></i>`).join(""):"",v=String(t.msg||"").trim()||d("empty_msg",n("هدية مختارة لك بكل حب"));return`<div class="gift-page${h?` gift-${h}`:""}" data-occ="${s(f.id)}" style="${s(a.giftStyle(e,h))}">
            <section class="gx" id="giftStage">
                ${g?`<div class="gx-stars" aria-hidden="true">${g}</div>`:""}
                <p class="gx-kicker">${s(d("kicker",n("هدية خاصة لك")))}</p>
                <h1 class="gx-title">${s(d("title",n("{name}، وصلتك هدية!",{name:t.to})))}</h1>
                <button class="gx-box" type="button" data-gift-open aria-label="${s(d("button",n("افتح هديتك")))}">
                    <span class="gx-shadow" aria-hidden="true"></span>
                    <span class="gx-burst" aria-hidden="true">${m}</span>
                    <span class="gx-body" aria-hidden="true"></span>
                    <span class="gx-lid" aria-hidden="true"><span class="gx-bow"><i></i><i></i><b></b></span></span>
                    ${r.tag===!1?"":`<span class="gx-tag" aria-hidden="true">${s(t.to)}</span>`}
                </button>
                <button class="gx-cta" type="button" data-gift-open>${s(d("button",n("افتح هديتك")))}</button>
                <p class="gx-hint">${s(d("hint",n("اضغط على الصندوق لتفتحها")))}</p>
            </section>
            <section class="gx gx-open" id="giftCard" hidden>
                ${g?`<div class="gx-stars" aria-hidden="true">${g}</div>`:""}
                ${$?`<div class="confetti" aria-hidden="true">${$}</div>`:""}
                <article class="gcard">
                    <div class="gc-seal" aria-hidden="true">${a.icon.gift}</div>
                    <p class="gc-to">${s(n("إلى"))}</p>
                    <h2 class="gc-name">${s(t.to)}</h2>
                    <p class="gc-occ">${s(w(f,"title"))}</p>
                    <div class="gc-line" aria-hidden="true"><span></span></div>
                    <blockquote class="gc-msg">${s(v)}</blockquote>
                    ${t.from?`<p class="gc-from"><span>${s(d("closing",n("مع خالص المحبة،")))}</span><b>${s(t.from)}</b></p>`:""}
                    <div class="gc-foot"><span class="gc-logo"><img src="${s(u)}" alt="" width="30" height="30"></span><span>${s(d("footer",n("هديتك في الطريق إليك من {store} 🎁",{store:o})))}</span></div>
                </article>
                <div class="gx-actions">
                    <button class="gx-again" type="button" data-gift-replay>${s(n("افتحها مرة ثانية"))}</button>
                    <a class="gx-shop" href="${c.base()}">${s(n("تسوّق من {store}",{store:o}))}</a>
                </div>
            </section>
        </div>`},a.pageSize=e=>{const t=Number(e.cfg.theme.page_size);return Number.isFinite(t)&&t>=0?t:12},a.moreBtn=function(e,t,i){const r=t-i;return r>0?`<div class="more-wrap"><button class="btn btn-ghost more-btn" type="button" data-more>${s(n("عرض المزيد"))} <small>(${r})</small></button></div>`:""},a.limitedGrid=function(e,t,i){const r=a.pageSize(e),o=r?Math.max(r,i||0):t.length;return`${a.grid(e,t.slice(0,o))}${a.moreBtn(e,t.length,Math.min(o,t.length))}`},a.catalogHome=function(e,{sort:t="default",cat:i="",shown:r=0}={}){const o=a.bundleCat(e),l=e.categories.filter($=>e.counts.get($.id)&&!(o&&$.id===o.id)),d=i&&l.find($=>$.id===i)?i:"",f=$=>!(o&&$.category_id===o.id),u=a.sortList(a.listings(e,e.products.filter($=>f($)&&(!d||$.category_id===d))),t),h=a.listings(e,e.products.filter(f)).length,g=e.cfg.theme.home_filter!==!1&&l.length>1?`<div class="cat-chips" role="group" aria-label="${s(n("تصفية حسب القسم"))}">
                <button type="button" class="chip${d?"":" on"}" data-home-cat="" aria-pressed="${!d}">${s(y(e,"texts.all_label")||n("الكل"))} <small>${h}</small></button>
                ${l.map($=>`<button type="button" class="chip${d===$.id?" on":""}" data-home-cat="${s($.id)}" aria-pressed="${d===$.id}">${s(a.cname($))} <small>${e.counts.get($.id)}</small></button>`).join("")}
            </div>`:"",p=d?e.catById.get(d):null;return`${`<a class="gm-banner gm-home" href="${c.base()}games/"><span class="gm-ic" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10a4.5 4.5 0 0 1 4.4 3.6l.9 4.6A2.6 2.6 0 0 1 19.6 19c-.8 0-1.5-.4-2-1l-1.5-2H7.9L6.400 18c-.5.6-1.200 1-2 1a2.600 2.600 0 0 1-2.700-2.800l.9-4.600A4.500 4.500 0 0 1 7 8z"/><path d="M8 10.800v3M6.500 12.300h3"/><circle cx="15.800" cy="11.300" r=".9"/><circle cx="18" cy="13.300" r=".9"/></svg></span><span class="gm-tx"><b>${s(n("ألعاب تعليمية مجانية"))}</b><small>${s(n("العب وتعلّم الحروف والأرقام"))}</small></span><span class="gm-go">${s(n("ابدأ اللعب"))} ←</span></a>`}<div class="section-head">
                <h2 id="catalog-t">${s(p?a.cname(p):n("كل المنتجات"))} <small class="muted">(${u.length})</small></h2>
                ${a.sortSelect(e,t)}
            </div>
            ${g}
            ${a.curNote(e)}
            <div id="gridBox">${a.limitedGrid(e,u,r)}</div>`},a.isStoryStore=e=>e.products.length?e.products.some(t=>c.isStory(t)):!!e.cfg.stories,a.SOON=[{e:"🚀",t:"مستكشف الفضاء",s:"صاروخ وروبوت صديق ورحلة بين الكواكب"},{e:"🐬",t:"أعماق البحر",s:"دلفين وشعاب مرجانية وكنز اللؤلؤ"},{e:"🦕",t:"أرض الديناصورات",s:"آلة زمن وديناصور صغير ضائع"},{e:"🏰",t:"مغامرة في عُمان",s:"قلعة وصحراء وجبال وصقر يدلّ الطريق"}],a.TIPS=[{id:"read",e:"📚",t:"كيف تجعل طفلك يحب القراءة؟",s:"خطوات بسيطة تحوّل القراءة من واجب إلى وقت ممتع ينتظره طفلك كل يوم.",p:["اقرؤوا معاً كل يوم ولو عشر دقائق، وفي نفس الوقت تقريباً، مثل قبل النوم. التكرار يجعل القراءة عادةً يحبها الطفل.","دعه يختار القصة بنفسه، حتى لو طلب نفس القصة كل ليلة؛ فإعادة القصة تقوّي فهمه وتزيد حصيلته من الكلمات.","غيّر صوتك مع كل شخصية، وتوقّف لتسأله: «ماذا تتوقع أن يحدث الآن؟»، فهذا يجعله شريكاً في الحكاية.","اجعل الكتب في متناول يده: رفّ صغير في غرفته، وكتاب في السيارة، وآخر في حقيبة السفر.","وكن قدوته: حين يراك تقرأ، يفهم أن القراءة شيء ممتع يفعله الكبار أيضاً."]},{id:"hero",e:"🦸",t:"لماذا يحب الطفل قصة يكون هو بطلها؟",s:"حين يرى الطفل اسمه في القصة يشعر أنها كُتبت له، فيتعلّق بها ويطلبها مرة بعد مرة.",p:["الطفل يحب أن يرى نفسه في كل شيء حوله، ولهذا يفرح كثيراً حين يسمع اسمه داخل الحكاية، ويشعر أنها قصته هو.","هذا الشعور يجعله أكثر انتباهاً للقصة وأكثر رغبة في إعادتها، وكل إعادة تعني كلمات جديدة وتعلّقاً أكبر بالكتب.","وحين يكون البطل شجاعاً أو صادقاً أو مرتّباً، يسهل على الطفل أن يقلّده، لأنه يرى نفسه في هذا البطل.","لذلك تساعد القصة الشخصية في غرس عادة جديدة، مثل تنظيف الأسنان أو النوم بدري: يقرأ أن البطل الذي يحمل اسمه فعلها، فيحب أن يفعلها مثله."]},{id:"night",e:"🌙",t:"قصة قبل النوم: دقائق قليلة تصنع فرقاً",s:"روتين بسيط قبل النوم يهدّئ طفلك، ويقرّبكما من بعض، ويجعله ينام وهو سعيد.",p:["اجعل للنوم روتيناً ثابتاً: تنظيف الأسنان، ثم الفراش، ثم القصة. الطفل يرتاح حين يعرف ماذا سيحدث بعد ذلك.","أبعد الشاشات قبل النوم بوقت كافٍ، واجعل القصة هي آخر شيء في يومه بدلاً منها.","اختر قصة هادئة بنهاية سعيدة، واقرأ بصوت منخفض وبطيء، وخفّف الأضواء.","وبعد القصة، اسأله عن أجمل شيء حدث في يومه. هذه الدقائق القليلة يتذكرها طفلك طويلاً."]}],a.tipSheet=function(e,t){const i=a.TIPS.find(r=>r.id===t);return i?`<div class="sheet-head"><b>${s(n("مقالات تهمك"))}</b><button class="close" type="button" data-close-sheet aria-label="${s(n("إغلاق"))}">✕</button></div>
            <article class="tip-read">
                <span class="tip-e" aria-hidden="true">${i.e}</span>
                <h2>${s(n(i.t))}</h2>
                ${i.p.map(r=>`<p>${s(n(r))}</p>`).join("")}
                <a class="btn btn-primary btn-block" href="#stories" data-close-sheet>✨ ${s(n("اختر قصة لطفلك"))}</a>
            </article>`:""},a.storyHome=function(e){const t=e.cfg,i=c.storyCfg(t),r=a.listings(e,e.products.filter(_=>c.isStory(_))),o=r.filter(_=>!c.isActivity(_)),l=r.filter(_=>_.story==="coloring"),d=r.filter(_=>_.story==="abc"),f=[...l,...d],u=["3041931d-879b-507d-a2d4-738bcf47c429","34c5e974-ceb6-53ae-bb1e-69f9c1b1efcd"],h=["aa77bcfe-be93-5dea-a57a-750879195d56"],g=_=>a.listings(e,e.products.filter(j=>!c.isStory(j)&&_.includes(j.category_id))),p=g(u),m=g(h),$=_=>{const j=(e.categories||[]).find(U=>U.id===_);return j?c.url.category(j):""},v=r.filter(_=>_.is_available!==!1),M=v.filter(_=>a.img(_)).slice(0,3),b=c.proOn(t)?v.find(_=>c.proOn(t,_.story)):null,T=c.printOn(t,e.country),A=i.photo_upload!==!1,N=S(e,y(e,"texts.hero_title"))||n("قصص أطفال مخصصة باسم وصورة طفلك"),C=N.indexOf(" باسم "),L=C>0?`${s(N.slice(0,C))} <em>${s(N.slice(C+1))}</em>`:s(N).replace("طفلك","<em>طفلك</em>"),P=o.find(_=>_.is_available!==!1)||v[0],O=[["👀",n("تشوفها قبل الطلب"),n("اكتب اسم طفلك وتصفّح القصة كاملة باسمه قبل ما تدفع.")],[A?"📷":"✏️",n(A?"باسمه وصورته":"باسمه في كل صفحة"),n(A?"اسم طفلك في كل صفحة، وصورته على الغلاف.":"اسم طفلك وعمره وهواياته في القصة.")],b?["🌟",n("بوجه طفلك"),n("في القصة المؤلفة خصيصاً نرسم طفلك من صورته في كل صفحة.")]:null,["✍️",n("عربي سليم"),n("نص عربي جميل بصيغة الولد أو البنت، سهل يقرؤه الطفل.")],T?["📦",n("PDF أو كتاب مطبوع"),n("ملف على واتساب خلال ساعات، أو كتاب بغلاف مقوّى لباب بيتك.")]:null,i.guarantee?["🛡️",n("ضمان الرضا"),n("إذا ما عجبتك القصة نعدّلها مجاناً، أو نرجّع لك المبلغ كاملاً.")]:null].filter(Boolean).slice(0,6);return`<section class="sh-hero ks-hero">
                <div class="wrap sh-inner">
                    <div class="sh-text">
                        <h1>${L}</h1>
                        <p>${s(S(e,y(e,"texts.hero_text")))}</p>
                        <div class="sh-btns">
                            <a class="btn btn-primary sh-cta" href="#stories">✨ ${s(y(e,"texts.hero_button")||n("تصفّح جميع القصص"))}</a>
                            ${P?`<button class="btn btn-ghost sh-more" type="button" data-flip="${s(P.id)}">📖 ${s(n("شاهد مثال"))}</button>`:""}
                        </div>
                        <ul class="sh-trust"><li>👀 ${s(n("تشوفها قبل الطلب"))}</li>${i.guarantee?`<li>🛡️ ${s(n("ضمان الرضا"))}</li>`:""}</ul>
                    </div>
                    ${M.length?`<div class="sh-books" aria-hidden="true">${M.map((_,j)=>`<span class="shb shb${j+1}"><img src="${s(a.img(_))}" alt="" width="300" height="375"${j?' loading="lazy"':' fetchpriority="high"'} decoding="async"></span>`).join("")}<span class="sh-float">✨ ${s(n(A?"اسم طفلك وصورته على الغلاف":"اسم طفلك على الغلاف وفي كل صفحة"))}</span></div>`:""}
                </div>
            </section>
            <nav class="hs-nav" aria-label="${s(n("الأقسام"))}"><div class="wrap">
                <a href="${c.base()}games/">🎮 ${s(n("ألعاب"))}</a>${o.length?`<a href="#stories">📚 ${s(n("قصص 3D"))}</a>`:""}${f.length?`<a href="#books">✏️ ${s(n("كتب باسم طفلك"))}</a>`:""}${p.length?`<a href="#kids">🎨 ${s(n("تعليمي للأطفال"))}</a>`:""}${m.length?`<a href="#students">🎓 ${s(n("الصفوف 1-4"))}</a>`:""}
            </div></nav>
            <section class="gm-banner-sec"><div class="wrap"><a class="gm-banner" href="${c.base()}games/"><span class="gm-ic" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10a4.5 4.5 0 0 1 4.4 3.6l.9 4.6A2.6 2.6 0 0 1 19.6 19c-.8 0-1.5-.4-2-1l-1.5-2H7.9L6.400 18c-.5.6-1.200 1-2 1a2.600 2.600 0 0 1-2.700-2.800l.9-4.600A4.500 4.500 0 0 1 7 8z"/><path d="M8 10.800v3M6.500 12.300h3"/><circle cx="15.800" cy="11.300" r=".9"/><circle cx="18" cy="13.300" r=".9"/></svg></span><span class="gm-tx"><b>${s(n("ألعاب تعليمية مجانية"))}</b><small>${s(n("العب وتعلّم الحروف والأرقام"))}</small></span><span class="gm-go">${s(n("ابدأ اللعب"))} ←</span></a></div></section>
            <section class="section ks-best" id="stories" aria-labelledby="best-t">
                <div class="wrap">
                    <div class="section-head ks-head"><h2 id="best-t">${s(o.length?n("📚 قصص ثلاثية الأبعاد، طفلك بطلها"):n("قصصنا الجديدة قريباً"))}</h2></div>
                    <p class="sh-lead">${s(o.length?n("اختر القصة، واكتب بيانات طفلك، وشوفها باسمه قبل ما تطلب."):n("نرسم الحين مغامرات جديدة بأسلوب ثلاثي الأبعاد، طفلك بطلها باسمه وصورته."))}</p>
                    ${o.length?`<div class="ks-grid">${o.map((_,j)=>a.storyCard(e,_,{eager:j<2,high:j<2})).join("")}</div>`:`<div class="ks-grid">${a.SOON.map(_=>`<article class="ks-card ks-soon"><span class="ks-soon-e" aria-hidden="true">${_.e}</span><div class="ks-body"><b class="ks-name">${s(n(_.t))}</b><p class="ks-blurb">${s(n(_.s))}</p></div><span class="ks-soon-tag">✨ ${s(n("قريباً"))}</span></article>`).join("")}</div>
                        ${c.isValidWhatsapp(t.order.whatsapp)?`<a class="btn btn-wa btn-block ks-soon-wa" href="${s(c.waLink(t.order.whatsapp,n("السلام عليكم، خبّروني أول ما تنزل القصص الجديدة 📚")))}" target="_blank" rel="noopener">${a.waIcon()}${s(n("خبّرني أول ما تنزل"))}</a>`:""}`}
                </div>
            </section>
            ${f.length?`<section class="section ks-best ks-books" id="books" aria-labelledby="bk-t">
                <div class="wrap">
                    <div class="section-head ks-head"><h2 id="bk-t">✏️ ${s(n("كتب باسم طفلك"))}</h2></div>
                    <p class="sh-lead">${s(n("كتاب تلوين وكتاب لتعلّم الحروف، يكتب الطفل اسمه ونجهّز الكتاب له."))}</p>
                    <div class="ks-grid">${f.map(_=>a.storyCard(e,_,{})).join("")}</div>
                </div>
            </section>`:""}
            ${p.length?`<section class="section hs-sec" id="kids" aria-labelledby="kd-t">
                <div class="wrap">
                    <div class="section-head ks-head"><h2 id="kd-t">🎨 ${s(n("تعليمي للأطفال"))}</h2></div>
                    <p class="sh-lead">${s(n("تلوين وتعليم بسيط وأنشطة ممتعة، ملفات جاهزة للطباعة."))}</p>
                    ${a.grid(e,p.slice(0,8),{eagerCount:0})}
                    ${p.length>8&&$(u[0])?`<a class="btn btn-ghost btn-block hs-all" href="${$(u[0])}">${s(n("عرض الكل"))} ←</a>`:""}
                </div>
            </section>`:""}
            ${m.length?`<section class="section hs-sec" id="students" aria-labelledby="st-t">
                <div class="wrap">
                    <div class="section-head ks-head"><h2 id="st-t">📚 ${s(n("طلاب الصفوف 1 إلى 4"))}</h2></div>
                    <p class="sh-lead">${s(n("أوراق عمل وتدريبات تناسب المنهج المدرسي، مع صفحات الحلول."))}</p>
                    ${a.grid(e,m.slice(0,8),{eagerCount:0})}
                    ${m.length>8&&$(h[0])?`<a class="btn btn-ghost btn-block hs-all" href="${$(h[0])}">${s(n("عرض الكل"))} ←</a>`:""}
                </div>
            </section>`:""}
            ${a.storeReviews(e)}
            ${a.homeFaq(e)}`},a.bundleCat=e=>(e.categories||[]).find(t=>/حزم|bundle/i.test(t.name||"")||/bundle/i.test(t.slug||"")),a.home=function(e,{sort:t="default",cat:i="",shown:r=0}={}){if(a.isStoryStore(e))return a.storyHome(e);const o=a.bundleCat(e),l=o?a.listings(e,e.products.filter(p=>p.category_id===o.id&&p.is_available!==!1)):[],d=a.bestSellers(e),f=a.setCards(e),u=a.newArrivals(e),h=y(e,"texts.about"),g=h?`<p class="intro">${s(S(e,h))}</p>`:"";return`${a.ad(e)}
            ${a.hero(e)}
            ${a.tiles(e)}
            ${a.giftBanner(e)}
            ${l.length?a.rail(e,{id:"bundles",title:n("حزم التوفير"),link:{href:c.url.category(o),text:n("عرض الكل")},items:l}):""}
            ${d.length?a.rail(e,{id:"best",title:y(e,"sales.best_title")||n("الأكثر طلباً"),items:d}):""}
            ${f?a.rail(e,{id:"sets",title:y(e,"sales.sets_title")||n("أطقم بسعر أقل"),cards:f}):""}
            <section class="catalog section" id="catalog" aria-labelledby="catalog-t">
                <div class="wrap" id="catalogInner">${a.catalogHome(e,{sort:t,cat:i,shown:r})}</div>
            </section>
            ${u.length&&!d.length?a.rail(e,{id:"new",title:y(e,"sales.new_title")||n("وصل حديثاً"),items:u}):""}
            ${a.storeReviews(e)}
            ${a.homeFaq(e)}
            <section class="wrap seo-intro">${g}</section>`},a.homeFaq=function(e){const t=(y(e,"contact.faq")||[]).filter(i=>i&&i.q&&i.a);return!t.length||e.cfg.contact.faq_home===!1?"":`<section class="section home-faq" id="faq" aria-labelledby="faq-t">
            <div class="wrap">
                <div class="section-head"><h2 id="faq-t">${s(n("أسئلة متكررة"))}</h2>${e.cfg.contact.policy_show&&t.length>5?`<a class="more" href="${c.url.page("shipping")}">${s(n("كل الأسئلة"))}</a>`:""}</div>
                <div class="faq-list">${t.slice(0,5).map(i=>`<details class="faq-item"><summary>${s(i.q)}</summary><p>${s(S(e,i.a))}</p></details>`).join("")}</div>
            </div>
        </section>`},a.crumbs=function(e){return`<nav class="crumbs wrap" aria-label="${s(n("مسار التصفح"))}">
            ${e.map((t,i)=>t.href&&i<e.length-1?`<a href="${t.href}">${s(t.name)}</a>`:`<span aria-current="page">${s(t.name)}</span>`).join('<span class="sep" aria-hidden="true">›</span>')}
        </nav>`},a.subjectGroups=function(e,t,i){if(!/الصفوف-1-إلى-4/.test(t.slug||""))return"";const r={1:/تتبّع وكتابة الحروف العربية|English Letters Tracing/,2:/جدول الضرب/,3:/قراءة وفهم|الكسور/,4:/$^/},o=["الصف الأول","الصف الثاني","الصف الثالث","الصف الرابع"],l=g=>{const p=o.findIndex(m=>g.name.includes(m));if(p>=0)return p+1;for(const m of[1,2,3,4])if(r[m].test(g.name))return m;return 0},d=[1,2,3,4].map(g=>i.filter(p=>l(p)===g)),f=i.filter(g=>!l(g)),u=`<div class="cat-chips grade-jump">${o.map((g,p)=>d[p].length?`<a class="chip" href="#grade-${p+1}">${s(n(g))} <small>${d[p].length}</small></a>`:"").join("")}</div>`,h=d.map((g,p)=>g.length?`<h2 class="sub-h" id="grade-${p+1}">${s(n(o[p]))} <small class="muted">(${g.length})</small></h2>${a.grid(e,g)}`:"").join("");return u+h+(f.length?a.grid(e,f):"")},a.category=function(e,t,{sort:i="default",shown:r=0}={}){const o=a.sortList(a.listings(e,e.products.filter(d=>d.category_id===t.id)),i),l=w(t,"description");return`${a.crumbs([{name:n("الرئيسية"),href:c.url.home()},{name:a.cname(t)}])}
            ${a.tiles(e,t)}
            <section class="catalog section" id="catalog">
                <div class="wrap">
                    <div class="section-head">
                        <h1>${s(a.cname(t))} <small class="muted">(${o.length})</small></h1>
                        ${a.sortSelect(e,i)}
                    </div>
                    ${l?`<p class="cat-desc">${s(l)}</p>`:""}
                    ${a.curNote(e)}
                    <div id="gridBox">${o.length?a.subjectGroups(e,t,o)||a.limitedGrid(e,o,r):`<div class="empty"><p>${s(n("لا توجد منتجات في هذا القسم حاليًا."))}</p><a class="btn btn-primary" href="${c.url.home()}">${s(n("تصفّح كل المنتجات"))}</a></div>`}</div>
                </div>
            </section>`};const R=[["تلوين","لون","الوان","رسم","رسومات","coloring","colouring","color"],["قصه","قصص","حكايه","حكايات","story","stories"],["نشاط","انشطه","العاب","لعب","activity","activities"],["متاهه","متاهات","maze","mazes"],["توصيل","صل","connect","dots"],["مطابقه","matching","match"],["قص","لصق","cut","paste"],["تتبع","تتبيع","خط","كتابه","tracing","trace","handwriting"],["ورقه","اوراق","ورقة عمل","worksheet","worksheets"],["رياضيات","حساب","ارقام","رقم","عد","math","maths","numbers"],["ضرب","جدول الضرب","multiplication","times"],["كسور","كسر","fractions"],["انجليزي","انقليزي","english","انجلش"],["عربي","لغتي","لغه عربيه","arabic"],["حروف","حرف","هجاء","letters","alphabet","abc"],["اسلاميه","دين","تربيه اسلاميه","islamic","quran","قران"],["معلمه","معلمات","معلم","مدرسه","teacher","teachers"],["عرض","عروض","بوربوينت","باوربوينت","شرائح","powerpoint","slides","ppt"],["شهاده","شهادات","تقدير","certificate","certificates"],["روضه","تمهيدي","kg","kindergarten","اطفال","طفل","kids"],["حزمه","حزم","باقه","bundle","bundles"],["حيوانات","حيوان","animals","animal"],["بحر","سمك","sea","ocean"],["رمضان","عيد","فانوس","ramadan","eid"],["مهن","مهنه","وظائف","jobs","professions"],["عادات","سلوك","اداب","habits","manners"]],D=(()=>{const e=new Map;return R.forEach(t=>{const i=t.map(r=>c.normName(r));i.forEach(r=>e.set(r,i))}),e})(),E=e=>e.length>4&&e.startsWith("ال")?e.slice(2):e,G=(e,t,i)=>{if(Math.abs(e.length-t.length)>i)return i+1;let r=Array.from({length:t.length+1},(o,l)=>l);for(let o=1;o<=e.length;o++){const l=[o];let d=l[0];for(let f=1;f<=t.length;f++)l[f]=Math.min(r[f]+1,l[f-1]+1,r[f-1]+(e[o-1]===t[f-1]?0:1)),l[f]<d&&(d=l[f]);if(d>i)return i+1;r=l}return r[t.length]};function V(e,t,i){if(t.includes(e))return 3;const r=E(e);if(r!==e&&t.includes(r))return 3;const o=D.get(r)||D.get(e);if(o&&o.some(l=>t.includes(l)))return 2.5;if(r.length>=4){const l=r.length>=7?2:1;if(i.some(d=>d.length>=3&&G(r,E(d),l)<=l))return 1.5;if(i.some(d=>d.length>r.length&&d.startsWith(r.slice(0,-1))))return 1.2}return 0}a.searchIndex=function(e){return e._searchIndex||(e._searchIndex=e.products.map((t,i)=>{const r=a.catOf(e,t),o=a.colorOf(e,t),l=c.normName([t.name,t.name_en].filter(Boolean).join(" ")),d=c.normName([t.name,t.name_en,t.description,t.description_en,r&&r.name,r&&r.name_en,o&&o.name,o&&o.name_en].filter(Boolean).join(" "));return{p:t,i,name:l,hay:d,tokens:d.split(" ").filter(Boolean)}})),e._searchIndex},a.searchScored=function(e,t){const i=c.normName(t);if(!i)return{list:[],loose:!1};const r=i.split(" ").filter(Boolean),o=(u,h)=>{let g=0;for(const p of r){const m=V(p,u.hay,u.tokens);if(!m&&h)return 0;g+=m+(m&&u.name.includes(E(p))?1:0)}return g},l=a.searchIndex(e);let d=l.map(u=>({row:u,s:o(u,!0)})).filter(u=>u.s>0),f=!1;return!d.length&&r.length>1&&(d=l.map(u=>({row:u,s:o(u,!1)})).filter(u=>u.s>0),f=d.length>0),d.sort((u,h)=>h.s-u.s||(h.row.p.is_available!==!1)-(u.row.p.is_available!==!1)||u.row.i-h.row.i),{list:a.listings(e,d.map(u=>u.row.p)),loose:f}},a.searchResults=(e,t)=>a.searchScored(e,t).list,a.search=function(e,t,{sort:i="default"}={}){const r=a.searchScored(e,t),o=a.sortList(r.list,i),l=String(t||"").trim();return`<section class="catalog section" id="catalog">
            <div class="wrap">
                <div class="section-head">
                    <h1>${l?`${s(n("نتائج «{q}»",{q:t}))} <small class="muted">(${o.length})</small>`:s(n("ابحث في المنتجات"))}</h1>
                    ${o.length?a.sortSelect(e,i):""}
                </div>
                ${a.curNote(e)}
                ${r.loose?`<p class="search-loose">${s(n("ما لقينا كل الكلمات، هذه أقرب النتائج:"))}</p>`:""}
                ${l?"":`<div class="cat-chips search-chips">${e.categories.filter(d=>e.counts.get(d.id)).slice(0,10).map(d=>`<a class="chip" href="${c.url.category(d)}">${s(a.cname(d))}</a>`).join("")}</div>`}
                <div id="gridBox">${o.length?a.grid(e,o):`<div class="empty"><p>${s(n(l?"لا توجد نتائج. جرّب اسم مادة أو موضوع أو قسم.":"اكتب اسم مادة أو موضوع في خانة البحث بالأعلى، مثل: تلوين، رياضيات، قصة."))}</p></div>`}</div>
            </div>
        </section>
        ${o.length?"":a.tiles(e)}`},a.relatedFor=function(e,t,i){const r=new Set;t.forEach(u=>{r.add(u);const h=e.groups.get(u);h&&h.forEach(g=>r.add(g.id))});const o=t.map(u=>e.byId.get(u)).filter(Boolean);if(!o.length)return[];const l=new Set;a.validBundles(e).forEach(u=>{r.has(u.a)&&l.add(u.b),r.has(u.b)&&l.add(u.a)});const d=o.reduce((u,h)=>u+Number(h.price),0)/o.length,f=e.products.filter(u=>!r.has(u.id)&&u.is_available!==!1).map(u=>{let h=0;return l.has(u.id)&&(h+=1e3),o.some(g=>g.category_id&&g.category_id===u.category_id)&&(h+=100),u.is_best_seller&&(h+=20),o.some(g=>g.color_id&&g.color_id===u.color_id)&&(h+=5),h+=Math.max(0,9-Math.abs(Number(u.price)-d)),{p:u,score:h}}).sort((u,h)=>h.score-u.score).map(u=>u.p);return a.listings(e,f).slice(0,i)},a.variantPicker=function(e,t){const i=e.groups.get(t.id);if(!i)return"";const r=a.colorOf(e,t);return`<div class="variants">
            <span class="variants-label">${s(n("اللون:"))} <b>${s(r?w(r,"name"):"")}</b></span>
            <div class="variant-list">
                ${i.map(o=>{const l=a.colorOf(e,o),d=o.id===t.id;return`<a class="variant${d?" on":""}${o.is_available===!1?" out":""}" href="${c.url.product(o)}" data-replace${d?' aria-current="true"':""}>
                        ${a.img(o)?`<img src="${s(a.img(o))}" alt="" width="56" height="70" loading="lazy">`:""}
                        <span>${a.dot(l)}${s(l?w(l,"name"):"")}</span>
                    </a>`}).join("")}
            </div>
        </div>`},a.pdpPerks=function(e,t){const i=e.cfg;if(i.sales.pdp_perks===!1)return"";const r=[],o=Number(i.order.free_min)||0;if(c.isDigital(i)&&r.push([n("يصلك على واتساب بعد تأكيد الدفع"),!0]),i.order.free_enabled&&o>0&&c.freeAppliesTo(i,e.country)&&r.push([Number(t.price)>=o?n("الشحن مجاناً"):n("شحن مجاني فوق {amount}",{amount:c.trimZeros(k(e,o))}),!0]),c.paymentsFor(i,e.country).some(f=>f.type==="cod")&&r.push([n("الدفع عند الاستلام")]),(y(e,"sales.trust_custom")||[]).filter(Boolean).forEach(f=>r.push([S(e,f)])),r.length<2&&!c.isDigital(i)){const f=(i.order.delivery||[]).some(u=>u.enabled&&Array.isArray(u.countries)&&u.countries.some(h=>h!=="OM"));r.push([n(f?"توصيل لكل دول الخليج":"توصيل داخل سلطنة عُمان")])}const d=r.slice(0,2).map(([f,u])=>`<span class="perk${u?" hot":""}">${x.check}<span>${s(f)}</span></span>`).join('<i class="perk-sep" aria-hidden="true"></i>');return i.contact.policy_show?`<a class="perks" href="${c.url.page("shipping")}">${d}<span class="perks-go">${x.chevron}</span></a>`:`<div class="perks">${d}</div>`},a.pdpPrice=function(e,t){const i=Number(t.old_price)>Number(t.price),r=i?Math.round((1-t.price/t.old_price)*100):0,o=[];i&&(o.push(`<span class="pchip off">${s(n("خصم {pct}%",{pct:r}))}</span>`),o.push(`<span class="pchip save">${s(n("وفّر {amount}",{amount:k(e,Math.round((t.old_price-t.price)*1e3)/1e3)}))}</span>`));const l=a.lowStock(e,t);l?o.push(`<span class="pchip hot">⏳ ${s(n("باقي {n} فقط",{n:l}))}</span>`):t.is_best_seller&&t.is_available!==!1&&o.push(`<span class="pchip hot">🔥 ${s(c.isEn()?"Best seller":y(e,"sales.best_title")||n("الأكثر طلباً"))}</span>`);const d=t.is_available===!1?0:c.pointsFor(t.price,e.cfg);return d>0&&o.push(`<span class="pchip pts">⭐ ${s(n("تكسب {pts}",{pts:c.pointsText(d)}))}</span>`),`<div class="pdp-price">
            <div class="pp-row">${i?`<s class="pp-was">${k(e,t.old_price)}</s>`:""}<b class="pp-now">${k(e,t.price)}</b></div>
            ${I(e)?"":`<small class="base-price">${B(e,t.price)}</small>`}
            ${o.length?`<div class="pp-chips">${o.join("")}</div>`:""}
        </div>`},a.galleryStage=function(e,t){const i=a.label(e,t);return`<div class="stage">${t.image_url?`<img src="${s(a.big(t))}" alt="${s(i)}" fetchpriority="high" width="800" height="1000">`:""}</div>`},a.STORY_PAGES=15,a.storyShort=e=>a.pname(e).replace(/^قصة باسم طفلك:\s*/,""),a.storyBlurb=e=>String(w(e,"description")||"").split(`
`)[0].trim(),a.sfState=function(e,t){const i=e.cartCustom(t.id),r=i||e.savedChild()||{},o=i||{};return{pid:t.id,name:r.name||"",g:r.g==="f"||r.g==="m"?r.g:"",age:Number(r.age)||0,likes:Array.isArray(r.likes)?r.likes.slice(0,2):[],lesson:r.lesson||"",tier:o.tier==="pro"?"pro":"std",fmt:o.fmt==="print"?"print":"pdf",wrap:!!o.wrap,ded_on:!!o.ded,ded_t:o.ded_t||"d1",ded:o.ded_t==="own"&&o.ded||"",ded_from:o.ded_from||"",photo_path:i?o.photo_path||"":r.photo_path&&Date.now()-(Number(r.photo_at)||0)<7*864e5?r.photo_path:"",hijab:r.hijab!==!1,note:o.note||"",family:o.family||"",friend:o.friend||"",edit:!!i,more:!!(r.likes&&r.likes.length||r.lesson),up:null}},a.sfCustom=function(e,t,i){const r=e.cfg,o=c.storyCfg(r);return c.storyClean({name:i.name,g:c.isActivity(t)?"m":i.g,age:c.isActivity(t)?5:i.age,likes:c.isActivity(t)?[]:i.likes,lesson:c.isActivity(t)?"":i.lesson,tier:i.tier==="pro"&&c.proOn(r,t.story)?"pro":"std",fmt:i.fmt==="print"&&c.printOn(r,e.country)&&!c.isActivity(t)?"print":"pdf",wrap:!1,ded_t:"",ded:"",ded_from:"",photo_path:o.photo_upload!==!1&&!c.isActivity(t)?i.photo_path:"",hijab:i.hijab,note:i.note,family:i.family,friend:i.friend})},a.sfPhoto=function(e,t,i){const r=i.tier==="pro",o=i.up||{},l=o.thumb||(i.photo_path?e.photoThumb(i.photo_path):""),d=[["ok","😊",n("الوجه واضح")],["ok","☀️",n("إضاءة جيدة")],["no","🕶️",n("بدون نظارة شمسية")],["no","👥",n("شخص واحد فقط")]],f='<input type="file" id="sfPhoto" name="sf_photo" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden>';let u;return o.busy?u=`<div class="sf-ph busy">${l?`<img src="${s(l)}" alt="" width="72" height="72">`:'<span class="sf-ph-e">📷</span>'}<div><b>${s(n("نرفع الصورة…"))}</b><span class="sf-ph-bar"><i></i></span></div></div>`:i.photo_path||l&&o.err?u=`<div class="sf-ph${o.err?" bad":""}">${l?`<img src="${s(l)}" alt="${s(n("صورة الطفل"))}" width="72" height="72">`:'<span class="sf-ph-e">📷</span>'}<div>
                <b>${o.err?s(o.err):`✓ ${s(n("تم رفع الصورة"))}`}</b>
                <small>${s(o.err?n("الصورة ما وصلتنا بعد"):n(r?"نرسم طفلك منها في كل صفحة":"تظهر على غلاف القصة"))}</small>
                <span class="sf-ph-act"><label class="link-btn" for="sfPhoto">${s(o.err?n("جرّب مرة ثانية"):n("تغيير الصورة"))}</label><button type="button" class="link-btn danger" data-sf="photo-del">${s(n("حذف"))}</button></span>
            </div></div>`:u=`<label class="sf-up${o.err?" bad":""}" for="sfPhoto">
                <span class="sf-up-e" aria-hidden="true">📷</span>
                <b>${s(n("ارفع صورة طفلك"))}</b>
                <small>${s(o.err||n(r?"مطلوبة: نرسم طفلك بوجهه منها":"اختياري: نضعها على غلاف القصة"))}</small>
            </label>`,`<div class="sf-f" id="sfPhotoF">
            <span class="sf-l">${s(n("صورة الطفل"))} ${r?"<i>*</i>":`<small>${s(n("(اختياري)"))}</small>`}</span>
            ${u}${f}
            <ul class="sf-tips">${d.map(([h,g,p])=>`<li class="${h}"><span aria-hidden="true">${g}</span><b aria-hidden="true">${h==="ok"?"✓":"✕"}</b>${s(p)}</li>`).join("")}</ul>
            <p class="sf-safe">🔒 ${s(n("الصورة خاصة: نستخدمها لقصة طفلك فقط، ونرسمه منها بأداة ذكاء اصطناعي، ونحذفها بعد التسليم."))}</p>
        </div>`},a.storyFields=function(e,t,i){const r=e.cfg,o=c.storyCfg(r),l=c.proOn(r,t.story),d=c.printOn(r,e.country),f=($,v)=>i.g==="f"?v:$,u=c.storyClean({name:i.name}).name||f(n("طفلك"),n("طفلتك")),h=$=>c.STORY_LESSONS.filter(v=>v.k===$).map(v=>`<option value="${v.id}"${i.lesson===v.id?" selected":""}>${v.e} ${s(n(v.t))}</option>`).join(""),g=($,v,M,b,T,A,N,C="")=>`<button type="button" class="sf-opt${M?" on":""}${C}" ${$}="${v}" aria-pressed="${M}">
            <span class="sf-opt-e" aria-hidden="true">${b}</span>
            <span class="sf-opt-t"><b>${s(T)}</b><small>${s(A)}</small></span>
            <span class="sf-opt-p">${N}</span>
        </button>`,p=(r.order.delivery||[]).find($=>$.enabled&&$.type!=="digital"&&c.inCountries($,e.country)),m=c.isActivity(t);return`<div class="sf-f${i.bad==="name"?" bad":""}" id="sfNameF">
                <label class="sf-l" for="sfName">${s(n("اسم الطفل"))} <i>*</i></label>
                <input class="input" id="sfName" name="sf_name" maxlength="22" autocomplete="off" autocapitalize="words" enterkeyhint="done" placeholder="${s(f(n("مثال: محمد"),n("مثال: سارة")))}" value="${s(i.name)}">
                <small class="sf-hint">${s(n(m?"تُرسم حروف اسمه في الكتاب، تأكد من الإملاء":"يظهر على الغلاف وفي كل صفحة، تأكد من الإملاء"))}</small>
            </div>
            ${m?"":`<div class="sf-f${i.bad==="g"?" bad":""}" id="sfGF">
                <span class="sf-l">${s(n("ولد أو بنت؟"))} <i>*</i></span>
                <div class="sf-g2">${[["m","👦",n("ولد")],["f","👧",n("بنت")]].map(([$,v,M])=>`<button type="button" class="sf-gc${i.g===$?" on":""}" data-sf-g="${$}" aria-pressed="${i.g===$}"><span aria-hidden="true">${v}</span><b>${s(M)}</b></button>`).join("")}</div>
            </div>
            <div class="sf-f${i.bad==="age"?" bad":""}" id="sfAgeF">
                <label class="sf-l" for="sfAge">${s(n("العمر"))} <i>*</i></label>
                <select class="input" id="sfAge" name="sf_age"><option value="">${s(n("اختر العمر"))}</option>${c.STORY_AGES.map($=>`<option value="${$}"${i.age===$?" selected":""}>${s(c.ageText($))}</option>`).join("")}</select>
            </div>`}
            ${o.photo_upload!==!1&&!m?a.sfPhoto(e,t,i):""}
            ${m?"":`<details class="sf-more" id="sfMore"${i.more?" open":""}>
                <summary><span>✨ ${s(n("خصّصها أكثر"))}</span><small>${s(n("هواياته ورسالة القصة · اختياري"))}</small></summary>
                <div class="sf-f">
                    <span class="sf-l">${s(f(n("ماذا يحب {name}؟",{name:u}),n("ماذا تحب {name}؟",{name:u})))} <small>${s(n("(شيئين على الأكثر)"))}</small></span>
                    <div class="sf-chips">${c.STORY_LIKES.map($=>{const v=i.likes.includes($.id);return`<button type="button" class="sf-chip${v?" on":""}" data-sf-like="${$.id}" aria-pressed="${v}"${!v&&i.likes.length>=2?" disabled":""}><span aria-hidden="true">${$.e}</span> ${s(n($.t))}</button>`}).join("")}</div>
                </div>
                <div class="sf-f">
                    <label class="sf-l" for="sfLesson">${s(n("رسالة القصة"))}</label>
                    <select class="input" id="sfLesson" name="sf_lesson">
                        <option value="">${s(n("رسالة القصة الأصلية"))}</option>
                        <optgroup label="${s(n("قيم وأخلاق"))}">${h("v")}</optgroup>
                        <optgroup label="${s(n("عادات يومية"))}">${h("h")}</optgroup>
                    </select>
                    <small class="sf-hint">${s(n("نكتبها في نهاية القصة وفي شهادة البطل"))}</small>
                </div>
            </details>`}
            ${l&&!m?`<div class="sf-f">
                <span class="sf-l">${s(n("نوع القصة"))}</span>
                <div class="sf-opts">
                    ${g("data-sf-tier","std",i.tier!=="pro","📖",n("قصة جاهزة باسمه"),n("رسومات القصة الجميلة، و{name} البطل باسمه",{name:u}),k(e,t.price))}
                    ${g("data-sf-tier","pro",i.tier==="pro","🌟",n("مؤلفة خصيصاً بوجهه"),`${n("نرسمه من صورته في كل صفحة")} · ${o.pro_time}`,"+"+k(e,Number(o.pro_price)||0)," pro")}
                </div>
                ${i.tier==="pro"?`<div class="sf-pro">
                    ${i.g==="f"?`<div class="sf-f"><span class="sf-l">${s(n("الحجاب في الرسومات"))}</span><div class="sf-seg2">
                        <button type="button" class="sf-chip${i.hijab?" on":""}" data-sf-hijab="1" aria-pressed="${i.hijab}">${s(n("بالحجاب"))}</button>
                        <button type="button" class="sf-chip${i.hijab?"":" on"}" data-sf-hijab="0" aria-pressed="${!i.hijab}">${s(n("بدون حجاب"))}</button>
                    </div></div>`:""}
                    <label class="sf-f"><span class="sf-l">${s(n("أسماء الأسرة في القصة"))} <small>${s(n("(اختياري)"))}</small></span><input class="input" name="sf_family" maxlength="120" autocomplete="off" placeholder="${s(n("مثال: ماما مريم، بابا خالد، أخته لين"))}" value="${s(i.family)}"></label>
                    <label class="sf-f"><span class="sf-l">${s(f(n("صديقه المفضّل"),n("صديقتها المفضّلة")))} <small>${s(n("(اختياري)"))}</small></span><input class="input" name="sf_friend" maxlength="60" autocomplete="off" placeholder="${s(f(n("مثال: سالم"),n("مثال: ريم")))}" value="${s(i.friend)}"></label>
                    <label class="sf-f"><span class="sf-l">${s(n("تفاصيل خاصة"))} <small>${s(n("(اختياري)"))}</small></span><textarea class="input" name="sf_note" rows="2" maxlength="200" placeholder="${s(f(n("مثال: يلبس نظارة، يحب الديناصورات"),n("مثال: تلبس نظارة، تحب الفراشات")))}">${s(i.note)}</textarea></label>
                </div>`:""}
            </div>`:""}
            ${d&&!m?`<div class="sf-f">
                <span class="sf-l">${s(n("كيف تصلك القصة؟"))}</span>
                <div class="sf-opts two">
                    ${g("data-sf-fmt","pdf",i.fmt!=="print","📱",n("ملف PDF"),n("على واتساب خلال ساعات"),s(n("ضمن السعر")))}
                    ${g("data-sf-fmt","print",i.fmt==="print","📦",n("كتاب مطبوع"),`${n("غلاف مقوّى + PDF")} · ${o.print_time}`,"+"+k(e,Number(o.print_price)||0))}
                </div>
                ${i.fmt==="print"&&p&&Number(p.price)>0?`<small class="sf-hint">🚚 ${s(n("التوصيل {price} يُضاف في صفحة الطلب",{price:k(e,p.price)}))}</small>`:""}
            </div>`:""}`},a.storySum=function(e,t,i){const r=e.cfg,o=c.storyCfg(r),l=a.sfCustom(e,t,i),d=c.storyUnit(t,l,r),f=[[c.isActivity(t)?n("سعر الكتاب"):n("سعر القصة"),k(e,t.price)]];return l.tier==="pro"&&f.push([n("مؤلفة خصيصاً بوجهه"),"+"+k(e,Number(o.pro_price)||0)]),l.fmt==="print"&&f.push([n("كتاب مطبوع بغلاف مقوّى"),"+"+k(e,Number(o.print_price)||0)]),`${Number(t.old_price)>Number(t.price)?`<div class="sf-sum-save">🎉 ${s(n("وفّرت {amount}",{amount:k(e,Math.round((t.old_price-t.price)*1e3)/1e3)}))}</div>`:""}
            ${f.map(([u,h])=>`<div><span>${s(u)}</span><b>${h}</b></div>`).join("")}
            <div class="tot"><span>${s(n("الإجمالي"))}</span><b>${k(e,d)}</b></div>`},a.storyForm=function(e,t,i=a.sfState(e,t)){const r=c.storyCfg(e.cfg),o=c.storyClean({name:i.name}).name;return`<section class="sf-box buy has-story" id="buyBox" data-sf-for="${s(t.id)}" aria-labelledby="sf-t">
            <div class="sf-head" id="personalize"><h2 id="sf-t">✏️ ${s(n("بيانات التخصيص"))}</h2><small>${s(n("املأ بيانات طفلك، وشوف القصة باسمه قبل الطلب"))}</small></div>
            <div id="sfFields">${a.storyFields(e,t,i)}</div>
            <div class="sf-prev" id="storyPrev">
                <div class="sf-prev-head"><b id="sfPrevT">👀 ${s(o?n("قصة {name}",{name:o}):n("معاينة القصة"))}</b><small id="stPrevNote"></small></div>
                <div class="sf-pages" id="storyPages" aria-live="polite"></div>
            </div>
            <div class="sf-sum" id="sfSum">${a.storySum(e,t,i)}</div>
            <p class="sf-err" id="sfErr" role="alert" hidden></p>
            <button class="btn btn-primary btn-block sf-add" type="button" data-sf="add">🛒 ${s(i.edit?n("حفظ التعديل"):n("أضف إلى السلة"))}</button>
            <button class="btn btn-ghost btn-block sf-buy" type="button" data-sf="buy">${s(n("اطلب الآن"))} ←</button>
            ${r.guarantee?`<p class="sf-guard">🛡️ <span><b>${s(n("ضمان الرضا"))}</b> ${s(n("إذا ما عجبتك القصة نعدّلها مجاناً، أو نرجّع لك المبلغ كاملاً."))}</span></p>`:""}
        </section>`},a.storyMeta=function(e,t,i){if(!c.isStory(t))return"";const r=`${c.url.product(t)}#personalize`;if(!i||!i.name)return`<a class="cl-story warn" href="${r}">✎ ${s(n("اكتب اسم طفلك"))}</a>`;const o=c.storyKind(i);return`<span class="cl-story">👶 ${s(i.name)} · ${s(i.g==="f"?n("بنت"):n("ولد"))}${i.age?` · ${s(c.ageText(i.age))}`:""}${o?` · <b>${s(o)}</b>`:""} <a class="link-btn" href="${r}">${s(n("تعديل"))}</a></span>`},a.buyBox=function(e,t){const i=e.cfg;if(t.is_available===!1)return i.sales.restock!==!1?`<div class="buy out" id="buyBox">
                    <div class="out-note">${s(y(e,"texts.sold_out"))}. ${s(n("نخبرك على واتساب أول ما يتوفر."))}</div>
                    <button class="btn btn-primary btn-block" type="button" data-notify="${s(t.id)}">${x.bell}${s(n("أخبرني عند التوفر"))}</button>
                </div>`:`<div class="out-note" id="buyBox">${s(y(e,"texts.sold_out"))}. ${c.isValidWhatsapp(i.order.whatsapp)?s(n("تواصل معنا لمعرفة موعد توفره.")):""}</div>`;if(c.isFree(t))return`<div class="buy single-qty free-box" id="buyBox">${a.freeBtn(t,{block:!0})}<p class="free-note">${s(n("ملف PDF جاهز للطباعة، يُحمَّل مباشرة على جهازك بدون تسجيل ولا دفع."))}</p></div>`;const r=c.isValidWhatsapp(i.order.whatsapp)&&i.sales.wa_quick,o=i.sales.buy_now,l=c.isStory(t),d=l||a.maxFor(e,t)<=1;return l?a.storyForm(e,t):`<div class="buy${d?" single-qty":""}" id="buyBox">
            <div class="buy-row">
                <div class="stepper lg" role="group" aria-label="${s(n("الكمية"))}"${d?" hidden":""}>
                    <button type="button" data-pdp-step="1" aria-label="${s(n("زيادة"))}">+</button>
                    <output id="pdpQty" aria-live="polite">1</output>
                    <button type="button" data-pdp-step="-1" aria-label="${s(n("إنقاص"))}">−</button>
                </div>
                <button class="btn btn-primary" type="button" data-pdp-add="${s(t.id)}">${s(l?n("أضف القصة للسلة"):y(e,"texts.add_to_cart"))}</button>
            </div>
            ${o||r?`<div class="buy-alt${o&&r?"":" single"}">
                ${o?`<button class="btn btn-ghost" type="button" data-buy-now="${s(t.id)}">${s(n("اشترِ الآن"))}</button>`:""}
                ${r?`<button class="btn btn-wa" type="button" data-wa-product="${s(t.id)}">${a.waIcon()}${s(n("اطلب عبر واتساب"))}</button>`:""}
            </div>`:""}
            ${i.sales.gift_enabled&&i.sales.gift_button?a.giftCta(e,{attrs:`data-gift-now="${s(t.id)}"`,title:y(e,"gift.cta_title")||n("أرسله هدية")}):""}
        </div>`},a.productReviews=function(e,t){const i=(e.reviewsByProduct.get(t.id)||[]).slice().sort((l,d)=>String(d.created_at||"").localeCompare(String(l.created_at||""))),r=a.reviewStats(i);if(!r&&c.isStory(t))return"";const o=c.url.page("review",`p=${encodeURIComponent(t.slug||t.id)}`);return`<section class="section reviews-block" id="reviews" aria-labelledby="pr-t">
            <div class="section-head"><h2 id="pr-t">${s(n("تقييمات العملاء"))}</h2></div>
            ${r?`<div class="rate-summary"><b>${r.avg.toFixed(1)}</b>${a.stars(r.avg)}<span>${s(a.reviewCount(r.count))}</span></div>
                <div class="review-list">${i.slice(0,6).map(l=>a.reviewCard(e,l)).join("")}</div>`:`<p class="muted">${s(c.isDigital(e.cfg)?n("لا توجد تقييمات لهذه القصة بعد. اشتريتها؟ شاركنا رأيك."):n("لا توجد تقييمات لهذا التصميم بعد. اشتريته؟ شاركنا رأيك."))}</p>`}
            <a class="btn btn-ghost btn-sm" href="${o}" rel="nofollow">${s(n("اكتب تقييمك"))}</a>
        </section>`},a.descHTML=function(e){const t=String(e||"").split(`
`).map(o=>o.trim()).filter(Boolean),i=t.filter(o=>!/^[•\-–]\s*/.test(o)),r=t.filter(o=>/^[•\-–]\s*/.test(o)).map(o=>o.replace(/^[•\-–]\s*/,""));return`${i.map(o=>`<p class="pdp-desc">${s(o)}</p>`).join("")}${r.length?`<ul class="pdp-inc">${r.map(o=>`<li>${x.check}<span>${s(o)}</span></li>`).join("")}</ul>`:""}`},a.storyProduct=function(e,t){const i=e.cfg,r=c.storyCfg(i),o=a.reviewStats(e.reviewsByProduct.get(t.id)),l=a.description(e,t),d=c.printOn(i,e.country),f=a.listings(e,e.products.filter(p=>c.isStory(p)&&p.id!==t.id&&p.is_available!==!1&&c.isActivity(p)===c.isActivity(t))).slice(0,6),u=c.isActivity(t),h=u?[["✏️",n("اكتب اسم طفلك")],["✨",n("نجهّز الكتاب باسمه")],["📱",n("يصلك PDF على واتساب")]]:[r.photo_upload!==!1?["📷",n("ارفع صورة طفلك")]:["✏️",n("اكتب اسم طفلك")],["✨",r.photo_upload!==!1?n("نضيف اسمه وصورته"):n("نكتب القصة باسمه")],[d?"📦":"📱",n(d?"تصلك PDF أو مطبوعة":"تصلك على واتساب")]],g=u?[`📄 ${n("جاهز للطباعة A4")}`,`🧒 ${n("من 3 إلى 8 سنوات")}`,`⚡ ${n("يصلك خلال ساعات")}`]:[`📄 ${n("{n} صفحة",{n:a.STORY_PAGES})}`,`🧒 ${n("من 3 إلى 8 سنوات")}`,`⚡ ${n("يصلك خلال ساعات")}`];return`${a.crumbs([{name:n("الرئيسية"),href:c.url.home()},{name:a.storyShort(t)}])}
            <div class="wrap">
                <div class="pdp ks-pdp">
                    <div class="gallery" id="gallery">${a.galleryStage(e,t)}</div>
                    <div class="pdp-info">
                        <div class="pdp-title"><h1>${s(a.pname(t))}</h1>${a.favBtn(e,t)}</div>
                        ${o?`<a class="pdp-rate" href="#reviews">${a.stars(o.avg)}<span>${o.avg.toFixed(1)} · ${s(a.reviewCount(o.count))}</span></a>`:""}
                        ${a.pdpPrice(e,t)}
                        ${a.storyBlurb(t)?`<p class="ks-lead">${s(a.storyBlurb(t))}</p>`:""}
                        <ol class="ks-how">${h.map(([p,m],$)=>`<li><span class="ks-how-e" aria-hidden="true">${p}</span><small>${$+1}</small><b>${s(m)}</b></li>`).join("")}</ol>
                        <ul class="ks-badges">${g.map(p=>`<li>${s(p)}</li>`).join("")}</ul>
                        <button class="ks-flipbtn" type="button" data-flip="${s(t.id)}"><span aria-hidden="true">📖</span><span><b>${s(n(u?"تصفّح الكتاب كاملاً":"تصفّح القصة كاملة"))}</b><small>${s(n(u?"شاهد صفحاته باسم طفلك قبل ما تطلب":"اقرأها صفحة صفحة قبل ما تطلب"))}</small></span><span aria-hidden="true">←</span></button>
                        ${t.is_available===!1?a.buyBox(e,t):a.storyForm(e,t)}
                        ${a.deliveryBox(e,t)}
                        ${l?`<details class="ks-more"><summary>${s(n("تفاصيل القصة"))}</summary>${a.descHTML(l)}</details>`:""}
                        <div class="share-row">
                            <button class="link-btn" type="button" data-share-product="${s(t.id)}">${x.share} ${s(n("شارك القصة مع صديق"))}</button>
                        </div>
                    </div>
                </div>
                ${a.productReviews(e,t)}
            </div>
            ${f.length?a.rail(e,{id:"related",title:n("ملفات قد تعجبك"),items:f}):""}`},a.product=function(e,t){if(c.isStory(t))return a.storyProduct(e,t);const i=e.cfg,r=a.catOf(e,t),o=a.reviewStats(e.reviewsByProduct.get(t.id)),l=a.description(e,t),d=i.sales.related_show?a.relatedFor(e,[t.id],Number(i.sales.related_count)||4):[],f=[{name:n("الرئيسية"),href:c.url.home()}];return r&&f.push({name:a.cname(r),href:c.url.category(r)}),f.push({name:a.pname(t)}),`${a.crumbs(f)}
            <div class="wrap">
                <div class="pdp">
                    <div class="gallery" id="gallery">${a.galleryStage(e,t)}</div>
                    <div class="pdp-info">
                        ${a.pdpPerks(e,t)}
                        <div class="pdp-title"><h1>${s(a.pname(t))}</h1>${a.favBtn(e,t)}</div>
                        ${l?a.descHTML(l):""}
                        ${o?`<a class="pdp-rate" href="#reviews">${a.stars(o.avg)}<span>${o.avg.toFixed(1)} · ${s(a.reviewCount(o.count))}</span></a>`:""}
                        ${a.pdpPrice(e,t)}
                        ${a.pdpProof(e,t)}
                        ${e.groups.get(t.id)?a.variantPicker(e,t):a.colorOf(e,t)?`<div class="pdp-color">${s(n("اللون:"))} ${a.colorTag(e,t)}</div>`:""}
                        ${a.buyBox(e,t)}
                        ${t.is_available===!1?"":a.volumeTeaser(e)}
                        ${a.bundleOffers(e,t)}
                        ${a.deliveryBox(e,t)}
                        ${a.trust(e)}
                        ${t.video_url&&c.isUrl(t.video_url)?`<div class="pdp-details">
                            <a class="btn btn-ghost btn-sm" href="${s(t.video_url)}" target="_blank" rel="noopener">▶ ${s(n("شاهد فيديو المنتج"))}</a>
                        </div>`:""}
                        <div class="share-row">
                            <button class="link-btn" type="button" data-share-product="${s(t.id)}">${x.share} ${s(n("شارك المنتج مع صديق"))}</button>
                        </div>
                    </div>
                </div>
                ${a.productReviews(e,t)}
            </div>
            ${d.length?a.rail(e,{id:"related",title:y(e,"sales.related_title"),items:d}):""}`},a.privacy=function(e){const t=e.cfg,i=c.storeName(t),o=c.isValidWhatsapp(t.order.whatsapp)?`<a href="${s(c.waLink(t.order.whatsapp))}" target="_blank" rel="noopener">${s(n("واتساب المتجر"))}</a>`:s(n("واتساب المتجر")),l=f=>`<p>${s(n(f,{name:i}))}</p>`,d=f=>`<ul>${f.map(u=>`<li>${s(n(u,{name:i}))}</li>`).join("")}</ul>`;return`${a.crumbs([{name:n("الرئيسية"),href:c.url.home()},{name:n("سياسة الخصوصية")}])}
            <article class="wrap page policy">
                <h1>${s(n("سياسة الخصوصية"))}</h1>
                ${l("نحترم خصوصيتك. هذه الصفحة توضّح البيانات اللي نحتاجها في متجر «{name}» وكيف نستخدمها.")}
                <h2>${s(n("البيانات اللي نحتاجها"))}</h2>
                ${d(["عند الطلب: اسمك ورقم واتساب، والملفات التي اخترتها، وطريقة الدفع. ما نطلب إنشاء حساب ولا عنوان توصيل لأن الملفات رقمية.","عند مراسلتنا على واتساب: نحفظ المحادثة حتى نخدمك ونرسل لك ملفاتك ونتابع طلبك."])}
                <h2>${s(n("المساعد الآلي في واتساب"))}</h2>
                ${l("قد يرد عليك في واتساب مساعد آلي يكتب الرد من معلومات المتجر باستخدام خدمة ذكاء اصطناعي (Google Gemini). نرسل لهذه الخدمة نص المحادثة واسمك الأول فقط، ولا نرسل رقم هاتفك. وتقدر تطلب التحدث مع صاحب المتجر في أي وقت.")}
                <h2>${s(n("كيف نستخدم بياناتك"))}</h2>
                ${d(["لتجهيز طلبك وإرسال ملفاتك والتواصل معك بخصوصه.","لخدمة العملاء والرد على أسئلتك.","نرسل لك العروض فقط إذا وافقت، وتقدر توقفها متى شئت برسالة."])}
                <h2>${s(n("مع من نشاركها"))}</h2>
                ${l("لا نبيع بياناتك لأي أحد. نشارك فقط ما يلزم مع الخدمات التقنية التي يعمل عليها المتجر (الاستضافة وقاعدة البيانات وواتساب). وقد نستخدم إحصاءات زيارات مجمّعة وأدوات قياس الإعلانات دون بيانات تعريفية.")}
                <h2>${s(n("حذف بياناتك"))}</h2>
                <p>${s(n("تقدر تطلب حذف بياناتك ومحادثاتك في أي وقت برسالة على"))} ${o}.</p>
                <p class="muted">${s(n("آخر تحديث: أكتوبر 2026"))}</p>
            </article>`},a.shipping=function(e){const t=e.cfg,i=c.countries(t).filter(p=>p.enabled).length,r=(t.order.delivery||[]).filter(p=>p.enabled),o=String(y(e,"contact.policy_notes")||"").split(`
`).map(p=>p.trim()).filter(Boolean),l=a.freeLine(e),d=c.isValidWhatsapp(t.order.whatsapp),f=(y(e,"sales.trust_custom")||[]).filter(Boolean),u=y(e,"contact.policy_title"),h=c.isDigital(t),g=(y(e,"contact.faq")||[]).filter(p=>p&&p.q&&p.a);return`${a.crumbs([{name:n("الرئيسية"),href:c.url.home()},{name:u}])}
            <article class="wrap page policy">
                <h1>${s(u)}</h1>
                <h2>${s(n(h?"طريقة الاستلام":"طرق التوصيل وأسعارها"))}</h2>
                ${r.map(p=>{const m=a.flagsFor(e,p),$=w(p,"note");return`<p><b>${s(w(p,"name"))}</b>: ${s(a.deliveryPriceLabel(e,p))}${p.duration?s(n("، المدة {d}",{d:c.duration(p.duration)})):""}${m.length&&m.length<i?`<br><span class="muted">${s(n("إلى: {countries}",{countries:a.countriesText(m)}))}</span>`:""}${$?`<br><span class="muted">${s($)}</span>`:""}</p>`}).join("")}
                ${l?`<p>${s(l)}</p>`:""}
                ${h?`<p class="muted">${s(n("القصة ملف PDF يفتح على أي جوال أو كمبيوتر، وتطبعه في البيت أو في أي مكتبة."))}</p>`:`<p class="muted">${s(n("نوصّل لكل ولايات سلطنة عُمان."))}</p>`}
                <h2>${s(n("طرق الدفع"))}</h2>
                ${a.paymentGroups(e).map(p=>`<p>${p.countries.length<i?`<b>${s(a.countriesText(p.countries))}:</b> `:""}${s(p.names)}</p>`).join("")}
                ${(t.order.payments||[]).filter(p=>p.enabled&&w(p,"note")).map(p=>`<p class="muted">${s(w(p,"name"))}: ${s(S(e,w(p,"note")))}</p>`).join("")}
                ${f.length?`<h2>${s(n("ضماننا لك"))}</h2>${f.map(p=>`<p>${s(S(e,p))}</p>`).join("")}`:""}
                <h2>${s(n("كيف أطلب؟"))}</h2>
                <ol>
                    <li>${s(n(h?"اختر القصة واكتب اسم طفلك، وأضفها للسلة.":"اختر تصميمك وأضفه للسلة."))}</li>
                    <li>${s(n(h?"اكتب اسمك ورقم واتساب واختر طريقة الدفع، بدون تسجيل حساب.":"اكتب اسمك ورقمك وعنوانك واختر طريقة التوصيل والدفع، بدون تسجيل حساب."))}</li>
                    <li>${s(n(h?"أرسل الطلب عبر واتساب بضغطة، وبعد تأكيد الدفع نرسل لك القصة في نفس المحادثة.":"أرسل الطلب عبر واتساب بضغطة، ونؤكده ونجهّزه لك."))}</li>
                </ol>
                ${g.length?`<h2>${s(n("أسئلة متكررة"))}</h2><div class="faq-list">${g.map(p=>`<details class="faq-item"><summary>${s(p.q)}</summary><p>${s(S(e,p.a))}</p></details>`).join("")}</div>`:""}
                <h2>${s(n("العملات"))}</h2>
                <p class="muted">${s(n("نعرض الأسعار بعملة دولتك تقريبيًا، ويُحسب الطلب بالريال العماني."))}</p>
                ${o.length?`<h2>${s(n("ملاحظات"))}</h2>${o.map(p=>`<p>${s(S(e,p))}</p>`).join("")}`:""}
                ${d?`<p><a class="btn btn-wa" href="${s(c.waLink(t.order.whatsapp,S(e,y(e,"contact.wa_float_msg"))))}" target="_blank" rel="noopener">${a.waIcon()}${s(n("اسألنا عبر واتساب"))}</a></p>`:""}
            </article>`},a.footerDelivery=function(e){const t=e.cfg,i=String(y(e,"texts.footer_delivery_text")||"").trim();if(i)return i.split(`
`).filter(Boolean).map(l=>S(e,l));const r=(t.order.delivery||[]).filter(l=>l.enabled).map(l=>`${w(l,"name")} · ${a.deliveryPriceLabel(e,l)}${l.duration?` · ${c.duration(l.duration)}`:""}`),o=a.freeLine(e);return o&&r.push(o),a.paymentGroups(e).forEach((l,d,f)=>{r.push(f.length===1?n("الدفع: {names}",{names:l.names}):n("الدفع في {countries}: {names}",{countries:l.countries.map(u=>w(u,"name")).join(F()),names:l.names}))}),r},a.footer=function(e){const t=e.cfg,i=c.isValidWhatsapp(t.order.whatsapp),r=e.categories.filter(b=>e.counts.get(b.id)),o=y(e,"texts.about"),l=c.countries(t).filter(b=>b.enabled),d=l.some(b=>b.code!==c.BASE_COUNTRY),f=t.order.free_enabled&&Number(t.order.free_min)>0,u=(t.order.payments||[]).some(b=>b.enabled&&b.type==="cod"),h=c.isDigital(t)?[[a.icon.file,n("ملفات PDF جاهزة للطباعة")],[a.icon.inbox,n("تصلك على واتساب")],[a.icon.card,n(u?"الدفع عند الاستلام":"تحويل بنكي آمن")]]:[[a.icon.truck,n(d?"توصيل لكل دول الخليج":"توصيل لكل ولايات عُمان")],f?[a.icon.tag,d&&l.filter(b=>c.freeAppliesTo(t,b.code)).every(b=>b.code===c.BASE_COUNTRY)?n("توصيل مجاني في عُمان فوق {amount}",{amount:B(e,t.order.free_min)}):n("توصيل مجاني فوق {amount}",{amount:B(e,t.order.free_min)})]:null,[a.icon.card,n(u?"الدفع عند الاستلام":"تحويل بنكي آمن")]].filter(Boolean),g=(t.texts.socials||[]).filter(b=>c.isUrl(b.url)),p=g.find(b=>/instagram\.com/i.test(b.url)),m=g.find(b=>/tiktok\.com/i.test(b.url)),$=[p?`<a href="${s(p.url)}" target="_blank" rel="noopener" aria-label="${s(n("إنستغرام"))}">${a.icon.instagram}</a>`:"",m?`<a href="${s(m.url)}" target="_blank" rel="noopener" aria-label="${s(n("تيك توك"))}">${a.icon.tiktok}</a>`:"",i?`<a class="wa" href="${s(c.waLink(t.order.whatsapp))}" target="_blank" rel="noopener" aria-label="${s(n("واتساب"))}">${a.waIcon()}</a>`:""].join(""),v=a.socials({...e,cfg:{...t,texts:{...t.texts,socials:g.filter(b=>b!==p&&b!==m)}}},"fsoc"),M=[`© ${new Date().getFullYear()} ${s(c.storeName(t))}`,t.contact.policy_show?`<a href="${c.url.page("shipping")}">${s(y(e,"contact.policy_title"))}</a>`:"",`<a href="${c.url.page("privacy")}">${s(n("سياسة الخصوصية"))}</a>`,t.contact.reviews_share_btn?`<a href="${c.url.page("review")}" rel="nofollow">${s(y(e,"contact.reviews_share_text"))}</a>`:""].filter(Boolean);return`<div class="wrap foot">
            <div class="foot-head">
                <div class="footer-brand"><img src="${s(a.asset(t.logo_url||c.DEFAULTS.logo_url))}" alt="${s(c.storeName(t))}" width="40" height="40"></div>
                ${o?`<p class="foot-about">${s(S(e,o))}</p>`:""}
            </div>
            <ul class="foot-points">${h.map(([b,T])=>`<li>${b}<span>${s(T)}</span></li>`).join("")}</ul>
            ${r.length?`<details class="foot-acc">
                <summary>${s(n("الأقسام"))}${a.icon.chevron}</summary>
                <ul class="footer-cats">${r.map(b=>`<li><a href="${c.url.category(b)}">${s(a.cname(b))}</a></li>`).join("")}</ul>
            </details>`:""}
            <details class="foot-acc">
                <summary>${s(y(e,"texts.footer_delivery_title"))}${a.icon.chevron}</summary>
                <ul class="foot-lines">${a.footerDelivery(e).map(b=>`<li>${s(b)}</li>`).join("")}</ul>
                ${t.contact.policy_show?`<a class="foot-more" href="${c.url.page("shipping")}">${s(n("التفاصيل كاملة"))}</a>`:""}
            </details>
            ${$||v?`<div class="foot-follow"><span>${s(y(e,"texts.footer_contact_title"))}</span><div class="foot-icons">${$}</div>${v?`<div class="footer-social">${v}</div>`:""}</div>`:""}
            <div class="footer-bottom">${M.join(" · ")}</div>
        </div>`},a.asset=e=>!e||/^https?:|^data:|^\//i.test(e)?e:c.base()+e,a.brand=function(e){const t=e.cfg,i=t.logo_url||c.DEFAULTS.logo_url,r=!/logo\.png$/.test(i);return`<span class="brand-logo shape-${s(t.logo_shape||"rounded")}${r?" has-photo":""}" id="brandLogo"><img src="${s(a.asset(i))}" alt="" width="44" height="44"></span>
            <span class="brand-name" id="brandName"${t.show_name?"":" hidden"}>${s(c.storeName(t))}</span>`},a.favPage=function(e,t){const i=t.map(o=>e.byId.get(o)).filter(Boolean),r=i.filter(o=>o.is_available!==!1);return`<section class="catalog section fav-page" id="catalog">
            <div class="wrap">
                <div class="section-head">
                    <h1>${x.heart} ${s(n("المفضلة"))} <small class="muted">(${i.length})</small></h1>
                    ${r.length>1?`<button class="btn btn-primary btn-sm" type="button" data-fav-all>${s(n("أضف الكل للسلة"))}</button>`:""}
                </div>
                ${i.length?`<p class="cat-desc">${s(n("التصاميم التي أعجبتك محفوظة هنا على جهازك. ارجع لها متى ما تحب."))}</p><div id="gridBox">${a.grid(e,i)}</div>`:`<div class="empty"><span class="fav-empty" aria-hidden="true">${x.heart}</span><p>${s(n("لا توجد منتجات في المفضلة بعد. اضغط ♡ على أي تصميم يعجبك لتحفظه هنا."))}</p><a class="btn btn-primary" href="${c.url.home()}">${s(n("تصفّح المنتجات"))}</a></div>`}
            </div>
        </section>`},a.titles=function(e,t){const i=e.cfg,r=c.storeName(i)||n("المتجر");switch(t.name){case"product":{const o=t.product,l=o?a.colorOf(e,o):null;return o?`${a.pname(o)}${l?` ${w(l,"name")}`:""} | ${r}`:r}case"category":return t.cat?`${a.cname(t.cat)} | ${r}`:r;case"shipping":return`${y(e,"contact.policy_title")} | ${r}`;case"privacy":return`${n("سياسة الخصوصية")} | ${r}`;case"cart":return`${n("السلة")} | ${r}`;case"checkout":return`${n("إتمام الطلب")} | ${r}`;case"done":return`${n("تم استلام طلبك")} | ${r}`;case"review":return`${n("قيّم تجربتك")} | ${r}`;case"search":return`${n("بحث")} | ${r}`;case"fav":return`${n("المفضلة")} | ${r}`;case"points":return`${n("نقاطي")} | ${r}`;case"gift":return`${n("🎁 وصلتك هدية")} | ${r}`;default:return y(e,"seo.home_title")||`${r} | ${S(e,y(e,"texts.hero_title"))}`}}})(typeof window<"u"?window:globalThis);
