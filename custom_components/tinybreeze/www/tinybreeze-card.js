/* Tinybreeze card -- built from frontend/src, do not edit by hand. */
"use strict";(()=>{var P=globalThis,O=P.ShadowRoot&&(P.ShadyCSS===void 0||P.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,W=Symbol(),ie=new WeakMap,E=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==W)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(O&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=ie.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&ie.set(t,e))}return e}toString(){return this.cssText}},se=i=>new E(typeof i=="string"?i:i+"",void 0,W),B=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((n,s,o)=>n+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new E(t,i,W)},re=(i,e)=>{if(O)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),s=P.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=t.cssText,i.appendChild(n)}},F=O?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return se(t)})(i):i;var{is:Ne,defineProperty:Ue,getOwnPropertyDescriptor:He,getOwnPropertyNames:Me,getOwnPropertySymbols:Pe,getPrototypeOf:Oe}=Object,L=globalThis,oe=L.trustedTypes,Le=oe?oe.emptyScript:"",Ie=L.reactiveElementPolyfillSupport,C=(i,e)=>i,K={toAttribute(i,e){switch(e){case Boolean:i=i?Le:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},le=(i,e)=>!Ne(i,e),ae={attribute:!0,type:String,converter:K,reflect:!1,useDefault:!1,hasChanged:le};Symbol.metadata??=Symbol("metadata"),L.litPropertyMetadata??=new WeakMap;var _=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ae){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(e,n,t);s!==void 0&&Ue(this.prototype,e,s)}}static getPropertyDescriptor(e,t,n){let{get:s,set:o}=He(this.prototype,e)??{get(){return this[t]},set(r){this[t]=r}};return{get:s,set(r){let h=s?.call(this);o?.call(this,r),this.requestUpdate(e,h,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ae}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;let e=Oe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){let t=this.properties,n=[...Me(t),...Pe(t)];for(let s of n)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,s]of t)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let s=this._$Eu(t,n);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let s of n)t.unshift(F(s))}else e!==void 0&&t.push(F(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return re(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,n);if(s!==void 0&&n.reflect===!0){let o=(n.converter?.toAttribute!==void 0?n.converter:K).toAttribute(t,n.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){let n=this.constructor,s=n._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let o=n.getPropertyOptions(s),r=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:K;this._$Em=s;let h=r.fromAttribute(t,o.type);this[s]=h??this._$Ej?.get(s)??h,this._$Em=null}}requestUpdate(e,t,n,s=!1,o){if(e!==void 0){let r=this.constructor;if(s===!1&&(o=this[e]),n??=r.getPropertyOptions(e),!((n.hasChanged??le)(o,t)||n.useDefault&&n.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:s,wrapped:o},r){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),o!==!0||r!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,o]of n){let{wrapped:r}=o,h=this[s];r!==!0||this._$AL.has(s)||h===void 0||this.C(s,void 0,o,h)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[C("elementProperties")]=new Map,_[C("finalized")]=new Map,Ie?.({ReactiveElement:_}),(L.reactiveElementVersions??=[]).push("2.1.2");var Q=globalThis,he=i=>i,I=Q.trustedTypes,ce=I?I.createPolicy("lit-html",{createHTML:i=>i}):void 0,fe="$lit$",v=`lit$${Math.random().toFixed(9).slice(2)}$`,_e="?"+v,De=`<${_e}>`,w=document,z=()=>w.createComment(""),R=i=>i===null||typeof i!="object"&&typeof i!="function",X=Array.isArray,je=i=>X(i)||typeof i?.[Symbol.iterator]=="function",V=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ue=/-->/g,de=/>/g,$=RegExp(`>|${V}(?:([^\\s"'>=/]+)(${V}*=${V}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),pe=/'/g,ge=/"/g,ye=/^(?:script|style|textarea|title)$/i,ee=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),d=ee(1),rt=ee(2),ot=ee(3),S=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),me=new WeakMap,b=w.createTreeWalker(w,129);function ve(i,e){if(!X(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return ce!==void 0?ce.createHTML(e):e}var We=(i,e)=>{let t=i.length-1,n=[],s,o=e===2?"<svg>":e===3?"<math>":"",r=T;for(let h=0;h<t;h++){let a=i[h],u,g,c=-1,f=0;for(;f<a.length&&(r.lastIndex=f,g=r.exec(a),g!==null);)f=r.lastIndex,r===T?g[1]==="!--"?r=ue:g[1]!==void 0?r=de:g[2]!==void 0?(ye.test(g[2])&&(s=RegExp("</"+g[2],"g")),r=$):g[3]!==void 0&&(r=$):r===$?g[0]===">"?(r=s??T,c=-1):g[1]===void 0?c=-2:(c=r.lastIndex-g[2].length,u=g[1],r=g[3]===void 0?$:g[3]==='"'?ge:pe):r===ge||r===pe?r=$:r===ue||r===de?r=T:(r=$,s=void 0);let y=r===$&&i[h+1].startsWith("/>")?" ":"";o+=r===T?a+De:c>=0?(n.push(u),a.slice(0,c)+fe+a.slice(c)+v+y):a+v+(c===-2?h:y)}return[ve(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},N=class i{constructor({strings:e,_$litType$:t},n){let s;this.parts=[];let o=0,r=0,h=e.length-1,a=this.parts,[u,g]=We(e,t);if(this.el=i.createElement(u,n),b.currentNode=this.el.content,t===2||t===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(s=b.nextNode())!==null&&a.length<h;){if(s.nodeType===1){if(s.hasAttributes())for(let c of s.getAttributeNames())if(c.endsWith(fe)){let f=g[r++],y=s.getAttribute(c).split(v),M=/([.?@])?(.*)/.exec(f);a.push({type:1,index:o,name:M[2],strings:y,ctor:M[1]==="."?G:M[1]==="?"?J:M[1]==="@"?Z:x}),s.removeAttribute(c)}else c.startsWith(v)&&(a.push({type:6,index:o}),s.removeAttribute(c));if(ye.test(s.tagName)){let c=s.textContent.split(v),f=c.length-1;if(f>0){s.textContent=I?I.emptyScript:"";for(let y=0;y<f;y++)s.append(c[y],z()),b.nextNode(),a.push({type:2,index:++o});s.append(c[f],z())}}}else if(s.nodeType===8)if(s.data===_e)a.push({type:2,index:o});else{let c=-1;for(;(c=s.data.indexOf(v,c+1))!==-1;)a.push({type:7,index:o}),c+=v.length-1}o++}}static createElement(e,t){let n=w.createElement("template");return n.innerHTML=e,n}};function A(i,e,t=i,n){if(e===S)return e;let s=n!==void 0?t._$Co?.[n]:t._$Cl,o=R(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,t,n)),n!==void 0?(t._$Co??=[])[n]=s:t._$Cl=s),s!==void 0&&(e=A(i,s._$AS(i,e.values),s,n)),e}var q=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,s=(e?.creationScope??w).importNode(t,!0);b.currentNode=s;let o=b.nextNode(),r=0,h=0,a=n[0];for(;a!==void 0;){if(r===a.index){let u;a.type===2?u=new U(o,o.nextSibling,this,e):a.type===1?u=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(u=new Y(o,this,e)),this._$AV.push(u),a=n[++h]}r!==a?.index&&(o=b.nextNode(),r++)}return b.currentNode=w,s}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},U=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,s){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=A(this,e,t),R(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==S&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):je(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&R(this._$AH)?this._$AA.nextSibling.data=e:this.T(w.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,s=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=N.createElement(ve(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(t);else{let o=new q(s,this),r=o.u(this.options);o.p(t),this.T(r),this._$AH=o}}_$AC(e){let t=me.get(e.strings);return t===void 0&&me.set(e.strings,t=new N(e)),t}k(e){X(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,s=0;for(let o of e)s===t.length?t.push(n=new i(this.O(z()),this.O(z()),this,this.options)):n=t[s],n._$AI(o),s++;s<t.length&&(this._$AR(n&&n._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=he(e).nextSibling;he(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},x=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,s,o){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=l}_$AI(e,t=this,n,s){let o=this.strings,r=!1;if(o===void 0)e=A(this,e,t,0),r=!R(e)||e!==this._$AH&&e!==S,r&&(this._$AH=e);else{let h=e,a,u;for(e=o[0],a=0;a<o.length-1;a++)u=A(this,h[n+a],t,a),u===S&&(u=this._$AH[a]),r||=!R(u)||u!==this._$AH[a],u===l?e=l:e!==l&&(e+=(u??"")+o[a+1]),this._$AH[a]=u}r&&!s&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},G=class extends x{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}},J=class extends x{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}},Z=class extends x{constructor(e,t,n,s,o){super(e,t,n,s,o),this.type=5}_$AI(e,t=this){if((e=A(this,e,t,0)??l)===S)return;let n=this._$AH,s=e===l&&n!==l||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,o=e!==l&&(n===l||s);s&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Y=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){A(this,e)}};var Be=Q.litHtmlPolyfillSupport;Be?.(N,U),(Q.litHtmlVersions??=[]).push("3.3.3");var $e=(i,e,t)=>{let n=t?.renderBefore??e,s=n._$litPart$;if(s===void 0){let o=t?.renderBefore??null;n._$litPart$=s=new U(e.insertBefore(z(),o),o,void 0,t??{})}return s._$AI(i),s};var te=globalThis,m=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=$e(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};m._$litElement$=!0,m.finalized=!0,te.litElementHydrateSupport?.({LitElement:m});var Fe=te.litElementPolyfillSupport;Fe?.({LitElement:m});(te.litElementVersions??=[]).push("4.2.2");var k=["kinderwagen","babytrage","auto","schlafen","zuhause","allgemein"];var Ke={item:{short_sleeve_body:"Short-sleeve bodysuit",long_sleeve_body:"Long-sleeve bodysuit",light_long_suit:"Lightweight long-sleeve sun suit (UPF 30+)",light_trousers:"Thin long trousers",trousers:"Light trousers",romper:"Romper",sweater:"Sweater",vest:"Thin vest or light cardigan",light_jacket:"Light jacket",fleece_jacket:"Fleece or boiled-wool jacket",fleece_suit:"Fleece suit",winter_jacket:"Winter jacket or boiled-wool overall",winter_suit:"Snowsuit",pyjamas:"Pyjamas",diaper_only:"Diaper only",sun_hat:"Sun hat with neck flap",thin_hat:"Thin hat",hat:"Hat",winter_hat:"Warm hat with ear flaps",mittens:"Mittens",scarf:"Neck scarf",barefoot:"Bare feet",thin_socks:"Thin socks",socks:"Socks",wool_socks:"Thick wool socks",shoes:"Shoes",leg_warmers:"Leg warmers",footmuff:"Footmuff",rain_cover:"Rain cover",blanket:"Blanket"},warning:{ueberhitzung:"Warmer than the recommended 16\u201320 \xB0C. Watch for overheating.",keine_muetze:"No hat in bed \u2014 babies release excess heat through the head.",uv:"Sun protection needed.",mittagszeit:"Avoid the sun between 11am and 3pm.",autositz:"No bulky jacket in the car seat \u2014 the harness would sit too loose.",trage_hitze:"Heat builds up in a carrier. Check the neck regularly."},hint:{carrier_legs:"Legs and feet are exposed \u2014 use leg warmers or thick socks.",car_seat:"Add the blanket over the lap only after buckling the harness.",stroller_rain_cover:"A rain cover traps heat. Ventilate regularly.",sleep_no_loose_bedding:"No loose blankets, no pillows."},measure:{shade:"Seek shade around midday",midday_indoors:"Spend the midday hours indoors where possible",avoid_outdoors:"Avoid time outdoors",uv_clothing:"Protective clothing (UPF 30+)",sun_hat_with_neck_flap:"Hat with brim and neck flap",no_direct_sun:"No direct sun in the first year of life"},situation:{kinderwagen:"Stroller",babytrage:"Carrier",auto:"Car",schlafen:"Sleep",zuhause:"At home",allgemein:"General"},info:{disclaimer:"General guidance, not medical advice -- trust your own judgement.",neck_test:"Check warmth at the neck or chest, not the hands or feet.",cold_hands:"Cool hands and feet are normal and not a sign of being cold."},error:{unavailable:"Not available"},level:{hitze:"Dress as lightly as possible",sehr_leicht:"Dress very lightly",leicht:"Dress lightly",mittel:"Dress moderately",warm:"Dress warmly",sehr_warm:"Dress very warmly",winterfest:"Dress for winter",tog_0_5:"Light sleeping bag",tog_1_0:"Medium-light sleeping bag",tog_2_5:"Standard sleeping bag",tog_3_5:"Warm sleeping bag"},label:{tog:"TOG",uv:"UV"},editor:{entry:"Child",situations:"Visible situations",default_situation:"Default situation",show_weather:"Show weather",show_room_temperature:"Show room temperature",show_uv:"Show UV index",show_age:"Show age"}},Ve={item:{short_sleeve_body:"Kurzarmbody",long_sleeve_body:"Langarmbody",light_long_suit:"Luftiger lang\xE4rmeliger Einteiler (UPF 30+)",light_trousers:"D\xFCnne lange Hose",trousers:"Leichte Hose",romper:"Strampler",sweater:"Pullover",vest:"D\xFCnne Weste oder J\xE4ckchen",light_jacket:"Leichte Jacke",fleece_jacket:"Fleece- oder Wollwalkjacke",fleece_suit:"Fleeceanzug",winter_jacket:"Winterjacke oder Wollwalkoverall",winter_suit:"Winteroverall",pyjamas:"Schlafanzug",diaper_only:"Nur Windel",sun_hat:"Sonnenhut mit Nackenschutz",thin_hat:"D\xFCnne M\xFCtze",hat:"M\xFCtze",winter_hat:"Warme M\xFCtze mit Ohrenschutz",mittens:"F\xE4ustlinge",scarf:"Halstuch",barefoot:"Barfu\xDF",thin_socks:"D\xFCnne S\xF6ckchen",socks:"Socken",wool_socks:"Dicke Wollsocken",shoes:"Schuhe",leg_warmers:"Stulpen",footmuff:"Fu\xDFsack",rain_cover:"Regenverdeck",blanket:"Decke"},warning:{ueberhitzung:"W\xE4rmer als die empfohlenen 16\u201320 \xB0C. Auf \xDCberhitzung achten.",keine_muetze:"Keine M\xFCtze im Bett \u2014 Babys geben \xFCbersch\xFCssige W\xE4rme \xFCber den Kopf ab.",uv:"Sonnenschutz n\xF6tig.",mittagszeit:"Zwischen 11 und 15 Uhr die Sonne meiden.",autositz:"Keine dicke Jacke im Autositz \u2014 der Gurt sitzt sonst zu locker.",trage_hitze:"In der Trage staut sich W\xE4rme. Nacken regelm\xE4\xDFig pr\xFCfen."},hint:{carrier_legs:"Beine und F\xFC\xDFe liegen frei \u2014 Stulpen oder dicke Socken.",car_seat:"Decke erst nach dem Anschnallen \xFCber den Scho\xDF legen.",stroller_rain_cover:"Ein Regenverdeck staut W\xE4rme. Regelm\xE4\xDFig l\xFCften.",sleep_no_loose_bedding:"Keine losen Decken, keine Kissen."},measure:{shade:"In der Mittagszeit Schatten aufsuchen",midday_indoors:"Mittagsstunden m\xF6glichst drinnen verbringen",avoid_outdoors:"Aufenthalt im Freien meiden",uv_clothing:"Sch\xFCtzende Kleidung (UPF 30+)",sun_hat_with_neck_flap:"Hut mit Schirm und Nackenschutz",no_direct_sun:"Keine direkte Sonne im ersten Lebensjahr"},situation:{kinderwagen:"Kinderwagen",babytrage:"Trage",auto:"Auto",schlafen:"Schlafen",zuhause:"Zuhause",allgemein:"Allgemein"},info:{disclaimer:"Allgemeine Orientierung, keine medizinische Beratung -- verlasse dich auf dein eigenes Urteilsverm\xF6gen.",neck_test:"W\xE4rme am Nacken oder Brustkorb pr\xFCfen, nicht an H\xE4nden oder F\xFC\xDFen.",cold_hands:"K\xFChle H\xE4nde und F\xFC\xDFe sind normal und kein Anzeichen von Frieren."},error:{unavailable:"Nicht verf\xFCgbar"},level:{hitze:"So leicht wie m\xF6glich anziehen",sehr_leicht:"Sehr leicht anziehen",leicht:"Leicht anziehen",mittel:"Mitteldick anziehen",warm:"Warm anziehen",sehr_warm:"Sehr warm anziehen",winterfest:"Winterfest anziehen",tog_0_5:"D\xFCnner Schlafsack",tog_1_0:"Leichter Schlafsack",tog_2_5:"Normaler Schlafsack",tog_3_5:"Dicker Schlafsack"},label:{tog:"TOG",uv:"UV"},editor:{entry:"Kind",situations:"Angezeigte Situationen",default_situation:"Voreingestellte Situation",show_weather:"Wetter anzeigen",show_room_temperature:"Raumtemperatur anzeigen",show_uv:"UV-Index anzeigen",show_age:"Alter anzeigen"}},qe={en:Ke,de:Ve};function Ge(i){return i?.toLowerCase().startsWith("de")?"de":"en"}function p(i,e,t){return qe[Ge(i)][e][t]??t}function Je(i){if(!Array.isArray(i))return[...k];let e=i.filter(t=>k.includes(t));return e.length>0?e:[...k]}function Ae(i){if(typeof i!="object"||i===null)throw new Error("tinybreeze-card: configuration is missing");let e=i,t=e.entry;if(typeof t!="string"||t==="")throw new Error("tinybreeze-card: an entry (child) must be selected");let n=Je(e.situations),s=e.default_situation,o=s&&n.includes(s)?s:n[0],r=h=>h!==!1;return{type:String(e.type??"custom:tinybreeze-card"),entry:t,situations:n,default_situation:o,show_weather:r(e.show_weather),show_room_temperature:r(e.show_room_temperature),show_uv:r(e.show_uv),show_age:r(e.show_age)}}function xe(i,e){return`sensor.${i}_kleidung_${e}`}function ke(i){return`sensor.${i}_uv_schutz`}var Ze=/^sensor\.(.+)_kleidung_allgemein$/;function Ee(i){let e=new Set;for(let t of Object.keys(i.states)){let n=Ze.exec(t);n&&e.add(n[1])}return[...e].sort()}function ne(i){return`sensor.${i}_alter`}function be(i){return Array.isArray(i)?i.map(e=>String(e)):[]}function we(i){return i==null?null:Number(i)}function Ye(i,e,t){let n=i.states[xe(e,t)];if(!n)return;let s=n.attributes;return{level:n.state,outfitKeys:be(s.outfit_keys),layers:Number(s.layers??0),warnings:be(s.warnings),hint:s.hint??null,baseTemperature:we(s.base_temperature),tog:we(s.tog)}}function Ce(i){return 3+Math.ceil(i/2)}var Se=new Set(["unavailable","unknown",""]);function Te(i,e,t,n){let s=xe(e,t),o=i.states[s],r=o&&!Se.has(o.state)?Ye(i,e,t):void 0,h=i.states[ne(e)],a=h&&!Se.has(h.state)?Number(h.state):null;return r?{available:!0,missing:null,level:r.level,outfit:r.outfitKeys.map(u=>p(n,"item",u)),warnings:r.warnings.map(u=>p(n,"warning",u)),hint:r.hint?p(n,"hint",r.hint):null,baseTemperature:r.baseTemperature,tog:r.tog,ageMonths:a}:{available:!1,missing:s,level:"",outfit:[],warnings:[],hint:null,baseTemperature:null,tog:null,ageMonths:a}}var Qe=new Set(["schlafen","zuhause"]);function ze(i){return Qe.has(i)}function D(i){return i.split(/[_\s-]+/).filter(e=>e.length>0).map(e=>e[0].toUpperCase()+e.slice(1)).join(" ")}function Re(i){return i?.locale?.language??"en"}function Xe(i){let e=i?Ee(i):[];return e.length===0?{name:"entry",selector:{text:{}}}:{name:"entry",selector:{select:{mode:"dropdown",options:e.map(t=>({value:t,label:D(t)}))}}}}function et(i){let e=Re(i),t=k.map(n=>({value:n,label:p(e,"situation",n)}));return[Xe(i),{name:"situations",selector:{select:{multiple:!0,options:t}}},{name:"default_situation",selector:{select:{mode:"dropdown",options:t}}},{name:"show_weather",selector:{boolean:{}}},{name:"show_room_temperature",selector:{boolean:{}}},{name:"show_uv",selector:{boolean:{}}},{name:"show_age",selector:{boolean:{}}}]}var j=class extends m{constructor(){super(...arguments);this._label=t=>p(Re(this.hass),"editor",t.name)}setConfig(t){this._config=t}_valueChanged(t){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t.detail.value},bubbles:!0,composed:!0}))}render(){return!this.hass||!this._config?l:d`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${et(this.hass)}
        .computeLabel=${this._label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}};j.properties={hass:{attribute:!1},_config:{state:!0}};customElements.get("tinybreeze-card-editor")||customElements.define("tinybreeze-card-editor",j);var H=class extends m{constructor(){super(...arguments);this._infoOpen=!1}static getStubConfig(){return{type:"custom:tinybreeze-card",entry:""}}static getConfigElement(){return document.createElement("tinybreeze-card-editor")}setConfig(t){this._config=Ae(t),this._situation=this._config.default_situation}getCardSize(){return Ce(this._model()?.outfit.length??0)}get _language(){return this.hass?.locale?.language??"en"}_model(){if(!(!this.hass||!this._config||!this._situation))return Te(this.hass,this._config.entry,this._situation,this._language)}_ageUnit(){let t=this._config?.entry;if(!t||!this.hass)return"";let n=this.hass.states[ne(t)]?.attributes.unit_of_measurement;return typeof n=="string"?n:""}_uvIndex(){let t=this._config?.entry;if(!t||!this.hass)return null;let n=this.hass.states[ke(t)]?.attributes.uv_index;return typeof n=="number"?n:n==null?null:Number(n)}_selectSituation(t){this._situation=t}_toggleInfo(){this._infoOpen=!this._infoOpen}render(){if(!this._config)return l;let t=this._language,n=this._model();return d`
      <ha-card>
        <div class="header">
          <div class="title">
            <span class="name">${D(this._config.entry)}</span>
            ${this._config.show_age?this._age(n):l}
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

        <div class="chips">
          ${this._config.situations.map(s=>this._chip(s,t))}
        </div>

        ${this._infoOpen?this._infoPanel(t):l}
        ${n?.available?this._body(n,t):this._unavailable(n,t)}
      </ha-card>
    `}_age(t){if(!t||t.ageMonths===null)return l;let n=this._ageUnit();return d`<span class="age">· ${t.ageMonths}${n?` ${n}`:""}</span>`}_chip(t,n){return d`
      <button
        class="chip ${t===this._situation?"selected":""}"
        @click=${()=>this._selectSituation(t)}
      >
        ${p(n,"situation",t)}
      </button>
    `}_infoPanel(t){return d`
      <div class="info-panel">
        <p>${p(t,"info","disclaimer")}</p>
        <p>${p(t,"info","neck_test")}</p>
        <p>${p(t,"info","cold_hands")}</p>
      </div>
    `}_unavailable(t,n){let s=p(n,"error","unavailable");return d`
      <div class="notice error">
        ${s}${t?.missing?d`: ${t.missing}`:l}
      </div>
    `}_body(t,n){return d`
      ${t.warnings.length?this._warnings(t.warnings):l}
      <div class="level">${this._heading(t,n)}</div>
      ${t.tog!==null?d`<div class="tog">${p(n,"label","tog")} ${t.tog}</div>`:l}
      <ul class="outfit">
        ${t.outfit.map(s=>d`<li>${s}</li>`)}
      </ul>
      ${t.hint?d`<div class="hint">${t.hint}</div>`:l}
      ${this._context(t,n)}
    `}_warnings(t){return d`
      <div class="warnings">
        ${t.map(n=>d`
            <div class="warning-row">
              <ha-icon icon="mdi:alert"></ha-icon>
              <span>${n}</span>
            </div>
          `)}
      </div>
    `}_heading(t,n){return p(n,"level",t.level)}_context(t,n){if(!this._config||!this._situation)return l;let s=ze(this._situation),o=s?this._config.show_room_temperature:this._config.show_weather,r=[];if(o&&t.baseTemperature!==null&&r.push(d`
        <span class="context-item">
          <ha-icon
            icon=${s?"mdi:home-thermometer-outline":"mdi:thermometer"}
          ></ha-icon>
          ${t.baseTemperature}&nbsp;°C
        </span>
      `),this._config.show_uv){let h=this._uvIndex();h!==null&&r.push(d`
          <span class="context-item">
            <ha-icon icon="mdi:weather-sunny-alert"></ha-icon>
            ${p(n,"label","uv")}&nbsp;${h}
          </span>
        `)}return r.length?d`<div class="context-row">${r}</div>`:l}};H.properties={hass:{attribute:!1},_config:{state:!0},_situation:{state:!0},_infoOpen:{state:!0}},H.styles=B`
    ha-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .title {
      font-size: var(--ha-card-header-font-size, 24px);
      font-weight: 400;
      color: var(--ha-card-header-color, var(--primary-text-color));
      line-height: 1.2;
    }

    .title .age {
      margin-left: 4px;
      font-size: 0.55em;
      font-weight: 400;
      color: var(--secondary-text-color);
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

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .chip {
      border: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color);
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 0.85em;
      cursor: pointer;
    }

    .chip.selected {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    .info-panel {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 8px;
    }

    .info-panel p {
      margin: 0;
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }

    .warnings {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .warning-row {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--error-color, #db4437);
      font-size: 0.9em;
    }

    .warning-row ha-icon {
      --mdc-icon-size: 18px;
      flex-shrink: 0;
    }

    .level {
      font-size: 1.1em;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .tog {
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }

    ul.outfit {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    ul.outfit li {
      color: var(--primary-text-color);
    }

    ul.outfit li::before {
      content: "· ";
      color: var(--secondary-text-color);
    }

    .hint {
      font-size: 0.85em;
      font-style: italic;
      color: var(--secondary-text-color);
    }

    .context-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.85em;
      color: var(--secondary-text-color);
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 8px;
    }

    .context-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .context-item ha-icon {
      --mdc-icon-size: 16px;
    }

    .notice {
      color: var(--secondary-text-color);
    }

    .notice.error {
      color: var(--error-color, #db4437);
    }
  `;customElements.get("tinybreeze-card")||(customElements.define("tinybreeze-card",H),window.customCards=window.customCards??[],window.customCards.push({type:"tinybreeze-card",name:"Tinybreeze",description:"What to dress your baby in, right now.",preview:!1,documentationURL:"https://github.com/dbackhove/ha-tinybreeze"}));})();
