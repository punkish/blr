if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') {
    BLR = {};
}

BLR.utils = {};

BLR.utils.statsChart = function(statistics) {

    // Disable automatic style injection
    Chart.platform.disableCSSInjection = true;

    const charts = document.querySelectorAll('.chart');

    /*
    statistics = [
        {
            'chart-name': 'Chart one',
            'x-axis': {
                name: 'materials citations',
                values: []
            },
            'y-axis': {
                name: 'collecting codes',
                values: []
            }
        }
    ]
    */

    for (let i = 0, j = charts.length; i < j; i++) {
        const ctx = charts[i].getContext('2d');
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: statistics[i]['x-axis'].values,
                datasets: [{
                    label: statistics[i]['chart-name'],
                    data: statistics[i]['y-axis'].values,
                    datalabels: { 
                        color: '#000000',
                        formatter: function(value, context) {
                            if (value > 1000000) {
                                return `${Math.round(value/1000000)}M`
                            }
                            else if (value > 1000) {
                                return `${Math.round(value/1000)}K`
                            }
                            else {
                                return value;
                            } 
                        }
                    },
                    backgroundColor: '#ff0000',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: { 
                            beginAtZero: true,

                            // Include a dollar sign in the ticks
                            callback: function(value, index, values) {
                                if (value > 1000000) {
                                    return `${value/1000000}M`
                                }
                                else if (value > 1000) {
                                    return `${value/1000}K`
                                }
                                else {
                                    return value;
                                }
                            }
                        }
                    }],
                    xAxes: [{
                        scaleLabel: { fontSize: 8 }
                    }]
                },
                responsive: true,
                tooltips: { enabled: false },
                legend: { display: false }
            }
        });
    }
};

BLR.utils.niceNumbers = function(num) {
    if (num < 10) {
        return ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine'][num];
    }
    else {
        return num;
    }
};

BLR.utils.formatSearchCriteria = function(queryObject) {

    function str(el) {
        if (el[0] === 'q') {
            return `<span class='crit-val'>${el[1]}</span> is in the <span class='crit-key'>text</span>`
        }
        else {
            return `<span class='crit-key'>${el[0]}</span> is <span class='crit-val'>${el[1]}</span>`
        }
    }

    const remove = ['id', 'size', 'communities', 'page'];
    remove.forEach(e => { if (Object.keys(queryObject).indexOf(e) > -1) { delete(queryObject[e]) }})

    let c = '';
    const el = Object.entries(queryObject);
    const l = el.length;
    if (l === 1) {
        c += str(el[0]);
    }
    else if (l === 2) {
        c += `${str(el[0])} and ${str(el[1])}`;
    }
    else {
        const ab = el.slice(0, l - 1);
        const last = el[l - 1];
        c += ab.map(e => str(e)).join(', ') + ' and ' + str(last);
    }

    return c;
};

BLR.utils.formatAuthorsList = function(treatmentAuthors) {

    let c = '';
    const l = treatmentAuthors.length;
    if (l === 1) {
        c += treatmentAuthors[0].author
    }
    else if (l === 2) {
        c += `${treatmentAuthors[0].author} and ${treatmentAuthors[1].author}`;
    }
    else {
        const ab = treatmentAuthors.slice(0, l - 1);
        const last = treatmentAuthors[l - 1].author;
        c += ab.map(e => e.author).join(', ') + ' and ' + last;
    }

    return c;
};

BLR.utils.makeUris = function (queryObj, setHistory = true) {

    let hrefArray1 = [];
    let hrefArray2 = [];

    for (let p in queryObj) {

        // We don't want to send 'resource' to Zenodeo
        // because 'resource' is already in the uri
        if (p !== 'resource') {
            hrefArray1.push(p + '=' + queryObj[p]);
        }

        // We don't want 'refreshCache' in the browser
        // address bar
        if (p !== 'refreshCache') {
            hrefArray2.push(p + '=' + queryObj[p]);
        }
    }

    const uri = `${BLR.base.zenodeo}/v2/${queryObj.resource}?${hrefArray1.join('&')}`;

    const search = hrefArray2.join('&');

    if (setHistory) {
        history.pushState('', '', `?${hrefArray2.join('&')}`);
    }
    
    return {
        search: search,
        uri: uri
    }

};

