import{ac as N,ad as V,S as b,R as E,d as H,V as p,ae as O,af as j,F as A,W as F,a4 as w,e as k,a7 as L,ag as S}from"./stellar.js";let y=!1;function T(){if(N&&window.CSS&&!y&&(y=!0,"registerProperty"in(window==null?void 0:window.CSS)))try{CSS.registerProperty({name:"--n-color-start",syntax:"<color>",inherits:!1,initialValue:"#0000"}),CSS.registerProperty({name:"--n-color-end",syntax:"<color>",inherits:!1,initialValue:"#0000"})}catch{}}function W(e){const{heightSmall:i,heightMedium:r,heightLarge:s,borderRadius:a}=e;return{color:"#eee",colorEnd:"#ddd",borderRadius:a,heightSmall:i,heightMedium:r,heightLarge:s}}const $={common:V,self:W},I=b([E("skeleton",`
 height: 1em;
 width: 100%;
 transition:
 --n-color-start .3s var(--n-bezier),
 --n-color-end .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 animation: 2s skeleton-loading infinite cubic-bezier(0.36, 0, 0.64, 1);
 background-color: var(--n-color-start);
 `),b("@keyframes skeleton-loading",`
 0% {
 background: var(--n-color-start);
 }
 40% {
 background: var(--n-color-end);
 }
 80% {
 background: var(--n-color-start);
 }
 100% {
 background: var(--n-color-start);
 }
 `)]),K=Object.assign(Object.assign({},w.props),{text:Boolean,round:Boolean,circle:Boolean,height:[String,Number],width:[String,Number],size:String,repeat:{type:Number,default:1},animated:{type:Boolean,default:!0},sharp:{type:Boolean,default:!0}}),q=H({name:"Skeleton",inheritAttrs:!1,props:K,setup(e){T();const{mergedClsPrefixRef:i,mergedComponentPropsRef:r}=F(e),s=k(()=>{var n,t;return e.size||((t=(n=r==null?void 0:r.value)===null||n===void 0?void 0:n.Skeleton)===null||t===void 0?void 0:t.size)}),a=w("Skeleton","-skeleton",I,$,e,i);return{mergedClsPrefix:i,style:k(()=>{var n,t;const m=a.value,{common:{cubicBezierEaseInOut:z}}=m,h=m.self,{color:x,colorEnd:C,borderRadius:P}=h;let l;const{circle:d,sharp:R,round:B,width:o,height:c,text:f,animated:_}=e,v=s.value;v!==void 0&&(l=h[L("height",v)]);const u=d?(n=o??c)!==null&&n!==void 0?n:l:o,g=(t=d?o??c:c)!==null&&t!==void 0?t:l;return{display:f?"inline-block":"",verticalAlign:f?"-0.125em":"",borderRadius:d?"50%":B?"4096px":R?"":P,width:typeof u=="number"?S(u):u,height:typeof g=="number"?S(g):g,animation:_?"":"none","--n-bezier":z,"--n-color-start":x,"--n-color-end":C}})}},render(){const{repeat:e,style:i,mergedClsPrefix:r,$attrs:s}=this,a=p("div",O({class:`${r}-skeleton`,style:i},s));return e>1?p(A,null,j(e,null).map(n=>[a,`
`])):a}});export{q as N};
