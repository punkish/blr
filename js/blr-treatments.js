if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') BLR = {};

if (!('treatments' in BLR)) BLR.treatments = {};

BLR.treatments.getOneTreatment = function(uri, search) {
    
    fetch(uri)
        .then(BLR.utils.fetchReceive)
        .then(function(res) {    
            BLR.base.model.treatment = res.value;

            if (uri.indexOf('xml') > -1) {
                return BLR.model.treatment;
            }

            else {
                BLR.base.model.treatment.imgCount = BLR.utils.niceNumbers(BLR.base.model.treatment.imgCount);
                BLR.base.model.treatment.zenodeo = BLR.base.zenodeo;

                if (BLR.base.model.treatment['related-records'].materialsCitations.length) {
                    BLR.base.model.treatment.materialsCitations = BLR.base.model.treatment['related-records'].materialsCitations;
                    BLR.base.model.treatment.mapState = 'open';
                }

                if (BLR.base.model.treatment['related-records'].bibRefCitations.length) {
                    BLR.base.model.treatment.bibRefCitations = BLR.base.model.treatment['related-records'].bibRefCitations;
                    BLR.base.model.treatment.bibRefCitationsState = 'open';
                }

                if (BLR.base.model.treatment['related-records'].figureCitations.length) {
                    BLR.base.model.treatment.figureCitations = BLR.base.model.treatment['related-records'].figureCitations;
                    BLR.base.model.treatment.figureCitationsState = 'open';
                }

                if (BLR.base.model.treatment['related-records'].treatmentAuthors.length) {
                    BLR.base.model.treatment.treatmentAuthors = BLR.base.model.treatment['related-records'].treatmentAuthors;
                    BLR.base.model.treatment.treatmentAuthorsList = BLR.utils.formatAuthorsList(BLR.base.model.treatment['related-records'].treatmentAuthors);
                }
                
                BLR.base.dom.treatment.results.innerHTML = Mustache.render(
                    BLR.base.templates.wholes.treatment, 
                    BLR.base.model.treatment,
                    BLR.base.templates.partials
                );        

                if (BLR.base.model.treatment.imgCount !== 'Zero') {
                    const figs = document.querySelectorAll('figcaption > a');
                    // const reporters = document.querySelectorAll('.report');
                    // const submitters = document.querySelectorAll('.submit');
                    // const cancellers = document.querySelectorAll('.cancel');
                    
                    for (let i = 0, j = figs.length; i < j; i++) {
                        figs[i].addEventListener('click', BLR.utils.toggleFigcaption);
                        // reporters[i].addEventListener('click', toggleReporter);
                        // submitters[i].addEventListener('click', submitReporter);
                        // cancellers[i].addEventListener('click', cancelReporter);
                    }
                }

                if (BLR.base.model.treatment['related-records'].materialsCitations.length) {
                    BLR.treatments.makeMap(BLR.base.model.treatment.materialsCitations);
                }
                

                BLR.utils.turnOffAll();
                BLR.eventlisteners.toggle(BLR.base.dom.throbber, 'off');
                BLR.eventlisteners.toggle(BLR.base.dom.treatment.section, 'on');
                BLR.base.map.leaflet.invalidateSize();
            }

        });
};

BLR.treatments.getManyTreatments = function(uri) {

    fetch(uri)
        .then(BLR.utils.fetchReceive)
        .then(function(res) {

            
            BLR.base.model.treatments = res.value;

            if (BLR.base.model.treatments['num-of-records']) {

                BLR.base.model.treatments.resource = 'treatments';

                if (BLR.base.model.treatments['num-of-records'] > 0) {
                    if (BLR.base.model.treatments.records && BLR.base.model.treatments.records.length) {
                        BLR.base.model.treatments.successful = true;
                        BLR.base.model.treatments['num-of-records'] = BLR.utils.niceNumbers(BLR.base.model.treatments['num-of-records']);
                        BLR.base.model.treatments.from = BLR.utils.niceNumbers(BLR.base.model.treatments.from);

                        if (BLR.base.model.treatments.to < 10) {
                            BLR.base.model.treatments.to = BLR.utils.niceNumbers(BLR.base.model.treatments.to).toLowerCase();
                        }
                        
                        BLR.base.model.treatments['search-criteria-text'] = BLR.utils.formatSearchCriteria(
                            BLR.base.model.treatments['search-criteria'],
                            BLR.base.model.treatments['num-of-records'],
                            'treatments'
                        );
                        
                        BLR.utils.makePager(BLR.base.model.treatments);
                    }
                    else {
                        BLR.base.model.treatments.successful = false;
                    }
                    
                    BLR.base.dom.treatments.results.innerHTML = Mustache.render(
                        BLR.base.templates.wholes.treatments, 
                        BLR.base.model.treatments,
                        BLR.base.templates.partials
                    );

                    
                    //BLR.utils.statsChart(BLR.base.model.treatments.statistics);
                    //BLR.makeMap(BLR.model.treatments.map);
                    //const tabs = new Tabby('[data-tabs]');
         
                    //tabs.open(1);
                }
                else {
                    BLR.base.model.treatments.successful = false;
                    BLR.base.model.treatments['num-of-records'] = 'No';

                    BLR.base.dom.treatments.results.innerHTML = Mustache.render(
                        BLR.base.templates.wholes.treatments, 
                        BLR.base.model.treatments,
                        BLR.base.templates.partials
                    );
                }

            }

            BLR.utils.turnOffAll();
            BLR.eventlisteners.toggle(BLR.base.dom.throbber, 'off');
            BLR.eventlisteners.toggle(BLR.base.dom.treatments.section, 'on');
            
        });
};

BLR.treatments.getTreatments = function(uri) {

    // single treatment
    if (uri.indexOf('treatmentId') > -1) {
        //console.log('getting a single treatment ' + queryObj.treatmentId);
        BLR.treatments.getOneTreatment(uri);
    }
    
    // many treatments
    else {
        //console.log('getting many treatments from ' + uri);
        BLR.treatments.getManyTreatments(uri);
    }
};

BLR.treatments.makeMap = function(points) {

    // initialize the map and add the layers to it
    BLR.base.map.leaflet = L.map('map', {
        center: [0, 0],
        zoom: 2,
        scrollWheelZoom: false
    });

    const tiles = L.tileLayer(BLR.base.map.url, {
        attribution: BLR.base.map.attribution,
        maxZoom: 18,
        id: BLR.base.map.id,
        accessToken: BLR.base.map.accessToken
    }).addTo(BLR.base.map.leaflet);

    // https://stackoverflow.com/questions/16845614/zoom-to-fit-all-markers-in-mapbox-or-leaflet
    const markers = [];
    points.forEach(p => {
        if (typeof(p.latitude) === 'number' && typeof(p.longitude) === 'number') {

            const title = points.treatmentTitle;
            
            const marker = L.marker([p.latitude, p.longitude]).addTo(BLR.base.map.leaflet);
            marker.bindPopup(p.typeStatus + '<br>' + title);
            markers.push(marker)
        }
    });

    const bounds = new L.featureGroup(markers).getBounds();
    BLR.base.map.leaflet.fitBounds(bounds);
   //BLR.base.map.leaflet.addLayer(markers);
    
    

    // const bounds = new L.featureGroup(markers).getBounds();
    // console.log(foo);
    // console.log(bounds);

    // const b = [
    //     [-35.331112, 149.775],
    //     [-37.331387, 138.7475]
    // ];

    //mcmap.fitBounds(new L.featureGroup(markers).getBounds().pad(0.5));

}