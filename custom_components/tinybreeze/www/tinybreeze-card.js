/* Tinybreeze card -- built from frontend/src, do not edit by hand. */
"use strict";(()=>{var U=globalThis,H=U.ShadowRoot&&(U.ShadyCSS===void 0||U.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,I=Symbol(),te=new WeakMap,k=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==I)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(H&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=te.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&te.set(t,e))}return e}toString(){return this.cssText}},ne=s=>new k(typeof s=="string"?s:s+"",void 0,I),W=(s,...e)=>{let t=s.length===1?s[0]:e.reduce((n,i,r)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+s[r+1],s[0]);return new k(t,s,I)},ie=(s,e)=>{if(H)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),i=U.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=t.cssText,s.appendChild(n)}},D=H?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return ne(t)})(s):s;var{is:Ce,defineProperty:Te,getOwnPropertyDescriptor:Re,getOwnPropertyNames:ze,getOwnPropertySymbols:Ne,getPrototypeOf:Pe}=Object,O=globalThis,se=O.trustedTypes,Me=se?se.emptyScript:"",Ue=O.reactiveElementPolyfillSupport,E=(s,e)=>s,B={toAttribute(s,e){switch(e){case Boolean:s=s?Me:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},oe=(s,e)=>!Ce(s,e),re={attribute:!0,type:String,converter:B,reflect:!1,useDefault:!1,hasChanged:oe};Symbol.metadata??=Symbol("metadata"),O.litPropertyMetadata??=new WeakMap;var m=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=re){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),i=this.getPropertyDescriptor(e,n,t);i!==void 0&&Te(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){let{get:i,set:r}=Re(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:i,set(o){let h=i?.call(this);r?.call(this,o),this.requestUpdate(e,h,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??re}static _$Ei(){if(this.hasOwnProperty(E("elementProperties")))return;let e=Pe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(E("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(E("properties"))){let t=this.properties,n=[...ze(t),...Ne(t)];for(let i of n)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,i]of t)this.elementProperties.set(n,i)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let i=this._$Eu(t,n);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let i of n)t.unshift(D(i))}else e!==void 0&&t.push(D(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ie(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:B).toAttribute(t,n.type);this._$Em=e,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){let n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let r=n.getPropertyOptions(i),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:B;this._$Em=i;let h=o.fromAttribute(t,r.type);this[i]=h??this._$Ej?.get(i)??h,this._$Em=null}}requestUpdate(e,t,n,i=!1,r){if(e!==void 0){let o=this.constructor;if(i===!1&&(r=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??oe)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:r},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[i,r]of n){let{wrapped:o}=r,h=this[i];o!==!0||this._$AL.has(i)||h===void 0||this.C(i,void 0,r,h)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};m.elementStyles=[],m.shadowRootOptions={mode:"open"},m[E("elementProperties")]=new Map,m[E("finalized")]=new Map,Ue?.({ReactiveElement:m}),(O.reactiveElementVersions??=[]).push("2.1.2");var Z=globalThis,ae=s=>s,L=Z.trustedTypes,le=L?L.createPolicy("lit-html",{createHTML:s=>s}):void 0,ge="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,fe="?"+y,He=`<${fe}>`,w=document,T=()=>w.createComment(""),R=s=>s===null||typeof s!="object"&&typeof s!="function",Q=Array.isArray,Oe=s=>Q(s)||typeof s?.[Symbol.iterator]=="function",F=`[ 	
\f\r]`,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,he=/-->/g,ce=/>/g,$=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ue=/'/g,de=/"/g,me=/^(?:script|style|textarea|title)$/i,X=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),p=X(1),Ye=X(2),et=X(3),A=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),pe=new WeakMap,b=w.createTreeWalker(w,129);function _e(s,e){if(!Q(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return le!==void 0?le.createHTML(e):e}var Le=(s,e)=>{let t=s.length-1,n=[],i,r=e===2?"<svg>":e===3?"<math>":"",o=C;for(let h=0;h<t;h++){let a=s[h],u,d,c=-1,f=0;for(;f<a.length&&(o.lastIndex=f,d=o.exec(a),d!==null);)f=o.lastIndex,o===C?d[1]==="!--"?o=he:d[1]!==void 0?o=ce:d[2]!==void 0?(me.test(d[2])&&(i=RegExp("</"+d[2],"g")),o=$):d[3]!==void 0&&(o=$):o===$?d[0]===">"?(o=i??C,c=-1):d[1]===void 0?c=-2:(c=o.lastIndex-d[2].length,u=d[1],o=d[3]===void 0?$:d[3]==='"'?de:ue):o===de||o===ue?o=$:o===he||o===ce?o=C:(o=$,i=void 0);let _=o===$&&s[h+1].startsWith("/>")?" ":"";r+=o===C?a+He:c>=0?(n.push(u),a.slice(0,c)+ge+a.slice(c)+y+_):a+y+(c===-2?h:_)}return[_e(s,r+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},z=class s{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let r=0,o=0,h=e.length-1,a=this.parts,[u,d]=Le(e,t);if(this.el=s.createElement(u,n),b.currentNode=this.el.content,t===2||t===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(i=b.nextNode())!==null&&a.length<h;){if(i.nodeType===1){if(i.hasAttributes())for(let c of i.getAttributeNames())if(c.endsWith(ge)){let f=d[o++],_=i.getAttribute(c).split(y),M=/([.?@])?(.*)/.exec(f);a.push({type:1,index:r,name:M[2],strings:_,ctor:M[1]==="."?V:M[1]==="?"?q:M[1]==="@"?G:x}),i.removeAttribute(c)}else c.startsWith(y)&&(a.push({type:6,index:r}),i.removeAttribute(c));if(me.test(i.tagName)){let c=i.textContent.split(y),f=c.length-1;if(f>0){i.textContent=L?L.emptyScript:"";for(let _=0;_<f;_++)i.append(c[_],T()),b.nextNode(),a.push({type:2,index:++r});i.append(c[f],T())}}}else if(i.nodeType===8)if(i.data===fe)a.push({type:2,index:r});else{let c=-1;for(;(c=i.data.indexOf(y,c+1))!==-1;)a.push({type:7,index:r}),c+=y.length-1}r++}}static createElement(e,t){let n=w.createElement("template");return n.innerHTML=e,n}};function S(s,e,t=s,n){if(e===A)return e;let i=n!==void 0?t._$Co?.[n]:t._$Cl,r=R(e)?void 0:e._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(s),i._$AT(s,t,n)),n!==void 0?(t._$Co??=[])[n]=i:t._$Cl=i),i!==void 0&&(e=S(s,i._$AS(s,e.values),i,n)),e}var K=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??w).importNode(t,!0);b.currentNode=i;let r=b.nextNode(),o=0,h=0,a=n[0];for(;a!==void 0;){if(o===a.index){let u;a.type===2?u=new N(r,r.nextSibling,this,e):a.type===1?u=new a.ctor(r,a.name,a.strings,this,e):a.type===6&&(u=new J(r,this,e)),this._$AV.push(u),a=n[++h]}o!==a?.index&&(r=b.nextNode(),o++)}return b.currentNode=w,i}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},N=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=S(this,e,t),R(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==A&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Oe(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&R(this._$AH)?this._$AA.nextSibling.data=e:this.T(w.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=z.createElement(_e(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{let r=new K(i,this),o=r.u(this.options);r.p(t),this.T(o),this._$AH=r}}_$AC(e){let t=pe.get(e.strings);return t===void 0&&pe.set(e.strings,t=new z(e)),t}k(e){Q(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,i=0;for(let r of e)i===t.length?t.push(n=new s(this.O(T()),this.O(T()),this,this.options)):n=t[i],n._$AI(r),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=ae(e).nextSibling;ae(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},x=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,r){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=l}_$AI(e,t=this,n,i){let r=this.strings,o=!1;if(r===void 0)e=S(this,e,t,0),o=!R(e)||e!==this._$AH&&e!==A,o&&(this._$AH=e);else{let h=e,a,u;for(e=r[0],a=0;a<r.length-1;a++)u=S(this,h[n+a],t,a),u===A&&(u=this._$AH[a]),o||=!R(u)||u!==this._$AH[a],u===l?e=l:e!==l&&(e+=(u??"")+r[a+1]),this._$AH[a]=u}o&&!i&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},V=class extends x{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}},q=class extends x{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}},G=class extends x{constructor(e,t,n,i,r){super(e,t,n,i,r),this.type=5}_$AI(e,t=this){if((e=S(this,e,t,0)??l)===A)return;let n=this._$AH,i=e===l&&n!==l||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==l&&(n===l||i);i&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},J=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){S(this,e)}};var je=Z.litHtmlPolyfillSupport;je?.(z,N),(Z.litHtmlVersions??=[]).push("3.3.3");var ye=(s,e,t)=>{let n=t?.renderBefore??e,i=n._$litPart$;if(i===void 0){let r=t?.renderBefore??null;n._$litPart$=i=new N(e.insertBefore(T(),r),r,void 0,t??{})}return i._$AI(s),i};var Y=globalThis,v=class extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ye(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};v._$litElement$=!0,v.finalized=!0,Y.litElementHydrateSupport?.({LitElement:v});var Ie=Y.litElementPolyfillSupport;Ie?.({LitElement:v});(Y.litElementVersions??=[]).push("4.2.2");var j=["kinderwagen","babytrage","auto","schlafen","zuhause","allgemein"];var We={item:{short_sleeve_body:"Short-sleeve bodysuit",long_sleeve_body:"Long-sleeve bodysuit",light_long_suit:"Lightweight long-sleeve sun suit (UPF 30+)",light_trousers:"Thin long trousers",trousers:"Light trousers",romper:"Romper",sweater:"Sweater",vest:"Thin vest or light cardigan",light_jacket:"Light jacket",fleece_jacket:"Fleece or boiled-wool jacket",fleece_suit:"Fleece suit",winter_jacket:"Winter jacket or boiled-wool overall",winter_suit:"Snowsuit",pyjamas:"Pyjamas",diaper_only:"Diaper only",sun_hat:"Sun hat with neck flap",thin_hat:"Thin hat",hat:"Hat",winter_hat:"Warm hat with ear flaps",mittens:"Mittens",scarf:"Neck scarf",barefoot:"Bare feet",thin_socks:"Thin socks",socks:"Socks",wool_socks:"Thick wool socks",shoes:"Shoes",leg_warmers:"Leg warmers",footmuff:"Footmuff",rain_cover:"Rain cover",blanket:"Blanket"},warning:{ueberhitzung:"Warmer than the recommended 16\u201320 \xB0C. Watch for overheating.",keine_muetze:"No hat in bed \u2014 babies release excess heat through the head.",uv:"Sun protection needed.",mittagszeit:"Avoid the sun between 11am and 3pm.",autositz:"No bulky jacket in the car seat \u2014 the harness would sit too loose.",trage_hitze:"Heat builds up in a carrier. Check the neck regularly."},hint:{carrier_legs:"Legs and feet are exposed \u2014 use leg warmers or thick socks.",car_seat:"Add the blanket over the lap only after buckling the harness.",stroller_rain_cover:"A rain cover traps heat. Ventilate regularly.",sleep_no_loose_bedding:"No loose blankets, no pillows."},measure:{shade:"Seek shade around midday",midday_indoors:"Spend the midday hours indoors where possible",avoid_outdoors:"Avoid time outdoors",uv_clothing:"Protective clothing (UPF 30+)",sun_hat_with_neck_flap:"Hat with brim and neck flap",no_direct_sun:"No direct sun in the first year of life"},situation:{kinderwagen:"Stroller",babytrage:"Carrier",auto:"Car",schlafen:"Sleep",zuhause:"At home",allgemein:"General"},info:{disclaimer:"General guidance, not medical advice -- trust your own judgement.",neck_test:"Check warmth at the neck or chest, not the hands or feet.",cold_hands:"Cool hands and feet are normal and not a sign of being cold."},error:{unavailable:"Not available"}},De={item:{short_sleeve_body:"Kurzarmbody",long_sleeve_body:"Langarmbody",light_long_suit:"Luftiger lang\xE4rmeliger Einteiler (UPF 30+)",light_trousers:"D\xFCnne lange Hose",trousers:"Leichte Hose",romper:"Strampler",sweater:"Pullover",vest:"D\xFCnne Weste oder J\xE4ckchen",light_jacket:"Leichte Jacke",fleece_jacket:"Fleece- oder Wollwalkjacke",fleece_suit:"Fleeceanzug",winter_jacket:"Winterjacke oder Wollwalkoverall",winter_suit:"Winteroverall",pyjamas:"Schlafanzug",diaper_only:"Nur Windel",sun_hat:"Sonnenhut mit Nackenschutz",thin_hat:"D\xFCnne M\xFCtze",hat:"M\xFCtze",winter_hat:"Warme M\xFCtze mit Ohrenschutz",mittens:"F\xE4ustlinge",scarf:"Halstuch",barefoot:"Barfu\xDF",thin_socks:"D\xFCnne S\xF6ckchen",socks:"Socken",wool_socks:"Dicke Wollsocken",shoes:"Schuhe",leg_warmers:"Stulpen",footmuff:"Fu\xDFsack",rain_cover:"Regenverdeck",blanket:"Decke"},warning:{ueberhitzung:"W\xE4rmer als die empfohlenen 16\u201320 \xB0C. Auf \xDCberhitzung achten.",keine_muetze:"Keine M\xFCtze im Bett \u2014 Babys geben \xFCbersch\xFCssige W\xE4rme \xFCber den Kopf ab.",uv:"Sonnenschutz n\xF6tig.",mittagszeit:"Zwischen 11 und 15 Uhr die Sonne meiden.",autositz:"Keine dicke Jacke im Autositz \u2014 der Gurt sitzt sonst zu locker.",trage_hitze:"In der Trage staut sich W\xE4rme. Nacken regelm\xE4\xDFig pr\xFCfen."},hint:{carrier_legs:"Beine und F\xFC\xDFe liegen frei \u2014 Stulpen oder dicke Socken.",car_seat:"Decke erst nach dem Anschnallen \xFCber den Scho\xDF legen.",stroller_rain_cover:"Ein Regenverdeck staut W\xE4rme. Regelm\xE4\xDFig l\xFCften.",sleep_no_loose_bedding:"Keine losen Decken, keine Kissen."},measure:{shade:"In der Mittagszeit Schatten aufsuchen",midday_indoors:"Mittagsstunden m\xF6glichst drinnen verbringen",avoid_outdoors:"Aufenthalt im Freien meiden",uv_clothing:"Sch\xFCtzende Kleidung (UPF 30+)",sun_hat_with_neck_flap:"Hut mit Schirm und Nackenschutz",no_direct_sun:"Keine direkte Sonne im ersten Lebensjahr"},situation:{kinderwagen:"Kinderwagen",babytrage:"Trage",auto:"Auto",schlafen:"Schlafen",zuhause:"Zuhause",allgemein:"Allgemein"},info:{disclaimer:"Allgemeine Orientierung, keine medizinische Beratung -- verlasse dich auf dein eigenes Urteilsverm\xF6gen.",neck_test:"W\xE4rme am Nacken oder Brustkorb pr\xFCfen, nicht an H\xE4nden oder F\xFC\xDFen.",cold_hands:"K\xFChle H\xE4nde und F\xFC\xDFe sind normal und kein Anzeichen von Frieren."},error:{unavailable:"Nicht verf\xFCgbar"}},Be={en:We,de:De};function Fe(s){return s?.toLowerCase().startsWith("de")?"de":"en"}function g(s,e,t){return Be[Fe(s)][e][t]??t}function Ke(s){if(!Array.isArray(s))return[...j];let e=s.filter(t=>j.includes(t));return e.length>0?e:[...j]}function be(s){if(typeof s!="object"||s===null)throw new Error("tinybreeze-card: configuration is missing");let e=s,t=e.entry;if(typeof t!="string"||t==="")throw new Error("tinybreeze-card: an entry (child) must be selected");let n=Ke(e.situations),i=e.default_situation,r=i&&n.includes(i)?i:n[0],o=h=>h!==!1;return{type:String(e.type??"custom:tinybreeze-card"),entry:t,situations:n,default_situation:r,show_weather:o(e.show_weather),show_room_temperature:o(e.show_room_temperature),show_uv:o(e.show_uv),show_age:o(e.show_age)}}function we(s,e){return`sensor.${s}_kleidung_${e}`}function Ae(s){return`sensor.${s}_uv_schutz`}function ee(s){return`sensor.${s}_alter`}function ve(s){return Array.isArray(s)?s.map(e=>String(e)):[]}function $e(s){return s==null?null:Number(s)}function Ve(s,e,t){let n=s.states[we(e,t)];if(!n)return;let i=n.attributes;return{level:n.state,outfitKeys:ve(i.outfit_keys),layers:Number(i.layers??0),warnings:ve(i.warnings),hint:i.hint??null,baseTemperature:$e(i.base_temperature),tog:$e(i.tog)}}function Se(s){return 3+Math.ceil(s/2)}var qe=new Set(["unavailable","unknown",""]);function xe(s,e,t,n){let i=we(e,t),r=s.states[i],o=r&&!qe.has(r.state)?Ve(s,e,t):void 0,h=s.states[ee(e)],a=h?Number(h.state):null;return o?{available:!0,missing:null,level:o.level,outfit:o.outfitKeys.map(u=>g(n,"item",u)),warnings:o.warnings.map(u=>g(n,"warning",u)),hint:o.hint?g(n,"hint",o.hint):null,baseTemperature:o.baseTemperature,tog:o.tog,ageMonths:a}:{available:!1,missing:i,level:"",outfit:[],warnings:[],hint:null,baseTemperature:null,tog:null,ageMonths:a}}var Ge=new Set(["schlafen","zuhause"]);function ke(s){return Ge.has(s)}function Ee(s){return s.split(/[_\s-]+/).filter(e=>e.length>0).map(e=>e[0].toUpperCase()+e.slice(1)).join(" ")}var P=class extends v{constructor(){super(...arguments);this._infoOpen=!1}static getStubConfig(){return{type:"custom:tinybreeze-card",entry:""}}static getConfigElement(){return document.createElement("tinybreeze-card-editor")}setConfig(t){this._config=be(t),this._situation=this._config.default_situation}getCardSize(){return Se(this._model()?.outfit.length??0)}get _language(){return this.hass?.locale?.language??"en"}_model(){if(!(!this.hass||!this._config||!this._situation))return xe(this.hass,this._config.entry,this._situation,this._language)}_ageUnit(){let t=this._config?.entry;if(!t||!this.hass)return"";let n=this.hass.states[ee(t)]?.attributes.unit_of_measurement;return typeof n=="string"?n:""}_uvIndex(){let t=this._config?.entry;if(!t||!this.hass)return null;let n=this.hass.states[Ae(t)]?.attributes.uv_index;return typeof n=="number"?n:n==null?null:Number(n)}_selectSituation(t){this._situation=t}_toggleInfo(){this._infoOpen=!this._infoOpen}render(){if(!this._config)return l;let t=this._language,n=this._model();return p`
      <ha-card>
        <div class="header">
          <div class="title">
            <span class="name">${Ee(this._config.entry)}</span>
            ${this._config.show_age?this._age(n):l}
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
          ${this._config.situations.map(i=>this._chip(i,t))}
        </div>

        ${this._infoOpen?this._infoPanel(t):l}
        ${n?.available?this._body(n):this._unavailable(n,t)}
      </ha-card>
    `}_age(t){if(!t||t.ageMonths===null)return l;let n=this._ageUnit();return p`<span class="age">· ${t.ageMonths}${n?` ${n}`:""}</span>`}_chip(t,n){return p`
      <button
        class="chip ${t===this._situation?"selected":""}"
        @click=${()=>this._selectSituation(t)}
      >
        ${g(n,"situation",t)}
      </button>
    `}_infoPanel(t){return p`
      <div class="info-panel">
        <p>${g(t,"info","disclaimer")}</p>
        <p>${g(t,"info","neck_test")}</p>
        <p>${g(t,"info","cold_hands")}</p>
      </div>
    `}_unavailable(t,n){let i=g(n,"error","unavailable");return p`
      <div class="notice error">
        ${i}${t?.missing?p`: ${t.missing}`:l}
      </div>
    `}_body(t){return p`
      ${t.warnings.length?this._warnings(t.warnings):l}
      <div class="level">${this._heading(t)}</div>
      <ul class="outfit">
        ${t.outfit.map(n=>p`<li>${n}</li>`)}
      </ul>
      ${t.hint?p`<div class="hint">${t.hint}</div>`:l}
      ${this._context(t)}
    `}_warnings(t){return p`
      <div class="warnings">
        ${t.map(n=>p`
            <div class="warning-row">
              <ha-icon icon="mdi:alert"></ha-icon>
              <span>${n}</span>
            </div>
          `)}
      </div>
    `}_heading(t){return t.tog!==null?`TOG ${t.tog}`:t.level.length?t.level[0].toUpperCase()+t.level.slice(1):""}_context(t){if(!this._config||!this._situation)return l;let n=ke(this._situation),i=n?this._config.show_room_temperature:this._config.show_weather,r=[];if(i&&t.baseTemperature!==null&&r.push(p`
        <span class="context-item">
          <ha-icon
            icon=${n?"mdi:home-thermometer-outline":"mdi:thermometer"}
          ></ha-icon>
          ${t.baseTemperature}&nbsp;°C
        </span>
      `),this._config.show_uv){let o=this._uvIndex();o!==null&&r.push(p`
          <span class="context-item">
            <ha-icon icon="mdi:weather-sunny-alert"></ha-icon>
            UV&nbsp;${o}
          </span>
        `)}return r.length?p`<div class="context-row">${r}</div>`:l}};P.properties={hass:{attribute:!1},_config:{state:!0},_situation:{state:!0},_infoOpen:{state:!0}},P.styles=W`
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
      background: var(--primary-color);
      border-color: var(--primary-color);
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
  `;customElements.get("tinybreeze-card")||(customElements.define("tinybreeze-card",P),window.customCards=window.customCards??[],window.customCards.push({type:"tinybreeze-card",name:"Tinybreeze",description:"What to dress your baby in, right now.",preview:!1,documentationURL:"https://github.com/dbackhove/ha-tinybreeze"}));})();
