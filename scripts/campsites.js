
let previewList = []; 
var map;
var mapMarker;

window.onload = () => {
    let url = new URL(window.location.href);
    let coords = url.searchParams.get('location').split(',');
    let latlng = {lat: parseFloat(coords[0]), lng: parseFloat(coords[1])};
    let displayDiv = document.getElementById('locationQuery');

    // Initialize the map here
    map = new google.maps.Map(document.getElementById("map"), {
        center: new google.maps.LatLng(latlng.lat, latlng.lng),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.HYBRID
    });
    mapMarker = new google.maps.Marker({
        position: new google.maps.LatLng(latlng.lat, latlng.lng),
        map: map,
    });
    showLoading();
    resolveLocation(latlng, (state, address) => {
        npsCampgrounds(state, latlng, (campgrounds) => {
            hideLoading();
            resultsShow();
            for (let site of campgrounds){
                console.log(`${site.name} - ${site.distance} mi`);
                if (site.distance != undefined) {
                let preview = document.createElement('campsite-preview');
                preview.campground = site;
                previewList.push(preview.campground);
                }
            }
            var campgs = "Showing " + previewList.length + " campgrounds near: " + address;
            displayDiv.innerHTML = campgs;
            loadSideBar(previewList);
            updateCampSite(previewList[0].name);
        });
    });
}

// =================================== Functions ===================================

function resultsShow(){
// Makes the results div visible
    let div = document.querySelector('#results');
    div.style.display = 'grid';
}

function loadSideBar(previewList) {
// Dynamically creates sidebar with nearby campsites
    for (let i = 0; i < previewList.length; ++i) {
        var name = previewList[i].name;
        var distance = previewList[i].distance;
        var value = name + '</br>' + distance + ' miles away';
        var element = document.createElement("button");
        element.setAttribute("type", "button");
        element.setAttribute("id", "campsiteButton");
        //element.setAttribute("value", value);
        element.innerHTML = value;
        element.setAttribute("name", name);
        var add = document.getElementById("campsiteList");
        add.appendChild(element);
    }
}


document.addEventListener('click', function(e) {
// Check for sidebar click events
    if (e.target && e.target.type == 'button') {
        updateCampSite(e.target.name);
    }
});


function updateCampSite(camp) {
// Loads new campsite information.
    var newCamp;
    for (i = 0; i < previewList.length; ++i) {
        if (previewList[i].name == camp) {
            newCamp = previewList[i];
            break;
        }
    }
    if (newCamp != undefined) {
        document.getElementById("overview").innerHTML = `<h1>${newCamp.name}</h1><p>${newCamp.description}</p>`;
        getWeather(newCamp);
        getPhotos(newCamp);
        checkAmenities(newCamp);
        getAlerts(newCamp);
        getDirections(newCamp);
    }
}

async function getWeather(camp){
    let container = document.getElementById('weatherForecast');
    container.innerHTML = '';
    if (camp.location){
        getForecast(camp.location.lat, camp.location.lng, (forecasts) => {
            for (let forecast of forecasts){
                let el = document.createElement('forecast-day');
                el.forecast = forecast;
                container.appendChild(el);
            }
        });
    }
}

async function getPhotos(camp){
    let container = document.getElementById('campsitePhotos');
    container.innerHTML = '';
    findPhotos(camp.name, (photos)=>{
        if (photos && photos.length > 0){
            let slideshow = document.createElement('slide-show');
            slideshow.photos = photos;
            container.appendChild(slideshow);
        } else{
            container.style.display = 'none';
        }
    })
}

