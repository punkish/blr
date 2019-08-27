if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') {
    BLR = {};
}

BLR.eventlisteners = {};

BLR.eventlisteners.modalOpen = function(event) {
    event.stopPropagation();
    event.preventDefault();

    for (let i = 0, j = BLR.base.saveable.length; i < j; i++) {
        
        const s = document.getElementById(BLR.base.saveable[i]);

        // is any of the saveable panel 'on'?
        if (s.classList.contains('visible')) {

            // yes, so save it for later
            BLR.base.savedState = BLR.base.saveable[i];

            // now turn it off
            BLR.eventlisteners.turnOff(s);
            break;
        }
    }

    // close all modals
    BLR.eventlisteners.toggle(BLR.base.dom.panels, 'off');

    //const id = event.target.hash.substr(1);
    const id = event.target.pathname.substr(1).split('.')[0];
    BLR.eventlisteners.toggle(BLR.base.dom[id], 'on');
};

BLR.eventlisteners.modalClose = function(event) {
    event.stopPropagation();
    event.preventDefault();

    const id = event.target.pathname.substr(1).split('.')[0];
    BLR.eventlisteners.toggle(BLR.base.dom[id], 'off');

    // is a panel already in a savedState? if yes, turn it 'on'
    if (BLR.base.savedState) {
        const s = document.getElementById(BLR.base.savedState);
        BLR.eventlisteners.turnOn(s);
        BLR.base.savedState = null;
    }
};

BLR.eventlisteners.addEvents = function(elements, func) {
    const len = elements.length;

    if (len > 1) {
        for (let i = 0, j = len; i < j; i++) {
            elements[i].addEventListener('click', func);
        }
    }
    else {
        elements.addEventListener('click', func);
    }
};

BLR.eventlisteners.turnOff = function(element) {
    element.classList.remove('visible'); 
    element.classList.add('hidden');
};

BLR.eventlisteners.turnOn = function(element) {
    element.classList.add('visible');
    element.classList.remove('hidden');

    const domsToUris = [
        'about',
        'privacy',
        'ip',
        'contact',
        'index',
        'treatments'
    ];

    if (domsToUris.indexOf(element.id) > -1) {
        let url = element.id + '.html';

        if (location.search) {
            url = url + location.search;
        }

        if (location.hash) {
            url = url + location.hash;
        }

        history.pushState('', '', url);
    }
};

BLR.eventlisteners.toggle = function(elements, state) {
    const len = elements.length;

    if (state === 'on') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                BLR.eventlisteners.turnOn(elements[i]);
            }
        }
        else {
            BLR.eventlisteners.turnOn(elements);
        }
    }
    else if (state === 'off') {
        if (len > 1) {
            for (let i = 0, j = len; i < j; i++) {
                BLR.eventlisteners.turnOff(elements[i]);
            }
        }
        else {
            BLR.eventlisteners.turnOff(elements);
        }
    }
};