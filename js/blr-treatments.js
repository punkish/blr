if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') {
    BLR = {};
}

BLR.getOneTreatment = function(uri, search) {
    
    fetch(uri)
        .then(BLR.fetchReceive)
        .then(function(res) {    
            BLR.model.treatment = res.value;

            if (uri.indexOf('xml') > -1) {
                return BLR.model.treatment;
            }

            else {
                BLR.model.treatment.imgCount = BLR.niceNumbers(BLR.model.treatment.imgCount);
                BLR.model.treatment.zenodeo = BLR.zenodeo;

                if (BLR.model.treatment['related-records'].materialsCitations.length) {
                    BLR.model.treatment.materialsCitations = BLR.model.treatment['related-records'].materialsCitations;
                    BLR.model.treatment.mapState = 'open';
                }

                if (BLR.model.treatment['related-records'].bibRefCitations.length) {
                    BLR.model.treatment.bibRefCitations = BLR.model.treatment['related-records'].bibRefCitations;
                    BLR.model.treatment.bibRefCitationsState = 'open';
                }

                if (BLR.model.treatment['related-records'].figureCitations.length) {
                    BLR.model.treatment.figureCitations = BLR.model.treatment['related-records'].figureCitations;
                    BLR.model.treatment.figureCitationsState = 'open';
                }

                if (BLR.model.treatment['related-records'].treatmentAuthors.length) {
                    BLR.model.treatment.treatmentAuthors = BLR.model.treatment['related-records'].treatmentAuthors;
                    BLR.model.treatment.treatmentAuthorsList = BLR.formatAuthorsList(BLR.model.treatment['related-records'].treatmentAuthors);
                }
                
                BLR.dom.treatments.innerHTML = Mustache.render(
                    BLR.templates.treatment, 
                    BLR.model.treatment,
                    BLR['template-partials']
                );        

                if (BLR.model.treatment.imgCount !== 'Zero') {
                    const figs = document.querySelectorAll('figcaption > a');
                    // const reporters = document.querySelectorAll('.report');
                    // const submitters = document.querySelectorAll('.submit');
                    // const cancellers = document.querySelectorAll('.cancel');
                    
                    for (let i = 0, j = figs.length; i < j; i++) {
                        figs[i].addEventListener('click', BLR.toggleFigcaption);
                        // reporters[i].addEventListener('click', toggleReporter);
                        // submitters[i].addEventListener('click', submitReporter);
                        // cancellers[i].addEventListener('click', cancelReporter);
                    }
                }

                if (BLR.model.treatment['related-records'].materialsCitations.length) {
                    //document.querySelector('#map').classList.add('show');
                    BLR.makeMap(BLR.model.treatment.materialsCitations);
                }

                BLR.eventlisteners.toggle(BLR.base.dom.throbber, 'off');
                BLR.eventlisteners.toggle(BLR.base.dom.treatments, 'on');
            }

        });
};

BLR.getManyTreatments = function(uri, search) {

    fetch(uri)
        .then(BLR.fetchReceive)
        .then(function(res) {
            BLR.model.treatments = res.value;

            if (BLR.model.treatments['num-of-records']) {

                BLR.model.treatments.resource = 'treatments';

                if (BLR.model.treatments['num-of-records'] > 0) {
                    if (BLR.model.treatments.records && BLR.model.treatments.records.length) {
                        BLR.model.treatments.successful = true;
                        BLR.model.treatments['num-of-records'] = BLR.niceNumbers(BLR.model.treatments['num-of-records']);
                        BLR.model.treatments.from = BLR.niceNumbers(BLR.model.treatments.from);

                        if (BLR.model.treatments.to < 10) {
                            BLR.model.treatments.to = BLR.niceNumbers(BLR.model.treatments.to).toLowerCase();
                        }
                        
                        BLR.model.treatments['search-criteria-text'] = BLR.formatSearchCriteria(BLR.model.treatments['search-criteria']);
                        BLR.makePager(BLR.model.treatments, search, false);
                    }
                    else {
                        BLR.model.treatments.successful = false;
                    }
                    
                    BLR.dom.treatments.innerHTML = Mustache.render(
                        BLR.templates.treatments, 
                        BLR.model.treatments,
                        BLR['template-partials']
                    );

                    
                    BLR.statsChart(BLR.model.treatments.statistics);
                    //BLR.makeMap(BLR.model.treatments.map);
                    const tabs = new Tabs({ elem: "tabs", open: 0 });
                    //tabs.open(1);
                    
                    BLR.dom.q.placeholder = `search ${BLR.model.treatments['num-of-records']} treatments`;
                }
                else {
                    BLR.model.treatments.successful = false;
                    BLR.model.treatments['num-of-records'] = 'No';

                    BLR.dom.treatments.innerHTML = Mustache.render(
                        BLR.templates.treatments, 
                        BLR.model.treatments,
                        BLR['template-partials']
                    );
                }

            }

            BLR.toggle(BLR.dom.throbber, 'off');
            BLR.toggle(BLR.dom.treatments, 'on');
            BLR.map.leaflet.invalidateSize();

        });
};

BLR.getTreatments = function(queryObj, search, uri) {

    // single treatment
    if (queryObj.treatmentId) {
        //console.log('getting a single treatment ' + queryObj.treatmentId);
        BLR.getOneTreatment(uri, search);
    }
    
    // many treatments
    else {
        //console.log('getting many treatments from ' + uri);
        BLR.getManyTreatments(uri, search);
    }
};

BLR.makeMap = function(points) {

    // initialize the map and add the layers to it
    BLR.map.leaflet = L.map('map', {
        center: [0, 0],
        zoom: 2,
        scrollWheelZoom: false
    });

    const tiles = L.tileLayer(BLR.map.url, {
        attribution: BLR.map.attribution,
        maxZoom: 18,
        id: BLR.map.id,
        accessToken: BLR.map.accessToken
    }).addTo(BLR.map.leaflet);

    // https://stackoverflow.com/questions/16845614/zoom-to-fit-all-markers-in-mapbox-or-leaflet
    const markers = [];
    points.forEach(p => {
        if (typeof(p.latitude) === 'number' && typeof(p.longitude) === 'number') {

            const title = mc.treatmentTitle;
            
            const marker = L.marker([mc.latitude, mc.longitude]).addTo(mcmap);
            marker.bindPopup(mc.typeStatus + '<br>' + title);
            markers.push(marker)
        }
    });

    BLR.map.leaflet.addLayer(markers);
    
    

    // const bounds = new L.featureGroup(markers).getBounds();
    // console.log(foo);
    // console.log(bounds);

    // const b = [
    //     [-35.331112, 149.775],
    //     [-37.331387, 138.7475]
    // ];

    //mcmap.fitBounds(new L.featureGroup(markers).getBounds().pad(0.5));

}