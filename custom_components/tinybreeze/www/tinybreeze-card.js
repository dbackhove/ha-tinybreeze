/* Tinybreeze card -- built from frontend/src, do not edit by hand. */
"use strict";(()=>{var I=globalThis,D=I.ShadowRoot&&(I.ShadyCSS===void 0||I.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol(),ae=new WeakMap,T=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==K)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(D&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=ae.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&ae.set(t,e))}return e}toString(){return this.cssText}},le=s=>new T(typeof s=="string"?s:s+"",void 0,K),V=(s,...e)=>{let t=s.length===1?s[0]:e.reduce((i,n,o)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+s[o+1],s[0]);return new T(t,s,K)},he=(s,e)=>{if(D)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let i=document.createElement("style"),n=I.litNonce;n!==void 0&&i.setAttribute("nonce",n),i.textContent=t.cssText,s.appendChild(i)}},q=D?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return le(t)})(s):s;var{is:Oe,defineProperty:Le,getOwnPropertyDescriptor:Ie,getOwnPropertyNames:De,getOwnPropertySymbols:je,getPrototypeOf:We}=Object,v=globalThis,ce=v.trustedTypes,Fe=ce?ce.emptyScript:"",G=v.reactiveElementPolyfillSupport,z=(s,e)=>s,J={toAttribute(s,e){switch(e){case Boolean:s=s?Fe:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},de=(s,e)=>!Oe(s,e),ue={attribute:!0,type:String,converter:J,reflect:!1,useDefault:!1,hasChanged:de};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),v.litPropertyMetadata??(v.litPropertyMetadata=new WeakMap);var _=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ue){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let i=Symbol(),n=this.getPropertyDescriptor(e,i,t);n!==void 0&&Le(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){let{get:n,set:o}=Ie(this.prototype,e)??{get(){return this[t]},set(r){this[t]=r}};return{get:n,set(r){let l=n==null?void 0:n.call(this);o==null||o.call(this,r),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ue}static _$Ei(){if(this.hasOwnProperty(z("elementProperties")))return;let e=We(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(z("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(z("properties"))){let t=this.properties,i=[...De(t),...je(t)];for(let n of i)this.createProperty(n,t[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,n]of t)this.elementProperties.set(i,n)}this._$Eh=new Map;for(let[t,i]of this.elementProperties){let n=this._$Eu(t,i);n!==void 0&&this._$Eh.set(n,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let n of i)t.unshift(q(n))}else e!==void 0&&t.push(q(e));return t}static _$Eu(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return he(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostConnected)==null?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostDisconnected)==null?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){var o;let i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(n!==void 0&&i.reflect===!0){let r=(((o=i.converter)==null?void 0:o.toAttribute)!==void 0?i.converter:J).toAttribute(t,i.type);this._$Em=e,r==null?this.removeAttribute(n):this.setAttribute(n,r),this._$Em=null}}_$AK(e,t){var o,r;let i=this.constructor,n=i._$Eh.get(e);if(n!==void 0&&this._$Em!==n){let l=i.getPropertyOptions(n),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((o=l.converter)==null?void 0:o.fromAttribute)!==void 0?l.converter:J;this._$Em=n;let c=a.fromAttribute(t,l.type);this[n]=c??((r=this._$Ej)==null?void 0:r.get(n))??c,this._$Em=null}}requestUpdate(e,t,i,n=!1,o){var r;if(e!==void 0){let l=this.constructor;if(n===!1&&(o=this[e]),i??(i=l.getPropertyOptions(e)),!((i.hasChanged??de)(o,t)||i.useDefault&&i.reflect&&o===((r=this._$Ej)==null?void 0:r.get(e))&&!this.hasAttribute(l._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:o},r){i&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,r??t??this[e]),o!==!0||r!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),n===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[o,r]of this._$Ep)this[o]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[o,r]of n){let{wrapped:l}=r,a=this[o];l!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,r,a)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(i=this._$EO)==null||i.forEach(n=>{var o;return(o=n.hostUpdate)==null?void 0:o.call(n)}),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(i=>{var n;return(n=i.hostUpdated)==null?void 0:n.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[z("elementProperties")]=new Map,_[z("finalized")]=new Map,G==null||G({ReactiveElement:_}),(v.reactiveElementVersions??(v.reactiveElementVersions=[])).push("2.1.2");var N=globalThis,pe=s=>s,j=N.trustedTypes,ge=j?j.createPolicy("lit-html",{createHTML:s=>s}):void 0,be="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,$e="?"+b,Be=`<${$e}>`,S=document,U=()=>S.createComment(""),H=s=>s===null||typeof s!="object"&&typeof s!="function",ne=Array.isArray,Ke=s=>ne(s)||typeof(s==null?void 0:s[Symbol.iterator])=="function",Z=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,me=/-->/g,fe=/>/g,$=RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),_e=/'/g,ye=/"/g,we=/^(?:script|style|textarea|title)$/i,se=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),d=se(1),lt=se(2),ht=se(3),x=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),ve=new WeakMap,w=S.createTreeWalker(S,129);function Se(s,e){if(!ne(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return ge!==void 0?ge.createHTML(e):e}var Ve=(s,e)=>{let t=s.length-1,i=[],n,o=e===2?"<svg>":e===3?"<math>":"",r=R;for(let l=0;l<t;l++){let a=s[l],c,g,u=-1,f=0;for(;f<a.length&&(r.lastIndex=f,g=r.exec(a),g!==null);)f=r.lastIndex,r===R?g[1]==="!--"?r=me:g[1]!==void 0?r=fe:g[2]!==void 0?(we.test(g[2])&&(n=RegExp("</"+g[2],"g")),r=$):g[3]!==void 0&&(r=$):r===$?g[0]===">"?(r=n??R,u=-1):g[1]===void 0?u=-2:(u=r.lastIndex-g[2].length,c=g[1],r=g[3]===void 0?$:g[3]==='"'?ye:_e):r===ye||r===_e?r=$:r===me||r===fe?r=R:(r=$,n=void 0);let y=r===$&&s[l+1].startsWith("/>")?" ":"";o+=r===R?a+Be:u>=0?(i.push(c),a.slice(0,u)+be+a.slice(u)+b+y):a+b+(u===-2?l:y)}return[Se(s,o+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},M=class s{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let o=0,r=0,l=e.length-1,a=this.parts,[c,g]=Ve(e,t);if(this.el=s.createElement(c,i),w.currentNode=this.el.content,t===2||t===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(n=w.nextNode())!==null&&a.length<l;){if(n.nodeType===1){if(n.hasAttributes())for(let u of n.getAttributeNames())if(u.endsWith(be)){let f=g[r++],y=n.getAttribute(u).split(b),L=/([.?@])?(.*)/.exec(f);a.push({type:1,index:o,name:L[2],strings:y,ctor:L[1]==="."?X:L[1]==="?"?ee:L[1]==="@"?te:E}),n.removeAttribute(u)}else u.startsWith(b)&&(a.push({type:6,index:o}),n.removeAttribute(u));if(we.test(n.tagName)){let u=n.textContent.split(b),f=u.length-1;if(f>0){n.textContent=j?j.emptyScript:"";for(let y=0;y<f;y++)n.append(u[y],U()),w.nextNode(),a.push({type:2,index:++o});n.append(u[f],U())}}}else if(n.nodeType===8)if(n.data===$e)a.push({type:2,index:o});else{let u=-1;for(;(u=n.data.indexOf(b,u+1))!==-1;)a.push({type:7,index:o}),u+=b.length-1}o++}}static createElement(e,t){let i=S.createElement("template");return i.innerHTML=e,i}};function k(s,e,t=s,i){var r,l;if(e===x)return e;let n=i!==void 0?(r=t._$Co)==null?void 0:r[i]:t._$Cl,o=H(e)?void 0:e._$litDirective$;return(n==null?void 0:n.constructor)!==o&&((l=n==null?void 0:n._$AO)==null||l.call(n,!1),o===void 0?n=void 0:(n=new o(s),n._$AT(s,t,i)),i!==void 0?(t._$Co??(t._$Co=[]))[i]=n:t._$Cl=n),n!==void 0&&(e=k(s,n._$AS(s,e.values),n,i)),e}var Q=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:i}=this._$AD,n=((e==null?void 0:e.creationScope)??S).importNode(t,!0);w.currentNode=n;let o=w.nextNode(),r=0,l=0,a=i[0];for(;a!==void 0;){if(r===a.index){let c;a.type===2?c=new P(o,o.nextSibling,this,e):a.type===1?c=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(c=new ie(o,this,e)),this._$AV.push(c),a=i[++l]}r!==(a==null?void 0:a.index)&&(o=w.nextNode(),r++)}return w.currentNode=S,n}p(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},P=class s{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=(n==null?void 0:n.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=k(this,e,t),H(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==x&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ke(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&H(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){var o;let{values:t,_$litType$:i}=e,n=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=M.createElement(Se(i.h,i.h[0]),this.options)),i);if(((o=this._$AH)==null?void 0:o._$AD)===n)this._$AH.p(t);else{let r=new Q(n,this),l=r.u(this.options);r.p(t),this.T(l),this._$AH=r}}_$AC(e){let t=ve.get(e.strings);return t===void 0&&ve.set(e.strings,t=new M(e)),t}k(e){ne(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,n=0;for(let o of e)n===t.length?t.push(i=new s(this.O(U()),this.O(U()),this,this.options)):i=t[n],i._$AI(o),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,t);e!==this._$AB;){let n=pe(e).nextSibling;pe(e).remove(),e=n}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}},E=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,o){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=h}_$AI(e,t=this,i,n){let o=this.strings,r=!1;if(o===void 0)e=k(this,e,t,0),r=!H(e)||e!==this._$AH&&e!==x,r&&(this._$AH=e);else{let l=e,a,c;for(e=o[0],a=0;a<o.length-1;a++)c=k(this,l[i+a],t,a),c===x&&(c=this._$AH[a]),r||(r=!H(c)||c!==this._$AH[a]),c===h?e=h:e!==h&&(e+=(c??"")+o[a+1]),this._$AH[a]=c}r&&!n&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},X=class extends E{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}},ee=class extends E{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}},te=class extends E{constructor(e,t,i,n,o){super(e,t,i,n,o),this.type=5}_$AI(e,t=this){if((e=k(this,e,t,0)??h)===x)return;let i=this._$AH,n=e===h&&i!==h||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==h&&(i===h||n);n&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}},ie=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){k(this,e)}};var Y=N.litHtmlPolyfillSupport;Y==null||Y(M,P),(N.litHtmlVersions??(N.litHtmlVersions=[])).push("3.3.3");var xe=(s,e,t)=>{let i=(t==null?void 0:t.renderBefore)??e,n=i._$litPart$;if(n===void 0){let o=(t==null?void 0:t.renderBefore)??null;i._$litPart$=n=new P(e.insertBefore(U(),o),o,void 0,t??{})}return n._$AI(s),n};var A=globalThis,m=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;let e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=xe(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return x}},Ae;m._$litElement$=!0,m.finalized=!0,(Ae=A.litElementHydrateSupport)==null||Ae.call(A,{LitElement:m});var re=A.litElementPolyfillSupport;re==null||re({LitElement:m});(A.litElementVersions??(A.litElementVersions=[])).push("4.2.2");var C=["kinderwagen","babytrage","auto","schlafen","zuhause","allgemein"];var qe={item:{short_sleeve_body:"Short-sleeve bodysuit",long_sleeve_body:"Long-sleeve bodysuit",light_long_suit:"Lightweight long-sleeve sun suit (UPF 30+)",light_trousers:"Thin long trousers",trousers:"Light trousers",romper:"Romper",sweater:"Sweater",vest:"Thin vest or light cardigan",light_jacket:"Light jacket",fleece_jacket:"Fleece or boiled-wool jacket",fleece_suit:"Fleece suit",winter_jacket:"Winter jacket or boiled-wool overall",winter_suit:"Snowsuit",pyjamas:"Pyjamas",diaper_only:"Diaper only",sun_hat:"Sun hat with neck flap",thin_hat:"Thin hat",hat:"Hat",winter_hat:"Warm hat with ear flaps",mittens:"Mittens",scarf:"Neck scarf",barefoot:"Bare feet",thin_socks:"Thin socks",socks:"Socks",wool_socks:"Thick wool socks",shoes:"Shoes",leg_warmers:"Leg warmers",footmuff:"Footmuff",rain_cover:"Rain cover",blanket:"Blanket"},warning:{ueberhitzung:"Warmer than the recommended 16\u201320 \xB0C. Watch for overheating.",keine_muetze:"No hat in bed \u2014 babies release excess heat through the head.",uv:"Sun protection needed.",mittagszeit:"Avoid the sun between 11am and 3pm.",autositz:"No bulky jacket in the car seat \u2014 the harness would sit too loose.",trage_hitze:"Heat builds up in a carrier. Check the neck regularly."},hint:{carrier_legs:"Legs and feet are exposed \u2014 use leg warmers or thick socks.",car_seat:"Add the blanket over the lap only after buckling the harness.",stroller_rain_cover:"A rain cover traps heat. Ventilate regularly.",sleep_no_loose_bedding:"No loose blankets, no pillows."},measure:{shade:"Seek shade around midday",midday_indoors:"Spend the midday hours indoors where possible",avoid_outdoors:"Avoid time outdoors",uv_clothing:"Protective clothing (UPF 30+)",sun_hat_with_neck_flap:"Hat with brim and neck flap",no_direct_sun:"No direct sun in the first year of life"},situation:{kinderwagen:"Stroller",babytrage:"Carrier",auto:"Car",schlafen:"Sleep",zuhause:"At home",allgemein:"General"},info:{disclaimer:"General guidance, not medical advice -- trust your own judgement.",neck_test:"Check warmth at the neck or chest, not the hands or feet.",cold_hands:"Cool hands and feet are normal and not a sign of being cold."},error:{unavailable:"Not available",uv_unavailable:"No UV data"},level:{hitze:"Dress as lightly as possible",sehr_leicht:"Dress very lightly",leicht:"Dress lightly",mittel:"Dress moderately",warm:"Dress warmly",sehr_warm:"Dress very warmly",winterfest:"Dress for winter",tog_0_5:"Light sleeping bag",tog_1_0:"Medium-light sleeping bag",tog_2_5:"Standard sleeping bag",tog_3_5:"Warm sleeping bag"},label:{tog:"TOG",uv:"UV"},editor:{entry:"Child",situations:"Visible situations",default_situation:"Default situation",show_weather:"Show weather",show_room_temperature:"Show room temperature",show_uv:"Show UV index",show_age:"Show age"}},Ge={item:{short_sleeve_body:"Kurzarmbody",long_sleeve_body:"Langarmbody",light_long_suit:"Luftiger lang\xE4rmeliger Einteiler (UPF 30+)",light_trousers:"D\xFCnne lange Hose",trousers:"Leichte Hose",romper:"Strampler",sweater:"Pullover",vest:"D\xFCnne Weste oder J\xE4ckchen",light_jacket:"Leichte Jacke",fleece_jacket:"Fleece- oder Wollwalkjacke",fleece_suit:"Fleeceanzug",winter_jacket:"Winterjacke oder Wollwalkoverall",winter_suit:"Winteroverall",pyjamas:"Schlafanzug",diaper_only:"Nur Windel",sun_hat:"Sonnenhut mit Nackenschutz",thin_hat:"D\xFCnne M\xFCtze",hat:"M\xFCtze",winter_hat:"Warme M\xFCtze mit Ohrenschutz",mittens:"F\xE4ustlinge",scarf:"Halstuch",barefoot:"Barfu\xDF",thin_socks:"D\xFCnne S\xF6ckchen",socks:"Socken",wool_socks:"Dicke Wollsocken",shoes:"Schuhe",leg_warmers:"Stulpen",footmuff:"Fu\xDFsack",rain_cover:"Regenverdeck",blanket:"Decke"},warning:{ueberhitzung:"W\xE4rmer als die empfohlenen 16\u201320 \xB0C. Auf \xDCberhitzung achten.",keine_muetze:"Keine M\xFCtze im Bett \u2014 Babys geben \xFCbersch\xFCssige W\xE4rme \xFCber den Kopf ab.",uv:"Sonnenschutz n\xF6tig.",mittagszeit:"Zwischen 11 und 15 Uhr die Sonne meiden.",autositz:"Keine dicke Jacke im Autositz \u2014 der Gurt sitzt sonst zu locker.",trage_hitze:"In der Trage staut sich W\xE4rme. Nacken regelm\xE4\xDFig pr\xFCfen."},hint:{carrier_legs:"Beine und F\xFC\xDFe liegen frei \u2014 Stulpen oder dicke Socken.",car_seat:"Decke erst nach dem Anschnallen \xFCber den Scho\xDF legen.",stroller_rain_cover:"Ein Regenverdeck staut W\xE4rme. Regelm\xE4\xDFig l\xFCften.",sleep_no_loose_bedding:"Keine losen Decken, keine Kissen."},measure:{shade:"In der Mittagszeit Schatten aufsuchen",midday_indoors:"Mittagsstunden m\xF6glichst drinnen verbringen",avoid_outdoors:"Aufenthalt im Freien meiden",uv_clothing:"Sch\xFCtzende Kleidung (UPF 30+)",sun_hat_with_neck_flap:"Hut mit Schirm und Nackenschutz",no_direct_sun:"Keine direkte Sonne im ersten Lebensjahr"},situation:{kinderwagen:"Kinderwagen",babytrage:"Trage",auto:"Auto",schlafen:"Schlafen",zuhause:"Zuhause",allgemein:"Allgemein"},info:{disclaimer:"Allgemeine Orientierung, keine medizinische Beratung -- verlasse dich auf dein eigenes Urteilsverm\xF6gen.",neck_test:"W\xE4rme am Nacken oder Brustkorb pr\xFCfen, nicht an H\xE4nden oder F\xFC\xDFen.",cold_hands:"K\xFChle H\xE4nde und F\xFC\xDFe sind normal und kein Anzeichen von Frieren."},error:{unavailable:"Nicht verf\xFCgbar",uv_unavailable:"Keine UV-Daten"},level:{hitze:"So leicht wie m\xF6glich anziehen",sehr_leicht:"Sehr leicht anziehen",leicht:"Leicht anziehen",mittel:"Mitteldick anziehen",warm:"Warm anziehen",sehr_warm:"Sehr warm anziehen",winterfest:"Winterfest anziehen",tog_0_5:"D\xFCnner Schlafsack",tog_1_0:"Leichter Schlafsack",tog_2_5:"Normaler Schlafsack",tog_3_5:"Dicker Schlafsack"},label:{tog:"TOG",uv:"UV"},editor:{entry:"Kind",situations:"Angezeigte Situationen",default_situation:"Voreingestellte Situation",show_weather:"Wetter anzeigen",show_room_temperature:"Raumtemperatur anzeigen",show_uv:"UV-Index anzeigen",show_age:"Alter anzeigen"}},Je={en:qe,de:Ge};function Ze(s){return s!=null&&s.toLowerCase().startsWith("de")?"de":"en"}function p(s,e,t){return Je[Ze(s)][e][t]??t}function Ye(s){if(!Array.isArray(s))return[...C];let e=s.filter(t=>C.includes(t));return e.length>0?e:[...C]}function Te(s){if(typeof s!="object"||s===null)throw new Error("tinybreeze-card: configuration is missing");let e=s,t=e.entry;if(typeof t!="string"||t==="")throw new Error("tinybreeze-card: an entry (child) must be selected");let i=Ye(e.situations),n=e.default_situation,o=n&&i.includes(n)?n:i[0],r=l=>l!==!1;return{type:String(e.type??"custom:tinybreeze-card"),entry:t,situations:i,default_situation:o,show_weather:r(e.show_weather),show_room_temperature:r(e.show_room_temperature),show_uv:r(e.show_uv),show_age:r(e.show_age)}}var ze={kinderwagen:"mdi:baby-carriage",babytrage:"mdi:human-male-child",auto:"mdi:car-child-seat",schlafen:"mdi:sleep",zuhause:"mdi:home-outline",allgemein:"mdi:tshirt-crew-outline"};function Re(s,e){return`sensor.${s}_kleidung_${e}`}function Ne(s){return`sensor.${s}_uv_schutz`}var Qe=/^sensor\.(.+)_kleidung_allgemein$/;function Ue(s){let e=new Set;for(let t of Object.keys(s.states)){let i=Qe.exec(t);i&&e.add(i[1])}return[...e].sort()}function W(s){return`sensor.${s}_alter`}function ke(s){return Array.isArray(s)?s.map(e=>String(e)):[]}function Ee(s){return s==null?null:Number(s)}function Xe(s,e,t){let i=s.states[Re(e,t)];if(!i)return;let n=i.attributes;return{level:i.state,outfitKeys:ke(n.outfit_keys),layers:Number(n.layers??0),warnings:ke(n.warnings),hint:n.hint??null,baseTemperature:Ee(n.base_temperature),tog:Ee(n.tog),uvUnavailable:n.uv_unavailable===!0}}function He(s){return 3+Math.ceil(s/2)}var Ce=new Set(["unavailable","unknown",""]);function et(s,e,t){var o;let i=(o=s.states[W(e)])==null?void 0:o.attributes;if(!i)return null;let n=oe(t)?i.missing_room_entity:i.missing_outdoor_entity;return typeof n=="string"&&n!==""?n:null}function Me(s,e,t,i){let n=Re(e,t),o=s.states[n],r=o&&!Ce.has(o.state)?Xe(s,e,t):void 0,l=s.states[W(e)],a=l&&!Ce.has(l.state)?Number(l.state):null;return r?{available:!0,missing:null,level:r.level,outfit:r.outfitKeys.map(c=>p(i,"item",c)),warnings:r.warnings.map(c=>p(i,"warning",c)),hint:r.hint?p(i,"hint",r.hint):null,baseTemperature:r.baseTemperature,tog:r.tog,ageMonths:a,uvUnavailable:r.uvUnavailable}:{available:!1,missing:et(s,e,t)??n,level:"",outfit:[],warnings:[],hint:null,baseTemperature:null,tog:null,ageMonths:a,uvUnavailable:!1}}var tt=new Set(["schlafen","zuhause"]);function oe(s){return tt.has(s)}function F(s){return s.split(/[_\s-]+/).filter(e=>e.length>0).map(e=>e[0].toUpperCase()+e.slice(1)).join(" ")}function Pe(s){var e;return((e=s==null?void 0:s.locale)==null?void 0:e.language)??"en"}function it(s){let e=s?Ue(s):[];return e.length===0?{name:"entry",selector:{text:{}}}:{name:"entry",selector:{select:{mode:"dropdown",options:e.map(t=>({value:t,label:F(t)}))}}}}function nt(s){let e=Pe(s),t=C.map(i=>({value:i,label:p(e,"situation",i)}));return[it(s),{name:"situations",selector:{select:{multiple:!0,options:t}}},{name:"default_situation",selector:{select:{mode:"dropdown",options:t}}},{name:"show_weather",selector:{boolean:{}}},{name:"show_room_temperature",selector:{boolean:{}}},{name:"show_uv",selector:{boolean:{}}},{name:"show_age",selector:{boolean:{}}}]}var B=class extends m{constructor(){super(...arguments);this._label=t=>p(Pe(this.hass),"editor",t.name)}setConfig(t){this._config=t}_valueChanged(t){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t.detail.value},bubbles:!0,composed:!0}))}render(){return!this.hass||!this._config?h:d`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${nt(this.hass)}
        .computeLabel=${this._label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}};B.properties={hass:{attribute:!1},_config:{state:!0}};customElements.get("tinybreeze-card-editor")||customElements.define("tinybreeze-card-editor",B);var O=class extends m{constructor(){super(...arguments);this._infoOpen=!1}static getStubConfig(){return{type:"custom:tinybreeze-card",entry:""}}static getConfigElement(){return document.createElement("tinybreeze-card-editor")}setConfig(t){this._config=Te(t),this._situation=this._config.default_situation}getCardSize(){var t;return He(((t=this._model())==null?void 0:t.outfit.length)??0)}get _language(){var t,i;return((i=(t=this.hass)==null?void 0:t.locale)==null?void 0:i.language)??"en"}_model(){if(!(!this.hass||!this._config||!this._situation))return Me(this.hass,this._config.entry,this._situation,this._language)}_ageUnit(){var n,o;let t=(n=this._config)==null?void 0:n.entry;if(!t||!this.hass)return"";let i=(o=this.hass.states[W(t)])==null?void 0:o.attributes.unit_of_measurement;return typeof i=="string"?i:""}_uvIndex(){var n,o;let t=(n=this._config)==null?void 0:n.entry;if(!t||!this.hass)return null;let i=(o=this.hass.states[Ne(t)])==null?void 0:o.attributes.uv_index;return typeof i=="number"?i:i==null?null:Number(i)}_selectSituation(t){this._situation=t}_toggleInfo(){this._infoOpen=!this._infoOpen}render(){if(!this._config)return h;let t=this._language,i=this._model();return d`
      <ha-card>
        <div class="header">
          <div class="title">
            <span class="name">${F(this._config.entry)}</span>
            ${this._config.show_age?this._age(i):h}
          </div>
          <button
            class="info-toggle"
            title=${p(t,"info","disclaimer")}
            aria-label=${p(t,"info","disclaimer")}
            @click=${this._toggleInfo}
          >
            <ha-icon icon="mdi:information-outline"></ha-icon>
          </button>
        </div>

        ${this._situations(t)} ${this._infoOpen?this._infoPanel(t):h}
        ${i!=null&&i.available?this._body(i,t):this._unavailable(i,t)}
      </ha-card>
    `}_age(t){if(!t||t.ageMonths===null)return h;let i=this._ageUnit();return d`<span class="age">${t.ageMonths}${i?` ${i}`:""}</span>`}_situations(t){return this._config?d`
      <div class="situations" role="tablist">
        ${this._config.situations.map(i=>this._situationTab(i,t))}
      </div>
    `:h}_situationTab(t,i){return d`
      <button
        class="situation"
        role="tab"
        aria-selected=${String(t===this._situation)}
        @click=${()=>this._selectSituation(t)}
      >
        <ha-icon icon=${ze[t]}></ha-icon>
        <span class="situation-label">${p(i,"situation",t)}</span>
      </button>
    `}_infoPanel(t){return d`
      <div class="info-panel">
        <p>${p(t,"info","disclaimer")}</p>
        <p>${p(t,"info","neck_test")}</p>
        <p>${p(t,"info","cold_hands")}</p>
      </div>
    `}_unavailable(t,i){let n=p(i,"error","unavailable");return d`
      <div class="notice error">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>${n}${t!=null&&t.missing?d`: ${t.missing}`:h}</span>
      </div>
    `}_body(t,i){return d`
      ${t.warnings.length?this._warnings(t.warnings):h}
      <div class="level-row">
        <span class="level">${this._heading(t,i)}</span>
        ${t.tog!==null?d`<span class="tog">${p(i,"label","tog")} ${t.tog}</span>`:h}
      </div>
      <ul class="outfit">
        ${t.outfit.map(n=>d`<li>${n}</li>`)}
      </ul>
      ${t.hint?d`<div class="hint">${t.hint}</div>`:h}
      ${this._context(t,i)}
    `}_warnings(t){return d`
      <div class="warnings">
        ${t.map(i=>d`
            <div class="warning-row">
              <ha-icon icon="mdi:alert"></ha-icon>
              <span>${i}</span>
            </div>
          `)}
      </div>
    `}_heading(t,i){return p(i,"level",t.level)}_context(t,i){if(!this._config||!this._situation)return h;let n=oe(this._situation),o=n?this._config.show_room_temperature:this._config.show_weather,r=[];if(o&&t.baseTemperature!==null&&r.push(d`
        <span class="context-item">
          <ha-icon
            icon=${n?"mdi:home-thermometer-outline":"mdi:thermometer"}
          ></ha-icon>
          ${t.baseTemperature}&nbsp;°C
        </span>
      `),this._config.show_uv){let l=this._uvIndex();l!==null?r.push(d`
          <span class="context-item">
            <ha-icon icon="mdi:weather-sunny-alert"></ha-icon>
            ${p(i,"label","uv")}&nbsp;${l}
          </span>
        `):t.uvUnavailable&&r.push(d`
          <span class="context-item muted">
            <ha-icon icon="mdi:weather-sunny-alert"></ha-icon>
            ${p(i,"error","uv_unavailable")}
          </span>
        `)}return r.length?d`<div class="context-row">${r}</div>`:h}};O.properties={hass:{attribute:!1},_config:{state:!0},_situation:{state:!0},_infoOpen:{state:!0}},O.styles=V`
    ha-card {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .title {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      font-size: var(--ha-card-header-font-size, 24px);
      font-weight: 400;
      color: var(--ha-card-header-color, var(--primary-text-color));
      line-height: 1.2;
    }

    .title .age {
      font-size: 0.5em;
      font-weight: 400;
      line-height: 1;
      color: var(--secondary-text-color);
      background: var(--divider-color, #e0e0e0);
      border-radius: 10px;
      padding: 4px 8px;
      white-space: nowrap;
    }

    button.info-toggle {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 50%;
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }

    button.info-toggle:hover {
      color: var(--primary-text-color);
    }

    /* Equal-width segments that wrap rather than scroll: six situations fit
       on a full-width card and stack tidily on a narrow one. */
    .situations {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .situation {
      flex: 1 1 76px;
      min-width: 68px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 12px;
      background: none;
      color: var(--secondary-text-color);
      font-family: inherit;
      font-size: 0.78em;
      line-height: 1.15;
      text-align: center;
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease;
    }

    .situation ha-icon {
      --mdc-icon-size: 22px;
    }

    .situation:hover {
      color: var(--primary-text-color);
    }

    .situation[aria-selected="true"] {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    .info-panel {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 10px;
    }

    .info-panel p {
      margin: 0;
      font-size: 0.8em;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }

    /* Deliberately quiet: no fill, no border, no accent bar. The warnings
       stay above the recommendation and stay unfilterable, but a car-seat
       note should not shout down the answer the card exists to give. */
    .warnings {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .warning-row {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 0.85em;
      line-height: 1.35;
      color: var(--primary-text-color);
    }

    .warning-row ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
      margin-top: 1px;
      color: var(--error-color, #db4437);
    }

    .level-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
    }

    .level {
      font-size: 1.5em;
      font-weight: 500;
      line-height: 1.2;
      color: var(--primary-text-color);
    }

    /* Beside the heading rather than below it: the TOG value qualifies the
       recommendation, it is not a second one. */
    .tog {
      flex-shrink: 0;
      font-size: 0.72em;
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      padding: 2px 8px;
      white-space: nowrap;
    }

    ul.outfit {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    ul.outfit li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      line-height: 1.35;
      color: var(--primary-text-color);
    }

    ul.outfit li::before {
      content: "";
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      margin-top: 0.45em;
      border-radius: 50%;
      background: var(--primary-color, #03a9f4);
    }

    .hint {
      font-size: 0.85em;
      line-height: 1.35;
      color: var(--secondary-text-color);
    }

    .context-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .context-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.78em;
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      padding: 3px 8px;
    }

    .context-item ha-icon {
      --mdc-icon-size: 15px;
    }

    .context-item.muted {
      font-style: italic;
      opacity: 0.75;
    }

    .notice {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 0.9em;
      line-height: 1.35;
      color: var(--secondary-text-color);
    }

    .notice ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .notice.error ha-icon {
      color: var(--error-color, #db4437);
    }
  `;customElements.get("tinybreeze-card")||(customElements.define("tinybreeze-card",O),window.customCards=window.customCards??[],window.customCards.push({type:"tinybreeze-card",name:"Tinybreeze",description:"What to dress your baby in, right now.",preview:!1,documentationURL:"https://github.com/dbackhove/ha-tinybreeze"}));})();
