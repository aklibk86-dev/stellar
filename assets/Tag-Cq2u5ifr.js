import{ad as so,co as to,c6 as e,R as io,a3 as u,U as m,aK as I,S as z,d as ho,an as U,V as x,ca as go,W as bo,a4 as D,aq as Co,a5 as vo,r as uo,at as po,e as j,a7 as d,bR as fo,c4 as V,aI as ko,aN as mo,aw as xo}from"./stellar.js";function yo(a){const{textColor2:g,primaryColorHover:r,primaryColorPressed:p,primaryColor:c,infoColor:i,successColor:n,warningColor:s,errorColor:t,baseColor:f,borderColor:k,opacityDisabled:b,tagColor:S,closeIconColor:y,closeIconColorHover:v,closeIconColorPressed:o,borderRadiusSmall:l,fontSizeMini:C,fontSizeTiny:h,fontSizeSmall:B,fontSizeMedium:$,heightMini:H,heightTiny:R,heightSmall:M,heightMedium:T,closeColorHover:_,closeColorPressed:E,buttonColor2Hover:W,buttonColor2Pressed:w,fontWeightStrong:O}=a;return Object.assign(Object.assign({},to),{closeBorderRadius:l,heightTiny:H,heightSmall:R,heightMedium:M,heightLarge:T,borderRadius:l,opacityDisabled:b,fontSizeTiny:C,fontSizeSmall:h,fontSizeMedium:B,fontSizeLarge:$,fontWeightStrong:O,textColorCheckable:g,textColorHoverCheckable:g,textColorPressedCheckable:g,textColorChecked:f,colorCheckable:"#0000",colorHoverCheckable:W,colorPressedCheckable:w,colorChecked:c,colorCheckedHover:r,colorCheckedPressed:p,border:`1px solid ${k}`,textColor:g,color:S,colorBordered:"rgb(250, 250, 252)",closeIconColor:y,closeIconColorHover:v,closeIconColorPressed:o,closeColorHover:_,closeColorPressed:E,borderPrimary:`1px solid ${e(c,{alpha:.3})}`,textColorPrimary:c,colorPrimary:e(c,{alpha:.12}),colorBorderedPrimary:e(c,{alpha:.1}),closeIconColorPrimary:c,closeIconColorHoverPrimary:c,closeIconColorPressedPrimary:c,closeColorHoverPrimary:e(c,{alpha:.12}),closeColorPressedPrimary:e(c,{alpha:.18}),borderInfo:`1px solid ${e(i,{alpha:.3})}`,textColorInfo:i,colorInfo:e(i,{alpha:.12}),colorBorderedInfo:e(i,{alpha:.1}),closeIconColorInfo:i,closeIconColorHoverInfo:i,closeIconColorPressedInfo:i,closeColorHoverInfo:e(i,{alpha:.12}),closeColorPressedInfo:e(i,{alpha:.18}),borderSuccess:`1px solid ${e(n,{alpha:.3})}`,textColorSuccess:n,colorSuccess:e(n,{alpha:.12}),colorBorderedSuccess:e(n,{alpha:.1}),closeIconColorSuccess:n,closeIconColorHoverSuccess:n,closeIconColorPressedSuccess:n,closeColorHoverSuccess:e(n,{alpha:.12}),closeColorPressedSuccess:e(n,{alpha:.18}),borderWarning:`1px solid ${e(s,{alpha:.35})}`,textColorWarning:s,colorWarning:e(s,{alpha:.15}),colorBorderedWarning:e(s,{alpha:.12}),closeIconColorWarning:s,closeIconColorHoverWarning:s,closeIconColorPressedWarning:s,closeColorHoverWarning:e(s,{alpha:.12}),closeColorPressedWarning:e(s,{alpha:.18}),borderError:`1px solid ${e(t,{alpha:.23})}`,textColorError:t,colorError:e(t,{alpha:.1}),colorBorderedError:e(t,{alpha:.08}),closeIconColorError:t,closeIconColorHoverError:t,closeIconColorPressedError:t,closeColorHoverError:e(t,{alpha:.12}),closeColorPressedError:e(t,{alpha:.18})})}const Po={common:so,self:yo},Io={color:Object,type:{type:String,default:"default"},round:Boolean,size:String,closable:Boolean,disabled:{type:Boolean,default:void 0}},zo=io("tag",`
 --n-close-margin: var(--n-close-margin-top) var(--n-close-margin-right) var(--n-close-margin-bottom) var(--n-close-margin-left);
 white-space: nowrap;
 position: relative;
 box-sizing: border-box;
 cursor: default;
 display: inline-flex;
 align-items: center;
 flex-wrap: nowrap;
 padding: var(--n-padding);
 border-radius: var(--n-border-radius);
 color: var(--n-text-color);
 background-color: var(--n-color);
 transition: 
 border-color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 opacity .3s var(--n-bezier);
 line-height: 1;
 height: var(--n-height);
 font-size: var(--n-font-size);
`,[u("strong",`
 font-weight: var(--n-font-weight-strong);
 `),m("border",`
 pointer-events: none;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border-radius: inherit;
 border: var(--n-border);
 transition: border-color .3s var(--n-bezier);
 `),m("icon",`
 display: flex;
 margin: 0 4px 0 0;
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 font-size: var(--n-avatar-size-override);
 `),m("avatar",`
 display: flex;
 margin: 0 6px 0 0;
 `),m("close",`
 margin: var(--n-close-margin);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),u("round",`
 padding: 0 calc(var(--n-height) / 3);
 border-radius: calc(var(--n-height) / 2);
 `,[m("icon",`
 margin: 0 4px 0 calc((var(--n-height) - 8px) / -2);
 `),m("avatar",`
 margin: 0 6px 0 calc((var(--n-height) - 8px) / -2);
 `),u("closable",`
 padding: 0 calc(var(--n-height) / 4) 0 calc(var(--n-height) / 3);
 `)]),u("icon, avatar",[u("round",`
 padding: 0 calc(var(--n-height) / 3) 0 calc(var(--n-height) / 2);
 `)]),u("disabled",`
 cursor: not-allowed !important;
 opacity: var(--n-opacity-disabled);
 `),u("checkable",`
 cursor: pointer;
 box-shadow: none;
 color: var(--n-text-color-checkable);
 background-color: var(--n-color-checkable);
 `,[I("disabled",[z("&:hover","background-color: var(--n-color-hover-checkable);",[I("checked","color: var(--n-text-color-hover-checkable);")]),z("&:active","background-color: var(--n-color-pressed-checkable);",[I("checked","color: var(--n-text-color-pressed-checkable);")])]),u("checked",`
 color: var(--n-text-color-checked);
 background-color: var(--n-color-checked);
 `,[I("disabled",[z("&:hover","background-color: var(--n-color-checked-hover);"),z("&:active","background-color: var(--n-color-checked-pressed);")])])])]),So=Object.assign(Object.assign(Object.assign({},D.props),Io),{bordered:{type:Boolean,default:void 0},checked:Boolean,checkable:Boolean,strong:Boolean,triggerClickOnClose:Boolean,onClose:[Array,Function],onMouseenter:Function,onMouseleave:Function,"onUpdate:checked":Function,onUpdateChecked:Function,internalCloseFocusable:{type:Boolean,default:!0},internalCloseIsButtonTag:{type:Boolean,default:!0},onCheckedChange:Function}),Bo=ko("n-tag"),Ho=ho({name:"Tag",props:So,slots:Object,setup(a){const g=uo(null),{mergedBorderedRef:r,mergedClsPrefixRef:p,inlineThemeDisabled:c,mergedRtlRef:i,mergedComponentPropsRef:n}=bo(a),s=j(()=>{var o,l;return a.size||((l=(o=n==null?void 0:n.value)===null||o===void 0?void 0:o.Tag)===null||l===void 0?void 0:l.size)||"medium"}),t=D("Tag","-tag",zo,Po,a,p);mo(Bo,{roundRef:xo(a,"round")});function f(){if(!a.disabled&&a.checkable){const{checked:o,onCheckedChange:l,onUpdateChecked:C,"onUpdate:checked":h}=a;C&&C(!o),h&&h(!o),l&&l(!o)}}function k(o){if(a.triggerClickOnClose||o.stopPropagation(),!a.disabled){const{onClose:l}=a;l&&po(l,o)}}const b={setTextContent(o){const{value:l}=g;l&&(l.textContent=o)}},S=Co("Tag",i,p),y=j(()=>{const{type:o,color:{color:l,textColor:C}={}}=a,h=s.value,{common:{cubicBezierEaseInOut:B},self:{padding:$,closeMargin:H,borderRadius:R,opacityDisabled:M,textColorCheckable:T,textColorHoverCheckable:_,textColorPressedCheckable:E,textColorChecked:W,colorCheckable:w,colorHoverCheckable:O,colorPressedCheckable:K,colorChecked:L,colorCheckedHover:q,colorCheckedPressed:A,closeBorderRadius:G,fontWeightStrong:J,[d("colorBordered",o)]:Q,[d("closeSize",h)]:X,[d("closeIconSize",h)]:Y,[d("fontSize",h)]:Z,[d("height",h)]:F,[d("color",o)]:oo,[d("textColor",o)]:eo,[d("border",o)]:ro,[d("closeIconColor",o)]:N,[d("closeIconColorHover",o)]:lo,[d("closeIconColorPressed",o)]:ao,[d("closeColorHover",o)]:co,[d("closeColorPressed",o)]:no}}=t.value,P=fo(H);return{"--n-font-weight-strong":J,"--n-avatar-size-override":`calc(${F} - 8px)`,"--n-bezier":B,"--n-border-radius":R,"--n-border":ro,"--n-close-icon-size":Y,"--n-close-color-pressed":no,"--n-close-color-hover":co,"--n-close-border-radius":G,"--n-close-icon-color":N,"--n-close-icon-color-hover":lo,"--n-close-icon-color-pressed":ao,"--n-close-icon-color-disabled":N,"--n-close-margin-top":P.top,"--n-close-margin-right":P.right,"--n-close-margin-bottom":P.bottom,"--n-close-margin-left":P.left,"--n-close-size":X,"--n-color":l||(r.value?Q:oo),"--n-color-checkable":w,"--n-color-checked":L,"--n-color-checked-hover":q,"--n-color-checked-pressed":A,"--n-color-hover-checkable":O,"--n-color-pressed-checkable":K,"--n-font-size":Z,"--n-height":F,"--n-opacity-disabled":M,"--n-padding":$,"--n-text-color":C||eo,"--n-text-color-checkable":T,"--n-text-color-checked":W,"--n-text-color-hover-checkable":_,"--n-text-color-pressed-checkable":E}}),v=c?vo("tag",j(()=>{let o="";const{type:l,color:{color:C,textColor:h}={}}=a;return o+=l[0],o+=s.value[0],C&&(o+=`a${V(C)}`),h&&(o+=`b${V(h)}`),r.value&&(o+="c"),o}),y,a):void 0;return Object.assign(Object.assign({},b),{rtlEnabled:S,mergedClsPrefix:p,contentRef:g,mergedBordered:r,handleClick:f,handleCloseClick:k,cssVars:c?void 0:y,themeClass:v==null?void 0:v.themeClass,onRender:v==null?void 0:v.onRender})},render(){var a,g;const{mergedClsPrefix:r,rtlEnabled:p,closable:c,color:{borderColor:i}={},round:n,onRender:s,$slots:t}=this;s==null||s();const f=U(t.avatar,b=>b&&x("div",{class:`${r}-tag__avatar`},b)),k=U(t.icon,b=>b&&x("div",{class:`${r}-tag__icon`},b));return x("div",{class:[`${r}-tag`,this.themeClass,{[`${r}-tag--rtl`]:p,[`${r}-tag--strong`]:this.strong,[`${r}-tag--disabled`]:this.disabled,[`${r}-tag--checkable`]:this.checkable,[`${r}-tag--checked`]:this.checkable&&this.checked,[`${r}-tag--round`]:n,[`${r}-tag--avatar`]:f,[`${r}-tag--icon`]:k,[`${r}-tag--closable`]:c}],style:this.cssVars,onClick:this.handleClick,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},k||f,x("span",{class:`${r}-tag__content`,ref:"contentRef"},(g=(a=this.$slots).default)===null||g===void 0?void 0:g.call(a)),!this.checkable&&c?x(go,{clsPrefix:r,class:`${r}-tag__close`,disabled:this.disabled,onClick:this.handleCloseClick,focusable:this.internalCloseFocusable,round:n,isButtonTag:this.internalCloseIsButtonTag,absolute:!0}):null,!this.checkable&&this.mergedBordered?x("div",{class:`${r}-tag__border`,style:{borderColor:i}}):null)}});export{Ho as N,Bo as t};
