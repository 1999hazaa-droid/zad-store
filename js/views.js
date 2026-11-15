(function(q){"use strict";const c=q.ATHR,t=c.escape,n=c.t,w=c.L,a=c.views={};a.ctx=function(e){const s=e.cfg,i=(e.products||[]).filter(h=>h.is_visible!==!1).slice().sort((h,v)=>(h.sort_order??0)-(v.sort_order??0)),r=(e.categories||[]).slice().sort((h,v)=>(h.sort_order??0)-(v.sort_order??0)),o=new Map(i.map(h=>[h.id,h])),l=new Map(r.map(h=>[h.id,h])),d=new Map,f=c.buildGroups(i,s),p=new Set;i.forEach(h=>{const v=f.get(h.id);if(v){if(p.has(v))return;p.add(v)}d.set(h.category_id,(d.get(h.category_id)||0)+1)});const $=(e.reviews||[]).filter(h=>h&&h.text),g=new Map;$.forEach(h=>{if(!h.product_id)return;const v=f.get(h.product_id);(v?v.map(b=>b.id):[h.product_id]).forEach(b=>{g.has(b)||g.set(b,[]),g.get(b).push(h)})});const u=e.proof&&e.proof.p?e.proof:null,m=new Map;if(u){const h=(Number(new Date(u.at))||Date.now())+Math.max(0,Date.now()-(Number(u.recv)||Date.now())),v=M=>`${M.category_id||""}|${String(M.name||"").trim()}`;i.forEach(M=>{const b=f.get(M.id)||[M];let A=0,T=0,N=0;b.forEach(P=>{const F=u.p[P.id];if(!F)return;A=Math.max(A,Number(F.n)||0),T+=Number(F.f)||0;const _=F.last&&Number(new Date(F.last))||0;_>N&&(N=_)});const C=new Set(b.map(v)),O=b.length>1&&C.size===1&&u.g&&u.g[[...C][0]]?Number(u.g[[...C][0]]):A;(O||T||N)&&m.set(M.id,{n:O,f:T,ago:N?Math.max(0,h-N):null})})}return{cfg:s,products:i,categories:r,reviews:$,proof:u,proofById:m,country:e.country||c.BASE_COUNTRY,cartQty:e.cartQty||(()=>0),cartCustom:e.cartCustom||(()=>null),savedChild:e.savedChild||(()=>null),photoThumb:e.photoThumb||(()=>""),isFav:e.isFav||(()=>!1),prerender:!!e.prerender,byId:o,catById:l,counts:d,groups:f,reviewsByProduct:g,colorById:new Map((s.colors||[]).map(h=>[h.id,h]))}};const S=(e,s,i)=>c.fill(s,e.cfg,i),y=(e,s)=>c.ct(e.cfg,s),B=(e,s)=>c.money(s,e.cfg),I=e=>e.country===c.BASE_COUNTRY,k=(e,s)=>c.moneyIn(s,e.cfg,e.country),L=()=>n("، ");a.money=B,a.local=k,a.fill=S,a.ct=y;const x={truck:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h11v9.5H3z"/><path d="M14 9.5h4l3 3.2V16h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>',card:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg>',check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',share:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4M8.2 13.2l7.6 4"/></svg>',gift:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5C10 4 6.5 5 7.5 7.2 8.2 8.5 12 8.5 12 8.5ZM12 8.5c2-4.5 5.5-3.5 4.5-1.3-.7 1.3-4.5 1.3-4.5 1.3Z"/></svg>',tag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.2V4.5h7.7l9.3 9.3-7.7 7.7z"/><circle cx="8" cy="9" r="1.4"/></svg>',file:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h7.5l4 4v13h-11.5z"/><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5"/></svg>',inbox:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v10M8 9.8l4 3.7 4-3.7"/><path d="M4 13.5v5.5h16v-5.5"/></svg>',printer:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3.5h10V8"/><rect x="3.5" y="8" width="17" height="8.5" rx="1.6"/><path d="M7 13.5h10V20.5H7z"/></svg>',chevron:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg>',home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5"/><path d="M6 9v10.5h4.5V14h3v5.5H18V9"/></svg>',sun:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',moon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z"/></svg>',auto:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4v16a8 8 0 0 0 0-16Z" class="fill"/></svg>',user:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5"/></svg>',users:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c.9-3.3 3.2-4.9 6-4.9s5.1 1.6 6 4.9"/><path d="M15.2 5.6a3.2 3.2 0 0 1 0 6M17.3 14.9c1.8.6 3 2.1 3.7 4.6"/></svg>',clock:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',verified:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.9 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.9-2.6-2.2-1.6.9-2.6-.9-2.6 2.2-1.6.9-2.6 2.7.2Z"/><path d="M8.6 12.2l2.3 2.3 4.6-4.8"/></svg>',grid:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/></svg>',globe:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5S9.6 5.9 12 3.5Z"/></svg>',side:'<svg class="side" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6l-6 6 6 6"/></svg>',heart:'<svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.8-4.6-7.8-10.3A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 7.8 2.7c0 5.7-7.8 10.3-7.8 10.3Z"/></svg>',star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',bell:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15l1.5-2Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" class="fill"/></svg>',tiktok:'<svg class="solid" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>'};a.icon=x,a.waIcon=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6a9.3 9.3 0 0 0-8 14.1L2.7 21.4l4.8-1.3A9.3 9.3 0 1 0 12 2.6Z"/><path class="wa-glyph" d="M8.4 7.6c.2-.4.4-.4.7-.4h.6c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.7.8c.7 1.3 1.7 2.3 3 3l.8-.7c.2-.2.4-.2.7-.1l1.8.8c.3.1.4.3.4.5v.6c0 .3-.1.5-.4.7-.4.3-1 .5-1.6.5-1.4 0-3.2-.8-4.7-2.3S8 9.9 8 8.5c0-.4.1-.7.4-.9Z"/></svg>';const H=[{re:/instagram\.com/i,key:"instagram",label:"Instagram"},{re:/tiktok\.com/i,key:"tiktok",label:"TikTok"},{re:/snapchat\.com/i,key:"snapchat",label:"Snapchat"},{re:/(^|\/\/|\.)(x|twitter)\.com/i,key:"x",label:"X"},{re:/facebook\.com/i,key:"facebook",label:"Facebook"},{re:/youtube\.com|youtu\.be/i,key:"youtube",label:"YouTube"}];a.socials=function(e,s="soc"){return(e.cfg.texts.socials||[]).filter(i=>i.name&&c.isUrl(i.url)).map(i=>{const r=H.find(l=>l.re.test(i.url));if(!r)return`<a class="${s}" href="${t(i.url)}" target="_blank" rel="noopener">${t(i.name)}</a>`;const o=i.name||r.label;return`<a class="${s} ${s}-icon" href="${t(i.url)}" target="_blank" rel="noopener" aria-label="${t(o)}" title="${t(o)}"><span class="soc-ico" style="--icon:url('https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${r.key}.svg')" aria-hidden="true"></span></a>`}).join("")},a.colorOf=(e,s)=>e.colorById.get(s.color_id)||null,a.label=(e,s)=>c.displayLabel(s,e.cfg),a.pname=e=>w(e,"name"),a.cname=e=>w(e,"name"),a.img=e=>e.thumb_url||c.thumb(e.image_url,"s"),a.big=e=>c.thumb(e.image_url,"m"),a.catOf=(e,s)=>e.catById.get(s.category_id)||null,a.description=(e,s)=>{const i=String(w(s,"description")||"").trim();if(i)return i;const r=a.catOf(e,s);return r?String(w(r,"description")||"").trim():""},a.countryName=e=>w(e,"name"),a.listings=function(e,s){const i=new Set,r=[];return s.forEach(o=>{const l=e.groups.get(o.id);if(l){if(i.has(l))return;i.add(l);const d=l.find(f=>f.is_available!==!1&&s.includes(f))||o;r.push(d);return}r.push(o)}),r},a.sortList=function(e,s){const i=e.slice();return s==="asc"&&i.sort((r,o)=>r.price-o.price),s==="desc"&&i.sort((r,o)=>o.price-r.price),i},a.reviewStats=function(e){if(!e||!e.length)return null;const s=e.reduce((i,r)=>i+Number(r.rating||0),0)/e.length;return{avg:Math.round(s*10)/10,count:e.length}},a.stars=function(e,s=""){const i=Math.max(0,Math.min(5,Number(e)||0)),r=Math.round(i);return`<span class="stars ${s}" role="img" aria-label="${t(n("{r} من 5",{r:i}))}">${"★".repeat(r)}<span class="off">${"★".repeat(5-r)}</span></span>`},a.proofOf=function(e,s){const i=e.cfg.proof||{},r=e.proofById&&e.proofById.get(s.id);if(!r)return null;const l={n:i.counts!==!1&&r.n>=Math.max(1,Number(i.min_buyers)||3)?r.n:0,f:i.favs!==!1&&e.cfg.sales.favorites!==!1&&r.f>=Math.max(1,Number(i.min_favs)||5)?r.f:0,ago:i.last!==!1&&r.ago!==null&&r.ago<=Math.max(1,Number(i.recent_days)||7)*864e5?r.ago:null};return l.n||l.f||l.ago!==null?l:null},a.ago=function(e){const s=Math.floor(e/36e5),i=Math.floor(e/864e5);return c.isEn()?s<1?"less than an hour ago":i<1?s===1?"1 hour ago":`${s} hours ago`:i===1?"yesterday":`${i} days ago`:s<1?"قبل أقل من ساعة":i<1?s===1?"قبل ساعة":s===2?"قبل ساعتين":s<=10?`قبل ${s} ساعات`:`قبل ${s} ساعة`:i===1?"أمس":i===2?"قبل يومين":i<=10?`قبل ${i} أيام`:`قبل ${i} يوماً`},a.buyersText=function(e){return c.isEn()?e===1?"1 customer ordered this":`${e} customers ordered this`:e===1?"عميل واحد طلبه":e===2?"عميلان طلباه":e<=10?`${e} عملاء طلبوه`:`${e} عميلاً طلبوه`},a.favsText=function(e){return c.isEn()?e===1?"Saved by 1 person":`Saved by ${e} people`:`أضافه ${e===1?"شخص واحد":e===2?"شخصان":e<=10?`${e} أشخاص`:`${e} شخصاً`} للمفضلة`},a.storeTotal=function(e){const s=e.cfg.proof||{},i=e.proof&&Number(e.proof.total);if(s.total===!1||!i||i<Math.max(1,Number(s.min_total)||20))return"";const r=c.storeName(e.cfg);return c.isEn()?`${i} customers ordered from ${r}`:i===1?`عميل واحد طلب من ${r}`:i===2?`عميلان طلبا من ${r}`:i<=10?`${i} عملاء طلبوا من ${r}`:`${i} عميلاً طلبوا من ${r}`},a.cardProof=function(e,s){const i=a.proofOf(e,s);return i&&i.n?`<span class="card-proof">${x.users}<span>${t(a.buyersText(i.n))}</span></span>`:""},a.pdpProof=function(e,s){const i=a.proofOf(e,s);if(!i)return"";const r=[];return i.n&&r.push(`<li>${x.users}<span>${t(a.buyersText(i.n))}</span></li>`),i.ago!==null&&r.push(`<li>${x.clock}<span>${t(c.isEn()?`Last ordered ${a.ago(i.ago)}`:`آخر طلب ${a.ago(i.ago)}`)}</span></li>`),i.f&&r.push(`<li>${x.heart}<span>${t(a.favsText(i.f))}</span></li>`),r.length?`<ul class="pdp-proof">${r.join("")}</ul>`:""},a.reviewCount=e=>c.isEn()?e===1?"1 review":`${e} reviews`:e===1?"تقييم واحد":e===2?"تقييمان":`${e} تقييمات`,a.priceHTML=function(e,s,{big:i=!1}={}){if(c.isFree(s))return`<div class="price${i?" big":""}"><b class="free-tag">${t(n("مجاني"))}</b></div>`;const r=Number(s.old_price)>Number(s.price),o=r?Number(s.old_price)-Number(s.price):0;return`<div class="price${i?" big":""}">
            <b>${k(e,s.price)}</b>
            ${r?`<s>${k(e,s.old_price)}</s>`:""}
            ${r&&i?`<span class="save">${t(n("وفّر {amount}",{amount:k(e,o)}))}</span>`:""}
            ${I(e)?"":`<small class="base-price">${B(e,s.price)}</small>`}
        </div>`},a.dot=function(e){return`<span class="dot" style="background:${e&&/^#[0-9a-f]{6}$/i.test(e.hex||"")?e.hex:"#cccccc"}"></span>`},a.colorTag=function(e,s){const i=a.colorOf(e,s);return i?`<span class="color-tag">${a.dot(i)}${t(w(i,"name"))}</span>`:""},a.cardSwatches=function(e,s){const i=e.groups.get(s.id);return i?`<div class="swatches" role="group" aria-label="${t(n("الألوان"))}">
            ${i.map(r=>{const o=a.colorOf(e,r);return`<button type="button" class="sw${r.id===s.id?" on":""}" data-swap="${t(r.id)}" aria-pressed="${r.id===s.id}" aria-label="${t(o?w(o,"name"):"")}"${r.is_available===!1?' data-out="1"':""}>${a.dot(o)}</button>`}).join("")}
            <span class="sw-name">${t(w(a.colorOf(e,s)||{},"name"))}</span>
        </div>`:a.colorTag(e,s)},a.maxQty=e=>Math.max(1,Math.min(99,Number(e.cfg.order.max_qty)||10)),a.maxFor=(e,s)=>{const i=c.stockOf(s);return i===null?a.maxQty(e):Math.min(a.maxQty(e),i)},a.lowStock=(e,s)=>{const i=c.stockOf(s),r=Number(e.cfg.sales.low_stock)||0;return e.cfg.sales.low_stock_show!==!1&&i!==null&&i>0&&r>0&&i<=r&&s.is_available!==!1?i:0},a.freeBtn=function(e,{block:s=!1}={}){return`<a class="btn btn-primary free-dl${s?" btn-block":""}" href="${t(c.fileHref(e))}" download="${t((e.slug||"zad-file")+".pdf")}" data-free-dl="${t(e.id)}" rel="noopener">⬇ ${t(n("تحميل مجاني"))}</a>`},a.cardAction=function(e,s){if(s.is_available===!1)return e.cfg.sales.restock!==!1?`<a class="btn btn-ghost notify-link" href="${c.url.product(s)}#notify">${x.bell}${t(n("أخبرني عند التوفر"))}</a>`:`<button class="btn btn-ghost" type="button" disabled>${t(y(e,"texts.sold_out"))}</button>`;if(c.isFree(s))return a.freeBtn(s);const i=e.cartQty(s.id);return c.isStory(s)?i>0?`<a class="btn btn-ghost in-cart" href="${c.url.page("cart")}">${x.check}${t(n("في السلة"))}</a>`:`<a class="btn btn-primary story-cta" href="${c.url.product(s)}#personalize">${t(n("خصص القصة لطفلك"))}</a>`:i>0&&a.maxFor(e,s)<=1?`<a class="btn btn-ghost in-cart" href="${c.url.page("cart")}">${x.check}${t(n("في السلة"))}</a>`:i>0?`<div class="stepper" role="group" aria-label="${t(n("الكمية في السلة"))}">
                <button type="button" data-inc="${t(s.id)}" aria-label="${t(n("زيادة"))}"${i>=a.maxFor(e,s)?" disabled":""}>+</button>
                <output aria-live="polite">${i}</output>
                <button type="button" data-dec="${t(s.id)}" aria-label="${t(n("إنقاص"))}">−</button>
            </div>`:`<button class="btn btn-primary" type="button" data-add="${t(s.id)}">${t(y(e,"texts.add_to_cart"))}</button>`},a.storyCard=function(e,s,{eager:i=!1,high:r=!1}={}){const o=c.url.product(s),l=Number(s.old_price)>Number(s.price),d=l?Math.round((1-s.price/s.old_price)*100):0,f=a.reviewStats(e.reviewsByProduct.get(s.id)),p=a.img(s),$=c.proOn(e.cfg,s.story)&&!c.isActivity(s),g=a.storyBlurb(s);return`<article class="ks-card" data-card="${t(s.id)}">
            <div class="ks-media"><a class="ks-img" href="${o}" tabindex="-1" aria-hidden="true">
                ${p?`<img src="${t(p)}" alt="" width="400" height="500"${i?"":' loading="lazy"'}${r?' fetchpriority="high"':""} decoding="async">`:""}
                <span class="ks-badge">${c.isActivity(s)?s.story==="abc"?"🔤 "+t(n("تعليمي")):"🖍️ "+t(n("للتلوين")):"👦👧 "+t(n("للأولاد والبنات"))}</span>
                ${l?`<span class="ks-sale">${t(n("خصم {pct}%",{pct:d}))}</span>`:$?`<span class="ks-sale pro">🌟 ${t(n("متاحة بوجه طفلك"))}</span>`:""}
            </a>
            <button class="ks-peek" type="button" data-flip="${t(s.id)}" aria-label="${t(n("تصفّح القصة"))}">👁</button></div>
            <div class="ks-body">
                <a class="ks-name" href="${o}">${t(a.storyShort(s))}</a>
                ${g?`<p class="ks-blurb">${t(g)}</p>`:""}
                ${f?`<span class="card-rate">${a.stars(f.avg,"sm")}<small>(${f.count})</small></span>`:""}
                <div class="ks-price">${l?`<s>${k(e,s.old_price)}</s>`:""}<b>${k(e,s.price)}</b></div>
            </div>
            ${s.is_available===!1?`<div class="ks-act">${a.cardAction(e,s)}</div>`:`<a class="ks-cta" href="${o}#personalize">✏️ ${t(c.isActivity(s)?n("اكتب اسم طفلك"):n("خصّص القصة لطفلك"))}</a>`}
        </article>`},a.card=function(e,s,{eager:i=!1,high:r=!1}={}){if(c.isStory(s))return a.storyCard(e,s,{eager:i,high:r});const o=s.is_available===!1,l=!o&&Number(s.old_price)>Number(s.price),d=l?Math.round((1-s.price/s.old_price)*100):0,f=c.url.product(s),p=a.reviewStats(e.reviewsByProduct.get(s.id));let $="";o?$=`<span class="badge out">${t(y(e,"texts.sold_out"))}</span>`:l?$=`<span class="badge sale">${t(n("خصم {pct}%",{pct:d}))}</span>`:s.is_best_seller&&($=`<span class="badge hot">${t(c.isEn()?"Best seller":y(e,"sales.best_title")||n("الأكثر طلباً"))}</span>`);const g=a.img(s);return`<article class="card${o?" soldout":""}" data-card="${t(s.id)}">
            <a class="card-img" href="${f}" tabindex="-1" aria-hidden="true">
                ${g?`<img src="${t(g)}" alt="" width="400" height="500"${i?"":' loading="lazy"'}${r?' fetchpriority="high"':""} decoding="async">`:""}
                ${$}
            </a>
            ${a.favBtn(e,s)}
            <div class="card-body">
                <a class="card-name" href="${f}">${t(a.pname(s))}</a>
                ${p?`<span class="card-rate">${a.stars(p.avg,"sm")}<small>(${p.count})</small></span>`:""}
                ${a.cardProof(e,s)}
                ${a.cardSwatches(e,s)}
                ${a.priceHTML(e,s)}
                ${a.lowStock(e,s)?`<span class="card-low">🔥 ${t(n("باقي {n} فقط",{n:a.lowStock(e,s)}))}</span>`:""}
            </div>
            <div class="card-action" data-action-for="${t(s.id)}">${a.cardAction(e,s)}</div>
        </article>`},a.favBtn=function(e,s,{big:i=!1}={}){if(e.cfg.sales.favorites===!1)return"";const r=e.isFav(s.id);return`<button class="fav-btn${i?" big":""}${r?" on":""}" type="button" data-fav="${t(s.id)}" aria-pressed="${r}" aria-label="${t(n(r?"إزالة من المفضلة":"أضف للمفضلة"))}">${x.heart}${i?`<span>${t(n(r?"في المفضلة":"أضف للمفضلة"))}</span>`:""}</button>`},a.grid=function(e,s,{eagerCount:i=4}={}){return s.length?`<div class="grid${Number(e.cfg.theme.grid_mobile)===1?" one":""}">${s.map((o,l)=>a.card(e,o,{eager:l<i,high:l<2})).join("")}</div>`:""},a.rail=function(e,{id:s,title:i,link:r,items:o,cards:l}){const d=l||(o||[]).map(f=>a.card(e,f)).join("");return d?`<section class="section" id="${s}" aria-labelledby="${s}-t">
            <div class="wrap">
                <div class="section-head">
                    <h2 id="${s}-t">${t(i)}</h2>
                    ${r?`<a class="more" href="${r.href}">${t(r.text)}</a>`:""}
                </div>
                <div class="rail">${d}</div>
            </div>
        </section>`:""},a.validBundles=function(e){return(e.cfg.sales.bundles||[]).filter(s=>{if(!s.enabled||!s.a||!s.b||s.a===s.b)return!1;const i=e.byId.get(s.a),r=e.byId.get(s.b);return i&&r&&i.is_available!==!1&&r.is_available!==!1})};const z=(e,s,i)=>Math.round((Number(e.price)+Number(s.price)*(1-i/100))*1e3)/1e3;a.bundleCard=function(e,s){const i=e.byId.get(s.a),r=e.byId.get(s.b),o=Math.max(1,Math.min(90,Number(s.pct)||0)),l=Number(i.price)+Number(r.price);return`<article class="set-card">
            <a class="set-imgs" href="${c.url.product(i)}" aria-label="${t(a.label(e,i))}">
                <span>${a.img(i)?`<img src="${t(a.img(i))}" alt="" loading="lazy" decoding="async" width="300" height="375">`:""}</span>
                <i aria-hidden="true">+</i>
                <span>${a.img(r)?`<img src="${t(a.img(r))}" alt="" loading="lazy" decoding="async" width="300" height="375">`:""}</span>
            </a>
            <div class="set-body">
                <b class="set-name">${t(a.pname(i))} + ${t(a.pname(r))}</b>
                <div class="price"><b>${k(e,z(i,r,o))}</b><s>${k(e,l)}</s></div>
                <span class="set-save">${t(n("{name} بخصم {pct}%",{name:a.pname(r),pct:o}))}</span>
            </div>
            <button class="btn btn-primary btn-sm" type="button" data-add-bundle="${t(s.a)}|${t(s.b)}">${t(n("أضف الطقم"))}</button>
        </article>`},a.setCards=function(e,s=12){const i=new Set,r=[];return a.validBundles(e).forEach(o=>{const l=e.groups.get(o.a),d=`${l?l[0].id:o.a}|${o.b}`;i.has(d)||(i.add(d),r.push(o))}),r.slice(0,s).map(o=>a.bundleCard(e,o)).join("")},a.bundleOffers=function(e,s){return a.validBundles(e).filter(i=>i.a===s.id||i.b===s.id).map(i=>{const r=e.byId.get(i.a),o=e.byId.get(i.b),l=i.a===s.id?o:r,d=Number(i.pct)||0,f=Number(r.price)+Number(o.price),p=i.a===s.id?n("أكمل الطقم: «{name}» بخصم {pct}%",{name:a.label(e,o),pct:d}):n("اشترِ «{name}» واحصل على هذا المنتج بخصم {pct}%",{name:a.label(e,r),pct:d});return`<div class="offer">
                <a href="${c.url.product(l)}">${a.img(l)?`<img src="${t(a.img(l))}" alt="" loading="lazy" width="104" height="130">`:""}</a>
                <div>
                    <strong>${t(p)}</strong>
                    <span class="price"><b>${t(n("الطقم {price}",{price:k(e,z(r,o,d))}))}</b><s>${k(e,f)}</s></span>
                </div>
                <button class="btn btn-primary btn-sm" type="button" data-add-bundle="${t(i.a)}|${t(i.b)}">${t(n("أضف الطقم"))}</button>
            </div>`}).join("")},a.volumeTeaser=function(e){const s=c.volumeTiers(e.cfg);if(!s.length)return"";const i=s.map((r,o)=>n(o===s.length-1?"{pieces} أو أكثر خصم {pct}%":"{pieces} خصم {pct}%",{pieces:c.piecesText(r.min),pct:r.pct}));return`<div class="volume">${x.tag}<span><b>${t(n("وفّر أكثر كلما زادت القطع:"))}</b> ${t(i.join(L()))}. ${t(n("يُطبَّق تلقائيًا في السلة."))}</span></div>`},a.deliveryPriceLabel=function(e,s){return s.pricing==="per_kg"?n("{price} لكل كيلو",{price:B(e,s.price)}):Number(s.price)>0?B(e,s.price):n("مجاني")},a.countriesText=e=>e.map(s=>`${s.flag} ${a.countryName(s)}`).join(L()),a.flagsFor=(e,s)=>c.countries(e.cfg).filter(i=>i.enabled&&c.inCountries(s,i.code)),a.paymentGroups=function(e){const s=new Map;return c.countries(e.cfg).filter(i=>i.enabled).forEach(i=>{const r=c.paymentsFor(e.cfg,i.code).map(l=>w(l,"name"));if(!r.length)return;const o=r.join(L());s.has(o)||s.set(o,[]),s.get(o).push(i)}),Array.from(s.entries()).map(([i,r])=>({names:i,countries:r}))},a.freeLine=function(e){const s=e.cfg;if(!s.order.free_enabled||!(Number(s.order.free_min)>0))return"";const i=c.countries(s).filter(l=>l.enabled),r=i.filter(l=>c.freeAppliesTo(s,l.code)),o=r.length===1&&r[0].code==="OM"?n("داخل عُمان"):r.length<i.length?n("إلى {countries}",{countries:a.countriesText(r)}):"";return n("التوصيل مجاني {where} للطلبات من {free} أو أكثر.",{where:o,free:B(e,s.order.free_min)}).replace(/\s+/g," ")},a.deliveryLines=function(e){const s=c.countries(e.cfg).filter(l=>l.enabled).length,i=(e.cfg.order.delivery||[]).filter(l=>l.enabled).map(l=>{const d=a.flagsFor(e,l),f=d.length&&d.length<s?` — ${d.map(p=>p.flag).join(" ")}`:"";return`${w(l,"name")}: ${a.deliveryPriceLabel(e,l)}${l.duration?` (${c.duration(l.duration)})`:""}${f}`}),r=a.freeLine(e);r&&i.push(r);const o=a.paymentGroups(e);return o.length===1?i.push(n("طرق الدفع: {names}.",{names:o[0].names})):o.forEach(l=>i.push(n("{flags} الدفع: {names}.",{flags:l.countries.map(d=>d.flag).join(" "),names:l.names}))),i},a.deliveryBox=function(e,s){const i=e.cfg,r=c.country(i,e.country);if(c.isDigital(i)){const $=c.deliveriesFor(i,r.code),g=c.paymentsFor(i,r.code),u=c.countries(i).filter(m=>m.enabled).length>1;return`<div class="info-box">
            <div class="info-row">${x.inbox}<div>
                <b>${t(n("الاستلام"))}</b>
                ${$.length?$.map(m=>`<span>${t(w(m,"name"))}${m.duration?` · ${t(c.duration(m.duration))}`:""}</span>${w(m,"note")?`<span class="muted">${t(w(m,"note"))}</span>`:""}`).join(""):`<span>${t(n("تواصل معنا عبر واتساب."))}</span>`}
            </div></div>
            ${g.length?`<div class="info-row">${x.card}<div><b>${t(n("الدفع"))}</b><span>${t(g.map(m=>w(m,"name")).join(L()))}</span></div></div>`:""}
            ${u?`<button class="link-btn" type="button" data-open-currency>${t(n("لست في {country}؟ غيّر الدولة",{country:a.countryName(r)}))}</button>`:""}
        </div>`}const o=c.deliveriesFor(i,r.code),l=c.paymentsFor(i,r.code),d=c.countries(i).filter($=>$.enabled).length>1,f=i.order.free_enabled&&Number(i.order.free_min)>0&&c.freeAppliesTo(i,r.code),p=o.map($=>{let g=a.deliveryPriceLabel(e,$);if($.pricing==="per_kg"&&s){const u=c.shippingFor($,[{product:s,qty:1}],i);g=n("{price} لكل كيلو (هذا المنتج {cost})",{price:B(e,$.price),cost:B(e,u.cost)})}return`<span>${t(w($,"name"))}: <b>${t(g)}</b>${$.duration?` · ${t(c.duration($.duration))}`:""}</span>`});return`<div class="info-box">
            <div class="info-row">${x.truck}<div>
                <b>${t(n("التوصيل إلى {flag} {country}",{flag:r.flag,country:a.countryName(r)}))}</b>
                ${p.length?p.join(""):`<span>${t(n("غير متاح حاليًا، تواصل معنا عبر واتساب."))}</span>`}
                ${f?`<span class="ok">${t(n("مجاني للطلبات من {free} أو أكثر",{free:B(e,i.order.free_min)}))}</span>`:""}
            </div></div>
            ${l.length?`<div class="info-row">${x.card}<div><b>${t(n("الدفع"))}</b><span>${t(l.map($=>w($,"name")).join(L()))}</span></div></div>`:""}
            ${d?`<button class="link-btn" type="button" data-open-currency>${t(n("لست في {country}؟ غيّر الدولة",{country:a.countryName(r)}))}</button>`:""}
        </div>`},a.trust=function(e){const s=e.cfg;if(!s.sales.trust_show)return"";const i=c.paymentsFor(s,e.country),r=[];(y(e,"sales.trust_custom")||[]).filter(Boolean).slice(0,3).forEach(l=>r.push(S(e,l))),i.some(l=>l.type==="cod")&&r.push(n("الدفع عند الاستلام")),i.some(l=>l.type==="bank")&&r.push(i.some(l=>l.type==="bank"&&/دولي/.test(l.name))?n("تحويل بنكي دولي"):n("تحويل بنكي مباشر")),i.some(l=>l.type==="online")&&r.push(n("دفع إلكتروني آمن"));const o=(s.order.delivery||[]).some(l=>l.enabled&&Array.isArray(l.countries)&&l.countries.some(d=>d!=="OM"));return c.isDigital(s)?r.push(n("تصلك الملفات على واتساب")):r.push(n(o?"توصيل لكل دول الخليج":"توصيل داخل سلطنة عُمان")),c.isValidWhatsapp(s.order.whatsapp)&&r.push(n("تواصل مباشر عبر واتساب")),`<ul class="trust">${r.map(l=>`<li>${x.check}${t(l)}</li>`).join("")}</ul>`},a.ad=function(e){if(!e.cfg.ad.show)return"";const s=c.adSlides(e.cfg).map((r,o)=>a.adSlide(e,r,o)).filter(Boolean);if(!s.length)return"";if(s.length===1)return`<section class="ad wrap" id="ad">${s[0]}</section>`;const i=s.length;return`<section class="ad wrap ad-multi" id="ad" aria-roledescription="carousel" aria-label="${t(n("العروض"))}"${e.cfg.ad.auto===!1?' data-manual=""':""}>
            <div class="ad-track">${s.map((r,o)=>`<div class="ad-slide" role="group" aria-roledescription="slide" aria-label="${o+1} / ${i}">${r}</div>`).join("")}</div>
            <div class="ad-dots">${s.map((r,o)=>`<button type="button" data-ad-dot="${o}" aria-label="${t(n("إعلان {n}",{n:o+1}))}"${o?"":' aria-current="true"'}></button>`).join("")}</div>
        </section>`},a.adSlide=function(e,s,i){if(!c.adReady(s))return"";const r=i===0,o=m=>r?y(e,`ad.${m}`):c.L(s,m),l=c.isSafeLink(s.link)&&s.link?s.link:"",d=l&&!/^https?:/i.test(l)&&!l.startsWith("#")?c.base()+l.replace(/^\//,""):l,f=/^https?:/i.test(d),p=(m,h)=>d?`<a class="${h}" href="${t(d)}"${f?' target="_blank" rel="noopener"':""}>${m}</a>`:`<div class="${h}">${m}</div>`;if(s.type==="image"&&s.image_url)return p(`<img src="${t(a.asset(s.image_url))}" alt="${t(o("image_alt")||"")}"${r?' fetchpriority="high"':' loading="lazy" decoding="async"'}>`,"ad-media");if(s.type==="video"&&s.video_url){const m=typeof ATHR_CATALOG<"u"&&ATHR_CATALOG&&ATHR_CATALOG.ad?ATHR_CATALOG.ad[s.video_url]:null,h=m?c.base()+m.v:s.video_url,v=m?c.base()+m.p:s.image_url?a.asset(s.image_url):"";return p(`<video muted loop playsinline${r?' autoplay preload="auto"':' preload="none"'} src="${t(h)}"${v?` poster="${t(v)}"`:""}${m&&m.w&&m.h?` width="${m.w}" height="${m.h}"`:""} aria-label="${t(o("video_alt")||"")}"></video><span class="ad-play" aria-hidden="true"></span>`,"ad-media")}const $=o("title"),g=o("text"),u=o("button");if(s.type==="text"&&($||g)){const m=/^#[0-9a-f]{6}$/i.test(s.bg)?s.bg:e.cfg.theme.primary,h=d||"#catalog";return`<div class="ad-text" style="background:${t(m)}">
                ${$?`<h2>${t(S(e,$))}</h2>`:""}
                ${g?`<p>${t(S(e,g))}</p>`:""}
                ${u?`<a class="btn" href="${t(h)}"${f?' target="_blank" rel="noopener"':""}>${t(S(e,u))}</a>`:""}
            </div>`}return""},a.storePoints=function(e){const s=e.cfg,i=c.countries(s).some(l=>l.enabled&&l.code!==c.BASE_COUNTRY),r=s.order.free_enabled&&Number(s.order.free_min)>0,o=(s.order.payments||[]).some(l=>l.enabled&&l.type==="cod");return c.isDigital(s)?[[a.icon.file,n("PDF للطباعة")],[a.icon.inbox,n("عبر واتساب")],[a.icon.card,n(o?"الدفع عند الاستلام":"تحويل بنكي")]]:[r?[a.icon.tag,n("توصيل مجاني فوق {amount}",{amount:c.trimZeros(B(e,s.order.free_min))})]:null,[a.icon.card,n(o?"الدفع عند الاستلام":"تحويل بنكي آمن")],[a.icon.truck,n(i?"توصيل للخليج":"توصيل لكل عُمان")]].filter(Boolean)},a.heroTitle=function(e){const s=S(e,y(e,"texts.hero_title"))||"",i=s.match(/^(.+?)\s*[،,]\s*(.+)$/);return i?`${t(i[1])}<span class="hl">${t(i[2])}</span>`:t(s)},a.hero=function(e){const s=e.cfg;if(!s.theme.hero_show)return`<h1 class="sr-only">${t(c.storeName(s))}</h1>`;if(s.theme.hero_compact!==!1&&!s.theme.hero_image)return`<section class="hero hero-compact${s.theme.hero_pattern?" pattern":""}">
            <div class="wrap hero-inner">
                <h1>${a.heroTitle(e)}</h1>
                <ul class="hero-mini">${a.storePoints(e).map(([l,d])=>`<li>${l}<span>${t(d)}</span></li>`).join("")}</ul>
                ${a.storeTotal(e)?`<p class="hero-proof">${x.users}<span>${t(a.storeTotal(e))}</span></p>`:""}
            </div>
        </section>`;const i=(y(e,"texts.hero_features")||[]).filter(Boolean).slice(0,4).map(l=>`<li>${x.check}${t(S(e,l))}</li>`).join(""),r=s.theme.hero_image&&(c.isUrl(s.theme.hero_image)||!s.theme.hero_image.includes(":"))?s.theme.hero_image:"",o=y(e,"texts.hero_text");return`<section class="hero${s.theme.hero_pattern?" pattern":""}${r?" has-image":""}">
            ${r?`<div class="hero-bg"><img data-deferred-src="${t(a.asset(r))}" alt=""></div>`:""}
            <div class="wrap hero-inner">
                <h1>${a.heroTitle(e)}</h1>
                ${o?`<p>${t(S(e,o))}</p>`:""}
                ${i?`<ul class="hero-features">${i}</ul>`:""}
                ${a.storeTotal(e)?`<p class="hero-proof">${x.users}<span>${t(a.storeTotal(e))}</span></p>`:""}
                ${r?"":a.heroShots(e)}
            </div>
        </section>`},a.heroShots=function(e){const s=a.listings(e,a.printables(e).filter(o=>o.is_available!==!1&&a.img(o))),i=s.filter(o=>o.is_best_seller),r=(i.length>=3?i:s).slice(0,3);return r.length<3?"":`<div class="hero-shots" aria-hidden="true">${r.map((o,l)=>`<span class="hs hs${l+1}"><img src="${t(a.img(o))}" alt="" loading="lazy" decoding="async" width="200" height="250"></span>`).join("")}</div>`},a.categoryImage=function(e,s){if(s.image_url)return c.thumb(s.image_url,"s");const i=e.products.find(r=>r.category_id===s.id&&a.img(r));return i?a.img(i):""},a.catIcons={kids:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.5-1.9-.4-1.2.3-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5-4-10-9-10z"/><circle cx="7.6" cy="11.2" r="1"/><circle cx="10.2" cy="7.2" r="1"/><circle cx="15" cy="7.6" r="1"/>',book:'<path d="M3 5.5c3-1 6-.8 9 1v13c-3-1.8-6-2-9-1z"/><path d="M21 5.5c-3-1-6-.8-9 1v13c3-1.8 6-2 9-1z"/>',cap:'<path d="M2.5 9.5 12 5l9.5 4.5L12 14z"/><path d="M6.5 11.8V16c0 1.3 2.5 2.5 5.5 2.5s5.5-1.2 5.5-2.5v-4.2"/><path d="M21.5 9.5v5"/>',board:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8M7 9h6M7 12h4"/>',file:'<path d="M6.5 3.5h7.5l4 4v13h-11.5z"/><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5"/>'},a.catKey=function(e){const s=String(e&&(e.name||e.name_en)||"");return/معلم|teacher/i.test(s)?"board":/طلاب|صف|student|grade/i.test(s)?"cap":/أنشطة|انشطة|كتب|book|activit/i.test(s)?"book":/أطفال|اطفال|kid|child/i.test(s)?"kids":"file"},a.catIcon=e=>`<svg viewBox="0 0 24 24" aria-hidden="true">${a.catIcons[a.catKey(e)]}</svg>`,a.tiles=function(e,s){const i=e.categories.filter(r=>e.counts.get(r.id));return i.length?`<nav class="tiles wrap" aria-label="${t(n("الأقسام"))}">
            ${i.map(r=>`<a class="tile${s&&s.id===r.id?" on":""}" data-k="${a.catKey(r)}" href="${c.url.category(r)}"${s&&s.id===r.id?' aria-current="page"':""}>
                    <span class="tile-img">${a.catIcon(r)}</span>
                    <span class="tile-name">${t(a.cname(r))}</span>
                </a>`).join("")}
        </nav>`:""},a.sortSelect=function(e,s){return e.cfg.theme.show_sort===!1?"":`<label class="sr-only" for="sortSelect">${t(n("ترتيب حسب السعر"))}</label>
            <select class="select" id="sortSelect">
                <option value="default"${s==="default"||!s?" selected":""}>${t(n("الترتيب الافتراضي"))}</option>
                <option value="asc"${s==="asc"?" selected":""}>${t(n("السعر: الأقل أولاً"))}</option>
                <option value="desc"${s==="desc"?" selected":""}>${t(n("السعر: الأعلى أولاً"))}</option>
            </select>`},a.curNote=function(e){if(I(e))return"";const s=c.country(e.cfg,e.country);return`<p class="cur-note">${t(n("{flag} الأسعار ب{currency} تقريبية، ويُحسب الطلب بالريال العماني.",{flag:s.flag,currency:w(s,"currency_def")}))} <button class="link-btn" type="button" data-open-currency>${t(n("تغيير"))}</button></p>`},a.bestSellers=function(e){const s=a.listings(e,e.products.filter(i=>i.is_best_seller&&i.is_available!==!1));return s.length>=2?s.slice(0,12):[]},a.newArrivals=function(e){let s=a.listings(e,e.products.filter(i=>i.is_new_arrival&&i.is_available!==!1));return s.length<2&&(s=a.listings(e,e.products.filter(i=>i.is_available!==!1).slice().sort((i,r)=>String(r.created_at||"").localeCompare(String(i.created_at||""))))),s.slice(0,10)},a.storeReviews=function(e){const i=(e.cfg.contact.reviews||[]).filter(l=>l.text).map(l=>({...l,rating:l.stars,curated:!0})),r=e.reviews.slice().sort((l,d)=>String(d.created_at||"").localeCompare(String(l.created_at||""))).slice(0,10),o=i.concat(r);return o.length?`<section class="section reviews" id="reviews" aria-labelledby="reviews-t">
            <div class="wrap">
                <div class="section-head"><h2 id="reviews-t">${t(y(e,"contact.reviews_title"))}</h2></div>
                <div class="rail">${o.map(l=>a.reviewCard(e,l,{withProduct:!0})).join("")}</div>
            </div>
        </section>`:""},a.reviewCard=function(e,s,{withProduct:i=!1}={}){const r=i&&s.product_id?e.byId.get(s.product_id):null;return`<figure class="review">
            ${a.stars(s.rating||s.stars||5)}
            <blockquote>${t(s.text)}</blockquote>
            ${(s.images||[]).length||s.video?`<div class="review-media">
                ${(s.images||[]).slice(0,3).map(o=>`<img src="${t(o)}" alt="${t(n("صورة من العميل"))}" loading="lazy">`).join("")}
                ${s.video?`<video src="${t(s.video)}" controls playsinline preload="metadata"></video>`:""}
            </div>`:""}
            <figcaption>${s.name?t(s.name):t(n("عميل"))}${s.verified&&e.cfg.proof&&e.cfg.proof.verified!==!1?` <span class="rv-verified">${x.verified}${t(c.isEn()?"Verified buyer":"مشتري موثّق")}</span>`:""}${r?` · <a href="${c.url.product(r)}">${t(a.pname(r))}</a>`:""}</figcaption>
        </figure>`},a.giftSub=e=>e.cfg.sales.gift_card!==!1?y(e,"gift.cta_sub")||n("بطاقة إهداء رقمية فيها رسالتك، وبدون ذكر السعر"):n("نوصلها لمن تحب، وبدون ذكر السعر"),a.giftCta=function(e,{attrs:s="",href:i="",title:r,sub:o=a.giftSub(e)}){const l=`<span class="gcta-ico">${a.icon.gift}</span><span class="gcta-txt"><b>${t(r)}</b>${o?`<small>${t(o)}</small>`:""}</span><span class="gcta-go">${a.icon.side}</span>`;return i?`<a class="gift-cta" href="${i}" ${s}>${l}</a>`:`<button class="gift-cta" type="button" ${s}>${l}</button>`},a.customBanner=function(e){return`<section class="wrap gift-promo custom-promo" aria-label="${t(n("ملف باسم طفلك"))}">
            <a class="gp" href="${a.asset("custom/")}">
                <span class="gp-art" aria-hidden="true" style="font-size:24px">✨</span>
                <span class="gp-text"><b>${t(n("ملف باسم طفلك"))}</b><small>${t(n("ورقة عمل مخصّصة لطفلك حسب صفه وموضوعه ومستواه."))}</small></span>
                <span class="gp-go">${t(n("اطلب"))}${a.icon.side}</span>
            </a>
        </section>`},a.learnBanner=function(e){return`<section class="wrap gift-promo custom-promo" aria-label="${t(n("تعلّم والعب"))}">
            <a class="gp" href="${a.asset("learn/")}">
                <span class="gp-art" aria-hidden="true" style="font-size:24px">🦉</span>
                <span class="gp-text"><b>${t(n("تعلّم والعب"))}</b><small>${t(n("طفلك يتعلّم الحروف بالصوت واللعب مع البومة زوزو. ٣ حروف مجاناً، والاشتراك من ١٫٥ ر.ع."))}</small></span>
                <span class="gp-go">${t(n("جرّب"))}${a.icon.side}</span>
            </a>
        </section>`},a.giftBanner=function(e){const s=e.cfg.sales;return!s.gift_enabled||s.gift_banner===!1?"":`<section class="wrap gift-promo" aria-label="${t(n("أرسل هدية"))}">
            <a class="gp" href="${c.url.page("checkout","gift=1")}" data-gift-start>
                <span class="gp-art" aria-hidden="true">${a.icon.gift}</span>
                <span class="gp-text"><b>${t(y(e,"gift.banner_title")||n("أرسلها هدية لمن تحب"))}</b><small>${t(y(e,"gift.banner_text")||(s.gift_card!==!1?n("نوصلها لمن تحب مع بطاقة إهداء رقمية فيها رسالتك، وبدون ذكر السعر."):n("نوصلها لمن تحب مع رسالتك، وبدون ذكر السعر.")))}</small></span>
                <span class="gp-go">${t(y(e,"gift.banner_button")||n("ابدأ"))}${a.icon.side}</span>
            </a>
        </section>`},a.giftStyle=function(e,s=""){const i=e.cfg.gift||{},r=c.giftColors(e.cfg,s);return`--g-bg:${r.bg};--g-box:${r.box};--g-ribbon:${r.ribbon};--g-paper:${r.paper};--g-ink:${r.ink};--g-accent:${r.accent};--g-font:"Cairo"`},a.giftPage=function(e,s){const i=e.cfg,r=i.gift||{},o=c.storeName(i);if(!s||!s.to)return`<div class="wrap empty page"><p>${t(n("رابط بطاقة الإهداء غير صحيح."))}</p><a class="btn btn-primary" href="${c.base()}">${t(n("العودة للمنصة"))}</a></div>`;const l={to:s.to,from:s.from||"",store:o},d=(M,b)=>c.giftFill(y(e,`gift.${M}`)||b,l),f=c.giftOccasion(s.occasion,i,s.occasionText),p=a.asset(i.logo_url||c.DEFAULTS.logo_url),$=c.giftGendersOn(i)&&c.giftFor(s.gender,i)?s.gender:"",g=r.stars===!1?"":Array.from({length:12},(M,b)=>`<i style="--x:${(b*61+7)%100}%;--y:${(b*37+11)%100}%;--d:${(b*.53%4).toFixed(2)}s;--s:${.6+b*7%5/10}"></i>`).join(""),u=r.confetti!==!1,m=u?Array.from({length:16},(M,b)=>`<i style="--a:${b*(360/16)}deg;--r:${90+b*37%60}px;--d:${b%4*50}ms"></i>`).join(""):"",h=u?Array.from({length:18},(M,b)=>`<i style="--x:${(b*37+5)%100}%;--d:${b*151%1100}ms;--t:${(2.8+b*7%10/6).toFixed(2)}s;--r:${(b%2?1:-1)*(120+b*53%200)}deg"></i>`).join(""):"",v=String(s.msg||"").trim()||d("empty_msg",n("هدية مختارة لك بكل حب"));return`<div class="gift-page${$?` gift-${$}`:""}" data-occ="${t(f.id)}" style="${t(a.giftStyle(e,$))}">
            <section class="gx" id="giftStage">
                ${g?`<div class="gx-stars" aria-hidden="true">${g}</div>`:""}
                <p class="gx-kicker">${t(d("kicker",n("هدية خاصة لك")))}</p>
                <h1 class="gx-title">${t(d("title",n("{name}، وصلتك هدية!",{name:s.to})))}</h1>
                <button class="gx-box" type="button" data-gift-open aria-label="${t(d("button",n("افتح هديتك")))}">
                    <span class="gx-shadow" aria-hidden="true"></span>
                    <span class="gx-burst" aria-hidden="true">${m}</span>
                    <span class="gx-body" aria-hidden="true"></span>
                    <span class="gx-lid" aria-hidden="true"><span class="gx-bow"><i></i><i></i><b></b></span></span>
                    ${r.tag===!1?"":`<span class="gx-tag" aria-hidden="true">${t(s.to)}</span>`}
                </button>
                <button class="gx-cta" type="button" data-gift-open>${t(d("button",n("افتح هديتك")))}</button>
                <p class="gx-hint">${t(d("hint",n("اضغط على الصندوق لتفتحها")))}</p>
            </section>
            <section class="gx gx-open" id="giftCard" hidden>
                ${g?`<div class="gx-stars" aria-hidden="true">${g}</div>`:""}
                ${h?`<div class="confetti" aria-hidden="true">${h}</div>`:""}
                <article class="gcard">
                    <div class="gc-seal" aria-hidden="true">${a.icon.gift}</div>
                    <p class="gc-to">${t(n("إلى"))}</p>
                    <h2 class="gc-name">${t(s.to)}</h2>
                    <p class="gc-occ">${t(w(f,"title"))}</p>
                    <div class="gc-line" aria-hidden="true"><span></span></div>
                    <blockquote class="gc-msg">${t(v)}</blockquote>
                    ${s.from?`<p class="gc-from"><span>${t(d("closing",n("مع خالص المحبة،")))}</span><b>${t(s.from)}</b></p>`:""}
                    <div class="gc-foot"><span class="gc-logo"><img src="${t(p)}" alt="" width="30" height="30"></span><span>${t(d("footer",n("هديتك في الطريق إليك من {store} 🎁",{store:o})))}</span></div>
                </article>
                <div class="gx-actions">
                    <button class="gx-again" type="button" data-gift-replay>${t(n("افتحها مرة ثانية"))}</button>
                    <a class="gx-shop" href="${c.base()}">${t(n("تسوّق من {store}",{store:o}))}</a>
                </div>
            </section>
        </div>`},a.pageSize=e=>{const s=Number(e.cfg.theme.page_size);return Number.isFinite(s)&&s>=0?s:12},a.moreBtn=function(e,s,i){const r=s-i;return r>0?`<div class="more-wrap"><button class="btn btn-ghost more-btn" type="button" data-more>${t(n("عرض المزيد"))} <small>(${r})</small></button></div>`:""},a.limitedGrid=function(e,s,i){const r=a.pageSize(e),o=r?Math.max(r,i||0):s.length;return`${a.grid(e,s.slice(0,o))}${a.moreBtn(e,s.length,Math.min(o,s.length))}`},a.isLearn=e=>/^learn-play/.test(String(e&&e.slug||"")),a.printables=e=>e.products.filter(s=>!a.isLearn(s)),a.homeList=(e,s)=>a.listings(e,a.printables(e).filter(i=>!s||i.category_id===s)),a.catalogHome=function(e,{sort:s="default",cat:i="",shown:r=0}={}){const o=e.categories.filter(u=>a.printables(e).some(m=>m.category_id===u.id&&m.is_available!==!1)),l=i&&o.find(u=>u.id===i)?i:"",d=a.sortList(a.homeList(e,l),s),f=a.homeList(e,"").length,p=u=>a.homeList(e,u.id).length,$=o.length>1?`<div class="cat-chips" role="group" aria-label="${t(n("تصفية حسب القسم"))}">
                <button type="button" class="chip${l?"":" on"}" data-home-cat="" aria-pressed="${!l}">${t(y(e,"texts.all_label")||n("الكل"))} <small>${f}</small></button>
                ${o.map(u=>`<button type="button" class="chip${l===u.id?" on":""}" data-home-cat="${t(u.id)}" aria-pressed="${l===u.id}">${t(a.cname(u))} <small>${p(u)}</small></button>`).join("")}
            </div>`:"",g=l?e.catById.get(l):null;return`<div class="pr-bar">
                <h3 id="catalog-t">${t(g?a.cname(g):n("كل الملفات"))} <small>(${d.length})</small></h3>
                ${a.sortSelect(e,s)}
            </div>
            ${$}
            ${a.curNote(e)}
            <div id="gridBox">${a.limitedGrid(e,d,r)}</div>`},a.isStoryStore=e=>e.products.length?e.products.some(s=>c.isStory(s)):!!e.cfg.stories,a.SOON=[{e:"🚀",t:"مستكشف الفضاء",s:"صاروخ وروبوت صديق ورحلة بين الكواكب"},{e:"🐬",t:"أعماق البحر",s:"دلفين وشعاب مرجانية وكنز اللؤلؤ"},{e:"🦕",t:"أرض الديناصورات",s:"آلة زمن وديناصور صغير ضائع"},{e:"🏰",t:"مغامرة في عُمان",s:"قلعة وصحراء وجبال وصقر يدلّ الطريق"}],a.TIPS=[{id:"read",e:"📚",t:"كيف تجعل طفلك يحب القراءة؟",s:"خطوات بسيطة تحوّل القراءة من واجب إلى وقت ممتع ينتظره طفلك كل يوم.",p:["اقرؤوا معاً كل يوم ولو عشر دقائق، وفي نفس الوقت تقريباً، مثل قبل النوم. التكرار يجعل القراءة عادةً يحبها الطفل.","دعه يختار القصة بنفسه، حتى لو طلب نفس القصة كل ليلة؛ فإعادة القصة تقوّي فهمه وتزيد حصيلته من الكلمات.","غيّر صوتك مع كل شخصية، وتوقّف لتسأله: «ماذا تتوقع أن يحدث الآن؟»، فهذا يجعله شريكاً في الحكاية.","اجعل الكتب في متناول يده: رفّ صغير في غرفته، وكتاب في السيارة، وآخر في حقيبة السفر.","وكن قدوته: حين يراك تقرأ، يفهم أن القراءة شيء ممتع يفعله الكبار أيضاً."]},{id:"hero",e:"🦸",t:"لماذا يحب الطفل قصة يكون هو بطلها؟",s:"حين يرى الطفل اسمه في القصة يشعر أنها كُتبت له، فيتعلّق بها ويطلبها مرة بعد مرة.",p:["الطفل يحب أن يرى نفسه في كل شيء حوله، ولهذا يفرح كثيراً حين يسمع اسمه داخل الحكاية، ويشعر أنها قصته هو.","هذا الشعور يجعله أكثر انتباهاً للقصة وأكثر رغبة في إعادتها، وكل إعادة تعني كلمات جديدة وتعلّقاً أكبر بالكتب.","وحين يكون البطل شجاعاً أو صادقاً أو مرتّباً، يسهل على الطفل أن يقلّده، لأنه يرى نفسه في هذا البطل.","لذلك تساعد القصة الشخصية في غرس عادة جديدة، مثل تنظيف الأسنان أو النوم بدري: يقرأ أن البطل الذي يحمل اسمه فعلها، فيحب أن يفعلها مثله."]},{id:"night",e:"🌙",t:"قصة قبل النوم: دقائق قليلة تصنع فرقاً",s:"روتين بسيط قبل النوم يهدّئ طفلك، ويقرّبكما من بعض، ويجعله ينام وهو سعيد.",p:["اجعل للنوم روتيناً ثابتاً: تنظيف الأسنان، ثم الفراش، ثم القصة. الطفل يرتاح حين يعرف ماذا سيحدث بعد ذلك.","أبعد الشاشات قبل النوم بوقت كافٍ، واجعل القصة هي آخر شيء في يومه بدلاً منها.","اختر قصة هادئة بنهاية سعيدة، واقرأ بصوت منخفض وبطيء، وخفّف الأضواء.","وبعد القصة، اسأله عن أجمل شيء حدث في يومه. هذه الدقائق القليلة يتذكرها طفلك طويلاً."]}],a.tipSheet=function(e,s){const i=a.TIPS.find(r=>r.id===s);return i?`<div class="sheet-head"><b>${t(n("مقالات تهمك"))}</b><button class="close" type="button" data-close-sheet aria-label="${t(n("إغلاق"))}">✕</button></div>
            <article class="tip-read">
                <span class="tip-e" aria-hidden="true">${i.e}</span>
                <h2>${t(n(i.t))}</h2>
                ${i.p.map(r=>`<p>${t(n(r))}</p>`).join("")}
                <a class="btn btn-primary btn-block" href="#stories" data-close-sheet>✨ ${t(n("اختر قصة لطفلك"))}</a>
            </article>`:""},a.storyHome=function(e){const s=e.cfg,i=c.storyCfg(s),r=a.listings(e,e.products.filter(_=>c.isStory(_))),o=r.filter(_=>!c.isActivity(_)),l=r.filter(_=>_.story==="coloring"),d=r.filter(_=>_.story==="abc"),f=[...l,...d],p=["3041931d-879b-507d-a2d4-738bcf47c429","34c5e974-ceb6-53ae-bb1e-69f9c1b1efcd"],$=["aa77bcfe-be93-5dea-a57a-750879195d56"],g=_=>a.listings(e,e.products.filter(j=>!c.isStory(j)&&_.includes(j.category_id))),u=g(p),m=g($),h=_=>{const j=(e.categories||[]).find(U=>U.id===_);return j?c.url.category(j):""},v=r.filter(_=>_.is_available!==!1),M=v.filter(_=>a.img(_)).slice(0,3),b=c.proOn(s)?v.find(_=>c.proOn(s,_.story)):null,A=c.printOn(s,e.country),T=i.photo_upload!==!1,N=S(e,y(e,"texts.hero_title"))||n("قصص أطفال مخصصة باسم وصورة طفلك"),C=N.indexOf(" باسم "),O=C>0?`${t(N.slice(0,C))} <em>${t(N.slice(C+1))}</em>`:t(N).replace("طفلك","<em>طفلك</em>"),P=o.find(_=>_.is_available!==!1)||v[0],F=[["👀",n("تشوفها قبل الطلب"),n("اكتب اسم طفلك وتصفّح القصة كاملة باسمه قبل ما تدفع.")],[T?"📷":"✏️",n(T?"باسمه وصورته":"باسمه في كل صفحة"),n(T?"اسم طفلك في كل صفحة، وصورته على الغلاف.":"اسم طفلك وعمره وهواياته في القصة.")],b?["🌟",n("بوجه طفلك"),n("في القصة المؤلفة خصيصاً نرسم طفلك من صورته في كل صفحة.")]:null,["✍️",n("عربي سليم"),n("نص عربي جميل بصيغة الولد أو البنت، سهل يقرؤه الطفل.")],A?["📦",n("PDF أو كتاب مطبوع"),n("ملف على واتساب خلال ساعات، أو كتاب بغلاف مقوّى لباب بيتك.")]:null,i.guarantee?["🛡️",n("ضمان الرضا"),n("إذا ما عجبتك القصة نعدّلها مجاناً، أو نرجّع لك المبلغ كاملاً.")]:null].filter(Boolean).slice(0,6);return`<section class="sh-hero ks-hero">
                <div class="wrap sh-inner">
                    <div class="sh-text">
                        <h1>${O}</h1>
                        <p>${t(S(e,y(e,"texts.hero_text")))}</p>
                        <div class="sh-btns">
                            <a class="btn btn-primary sh-cta" href="#stories">✨ ${t(y(e,"texts.hero_button")||n("تصفّح جميع القصص"))}</a>
                            ${P?`<button class="btn btn-ghost sh-more" type="button" data-flip="${t(P.id)}">📖 ${t(n("شاهد مثال"))}</button>`:""}
                        </div>
                        <ul class="sh-trust"><li>👀 ${t(n("تشوفها قبل الطلب"))}</li>${i.guarantee?`<li>🛡️ ${t(n("ضمان الرضا"))}</li>`:""}</ul>
                    </div>
                    ${M.length?`<div class="sh-books" aria-hidden="true">${M.map((_,j)=>`<span class="shb shb${j+1}"><img src="${t(a.img(_))}" alt="" width="300" height="375"${j?' loading="lazy"':' fetchpriority="high"'} decoding="async"></span>`).join("")}<span class="sh-float">✨ ${t(n(T?"اسم طفلك وصورته على الغلاف":"اسم طفلك على الغلاف وفي كل صفحة"))}</span></div>`:""}
                </div>
            </section>
            <nav class="hs-nav" aria-label="${t(n("الأقسام"))}"><div class="wrap">
                <a href="${c.base()}games/">🎮 ${t(n("ألعاب"))}</a>${o.length?`<a href="#stories">📚 ${t(n("قصص 3D"))}</a>`:""}${f.length?`<a href="#books">✏️ ${t(n("كتب باسم طفلك"))}</a>`:""}${u.length?`<a href="#kids">🎨 ${t(n("تعليمي للأطفال"))}</a>`:""}${m.length?`<a href="#students">🎓 ${t(n("الصفوف 1-4"))}</a>`:""}
            </div></nav>
            <section class="gm-banner-sec"><div class="wrap"><a class="gm-banner" href="${c.base()}games/"><span class="gm-ic" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10a4.5 4.5 0 0 1 4.4 3.6l.9 4.6A2.6 2.6 0 0 1 19.6 19c-.8 0-1.5-.4-2-1l-1.5-2H7.9L6.400 18c-.5.6-1.200 1-2 1a2.600 2.600 0 0 1-2.700-2.800l.9-4.600A4.500 4.500 0 0 1 7 8z"/><path d="M8 10.800v3M6.500 12.300h3"/><circle cx="15.800" cy="11.300" r=".9"/><circle cx="18" cy="13.300" r=".9"/></svg></span><span class="gm-tx"><b>${t(n("ألعاب تعليمية مجانية"))}</b><small>${t(n("العب وتعلّم الحروف والأرقام"))}</small></span><span class="gm-go">${t(n("ابدأ اللعب"))} ←</span></a></div></section>
            <section class="section ks-best" id="stories" aria-labelledby="best-t">
                <div class="wrap">
                    <div class="section-head ks-head"><h2 id="best-t">${t(o.length?n("📚 قصص ثلاثية الأبعاد، طفلك بطلها"):n("قصصنا الجديدة قريباً"))}</h2></div>
                    <p class="sh-lead">${t(o.length?n("اختر القصة، واكتب بيانات طفلك، وشوفها باسمه قبل ما تطلب."):n("نرسم الحين مغامرات جديدة بأسلوب ثلاثي الأبعاد، طفلك بطلها باسمه وصورته."))}</p>
                    ${o.length?`<div class="ks-grid">${o.map((_,j)=>a.storyCard(e,_,{eager:j<2,high:j<2})).join("")}</div>`:`<div class="ks-grid">${a.SOON.map(_=>`<article class="ks-card ks-soon"><span class="ks-soon-e" aria-hidden="true">${_.e}</span><div class="ks-body"><b class="ks-name">${t(n(_.t))}</b><p class="ks-blurb">${t(n(_.s))}</p></div><span class="ks-soon-tag">✨ ${t(n("قريباً"))}</span></article>`).join("")}</div>
                        ${c.isValidWhatsapp(s.order.whatsapp)?`<a class="btn btn-wa btn-block ks-soon-wa" href="${t(c.waLink(s.order.whatsapp,n("السلام عليكم، خبّروني أول ما تنزل القصص الجديدة 📚")))}" target="_blank" rel="noopener">${a.waIcon()}${t(n("خبّرني أول ما تنزل"))}</a>`:""}`}
                </div>
            </section>
            ${f.length?`<section class="section ks-best ks-books" id="books" aria-labelledby="bk-t">
                <div class="wrap">
                    <div class="section-head ks-head"><h2 id="bk-t">✏️ ${t(n("كتب باسم طفلك"))}</h2></div>
                    <p class="sh-lead">${t(n("كتاب تلوين وكتاب لتعلّم الحروف، يكتب الطفل اسمه ونجهّز الكتاب له."))}</p>
                    <div class="ks-grid">${f.map(_=>a.storyCard(e,_,{})).join("")}</div>
                </div>
            </section>`:""}
            ${u.length?`<section class="section hs-sec" id="kids" aria-labelledby="kd-t">
                <div class="wrap">
                    <div class="section-head ks-head"><h2 id="kd-t">🎨 ${t(n("تعليمي للأطفال"))}</h2></div>
                    <p class="sh-lead">${t(n("تلوين وتعليم بسيط وأنشطة ممتعة، ملفات جاهزة للطباعة."))}</p>
                    ${a.grid(e,u.slice(0,8),{eagerCount:0})}
                    ${u.length>8&&h(p[0])?`<a class="btn btn-ghost btn-block hs-all" href="${h(p[0])}">${t(n("عرض الكل"))} ←</a>`:""}
                </div>
            </section>`:""}
            ${m.length?`<section class="section hs-sec" id="students" aria-labelledby="st-t">
                <div class="wrap">
                    <div class="section-head ks-head"><h2 id="st-t">📚 ${t(n("طلاب الصفوف 1 إلى 4"))}</h2></div>
                    <p class="sh-lead">${t(n("أوراق عمل وتدريبات تناسب المنهج المدرسي، مع صفحات الحلول."))}</p>
                    ${a.grid(e,m.slice(0,8),{eagerCount:0})}
                    ${m.length>8&&h($[0])?`<a class="btn btn-ghost btn-block hs-all" href="${h($[0])}">${t(n("عرض الكل"))} ←</a>`:""}
                </div>
            </section>`:""}
            ${a.storeReviews(e)}
            ${a.homeFaq(e)}`},a.bundleCat=e=>(e.categories||[]).find(s=>/حزم|bundle/i.test(s.name||"")||/bundle/i.test(s.slug||"")),a.heroHome=function(e){const s=e.cfg;if(!s.theme.hero_show)return`<h1 class="sr-only">${t(c.storeName(s))}</h1>`;const i=a.homeList(e,"").length;return`<section class="hx" aria-label="${t(c.storeName(s))}">
            <div class="wrap"><div class="hx-in">
                <span class="fl f1" aria-hidden="true">✏️</span><span class="fl f2" aria-hidden="true">⭐</span><span class="fl f3" aria-hidden="true">🎨</span><span class="fl f4" aria-hidden="true">🔤</span><span class="fl f5" aria-hidden="true">🌈</span>
                <span class="hx-owl hx-chars" aria-hidden="true"><img src="/zad-store/games/chars/girl1-160.png" alt="" loading="lazy" decoding="async"><img src="/zad-store/games/chars/boy-160.png" alt="" loading="lazy" decoding="async"><img src="/zad-store/games/chars/girl2-160.png" alt="" loading="lazy" decoding="async"></span>
                <div class="hx-txt">
                    <h1>${a.heroTitle(e)}</h1>
                    <ul class="hx-pills"><li>📄 ${i} ${t(n("ملف"))}</li><li>⚡ ${t(n("تصلك فوراً"))}</li></ul>
                    <a class="hx-btn main" href="#printables" data-home-cat="" data-jump>${a.icon.file}<span>${t(n("تصفّح الملفات"))}</span></a>
                </div>
            </div></div>
        </section>`},a.catTiles=function(e){const s=e.categories.filter(r=>a.printables(e).some(o=>o.category_id===r.id&&o.is_available!==!1)),i=["🎨","🖍️","📚","🎓","👩‍🏫","🎁","📊","🧩"];return`<section class="wrap ct-sec" aria-label="${t(n("تصفح حسب القسم"))}"><div class="ct-row">${s.map((r,o)=>`<button type="button" class="ct c${o%6}" data-home-cat="${t(r.id)}" data-jump><span class="ct-e">${i[o%i.length]}</span><b>${t(a.cname(r))}</b></button>`).join("")}</div></section>`},a.learnPromo=function(e){const s=e.products.filter(r=>a.isLearn(r)&&r.is_available!==!1).sort((r,o)=>Number(r.price)-Number(o.price)),i=r=>/year|سنة/.test(r.slug+r.name)?n("سنة"):/3/.test(r.slug+r.name)?n("٣ أشهر"):n("شهر");return`<section class="wrap lp-sec" id="learn" aria-label="${t(n("تعلّم والعب"))}">
            <div class="lp">
                <div class="lp-top">
                    <span class="lp-owl" aria-hidden="true">🦉</span>
                    <div class="lp-tx">
                        <span class="lp-tag">${t(n("تطبيق تفاعلي للأطفال"))}</span>
                        <h2>${t(n("تعلّم والعب مع زوزو"))}</h2>
                        <p>${t(n("٣ حروف مجاناً، والاشتراك من ١٫٥ ر.ع"))}</p>
                    </div>
                </div>
                                <a class="lp-go" href="${a.asset("learn/")}">${t(n("جرّب مجاناً"))}${a.icon.side}</a>
            </div>
        </section>`},a.printBanner=function(e,{sort:s,cat:i,shown:r}){const o=a.homeList(e,"").length;return`<section class="wrap pr-sec catalog" id="printables" aria-labelledby="pr-t">
            <div class="pr">
                <header class="pr-head">
                    <span class="pr-ico">${a.icon.file}</span>
                    <div>
                        <h2 id="pr-t">${t(n("الملفات القابلة للطباعة"))}</h2>
                        <p>${t(n("{n} ملفاً PDF جاهزاً. تلوين وأنشطة وأوراق عمل لكل صف.",{n:o}))}</p>
                    </div>
                </header>
                <div class="pr-body" id="catalogInner">${a.catalogHome(e,{sort:s,cat:i,shown:r})}</div>
            </div>
        </section>`},a.extras=function(e){const s=e.cfg.sales,i=s.gift_enabled&&s.gift_banner!==!1?`<a class="ex" href="${c.url.page("checkout","gift=1")}" data-gift-start><span class="ex-i">${a.icon.gift}</span><span class="ex-t"><b>${t(y(e,"gift.banner_title")||n("أرسلها هدية"))}</b><small>${t(n("بطاقة إهداء بدون ذكر السعر"))}</small></span></a>`:"";return`<section class="wrap ex-sec" aria-label="${t(n("خدمات خاصة"))}">
            <a class="ex ex1" href="${a.asset("custom/")}"><span class="ex-i">✨</span><span class="ex-t"><b>${t(n("ملف باسم طفلك"))}</b><small>${t(n("مخصّص لصفه ومستواه"))}</small></span></a>
            <a class="ex ex2" href="${c.base()}games/"><span class="ex-i">🎮</span><span class="ex-t"><b>${t(n("ألعاب مجانية"))}</b><small>${t(n("العب وتعلّم الحروف والأرقام"))}</small></span></a>
        </section>`},a.home=function(e,{sort:s="default",cat:i="",shown:r=0}={}){if(a.isStoryStore(e))return a.storyHome(e);const o=a.setCards(e),l=y(e,"texts.about"),d=l?`<p class="intro">${t(S(e,l))}</p>`:"";return`${a.ad(e)}
            ${a.heroHome(e)}
            ${a.extras(e)}
            ${a.learnPromo(e)}
            ${a.catTiles(e)}
            ${a.printBanner(e,{sort:s,cat:i,shown:r})}
            ${o?a.rail(e,{id:"sets",title:y(e,"sales.sets_title")||n("أطقم بسعر أقل"),cards:o}):""}
            ${a.storeReviews(e)}
            ${a.homeFaq(e)}
            <section class="wrap seo-intro">${d}</section>`},a.homeFaq=function(e){const s=(y(e,"contact.faq")||[]).filter(i=>i&&i.q&&i.a);return!s.length||e.cfg.contact.faq_home===!1?"":`<section class="section home-faq" id="faq" aria-labelledby="faq-t">
            <div class="wrap">
                <div class="section-head"><h2 id="faq-t">${t(n("أسئلة متكررة"))}</h2>${e.cfg.contact.policy_show&&s.length>5?`<a class="more" href="${c.url.page("shipping")}">${t(n("كل الأسئلة"))}</a>`:""}</div>
                <div class="faq-list">${s.slice(0,5).map(i=>`<details class="faq-item"><summary>${t(i.q)}</summary><p>${t(S(e,i.a))}</p></details>`).join("")}</div>
            </div>
        </section>`},a.crumbs=function(e){return`<nav class="crumbs wrap" aria-label="${t(n("مسار التصفح"))}">
            ${e.map((s,i)=>s.href&&i<e.length-1?`<a href="${s.href}">${t(s.name)}</a>`:`<span aria-current="page">${t(s.name)}</span>`).join('<span class="sep" aria-hidden="true">›</span>')}
        </nav>`},a.subjectGroups=function(e,s,i){if(!/الصفوف-1-إلى-[46]/.test(s.slug||""))return"";const r={1:/تتبّع وكتابة الحروف العربية|English Letters Tracing/,2:/جدول الضرب/,3:/قراءة وفهم|الكسور/,4:/$^/,5:/$^/,6:/$^/},o=["الصف الأول","الصف الثاني","الصف الثالث","الصف الرابع","الصف الخامس","الصف السادس"],l=g=>{const u=o.findIndex(m=>g.name.includes(m));if(u>=0)return u+1;for(const m of[1,2,3,4,5,6])if(r[m].test(g.name))return m;return 0},d=[1,2,3,4,5,6].map(g=>i.filter(u=>l(u)===g)),f=i.filter(g=>!l(g)),p=`<div class="cat-chips grade-jump">${o.map((g,u)=>d[u].length?`<a class="chip" href="#grade-${u+1}">${t(n(g))} <small>${d[u].length}</small></a>`:"").join("")}</div>`,$=d.map((g,u)=>g.length?`<h2 class="sub-h" id="grade-${u+1}">${t(n(o[u]))} <small class="muted">(${g.length})</small></h2>${a.grid(e,g,{eagerCount:u===d.findIndex(m=>m.length)?4:0})}`:"").join("");return p+$+(f.length?a.grid(e,f,{eagerCount:0}):"")},a.category=function(e,s,{sort:i="default",shown:r=0}={}){const o=a.sortList(a.listings(e,e.products.filter(d=>d.category_id===s.id)),i),l=w(s,"description");return`${a.crumbs([{name:n("الرئيسية"),href:c.url.home()},{name:a.cname(s)}])}
            ${a.tiles(e,s)}
            <section class="catalog section" id="catalog">
                <div class="wrap">
                    <div class="section-head">
                        <h1>${t(a.cname(s))} <small class="muted">(${o.length})</small></h1>
                        ${a.sortSelect(e,i)}
                    </div>
                    ${l?`<p class="cat-desc">${t(l)}</p>`:""}
                    ${a.curNote(e)}
                    <div id="gridBox">${o.length?a.subjectGroups(e,s,o)||a.limitedGrid(e,o,r):`<div class="empty"><p>${t(n("لا توجد منتجات في هذا القسم حاليًا."))}</p><a class="btn btn-primary" href="${c.url.home()}">${t(n("تصفّح كل المنتجات"))}</a></div>`}</div>
                </div>
            </section>`};const R=[["تلوين","لون","الوان","رسم","رسومات","coloring","colouring","color"],["قصه","قصص","حكايه","حكايات","story","stories"],["نشاط","انشطه","العاب","لعب","activity","activities"],["متاهه","متاهات","maze","mazes"],["توصيل","صل","connect","dots"],["مطابقه","matching","match"],["قص","لصق","cut","paste"],["تتبع","تتبيع","خط","كتابه","tracing","trace","handwriting"],["ورقه","اوراق","ورقة عمل","worksheet","worksheets"],["رياضيات","حساب","ارقام","رقم","عد","math","maths","numbers"],["ضرب","جدول الضرب","multiplication","times"],["كسور","كسر","fractions"],["انجليزي","انقليزي","english","انجلش"],["عربي","لغتي","لغه عربيه","arabic"],["حروف","حرف","هجاء","letters","alphabet","abc"],["اسلاميه","دين","تربيه اسلاميه","islamic","quran","قران"],["معلمه","معلمات","معلم","مدرسه","teacher","teachers"],["عرض","عروض","بوربوينت","باوربوينت","شرائح","powerpoint","slides","ppt"],["شهاده","شهادات","تقدير","certificate","certificates"],["روضه","تمهيدي","kg","kindergarten","اطفال","طفل","kids"],["حزمه","حزم","باقه","bundle","bundles"],["حيوانات","حيوان","animals","animal"],["بحر","سمك","sea","ocean"],["رمضان","عيد","فانوس","ramadan","eid"],["مهن","مهنه","وظائف","jobs","professions"],["عادات","سلوك","اداب","habits","manners"]],D=(()=>{const e=new Map;return R.forEach(s=>{const i=s.map(r=>c.normName(r));i.forEach(r=>e.set(r,i))}),e})(),E=e=>e.length>4&&e.startsWith("ال")?e.slice(2):e,G=(e,s,i)=>{if(Math.abs(e.length-s.length)>i)return i+1;let r=Array.from({length:s.length+1},(o,l)=>l);for(let o=1;o<=e.length;o++){const l=[o];let d=l[0];for(let f=1;f<=s.length;f++)l[f]=Math.min(r[f]+1,l[f-1]+1,r[f-1]+(e[o-1]===s[f-1]?0:1)),l[f]<d&&(d=l[f]);if(d>i)return i+1;r=l}return r[s.length]};function V(e,s,i){if(s.includes(e))return 3;const r=E(e);if(r!==e&&s.includes(r))return 3;const o=D.get(r)||D.get(e);if(o&&o.some(l=>s.includes(l)))return 2.5;if(r.length>=4){const l=r.length>=7?2:1;if(i.some(d=>d.length>=3&&G(r,E(d),l)<=l))return 1.5;if(i.some(d=>d.length>r.length&&d.startsWith(r.slice(0,-1))))return 1.2}return 0}a.searchIndex=function(e){return e._searchIndex||(e._searchIndex=e.products.map((s,i)=>{const r=a.catOf(e,s),o=a.colorOf(e,s),l=c.normName([s.name,s.name_en].filter(Boolean).join(" ")),d=c.normName([s.name,s.name_en,s.description,s.description_en,r&&r.name,r&&r.name_en,o&&o.name,o&&o.name_en].filter(Boolean).join(" "));return{p:s,i,name:l,hay:d,tokens:d.split(" ").filter(Boolean)}})),e._searchIndex},a.searchScored=function(e,s){const i=c.normName(s);if(!i)return{list:[],loose:!1};const r=i.split(" ").filter(Boolean),o=(p,$)=>{let g=0;for(const u of r){const m=V(u,p.hay,p.tokens);if(!m&&$)return 0;g+=m+(m&&p.name.includes(E(u))?1:0)}return g},l=a.searchIndex(e);let d=l.map(p=>({row:p,s:o(p,!0)})).filter(p=>p.s>0),f=!1;return!d.length&&r.length>1&&(d=l.map(p=>({row:p,s:o(p,!1)})).filter(p=>p.s>0),f=d.length>0),d.sort((p,$)=>$.s-p.s||($.row.p.is_available!==!1)-(p.row.p.is_available!==!1)||p.row.i-$.row.i),{list:a.listings(e,d.map(p=>p.row.p)),loose:f}},a.searchResults=(e,s)=>a.searchScored(e,s).list,a.search=function(e,s,{sort:i="default"}={}){const r=a.searchScored(e,s),o=a.sortList(r.list,i),l=String(s||"").trim();return`<section class="catalog section" id="catalog">
            <div class="wrap">
                <div class="section-head">
                    <h1>${l?`${t(n("نتائج «{q}»",{q:s}))} <small class="muted">(${o.length})</small>`:t(n("ابحث في المنتجات"))}</h1>
                    ${o.length?a.sortSelect(e,i):""}
                </div>
                ${a.curNote(e)}
                ${r.loose?`<p class="search-loose">${t(n("ما لقينا كل الكلمات، هذه أقرب النتائج:"))}</p>`:""}
                ${l?"":`<div class="cat-chips search-chips">${e.categories.filter(d=>e.counts.get(d.id)).slice(0,10).map(d=>`<a class="chip" href="${c.url.category(d)}">${t(a.cname(d))}</a>`).join("")}</div>`}
                <div id="gridBox">${o.length?a.grid(e,o):`<div class="empty"><p>${t(n(l?"لا توجد نتائج. جرّب اسم مادة أو موضوع أو قسم.":"اكتب اسم مادة أو موضوع في خانة البحث بالأعلى، مثل: تلوين، رياضيات، قصة."))}</p></div>`}</div>
            </div>
        </section>
        ${o.length?"":a.tiles(e)}`},a.relatedFor=function(e,s,i){const r=new Set;s.forEach(p=>{r.add(p);const $=e.groups.get(p);$&&$.forEach(g=>r.add(g.id))});const o=s.map(p=>e.byId.get(p)).filter(Boolean);if(!o.length)return[];const l=new Set;a.validBundles(e).forEach(p=>{r.has(p.a)&&l.add(p.b),r.has(p.b)&&l.add(p.a)});const d=o.reduce((p,$)=>p+Number($.price),0)/o.length,f=e.products.filter(p=>!r.has(p.id)&&p.is_available!==!1).map(p=>{let $=0;return l.has(p.id)&&($+=1e3),o.some(g=>g.category_id&&g.category_id===p.category_id)&&($+=100),p.is_best_seller&&($+=20),o.some(g=>g.color_id&&g.color_id===p.color_id)&&($+=5),$+=Math.max(0,9-Math.abs(Number(p.price)-d)),{p,score:$}}).sort((p,$)=>$.score-p.score).map(p=>p.p);return a.listings(e,f).slice(0,i)},a.variantPicker=function(e,s){const i=e.groups.get(s.id);if(!i)return"";const r=a.colorOf(e,s);return`<div class="variants">
            <span class="variants-label">${t(n("اللون:"))} <b>${t(r?w(r,"name"):"")}</b></span>
            <div class="variant-list">
                ${i.map(o=>{const l=a.colorOf(e,o),d=o.id===s.id;return`<a class="variant${d?" on":""}${o.is_available===!1?" out":""}" href="${c.url.product(o)}" data-replace${d?' aria-current="true"':""}>
                        ${a.img(o)?`<img src="${t(a.img(o))}" alt="" width="56" height="70" loading="lazy">`:""}
                        <span>${a.dot(l)}${t(l?w(l,"name"):"")}</span>
                    </a>`}).join("")}
            </div>
        </div>`},a.pdpPerks=function(e,s){const i=e.cfg;if(i.sales.pdp_perks===!1)return"";const r=[],o=Number(i.order.free_min)||0;if(c.isDigital(i)&&r.push([n("يصلك على واتساب بعد تأكيد الدفع"),!0]),i.order.free_enabled&&o>0&&c.freeAppliesTo(i,e.country)&&r.push([Number(s.price)>=o?n("الشحن مجاناً"):n("شحن مجاني فوق {amount}",{amount:c.trimZeros(k(e,o))}),!0]),c.paymentsFor(i,e.country).some(f=>f.type==="cod")&&r.push([n("الدفع عند الاستلام")]),(y(e,"sales.trust_custom")||[]).filter(Boolean).forEach(f=>r.push([S(e,f)])),r.length<2&&!c.isDigital(i)){const f=(i.order.delivery||[]).some(p=>p.enabled&&Array.isArray(p.countries)&&p.countries.some($=>$!=="OM"));r.push([n(f?"توصيل لكل دول الخليج":"توصيل داخل سلطنة عُمان")])}const d=r.slice(0,2).map(([f,p])=>`<span class="perk${p?" hot":""}">${x.check}<span>${t(f)}</span></span>`).join('<i class="perk-sep" aria-hidden="true"></i>');return i.contact.policy_show?`<a class="perks" href="${c.url.page("shipping")}">${d}<span class="perks-go">${x.chevron}</span></a>`:`<div class="perks">${d}</div>`},a.pdpPrice=function(e,s){const i=Number(s.old_price)>Number(s.price),r=i?Math.round((1-s.price/s.old_price)*100):0,o=[];i&&(o.push(`<span class="pchip off">${t(n("خصم {pct}%",{pct:r}))}</span>`),o.push(`<span class="pchip save">${t(n("وفّر {amount}",{amount:k(e,Math.round((s.old_price-s.price)*1e3)/1e3)}))}</span>`));const l=a.lowStock(e,s);l?o.push(`<span class="pchip hot">⏳ ${t(n("باقي {n} فقط",{n:l}))}</span>`):s.is_best_seller&&s.is_available!==!1&&o.push(`<span class="pchip hot">🔥 ${t(c.isEn()?"Best seller":y(e,"sales.best_title")||n("الأكثر طلباً"))}</span>`);const d=s.is_available===!1?0:c.pointsFor(s.price,e.cfg);return d>0&&o.push(`<span class="pchip pts">⭐ ${t(n("تكسب {pts}",{pts:c.pointsText(d)}))}</span>`),`<div class="pdp-price">
            <div class="pp-row">${i?`<s class="pp-was">${k(e,s.old_price)}</s>`:""}<b class="pp-now">${k(e,s.price)}</b></div>
            ${I(e)?"":`<small class="base-price">${B(e,s.price)}</small>`}
            ${o.length?`<div class="pp-chips">${o.join("")}</div>`:""}
        </div>`},a.galleryStage=function(e,s){const i=a.label(e,s);return`<div class="stage">${s.image_url?`<img src="${t(a.big(s))}" alt="${t(i)}" fetchpriority="high" width="800" height="1000">`:""}</div>`},a.STORY_PAGES=15,a.storyShort=e=>a.pname(e).replace(/^قصة باسم طفلك:\s*/,""),a.storyBlurb=e=>String(w(e,"description")||"").split(`
`)[0].trim(),a.sfState=function(e,s){const i=e.cartCustom(s.id),r=i||e.savedChild()||{},o=i||{};return{pid:s.id,name:r.name||"",g:r.g==="f"||r.g==="m"?r.g:"",age:Number(r.age)||0,likes:Array.isArray(r.likes)?r.likes.slice(0,2):[],lesson:r.lesson||"",tier:o.tier==="pro"?"pro":"std",fmt:o.fmt==="print"?"print":"pdf",wrap:!!o.wrap,ded_on:!!o.ded,ded_t:o.ded_t||"d1",ded:o.ded_t==="own"&&o.ded||"",ded_from:o.ded_from||"",photo_path:i?o.photo_path||"":r.photo_path&&Date.now()-(Number(r.photo_at)||0)<7*864e5?r.photo_path:"",hijab:r.hijab!==!1,note:o.note||"",family:o.family||"",friend:o.friend||"",edit:!!i,more:!!(r.likes&&r.likes.length||r.lesson),up:null}},a.sfCustom=function(e,s,i){const r=e.cfg,o=c.storyCfg(r);return c.storyClean({name:i.name,g:c.isActivity(s)?"m":i.g,age:c.isActivity(s)?5:i.age,likes:c.isActivity(s)?[]:i.likes,lesson:c.isActivity(s)?"":i.lesson,tier:i.tier==="pro"&&c.proOn(r,s.story)?"pro":"std",fmt:i.fmt==="print"&&c.printOn(r,e.country)&&!c.isActivity(s)?"print":"pdf",wrap:!1,ded_t:"",ded:"",ded_from:"",photo_path:o.photo_upload!==!1&&!c.isActivity(s)?i.photo_path:"",hijab:i.hijab,note:i.note,family:i.family,friend:i.friend})},a.sfPhoto=function(e,s,i){const r=i.tier==="pro",o=i.up||{},l=o.thumb||(i.photo_path?e.photoThumb(i.photo_path):""),d=[["ok","😊",n("الوجه واضح")],["ok","☀️",n("إضاءة جيدة")],["no","🕶️",n("بدون نظارة شمسية")],["no","👥",n("شخص واحد فقط")]],f='<input type="file" id="sfPhoto" name="sf_photo" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden>';let p;return o.busy?p=`<div class="sf-ph busy">${l?`<img src="${t(l)}" alt="" width="72" height="72">`:'<span class="sf-ph-e">📷</span>'}<div><b>${t(n("نرفع الصورة…"))}</b><span class="sf-ph-bar"><i></i></span></div></div>`:i.photo_path||l&&o.err?p=`<div class="sf-ph${o.err?" bad":""}">${l?`<img src="${t(l)}" alt="${t(n("صورة الطفل"))}" width="72" height="72">`:'<span class="sf-ph-e">📷</span>'}<div>
                <b>${o.err?t(o.err):`✓ ${t(n("تم رفع الصورة"))}`}</b>
                <small>${t(o.err?n("الصورة ما وصلتنا بعد"):n(r?"نرسم طفلك منها في كل صفحة":"تظهر على غلاف القصة"))}</small>
                <span class="sf-ph-act"><label class="link-btn" for="sfPhoto">${t(o.err?n("جرّب مرة ثانية"):n("تغيير الصورة"))}</label><button type="button" class="link-btn danger" data-sf="photo-del">${t(n("حذف"))}</button></span>
            </div></div>`:p=`<label class="sf-up${o.err?" bad":""}" for="sfPhoto">
                <span class="sf-up-e" aria-hidden="true">📷</span>
                <b>${t(n("ارفع صورة طفلك"))}</b>
                <small>${t(o.err||n(r?"مطلوبة: نرسم طفلك بوجهه منها":"اختياري: نضعها على غلاف القصة"))}</small>
            </label>`,`<div class="sf-f" id="sfPhotoF">
            <span class="sf-l">${t(n("صورة الطفل"))} ${r?"<i>*</i>":`<small>${t(n("(اختياري)"))}</small>`}</span>
            ${p}${f}
            <ul class="sf-tips">${d.map(([$,g,u])=>`<li class="${$}"><span aria-hidden="true">${g}</span><b aria-hidden="true">${$==="ok"?"✓":"✕"}</b>${t(u)}</li>`).join("")}</ul>
            <p class="sf-safe">🔒 ${t(n("الصورة خاصة: نستخدمها لقصة طفلك فقط، ونرسمه منها بأداة ذكاء اصطناعي، ونحذفها بعد التسليم."))}</p>
        </div>`},a.storyFields=function(e,s,i){const r=e.cfg,o=c.storyCfg(r),l=c.proOn(r,s.story),d=c.printOn(r,e.country),f=(h,v)=>i.g==="f"?v:h,p=c.storyClean({name:i.name}).name||f(n("طفلك"),n("طفلتك")),$=h=>c.STORY_LESSONS.filter(v=>v.k===h).map(v=>`<option value="${v.id}"${i.lesson===v.id?" selected":""}>${v.e} ${t(n(v.t))}</option>`).join(""),g=(h,v,M,b,A,T,N,C="")=>`<button type="button" class="sf-opt${M?" on":""}${C}" ${h}="${v}" aria-pressed="${M}">
            <span class="sf-opt-e" aria-hidden="true">${b}</span>
            <span class="sf-opt-t"><b>${t(A)}</b><small>${t(T)}</small></span>
            <span class="sf-opt-p">${N}</span>
        </button>`,u=(r.order.delivery||[]).find(h=>h.enabled&&h.type!=="digital"&&c.inCountries(h,e.country)),m=c.isActivity(s);return`<div class="sf-f${i.bad==="name"?" bad":""}" id="sfNameF">
                <label class="sf-l" for="sfName">${t(n("اسم الطفل"))} <i>*</i></label>
                <input class="input" id="sfName" name="sf_name" maxlength="22" autocomplete="off" autocapitalize="words" enterkeyhint="done" placeholder="${t(f(n("مثال: محمد"),n("مثال: سارة")))}" value="${t(i.name)}">
                <small class="sf-hint">${t(n(m?"تُرسم حروف اسمه في الكتاب، تأكد من الإملاء":"يظهر على الغلاف وفي كل صفحة، تأكد من الإملاء"))}</small>
            </div>
            ${m?"":`<div class="sf-f${i.bad==="g"?" bad":""}" id="sfGF">
                <span class="sf-l">${t(n("ولد أو بنت؟"))} <i>*</i></span>
                <div class="sf-g2">${[["m","👦",n("ولد")],["f","👧",n("بنت")]].map(([h,v,M])=>`<button type="button" class="sf-gc${i.g===h?" on":""}" data-sf-g="${h}" aria-pressed="${i.g===h}"><span aria-hidden="true">${v}</span><b>${t(M)}</b></button>`).join("")}</div>
            </div>
            <div class="sf-f${i.bad==="age"?" bad":""}" id="sfAgeF">
                <label class="sf-l" for="sfAge">${t(n("العمر"))} <i>*</i></label>
                <select class="input" id="sfAge" name="sf_age"><option value="">${t(n("اختر العمر"))}</option>${c.STORY_AGES.map(h=>`<option value="${h}"${i.age===h?" selected":""}>${t(c.ageText(h))}</option>`).join("")}</select>
            </div>`}
            ${o.photo_upload!==!1&&!m?a.sfPhoto(e,s,i):""}
            ${m?"":`<details class="sf-more" id="sfMore"${i.more?" open":""}>
                <summary><span>✨ ${t(n("خصّصها أكثر"))}</span><small>${t(n("هواياته ورسالة القصة · اختياري"))}</small></summary>
                <div class="sf-f">
                    <span class="sf-l">${t(f(n("ماذا يحب {name}؟",{name:p}),n("ماذا تحب {name}؟",{name:p})))} <small>${t(n("(شيئين على الأكثر)"))}</small></span>
                    <div class="sf-chips">${c.STORY_LIKES.map(h=>{const v=i.likes.includes(h.id);return`<button type="button" class="sf-chip${v?" on":""}" data-sf-like="${h.id}" aria-pressed="${v}"${!v&&i.likes.length>=2?" disabled":""}><span aria-hidden="true">${h.e}</span> ${t(n(h.t))}</button>`}).join("")}</div>
                </div>
                <div class="sf-f">
                    <label class="sf-l" for="sfLesson">${t(n("رسالة القصة"))}</label>
                    <select class="input" id="sfLesson" name="sf_lesson">
                        <option value="">${t(n("رسالة القصة الأصلية"))}</option>
                        <optgroup label="${t(n("قيم وأخلاق"))}">${$("v")}</optgroup>
                        <optgroup label="${t(n("عادات يومية"))}">${$("h")}</optgroup>
                    </select>
                    <small class="sf-hint">${t(n("نكتبها في نهاية القصة وفي شهادة البطل"))}</small>
                </div>
            </details>`}
            ${l&&!m?`<div class="sf-f">
                <span class="sf-l">${t(n("نوع القصة"))}</span>
                <div class="sf-opts">
                    ${g("data-sf-tier","std",i.tier!=="pro","📖",n("قصة جاهزة باسمه"),n("رسومات القصة الجميلة، و{name} البطل باسمه",{name:p}),k(e,s.price))}
                    ${g("data-sf-tier","pro",i.tier==="pro","🌟",n("مؤلفة خصيصاً بوجهه"),`${n("نرسمه من صورته في كل صفحة")} · ${o.pro_time}`,"+"+k(e,Number(o.pro_price)||0)," pro")}
                </div>
                ${i.tier==="pro"?`<div class="sf-pro">
                    ${i.g==="f"?`<div class="sf-f"><span class="sf-l">${t(n("الحجاب في الرسومات"))}</span><div class="sf-seg2">
                        <button type="button" class="sf-chip${i.hijab?" on":""}" data-sf-hijab="1" aria-pressed="${i.hijab}">${t(n("بالحجاب"))}</button>
                        <button type="button" class="sf-chip${i.hijab?"":" on"}" data-sf-hijab="0" aria-pressed="${!i.hijab}">${t(n("بدون حجاب"))}</button>
                    </div></div>`:""}
                    <label class="sf-f"><span class="sf-l">${t(n("أسماء الأسرة في القصة"))} <small>${t(n("(اختياري)"))}</small></span><input class="input" name="sf_family" maxlength="120" autocomplete="off" placeholder="${t(n("مثال: ماما مريم، بابا خالد، أخته لين"))}" value="${t(i.family)}"></label>
                    <label class="sf-f"><span class="sf-l">${t(f(n("صديقه المفضّل"),n("صديقتها المفضّلة")))} <small>${t(n("(اختياري)"))}</small></span><input class="input" name="sf_friend" maxlength="60" autocomplete="off" placeholder="${t(f(n("مثال: سالم"),n("مثال: ريم")))}" value="${t(i.friend)}"></label>
                    <label class="sf-f"><span class="sf-l">${t(n("تفاصيل خاصة"))} <small>${t(n("(اختياري)"))}</small></span><textarea class="input" name="sf_note" rows="2" maxlength="200" placeholder="${t(f(n("مثال: يلبس نظارة، يحب الديناصورات"),n("مثال: تلبس نظارة، تحب الفراشات")))}">${t(i.note)}</textarea></label>
                </div>`:""}
            </div>`:""}
            ${d&&!m?`<div class="sf-f">
                <span class="sf-l">${t(n("كيف تصلك القصة؟"))}</span>
                <div class="sf-opts two">
                    ${g("data-sf-fmt","pdf",i.fmt!=="print","📱",n("ملف PDF"),n("على واتساب خلال ساعات"),t(n("ضمن السعر")))}
                    ${g("data-sf-fmt","print",i.fmt==="print","📦",n("كتاب مطبوع"),`${n("غلاف مقوّى + PDF")} · ${o.print_time}`,"+"+k(e,Number(o.print_price)||0))}
                </div>
                ${i.fmt==="print"&&u&&Number(u.price)>0?`<small class="sf-hint">🚚 ${t(n("التوصيل {price} يُضاف في صفحة الطلب",{price:k(e,u.price)}))}</small>`:""}
            </div>`:""}`},a.storySum=function(e,s,i){const r=e.cfg,o=c.storyCfg(r),l=a.sfCustom(e,s,i),d=c.storyUnit(s,l,r),f=[[c.isActivity(s)?n("سعر الكتاب"):n("سعر القصة"),k(e,s.price)]];return l.tier==="pro"&&f.push([n("مؤلفة خصيصاً بوجهه"),"+"+k(e,Number(o.pro_price)||0)]),l.fmt==="print"&&f.push([n("كتاب مطبوع بغلاف مقوّى"),"+"+k(e,Number(o.print_price)||0)]),`${Number(s.old_price)>Number(s.price)?`<div class="sf-sum-save">🎉 ${t(n("وفّرت {amount}",{amount:k(e,Math.round((s.old_price-s.price)*1e3)/1e3)}))}</div>`:""}
            ${f.map(([p,$])=>`<div><span>${t(p)}</span><b>${$}</b></div>`).join("")}
            <div class="tot"><span>${t(n("الإجمالي"))}</span><b>${k(e,d)}</b></div>`},a.storyForm=function(e,s,i=a.sfState(e,s)){const r=c.storyCfg(e.cfg),o=c.storyClean({name:i.name}).name;return`<section class="sf-box buy has-story" id="buyBox" data-sf-for="${t(s.id)}" aria-labelledby="sf-t">
            <div class="sf-head" id="personalize"><h2 id="sf-t">✏️ ${t(n("بيانات التخصيص"))}</h2><small>${t(n("املأ بيانات طفلك، وشوف القصة باسمه قبل الطلب"))}</small></div>
            <div id="sfFields">${a.storyFields(e,s,i)}</div>
            <div class="sf-prev" id="storyPrev">
                <div class="sf-prev-head"><b id="sfPrevT">👀 ${t(o?n("قصة {name}",{name:o}):n("معاينة القصة"))}</b><small id="stPrevNote"></small></div>
                <div class="sf-pages" id="storyPages" aria-live="polite"></div>
            </div>
            <div class="sf-sum" id="sfSum">${a.storySum(e,s,i)}</div>
            <p class="sf-err" id="sfErr" role="alert" hidden></p>
            <button class="btn btn-primary btn-block sf-add" type="button" data-sf="add">🛒 ${t(i.edit?n("حفظ التعديل"):n("أضف إلى السلة"))}</button>
            <button class="btn btn-ghost btn-block sf-buy" type="button" data-sf="buy">${t(n("اطلب الآن"))} ←</button>
            ${r.guarantee?`<p class="sf-guard">🛡️ <span><b>${t(n("ضمان الرضا"))}</b> ${t(n("إذا ما عجبتك القصة نعدّلها مجاناً، أو نرجّع لك المبلغ كاملاً."))}</span></p>`:""}
        </section>`},a.storyMeta=function(e,s,i){if(!c.isStory(s))return"";const r=`${c.url.product(s)}#personalize`;if(!i||!i.name)return`<a class="cl-story warn" href="${r}">✎ ${t(n("اكتب اسم طفلك"))}</a>`;const o=c.storyKind(i);return`<span class="cl-story">👶 ${t(i.name)} · ${t(i.g==="f"?n("بنت"):n("ولد"))}${i.age?` · ${t(c.ageText(i.age))}`:""}${o?` · <b>${t(o)}</b>`:""} <a class="link-btn" href="${r}">${t(n("تعديل"))}</a></span>`},a.buyBox=function(e,s){const i=e.cfg;if(s.is_available===!1)return i.sales.restock!==!1?`<div class="buy out" id="buyBox">
                    <div class="out-note">${t(y(e,"texts.sold_out"))}. ${t(n("نخبرك على واتساب أول ما يتوفر."))}</div>
                    <button class="btn btn-primary btn-block" type="button" data-notify="${t(s.id)}">${x.bell}${t(n("أخبرني عند التوفر"))}</button>
                </div>`:`<div class="out-note" id="buyBox">${t(y(e,"texts.sold_out"))}. ${c.isValidWhatsapp(i.order.whatsapp)?t(n("تواصل معنا لمعرفة موعد توفره.")):""}</div>`;if(c.isFree(s))return`<div class="buy single-qty free-box" id="buyBox">${a.freeBtn(s,{block:!0})}<p class="free-note">${t(n("ملف PDF جاهز للطباعة، يُحمَّل مباشرة على جهازك بدون تسجيل ولا دفع."))}</p></div>`;const r=c.isValidWhatsapp(i.order.whatsapp)&&i.sales.wa_quick,o=i.sales.buy_now,l=c.isStory(s),d=l||a.maxFor(e,s)<=1;return l?a.storyForm(e,s):`<div class="buy${d?" single-qty":""}" id="buyBox">
            <div class="buy-row">
                <div class="stepper lg" role="group" aria-label="${t(n("الكمية"))}"${d?" hidden":""}>
                    <button type="button" data-pdp-step="1" aria-label="${t(n("زيادة"))}">+</button>
                    <output id="pdpQty" aria-live="polite">1</output>
                    <button type="button" data-pdp-step="-1" aria-label="${t(n("إنقاص"))}">−</button>
                </div>
                <button class="btn btn-primary" type="button" data-pdp-add="${t(s.id)}">${t(l?n("أضف القصة للسلة"):y(e,"texts.add_to_cart"))}</button>
            </div>
            ${o||r?`<div class="buy-alt${o&&r?"":" single"}">
                ${o?`<button class="btn btn-ghost" type="button" data-buy-now="${t(s.id)}">${t(n("اشترِ الآن"))}</button>`:""}
                ${r?`<button class="btn btn-wa" type="button" data-wa-product="${t(s.id)}">${a.waIcon()}${t(n("اطلب عبر واتساب"))}</button>`:""}
            </div>`:""}
            ${i.sales.gift_enabled&&i.sales.gift_button?a.giftCta(e,{attrs:`data-gift-now="${t(s.id)}"`,title:y(e,"gift.cta_title")||n("أرسله هدية")}):""}
        </div>`},a.productReviews=function(e,s){const i=(e.reviewsByProduct.get(s.id)||[]).slice().sort((l,d)=>String(d.created_at||"").localeCompare(String(l.created_at||""))),r=a.reviewStats(i);if(!r&&c.isStory(s))return"";const o=c.url.page("review",`p=${encodeURIComponent(s.slug||s.id)}`);return`<section class="section reviews-block" id="reviews" aria-labelledby="pr-t">
            <div class="section-head"><h2 id="pr-t">${t(n("تقييمات العملاء"))}</h2></div>
            ${r?`<div class="rate-summary"><b>${r.avg.toFixed(1)}</b>${a.stars(r.avg)}<span>${t(a.reviewCount(r.count))}</span></div>
                <div class="review-list">${i.slice(0,6).map(l=>a.reviewCard(e,l)).join("")}</div>`:`<p class="muted">${t(c.isDigital(e.cfg)?n("لا توجد تقييمات لهذه القصة بعد. اشتريتها؟ شاركنا رأيك."):n("لا توجد تقييمات لهذا التصميم بعد. اشتريته؟ شاركنا رأيك."))}</p>`}
            <a class="btn btn-ghost btn-sm" href="${o}" rel="nofollow">${t(n("اكتب تقييمك"))}</a>
        </section>`},a.descHTML=function(e){const s=String(e||"").split(`
`).map(o=>o.trim()).filter(Boolean),i=s.filter(o=>!/^[•\-–]\s*/.test(o)),r=s.filter(o=>/^[•\-–]\s*/.test(o)).map(o=>o.replace(/^[•\-–]\s*/,""));return`${i.map(o=>`<p class="pdp-desc">${t(o)}</p>`).join("")}${r.length?`<ul class="pdp-inc">${r.map(o=>`<li>${x.check}<span>${t(o)}</span></li>`).join("")}</ul>`:""}`},a.storyProduct=function(e,s){const i=e.cfg,r=c.storyCfg(i),o=a.reviewStats(e.reviewsByProduct.get(s.id)),l=a.description(e,s),d=c.printOn(i,e.country),f=a.listings(e,e.products.filter(u=>c.isStory(u)&&u.id!==s.id&&u.is_available!==!1&&c.isActivity(u)===c.isActivity(s))).slice(0,6),p=c.isActivity(s),$=p?[["✏️",n("اكتب اسم طفلك")],["✨",n("نجهّز الكتاب باسمه")],["📱",n("يصلك PDF على واتساب")]]:[r.photo_upload!==!1?["📷",n("ارفع صورة طفلك")]:["✏️",n("اكتب اسم طفلك")],["✨",r.photo_upload!==!1?n("نضيف اسمه وصورته"):n("نكتب القصة باسمه")],[d?"📦":"📱",n(d?"تصلك PDF أو مطبوعة":"تصلك على واتساب")]],g=p?[`📄 ${n("جاهز للطباعة A4")}`,`🧒 ${n("من 3 إلى 8 سنوات")}`,`⚡ ${n("يصلك خلال ساعات")}`]:[`📄 ${n("{n} صفحة",{n:a.STORY_PAGES})}`,`🧒 ${n("من 3 إلى 8 سنوات")}`,`⚡ ${n("يصلك خلال ساعات")}`];return`${a.crumbs([{name:n("الرئيسية"),href:c.url.home()},{name:a.storyShort(s)}])}
            <div class="wrap">
                <div class="pdp ks-pdp">
                    <div class="gallery" id="gallery">${a.galleryStage(e,s)}</div>
                    <div class="pdp-info">
                        <div class="pdp-title"><h1>${t(a.pname(s))}</h1>${a.favBtn(e,s)}</div>
                        ${o?`<a class="pdp-rate" href="#reviews">${a.stars(o.avg)}<span>${o.avg.toFixed(1)} · ${t(a.reviewCount(o.count))}</span></a>`:""}
                        ${a.pdpPrice(e,s)}
                        ${a.storyBlurb(s)?`<p class="ks-lead">${t(a.storyBlurb(s))}</p>`:""}
                        <ol class="ks-how">${$.map(([u,m],h)=>`<li><span class="ks-how-e" aria-hidden="true">${u}</span><small>${h+1}</small><b>${t(m)}</b></li>`).join("")}</ol>
                        <ul class="ks-badges">${g.map(u=>`<li>${t(u)}</li>`).join("")}</ul>
                        <button class="ks-flipbtn" type="button" data-flip="${t(s.id)}"><span aria-hidden="true">📖</span><span><b>${t(n(p?"تصفّح الكتاب كاملاً":"تصفّح القصة كاملة"))}</b><small>${t(n(p?"شاهد صفحاته باسم طفلك قبل ما تطلب":"اقرأها صفحة صفحة قبل ما تطلب"))}</small></span><span aria-hidden="true">←</span></button>
                        ${s.is_available===!1?a.buyBox(e,s):a.storyForm(e,s)}
                        ${a.deliveryBox(e,s)}
                        ${l?`<details class="ks-more"><summary>${t(n("تفاصيل القصة"))}</summary>${a.descHTML(l)}</details>`:""}
                        <div class="share-row">
                            <button class="link-btn" type="button" data-share-product="${t(s.id)}">${x.share} ${t(n("شارك القصة مع صديق"))}</button>
                        </div>
                    </div>
                </div>
                ${a.productReviews(e,s)}
            </div>
            ${f.length?a.rail(e,{id:"related",title:n("ملفات قد تعجبك"),items:f}):""}`},a.product=function(e,s){if(c.isStory(s))return a.storyProduct(e,s);const i=e.cfg,r=a.catOf(e,s),o=a.reviewStats(e.reviewsByProduct.get(s.id)),l=a.description(e,s),d=i.sales.related_show?a.relatedFor(e,[s.id],Number(i.sales.related_count)||4):[],f=[{name:n("الرئيسية"),href:c.url.home()}];return r&&f.push({name:a.cname(r),href:c.url.category(r)}),f.push({name:a.pname(s)}),`${a.crumbs(f)}
            <div class="wrap">
                <div class="pdp">
                    <div class="gallery" id="gallery">${a.galleryStage(e,s)}</div>
                    <div class="pdp-info">
                        ${a.pdpPerks(e,s)}
                        <div class="pdp-title"><h1>${t(a.pname(s))}</h1>${a.favBtn(e,s)}</div>
                        ${l?a.descHTML(l):""}
                        ${o?`<a class="pdp-rate" href="#reviews">${a.stars(o.avg)}<span>${o.avg.toFixed(1)} · ${t(a.reviewCount(o.count))}</span></a>`:""}
                        ${a.pdpPrice(e,s)}
                        ${a.pdpProof(e,s)}
                        ${e.groups.get(s.id)?a.variantPicker(e,s):a.colorOf(e,s)?`<div class="pdp-color">${t(n("اللون:"))} ${a.colorTag(e,s)}</div>`:""}
                        ${a.buyBox(e,s)}
                        ${s.is_available===!1?"":a.volumeTeaser(e)}
                        ${a.bundleOffers(e,s)}
                        ${a.deliveryBox(e,s)}
                        ${a.trust(e)}
                        ${s.video_url&&c.isUrl(s.video_url)?`<div class="pdp-details">
                            <a class="btn btn-ghost btn-sm" href="${t(s.video_url)}" target="_blank" rel="noopener">▶ ${t(n("شاهد فيديو المنتج"))}</a>
                        </div>`:""}
                        <div class="share-row">
                            <button class="link-btn" type="button" data-share-product="${t(s.id)}">${x.share} ${t(n("شارك المنتج مع صديق"))}</button>
                        </div>
                    </div>
                </div>
                ${a.productReviews(e,s)}
            </div>
            ${d.length?a.rail(e,{id:"related",title:y(e,"sales.related_title"),items:d}):""}`},a.privacy=function(e){const s=e.cfg,i=c.storeName(s),o=c.isValidWhatsapp(s.order.whatsapp)?`<a href="${t(c.waLink(s.order.whatsapp))}" target="_blank" rel="noopener">${t(n("واتساب المنصة"))}</a>`:t(n("واتساب المنصة")),l=f=>`<p>${t(n(f,{name:i}))}</p>`,d=f=>`<ul>${f.map(p=>`<li>${t(n(p,{name:i}))}</li>`).join("")}</ul>`;return`${a.crumbs([{name:n("الرئيسية"),href:c.url.home()},{name:n("سياسة الخصوصية")}])}
            <article class="wrap page policy">
                <h1>${t(n("سياسة الخصوصية"))}</h1>
                ${l("نحترم خصوصيتك. هذه الصفحة توضّح البيانات اللي نحتاجها في «{name}» وكيف نستخدمها.")}
                <h2>${t(n("البيانات اللي نحتاجها"))}</h2>
                ${d(["عند الطلب: اسمك ورقم واتساب، والملفات التي اخترتها، وطريقة الدفع. ما نطلب إنشاء حساب ولا عنوان توصيل لأن الملفات رقمية.","عند مراسلتنا على واتساب: نحفظ المحادثة حتى نخدمك ونرسل لك ملفاتك ونتابع طلبك."])}
                <h2>${t(n("المساعد الآلي في واتساب"))}</h2>
                ${l("قد يرد عليك في واتساب مساعد آلي يكتب الرد من معلومات المنصة باستخدام خدمة ذكاء اصطناعي (Google Gemini). نرسل لهذه الخدمة نص المحادثة واسمك الأول فقط، ولا نرسل رقم هاتفك. وتقدر تطلب التحدث مع صاحب المنصة في أي وقت.")}
                <h2>${t(n("كيف نستخدم بياناتك"))}</h2>
                ${d(["لتجهيز طلبك وإرسال ملفاتك والتواصل معك بخصوصه.","لخدمة العملاء والرد على أسئلتك.","نرسل لك العروض فقط إذا وافقت، وتقدر توقفها متى شئت برسالة."])}
                <h2>${t(n("مع من نشاركها"))}</h2>
                ${l("لا نبيع بياناتك لأي أحد. نشارك فقط ما يلزم مع الخدمات التقنية التي يعمل عليها المنصة (الاستضافة وقاعدة البيانات وواتساب). وقد نستخدم إحصاءات زيارات مجمّعة وأدوات قياس الإعلانات دون بيانات تعريفية.")}
                <h2>${t(n("حذف بياناتك"))}</h2>
                <p>${t(n("تقدر تطلب حذف بياناتك ومحادثاتك في أي وقت برسالة على"))} ${o}.</p>
                <p class="muted">${t(n("آخر تحديث: أكتوبر 2026"))}</p>
            </article>`},a.shipping=function(e){const s=e.cfg,i=c.countries(s).filter(u=>u.enabled).length,r=(s.order.delivery||[]).filter(u=>u.enabled),o=String(y(e,"contact.policy_notes")||"").split(`
`).map(u=>u.trim()).filter(Boolean),l=a.freeLine(e),d=c.isValidWhatsapp(s.order.whatsapp),f=(y(e,"sales.trust_custom")||[]).filter(Boolean),p=y(e,"contact.policy_title"),$=c.isDigital(s),g=(y(e,"contact.faq")||[]).filter(u=>u&&u.q&&u.a);return`${a.crumbs([{name:n("الرئيسية"),href:c.url.home()},{name:p}])}
            <article class="wrap page policy">
                <h1>${t(p)}</h1>
                <h2>${t(n($?"طريقة الاستلام":"طرق التوصيل وأسعارها"))}</h2>
                ${r.map(u=>{const m=a.flagsFor(e,u),h=w(u,"note");return`<p><b>${t(w(u,"name"))}</b>: ${t(a.deliveryPriceLabel(e,u))}${u.duration?t(n("، المدة {d}",{d:c.duration(u.duration)})):""}${m.length&&m.length<i?`<br><span class="muted">${t(n("إلى: {countries}",{countries:a.countriesText(m)}))}</span>`:""}${h?`<br><span class="muted">${t(h)}</span>`:""}</p>`}).join("")}
                ${l?`<p>${t(l)}</p>`:""}
                ${$?`<p class="muted">${t(n("القصة ملف PDF يفتح على أي جوال أو كمبيوتر، وتطبعه في البيت أو في أي مكتبة."))}</p>`:`<p class="muted">${t(n("نوصّل لكل ولايات سلطنة عُمان."))}</p>`}
                <h2>${t(n("طرق الدفع"))}</h2>
                ${a.paymentGroups(e).map(u=>`<p>${u.countries.length<i?`<b>${t(a.countriesText(u.countries))}:</b> `:""}${t(u.names)}</p>`).join("")}
                ${(s.order.payments||[]).filter(u=>u.enabled&&w(u,"note")).map(u=>`<p class="muted">${t(w(u,"name"))}: ${t(S(e,w(u,"note")))}</p>`).join("")}
                ${f.length?`<h2>${t(n("ضماننا لك"))}</h2>${f.map(u=>`<p>${t(S(e,u))}</p>`).join("")}`:""}
                <h2>${t(n("كيف أطلب؟"))}</h2>
                <ol>
                    <li>${t(n($?"اختر القصة واكتب اسم طفلك، وأضفها للسلة.":"اختر تصميمك وأضفه للسلة."))}</li>
                    <li>${t(n($?"اكتب اسمك ورقم واتساب واختر طريقة الدفع، بدون تسجيل حساب.":"اكتب اسمك ورقمك وعنوانك واختر طريقة التوصيل والدفع، بدون تسجيل حساب."))}</li>
                    <li>${t(n($?"أرسل الطلب عبر واتساب بضغطة، وبعد تأكيد الدفع نرسل لك القصة في نفس المحادثة.":"أرسل الطلب عبر واتساب بضغطة، ونؤكده ونجهّزه لك."))}</li>
                </ol>
                ${g.length?`<h2>${t(n("أسئلة متكررة"))}</h2><div class="faq-list">${g.map(u=>`<details class="faq-item"><summary>${t(u.q)}</summary><p>${t(S(e,u.a))}</p></details>`).join("")}</div>`:""}
                <h2>${t(n("العملات"))}</h2>
                <p class="muted">${t(n("نعرض الأسعار بعملة دولتك تقريبيًا، ويُحسب الطلب بالريال العماني."))}</p>
                ${o.length?`<h2>${t(n("ملاحظات"))}</h2>${o.map(u=>`<p>${t(S(e,u))}</p>`).join("")}`:""}
                ${d?`<p><a class="btn btn-wa" href="${t(c.waLink(s.order.whatsapp,S(e,y(e,"contact.wa_float_msg"))))}" target="_blank" rel="noopener">${a.waIcon()}${t(n("اسألنا عبر واتساب"))}</a></p>`:""}
            </article>`},a.footerDelivery=function(e){const s=e.cfg,i=String(y(e,"texts.footer_delivery_text")||"").trim();if(i)return i.split(`
`).filter(Boolean).map(l=>S(e,l));const r=(s.order.delivery||[]).filter(l=>l.enabled).map(l=>`${w(l,"name")} · ${a.deliveryPriceLabel(e,l)}${l.duration?` · ${c.duration(l.duration)}`:""}`),o=a.freeLine(e);return o&&r.push(o),a.paymentGroups(e).forEach((l,d,f)=>{r.push(f.length===1?n("الدفع: {names}",{names:l.names}):n("الدفع في {countries}: {names}",{countries:l.countries.map(p=>w(p,"name")).join(L()),names:l.names}))}),r},a.footer=function(e){const s=e.cfg,i=c.isValidWhatsapp(s.order.whatsapp),r=e.categories.filter(b=>e.counts.get(b.id)),o=y(e,"texts.about"),l=c.countries(s).filter(b=>b.enabled),d=l.some(b=>b.code!==c.BASE_COUNTRY),f=s.order.free_enabled&&Number(s.order.free_min)>0,p=(s.order.payments||[]).some(b=>b.enabled&&b.type==="cod"),$=c.isDigital(s)?[[a.icon.file,n("ملفات PDF جاهزة للطباعة")],[a.icon.inbox,n("تصلك على واتساب")],[a.icon.card,n(p?"الدفع عند الاستلام":"تحويل بنكي آمن")]]:[[a.icon.truck,n(d?"توصيل لكل دول الخليج":"توصيل لكل ولايات عُمان")],f?[a.icon.tag,d&&l.filter(b=>c.freeAppliesTo(s,b.code)).every(b=>b.code===c.BASE_COUNTRY)?n("توصيل مجاني في عُمان فوق {amount}",{amount:B(e,s.order.free_min)}):n("توصيل مجاني فوق {amount}",{amount:B(e,s.order.free_min)})]:null,[a.icon.card,n(p?"الدفع عند الاستلام":"تحويل بنكي آمن")]].filter(Boolean),g=(s.texts.socials||[]).filter(b=>c.isUrl(b.url)),u=g.find(b=>/instagram\.com/i.test(b.url)),m=g.find(b=>/tiktok\.com/i.test(b.url)),h=[u?`<a href="${t(u.url)}" target="_blank" rel="noopener" aria-label="${t(n("إنستغرام"))}">${a.icon.instagram}</a>`:"",m?`<a href="${t(m.url)}" target="_blank" rel="noopener" aria-label="${t(n("تيك توك"))}">${a.icon.tiktok}</a>`:"",i?`<a class="wa" href="${t(c.waLink(s.order.whatsapp))}" target="_blank" rel="noopener" aria-label="${t(n("واتساب"))}">${a.waIcon()}</a>`:""].join(""),v=a.socials({...e,cfg:{...s,texts:{...s.texts,socials:g.filter(b=>b!==u&&b!==m)}}},"fsoc"),M=[`© ${new Date().getFullYear()} ${t(c.storeName(s))}`,s.contact.policy_show?`<a href="${c.url.page("shipping")}">${t(y(e,"contact.policy_title"))}</a>`:"",`<a href="${a.asset("custom/")}">${t(n("ملف باسم طفلك"))}</a>`,`<a href="${c.url.page("privacy")}">${t(n("سياسة الخصوصية"))}</a>`,s.contact.reviews_share_btn?`<a href="${c.url.page("review")}" rel="nofollow">${t(y(e,"contact.reviews_share_text"))}</a>`:""].filter(Boolean);return`<div class="wrap foot">
            <div class="foot-head">
                <div class="footer-brand"><img src="${t(a.asset(s.logo_url||c.DEFAULTS.logo_url))}" alt="${t(c.storeName(s))}" width="40" height="40"></div>
                ${o?`<p class="foot-about">${t(S(e,o))}</p>`:""}
            </div>
            <ul class="foot-points">${$.map(([b,A])=>`<li>${b}<span>${t(A)}</span></li>`).join("")}</ul>
            ${r.length?`<details class="foot-acc">
                <summary>${t(n("الأقسام"))}${a.icon.chevron}</summary>
                <ul class="footer-cats">${r.map(b=>`<li><a href="${c.url.category(b)}">${t(a.cname(b))}</a></li>`).join("")}</ul>
            </details>`:""}
            <details class="foot-acc">
                <summary>${t(y(e,"texts.footer_delivery_title"))}${a.icon.chevron}</summary>
                <ul class="foot-lines">${a.footerDelivery(e).map(b=>`<li>${t(b)}</li>`).join("")}</ul>
                ${s.contact.policy_show?`<a class="foot-more" href="${c.url.page("shipping")}">${t(n("التفاصيل كاملة"))}</a>`:""}
            </details>
            ${h||v?`<div class="foot-follow"><span>${t(y(e,"texts.footer_contact_title"))}</span><div class="foot-icons">${h}</div>${v?`<div class="footer-social">${v}</div>`:""}</div>`:""}
            <div class="footer-bottom">${M.join(" · ")}</div>
        </div>`},a.asset=e=>!e||/^https?:|^data:|^\//i.test(e)?e:c.base()+e,a.brand=function(e){const s=e.cfg,i=s.logo_url||c.DEFAULTS.logo_url,r=!/logo\.png$/.test(i);return`<span class="brand-logo shape-${t(s.logo_shape||"rounded")}${r?" has-photo":""}" id="brandLogo"><img src="${t(a.asset(i))}" alt="" width="44" height="44"></span>
            <span class="brand-name" id="brandName"${s.show_name?"":" hidden"}>${t(c.storeName(s))}</span>`},a.favPage=function(e,s){const i=s.map(o=>e.byId.get(o)).filter(Boolean),r=i.filter(o=>o.is_available!==!1);return`<section class="catalog section fav-page" id="catalog">
            <div class="wrap">
                <div class="section-head">
                    <h1>${x.heart} ${t(n("المفضلة"))} <small class="muted">(${i.length})</small></h1>
                    ${r.length>1?`<button class="btn btn-primary btn-sm" type="button" data-fav-all>${t(n("أضف الكل للسلة"))}</button>`:""}
                </div>
                ${i.length?`<p class="cat-desc">${t(n("التصاميم التي أعجبتك محفوظة هنا على جهازك. ارجع لها متى ما تحب."))}</p><div id="gridBox">${a.grid(e,i)}</div>`:`<div class="empty"><span class="fav-empty" aria-hidden="true">${x.heart}</span><p>${t(n("لا توجد منتجات في المفضلة بعد. اضغط ♡ على أي تصميم يعجبك لتحفظه هنا."))}</p><a class="btn btn-primary" href="${c.url.home()}">${t(n("تصفّح المنتجات"))}</a></div>`}
            </div>
        </section>`},a.titles=function(e,s){const i=e.cfg,r=c.storeName(i)||n("المنصة");switch(s.name){case"product":{const o=s.product,l=o?a.colorOf(e,o):null;return o?`${a.pname(o)}${l?` ${w(l,"name")}`:""} | ${r}`:r}case"category":return s.cat?`${a.cname(s.cat)} | ${r}`:r;case"shipping":return`${y(e,"contact.policy_title")} | ${r}`;case"privacy":return`${n("سياسة الخصوصية")} | ${r}`;case"cart":return`${n("السلة")} | ${r}`;case"checkout":return`${n("إتمام الطلب")} | ${r}`;case"done":return`${n("تم استلام طلبك")} | ${r}`;case"review":return`${n("قيّم تجربتك")} | ${r}`;case"search":return`${n("بحث")} | ${r}`;case"fav":return`${n("المفضلة")} | ${r}`;case"points":return`${n("نقاطي")} | ${r}`;case"gift":return`${n("🎁 وصلتك هدية")} | ${r}`;default:return y(e,"seo.home_title")||`${r} | ${S(e,y(e,"texts.hero_title"))}`}}})(typeof window<"u"?window:globalThis);