function getAlerts(camp) {
// Update campsite warnings and policies
    let alertsDiv = document.getElementById("alerts");
    alertsDiv.innerHTML = `
        <h2>Regulations and Policies</h2>
        <i class="fas fa-exclamation-circle"></i>`;

    if (camp.firePolicy == undefined && camp.regulations == undefined
        || camp.firePolicy == '.' && camp.regulations == undefined) {
        document.getElementById("alerts").innerHTML += `<p>Enjoy your trip!</p>`;
        return;
    }

    if (camp.regulations != undefined) {
        alertsDiv.innerHTML += `
        <h3>Regulations:</h3>`;
        if (camp.regulations.description != undefined) {
            alertsDiv.innerHTML += ` <p>${camp.regulations.description}</p>`;
        }
        if (camp.regulations.url != undefined) {
            alertsDiv.innerHTML += `<a href=${camp.regulations.url}>${camp.regulations.url}</a>`;
        }
    }

    if (camp.firePolicy != undefined) {
        alertsDiv.innerHTML += `
        <h3>Fire Policy:</h3>
        <p>${camp.firePolicy}</p>`;
    }

    getParkAlerts(camp.parkCode, (alerts) => {
        if (alerts && alerts.length > 0){
            alertsDiv.innerHTML += `
                <h3>Warning!</h3>
                <div id="parkAlerts">
            `;

            for (alert of alerts){
                if (alert.title){
                    alertsDiv.innerHTML += `<h4>${alert.title}</h4>`;
                }
                if (alert.description){
                    alertsDiv.innerHTML += `<p>${alert.description}</p>`;
                }
                if (alert.url){
                    alertsDiv.innerHTML += `<a href=${alert.url}>More information</a>`;
                }
            }

            alertsDiv.innerHTML += `</div>`;
        }
    });
}

function getDirections(camp) {
// Get direction instructions and load map of area using google maps API.

    let directionsDiv = document.getElementById("directionsText")
    if (camp.directions != undefined) {
        if (camp.directions.description){
            directionsDiv.innerHTML = `<h2>Directions</h2> <p>${camp.directions.description}</p>`;
        }
        if (camp.directions.url){
            let link = document.createElement('a');
            link.href = camp.directions.url;
            link.innerHTML = camp.directions.url;
            directionsDiv.appendChild(link);
        }
    }


    updateMap(camp.location.lat, camp.location.lng);
    // var getMap;
    // var lngt = camp.location.lng;
    // var lat = camp.location.lat;
    // let coords = new google.maps.LatLng(lat,lngt);
    //     getMap = new google.maps.Map(document.getElementById("map"), {
    //         center: coords,
    //         zoom: 8,
    //         mapTypeId: google.maps.MapTypeId.HYBRID
    //     });

    //   var marker = new google.maps.Marker({
    //     position: coords,
    //     map: getMap,
    //     title: 'Campground'
    //   });
}


function updateMap(lat, lng){
    let coords = new google.maps.LatLng(lat,lng);
    map.setCenter(coords);
    mapMarker.setPosition(coords);
}


function checkAmenities(camp) {
// Checks campsite amenities and updates icon depending on availability.
    var amenit = "<h2>Amenities Available: </h2>";
    if (camp.amenities.toilets == true) {
        amenit += `<i class="fas fa-toilet available" title="Toilets available" aria-label="true"></i>`;
    }
    else {
        amenit += `<i class="fas fa-toilet unavailable" title="Toilets unavailable" aria-label="true"></i>`;
    }
    if (camp.amenities.water == true) {
        amenit += `<i class="fas fa-tint available" title="Water available" aria-label="true"></i>`;
    }
    else {
        amenit += `<i class="fas fa-tint unavailable" title="Water unavailable" aria-label="true"></i>`;
    }
    if (camp.amenities.trash == true) {
        amenit += `<i class="fas fa-trash available" title="Trash available" aria-label="true"></i>`;
    }
    else {
        amenit += `<i class="fas fa-trash unavailable" title="Trash unavailable" aria-label="true"></i>`;
    }
    if (camp.amenities.showers == true) {
        amenit += `<i class="fas fa-shower available" title="Showers available" aria-label="true"></i>`;
    }
    else {
        amenit += `<i class="fas fa-shower unavailable" title="Showers unavailable" aria-label="true"></i>`;
    }
    if (camp.amenities.cell == true) {
        amenit += `<i class="fas fa-phone available" title="Cellphone reception available" aria-label="true"></i>`;
    }
    else {
        amenit += `<i class="fas fa-phone-slash unavailable" title="Cellphone reception unavailable" aria-label="true"></i>`;
    }
    document.getElementById("amenities").innerHTML = amenit;
}


