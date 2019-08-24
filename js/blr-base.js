if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') {
    BLR = {};
}

BLR.base = {};

BLR.base.templates = {

    // start: partials //////////////////////
    pager: document.querySelector('#template-pager').innerHTML,
    'records-found': document.querySelector('#template-records-found').innerHTML,
    charts: document.querySelector('#template-charts').innerHTML,
    figures: document.querySelector('#template-figures').innerHTML,
    // end: partials //////////////////////

    treatments: document.querySelector('#template-treatments').innerHTML,
    treatment: document.querySelector('#template-treatment').innerHTML,
    images: document.querySelector('#template-images').innerHTML
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

BLR.base.dom = {

    // modals
    maintenance: document.querySelector('#maintenance'),
    searchForm: document.querySelector('#home'),
    about: document.querySelector('#about'),
    privacy: document.querySelector('#privacy'),
    ip: document.querySelector('#ip'),
    contact: document.querySelector('#contact'),
    panels: document.querySelectorAll('.panel'),
    modalOpen: document.querySelectorAll('.modal-open'),
    modalClose: document.querySelectorAll('.modal-close'),
    throbber: document.querySelector('#throbber'),

    // form elements
    form: document.querySelector('form[name=simpleSearch]'),
    inputs: document.querySelectorAll('form[name=simpleSearch] input'),
    q: document.querySelector('input[name=q]'),
    urlFlagSelectors: document.querySelectorAll('.urlFlag'),
    resourceSelector: document.querySelector('#resourceSelector'),
    goGetIt: document.querySelector('#go-get-it'),
    communitiesSelector: document.querySelector('.drop-down'),
    communityCheckBoxes: document.querySelectorAll('input[name=communities]'),
    allCommunities: document.querySelector('input[value="all communities"]'),
    refreshCacheSelector: document.querySelector('input[name=refreshCache]'),
    urlFlagSelectors: document.querySelectorAll('.urlFlag'),

    // results panels
    treatments: document.querySelector('#treatments'),
    bigmap: document.querySelector('#bigmap')
};

BLR.base.saveable = ['treatments', 'home'],

BLR.base.savedState = null;

BLR.base.model = {
    treatments: {},
    treatment: {},
    images: {}
}

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
    
    // make sure all panels are hidden
    BLR.eventlisteners.toggle(BLR.base.dom.panels, 'off');

    if (maintenance) {
        BLR.eventlisteners.toggle(BLR.base.dom.maintenance, 'on');
        return;
    }
    else {
        BLR.eventlisteners.addEvents(BLR.base.dom.modalOpen, BLR.eventlisteners.modalOpen);
        BLR.eventlisteners.addEvents(BLR.base.dom.modalClose, BLR.eventlisteners.modalClose);
        BLR.eventlisteners.addEvents(BLR.base.dom.goGetIt, BLR.eventlisteners.goGetIt);
        BLR.eventlisteners.addEvents(BLR.base.dom.communitiesSelector, BLR.eventlisteners.toggleCommunities);
        BLR.eventlisteners.addEvents(BLR.base.dom.refreshCacheSelector, BLR.eventlisteners.toggleRefreshCache);
        BLR.utils.suggest(BLR.base.dom.q);
        BLR.utils.activateUrlFlagSelectors();

        BLR.base.compileTemplates();

        if (location.search) {
            //console.log('getting results based on location')
            BLR.utils.goGetIt();
        }
        else {
            //console.log('getting stats')
            //BLR.getResource({resource: 'treatments'});
            BLR.eventlisteners.toggle(BLR.base.dom.searchForm, 'on');
            BLR.base.dom.q.focus();
        }
    }
};

/*
map = {
    base: [
        'templates',
        'template-partials',
        'compileTemplates',
        'dom',
        'saveable',
        'model',
        'size',
        'init'
    ],

    utils: [
        'statsChart',
        'niceNumbers',
        'formatSearchCriteria',
        'makeUris',
        'getResource',
        'syntheticData',
        'fetchReceive',
        'isXml',
        'urlDeconstruct',
        'urlConstruct',
        'makePager',
        'goGetIt'
    ],

    treatments: [
        'getOneTreatment',
        'getManyTreatments',
        'getTreatments',
        'makeMap'
    ],

    eventlisterners: [
        'modalOpen',
        'modalClose',
        'addEvents',
        'turnOff',
        'turnOn',
        'toggle'
    ]
}
*/