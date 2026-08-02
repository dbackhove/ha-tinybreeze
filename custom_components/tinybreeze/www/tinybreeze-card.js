/* Tinybreeze card -- built from frontend/src, do not edit by hand. */
"use strict";(()=>{var P=globalThis,O=P.ShadowRoot&&(P.ShadyCSS===void 0||P.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,B=Symbol(),se=new WeakMap,E=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==B)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(O&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=se.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&se.set(t,e))}return e}toString(){return this.cssText}},re=n=>new E(typeof n=="string"?n:n+"",void 0,B),F=(n,...e)=>{let t=n.length===1?n[0]:e.reduce((i,s,o)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[o+1],n[0]);return new E(t,n,B)},oe=(n,e)=>{if(O)n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let i=document.createElement("style"),s=P.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,n.appendChild(i)}},K=O?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return re(t)})(n):n;var{is:Ue,defineProperty:He,getOwnPropertyDescriptor:Me,getOwnPropertyNames:Pe,getOwnPropertySymbols:Oe,getPrototypeOf:Le}=Object,L=globalThis,ae=L.trustedTypes,Ie=ae?ae.emptyScript:"",De=L.reactiveElementPolyfillSupport,C=(n,e)=>n,V={toAttribute(n,e){switch(e){case Boolean:n=n?Ie:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},he=(n,e)=>!Ue(n,e),le={attribute:!0,type:String,converter:V,reflect:!1,useDefault:!1,hasChanged:he};Symbol.metadata??=Symbol("metadata"),L.litPropertyMetadata??=new WeakMap;var _=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=le){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&He(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){let{get:s,set:o}=Me(this.prototype,e)??{get(){return this[t]},set(r){this[t]=r}};return{get:s,set(r){let h=s?.call(this);o?.call(this,r),this.requestUpdate(e,h,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??le}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;let e=Le(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){let t=this.properties,i=[...Pe(t),...Oe(t)];for(let s of i)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[t,i]of this.elementProperties){let s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let s of i)t.unshift(K(s))}else e!==void 0&&t.push(K(e));return t}static _$Eu(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return oe(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){let i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){let o=(i.converter?.toAttribute!==void 0?i.converter:V).toAttribute(t,i.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){let i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let o=i.getPropertyOptions(s),r=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:V;this._$Em=s;let h=r.fromAttribute(t,o.type);this[s]=h??this._$Ej?.get(s)??h,this._$Em=null}}requestUpdate(e,t,i,s=!1,o){if(e!==void 0){let r=this.constructor;if(s===!1&&(o=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??he)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),o!==!0||r!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,o]of i){let{wrapped:r}=o,h=this[s];r!==!0||this._$AL.has(s)||h===void 0||this.C(s,void 0,o,h)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[C("elementProperties")]=new Map,_[C("finalized")]=new Map,De?.({ReactiveElement:_}),(L.reactiveElementVersions??=[]).push("2.1.2");var X=globalThis,ce=n=>n,I=X.trustedTypes,ue=I?I.createPolicy("lit-html",{createHTML:n=>n}):void 0,_e="$lit$",v=`lit$${Math.random().toFixed(9).slice(2)}$`,ye="?"+v,je=`<${ye}>`,w=document,z=()=>w.createComment(""),R=n=>n===null||typeof n!="object"&&typeof n!="function",ee=Array.isArray,We=n=>ee(n)||typeof n?.[Symbol.iterator]=="function",q=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,de=/-->/g,pe=/>/g,b=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ge=/'/g,me=/"/g,ve=/^(?:script|style|textarea|title)$/i,te=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),d=te(1),at=te(2),lt=te(3),S=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),fe=new WeakMap,$=w.createTreeWalker(w,129);function be(n,e){if(!ee(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return ue!==void 0?ue.createHTML(e):e}var Be=(n,e)=>{let t=n.length-1,i=[],s,o=e===2?"<svg>":e===3?"<math>":"",r=T;for(let h=0;h<t;h++){let a=n[h],u,g,c=-1,f=0;for(;f<a.length&&(r.lastIndex=f,g=r.exec(a),g!==null);)f=r.lastIndex,r===T?g[1]==="!--"?r=de:g[1]!==void 0?r=pe:g[2]!==void 0?(ve.test(g[2])&&(s=RegExp("</"+g[2],"g")),r=b):g[3]!==void 0&&(r=b):r===b?g[0]===">"?(r=s??T,c=-1):g[1]===void 0?c=-2:(c=r.lastIndex-g[2].length,u=g[1],r=g[3]===void 0?b:g[3]==='"'?me:ge):r===me||r===ge?r=b:r===de||r===pe?r=T:(r=b,s=void 0);let y=r===b&&n[h+1].startsWith("/>")?" ":"";o+=r===T?a+je:c>=0?(i.push(u),a.slice(0,c)+_e+a.slice(c)+v+y):a+v+(c===-2?h:y)}return[be(n,o+(n[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},N=class n{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let o=0,r=0,h=e.length-1,a=this.parts,[u,g]=Be(e,t);if(this.el=n.createElement(u,i),$.currentNode=this.el.content,t===2||t===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(s=$.nextNode())!==null&&a.length<h;){if(s.nodeType===1){if(s.hasAttributes())for(let c of s.getAttributeNames())if(c.endsWith(_e)){let f=g[r++],y=s.getAttribute(c).split(v),M=/([.?@])?(.*)/.exec(f);a.push({type:1,index:o,name:M[2],strings:y,ctor:M[1]==="."?J:M[1]==="?"?Z:M[1]==="@"?Y:A}),s.removeAttribute(c)}else c.startsWith(v)&&(a.push({type:6,index:o}),s.removeAttribute(c));if(ve.test(s.tagName)){let c=s.textContent.split(v),f=c.length-1;if(f>0){s.textContent=I?I.emptyScript:"";for(let y=0;y<f;y++)s.append(c[y],z()),$.nextNode(),a.push({type:2,index:++o});s.append(c[f],z())}}}else if(s.nodeType===8)if(s.data===ye)a.push({type:2,index:o});else{let c=-1;for(;(c=s.data.indexOf(v,c+1))!==-1;)a.push({type:7,index:o}),c+=v.length-1}o++}}static createElement(e,t){let i=w.createElement("template");return i.innerHTML=e,i}};function x(n,e,t=n,i){if(e===S)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl,o=R(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(n),s._$AT(n,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=x(n,s._$AS(n,e.values),s,i)),e}var G=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??w).importNode(t,!0);$.currentNode=s;let o=$.nextNode(),r=0,h=0,a=i[0];for(;a!==void 0;){if(r===a.index){let u;a.type===2?u=new U(o,o.nextSibling,this,e):a.type===1?u=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(u=new Q(o,this,e)),this._$AV.push(u),a=i[++h]}r!==a?.index&&(o=$.nextNode(),r++)}return $.currentNode=w,s}p(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},U=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=x(this,e,t),R(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==S&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):We(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&R(this._$AH)?this._$AA.nextSibling.data=e:this.T(w.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=N.createElement(be(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{let o=new G(s,this),r=o.u(this.options);o.p(t),this.T(r),this._$AH=o}}_$AC(e){let t=fe.get(e.strings);return t===void 0&&fe.set(e.strings,t=new N(e)),t}k(e){ee(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,s=0;for(let o of e)s===t.length?t.push(i=new n(this.O(z()),this.O(z()),this,this.options)):i=t[s],i._$AI(o),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let i=ce(e).nextSibling;ce(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},A=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,o){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=l}_$AI(e,t=this,i,s){let o=this.strings,r=!1;if(o===void 0)e=x(this,e,t,0),r=!R(e)||e!==this._$AH&&e!==S,r&&(this._$AH=e);else{let h=e,a,u;for(e=o[0],a=0;a<o.length-1;a++)u=x(this,h[i+a],t,a),u===S&&(u=this._$AH[a]),r||=!R(u)||u!==this._$AH[a],u===l?e=l:e!==l&&(e+=(u??"")+o[a+1]),this._$AH[a]=u}r&&!s&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},J=class extends A{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}},Z=class extends A{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}},Y=class extends A{constructor(e,t,i,s,o){super(e,t,i,s,o),this.type=5}_$AI(e,t=this){if((e=x(this,e,t,0)??l)===S)return;let i=this._$AH,s=e===l&&i!==l||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==l&&(i===l||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Q=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){x(this,e)}};var Fe=X.litHtmlPolyfillSupport;Fe?.(N,U),(X.litHtmlVersions??=[]).push("3.3.3");var $e=(n,e,t)=>{let i=t?.renderBefore??e,s=i._$litPart$;if(s===void 0){let o=t?.renderBefore??null;i._$litPart$=s=new U(e.insertBefore(z(),o),o,void 0,t??{})}return s._$AI(n),s};var ie=globalThis,m=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=$e(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};m._$litElement$=!0,m.finalized=!0,ie.litElementHydrateSupport?.({LitElement:m});var Ke=ie.litElementPolyfillSupport;Ke?.({LitElement:m});(ie.litElementVersions??=[]).push("4.2.2");var k=["kinderwagen","babytrage","auto","schlafen","zuhause","allgemein"];var Ve={item:{short_sleeve_body:"Short-sleeve bodysuit",long_sleeve_body:"Long-sleeve bodysuit",light_long_suit:"Lightweight long-sleeve sun suit (UPF 30+)",light_trousers:"Thin long trousers",trousers:"Light trousers",romper:"Romper",sweater:"Sweater",vest:"Thin vest or light cardigan",light_jacket:"Light jacket",fleece_jacket:"Fleece or boiled-wool jacket",fleece_suit:"Fleece suit",winter_jacket:"Winter jacket or boiled-wool overall",winter_suit:"Snowsuit",pyjamas:"Pyjamas",diaper_only:"Diaper only",sun_hat:"Sun hat with neck flap",thin_hat:"Thin hat",hat:"Hat",winter_hat:"Warm hat with ear flaps",mittens:"Mittens",scarf:"Neck scarf",barefoot:"Bare feet",thin_socks:"Thin socks",socks:"Socks",wool_socks:"Thick wool socks",shoes:"Shoes",leg_warmers:"Leg warmers",footmuff:"Footmuff",rain_cover:"Rain cover",blanket:"Blanket"},warning:{ueberhitzung:"Warmer than the recommended 16\u201320 \xB0C. Watch for overheating.",keine_muetze:"No hat in bed \u2014 babies release excess heat through the head.",uv:"Sun protection needed.",mittagszeit:"Avoid the sun between 11am and 3pm.",autositz:"No bulky jacket in the car seat \u2014 the harness would sit too loose.",trage_hitze:"Heat builds up in a carrier. Check the neck regularly."},hint:{carrier_legs:"Legs and feet are exposed \u2014 use leg warmers or thick socks.",car_seat:"Add the blanket over the lap only after buckling the harness.",stroller_rain_cover:"A rain cover traps heat. Ventilate regularly.",sleep_no_loose_bedding:"No loose blankets, no pillows."},measure:{shade:"Seek shade around midday",midday_indoors:"Spend the midday hours indoors where possible",avoid_outdoors:"Avoid time outdoors",uv_clothing:"Protective clothing (UPF 30+)",sun_hat_with_neck_flap:"Hat with brim and neck flap",no_direct_sun:"No direct sun in the first year of life"},situation:{kinderwagen:"Stroller",babytrage:"Carrier",auto:"Car",schlafen:"Sleep",zuhause:"At home",allgemein:"General"},info:{disclaimer:"General guidance, not medical advice -- trust your own judgement.",neck_test:"Check warmth at the neck or chest, not the hands or feet.",cold_hands:"Cool hands and feet are normal and not a sign of being cold."},error:{unavailable:"Not available",uv_unavailable:"No UV data"},level:{hitze:"Dress as lightly as possible",sehr_leicht:"Dress very lightly",leicht:"Dress lightly",mittel:"Dress moderately",warm:"Dress warmly",sehr_warm:"Dress very warmly",winterfest:"Dress for winter",tog_0_5:"Light sleeping bag",tog_1_0:"Medium-light sleeping bag",tog_2_5:"Standard sleeping bag",tog_3_5:"Warm sleeping bag"},label:{tog:"TOG",uv:"UV"},editor:{entry:"Child",situations:"Visible situations",default_situation:"Default situation",show_weather:"Show weather",show_room_temperature:"Show room temperature",show_uv:"Show UV index",show_age:"Show age"}},qe={item:{short_sleeve_body:"Kurzarmbody",long_sleeve_body:"Langarmbody",light_long_suit:"Luftiger lang\xE4rmeliger Einteiler (UPF 30+)",light_trousers:"D\xFCnne lange Hose",trousers:"Leichte Hose",romper:"Strampler",sweater:"Pullover",vest:"D\xFCnne Weste oder J\xE4ckchen",light_jacket:"Leichte Jacke",fleece_jacket:"Fleece- oder Wollwalkjacke",fleece_suit:"Fleeceanzug",winter_jacket:"Winterjacke oder Wollwalkoverall",winter_suit:"Winteroverall",pyjamas:"Schlafanzug",diaper_only:"Nur Windel",sun_hat:"Sonnenhut mit Nackenschutz",thin_hat:"D\xFCnne M\xFCtze",hat:"M\xFCtze",winter_hat:"Warme M\xFCtze mit Ohrenschutz",mittens:"F\xE4ustlinge",scarf:"Halstuch",barefoot:"Barfu\xDF",thin_socks:"D\xFCnne S\xF6ckchen",socks:"Socken",wool_socks:"Dicke Wollsocken",shoes:"Schuhe",leg_warmers:"Stulpen",footmuff:"Fu\xDFsack",rain_cover:"Regenverdeck",blanket:"Decke"},warning:{ueberhitzung:"W\xE4rmer als die empfohlenen 16\u201320 \xB0C. Auf \xDCberhitzung achten.",keine_muetze:"Keine M\xFCtze im Bett \u2014 Babys geben \xFCbersch\xFCssige W\xE4rme \xFCber den Kopf ab.",uv:"Sonnenschutz n\xF6tig.",mittagszeit:"Zwischen 11 und 15 Uhr die Sonne meiden.",autositz:"Keine dicke Jacke im Autositz \u2014 der Gurt sitzt sonst zu locker.",trage_hitze:"In der Trage staut sich W\xE4rme. Nacken regelm\xE4\xDFig pr\xFCfen."},hint:{carrier_legs:"Beine und F\xFC\xDFe liegen frei \u2014 Stulpen oder dicke Socken.",car_seat:"Decke erst nach dem Anschnallen \xFCber den Scho\xDF legen.",stroller_rain_cover:"Ein Regenverdeck staut W\xE4rme. Regelm\xE4\xDFig l\xFCften.",sleep_no_loose_bedding:"Keine losen Decken, keine Kissen."},measure:{shade:"In der Mittagszeit Schatten aufsuchen",midday_indoors:"Mittagsstunden m\xF6glichst drinnen verbringen",avoid_outdoors:"Aufenthalt im Freien meiden",uv_clothing:"Sch\xFCtzende Kleidung (UPF 30+)",sun_hat_with_neck_flap:"Hut mit Schirm und Nackenschutz",no_direct_sun:"Keine direkte Sonne im ersten Lebensjahr"},situation:{kinderwagen:"Kinderwagen",babytrage:"Trage",auto:"Auto",schlafen:"Schlafen",zuhause:"Zuhause",allgemein:"Allgemein"},info:{disclaimer:"Allgemeine Orientierung, keine medizinische Beratung -- verlasse dich auf dein eigenes Urteilsverm\xF6gen.",neck_test:"W\xE4rme am Nacken oder Brustkorb pr\xFCfen, nicht an H\xE4nden oder F\xFC\xDFen.",cold_hands:"K\xFChle H\xE4nde und F\xFC\xDFe sind normal und kein Anzeichen von Frieren."},error:{unavailable:"Nicht verf\xFCgbar",uv_unavailable:"Keine UV-Daten"},level:{hitze:"So leicht wie m\xF6glich anziehen",sehr_leicht:"Sehr leicht anziehen",leicht:"Leicht anziehen",mittel:"Mitteldick anziehen",warm:"Warm anziehen",sehr_warm:"Sehr warm anziehen",winterfest:"Winterfest anziehen",tog_0_5:"D\xFCnner Schlafsack",tog_1_0:"Leichter Schlafsack",tog_2_5:"Normaler Schlafsack",tog_3_5:"Dicker Schlafsack"},label:{tog:"TOG",uv:"UV"},editor:{entry:"Kind",situations:"Angezeigte Situationen",default_situation:"Voreingestellte Situation",show_weather:"Wetter anzeigen",show_room_temperature:"Raumtemperatur anzeigen",show_uv:"UV-Index anzeigen",show_age:"Alter anzeigen"}},Ge={en:Ve,de:qe};function Je(n){return n?.toLowerCase().startsWith("de")?"de":"en"}function p(n,e,t){return Ge[Je(n)][e][t]??t}function Ze(n){if(!Array.isArray(n))return[...k];let e=n.filter(t=>k.includes(t));return e.length>0?e:[...k]}function Ae(n){if(typeof n!="object"||n===null)throw new Error("tinybreeze-card: configuration is missing");let e=n,t=e.entry;if(typeof t!="string"||t==="")throw new Error("tinybreeze-card: an entry (child) must be selected");let i=Ze(e.situations),s=e.default_situation,o=s&&i.includes(s)?s:i[0],r=h=>h!==!1;return{type:String(e.type??"custom:tinybreeze-card"),entry:t,situations:i,default_situation:o,show_weather:r(e.show_weather),show_room_temperature:r(e.show_room_temperature),show_uv:r(e.show_uv),show_age:r(e.show_age)}}var ke={kinderwagen:"mdi:baby-carriage",babytrage:"mdi:human-male-child",auto:"mdi:car-child-seat",schlafen:"mdi:sleep",zuhause:"mdi:home-outline",allgemein:"mdi:tshirt-crew-outline"};function Ee(n,e){return`sensor.${n}_kleidung_${e}`}function Ce(n){return`sensor.${n}_uv_schutz`}var Ye=/^sensor\.(.+)_kleidung_allgemein$/;function Te(n){let e=new Set;for(let t of Object.keys(n.states)){let i=Ye.exec(t);i&&e.add(i[1])}return[...e].sort()}function D(n){return`sensor.${n}_alter`}function we(n){return Array.isArray(n)?n.map(e=>String(e)):[]}function Se(n){return n==null?null:Number(n)}function Qe(n,e,t){let i=n.states[Ee(e,t)];if(!i)return;let s=i.attributes;return{level:i.state,outfitKeys:we(s.outfit_keys),layers:Number(s.layers??0),warnings:we(s.warnings),hint:s.hint??null,baseTemperature:Se(s.base_temperature),tog:Se(s.tog),uvUnavailable:s.uv_unavailable===!0}}function ze(n){return 3+Math.ceil(n/2)}var xe=new Set(["unavailable","unknown",""]);function Xe(n,e,t){let i=n.states[D(e)]?.attributes;if(!i)return null;let s=ne(t)?i.missing_room_entity:i.missing_outdoor_entity;return typeof s=="string"&&s!==""?s:null}function Re(n,e,t,i){let s=Ee(e,t),o=n.states[s],r=o&&!xe.has(o.state)?Qe(n,e,t):void 0,h=n.states[D(e)],a=h&&!xe.has(h.state)?Number(h.state):null;return r?{available:!0,missing:null,level:r.level,outfit:r.outfitKeys.map(u=>p(i,"item",u)),warnings:r.warnings.map(u=>p(i,"warning",u)),hint:r.hint?p(i,"hint",r.hint):null,baseTemperature:r.baseTemperature,tog:r.tog,ageMonths:a,uvUnavailable:r.uvUnavailable}:{available:!1,missing:Xe(n,e,t)??s,level:"",outfit:[],warnings:[],hint:null,baseTemperature:null,tog:null,ageMonths:a,uvUnavailable:!1}}var et=new Set(["schlafen","zuhause"]);function ne(n){return et.has(n)}function j(n){return n.split(/[_\s-]+/).filter(e=>e.length>0).map(e=>e[0].toUpperCase()+e.slice(1)).join(" ")}function Ne(n){return n?.locale?.language??"en"}function tt(n){let e=n?Te(n):[];return e.length===0?{name:"entry",selector:{text:{}}}:{name:"entry",selector:{select:{mode:"dropdown",options:e.map(t=>({value:t,label:j(t)}))}}}}function it(n){let e=Ne(n),t=k.map(i=>({value:i,label:p(e,"situation",i)}));return[tt(n),{name:"situations",selector:{select:{multiple:!0,options:t}}},{name:"default_situation",selector:{select:{mode:"dropdown",options:t}}},{name:"show_weather",selector:{boolean:{}}},{name:"show_room_temperature",selector:{boolean:{}}},{name:"show_uv",selector:{boolean:{}}},{name:"show_age",selector:{boolean:{}}}]}var W=class extends m{constructor(){super(...arguments);this._label=t=>p(Ne(this.hass),"editor",t.name)}setConfig(t){this._config=t}_valueChanged(t){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t.detail.value},bubbles:!0,composed:!0}))}render(){return!this.hass||!this._config?l:d`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${it(this.hass)}
        .computeLabel=${this._label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}};W.properties={hass:{attribute:!1},_config:{state:!0}};customElements.get("tinybreeze-card-editor")||customElements.define("tinybreeze-card-editor",W);var H=class extends m{constructor(){super(...arguments);this._infoOpen=!1}static getStubConfig(){return{type:"custom:tinybreeze-card",entry:""}}static getConfigElement(){return document.createElement("tinybreeze-card-editor")}setConfig(t){this._config=Ae(t),this._situation=this._config.default_situation}getCardSize(){return ze(this._model()?.outfit.length??0)}get _language(){return this.hass?.locale?.language??"en"}_model(){if(!(!this.hass||!this._config||!this._situation))return Re(this.hass,this._config.entry,this._situation,this._language)}_ageUnit(){let t=this._config?.entry;if(!t||!this.hass)return"";let i=this.hass.states[D(t)]?.attributes.unit_of_measurement;return typeof i=="string"?i:""}_uvIndex(){let t=this._config?.entry;if(!t||!this.hass)return null;let i=this.hass.states[Ce(t)]?.attributes.uv_index;return typeof i=="number"?i:i==null?null:Number(i)}_selectSituation(t){this._situation=t}_toggleInfo(){this._infoOpen=!this._infoOpen}render(){if(!this._config)return l;let t=this._language,i=this._model();return d`
      <ha-card>
        <div class="header">
          <div class="title">
            <span class="name">${j(this._config.entry)}</span>
            ${this._config.show_age?this._age(i):l}
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

        ${this._situations(t)} ${this._infoOpen?this._infoPanel(t):l}
        ${i?.available?this._body(i,t):this._unavailable(i,t)}
      </ha-card>
    `}_age(t){if(!t||t.ageMonths===null)return l;let i=this._ageUnit();return d`<span class="age">${t.ageMonths}${i?` ${i}`:""}</span>`}_situations(t){return this._config?d`
      <div class="situations" role="tablist">
        ${this._config.situations.map(i=>this._situationTab(i,t))}
      </div>
    `:l}_situationTab(t,i){return d`
      <button
        class="situation"
        role="tab"
        aria-selected=${String(t===this._situation)}
        @click=${()=>this._selectSituation(t)}
      >
        <ha-icon icon=${ke[t]}></ha-icon>
        <span class="situation-label">${p(i,"situation",t)}</span>
      </button>
    `}_infoPanel(t){return d`
      <div class="info-panel">
        <p>${p(t,"info","disclaimer")}</p>
        <p>${p(t,"info","neck_test")}</p>
        <p>${p(t,"info","cold_hands")}</p>
      </div>
    `}_unavailable(t,i){let s=p(i,"error","unavailable");return d`
      <div class="notice error">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>${s}${t?.missing?d`: ${t.missing}`:l}</span>
      </div>
    `}_body(t,i){return d`
      ${t.warnings.length?this._warnings(t.warnings):l}
      <div class="level-row">
        <span class="level">${this._heading(t,i)}</span>
        ${t.tog!==null?d`<span class="tog">${p(i,"label","tog")} ${t.tog}</span>`:l}
      </div>
      <ul class="outfit">
        ${t.outfit.map(s=>d`<li>${s}</li>`)}
      </ul>
      ${t.hint?d`<div class="hint">${t.hint}</div>`:l}
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
    `}_heading(t,i){return p(i,"level",t.level)}_context(t,i){if(!this._config||!this._situation)return l;let s=ne(this._situation),o=s?this._config.show_room_temperature:this._config.show_weather,r=[];if(o&&t.baseTemperature!==null&&r.push(d`
        <span class="context-item">
          <ha-icon
            icon=${s?"mdi:home-thermometer-outline":"mdi:thermometer"}
          ></ha-icon>
          ${t.baseTemperature}&nbsp;°C
        </span>
      `),this._config.show_uv){let h=this._uvIndex();h!==null?r.push(d`
          <span class="context-item">
            <ha-icon icon="mdi:weather-sunny-alert"></ha-icon>
            ${p(i,"label","uv")}&nbsp;${h}
          </span>
        `):t.uvUnavailable&&r.push(d`
          <span class="context-item muted">
            <ha-icon icon="mdi:weather-sunny-alert"></ha-icon>
            ${p(i,"error","uv_unavailable")}
          </span>
        `)}return r.length?d`<div class="context-row">${r}</div>`:l}};H.properties={hass:{attribute:!1},_config:{state:!0},_situation:{state:!0},_infoOpen:{state:!0}},H.styles=F`
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
  `;customElements.get("tinybreeze-card")||(customElements.define("tinybreeze-card",H),window.customCards=window.customCards??[],window.customCards.push({type:"tinybreeze-card",name:"Tinybreeze",description:"What to dress your baby in, right now.",preview:!1,documentationURL:"https://github.com/dbackhove/ha-tinybreeze"}));})();
