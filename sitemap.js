/* === Flicker Defender === */
if (typeof (Evergage.FlickerDefender || {}).setPageMatchTimeout === "function") {
    Evergage.FlickerDefender.setPageMatchTimeout(2500);
}

if (typeof (Evergage.FlickerDefender || {}).setRedisplayTimeout === "function") {
    Evergage.FlickerDefender.setRedisplayTimeout(5000);
}


/* ==== Wait and make sure dataLayer is loaded before attempting sitemap. ==== */

var dataLayerPromise = new Promise((resolve, reject) => {
    let intervalCount = 0; 
    const interval = setInterval(() => {
        intervalCount += 1;
        if ((typeof dataLayer !== "undefined" && getMainPageType().length !== 0) || (isLandingPage() && typeof dataLayer !== "undefined")) {
            consoleDebug('success - intervalcount is ' + intervalCount);
            clearInterval(interval);
            resolve(true);
        } 
        else {
            if (intervalCount > 500) {
                consoleDebug('failure - intervalcount is ' + intervalCount);
                clearInterval(interval);
                resolve(false);
            }
        }
    }, 100);
}); 

/* ==== Declare domains as constants ==== */

var mainDomain = "www.main.com";
var mainStgDomain = "stg-main.com";
var secondDomain = "www.second.com";
var TIMEOUT_PROMISE = 1000;

var LOG_ENABLED = true;

var getCookieDomain = () => {
    let currentDomain = window.location.hostname;
    return currentDomain;
};

/* ==== Debugging Function ==== */

function consoleDebug(msg) {
    if (LOG_ENABLED)
        Evergage.log.console.info(msg);
}

/* ==== Find Current Domain Function ==== */

const currentCookieDomain = getCookieDomain();

/* ===== Utilities ===== */

var pageDelay = (miliseconds) => new Promise((resolve) => setTimeout(resolve, miliseconds));

function isLandingPage() {
    let urlParams = new URLSearchParams(window.location.search);
    let param = urlParams.get('pagetype');
    return param === "landing_page";
}

function toLowerCase(s) {
   if (s){
    return s === null ? null : s.toLowerCase();
   }
}

function getArrayFromString(s) {
    return s === null ? '' : s.replace(/[\t\n]/g, '').split(" ");
}