function showLoading(){
// Makes the loading icon appear and updates the loading message every 4 seconds

    let loadingDiv = document.getElementById('loading');
    let loadingMessages = [
        'Finding your happy place!',
        'Yes, it really is still loading...',
        'It\'s not us, it\'s the back end - we swear.',
        'Seriously, this service is being hosted on a literal potato.',
        'What do you expect? It\'s a web service developed by the government.',
        'Stay put, your results are coming soon!',
        'Aaaalmost there...',
        'This is going to be SO worth the wait.'
    ];
    let i = 0;
    let text = document.getElementById('loading-text');
    text.innerHTML = loadingMessages[i];
    loadingDiv.style.display = 'block';

    window.setInterval(()=>{
        i = (i+1)%(loadingMessages.length);
        text.innerHTML = loadingMessages[i];
    }, 4500);
}


function hideLoading(){
// Hides the loading icon

    let loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
}


async function resolveLocation(latlng, fn){
// Given latitude and longtitude coordinates, find the state of that location as well as an address

    let geocoder = new google.maps.Geocoder;
    geocoder.geocode({location: latlng}, (results, status) => {
        if (status === 'OK'){
            let result = results[0];
            if (result){
                let address = result.formatted_address;
                let state;
                for (component of result.address_components){
                    let type = component.types[0];
                    if (type === 'administrative_area_level_1'){
                        state = component.short_name
                    }
                }
                fn(state, address);

            } else{
                console.error(`Failed to find an address for location ${JSON.stringify(latlng)}`);
            }

        } else{
            console.error(`Google geocoder service failed with status ${JSON.stringify(status)}`);
        }
    });
}


async function npsCampgrounds(state, latlng, fn){
// Find all the campgrounds in the given state (state) with the National Parks Service API.
// Format the data returned for each campground and sort the campgrounds by increasing distance
// from the selected location (latlng)

// If the API doesn't return the latitude and longitude for a campground, we try to find it with the
// Google geocoding service. When sorting the campgrounds by distance, campgrounds with no known location
// are at the end of the list

    const endpoint = 'https://developer.nps.gov/api/v1/campgrounds';
    const key = 'SRKyrg45JuZyDSc2kS0nNjV8dJ5w5BWpWpuMUHLe';
    const url = `${endpoint}?api_key=${key}&stateCode=${state}&limit=100`;
    console.log(`Fetching camprounds from ${url} ...`);
    let response = await fetch(url);
    let json = await response.json();

    let campgrounds = [];
    let data = json.data;
    console.log(`Retrieved ${data.length} campgrounds`)
    for (let site of data){
        let obj = {};

        if (site.name != ''){
            obj.name = site.name;
        }
        if (site.latLong != ''){
            // The JSON is malformed
            let regex = /\{lat:(-?\d+\.\d+), lng:(-?\d+\.\d+)\}/;
            let latLong = regex.exec(site.latLong);
            let location = {
                lat: parseFloat(latLong[1]),
                lng: parseFloat(latLong[2]),
            };
            obj.location = location;

        } else{
            // Try to get the lat/long with Google places API
            if (obj.name){
                try {
                    let coords = await findCoords(obj.name);
                    obj.location = coords;
                } catch(error){
                    console.error(`Failed to find location of "${obj.name}"`);
                }
            }
        }
        if (obj.location){
            obj.distance = Math.round( distance(obj.location.lat, obj.location.lng, latlng.lat, latlng.lng, 'M') );
        }

        if (site.description != ''){
            obj.description = site.description.replace(/\\n/g, ' ');
        }
        if (site.parkCode != ''){
            obj.parkCode = site.parkCode;
        }
        if (site.campsites.totalsites != 0){
            obj.sites = parseInt(site.campsites.totalsites);
        }
        if (site.weatheroverview != ''){
            obj.weather = site.weatheroverview.replace(/\\n/g, ' ');
        }
        if (site.directionsoverview != '' || site.directionsUrl != ''){
            let directions = {};
            if (site.directionsoverview != ''){
                directions.description = site.directionsoverview.replace(/\\n/g, ' ');
            }
            if (site.directionsUrl != ''){
                directions.url = site.directionsUrl;
            }
            obj.directions = directions;
        }
        if (site.reservationsdescription != '' || site.reservationsurl != ''){
            let reservations;
            if (site.reservationsdescription != ''){
                reservations.description = site.reservationsdescription.replace(/\\n/g, ' ');
            }
            if (site.reservationsurl != ''){
                reservations.url = site.reservationsurl;
            }
            obj.reservations = reservations;
        }
        if (site.regulationsoverview != '' || site.regulationsurl != ''){
            let regulations = {};
            if (site.regulationsoverview != ''){
                regulations.description = site.regulationsoverview.replace(/\\n/g, ' ');
            }
            if (site.regulationsurl != ''){
                regulations.url = site.regulationsurl;
            }
            obj.regulations = regulations;
        }
        if (site.accessibility.firestovepolicy != ''){
            obj.firePolicy = site.accessibility.firestovepolicy;
        }

        if (site.accessibility.rvallowed != ''){
            obj.rvAllowed = site.accessibility.rvallowed === '1';
        }
        if (site.accessibility.trailerallowed != ''){
            obj.trailerAllowed = site.accessibility.trailerallowed === '1';
        }
        if (site.images && site.images.length > 0){
            obj.images = site.images;
        }

        const provided = str => {
            let re = /no|none/i;
            return !(re.test(str));
        }
        if (site.accessibility.accessroads.length > 0){
            obj.roadAccess = provided(site.accessibility.accessroads[0]);
        }
        let accessibility = {};
        if (site.accessibility.wheelchairaccess != ''){
            accessibility.wheelchair = site.accessibility.wheelchairaccess;
        }
        if (site.accessibility.adainfo != ''){
            accessibility.ada = site.accessibility.adainfo;
        }
        let amenities = {};
        if (site.amenities.trashrecyclingcollection != ''){
            amenities.trash = provided(site.amenities.trashrecyclingcollection);
        }
        if (site.amenities.toilets.length > 0){
            amenities.toilets = provided(site.amenities.toilets[0]);
        }
        if (site.amenities.showers.length > 0){
            amenities.showers = provided(site.amenities.showers[0]);
        }
        if (site.amenities.cellphonereception != ''){
            amenities.cell = provided(site.amenities.cellphonereception);
        }
        if (site.amenities.potablewater.length > 0){
            amenities.water = provided(site.amenities.potablewater[0]);
        }
        if (site.amenities.stafforvolunteerhostonsite != ''){
            amenities.staff = provided(site.amenities.stafforvolunteerhostonsite);
        }
        obj.amenities = amenities;

        campgrounds.push(obj);
    }

    campgrounds.sort( (a, b) => {
        if (!a.distance) {return 1;}
        if (!b.distance) {return -1;}
        if (a.distance > b.distance) {return 1;}
        else if (a.distance < b.distance) {return -1;}
        else {return 0;}
    });

    fn(campgrounds);
}


