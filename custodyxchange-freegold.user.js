// ==UserScript==
// @name         Custody-X-Change Free Gold
// @namespace    notmike101/cxc-freegold
// @version      1
// @description  Give gold for free
// @author       Mike Orozco
// @match        https://app.custodyxchange.com/*
// @grant        GM.xmlhttpRequest
// @run-at       document-start
//
// @downloadURL  https://gitlab.com/notmike101/custody-x-change-free-gold/raw/master/custodyxchange-freegold.user.js
// @updateURL    https://gitlab.com/notmike101/custody-x-change-free-gold/raw/master/custodyxchange-freegold.meta.js

// ==/UserScript==

var open_prototype = XMLHttpRequest.prototype.open,
intercept_response = function(urlpattern, callback) {
   XMLHttpRequest.prototype.open = function() {
      arguments['1'].match(urlpattern) && this.addEventListener('readystatechange', function(event) {
         if ( this.readyState === 4 ) {
            var response = callback(event.target.responseText);
            Object.defineProperty(this, 'response', {writable: true});
            Object.defineProperty(this, 'responseText', {writable: true});
            this.response = this.responseText = response;

             console.log(this);
         }
      });
      return open_prototype.apply(this, arguments);
   };
};

intercept_response(/\api\/account/gim,(response) => {
    var newResponse = response.replace(/"planId"\:[0-9]{4},/gim, '"planId":3001,')
        .replace(/"activePlan"\:"[a-zA-Z]+",/gim, '"activePlan":"Gold",')
        .replace(/"lifetimeLicense"\:(true|false),/gim, '"lifetimeLicense":true,')
        .replace(/"calculationsDisplay"\:[0-9],/gim, '"calculationsDisplay":0,');
    return newResponse;
});

(function() {
    'use strict';

    function addScript(text) {
        const replacer = new RegExp(`n.prototype.hasGoldPermissions=function(){return this.testPackage([tp.PACKAGE_GOLD,tp.PACKAGE_PROFESSIONAL_GOLD])};`,'gim');
        text = text.replace(replacer, "n.prototype.hasGoldPermissions=true;");

        var newScript = document.createElement('script');
        newScript.type = "text/javascript";
        newScript.textContent = text;
        document.head.appendChild(newScript);
        console.log('script added');
    }

    window.addEventListener('beforescriptexecute', function(e) {
        src = e.target.src;
        if (src.search(/main\.bundle\.js/) != -1) {
            e.preventDefault();
            e.stopPropagation();
            GM_xmlhttpRequest({
                method: "GET",
                url: e.target.src,
                onload: function(response) {
                    addScript(response.responseText);
                }
            });
        }
    });
})();