// const loc = 'local';
const loc = 'remote';

//const layout = 'masonry';
const layout = 'grid';

let baseUrl = '';
if (loc === 'local') {
    baseUrl = 'http://localhost:3030/v1/records?size=30&communities=biosyslit&type=image&summary=false&images=true&';
}
else if (loc === 'remote') {
    baseUrl = 'http://zenodeo.punkish.org/v1/records?size=30&communities=biosyslit&type=image&summary=false&images=true&';
}

let view;
if (layout === 'masonry') {
    view = document.getElementById('masonry');
}
else if (layout === 'grid') {
    view = document.getElementById('grid');
}

const btn = document.getElementById('btn-images');
const throbber = document.getElementById('throbber');
const pager = document.getElementById('pager');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const q = document.getElementById('q');
const footer = document.getElementById('footer');

const getQueryStr = function(qStr) {
    let qryStr = {};
    qStr.substr(1).split('&').forEach(function(el) {
        qryStr[el.split('=')[0]] = el.split('=')[1];
    });

    return qryStr;
};

const getImagesFromPager = function(event) {

    view.style.visibility = 'hidden';
    smoothScroll(0);

    let qryStr = getQueryStr(this.search);
    let qry = qryStr['q'];
    let page = qryStr['page'];

    getImages(event, qry, page);
};

const getImagesFromButton = function(event) {
    let qry = q.value.toLowerCase();
    let page = 1;

    // make the button darker so it is apparent   
    // that it was pressed
    btn.className = 'on';

    getImages(event, qry, page);
};

const makeLayout = function(res) {
    var html = "";
    
    for (var record in res) {
        html += "<figure class='item'>";
        var images = res[record];
        var j = images.length;
        for (var i = 0; i < j; i++) {
            html += `<img src='${images[i]}'>`;
        }

        html += `<figcaption>
            rec ID: <a href='https://zenodo.org/record/${record.split('/').pop()}' target='_blank'>
                ${record.split('/').pop()}</a>
            </figcaption>
        </figure>`;
    }

    return html;
};

const getImages = function(event, qry, page) {

    // make the throbber visible
    throbber.style.visibility = 'visible';
    
    // we attach qStr1 to 'prev' and 'next' links 
    // with the correctly decremented or incremented 
    // page number
    let qStr1 = 'q=' + qry + '&page=';

    // qStr2 is used for `history`
    let qStr2 = qStr1 + page;

    // the complete url to the api
    let url = baseUrl + qStr2;

    let x = new XMLHttpRequest();

    x.onload = function(event) {
        if (x.readyState === 4) {
            if (x.status === 200) {
                var res = JSON.parse(x.responseText);
                view.innerHTML = makeLayout(res);
                view.style.visibility = 'visible';
                btn.className = 'off';
                throbber.style.visibility = 'hidden';
                footer.style.position = 'relative';

                prev.href = (page === 1) ? '?' + qStr1 + 1 : '?' + qStr1 + (page - 1);
                next.href = '?' + qStr1 + (parseInt(page) + 1);
                pager.style.visibility = 'visible';
                prev.addEventListener('click', getImagesFromPager);
                next.addEventListener('click', getImagesFromPager);

                history.pushState('', '', '?' + qStr2);
            }
        }
    };

    x.onerror = function(e) {
        console.error(x.statusText);
    };

    x.open("GET", url, true);
    x.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    x.send();

    if (event !== null) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    return false;
};

const currentYPosition = function() {

    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) return self.pageYOffset;

    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;

    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) return document.body.scrollTop;
    return 0;
};

const smoothScroll = function(stopY) {
    var startY = currentYPosition();
    var distance = stopY > startY ? stopY - startY : startY - stopY;

    if (distance < 100) {
        scrollTo(0, stopY);
        return;
    }

    var speed = Math.round(distance / 100);
    if (speed >= 10) speed = 10;
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    if (stopY > startY) {
        for (var i=startY; i<stopY; i+=step) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY += step; if (leapY > stopY) leapY = stopY; timer++;
        }
        return;
    }

    for ( var i=startY; i>stopY; i-=step ) {
        setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
        leapY -= step;
        if (leapY < stopY) leapY = stopY; timer++;
    }
};