function isMobile(){
    return (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
}

function getMarketUser(country){
    var markets = new Map([
        ['IT', 'IT'],
        ['US', 'US'],
        ['AT', 'GB'],
        ['AU', 'AU'],
        ['BE', 'GB'],
        ['CA', 'CA'],
        ['CN', 'HK'],
        ['DE', 'DE'],
        ['DK', 'GB'],
        ['ES', 'ES'],
        ['FR', 'FR'],
        ['GB', 'GB'],
        ['JP', 'JP'],
        ['MX', 'MX'],
        ['NL', 'NL'],
        ['RU', 'RU'],
        ['KR', 'KR']
    ]);

    var value = markets.get(country);

    if(value !== "undefined"){
        return value;
    }else{
        return "";
    }
}

/* ==== DataLayer Utilities ==== */

function getMainPageType() {
    try{
        for (let i = 0; i < dataLayer.length; i++){
            if (typeof dataLayer[i].pageType !== "undefined" || typeof dataLayer[i].pageCategory !== "undefined" || typeof dataLayer[i].pageTitle !== "undefined"){
                if (dataLayer[i].pageType == "other"){
                    return [];
                }else
                    return dataLayer[i];
            }
        }
        
        return [];
    }catch(e){
        consoleDebug('getMainPageType - ex: ' + e);

        return [];
    }
}

function getUserInfo() {
    try{
        for (let i = 0; i < dataLayer.length; i++){
            if (typeof dataLayer[i].country !== "undefined")
                return dataLayer[i];
        }
        
        return [];
    }catch(e){
        consoleDebug('getUserInfo - ex: ' + e);

        return [];
    }
}

function getWishListObj() {
    try{
        for (let i = 0; i < dataLayer.length; i++){
            if (typeof dataLayer[i].wishlistQuantity !== "undefined")
                return dataLayer[i];
        }
        
        return [];
    }catch(e){
        consoleDebug('getWishListObj - ex: ' + e);

        return [];
    }
}

function getCartObj() {
    try{
        let k = 0;

        for (k = 0; k < dataLayer.length; k++){
            if (typeof dataLayer[k].cartProducts !== 'undefined')
                return dataLayer[k];
        }
        
        return [];
    }catch(e){
        consoleDebug('getCartObj - ex: ' + e);

        return [];
    }
}

function getProductObj() {
    try{
        let ret = {};
        for (j = dataLayer.length - 1; j >= 0; j--){
            let pageType = typeof dataLayer[j].pageType !== 'undefined' ? dataLayer[j].pageType : null;
            if (pageType == "ProductPage") {
                ret = dataLayer[j];
                break;
            }
        }
        return ret;
    }catch(e){
        consoleDebug('getProductObj - ex: ' + e);

        return {};
    }
}

function getProductSku() {
    let obj = getProductObj();
    return obj.productMasterID == obj.productSku ? null : obj.productSku;        
}

function getProductIdFromCart(sku) {
    try{
        let cart = getCartObj();
        let k = 0;

        for(k = 0; k < cart.cartProducts.length; k++){
            if (cart.cartProducts[k].variantId == sku)
                return cart.cartProducts[k].masterId;
        } 

        return null;
    }catch(e){
        consoleDebug('getProductIdFromCart - ex: ' + e);

        return null;
    }
}

function getEvent(s) {
    return s.event;
}

function getOrderObj() {
    try{
        for (let i = 0; i < dataLayer.length; i++){
            if (typeof dataLayer[i].ecommerce !== "undefined")
                return dataLayer[i];
        }
        
        return [];
    }catch(e){
        consoleDebug('getOrderObj - ex: ' + e);

        return [];
    }
}

function getOrderProductIds() {
    try{
        let ids = [];
        let k = 0;

        let orderObj = getOrderObj();
        if (typeof orderObj.ecommerce === 'undefined')
            return [];

        let products = orderObj.ecommerce.purchase.products;
        for (k = 0; k < products.length; k++){
            ids.push(products[k].id);
        }

        consoleDebug('getOrderProductIds - ids is: ' + ids);

        return ids;
    }catch(e){
        consoleDebug('getOrderProductIds - ex: ' + e);
        
        return [];
    }
}

function getOrderProductPrices() {
    try{
        let prices = [];
        let k = 0;

        let orderObj = getOrderObj();
        if (typeof orderObj.ecommerce === 'undefined')
            return [];

        let products = orderObj.ecommerce.purchase.products;
        for (k = 0; k < products.length; k++){
            prices.push(products[k].price);
        }

        consoleDebug('getOrderProductPrices - prices is: ' + prices);

        return prices;
    }catch(e){
        consoleDebug('getOrderProductPrices - ex: ' + e);
        
        return [];
    }
}

function getOrderProductQuantities() {
    try{
        let quantities = [];
        let k = 0;

        let orderObj = getOrderObj();
        if (typeof orderObj.ecommerce === 'undefined')
            return [];

        let products = orderObj.ecommerce.purchase.products;
        for (k = 0; k < products.length; k++){
            quantities.push(products[k].quantity);
        }

        consoleDebug('getOrderProductQuantities - quantities is: ' + quantities);

        return quantities;
    }catch(e){
        consoleDebug('getOrderProductQuantities - ex: ' + e);
        
        return [];
    }
}

function getCartProductIds() {
    try{
        consoleDebug("getCartProductIds - init");

        let ids = [];
        let k = 0;

        let cartrObj = getCartObj();
        if (typeof cartrObj.cartProducts === 'undefined')
            return [];

        let products = cartrObj.cartProducts;
        for (k = 0; k < products.length; k++){
            ids.push(products[k].masterId);
        }

        consoleDebug('getCartProductIds - ids is: ' + ids);

        return ids;
    }catch(e){
        consoleDebug('getCartProductIds - ex: ' + e);
        
        return [];
    }
}

function getCartProductPrices() {
    try{
        consoleDebug("getCartProductPrices - init");

        let prices = [];
        let k = 0;

        let cartObj = getCartObj();
        if (typeof cartObj.cartProducts === 'undefined')
            return [];

        let products = cartObj.cartProducts;
        for (k = 0; k < products.length; k++){
            prices.push(products[k].price);
        }

        consoleDebug('getCartProductPrices - prices is: ' + prices);

        return prices;
    }catch(e){
        consoleDebug('getCartProductPrices - ex: ' + e);
        
        return [];
    }
}

function getCartProductQuantities() {
    try{
        consoleDebug("getCartProductQuantities - init");

        let quantities = [];
        let k = 0;

        let cartObj = getCartObj();
        if (typeof cartObj.cartProducts === 'undefined')
            return [];

        let products = cartObj.cartProducts;
        for (k = 0; k < products.length; k++){
            quantities.push(products[k].quantity);
        }

        consoleDebug('getCartProductQuantities - quantities is: ' + quantities);

        return quantities;
    }catch(e){
        consoleDebug('getCartProductQuantities - ex: ' + e);
        
        return [];
    }
}

function getCartProductSku() {
    try{
        consoleDebug("getCartProductSku - init");

        let sku = [];
        let k = 0;

        let cartObj = getCartObj();
        if (typeof cartObj.cartProducts === 'undefined')
            return [];

        let products = cartObj.cartProducts;
        for (k = 0; k < products.length; k++){
            sku.push(products[k].variantId);
        }

        consoleDebug('getCartProductSku - sku is: ' + sku);

        return sku;
    }catch(e){
        consoleDebug('getCartProductSku - ex: ' + e);
        
        return [];
    }
}



function getLocale() {
    try{
        let userInfo = getUserInfo();
        consoleDebug('getLocale - userInfo is: ' + JSON.stringify(userInfo));
        
        if (userInfo.length !== 0){
            let language = userInfo.language;
            let country = userInfo.country;
            let locale = language.concat("_",country);
            return locale;   
        }

        return null;
    }catch(e){
        consoleDebug('getLocale - ex: ' + e);

        return '';
    }
}

function getBeautyLocale() {
    try{
        let k = 0, locale = '';
        for (k = 0; k < dataLayer.length; k++){
            if (typeof dataLayer[k].pageLanguage !== 'undefined'){      
                let language = getMainPageType().pageLanguage;
                
                if (language === 'en'){
                    locale = 'en_GB'
                }else if (language === 'it'){
                    locale = 'it_IT'
                }else if (language === 'ko'){
                    locale = 'ko_KR'
                }else{
                    locale = language + '_' + language.toUpperCase();
                }

                return locale;
            }else{
                return null;
            }
        }
    }catch(e){
        consoleDebug('getBeautyLocale - ex: ' + e);

        return '';
    }
}

function getCategoryIdFromBreadcrumb(s){
    try{
        var temp = s.replace(/>/g, '|');
        temp = temp.replace(/[,\.&%<>']/g, '');
        temp = temp.trim();
        temp = temp.replace(/ /g, '_');
        temp = temp.replace(/\|_/g, '|');
        return temp.toLowerCase();
    }catch(e){
        consoleDebug('getCategoryId - ex: ' + e);

        return '';
    }
}

function getGeneralId(s){
    try{
        var temp = s.replace(/[,\.&%<>']/g, '');
        temp = temp.trim();
        temp = temp.replace(/ /g, '_');
        temp = temp.replace(/__/g, '_');
        return temp.toLowerCase();
    }catch(e){
        consoleDebug('getGeneralId - ex: ' + e);
      
        return '';
    }
}

function getCategoryNameFromBreadcrumb(s){
    try{
        var temp = s.replace(/>/g, ' / ');
        return temp;
    }catch(e){
        consoleDebug('getCategoryNameFromBreadcrumb - ex: ' + e);

        return '';
    }
}
  
/* ===== Event Handlers ===== */

function onAddToCartEvent(e){
    try{        
        Evergage.sendEvent({
            action: "Add To Cart",
            itemAction: Evergage.ItemAction.AddToCart,
            cart: {
                singleLine: {
                    Product: {
                        _id: e.ecommerce.add.products[0].id,
                        price: e.ecommerce.add.products[0].price,
                        quantity: e.ecommerce.add.products[0].quantity,
                        relatedCatalogObjects: {
                            Style: [toLowerCase(e.ecommerce.add.products[0].variant)],
                            Brand: [getGeneralId(e.ecommerce.add.products[0].brand)]
                        }
                    }
                }
            }
        });
    }catch(e){
        consoleDebug('onAddToCartEvent - ex: ' + e);
    }
}

function onAddToCartEventMobile(e){
    try{    
        consoleDebug("id is: " + e.ecommerce.add.products[0].id);
        consoleDebug("price is: " + e.ecommerce.add.products[0].price);
        
        if (typeof e.ecommerce.add.products[0].id !== 'undefined'){
        Evergage.sendEvent({
            action: "Add To Cart",
            itemAction: Evergage.ItemAction.AddToCart,
            cart: {
                singleLine: {
                    Product: {
                        _id: e.ecommerce.add.products[0].id,
                        price: e.ecommerce.add.products[0].price,
                        quantity: "1",
                        relatedCatalogObjects: {
                            Style: [toLowerCase(e.ecommerce.add.products[0].variant)],
                            Brand: [getGeneralId(e.ecommerce.add.products[0].brand)]
                        }
                    }
                }
            }
        });
        }
    }catch(e){
        consoleDebug('onAddToCartEventMobile - ex: ' + e);
    }
}

function onAddToWishlistEventPLP(e) {
    consoleDebug('onAddToWishlistEventPLP - init');
    
    try{
        let sku = Evergage.cashDom(e.target).attr('data-pid');
        let pid = Evergage.cashDom(e.target).parent().attr('data-itemid'); 
        let size = Evergage.util.getValueFromNestedObject("size", getWishListObj());
        let color = Evergage.cashDom(e.target).parent().attr('data-variant');
        let brand = Evergage.cashDom(e.target).parent().attr('data-brand');

        consoleDebug('Sku is : ' + sku + ' pid is ' + pid);

        Evergage.sendEvent({
            action: "Add To Wishlist",
            itemAction: Evergage.ItemAction.Favorite,
            catalog: {
                Product: {
                    _id: pid,
                    sku: sku == pid ? null : sku,
                    relatedCatalogObjects: {
                        Style: [toLowerCase(color)],
                        Size: [toLowerCase(size)],
                        Brand: [getGeneralId(brand)]
                    }
                }
            }
        });
    }catch(e){
        consoleDebug('onAddToWishlistEventPLP - ex: ' + e);
    }

    consoleDebug('onAddToWishlistEventPLP - end');
}

function onAddToWishlistEventPLPMobile(e) {
    consoleDebug('onAddToWishlistEventPLP - init');
    
    try{
        
        let topElementTag = Evergage.cashDom(e.target).parent().siblings().first().children().children().get(1);
        let aHrefChild = Evergage.cashDom(topElementTag).children().first();
        let searchTerm = "pid%3";
        let temp1 = Evergage.cashDom(aHrefChild).attr('href');
        let temp2 = temp1.lastIndexOf(searchTerm);
        let pid = temp1.slice(temp2+searchTerm.length);
        
        consoleDebug(' pid is ' + pid);

        Evergage.sendEvent({
            action: "Add To Wishlist",
            itemAction: Evergage.ItemAction.Favorite,
            catalog: {
                Product: {
                    _id: pid,
                }
            }
        });
    }catch(e){
        consoleDebug('onAddToWishlistEventPLPMobile - ex: ' + e);
    }

    consoleDebug('onAddToWishlistEventPLPMobile - end');
}

function onAddToWishlistEventPDP(e) {
    consoleDebug('onAddToWishlistEventPDP - init');

    try{
        let sku = Evergage.cashDom(e.target).attr("data-pid");
        let pid = getProductObj().productMasterID; 
        let size = Evergage.util.getValueFromNestedObject("size", getWishListObj());
        let color = Evergage.cashDom(e.target).parent().attr('data-variant');
        let brand = Evergage.cashDom(e.target).parent().attr('data-brand');

        consoleDebug('Sku is : ' + sku + ' pid is ' + pid);

        Evergage.sendEvent({
            action: "Add To Wishlist",
            itemAction: Evergage.ItemAction.Favorite,
            catalog: {
                Product: {
                    _id: pid,
                    sku: sku == pid ? null : sku,
                    relatedCatalogObjects: {
                        Style: [toLowerCase(color)],
                        Size: [toLowerCase(size)],
                        Brand: [getGeneralId(brand)]
                    }
                }
            }
        });
    }catch(e){
        consoleDebug('onAddToWishlistEventPDP - ex: ' + e);
    }

    consoleDebug('onAddToWishlistEventPDP - end');
}

function onAddToWishlistEventPDPPopup(e) {
    consoleDebug('onAddToWishlistEventPDPPopup - init');

    try{
        let sku = Evergage.cashDom(e).attr("data-pid");
        let pid = getProductObj().productMasterID;
        let size = Evergage.util.getValueFromNestedObject("size", getWishListObj());
        let color = Evergage.cashDom(e.target).parent().attr('data-variant');
        let brand = Evergage.cashDom(e.target).parent().attr('data-brand');


        consoleDebug('Sku is : ' + sku + ' pid is ' + pid);

        Evergage.sendEvent({
            action: "Add To Wishlist",
            itemAction: Evergage.ItemAction.Favorite,
            catalog: {
                Product: {
                    _id: pid,
                    sku: sku == pid ? null : sku,
                    relatedCatalogObjects: {
                        Style: [toLowerCase(color)],
                        Size: [toLowerCase(size)],
                        Brand: [getGeneralId(brand)]
                    }
                }
            }
        });
    }catch(e){
        consoleDebug('onAddToWishlistEventPDPPopup - ex: ' + e);
    }

    consoleDebug('onAddToWishlistEventPDPPopup - end');
}

function onAddToWishlistEventCheckout(e) {
    consoleDebug('onAddToWishlistEventCheckout - init');

    try{
        let sku = Evergage.cashDom(e.target).attr("data-pid");
        let pid = getProductIdFromCart(sku);
        let size = Evergage.util.getValueFromNestedObject("size", getWishListObj());
        let color = Evergage.cashDom(e.target).parent().attr('data-variant');
        let brand = Evergage.cashDom(e.target).parent().attr('data-brand');


        consoleDebug('onAddToWishlistEventCheckout - Sku is : ' + sku  + ' pid is: ' + pid);

        Evergage.sendEvent({
            action: "Add To Wishlist",
            itemAction: Evergage.ItemAction.Favorite,
            catalog: {
                Product: {
                    _id: pid,
                    sku: sku,
                    relatedCatalogObjects: {
                        Style: [toLowerCase(color)],
                        Size: [toLowerCase(size)],
                        Brand: [getGeneralId(brand)]
                    }
                }
            }
        });
    }catch(e){
        consoleDebug('onAddToWishlistEventCheckout - ex: ' + e);
    }

    consoleDebug('onAddToWishlistEventCheckout - end');
}

function onNewsletterSubEvent(e){
    consoleDebug('onNewsletterSubEvent - init');

    try{
        Evergage.sendEvent({
            action: "Email Sign-Up",
            user: {
                attributes: {
                    newsletterSubscription: true
                }
            }
        });
    }catch(e){
        consoleDebug('onNewsletterSubEvent - ex: ' + e);
    }

    consoleDebug('onNewsletterSubEvent - end');
}

function onSaveSneakerCustomization(e) {
    consoleDebug('onSneakerCustomization - init');

    try{
        Evergage.sendEvent({
            action: "Customize Sneakers - Save",
            catalog: {
                Product: {
                    _id: e.category.split(".")[2]
                }
            }
        });
    }catch(e){
        consoleDebug('onSneakerCustomization - ex: ' + e);
    }

    consoleDebug('onSneakerCustomization - end');
}

function onStartSneakerCustomization(e) {
    consoleDebug('onStartSneakerCustomization - init');

    let sku = getProductObj().productSku;
    let pid = getProductObj().productMasterID;

    try{
        Evergage.sendEvent({
            action: "Customize Sneakers",
            catalog: {
                Product: {
                    _id: pid,
                    sku: sku == pid ? null : sku
                }
            }
        });
    }catch(e){
        consoleDebug('onSneakerCustomization - ex: ' + e);
    }

    consoleDebug('onStartSneakerCustomization - end');
}

function onAddToBagEventPLP(e) {
    consoleDebug('onAddToBagEventPLP - init');
    
    try{
        let sku = getProductObj().productSku;
        let pid = getProductObj().productMasterID;
        let category = Evergage.cashDom(e.target).parent().attr('data-category');
        let size = Evergage.util.getValueFromNestedObject("size", getProductObj);
        let color = Evergage.cashDom(e.target).parent().attr('data-variant');
        let brand = Evergage.cashDom(e.target).parent().attr('data-brand');

        if (typeof pid === 'undefined')
            return;

        if ( sku == pid ){
            consoleDebug('pid is ' + pid);
        }else{
            consoleDebug('Sku is : ' + sku + ' pid is ' + pid);
        }   

        Evergage.sendEvent({
            action: "Product Quick View",
            itemAction: Evergage.ItemAction.QuickViewItem,
            catalog: {
                Product: {
                    _id: pid,
                    sku: sku == pid ? null : sku,
                    relatedCatalogObjects: {
                        Style: [toLowerCase(color)],
                        Size: [toLowerCase(size)],
                        Brand: [getGeneralId(brand)]
                    }
                }
            }
        });
    }catch(e){
        consoleDebug('onAddToBagEventPLP - ex: ' + e);
    }

    consoleDebug('onAddToBagEventPLP - end');
}

function onAddToBagEventPLPClose(e){
    consoleDebug('onAddToBagEventPLPClose - init');

    try{
        let sku = getProductObj().productSku;
        let pid = getProductObj().productMasterID;

        if ( sku == pid ){
        consoleDebug('pid is ' + pid);
    }else{
        consoleDebug('Sku is : ' + sku + ' pid is ' + pid);
    }   
        
        Evergage.sendEvent({
            action: "Close Quick View",
            itemAction: Evergage.ItemAction.StopQuickViewItem,
        });
    }catch(e){
        consoleDebug('onAddToBagEventPLPClose - ex: ' + e);
    }

    consoleDebug('onAddToBagEventPLPClose - end');
}


/* ==== Virtual Boutique ==== */

function onBookAnAppointment(e) {
    consoleDebug('onBookAnAppointment - init');

    try{
        let email = Evergage.cashDom(e.parentElement['email']).attr("value");
        consoleDebug('Checking ' + e.parentNode['email'].value);
        consoleDebug('Checking ' + email);
        consoleDebug('onBookAnAppointment - email is captured ' + email);
        Evergage.sendEvent({
            action: "Book an appointment",
            user:{
                id: email,
                attributes: {
                    emailAddress: email
                }
            }
        });
    }catch(e){
        consoleDebug('onBookAnAppointment - ex: ' + e);
    }

    consoleDebug('onBookAnAppointment - end'); 
}

/* ==== Sitemap Init ==== */

dataLayerPromise.then(function(returnValue){
    if(returnValue){
        Evergage.init({
            cookieDomain: currentCookieDomain
        }).then(() => {
            const isLoggedIn = () => {
                if (dataLayer[1].loggedIn == "Logged In") return true;
                return false;
            };
            

/* ==== Main Site Configuration ==== */

            let mainSiteConfig = () => {
                return {
                    global: {
                        locale: getLocale(),
                        onActionEvent: (actionEvent) => { 
                            actionEvent.user = actionEvent.user || {};
                            actionEvent.user.attributes = actionEvent.user.attributes || {};
                            
                            /* ==== Set global action variable ==== */

                            if (getUserInfo().country) actionEvent.user.attributes.country = getUserInfo().country;
                            if (getUserInfo().userID) actionEvent.user.attributes.customUserId = getUserInfo().userID;
                            if (getUserInfo().customerLoyalty) actionEvent.user.attributes.customerLoyalty = getUserInfo().customerLoyalty;
                            if (getUserInfo().customerOngoingValue) actionEvent.user.attributes.customerOngoingValue = getUserInfo().customerOngoingValue;
                            if (getUserInfo().customerValue) actionEvent.user.attributes.customerValue = getUserInfo().customerValue;
                            if (getUserInfo().customerVisits) actionEvent.user.attributes.customerVisits = getUserInfo().customerVisits;
                            if (getUserInfo()._email){ actionEvent.user.attributes.emailAddress = getUserInfo()._email; actionEvent.user.id = getUserInfo()._email; }
                            if (getUserInfo().gender) actionEvent.user.attributes.gender = getUserInfo().gender;
                            if (getUserInfo().language) actionEvent.user.attributes.language = getUserInfo().language;
                            if (getUserInfo().newsletterSubscription != null) actionEvent.user.attributes.newsletterSubscription = getUserInfo().newsletterSubscription;
                            if (getUserInfo().purchaseHistory) actionEvent.user.attributes.purchaseHistory = getUserInfo().purchaseHistory.substring(0,1024);
                            if (getUserInfo().visitorStatus) actionEvent.user.attributes.visitorStatus = getUserInfo().visitorStatus;

                            actionEvent.user.attributes.isLoggedIn = isLoggedIn();

                            return actionEvent;
                        }
                        
                    },
                    pageTypeDefault: {
                        name: "default"
                    },
                    pageTypes: [
                        {
                            name: "homepage",
                            action: "Homepage",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^Homepage$/g.test(getMainPageType().pageType)) 
                                })},
                            contentZones: [
                                { name: "homepage_banner", selector: ".b-products-launch_item"},
                                { name: "product_carousel", selector: ".owl-stage-outer"},
                                { name: "stripe_bar"},
                                { name: "homepage_popup"}
                            ]
                        },
                        {
                            name: "my_account",
                            action: "My Account",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^My Account$/g.test(getMainPageType().pageType)) 
                                })},
                            contentZones: [
                                {name:"registration_exit_popup" }
                            ]
                        },
                        {
                            name: "product_listing_page",
                            action: "Product Listing Page",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^ProductListPage$/g.test(getMainPageType().pageType) && (typeof getMainPageType().categoryPathGPF !== "undefined")) 
                                })},
                            contentZones: [
                                { name: "product_list_page_item", selector: ".l-search_result-content"},
                                { name: "product_list_page_recommendation", selector: ".content-slot"},
                                { name: "landing_page", selector: ".c-category_landing_page__wrapper, .l-home-page"}
                            ],
                            catalog: {
                                Category: {
                                    _id: getCategoryIdFromBreadcrumb(getMainPageType().categoryPathGPF),
                                    name: getCategoryNameFromBreadcrumb(getMainPageType().categoryPathGPF),
                                    url: Evergage.util.qualifyUrl(window.location.href)
                                }
                            },
                            listeners: [
                                Evergage.listener("click", ".b-add_to_wishlist", (e) => {
                                    consoleDebug('pageTypes - Listeners: addToWishlist.');

                                    if (!Evergage.cashDom(e.target).hasClass("b-add_to_wishlist--added"))
                                        onAddToWishlistEventPLP(e);
                                })
                            ]
                        },
                        {
                            name: "product_page",
                            action: "Product Page",
                            isMatch: () =>  {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^ProductPage$/g.test(getMainPageType().pageType) && typeof getProductObj().productMasterID !== "undefined" ) 
                                })},
                            contentZones: [
                                {name: "product_page_popup"},
                                {name: "size_warning", selector:".b-product_add_to_cart-submit, .pw--block"},
                                {name: "daymaster_carousel", selector:".b-product-configurator-productdetails-menu"}
                                ],
                            catalog: {
                                Product: {
                                    _id: getProductObj().productMasterID,
                                    sku: getProductSku(),
                                    categories: [getCategoryIdFromBreadcrumb(Evergage.util.getValueFromNestedObject("productCategoryPathGPF", getProductObj()))],
                                    relatedCatalogObjects: {
                                        Style: [toLowerCase(getProductObj().productColor)],
                                        Size: [toLowerCase(getProductObj().productSize)],
                                        Brand: [getGeneralId(Evergage.util.getValueFromNestedObject("productBrand", getProductObj()))],
                                    },
                                    name: Evergage.util.getValueFromNestedObject("Product", getProductObj()),
                                    url: Evergage.util.getValueFromNestedObject("productUrl", getProductObj()),
                                    imageUrl:  Evergage.util.getValueFromNestedObject("productImageUrl", getProductObj()),
                                    price: Evergage.util.getValueFromNestedObject("productPrice", getProductObj()),
                                    currency: Evergage.util.getValueFromNestedObject("currencyCode", getProductObj()),
                                    collection: Evergage.util.getValueFromNestedObject("productDimension9", getProductObj()),
                                    breadcrumb: Evergage.util.getValueFromNestedObject("productCategoryPathGPF", getProductObj()),
                                }
                            },
                            listeners: [
                                Evergage.listener("click", ".b-add_to_wishlist", (e) => {
                                    consoleDebug('pageTypes - Listeners: addToWishlist.');
                                    let classList = e.target.classList.value.split(" ");

                                    if (!Evergage.cashDom(e.target).hasClass("b-add_to_wishlist--added"))
                                        onAddToWishlistEventPDP(e);
                                }),
                                Evergage.listener("click", ".js-configurator-start-1", (e) =>{
                                    consoleDebug('pageTypes - Listeners: Sneakers start personalization');

                                    onStartSneakerCustomization(e);
                                }),
                                Evergage.listener("click", ".js-configurator-startnew", (e) =>{
                                    consoleDebug('pageTypes - Listeners: Sneakers start personalization');

                                    onStartSneakerCustomization(e);
                                }),
                            ]
            
                        },
                        {
                            name: "checkout_cart",
                            action: "Checkout - Cart",
                            itemAction: Evergage.ItemAction.ViewCart,
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^Checkout Step 1$/g.test(getMainPageType().pageType)) 
                                })}, 
                            contentZones: [
                                {name:"cart_exit_popup" }
                            ],
                            catalog: {
                                Product: {
                                    lineItems: {
                                        _id: getCartProductIds(),
                                        price: getCartProductPrices(),
                                        quantity: getCartProductQuantities()
                                    }
                                }
                            },
                            listeners: [
                                Evergage.listener("click", ".b-add_to_wishlist_button", (e) => {
                                    consoleDebug('pageTypes - Listeners: addToWishlist')

                                    onAddToWishlistEventCheckout(e);
                                })
                            ]   
                        },
                        {
                            name: "checkout_shipping",
                            action: "Checkout - Shipping",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^Checkout Step 2$/g.test(getMainPageType().pageType)) 
                                })}, 
                            listeners: [
                                Evergage.listener("submit", ".js-checkout_form", () => {
                                    const email = Evergage.cashDom('#dwfrm_billing_billingAddress_email_emailAddress').val()
                                    if (email) {
                                        Evergage.sendEvent(
                                            {
                                                action: "Checkout - Shipping - Submit", 
                                                user: {
                                                    id: email,
                                                    attributes: {emailAddress:  email}
                                                }
                                        });
                                    }
                                }),
                            ],
                        },
                        {
                            name: "checkout_summary",
                            action: "Checkout - Summary",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^Checkout Step 3$/g.test(getMainPageType().pageType)) 
                                })}, 
                        },
                        {
                            name: "checkout_order_confirmation",
                            action: "Checkout - Order Confirmation",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /Confirmation/g.test(getMainPageType().pageType)) 
                                })},
                            itemAction: Evergage.ItemAction.Purchase,
                            catalog: {
                                Product: {
                                    orderId: getOrderObj().orderID,
                                    totalValue: getOrderObj().transactionTotal,
                                    currency: getOrderObj().transactionCurrency,
                                    lineItems: {
                                        _id: getOrderProductIds(),
                                        price:  getOrderProductPrices(),
                                        quantity:  getOrderProductQuantities()
                                    }
                                }
                            }
                        },
                        {
                            name: "return_order_confirmation",
                            action: "Return Order Confirmation",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^ReturnConfirmation$/g.test(getMainPageType().pageType)) 
                                })},
                        },
                        {
                            name: "search",
                            action: "Search",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^Search$/g.test(getMainPageType().pageType)) 
                                })}
                        },
                        {
                            name: "customer_service",
                            action: "Customer Service",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^customer-service$/g.test(getMainPageType().pageCategory)) 
                                })}
                        },
                        {
                            name: "my_wishlist",
                            action: "My Wishlist",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^Wishlist$/g.test(getMainPageType().pageCategory)) 
                                })}
                        },
                        {
                            name: "landing_page",
                            action: "Landing Page",
                            isMatch: () => {return new Promise((resolve, reject) => { 
                                setTimeout(resolve, TIMEOUT_PROMISE, /^CategoryLandingPage$/g.test(getMainPageType().pageType)) 
                                })},
                            contentZones: [
                                { name: "landing_page", selector: ".c-category_landing_page__wrapper, .l-home-page"}
                            ]
                        }
                    ]
                };
            };

            let LandingPageSiteConfig = () => {
                return {
                    global: {
                        locale: getLocale(),
                        onActionEvent: (actionEvent) => { 
                            actionEvent.user = actionEvent.user || {};
                            actionEvent.user.attributes = actionEvent.user.attributes || {}; 
                            
                            /* ==== Set global action variable ==== */
                            if (isLoggedIn()){
                                if (getUserInfo().country) actionEvent.user.attributes.country = getUserInfo().country;
                                if (getUserInfo().userID) actionEvent.user.attributes.customUserId = getUserInfo().userID;
                                if (getUserInfo().customerLoyalty) actionEvent.user.attributes.customerLoyalty = getUserInfo().customerLoyalty;
                                if (getUserInfo().customerOngoingValue) actionEvent.user.attributes.customerOngoingValue = getUserInfo().customerOngoingValue;
                                if (getUserInfo().customerValue) actionEvent.user.attributes.customerValue = getUserInfo().customerValue;
                                if (getUserInfo().customerVisits) actionEvent.user.attributes.customerVisits = getUserInfo().customerVisits;
                                if (getUserInfo()._email){ actionEvent.user.attributes.emailAddress = getUserInfo()._email; actionEvent.user.id = getUserInfo()._email; }
                                if (getUserInfo().gender) actionEvent.user.attributes.gender = getUserInfo().gender;
                                if (getUserInfo().language) actionEvent.user.attributes.language = getUserInfo().language;
                                if (getUserInfo().newsletterSubscription != null) actionEvent.user.attributes.newsletterSubscription = getUserInfo().newsletterSubscription;
                                if (getUserInfo().purchaseHistory) actionEvent.user.attributes.purchaseHistory = getUserInfo().purchaseHistory.substring(0,1024);
                                if (getUserInfo().visitorStatus) actionEvent.user.attributes.visitorStatus = getUserInfo().visitorStatus;
                            }

                            actionEvent.user.attributes.isLoggedIn = isLoggedIn();

                            return actionEvent;
                        }
                        
                    },
                    pageTypeDefault: {
                        name: "default"
                    },
                    pageTypes: [
                        {
                            name: "landing_page",
                            action: "Landing Page",
                            isMatch: () => {return isLandingPage()},
                            contentZones: [
                                { name: "landing_page", selector: ".c-category_landing_page__wrapper, .l-home-page"}
                            ]
                        }
                    ]
                };
            };
            
            /* ==== Second/Beauty Site Configuration ==== */

            let secondSiteConfig = () => {
                return {
                    global: {
                        locale: getBeautyLocale(),
                        onActionEvent: (actionEvent) => { 
                            actionEvent.user = actionEvent.user || {};
                            actionEvent.user.attributes = actionEvent.user.attributes || {};

                            return actionEvent;
                        }
                    },
                    pageTypeDefault: {
                        name: "beauty"
                    },
                    pageTypes: [
                        {
                            name: "beauty_homepage",
                            action: "Beauty Homepage",
                            isMatch: () => {
                                return Evergage.DisplayUtils.pageElementLoaded("body", "html").then((ele) => {
                                    return Evergage.cashDom("body").hasClass("home");
                                });
                            },
                        },
                        {
                            name: "beauty_detail_page",
                            action: "Beauty Detail Page",
                            isMatch: () => {
                                return Evergage.DisplayUtils.pageElementLoaded("body", "html").then((ele) => {
                                    return !Evergage.cashDom("body").hasClass("home");
                                });
                            },
                            catalog: {
                                Article: {
                                    _id: Evergage.util.getValueFromNestedObject("pageTitle", getMainPageType()),
                                    name: Evergage.util.getValueFromNestedObject("pageTitle", getMainPageType()),
                                    url: Evergage.util.qualifyUrl(window.location.href)
                                }
                            }
                        }
                    ]
                };
            };


            /* ==== Monitor change in dataLayer variabile every 2 seconds. It checks for changes and send events. ==== */

            function onDataLayerChange() {
                let lengthInit = dataLayer.length;
                    
                const dataLayerChangeInterval = setInterval(() => {
                    if (lengthInit !== dataLayer.length){
                        consoleDebug("onDataLayerChange - dataLayer is changed v1.76");
                        let init = lengthInit;
                        lengthInit = dataLayer.length;

                        for (i = init; i < dataLayer.length; i++){
                            let elem = dataLayer[i];

                            let event = getEvent(elem);
                            consoleDebug('onDataLayerChange - Received event ' + event);

                            switch (event) {
                                case 'addToCart':
                                    consoleDebug('onDataLayerChange - Received addToCart event');
                                    consoleDebug('onDataLayerChange - event is: ' + JSON.stringify(elem));

                                    onAddToCartEvent(elem);
                                    break;
                                case 'eec.addToCart':
                                    consoleDebug('onDataLayerChange - Received addToCartMobile event');
                                    consoleDebug('onDataLayerChange - event is: ' + JSON.stringify(elem));

                                    onAddToCartEventMobile(elem);
                                    break;
                                case 'wishlistAdd':
                                    consoleDebug('onDataLayerChange - wishlistAdd event. Nothing to do..');
                                    break;
                                case 'gtm.click':
                                    consoleDebug('onDataLayerChange - click event');
                                    consoleDebug('onDataLayerChange - classList is: ' + getArrayFromString(elem["gtm.element"].classList.value));

                                    if (Evergage.cashDom(elem["gtm.element"]).hasClass("js_pdp_add_to_wishlist")){
                                        consoleDebug('onDataLayerChange - addToWishlist event - PDP Popup');

                                        onAddToWishlistEventPDPPopup(elem["gtm.element"]);
                                    }
                                    else if (Evergage.cashDom(elem["gtm.element"]).hasClass("sc-fznyAO")){
                                        consoleDebug('onDataLayerChange - Book an appointment event');

                                        onBookAnAppointment(elem["gtm.element"]);
                                    }
                                    else if(Evergage.cashDom(elem["gtm.element"]).hasClass("b-quickview")){
                                        consoleDebug('onDataLayerChange - addToBag Popup event');

                                        onAddToBagEventPLP(elem["gtm.element"]);
                                    }
                                    else if(Evergage.cashDom(elem["gtm.element"]).hasClass("fancybox-close") && !Evergage.cashDom(elem["gtm.element"]).hasClass("js-close_newsletter")){
                                        consoleDebug('onDataLayerChange - addToBag Close Popup event');

                                        onAddToBagEventPLPClose(elem["gtm.element"]);
                                    }
                                    break;
                                case 'newsletterSubscription':
                                    consoleDebug('onDataLayerChange - newsletter subscription event');

                                    onNewsletterSubEvent(elem);
                                    break;
                                case 'custEvent':
                                    consoleDebug('onDataLayerChange - custEvent');

                                    if (elem.action == 'saveCustomization')
                                        onSaveSneakerCustomization(elem);
                                    break;
                                case 'gtm.linkClick':
                                    consoleDebug('onDataLayerChange - Saving SneakerCustomization for Mobile');

                                    if (Evergage.cashDom(elem["gtm.element"]).hasClass("js-product-configurator-save"))
                                        onSaveSneakerCustomization(elem);
                                    break;
                                default:
                                    consoleDebug('onDataLayerChange - event not handled');
                            }
                        }
                    }
                }, 2000);
            };
            /*
                Check for URL change every 2 seconds. If URL has changed, reinitialize beacon and sitemap.
            */

            const handleSPAPageChange = () => {
                let url = window.location.href;

                const urlChangeInterval = setInterval(() => {
                    consoleDebug('checking url change v1.1');
                    if (url !== window.location.href) {
                        consoleDebug('url is changed');
                        url = window.location.href;
                        pageDelay(500).then(() => {Evergage.initSitemap(getSitemap())});
                    }
                }, 2000);
            }

            function getSitemap(){
                if (isLandingPage()){
                    return LandingPageSiteConfig();
                }else if (currentCookieDomain === mainDomain || currentCookieDomain === mainStgDomain) {
                    return mainSiteConfig();
                }else if (currentCookieDomain === secondDomain) {
                    return secondSiteConfig();
                }
            }

            /* ==== Decide the current cookie domain ==== */
            function init(){
                var currentSitemap = getSitemap();

                Evergage.initSitemap(currentSitemap);

                if (isLandingPage()){    
                    if (isMobile()){
                        handleSPAPageChange();
                    }
                }else if (currentCookieDomain === mainDomain || currentCookieDomain === mainStgDomain) {
                    onDataLayerChange();

                    if (isMobile()){
                        handleSPAPageChange();
                    }
                }else if (currentCookieDomain === secondDomain) {
                    onDataLayerChange();
                    handleSPAPageChange();
                }
            }

            init();        
            
        })
    }
})
