if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('eventlisteners' in BLR)) BLR.eventlisteners = {};

// BLR.eventlisteners = {};

BLR.eventlisteners.openModal = function(event) {
    event.stopPropagation();
    event.preventDefault();

    BLR.utils.turnOffAll();

    // turn on the requested modal
    const id = event.target.href.split('/').pop().split('.')[0];

    BLR.utils.turnOnById(id);
    history.pushState('', '', `${id}.html`);
};

BLR.eventlisteners.toggle = function(elements, state) {
    const len = elements.length;

    if (state === 'on') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                BLR.utils.turnOn(elements[i]);
            }
        }
        else {
            BLR.utils.turnOn(elements);
        }
    }
    else if (state === 'off') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                BLR.utils.turnOff(elements[i]);
            }
        }
        else {
            BLR.utils.turnOff(elements);
        }
    }
};

BLR.eventlisteners.toggleCommunities = function(event) {
    BLR.base.dom.communitiesSelector.classList.toggle('open');
};

BLR.eventlisteners.toggleRefreshCache = function(event) {
    BLR.base.dom.refreshCacheWarning.classList.toggle('show');
};

BLR.eventlisteners.closeModal = function(event) {
    event.stopPropagation();
    event.preventDefault();

    // turn off all visible modals
    for (let i = 0, j = BLR.base.dom.modals.length; i < j; i++) {
        if (BLR.base.dom.modals[i].classList.contains('visible')) {
            BLR.utils.turnOff(BLR.base.dom.modals[i]);
        }
    }

    // if a panel is saved, turn it on
    if (BLR.base.savedPanel.id) {        
        BLR.utils.turnOnById(BLR.base.savedPanel.id);
        let uri = `${BLR.base.savedPanel.id}.html` + (BLR.base.savedPanel.search || '');
        history.pushState('', '', uri);
    }
    else {
        BLR.utils.turnOnById('index');
        history.pushState('', '', 'index.html');
    }
};

// BLR.eventlisteners.goGetItOld = function(event) {
//     event.stopPropagation();
//     event.preventDefault();
    
//     const form = event.target.form;
//     const q = form.querySelector('input[name=q]');
//     let resource = '';

//     if (q.value === '') {
//         q.placeholder = "c’mon, enter something";
//         return;
//     }
//     else {

//         // create a URI for the browser (history)
//         const sendableUriValid = ['communities', 'q', 'refreshCache', 'page', 'size'];
//         const browserUriInvalid = ['refreshCache'];
//         const searchCriteriaInvalid = ['communities', 'refreshCache', 'size', 'page', 'go'];

//         const inputs = form.querySelectorAll('input');

//         const sendableUriParts = []; 
//         const browserUriParts = [];
//         const searchCriteriaParts = [];

//         for (let i = 0, j = inputs.length; i < j; i++) {

//             // for the URI to be sent to Zenodeo
//             if (sendableUriValid.includes(inputs[i].name)) {
//                 if (inputs[i].value) {
//                     sendableUriParts.push(inputs[i].name + '=' + inputs[i].value);
//                 }
//             }
//             else if (inputs[i].name === 'resource' && inputs[i].checked) {
//                 resource = inputs[i].value;
//             }

//             // for the URI for the web browser (history)
//             if (!browserUriInvalid.includes(inputs[i].name)) {
//                 if (inputs[i].value) {
//                     browserUriParts.push(inputs[i].name + '=' + inputs[i].value);
//                 }
//             }

//             // create the searchCriteria string
//             if (!searchCriteriaInvalid.includes(inputs[i].name)) {
//                 if (inputs[i].name === 'q') {
//                     searchCriteriaParts.push(`<span class="crit-val">${inputs[i].value}</span> is in the text`);
//                 }
//                 else {
//                     searchCriteriaParts.push(`<span class="crit-key">${inputs[i].name}</span> is <span class="crit-val">${inputs[i].value}</span>`);
//                 }
//             }
//         }

//         const sendableUri = `${BLR.base.zenodeo}/v2/${resource}?${sendableUriParts.join('&')}`;

//         const browserUri = resource + '.html?' + browserUriParts.join('&');
//         history.pushState('', '', browserUri);

//         let l = searchCriteriaParts.length;
//         //let sc = `${n} ${resource} found where `;
//         let searchCriteria = ''

//         if (l === 1) {
//             searchCriteria += searchCriteriaParts[0];
//         }
//         else if (l === 2) {
//             searchCriteria +=  searchCriteriaParts.join(' and ');
//         }
//         else if (l > 2) {
//             l = l - 1;
//             searchCriteria += searchCriteriaParts.slice(0, l).join(', ') + ', and ' + searchCriteriaParts[l];
//         }

        
//         //BLR.utils.foo({uri: sendableUri, searchCriteria: searchCriteria});
//     }
// };

BLR.eventlisteners.goHome = function(event) {
    event.stopPropagation();
    event.preventDefault();

    BLR.utils.turnOffAll();
    BLR.utils.turnOnById('index');
    BLR.base.dom.q.value = '';
    history.pushState('', '', 'index.html');
};

BLR.eventlisteners.activateUrlFlagSelectors = function() {
    for (let i = 0, j =  BLR.base.dom.urlFlagSelectors.length; i < j; i++) {

        const element = BLR.base.dom.urlFlagSelectors[i];
        element.addEventListener('click', function(event) {
    
            BLR.utils.chooseUrlFlags(element);
            
            if (element.name === 'communities') {
                BLR.base.dom.communitiesSelector.classList.remove('open');
            }
    
        })
    }
};

/* event **************************/
BLR.eventlisteners.goGetIt = function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    if (BLR.utils.formHasNoValidInput()) {

        // warn and exit if input fields are empty
        BLR.base.dom.q.placeholder = "c’mon, enter something";
        return;
    }
    
    // construct browser URI from fields
    const browserUri = BLR.utils.makeBrowserUri();
    history.pushState('', '', browserUri);

    // construct Zenodeo URI from fields
    const zenodeoUri = BLR.utils.makeZenodeoUriFromInputs();
    BLR.utils.foo(zenodeoUri);
};

BLR.eventlisteners.toggleFigcaption = function(event) {

    // find and store all the figcaptions on the page in 
    // an array. This is done only once since figcaptions 
    // is a global var
    if (BLR.base.figcaptions.length == 0) {
        BLR.base.figcaptions = document.querySelectorAll('figcaption');
        //figcaptionLength = BLR.base.figcaptions.length;
    }

    let fc = this.parentElement.style.maxHeight;
    
    if (fc === BLR.base.figcaptionHeight || fc === '') {
        let i = 0;
        for (; i < BLR.base.figcaptions.length; i++) {
            BLR.base.figcaptions[i].style.maxHeight = BLR.base.figcaptionHeight;
        }

        this.parentElement.style.maxHeight =  '100%';
        this.parentElement.style.overflow = 'auto';
    }
    else {
        this.parentElement.style.maxHeight =  BLR.base.figcaptionHeight;
        this.parentElement.style.overflow = 'hidden';
    }
    
};