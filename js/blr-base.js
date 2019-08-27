if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') {
    BLR = {};
}

if (!('base' in BLR)) {
    BLR.base = {};
}

BLR.base.dom = {};

BLR.base.templates = {

    // start: partials //////////////////////
    pager: document.querySelector('#template-pager').innerHTML,
    'records-found': document.querySelector('#template-records-found').innerHTML,
    charts: document.querySelector('#template-charts').innerHTML,
    figures: document.querySelector('#template-figures').innerHTML,
    // end: partials //////////////////////

    treatments: document.querySelector('#template-treatments').innerHTML,
    treatment: document.querySelector('#template-treatment').innerHTML,
    images: document.querySelector('#template-images').innerHTML,

    // not really templates but handled by Mustache
    //logo: document.querySelector('#template-logo').innerHTML,
    searchForm: document.querySelector('#template-form').innerHTML,
};

BLR['template-partials'] = {};

BLR.base.figcaptionHeight = '30px';
BLR.base.figcaptions = [];

BLR.base.compileTemplates = function() {
    for (let t in BLR.base.templates) {
        Mustache.parse(BLR.base.templates[t]);
    }

    BLR['template-partials']['template-pager'] = BLR.base.templates.pager;
    BLR['template-partials']['template-records-found'] = BLR.base.templates['records-found'];
    BLR['template-partials']['template-charts'] = BLR.base.templates.charts;
    BLR['template-partials']['template-figures'] = BLR.base.templates.figures;
};

// When the page loads, the form and the logo don't exist in the dom.
// Depending on whether the page is a first web visit for the user
// or is a bookmark or an existing link being loaded, the form and the
// logo are in different locations. So we first populgte the dom with 
// everything except the form, and then insert the form 
BLR.base.populateDom = function({withForm}) {

    if (withForm) {

        // form elements
        BLR.base.dom.form = document.querySelector('form[name=simpleSearch]'),
        BLR.base.dom.inputs = document.querySelectorAll('form[name=simpleSearch] input'),
        BLR.base.dom.q = document.querySelector('input[name=q]'),
        BLR.base.dom.urlFlagSelectors = document.querySelectorAll('.urlFlag'),
        BLR.base.dom.resourceSelector = document.querySelector('#resourceSelector'),
        BLR.base.dom.goGetIt = document.querySelector('#go-get-it'),
        BLR.base.dom.communitiesSelector = document.querySelector('.drop-down'),
        BLR.base.dom.communityCheckBoxes = document.querySelectorAll('input[name=communities]'),
        BLR.base.dom.allCommunities = document.querySelector('input[value="all communities"]'),
        BLR.base.dom.refreshCacheSelector = document.querySelector('input[name=refreshCache]'),
        BLR.base.dom.urlFlagSelectors = document.querySelectorAll('.urlFlag'),

        // logo 
        BLR.base.dom.titleAnchor = document.querySelector('a.title');
    }
    else {
        BLR.base.dom = {};

        BLR.base.dom.header = document.querySelector('header'),
        BLR.base.dom.headerTitleContainer = document.querySelector('#headerTitleContainer'),
        BLR.base.dom.headerFormContainer = document.querySelector('#headerFormContainer'),
        BLR.base.dom.articleTitleContainer = document.querySelector('#articleTitleContainer'),
        BLR.base.dom.articleFormContainer = document.querySelector('#articleFormContainer'),

        // not really templaes, but managed by Mustache nonetheless
        //BLR.base.dom.logo = document.querySelector('#template-logo'),
        BLR.base.dom.searchForm = document.querySelector('#template-form'),

        // modals
        BLR.base.dom.maintenance = document.querySelector('#maintenance'),
        BLR.base.dom.index = document.querySelector('#index'),
        BLR.base.dom.about = document.querySelector('#about'),
        BLR.base.dom.privacy = document.querySelector('#privacy'),
        BLR.base.dom.ip = document.querySelector('#ip'),
        BLR.base.dom.contact = document.querySelector('#contact'),
        BLR.base.dom.panels = document.querySelectorAll('.panel'),
        BLR.base.dom.modalOpen = document.querySelectorAll('.modal-open'),
        BLR.base.dom.modalClose = document.querySelectorAll('.modal-close'),
        BLR.base.dom.throbber = document.querySelector('#throbber'),

        // results panels
        BLR.base.dom.treatments = document.querySelector('#treatments')
    }
    
};