BLR.utils.getResource = function(queryObj) {
    const {search, uri} = BLR.utils.makeUris(queryObj);
    
    if (queryObj.resource === 'treatments') {
        BLR.treatments.getTreatments(queryObj, search, uri);
    }
    else if (queryObj.resource === 'images') {
        BLR.getImages(queryObj, search, uri);
    }
};

BLR.utils.syntheticData = function(resource, queryObj) {
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    const alpha = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

    function getRandomString(len) {
        let s = '';
        for (let i = 0; i < len; i++) {
            s += alpha[getRandomInt(26)]
        }

        return s;
    }

    resource.statistics = {
        'below 10': 0,
        '10 to 50': 0,
        'above 50': 0
    }

    const numOfRecords = getRandomInt(100);
    for (let i = 0; i < numOfRecords; i++) {
        const age = getRandomInt(100);
        resource.data.push({name: getRandomString(getRandomInt(10)), age: age});
        if (age < 10) {
            resource.statistics['below 10']++;
        }
        else if (age > 50) {
            resource.statistics['above 50']++;
        }
        else {
            resource.statistics['10 to 50']++;
        }
    }

    resource['records-found'] = BLR.utils.niceNumbers(numOfRecords);
    resource.resource = 'treatments';
    
    resource['search-criteria'] = BLR.utils.formatSearchCriteria(queryObj);

    resource.successful = true;
    resource.from = 'One';
    resource.to = 30;
};

BLR.utils.fetchReceive = function(response) {
    if (!response.ok) {
        throw new Error('HTTP error, status = ' + response.status);
    }

    return response.json();
};

BLR.utils.isXml = function(s) {
    if (s.length === 32) {
        return true;
    }

    return false;
};

BLR.utils.urlDeconstruct = function(s) {
    
    // remove any leading '?'
    if (s.substr(0, 1) === '?') {
        s = s.substr(1);
    }

    const queryObject = {};
    s.split('&').forEach(p => { r = p.split('='); queryObject[r[0]] = r[1] });
    if (queryObject.q) {
        q.value = queryObject.q;
    }

    const rtLabels = BLR.base.dom.resourceSelector.querySelectorAll('label');
    const rtInputs = BLR.base.dom.resourceSelector.querySelectorAll('input');

    for (let i = 0; i < rtLabels.length; i++) {
        if (queryObject.resource === rtInputs[i].value) {
            rtLabels[i].classList.add('searchFocus');
        }
        else {
            rtLabels[i].classList.remove('searchFocus');
        }
    }

    return queryObject;
};

BLR.utils.urlConstruct = function() {

    const queryObject = {};

    const inputs = BLR.dom.inputs;
    for (let i = 0, j = inputs.length; i < j; i++) {
        const input = inputs[i];
        if (input.type === 'radio' || input.type === 'checkbox') {
            if (input.checked) {
                queryObject[input.name] = input.value;
            }
        }
        else {
            queryObject[input.name] = input.value;
        }
    }

    if (queryObject.resource === 'images') {
        queryObject.access_right = 'open';
    }

    queryObject.page = 1;
    queryObject.id = 0;

    return queryObject;
};

BLR.utils.makePager = function(data, search) {

    if (search.substr(0, 1) === '?') {
        search = search.substr(1);
    }

    const queryObject = {};
    search.split('&').forEach(p => { r = p.split('='); queryObject[r[0]] = r[1] });

    if (data['num-of-records'] && (data['num-of-records'] >= BLR.size)) {
        data.prev = '?' + search.replace(/page=\d+/, `page=${data.prevpage}`);
        data.next = '?' + search.replace(/page=\d+/, `page=${data.nextpage}`);
    }

    data.pager = true;
    return data;
};

