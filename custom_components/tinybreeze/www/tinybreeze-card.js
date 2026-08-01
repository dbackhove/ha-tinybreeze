/* Tinybreeze card -- built from frontend/src, do not edit by hand. */
"use strict";(()=>{var U=globalThis,H=U.ShadowRoot&&(U.ShadyCSS===void 0||U.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,j=Symbol(),te=new WeakMap,k=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==j)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(H&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=te.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&te.set(t,e))}return e}toString(){return this.cssText}},ie=s=>new k(typeof s=="string"?s:s+"",void 0,j),I=(s,...e)=>{let t=s.length===1?s[0]:e.reduce((i,n,o)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+s[o+1],s[0]);return new k(t,s,j)},ne=(s,e)=>{if(H)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let i=document.createElement("style"),n=U.litNonce;n!==void 0&&i.setAttribute("nonce",n),i.textContent=t.cssText,s.appendChild(i)}},W=H?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return ie(t)})(s):s;var{is:Te,defineProperty:ze,getOwnPropertyDescriptor:Re,getOwnPropertyNames:Ne,getOwnPropertySymbols:Me,getPrototypeOf:Pe}=Object,O=globalThis,se=O.trustedTypes,Ue=se?se.emptyScript:"",He=O.reactiveElementPolyfillSupport,E=(s,e)=>s,B={toAttribute(s,e){switch(e){case Boolean:s=s?Ue:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},oe=(s,e)=>!Te(s,e),re={attribute:!0,type:String,converter:B,reflect:!1,useDefault:!1,hasChanged:oe};Symbol.metadata??=Symbol("metadata"),O.litPropertyMetadata??=new WeakMap;var m=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=re){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let i=Symbol(),n=this.getPropertyDescriptor(e,i,t);n!==void 0&&ze(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){let{get:n,set:o}=Re(this.prototype,e)??{get(){return this[t]},set(r){this[t]=r}};return{get:n,set(r){let h=n?.call(this);o?.call(this,r),this.requestUpdate(e,h,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??re}static _$Ei(){if(this.hasOwnProperty(E("elementProperties")))return;let e=Pe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(E("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(E("properties"))){let t=this.properties,i=[...Ne(t),...Me(t)];for(let n of i)this.createProperty(n,t[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,n]of t)this.elementProperties.set(i,n)}this._$Eh=new Map;for(let[t,i]of this.elementProperties){let n=this._$Eu(t,i);n!==void 0&&this._$Eh.set(n,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let n of i)t.unshift(W(n))}else e!==void 0&&t.push(W(e));return t}static _$Eu(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ne(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){let i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(n!==void 0&&i.reflect===!0){let o=(i.converter?.toAttribute!==void 0?i.converter:B).toAttribute(t,i.type);this._$Em=e,o==null?this.removeAttribute(n):this.setAttribute(n,o),this._$Em=null}}_$AK(e,t){let i=this.constructor,n=i._$Eh.get(e);if(n!==void 0&&this._$Em!==n){let o=i.getPropertyOptions(n),r=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:B;this._$Em=n;let h=r.fromAttribute(t,o.type);this[n]=h??this._$Ej?.get(n)??h,this._$Em=null}}requestUpdate(e,t,i,n=!1,o){if(e!==void 0){let r=this.constructor;if(n===!1&&(o=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??oe)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:o},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),o!==!0||r!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),n===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,o]of this._$Ep)this[n]=o;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[n,o]of i){let{wrapped:r}=o,h=this[n];r!==!0||this._$AL.has(n)||h===void 0||this.C(n,void 0,o,h)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};m.elementStyles=[],m.shadowRootOptions={mode:"open"},m[E("elementProperties")]=new Map,m[E("finalized")]=new Map,He?.({ReactiveElement:m}),(O.reactiveElementVersions??=[]).push("2.1.2");var Z=globalThis,ae=s=>s,L=Z.trustedTypes,le=L?L.createPolicy("lit-html",{createHTML:s=>s}):void 0,ge="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,fe="?"+y,Oe=`<${fe}>`,w=document,T=()=>w.createComment(""),z=s=>s===null||typeof s!="object"&&typeof s!="function",Q=Array.isArray,Le=s=>Q(s)||typeof s?.[Symbol.iterator]=="function",F=`[ 	
\f\r]`,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,he=/-->/g,ce=/>/g,$=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ue=/'/g,de=/"/g,me=/^(?:script|style|textarea|title)$/i,X=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),p=X(1),Ye=X(2),et=X(3),S=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),pe=new WeakMap,b=w.createTreeWalker(w,129);function _e(s,e){if(!Q(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return le!==void 0?le.createHTML(e):e}var De=(s,e)=>{let t=s.length-1,i=[],n,o=e===2?"<svg>":e===3?"<math>":"",r=C;for(let h=0;h<t;h++){let a=s[h],u,d,c=-1,f=0;for(;f<a.length&&(r.lastIndex=f,d=r.exec(a),d!==null);)f=r.lastIndex,r===C?d[1]==="!--"?r=he:d[1]!==void 0?r=ce:d[2]!==void 0?(me.test(d[2])&&(n=RegExp("</"+d[2],"g")),r=$):d[3]!==void 0&&(r=$):r===$?d[0]===">"?(r=n??C,c=-1):d[1]===void 0?c=-2:(c=r.lastIndex-d[2].length,u=d[1],r=d[3]===void 0?$:d[3]==='"'?de:ue):r===de||r===ue?r=$:r===he||r===ce?r=C:(r=$,n=void 0);let _=r===$&&s[h+1].startsWith("/>")?" ":"";o+=r===C?a+Oe:c>=0?(i.push(u),a.slice(0,c)+ge+a.slice(c)+y+_):a+y+(c===-2?h:_)}return[_e(s,o+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},R=class s{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let o=0,r=0,h=e.length-1,a=this.parts,[u,d]=De(e,t);if(this.el=s.createElement(u,i),b.currentNode=this.el.content,t===2||t===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(n=b.nextNode())!==null&&a.length<h;){if(n.nodeType===1){if(n.hasAttributes())for(let c of n.getAttributeNames())if(c.endsWith(ge)){let f=d[r++],_=n.getAttribute(c).split(y),P=/([.?@])?(.*)/.exec(f);a.push({type:1,index:o,name:P[2],strings:_,ctor:P[1]==="."?V:P[1]==="?"?q:P[1]==="@"?G:x}),n.removeAttribute(c)}else c.startsWith(y)&&(a.push({type:6,index:o}),n.removeAttribute(c));if(me.test(n.tagName)){let c=n.textContent.split(y),f=c.length-1;if(f>0){n.textContent=L?L.emptyScript:"";for(let _=0;_<f;_++)n.append(c[_],T()),b.nextNode(),a.push({type:2,index:++o});n.append(c[f],T())}}}else if(n.nodeType===8)if(n.data===fe)a.push({type:2,index:o});else{let c=-1;for(;(c=n.data.indexOf(y,c+1))!==-1;)a.push({type:7,index:o}),c+=y.length-1}o++}}static createElement(e,t){let i=w.createElement("template");return i.innerHTML=e,i}};function A(s,e,t=s,i){if(e===S)return e;let n=i!==void 0?t._$Co?.[i]:t._$Cl,o=z(e)?void 0:e._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),o===void 0?n=void 0:(n=new o(s),n._$AT(s,t,i)),i!==void 0?(t._$Co??=[])[i]=n:t._$Cl=n),n!==void 0&&(e=A(s,n._$AS(s,e.values),n,i)),e}var K=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??w).importNode(t,!0);b.currentNode=n;let o=b.nextNode(),r=0,h=0,a=i[0];for(;a!==void 0;){if(r===a.index){let u;a.type===2?u=new N(o,o.nextSibling,this,e):a.type===1?u=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(u=new J(o,this,e)),this._$AV.push(u),a=i[++h]}r!==a?.index&&(o=b.nextNode(),r++)}return b.currentNode=w,n}p(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},N=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=A(this,e,t),z(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==S&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Le(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&z(this._$AH)?this._$AA.nextSibling.data=e:this.T(w.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:i}=e,n=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=R.createElement(_e(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{let o=new K(n,this),r=o.u(this.options);o.p(t),this.T(r),this._$AH=o}}_$AC(e){let t=pe.get(e.strings);return t===void 0&&pe.set(e.strings,t=new R(e)),t}k(e){Q(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,n=0;for(let o of e)n===t.length?t.push(i=new s(this.O(T()),this.O(T()),this,this.options)):i=t[n],i._$AI(o),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let i=ae(e).nextSibling;ae(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},x=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,o){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=l}_$AI(e,t=this,i,n){let o=this.strings,r=!1;if(o===void 0)e=A(this,e,t,0),r=!z(e)||e!==this._$AH&&e!==S,r&&(this._$AH=e);else{let h=e,a,u;for(e=o[0],a=0;a<o.length-1;a++)u=A(this,h[i+a],t,a),u===S&&(u=this._$AH[a]),r||=!z(u)||u!==this._$AH[a],u===l?e=l:e!==l&&(e+=(u??"")+o[a+1]),this._$AH[a]=u}r&&!n&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},V=class extends x{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}},q=class extends x{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}},G=class extends x{constructor(e,t,i,n,o){super(e,t,i,n,o),this.type=5}_$AI(e,t=this){if((e=A(this,e,t,0)??l)===S)return;let i=this._$AH,n=e===l&&i!==l||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==l&&(i===l||n);n&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},J=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){A(this,e)}};var je=Z.litHtmlPolyfillSupport;je?.(R,N),(Z.litHtmlVersions??=[]).push("3.3.3");var ye=(s,e,t)=>{let i=t?.renderBefore??e,n=i._$litPart$;if(n===void 0){let o=t?.renderBefore??null;i._$litPart$=n=new N(e.insertBefore(T(),o),o,void 0,t??{})}return n._$AI(s),n};var Y=globalThis,v=class extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ye(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};v._$litElement$=!0,v.finalized=!0,Y.litElementHydrateSupport?.({LitElement:v});var Ie=Y.litElementPolyfillSupport;Ie?.({LitElement:v});(Y.litElementVersions??=[]).push("4.2.2");var D=["kinderwagen","babytrage","auto","schlafen","zuhause","allgemein"];var We={item:{short_sleeve_body:"Short-sleeve bodysuit",long_sleeve_body:"Long-sleeve bodysuit",light_long_suit:"Lightweight long-sleeve sun suit (UPF 30+)",light_trousers:"Thin long trousers",trousers:"Light trousers",romper:"Romper",sweater:"Sweater",vest:"Thin vest or light cardigan",light_jacket:"Light jacket",fleece_jacket:"Fleece or boiled-wool jacket",fleece_suit:"Fleece suit",winter_jacket:"Winter jacket or boiled-wool overall",winter_suit:"Snowsuit",pyjamas:"Pyjamas",diaper_only:"Diaper only",sun_hat:"Sun hat with neck flap",thin_hat:"Thin hat",hat:"Hat",winter_hat:"Warm hat with ear flaps",mittens:"Mittens",scarf:"Neck scarf",barefoot:"Bare feet",thin_socks:"Thin socks",socks:"Socks",wool_socks:"Thick wool socks",shoes:"Shoes",leg_warmers:"Leg warmers",footmuff:"Footmuff",rain_cover:"Rain cover",blanket:"Blanket"},warning:{ueberhitzung:"Warmer than the recommended 16\u201320 \xB0C. Watch for overheating.",keine_muetze:"No hat in bed \u2014 babies release excess heat through the head.",uv:"Sun protection needed.",mittagszeit:"Avoid the sun between 11am and 3pm.",autositz:"No bulky jacket in the car seat \u2014 the harness would sit too loose.",trage_hitze:"Heat builds up in a carrier. Check the neck regularly."},hint:{carrier_legs:"Legs and feet are exposed \u2014 use leg warmers or thick socks.",car_seat:"Add the blanket over the lap only after buckling the harness.",stroller_rain_cover:"A rain cover traps heat. Ventilate regularly.",sleep_no_loose_bedding:"No loose blankets, no pillows."},measure:{shade:"Seek shade around midday",midday_indoors:"Spend the midday hours indoors where possible",avoid_outdoors:"Avoid time outdoors",uv_clothing:"Protective clothing (UPF 30+)",sun_hat_with_neck_flap:"Hat with brim and neck flap",no_direct_sun:"No direct sun in the first year of life"},situation:{kinderwagen:"Stroller",babytrage:"Carrier",auto:"Car",schlafen:"Sleep",zuhause:"At home",allgemein:"General"},info:{disclaimer:"General guidance, not medical advice -- trust your own judgement.",neck_test:"Check warmth at the neck or chest, not the hands or feet.",cold_hands:"Cool hands and feet are normal and not a sign of being cold."},error:{unavailable:"Not available"},level:{hitze:"Dress as lightly as possible",sehr_leicht:"Dress very lightly",leicht:"Dress lightly",mittel:"Dress moderately",warm:"Dress warmly",sehr_warm:"Dress very warmly",winterfest:"Dress for winter",tog_0_5:"Light sleeping bag",tog_1_0:"Medium-light sleeping bag",tog_2_5:"Standard sleeping bag",tog_3_5:"Warm sleeping bag"},label:{tog:"TOG",uv:"UV"}},Be={item:{short_sleeve_body:"Kurzarmbody",long_sleeve_body:"Langarmbody",light_long_suit:"Luftiger lang\xE4rmeliger Einteiler (UPF 30+)",light_trousers:"D\xFCnne lange Hose",trousers:"Leichte Hose",romper:"Strampler",sweater:"Pullover",vest:"D\xFCnne Weste oder J\xE4ckchen",light_jacket:"Leichte Jacke",fleece_jacket:"Fleece- oder Wollwalkjacke",fleece_suit:"Fleeceanzug",winter_jacket:"Winterjacke oder Wollwalkoverall",winter_suit:"Winteroverall",pyjamas:"Schlafanzug",diaper_only:"Nur Windel",sun_hat:"Sonnenhut mit Nackenschutz",thin_hat:"D\xFCnne M\xFCtze",hat:"M\xFCtze",winter_hat:"Warme M\xFCtze mit Ohrenschutz",mittens:"F\xE4ustlinge",scarf:"Halstuch",barefoot:"Barfu\xDF",thin_socks:"D\xFCnne S\xF6ckchen",socks:"Socken",wool_socks:"Dicke Wollsocken",shoes:"Schuhe",leg_warmers:"Stulpen",footmuff:"Fu\xDFsack",rain_cover:"Regenverdeck",blanket:"Decke"},warning:{ueberhitzung:"W\xE4rmer als die empfohlenen 16\u201320 \xB0C. Auf \xDCberhitzung achten.",keine_muetze:"Keine M\xFCtze im Bett \u2014 Babys geben \xFCbersch\xFCssige W\xE4rme \xFCber den Kopf ab.",uv:"Sonnenschutz n\xF6tig.",mittagszeit:"Zwischen 11 und 15 Uhr die Sonne meiden.",autositz:"Keine dicke Jacke im Autositz \u2014 der Gurt sitzt sonst zu locker.",trage_hitze:"In der Trage staut sich W\xE4rme. Nacken regelm\xE4\xDFig pr\xFCfen."},hint:{carrier_legs:"Beine und F\xFC\xDFe liegen frei \u2014 Stulpen oder dicke Socken.",car_seat:"Decke erst nach dem Anschnallen \xFCber den Scho\xDF legen.",stroller_rain_cover:"Ein Regenverdeck staut W\xE4rme. Regelm\xE4\xDFig l\xFCften.",sleep_no_loose_bedding:"Keine losen Decken, keine Kissen."},measure:{shade:"In der Mittagszeit Schatten aufsuchen",midday_indoors:"Mittagsstunden m\xF6glichst drinnen verbringen",avoid_outdoors:"Aufenthalt im Freien meiden",uv_clothing:"Sch\xFCtzende Kleidung (UPF 30+)",sun_hat_with_neck_flap:"Hut mit Schirm und Nackenschutz",no_direct_sun:"Keine direkte Sonne im ersten Lebensjahr"},situation:{kinderwagen:"Kinderwagen",babytrage:"Trage",auto:"Auto",schlafen:"Schlafen",zuhause:"Zuhause",allgemein:"Allgemein"},info:{disclaimer:"Allgemeine Orientierung, keine medizinische Beratung -- verlasse dich auf dein eigenes Urteilsverm\xF6gen.",neck_test:"W\xE4rme am Nacken oder Brustkorb pr\xFCfen, nicht an H\xE4nden oder F\xFC\xDFen.",cold_hands:"K\xFChle H\xE4nde und F\xFC\xDFe sind normal und kein Anzeichen von Frieren."},error:{unavailable:"Nicht verf\xFCgbar"},level:{hitze:"So leicht wie m\xF6glich anziehen",sehr_leicht:"Sehr leicht anziehen",leicht:"Leicht anziehen",mittel:"Mitteldick anziehen",warm:"Warm anziehen",sehr_warm:"Sehr warm anziehen",winterfest:"Winterfest anziehen",tog_0_5:"D\xFCnner Schlafsack",tog_1_0:"Leichter Schlafsack",tog_2_5:"Normaler Schlafsack",tog_3_5:"Dicker Schlafsack"},label:{tog:"TOG",uv:"UV"}},Fe={en:We,de:Be};function Ke(s){return s?.toLowerCase().startsWith("de")?"de":"en"}function g(s,e,t){return Fe[Ke(s)][e][t]??t}function Ve(s){if(!Array.isArray(s))return[...D];let e=s.filter(t=>D.includes(t));return e.length>0?e:[...D]}function we(s){if(typeof s!="object"||s===null)throw new Error("tinybreeze-card: configuration is missing");let e=s,t=e.entry;if(typeof t!="string"||t==="")throw new Error("tinybreeze-card: an entry (child) must be selected");let i=Ve(e.situations),n=e.default_situation,o=n&&i.includes(n)?n:i[0],r=h=>h!==!1;return{type:String(e.type??"custom:tinybreeze-card"),entry:t,situations:i,default_situation:o,show_weather:r(e.show_weather),show_room_temperature:r(e.show_room_temperature),show_uv:r(e.show_uv),show_age:r(e.show_age)}}function Se(s,e){return`sensor.${s}_kleidung_${e}`}function Ae(s){return`sensor.${s}_uv_schutz`}function ee(s){return`sensor.${s}_alter`}function ve(s){return Array.isArray(s)?s.map(e=>String(e)):[]}function $e(s){return s==null?null:Number(s)}function qe(s,e,t){let i=s.states[Se(e,t)];if(!i)return;let n=i.attributes;return{level:i.state,outfitKeys:ve(n.outfit_keys),layers:Number(n.layers??0),warnings:ve(n.warnings),hint:n.hint??null,baseTemperature:$e(n.base_temperature),tog:$e(n.tog)}}function xe(s){return 3+Math.ceil(s/2)}var be=new Set(["unavailable","unknown",""]);function ke(s,e,t,i){let n=Se(e,t),o=s.states[n],r=o&&!be.has(o.state)?qe(s,e,t):void 0,h=s.states[ee(e)],a=h&&!be.has(h.state)?Number(h.state):null;return r?{available:!0,missing:null,level:r.level,outfit:r.outfitKeys.map(u=>g(i,"item",u)),warnings:r.warnings.map(u=>g(i,"warning",u)),hint:r.hint?g(i,"hint",r.hint):null,baseTemperature:r.baseTemperature,tog:r.tog,ageMonths:a}:{available:!1,missing:n,level:"",outfit:[],warnings:[],hint:null,baseTemperature:null,tog:null,ageMonths:a}}var Ge=new Set(["schlafen","zuhause"]);function Ee(s){return Ge.has(s)}function Ce(s){return s.split(/[_\s-]+/).filter(e=>e.length>0).map(e=>e[0].toUpperCase()+e.slice(1)).join(" ")}var M=class extends v{constructor(){super(...arguments);this._infoOpen=!1}static getStubConfig(){return{type:"custom:tinybreeze-card",entry:""}}static getConfigElement(){return document.createElement("tinybreeze-card-editor")}setConfig(t){this._config=we(t),this._situation=this._config.default_situation}getCardSize(){return xe(this._model()?.outfit.length??0)}get _language(){return this.hass?.locale?.language??"en"}_model(){if(!(!this.hass||!this._config||!this._situation))return ke(this.hass,this._config.entry,this._situation,this._language)}_ageUnit(){let t=this._config?.entry;if(!t||!this.hass)return"";let i=this.hass.states[ee(t)]?.attributes.unit_of_measurement;return typeof i=="string"?i:""}_uvIndex(){let t=this._config?.entry;if(!t||!this.hass)return null;let i=this.hass.states[Ae(t)]?.attributes.uv_index;return typeof i=="number"?i:i==null?null:Number(i)}_selectSituation(t){this._situation=t}_toggleInfo(){this._infoOpen=!this._infoOpen}render(){if(!this._config)return l;let t=this._language,i=this._model();return p`
      <ha-card>
        <div class="header">
          <div class="title">
            <span class="name">${Ce(this._config.entry)}</span>
            ${this._config.show_age?this._age(i):l}
          </div>
          <button
            class="info-toggle"
            title=${g(t,"info","disclaimer")}
            aria-label=${g(t,"info","disclaimer")}
            @click=${this._toggleInfo}
          >
            <ha-icon icon="mdi:information-outline"></ha-icon>
          </button>
        </div>

        <div class="chips">
          ${this._config.situations.map(n=>this._chip(n,t))}
        </div>

        ${this._infoOpen?this._infoPanel(t):l}
        ${i?.available?this._body(i,t):this._unavailable(i,t)}
      </ha-card>
    `}_age(t){if(!t||t.ageMonths===null)return l;let i=this._ageUnit();return p`<span class="age">· ${t.ageMonths}${i?` ${i}`:""}</span>`}_chip(t,i){return p`
      <button
        class="chip ${t===this._situation?"selected":""}"
        @click=${()=>this._selectSituation(t)}
      >
        ${g(i,"situation",t)}
      </button>
    `}_infoPanel(t){return p`
      <div class="info-panel">
        <p>${g(t,"info","disclaimer")}</p>
        <p>${g(t,"info","neck_test")}</p>
        <p>${g(t,"info","cold_hands")}</p>
      </div>
    `}_unavailable(t,i){let n=g(i,"error","unavailable");return p`
      <div class="notice error">
        ${n}${t?.missing?p`: ${t.missing}`:l}
      </div>
    `}_body(t,i){return p`
      ${t.warnings.length?this._warnings(t.warnings):l}
      <div class="level">${this._heading(t,i)}</div>
      ${t.tog!==null?p`<div class="tog">${g(i,"label","tog")} ${t.tog}</div>`:l}
      <ul class="outfit">
        ${t.outfit.map(n=>p`<li>${n}</li>`)}
      </ul>
      ${t.hint?p`<div class="hint">${t.hint}</div>`:l}
      ${this._context(t,i)}
    `}_warnings(t){return p`
      <div class="warnings">
        ${t.map(i=>p`
            <div class="warning-row">
              <ha-icon icon="mdi:alert"></ha-icon>
              <span>${i}</span>
            </div>
          `)}
      </div>
    `}_heading(t,i){return g(i,"level",t.level)}_context(t,i){if(!this._config||!this._situation)return l;let n=Ee(this._situation),o=n?this._config.show_room_temperature:this._config.show_weather,r=[];if(o&&t.baseTemperature!==null&&r.push(p`
        <span class="context-item">
          <ha-icon
            icon=${n?"mdi:home-thermometer-outline":"mdi:thermometer"}
          ></ha-icon>
          ${t.baseTemperature}&nbsp;°C
        </span>
      `),this._config.show_uv){let h=this._uvIndex();h!==null&&r.push(p`
          <span class="context-item">
            <ha-icon icon="mdi:weather-sunny-alert"></ha-icon>
            ${g(i,"label","uv")}&nbsp;${h}
          </span>
        `)}return r.length?p`<div class="context-row">${r}</div>`:l}};M.properties={hass:{attribute:!1},_config:{state:!0},_situation:{state:!0},_infoOpen:{state:!0}},M.styles=I`
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
  `;customElements.get("tinybreeze-card")||(customElements.define("tinybreeze-card",M),window.customCards=window.customCards??[],window.customCards.push({type:"tinybreeze-card",name:"Tinybreeze",description:"What to dress your baby in, right now.",preview:!1,documentationURL:"https://github.com/dbackhove/ha-tinybreeze"}));})();
