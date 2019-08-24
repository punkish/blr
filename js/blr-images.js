if (typeof(BLR) === 'undefined' || typeof(BLR) !== 'object') {
    BLR = {};
}

BLR.getImages = function(queryObj, search, uri) {

    fetch(uri)
        .then(BLR.fetchReceive)
        .then(function(res) {

            const data = res.value;

            BLR.model.images.resource = 'images';
            BLR.model.images['records-found'] = data.recordsFound;
            BLR.model.images.statistics = data.statistics;

            BLR.model.images['search-criteria'] = BLR.formatSearchCriteria(data.whereCondition);
            
            [BLR.model.images.figures, BLR.model.images.imagesFound] = makeLayout(data.images);
            
            makePager(BLR.model.images, search, queryObj.page);
            BLR.model.images['records-found'] = niceNumbers(xh.value.recordsFound);

            BLR.dom.images.innerHTML = Mustache.render(
                BLR.templates.images, 
                BLR.model.images, 
                BLR['template-partials']
            );   

            BLR.statsChart(BLR.model.images.statistics);
            
            const figs = document.querySelectorAll('figcaption > a');
            for (let i = 0, j = figs.length; i < j; i++) {
                figs[i].addEventListener('click', BLR.toggleFigcaption);
            }

            const carousel = document.querySelectorAll('.carousel');
            for (let i = 0, j = carousel.length; i < j; i++) {
                carousel[i].addEventListener('click', function(event) {
                    turnCarouselOn(BLR.model.images, BLR.model.images.figures[i].recId);
                });
            }
            
            BLR.toggle(BLR.dom.throbber, 'off');
            BLR.toggle(BLR.dom.images, 'on');
        });
};