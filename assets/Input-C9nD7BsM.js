import{d as oe,V as a,aI as sn,R as p,U as i,S as A,a3 as F,aK as L,w as he,r as m,aC as un,cj as cn,e as P,an as Z,ar as de,aU as dn,F as fn,b3 as hn,W as vn,a4 as Fe,ck as pn,X as gn,ao as bn,ap as xe,o as mn,az as xn,aA as we,aq as wn,a5 as yn,Y as ye,aj as Ce,au as ze,at as w,aH as Se,al as Cn,a7 as fe,bR as zn,aw as Ae,aN as Sn}from"./stellar.js";import{u as An,a as _e,N as _n}from"./Suffix-D8jQU5KV.js";import{u as Rn}from"./use-merged-state-CxZ9tfsE.js";const Fn=oe({name:"Eye",render(){return a("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512"},a("path",{d:"M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 0 0-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 0 0 0-17.47C428.89 172.28 347.8 112 255.66 112z",fill:"none",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"32"}),a("circle",{cx:"256",cy:"256",r:"80",fill:"none",stroke:"currentColor","stroke-miterlimit":"10","stroke-width":"32"}))}}),Bn=oe({name:"EyeOff",render(){return a("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512"},a("path",{d:"M432 448a15.92 15.92 0 0 1-11.31-4.69l-352-352a16 16 0 0 1 22.62-22.62l352 352A16 16 0 0 1 432 448z",fill:"currentColor"}),a("path",{d:"M255.66 384c-41.49 0-81.5-12.28-118.92-36.5c-34.07-22-64.74-53.51-88.7-91v-.08c19.94-28.57 41.78-52.73 65.24-72.21a2 2 0 0 0 .14-2.94L93.5 161.38a2 2 0 0 0-2.71-.12c-24.92 21-48.05 46.76-69.08 76.92a31.92 31.92 0 0 0-.64 35.54c26.41 41.33 60.4 76.14 98.28 100.65C162 402 207.9 416 255.66 416a239.13 239.13 0 0 0 75.8-12.58a2 2 0 0 0 .77-3.31l-21.58-21.58a4 4 0 0 0-3.83-1a204.8 204.8 0 0 1-51.16 6.47z",fill:"currentColor"}),a("path",{d:"M490.84 238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.66 96a227.34 227.34 0 0 0-74.89 12.83a2 2 0 0 0-.75 3.31l21.55 21.55a4 4 0 0 0 3.88 1a192.82 192.82 0 0 1 50.21-6.69c40.69 0 80.58 12.43 118.55 37c34.71 22.4 65.74 53.88 89.76 91a.13.13 0 0 1 0 .16a310.72 310.72 0 0 1-64.12 72.73a2 2 0 0 0-.15 2.95l19.9 19.89a2 2 0 0 0 2.7.13a343.49 343.49 0 0 0 68.64-78.48a32.2 32.2 0 0 0-.1-34.78z",fill:"currentColor"}),a("path",{d:"M256 160a95.88 95.88 0 0 0-21.37 2.4a2 2 0 0 0-1 3.38l112.59 112.56a2 2 0 0 0 3.38-1A96 96 0 0 0 256 160z",fill:"currentColor"}),a("path",{d:"M165.78 233.66a2 2 0 0 0-3.38 1a96 96 0 0 0 115 115a2 2 0 0 0 1-3.38z",fill:"currentColor"}))}}),Be=sn("n-input"),$n=p("input",`
 max-width: 100%;
 cursor: text;
 line-height: 1.5;
 z-index: auto;
 outline: none;
 box-sizing: border-box;
 position: relative;
 display: inline-flex;
 border-radius: var(--n-border-radius);
 background-color: var(--n-color);
 transition: background-color .3s var(--n-bezier);
 font-size: var(--n-font-size);
 font-weight: var(--n-font-weight);
 --n-padding-vertical: calc((var(--n-height) - 1.5 * var(--n-font-size)) / 2);
`,[i("input, textarea",`
 overflow: hidden;
 flex-grow: 1;
 position: relative;
 `),i("input-el, textarea-el, input-mirror, textarea-mirror, separator, placeholder",`
 box-sizing: border-box;
 font-size: inherit;
 line-height: 1.5;
 font-family: inherit;
 border: none;
 outline: none;
 background-color: #0000;
 text-align: inherit;
 transition:
 -webkit-text-fill-color .3s var(--n-bezier),
 caret-color .3s var(--n-bezier),
 color .3s var(--n-bezier),
 text-decoration-color .3s var(--n-bezier);
 `),i("input-el, textarea-el",`
 -webkit-appearance: none;
 scrollbar-width: none;
 width: 100%;
 min-width: 0;
 text-decoration-color: var(--n-text-decoration-color);
 color: var(--n-text-color);
 caret-color: var(--n-caret-color);
 background-color: transparent;
 `,[A("&::-webkit-scrollbar, &::-webkit-scrollbar-track-piece, &::-webkit-scrollbar-thumb",`
 width: 0;
 height: 0;
 display: none;
 `),A("&::placeholder",`
 color: #0000;
 -webkit-text-fill-color: transparent !important;
 `),A("&:-webkit-autofill ~",[i("placeholder","display: none;")])]),F("round",[L("textarea","border-radius: calc(var(--n-height) / 2);")]),i("placeholder",`
 pointer-events: none;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 overflow: hidden;
 color: var(--n-placeholder-color);
 `,[A("span",`
 width: 100%;
 display: inline-block;
 `)]),F("textarea",[i("placeholder","overflow: visible;")]),L("autosize","width: 100%;"),F("autosize",[i("textarea-el, input-el",`
 position: absolute;
 top: 0;
 left: 0;
 height: 100%;
 `)]),p("input-wrapper",`
 overflow: hidden;
 display: inline-flex;
 flex-grow: 1;
 position: relative;
 padding-left: var(--n-padding-left);
 padding-right: var(--n-padding-right);
 `),i("input-mirror",`
 padding: 0;
 height: var(--n-height);
 line-height: var(--n-height);
 overflow: hidden;
 visibility: hidden;
 position: static;
 white-space: pre;
 pointer-events: none;
 `),i("input-el",`
 padding: 0;
 height: var(--n-height);
 line-height: var(--n-height);
 `,[A("&[type=password]::-ms-reveal","display: none;"),A("+",[i("placeholder",`
 display: flex;
 align-items: center; 
 `)])]),L("textarea",[i("placeholder","white-space: nowrap;")]),i("eye",`
 display: flex;
 align-items: center;
 justify-content: center;
 transition: color .3s var(--n-bezier);
 `),F("textarea","width: 100%;",[p("input-word-count",`
 position: absolute;
 right: var(--n-padding-right);
 bottom: var(--n-padding-vertical);
 `),F("resizable",[p("input-wrapper",`
 resize: vertical;
 min-height: var(--n-height);
 `)]),i("textarea-el, textarea-mirror, placeholder",`
 height: 100%;
 padding-left: 0;
 padding-right: 0;
 padding-top: var(--n-padding-vertical);
 padding-bottom: var(--n-padding-vertical);
 word-break: break-word;
 display: inline-block;
 vertical-align: bottom;
 box-sizing: border-box;
 line-height: var(--n-line-height-textarea);
 margin: 0;
 resize: none;
 white-space: pre-wrap;
 scroll-padding-block-end: var(--n-padding-vertical);
 `),i("textarea-mirror",`
 width: 100%;
 pointer-events: none;
 overflow: hidden;
 visibility: hidden;
 position: static;
 white-space: pre-wrap;
 overflow-wrap: break-word;
 `)]),F("pair",[i("input-el, placeholder","text-align: center;"),i("separator",`
 display: flex;
 align-items: center;
 transition: color .3s var(--n-bezier);
 color: var(--n-text-color);
 white-space: nowrap;
 `,[p("icon",`
 color: var(--n-icon-color);
 `),p("base-icon",`
 color: var(--n-icon-color);
 `)])]),F("disabled",`
 cursor: not-allowed;
 background-color: var(--n-color-disabled);
 `,[i("border","border: var(--n-border-disabled);"),i("input-el, textarea-el",`
 cursor: not-allowed;
 color: var(--n-text-color-disabled);
 text-decoration-color: var(--n-text-color-disabled);
 `),i("placeholder","color: var(--n-placeholder-color-disabled);"),i("separator","color: var(--n-text-color-disabled);",[p("icon",`
 color: var(--n-icon-color-disabled);
 `),p("base-icon",`
 color: var(--n-icon-color-disabled);
 `)]),p("input-word-count",`
 color: var(--n-count-text-color-disabled);
 `),i("suffix, prefix","color: var(--n-text-color-disabled);",[p("icon",`
 color: var(--n-icon-color-disabled);
 `),p("internal-icon",`
 color: var(--n-icon-color-disabled);
 `)])]),L("disabled",[i("eye",`
 color: var(--n-icon-color);
 cursor: pointer;
 `,[A("&:hover",`
 color: var(--n-icon-color-hover);
 `),A("&:active",`
 color: var(--n-icon-color-pressed);
 `)]),A("&:hover",[i("state-border","border: var(--n-border-hover);")]),F("focus","background-color: var(--n-color-focus);",[i("state-border",`
 border: var(--n-border-focus);
 box-shadow: var(--n-box-shadow-focus);
 `)])]),i("border, state-border",`
 box-sizing: border-box;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 pointer-events: none;
 border-radius: inherit;
 border: var(--n-border);
 transition:
 box-shadow .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `),i("state-border",`
 border-color: #0000;
 z-index: 1;
 `),i("prefix","margin-right: 4px;"),i("suffix",`
 margin-left: 4px;
 `),i("suffix, prefix",`
 transition: color .3s var(--n-bezier);
 flex-wrap: nowrap;
 flex-shrink: 0;
 line-height: var(--n-height);
 white-space: nowrap;
 display: inline-flex;
 align-items: center;
 justify-content: center;
 color: var(--n-suffix-text-color);
 `,[p("base-loading",`
 font-size: var(--n-icon-size);
 margin: 0 2px;
 color: var(--n-loading-color);
 `),p("base-clear",`
 font-size: var(--n-icon-size);
 `,[i("placeholder",[p("base-icon",`
 transition: color .3s var(--n-bezier);
 color: var(--n-icon-color);
 font-size: var(--n-icon-size);
 `)])]),A(">",[p("icon",`
 transition: color .3s var(--n-bezier);
 color: var(--n-icon-color);
 font-size: var(--n-icon-size);
 `)]),p("base-icon",`
 font-size: var(--n-icon-size);
 `)]),p("input-word-count",`
 pointer-events: none;
 line-height: 1.5;
 font-size: .85em;
 color: var(--n-count-text-color);
 transition: color .3s var(--n-bezier);
 margin-left: 4px;
 font-variant: tabular-nums;
 `),["warning","error"].map(n=>F(`${n}-status`,[L("disabled",[p("base-loading",`
 color: var(--n-loading-color-${n})
 `),i("input-el, textarea-el",`
 caret-color: var(--n-caret-color-${n});
 `),i("state-border",`
 border: var(--n-border-${n});
 `),A("&:hover",[i("state-border",`
 border: var(--n-border-hover-${n});
 `)]),A("&:focus",`
 background-color: var(--n-color-focus-${n});
 `,[i("state-border",`
 box-shadow: var(--n-box-shadow-focus-${n});
 border: var(--n-border-focus-${n});
 `)]),F("focus",`
 background-color: var(--n-color-focus-${n});
 `,[i("state-border",`
 box-shadow: var(--n-box-shadow-focus-${n});
 border: var(--n-border-focus-${n});
 `)])])]))]),Pn=p("input",[F("disabled",[i("input-el, textarea-el",`
 -webkit-text-fill-color: var(--n-text-color-disabled);
 `)])]);function En(n){let g=0;for(const _ of n)g++;return g}function ee(n){return n===""||n==null}function In(n){const g=m(null);function _(){const{value:b}=n;if(!(b!=null&&b.focus)){R();return}const{selectionStart:x,selectionEnd:r,value:s}=b;if(x==null||r==null){R();return}g.value={start:x,end:r,beforeText:s.slice(0,x),afterText:s.slice(r)}}function B(){var b;const{value:x}=g,{value:r}=n;if(!x||!r)return;const{value:s}=r,{start:E,beforeText:S,afterText:v}=x;let y=s.length;if(s.endsWith(v))y=s.length-v.length;else if(s.startsWith(S))y=S.length;else{const h=S[E-1],l=s.indexOf(h,E-1);l!==-1&&(y=l+1)}(b=r.setSelectionRange)===null||b===void 0||b.call(r,y,y)}function R(){g.value=null}return he(n,R),{recordCursor:_,restoreCursor:B}}const Re=oe({name:"InputWordCount",setup(n,{slots:g}){const{mergedValueRef:_,maxlengthRef:B,mergedClsPrefixRef:R,countGraphemesRef:b}=un(Be),x=P(()=>{const{value:r}=_;return r===null||Array.isArray(r)?0:(b.value||En)(r)});return()=>{const{value:r}=B,{value:s}=_;return a("span",{class:`${R.value}-input-word-count`},cn(g.default,{value:s===null||Array.isArray(s)?"":s},()=>[r===void 0?x.value:`${x.value} / ${r}`]))}}}),Tn=Object.assign(Object.assign({},Fe.props),{bordered:{type:Boolean,default:void 0},type:{type:String,default:"text"},placeholder:[Array,String],defaultValue:{type:[String,Array],default:null},value:[String,Array],disabled:{type:Boolean,default:void 0},size:String,rows:{type:[Number,String],default:3},round:Boolean,minlength:[String,Number],maxlength:[String,Number],clearable:Boolean,autosize:{type:[Boolean,Object],default:!1},pair:Boolean,separator:String,readonly:{type:[String,Boolean],default:!1},passivelyActivated:Boolean,showPasswordOn:String,stateful:{type:Boolean,default:!0},autofocus:Boolean,inputProps:Object,resizable:{type:Boolean,default:!0},showCount:Boolean,loading:{type:Boolean,default:void 0},allowInput:Function,renderCount:Function,onMousedown:Function,onKeydown:Function,onKeyup:[Function,Array],onInput:[Function,Array],onFocus:[Function,Array],onBlur:[Function,Array],onClick:[Function,Array],onChange:[Function,Array],onClear:[Function,Array],countGraphemes:Function,status:String,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],textDecoration:[String,Array],attrSize:{type:Number,default:20},onInputBlur:[Function,Array],onInputFocus:[Function,Array],onDeactivate:[Function,Array],onActivate:[Function,Array],onWrapperFocus:[Function,Array],onWrapperBlur:[Function,Array],internalDeactivateOnEnter:Boolean,internalForceFocus:Boolean,internalLoadingBeforeSuffix:{type:Boolean,default:!0},showPasswordToggle:Boolean}),Wn=oe({name:"Input",props:Tn,slots:Object,setup(n){const{mergedClsPrefixRef:g,mergedBorderedRef:_,inlineThemeDisabled:B,mergedRtlRef:R,mergedComponentPropsRef:b}=vn(n),x=Fe("Input","-input",$n,Cn,n,g);pn&&gn("-input-safari",Pn,g);const r=m(null),s=m(null),E=m(null),S=m(null),v=m(null),y=m(null),h=m(null),l=In(h),c=m(null),{localeRef:C}=An("Input"),z=m(n.defaultValue),ne=Ae(n,"value"),$=Rn(ne,z),O=bn(n,{mergedSize:e=>{var o,t;const{size:d}=n;if(d)return d;const{mergedSize:f}=e||{};if(f!=null&&f.value)return f.value;const u=(t=(o=b==null?void 0:b.value)===null||o===void 0?void 0:o.Input)===null||t===void 0?void 0:t.size;return u||"medium"}}),{mergedSizeRef:re,mergedDisabledRef:V,mergedStatusRef:$e}=O,W=m(!1),N=m(!1),I=m(!1),H=m(!1);let te=null;const ae=P(()=>{const{placeholder:e,pair:o}=n;return o?Array.isArray(e)?e:e===void 0?["",""]:[e,e]:e===void 0?[C.value.placeholder]:[e]}),Pe=P(()=>{const{value:e}=I,{value:o}=$,{value:t}=ae;return!e&&(ee(o)||Array.isArray(o)&&ee(o[0]))&&t[0]}),Ee=P(()=>{const{value:e}=I,{value:o}=$,{value:t}=ae;return!e&&t[1]&&(ee(o)||Array.isArray(o)&&ee(o[1]))}),ie=xe(()=>n.internalForceFocus||W.value),Ie=xe(()=>{if(V.value||n.readonly||!n.clearable||!ie.value&&!N.value)return!1;const{value:e}=$,{value:o}=ie;return n.pair?!!(Array.isArray(e)&&(e[0]||e[1]))&&(N.value||o):!!e&&(N.value||o)}),le=P(()=>{const{showPasswordOn:e}=n;if(e)return e;if(n.showPasswordToggle)return"click"}),K=m(!1),Te=P(()=>{const{textDecoration:e}=n;return e?Array.isArray(e)?e.map(o=>({textDecoration:o})):[{textDecoration:e}]:["",""]}),ve=m(void 0),ke=()=>{var e,o;if(n.type==="textarea"){const{autosize:t}=n;if(t&&(ve.value=(o=(e=c.value)===null||e===void 0?void 0:e.$el)===null||o===void 0?void 0:o.offsetWidth),!s.value||typeof t=="boolean")return;const{paddingTop:d,paddingBottom:f,lineHeight:u}=window.getComputedStyle(s.value),T=Number(d.slice(0,-2)),k=Number(f.slice(0,-2)),M=Number(u.slice(0,-2)),{value:j}=E;if(!j)return;if(t.minRows){const U=Math.max(t.minRows,1),ce=`${T+k+M*U}px`;j.style.minHeight=ce}if(t.maxRows){const U=`${T+k+M*t.maxRows}px`;j.style.maxHeight=U}}},Me=P(()=>{const{maxlength:e}=n;return e===void 0?void 0:Number(e)});mn(()=>{const{value:e}=$;Array.isArray(e)||ue(e)});const Ve=xn().proxy;function G(e,o){const{onUpdateValue:t,"onUpdate:value":d,onInput:f}=n,{nTriggerFormInput:u}=O;t&&w(t,e,o),d&&w(d,e,o),f&&w(f,e,o),z.value=e,u()}function X(e,o){const{onChange:t}=n,{nTriggerFormChange:d}=O;t&&w(t,e,o),z.value=e,d()}function We(e){const{onBlur:o}=n,{nTriggerFormBlur:t}=O;o&&w(o,e),t()}function De(e){const{onFocus:o}=n,{nTriggerFormFocus:t}=O;o&&w(o,e),t()}function Oe(e){const{onClear:o}=n;o&&w(o,e)}function Ne(e){const{onInputBlur:o}=n;o&&w(o,e)}function He(e){const{onInputFocus:o}=n;o&&w(o,e)}function Ke(){const{onDeactivate:e}=n;e&&w(e)}function je(){const{onActivate:e}=n;e&&w(e)}function Ue(e){const{onClick:o}=n;o&&w(o,e)}function Le(e){const{onWrapperFocus:o}=n;o&&w(o,e)}function Ge(e){const{onWrapperBlur:o}=n;o&&w(o,e)}function Xe(){I.value=!0}function Ye(e){I.value=!1,e.target===y.value?Y(e,1):Y(e,0)}function Y(e,o=0,t="input"){const d=e.target.value;if(ue(d),e instanceof InputEvent&&!e.isComposing&&(I.value=!1),n.type==="textarea"){const{value:u}=c;u&&u.syncUnifiedContainer()}if(te=d,I.value)return;l.recordCursor();const f=qe(d);if(f)if(!n.pair)t==="input"?G(d,{source:o}):X(d,{source:o});else{let{value:u}=$;Array.isArray(u)?u=[u[0],u[1]]:u=["",""],u[o]=d,t==="input"?G(u,{source:o}):X(u,{source:o})}Ve.$forceUpdate(),f||Ce(l.restoreCursor)}function qe(e){const{countGraphemes:o,maxlength:t,minlength:d}=n;if(o){let u;if(t!==void 0&&(u===void 0&&(u=o(e)),u>Number(t))||d!==void 0&&(u===void 0&&(u=o(e)),u<Number(t)))return!1}const{allowInput:f}=n;return typeof f=="function"?f(e):!0}function Je(e){Ne(e),e.relatedTarget===r.value&&Ke(),e.relatedTarget!==null&&(e.relatedTarget===v.value||e.relatedTarget===y.value||e.relatedTarget===s.value)||(H.value=!1),q(e,"blur"),h.value=null}function Qe(e,o){He(e),W.value=!0,H.value=!0,je(),q(e,"focus"),o===0?h.value=v.value:o===1?h.value=y.value:o===2&&(h.value=s.value)}function Ze(e){n.passivelyActivated&&(Ge(e),q(e,"blur"))}function eo(e){n.passivelyActivated&&(W.value=!0,Le(e),q(e,"focus"))}function q(e,o){e.relatedTarget!==null&&(e.relatedTarget===v.value||e.relatedTarget===y.value||e.relatedTarget===s.value||e.relatedTarget===r.value)||(o==="focus"?(De(e),W.value=!0):o==="blur"&&(We(e),W.value=!1))}function oo(e,o){Y(e,o,"change")}function no(e){Ue(e)}function ro(e){Oe(e),pe()}function pe(){n.pair?(G(["",""],{source:"clear"}),X(["",""],{source:"clear"})):(G("",{source:"clear"}),X("",{source:"clear"}))}function to(e){const{onMousedown:o}=n;o&&o(e);const{tagName:t}=e.target;if(t!=="INPUT"&&t!=="TEXTAREA"){if(n.resizable){const{value:d}=r;if(d){const{left:f,top:u,width:T,height:k}=d.getBoundingClientRect(),M=14;if(f+T-M<e.clientX&&e.clientX<f+T&&u+k-M<e.clientY&&e.clientY<u+k)return}}e.preventDefault(),W.value||ge()}}function ao(){var e;N.value=!0,n.type==="textarea"&&((e=c.value)===null||e===void 0||e.handleMouseEnterWrapper())}function io(){var e;N.value=!1,n.type==="textarea"&&((e=c.value)===null||e===void 0||e.handleMouseLeaveWrapper())}function lo(){V.value||le.value==="click"&&(K.value=!K.value)}function so(e){if(V.value)return;e.preventDefault();const o=d=>{d.preventDefault(),Se("mouseup",document,o)};if(ze("mouseup",document,o),le.value!=="mousedown")return;K.value=!0;const t=()=>{K.value=!1,Se("mouseup",document,t)};ze("mouseup",document,t)}function uo(e){n.onKeyup&&w(n.onKeyup,e)}function co(e){switch(n.onKeydown&&w(n.onKeydown,e),e.key){case"Escape":se();break;case"Enter":fo(e);break}}function fo(e){var o,t;if(n.passivelyActivated){const{value:d}=H;if(d){n.internalDeactivateOnEnter&&se();return}e.preventDefault(),n.type==="textarea"?(o=s.value)===null||o===void 0||o.focus():(t=v.value)===null||t===void 0||t.focus()}}function se(){n.passivelyActivated&&(H.value=!1,Ce(()=>{var e;(e=r.value)===null||e===void 0||e.focus()}))}function ge(){var e,o,t;V.value||(n.passivelyActivated?(e=r.value)===null||e===void 0||e.focus():((o=s.value)===null||o===void 0||o.focus(),(t=v.value)===null||t===void 0||t.focus()))}function ho(){var e;!((e=r.value)===null||e===void 0)&&e.contains(document.activeElement)&&document.activeElement.blur()}function vo(){var e,o;(e=s.value)===null||e===void 0||e.select(),(o=v.value)===null||o===void 0||o.select()}function po(){V.value||(s.value?s.value.focus():v.value&&v.value.focus())}function go(){const{value:e}=r;e!=null&&e.contains(document.activeElement)&&e!==document.activeElement&&se()}function bo(e){if(n.type==="textarea"){const{value:o}=s;o==null||o.scrollTo(e)}else{const{value:o}=v;o==null||o.scrollTo(e)}}function ue(e){const{type:o,pair:t,autosize:d}=n;if(!t&&d)if(o==="textarea"){const{value:f}=E;f&&(f.textContent=`${e??""}\r
`)}else{const{value:f}=S;f&&(e?f.textContent=e:f.innerHTML="&nbsp;")}}function mo(){ke()}const be=m({top:"0"});function xo(e){var o;const{scrollTop:t}=e.target;be.value.top=`${-t}px`,(o=c.value)===null||o===void 0||o.syncUnifiedContainer()}let J=null;we(()=>{const{autosize:e,type:o}=n;e&&o==="textarea"?J=he($,t=>{!Array.isArray(t)&&t!==te&&ue(t)}):J==null||J()});let Q=null;we(()=>{n.type==="textarea"?Q=he($,e=>{var o;!Array.isArray(e)&&e!==te&&((o=c.value)===null||o===void 0||o.syncUnifiedContainer())}):Q==null||Q()}),Sn(Be,{mergedValueRef:$,maxlengthRef:Me,mergedClsPrefixRef:g,countGraphemesRef:Ae(n,"countGraphemes")});const wo={wrapperElRef:r,inputElRef:v,textareaElRef:s,isCompositing:I,clear:pe,focus:ge,blur:ho,select:vo,deactivate:go,activate:po,scrollTo:bo},yo=wn("Input",R,g),me=P(()=>{const{value:e}=re,{common:{cubicBezierEaseInOut:o},self:{color:t,borderRadius:d,textColor:f,caretColor:u,caretColorError:T,caretColorWarning:k,textDecorationColor:M,border:j,borderDisabled:U,borderHover:ce,borderFocus:Co,placeholderColor:zo,placeholderColorDisabled:So,lineHeightTextarea:Ao,colorDisabled:_o,colorFocus:Ro,textColorDisabled:Fo,boxShadowFocus:Bo,iconSize:$o,colorFocusWarning:Po,boxShadowFocusWarning:Eo,borderWarning:Io,borderFocusWarning:To,borderHoverWarning:ko,colorFocusError:Mo,boxShadowFocusError:Vo,borderError:Wo,borderFocusError:Do,borderHoverError:Oo,clearSize:No,clearColor:Ho,clearColorHover:Ko,clearColorPressed:jo,iconColor:Uo,iconColorDisabled:Lo,suffixTextColor:Go,countTextColor:Xo,countTextColorDisabled:Yo,iconColorHover:qo,iconColorPressed:Jo,loadingColor:Qo,loadingColorError:Zo,loadingColorWarning:en,fontWeight:on,[fe("padding",e)]:nn,[fe("fontSize",e)]:rn,[fe("height",e)]:tn}}=x.value,{left:an,right:ln}=zn(nn);return{"--n-bezier":o,"--n-count-text-color":Xo,"--n-count-text-color-disabled":Yo,"--n-color":t,"--n-font-size":rn,"--n-font-weight":on,"--n-border-radius":d,"--n-height":tn,"--n-padding-left":an,"--n-padding-right":ln,"--n-text-color":f,"--n-caret-color":u,"--n-text-decoration-color":M,"--n-border":j,"--n-border-disabled":U,"--n-border-hover":ce,"--n-border-focus":Co,"--n-placeholder-color":zo,"--n-placeholder-color-disabled":So,"--n-icon-size":$o,"--n-line-height-textarea":Ao,"--n-color-disabled":_o,"--n-color-focus":Ro,"--n-text-color-disabled":Fo,"--n-box-shadow-focus":Bo,"--n-loading-color":Qo,"--n-caret-color-warning":k,"--n-color-focus-warning":Po,"--n-box-shadow-focus-warning":Eo,"--n-border-warning":Io,"--n-border-focus-warning":To,"--n-border-hover-warning":ko,"--n-loading-color-warning":en,"--n-caret-color-error":T,"--n-color-focus-error":Mo,"--n-box-shadow-focus-error":Vo,"--n-border-error":Wo,"--n-border-focus-error":Do,"--n-border-hover-error":Oo,"--n-loading-color-error":Zo,"--n-clear-color":Ho,"--n-clear-size":No,"--n-clear-color-hover":Ko,"--n-clear-color-pressed":jo,"--n-icon-color":Uo,"--n-icon-color-hover":qo,"--n-icon-color-pressed":Jo,"--n-icon-color-disabled":Lo,"--n-suffix-text-color":Go}}),D=B?yn("input",P(()=>{const{value:e}=re;return e[0]}),me,n):void 0;return Object.assign(Object.assign({},wo),{wrapperElRef:r,inputElRef:v,inputMirrorElRef:S,inputEl2Ref:y,textareaElRef:s,textareaMirrorElRef:E,textareaScrollbarInstRef:c,rtlEnabled:yo,uncontrolledValue:z,mergedValue:$,passwordVisible:K,mergedPlaceholder:ae,showPlaceholder1:Pe,showPlaceholder2:Ee,mergedFocus:ie,isComposing:I,activated:H,showClearButton:Ie,mergedSize:re,mergedDisabled:V,textDecorationStyle:Te,mergedClsPrefix:g,mergedBordered:_,mergedShowPasswordOn:le,placeholderStyle:be,mergedStatus:$e,textAreaScrollContainerWidth:ve,handleTextAreaScroll:xo,handleCompositionStart:Xe,handleCompositionEnd:Ye,handleInput:Y,handleInputBlur:Je,handleInputFocus:Qe,handleWrapperBlur:Ze,handleWrapperFocus:eo,handleMouseEnter:ao,handleMouseLeave:io,handleMouseDown:to,handleChange:oo,handleClick:no,handleClear:ro,handlePasswordToggleClick:lo,handlePasswordToggleMousedown:so,handleWrapperKeydown:co,handleWrapperKeyup:uo,handleTextAreaMirrorResize:mo,getTextareaScrollContainer:()=>s.value,mergedTheme:x,cssVars:B?void 0:me,themeClass:D==null?void 0:D.themeClass,onRender:D==null?void 0:D.onRender})},render(){var n,g,_,B,R,b,x;const{mergedClsPrefix:r,mergedStatus:s,themeClass:E,type:S,countGraphemes:v,onRender:y}=this,h=this.$slots;return y==null||y(),a("div",{ref:"wrapperElRef",class:[`${r}-input`,`${r}-input--${this.mergedSize}-size`,E,s&&`${r}-input--${s}-status`,{[`${r}-input--rtl`]:this.rtlEnabled,[`${r}-input--disabled`]:this.mergedDisabled,[`${r}-input--textarea`]:S==="textarea",[`${r}-input--resizable`]:this.resizable&&!this.autosize,[`${r}-input--autosize`]:this.autosize,[`${r}-input--round`]:this.round&&S!=="textarea",[`${r}-input--pair`]:this.pair,[`${r}-input--focus`]:this.mergedFocus,[`${r}-input--stateful`]:this.stateful}],style:this.cssVars,tabindex:!this.mergedDisabled&&this.passivelyActivated&&!this.activated?0:void 0,onFocus:this.handleWrapperFocus,onBlur:this.handleWrapperBlur,onClick:this.handleClick,onMousedown:this.handleMouseDown,onMouseenter:this.handleMouseEnter,onMouseleave:this.handleMouseLeave,onCompositionstart:this.handleCompositionStart,onCompositionend:this.handleCompositionEnd,onKeyup:this.handleWrapperKeyup,onKeydown:this.handleWrapperKeydown},a("div",{class:`${r}-input-wrapper`},Z(h.prefix,l=>l&&a("div",{class:`${r}-input__prefix`},l)),S==="textarea"?a(dn,{ref:"textareaScrollbarInstRef",class:`${r}-input__textarea`,container:this.getTextareaScrollContainer,theme:(g=(n=this.theme)===null||n===void 0?void 0:n.peers)===null||g===void 0?void 0:g.Scrollbar,themeOverrides:(B=(_=this.themeOverrides)===null||_===void 0?void 0:_.peers)===null||B===void 0?void 0:B.Scrollbar,triggerDisplayManually:!0,useUnifiedContainer:!0,internalHoistYRail:!0},{default:()=>{var l,c;const{textAreaScrollContainerWidth:C}=this,z={width:this.autosize&&C&&`${C}px`};return a(fn,null,a("textarea",Object.assign({},this.inputProps,{ref:"textareaElRef",class:[`${r}-input__textarea-el`,(l=this.inputProps)===null||l===void 0?void 0:l.class],autofocus:this.autofocus,rows:Number(this.rows),placeholder:this.placeholder,value:this.mergedValue,disabled:this.mergedDisabled,maxlength:v?void 0:this.maxlength,minlength:v?void 0:this.minlength,readonly:this.readonly,tabindex:this.passivelyActivated&&!this.activated?-1:void 0,style:[this.textDecorationStyle[0],(c=this.inputProps)===null||c===void 0?void 0:c.style,z],onBlur:this.handleInputBlur,onFocus:ne=>{this.handleInputFocus(ne,2)},onInput:this.handleInput,onChange:this.handleChange,onScroll:this.handleTextAreaScroll})),this.showPlaceholder1?a("div",{class:`${r}-input__placeholder`,style:[this.placeholderStyle,z],key:"placeholder"},this.mergedPlaceholder[0]):null,this.autosize?a(hn,{onResize:this.handleTextAreaMirrorResize},{default:()=>a("div",{ref:"textareaMirrorElRef",class:`${r}-input__textarea-mirror`,key:"mirror"})}):null)}}):a("div",{class:`${r}-input__input`},a("input",Object.assign({type:S==="password"&&this.mergedShowPasswordOn&&this.passwordVisible?"text":S},this.inputProps,{ref:"inputElRef",class:[`${r}-input__input-el`,(R=this.inputProps)===null||R===void 0?void 0:R.class],style:[this.textDecorationStyle[0],(b=this.inputProps)===null||b===void 0?void 0:b.style],tabindex:this.passivelyActivated&&!this.activated?-1:(x=this.inputProps)===null||x===void 0?void 0:x.tabindex,placeholder:this.mergedPlaceholder[0],disabled:this.mergedDisabled,maxlength:v?void 0:this.maxlength,minlength:v?void 0:this.minlength,value:Array.isArray(this.mergedValue)?this.mergedValue[0]:this.mergedValue,readonly:this.readonly,autofocus:this.autofocus,size:this.attrSize,onBlur:this.handleInputBlur,onFocus:l=>{this.handleInputFocus(l,0)},onInput:l=>{this.handleInput(l,0)},onChange:l=>{this.handleChange(l,0)}})),this.showPlaceholder1?a("div",{class:`${r}-input__placeholder`},a("span",null,this.mergedPlaceholder[0])):null,this.autosize?a("div",{class:`${r}-input__input-mirror`,key:"mirror",ref:"inputMirrorElRef"}," "):null),!this.pair&&Z(h.suffix,l=>l||this.clearable||this.showCount||this.mergedShowPasswordOn||this.loading!==void 0?a("div",{class:`${r}-input__suffix`},[Z(h["clear-icon-placeholder"],c=>(this.clearable||c)&&a(_e,{clsPrefix:r,show:this.showClearButton,onClear:this.handleClear},{placeholder:()=>c,icon:()=>{var C,z;return(z=(C=this.$slots)["clear-icon"])===null||z===void 0?void 0:z.call(C)}})),this.internalLoadingBeforeSuffix?null:l,this.loading!==void 0?a(_n,{clsPrefix:r,loading:this.loading,showArrow:!1,showClear:!1,style:this.cssVars}):null,this.internalLoadingBeforeSuffix?l:null,this.showCount&&this.type!=="textarea"?a(Re,null,{default:c=>{var C;const{renderCount:z}=this;return z?z(c):(C=h.count)===null||C===void 0?void 0:C.call(h,c)}}):null,this.mergedShowPasswordOn&&this.type==="password"?a("div",{class:`${r}-input__eye`,onMousedown:this.handlePasswordToggleMousedown,onClick:this.handlePasswordToggleClick},this.passwordVisible?de(h["password-visible-icon"],()=>[a(ye,{clsPrefix:r},{default:()=>a(Fn,null)})]):de(h["password-invisible-icon"],()=>[a(ye,{clsPrefix:r},{default:()=>a(Bn,null)})])):null]):null)),this.pair?a("span",{class:`${r}-input__separator`},de(h.separator,()=>[this.separator])):null,this.pair?a("div",{class:`${r}-input-wrapper`},a("div",{class:`${r}-input__input`},a("input",{ref:"inputEl2Ref",type:this.type,class:`${r}-input__input-el`,tabindex:this.passivelyActivated&&!this.activated?-1:void 0,placeholder:this.mergedPlaceholder[1],disabled:this.mergedDisabled,maxlength:v?void 0:this.maxlength,minlength:v?void 0:this.minlength,value:Array.isArray(this.mergedValue)?this.mergedValue[1]:void 0,readonly:this.readonly,style:this.textDecorationStyle[1],onBlur:this.handleInputBlur,onFocus:l=>{this.handleInputFocus(l,1)},onInput:l=>{this.handleInput(l,1)},onChange:l=>{this.handleChange(l,1)}}),this.showPlaceholder2?a("div",{class:`${r}-input__placeholder`},a("span",null,this.mergedPlaceholder[1])):null),Z(h.suffix,l=>(this.clearable||l)&&a("div",{class:`${r}-input__suffix`},[this.clearable&&a(_e,{clsPrefix:r,show:this.showClearButton,onClear:this.handleClear},{icon:()=>{var c;return(c=h["clear-icon"])===null||c===void 0?void 0:c.call(h)},placeholder:()=>{var c;return(c=h["clear-icon-placeholder"])===null||c===void 0?void 0:c.call(h)}}),l]))):null,this.mergedBordered?a("div",{class:`${r}-input__border`}):null,this.mergedBordered?a("div",{class:`${r}-input__state-border`}):null,this.showCount&&S==="textarea"?a(Re,null,{default:l=>{var c;const{renderCount:C}=this;return C?C(l):(c=h.count)===null||c===void 0?void 0:c.call(h,l)}}):null)}});export{Wn as N};