BLR.utils.goGetIt = function(event) {

    if (!location.search && BLR.dom.q.value === '') {

        // neither is there an event, that is, nothing has
        // been clicked, nor there are any search params, 
        // that is, we are not trying to load a preformed 
        // URL sent by someone. This means something is not 
        // right. In this case, default to a blank form
        BLR.toggle(BLR.dom.panels, 'off');
        BLR.dom.q.placeholder = "c’mon, enter something";
        return false;
    }
    else {
        
        let qp;
        if (event) {

            event.preventDefault();
            event.stopPropagation();

            // construct URL based on form fields
            qp = BLR.utils.urlConstruct(BLR.dom.form);
        }
        else if (location.search) {
    
            // deconstruct URL based on location.search
            qp = BLR.utils.urlDeconstruct(location.search);
        }

        BLR.eventlisteners.toggle(BLR.base.dom.throbber, 'on');
        BLR.utils.getResource(qp);
    }
};

BLR.utils.toggleRefreshCache = function(event) {
    BLR.dom.refreshCacheWarning.classList.toggle('show');
};

BLR.utils.toggleCommunities = function(event) {
    BLR.dom.communitiesSelector.classList.toggle('open');
};

BLR.utils.toggleFigcaption = function(event) {

    // find and store all the figcaptions on the page in 
    // an array. This is done only once since figcaptions 
    // is a global var
    if (BLR.figcaptions.length == 0) {
        BLR.figcaptions = document.querySelectorAll('figcaption');
    }

    let fc = this.parentElement.style.maxHeight;
    
    if (fc === BLR.figcaptionHeight || fc === '') {
        let i = 0;
        for (; i < BLR.figcaptions.length; i++) {
            BLR.figcaptions[i].style.maxHeight = BLR.figcaptionHeight;
        }

        this.parentElement.style.maxHeight =  '100%';
        this.parentElement.style.overflow = 'auto';
    }
    else {
        this.parentElement.style.maxHeight =  BLR.figcaptionHeight;
        this.parentElement.style.overflow = 'hidden';
    }
};

BLR.utils.suggest = function(field) {
    new autoComplete({
        selector: field,
        minChars: 3,
        source: function(term, response) {
            try { fetch.abort() } catch(e) {}
            fetch(`${BLR.base.zenodeo}/v2/families?q=${term}`)
                .then(BLR.utils.fetchReceive)
                .then(response);
        }
    });
};

BLR.utils.activateUrlFlagSelectors = function() {
    for (let i = 0, j = BLR.base.dom.urlFlagSelectors.length; i < j; i++) {

        const element = BLR.base.dom.urlFlagSelectors[i];
        element.addEventListener('click', function(event) {
    
            BLR.utils.chooseUrlFlags(element);
            
            if (element.name === 'communities') {
                BLR.base.dom.communitiesSelector.classList.remove('open');
            }
    
        })
    }
};

BLR.utils.chooseUrlFlags = function (element) {

    if (element.name === 'communities') {

        if (element.value === 'all communities') {

            const j = BLR.dom.communityCheckBoxes.length;
            if (element.checked === true) {
                for (let i = 0; i < j; i++) {
                    BLR.dom.communityCheckBoxes[i].checked = true;
                }
            }
            else {
                for (let i = 0; i < j; i++) {
                    if (BLR.dom.communityCheckBoxes[i].value !== 'all communities') {
                        BLR.dom.communityCheckBoxes[i].checked = false;
                    }
                }
            }

        }
        else {

            // uncheck 'all communities'
            BLR.dom.allCommunities.checked = false;
        }
    }
    else if (element.name === 'resource') {

        const rtLabels = BLR.dom.resourceSelector.querySelectorAll('label');
        const rtInputs = BLR.dom.resourceSelector.querySelectorAll('input');

        for (let i = 0; i < rtLabels.length; i++) {
            if (element.value === rtInputs[i].value) {
                rtLabels[i].classList.add('searchFocus');
                BLR.getResource({resource: rtInputs[i].value, stats: true});
            }
            else {
                rtLabels[i].classList.remove('searchFocus');
            }
        }
    }
    else if (element.name === 'refreshCache') {
        element.value = element.checked;
    }

};