function findCoords(name){
// Given a string, try to resolve that string into latitude and longitude coordinates

    return new Promise( (resolve, reject) => {
        let container = document.getElementById('findCoords');
        let service = new google.maps.places.PlacesService(container);
        service.findPlaceFromQuery( {query: name, fields: ['geometry.location']}, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results[0]){
                let result = results[0];
                let coords = {
                    lat: result.geometry.location.lat(),
                    lng: result.geometry.location.lng(),
                };
                resolve(coords);

            } else{
                reject();
            }
        });
    });
}


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
    }
}



// ====== Not working because of CORS :-( ======
// async function findFacilities(state){
//     const endpoint = 'https://ridb.recreation.gov/api/v1/facilities';
//     const key = '75dc39aa-4578-4ca8-9acd-8a21ff75b7d6';
//     const url = `${endpoint}?state=${state}&apikey=${key}&limit=50`;
//     console.log(url);
//     let response = await fetch(url, {
//         mode: 'no-cors',
//     });
//     let json = await response.json();
//     console.log(JSON.stringify(json));
// }


// ====== Not working because of CORS :-( ======
// async function findCampgrounds(state){
//     const endpoint = 'http://api.amp.active.com/camping/campgrounds';
//     const key = 'CCJEVHF9U4TR33SWS76BDV6X';
//     //http://api.amp.active.com/camping/campgrounds?pstate=CO&siteType=2001&expwith=1&amenity=4005&pets=3010&api_key=2chxq68efd4azrpygt5hh2qu
//     let url = `${endpoint}?pstate=${state}`;
//     console.log(url);
//     let response = await fetch(url, {
//         mode: 'no-cors',
//         headers: {
//             'accept': 'application/json',
//             'apikey': key,
//         }
//     });
//     console.log(response);
// }
