import{b as z}from"./chunk-UQMKFLC2.js";import{b as E}from"./chunk-UMAII2Q6.js";import"./chunk-MMO57O6B.js";import"./chunk-N6QZDHOG.js";import{$ as v,A as d,Bc as T,F as n,G as b,Ga as j,J as h,L as y,M as l,O as w,P as M,R as s,S as r,T as c,Ta as B,Ua as Q,Xa as G,_ as x,eb as N,hc as i,i as g,j as m,jc as P,ka as C,l as f,la as I,lc as k,ma as S,na as $,q as a,sa as D,ta as F,xc as _}from"./chunk-ZVCAS5FJ.js";var q=["*"],J=({dt:p})=>`
.p-inputgroup,
.p-inputgroup .p-floatlabel,
.p-inputgroup .p-iftalabel {
    display: flex;
    align-items: stretch;
    width: 100%;
}

.p-inputgroup .p-inputtext,
.p-inputgroup .p-inputwrapper {
    flex: 1 1 auto;
    width: 1%;
}

.p-inputgroupaddon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${p("inputgroup.addon.padding")};
    background: ${p("inputgroup.addon.background")};
    color: ${p("inputgroup.addon.color")};
    border-block-start: 1px solid ${p("inputgroup.addon.border.color")};
    border-block-end: 1px solid ${p("inputgroup.addon.border.color")};
    min-width: ${p("inputgroup.addon.min.width")};
}

.p-inputgroupaddon:first-child,
.p-inputgroupaddon + .p-inputgroupaddon {
    border-inline-start: 1px solid ${p("inputgroup.addon.border.color")};
}

.p-inputgroupaddon:last-child {
    border-inline-end: 1px solid ${p("inputgroup.addon.border.color")};
}

.p-inputgroupaddon:has(.p-button) {
    padding: 0;
    overflow: hidden;
}

.p-inputgroupaddon .p-button {
    border-radius: 0;
}

.p-inputgroup > .p-component,
.p-inputgroup > .p-inputwrapper > .p-component,
.p-inputgroup:first-child > p-button > .p-button,
.p-inputgroup > .p-floatlabel > .p-component,
.p-inputgroup > .p-floatlabel > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iftalabel > .p-component,
.p-inputgroup > .p-iftalabel > .p-inputwrapper > .p-component {
    border-radius: 0;
    margin: 0;
}

.p-inputgroupaddon:first-child,
.p-inputgroup > .p-component:first-child,
.p-inputgroup > .p-inputwrapper:first-child > .p-component,
.p-inputgroup > .p-floatlabel:first-child > .p-component,
.p-inputgroup > .p-floatlabel:first-child > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iftalabel:first-child > .p-component,
.p-inputgroup > .p-iftalabel:first-child > .p-inputwrapper > .p-component {
    border-start-start-radius: ${p("inputgroup.addon.border.radius")};
    border-end-start-radius: ${p("inputgroup.addon.border.radius")};
}

.p-inputgroupaddon:last-child,
.p-inputgroup > .p-component:last-child,
.p-inputgroup > .p-inputwrapper:last-child > .p-component,
.p-inputgroup > .p-floatlabel:last-child > .p-component,
.p-inputgroup > .p-floatlabel:last-child > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iftalabel:last-child > .p-component,
.p-inputgroup > .p-iftalabel:last-child > .p-inputwrapper > .p-component {
    border-start-end-radius: ${p("inputgroup.addon.border.radius")};
    border-end-end-radius: ${p("inputgroup.addon.border.radius")};
}

.p-inputgroup .p-component:focus,
.p-inputgroup .p-component.p-focus,
.p-inputgroup .p-inputwrapper-focus,
.p-inputgroup .p-component:focus ~ label,
.p-inputgroup .p-component.p-focus ~ label,
.p-inputgroup .p-inputwrapper-focus ~ label {
    z-index: 1;
}

.p-inputgroup > .p-button:not(.p-button-icon-only) {
    width: auto;
}

/*For PrimeNG*/

.p-inputgroup p-button:first-child, .p-inputgroup p-button:last-child {
    display: inline-flex;
}

.p-inputgroup:has(> p-button:first-child) .p-button{
    border-start-start-radius: ${p("inputgroup.addon.border.radius")};
    border-end-start-radius: ${p("inputgroup.addon.border.radius")};
}

.p-inputgroup:has(> p-button:last-child) .p-button {
    border-start-end-radius: ${p("inputgroup.addon.border.radius")};
    border-end-end-radius: ${p("inputgroup.addon.border.radius")};
}
`,K={root:({props:p})=>["p-inputgroup",{"p-inputgroup-fluid":p.fluid}]},W=(()=>{class p extends P{name="inputgroup";theme=J;classes=K;static \u0275fac=(()=>{let t;return function(e){return(t||(t=a(p)))(e||p)}})();static \u0275prov=g({token:p,factory:p.\u0275fac})}return p})();var O=(()=>{class p extends k{style;styleClass;_componentStyle=f(W);static \u0275fac=(()=>{let t;return function(e){return(t||(t=a(p)))(e||p)}})();static \u0275cmp=n({type:p,selectors:[["p-inputgroup"],["p-inputGroup"],["p-input-group"]],hostAttrs:[1,"p-inputgroup"],hostVars:5,hostBindings:function(o,e){o&2&&(y("data-pc-name","inputgroup"),w(e.style),M(e.styleClass))},inputs:{style:"style",styleClass:"styleClass"},features:[$([W]),h],ngContentSelectors:q,decls:1,vars:0,template:function(o,e){o&1&&(x(),v(0))},dependencies:[j,i],encapsulation:2})}return p})(),A=(()=>{class p{static \u0275fac=function(o){return new(o||p)};static \u0275mod=b({type:p});static \u0275inj=m({imports:[O,i,i]})}return p})();var L=class p{searchQuery="";clearSearch(){this.searchQuery=""}static \u0275fac=function(t){return new(t||p)};static \u0275cmp=n({type:p,selectors:[["app-search"]],decls:8,vars:5,consts:[[1,"p-4"],[1,"max-w-2xl","mx-auto"],[1,"flex","items-center","rounded-full","overflow-hidden","bg-gray-800"],[1,"flex","items-center","justify-center","w-12","h-12","bg-gray-700"],[1,"pi","pi-search","text-gray-400","text-lg"],["type","text",1,"flex-1","px-4","py-3","bg-transparent","text-white","placeholder-gray-500","border-none","focus:outline-none","focus:ring-0",3,"ngModelChange","ngModel","placeholder"],[1,"mt-6",3,"searchQuery"]],template:function(t,o){t&1&&(s(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3),c(4,"i",4),r(),s(5,"input",5),D(6,"localize"),S("ngModelChange",function(u){return I(o.searchQuery,u)||(o.searchQuery=u),u}),r()(),c(7,"publications-container",6),r()()),t&2&&(d(5),C("ngModel",o.searchQuery),l("placeholder",F(6,3,"SearchPosts")),d(2),l("searchQuery",o.searchQuery))},dependencies:[N,B,Q,G,z,A,_,E,T],encapsulation:2})};export{L as SearchComponent};