BLR.base.saveable = ['treatments', 'index'],

BLR.base.savedState = null;

BLR.base.model = {};


BLR.base.size = 30;

BLR.base.map = {
    url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicHVua2lzaCIsImEiOiJjajhvOXY0dW8wMTA3MndvMzBlamlhaGZyIn0.3Ye8NRiiGyjJ1fud7VbtOA',
    leaflet: {}
};

BLR.base.init = function(state) {
    const {maintenance} = state || {maintenance: false};
    
    if (maintenance) {
        BLR.base.populateDom();

        // make sure all panels are hidden
        BLR.eventlisteners.toggle(BLR.base.dom.panels, 'off');
        BLR.eventlisteners.toggle(BLR.base.dom.maintenance, 'on');
        return;
    }
    else {
        if (location.search) {

            BLR.base.compileTemplates();
            BLR.base.populateDom({withForm: false});
    
            // make sure all panels are hidden
            BLR.eventlisteners.toggle(BLR.base.dom.panels, 'off');
            
            //BLR.base.dom.formContainer.innerHTML = Mustache.render(BLR.base.templates.searchForm, {});
            //BLR.base.dom.headerTitleContainer.innerHTML = BLR.base.dom.logo.innerHTML;
            BLR.base.dom.headerFormContainer.innerHTML = BLR.base.dom.searchForm.innerHTML;

            BLR.base.populateDom({withForm: true});
            
            BLR.base.dom.header.classList.remove('hidden');
            BLR.base.dom.header.classList.add('visible');
            //BLR.base.dom.titleAnchor.classList.add('logo-header');

            BLR.eventlisteners.addEvents(BLR.base.dom.modalOpen, BLR.eventlisteners.modalOpen);
            BLR.eventlisteners.addEvents(BLR.base.dom.modalClose, BLR.eventlisteners.modalClose);
            BLR.eventlisteners.addEvents(BLR.base.dom.goGetIt, BLR.eventlisteners.goGetIt);
            BLR.eventlisteners.addEvents(BLR.base.dom.communitiesSelector, BLR.eventlisteners.toggleCommunities);
            BLR.eventlisteners.addEvents(BLR.base.dom.refreshCacheSelector, BLR.eventlisteners.toggleRefreshCache);
            BLR.utils.suggest(BLR.base.dom.q);
            BLR.utils.activateUrlFlagSelectors();

            BLR.utils.goGetIt();
        }
        else {
            BLR.base.compileTemplates();
            BLR.base.populateDom({withForm: false});
    
            // make sure all panels are hidden
            BLR.eventlisteners.toggle(BLR.base.dom.panels, 'off');
            
            // insert the form in article.section#index
            //BLR.base.dom.articleTitleContainer.innerHTML = BLR.base.dom.logo.innerHTML;
            BLR.base.dom.articleFormContainer.innerHTML = BLR.base.dom.searchForm.innerHTML;

            BLR.base.populateDom({withForm: true});

            //BLR.base.dom.titleAnchor.classList.add('logo-intro');
            BLR.eventlisteners.toggle(BLR.base.dom.index, 'on');
            
            BLR.eventlisteners.addEvents(BLR.base.dom.modalOpen, BLR.eventlisteners.modalOpen);
            BLR.eventlisteners.addEvents(BLR.base.dom.modalClose, BLR.eventlisteners.modalClose);
            BLR.eventlisteners.addEvents(BLR.base.dom.goGetIt, BLR.eventlisteners.goGetIt);
            BLR.eventlisteners.addEvents(BLR.base.dom.communitiesSelector, BLR.eventlisteners.toggleCommunities);
            BLR.eventlisteners.addEvents(BLR.base.dom.refreshCacheSelector, BLR.eventlisteners.toggleRefreshCache);
            BLR.utils.suggest(BLR.base.dom.q);
            BLR.utils.activateUrlFlagSelectors();
            
            BLR.base.dom.q.focus();
        }
    }
};