import re
EMO='[\\u2600-\\u27BF\\u{1F300}-\\u{1FAFF}]'
STEP_JS = r"""
() => {
 const app=document.querySelector('#app');
 if(app.querySelector('.win')) return 'win';
 const S=document.querySelector('#stage')||app;
 const vis=e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[hidden]')};
 const ok=e=>vis(e)&&!e.disabled&&!e.matches('.dim,.no,.bad,.wrong,.ok,.done,.right,.hintbtn,.zrp,.used,.gone,[aria-disabled="true"]')&&!e.closest('.hintbtn,.zrp');
 const lv=app.querySelector('.lvcard[data-l="1"]'); if(lv&&!lv.disabled){lv.click();return 'lv'}
 let bank=[...S.querySelectorAll('.sn-bank .sn-w')].filter(vis); if(bank.length){bank.sort((a,b)=>a.dataset.j-b.dataset.j)[0].click();return 'sn'}
 const fh=S.querySelector('.fl-h b'); if(fh){for(const n of fh.innerText.split(' ثم ')){const b=S.querySelector('.fl-it:not(.ok)[aria-label="'+n+'"]');if(b){b.click();return 'fl'}}}
 for(const sel of ['.tg-opt','.st-op','.opt','.lk-it']){const c=[...S.querySelectorAll(sel)].filter(ok); if(c.length){c[Math.floor(Math.random()*c.length)].click();return sel}}
 const all=[...S.querySelectorAll('button,[role=button],.card,.cell,.tile,[data-k],[data-i]')].filter(ok);
 if(all.length){const e=all[Math.floor(Math.random()*all.length)];e.click();return 'any:'+String(e.className||e.tagName).slice(0,24)}
 return 'none';
}"""
CHECK_JS = r"""
(EMO) => {
 const app=document.querySelector('#app'); const S=document.querySelector('#stage')||app;
 const re=new RegExp(EMO,'u');
 const im=[...app.querySelectorAll('img')];
 const broken=im.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src').split('/').pop());
 const sw=document.documentElement.scrollWidth-innerWidth;
 const off=[];app.querySelectorAll('#stage *, .lvpick *, .win *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width>0&&r.height>0&&getComputedStyle(e).position!=='fixed'&&(r.right>innerWidth+2||r.left<-2))off.push(String(e.className||e.tagName).slice(0,20))});
 const clip=[];app.querySelectorAll('#stage *, .lvpick *').forEach(e=>{const cs=getComputedStyle(e);if(e.children.length===0&&e.innerText&&e.scrollWidth>e.clientWidth+3&&cs.overflow!=='visible'&&e.clientWidth>0)clip.push(e.innerText.slice(0,20))});
 const emo=[];const w=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const p=n.parentElement;if(!p||p.closest('.zxe,[aria-hidden="true"],script,style'))continue;if(re.test(n.nodeValue)){const r=p.getBoundingClientRect();if(r.width>0&&getComputedStyle(p).visibility!=='hidden')emo.push(n.nodeValue.trim().slice(0,16))}}
 const small=[...S.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<44||r.height<44)}).map(b=>Math.round(b.getBoundingClientRect().width)+'x'+Math.round(b.getBoundingClientRect().height)+':'+String(b.className).slice(0,16));
 return {broken,sw,off:[...new Set(off)].slice(0,5),clip:clip.slice(0,4),emo:[...new Set(emo)].slice(0,5),small:small.slice(0,5),txt:(S.innerText||'').length};
}"""
