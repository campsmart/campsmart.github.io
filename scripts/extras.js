function findPhotos(query, callback){
// Given a search string, searches Flickr for photos. Returns a list of photo URLs in the callback

    query = query.replace(/\s/g, '+');
    const key = '491aad502b734f114006a1a58061c72a';
    const endpoint = 'https://api.flickr.com/services/rest/';
    const params = `method=flickr.photos.search&api_key=${key}&text=${query}&format=json&nojsoncallback=1`;
    let url = `${endpoint}?${params}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        let photos = data.photos.photo;
        let urls = [];
        for (let photo of photos){
            let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`
            urls.push(url);
            // let image = document.createElement('img')
            // image.src = url
            // document.querySelector('body').appendChild(image)
        }
        callback(urls);
    });
}

function getForecast(lat, lng, callback){
// Given a latitude and longitude, finds the weather forecast in that area (Fahrenheit)
// Returns a list of forecast objects:
//      { date: <string>, min: <float>, max: <float>, condition: <string> }
// Example: 
//      { date: "05/23", min: 32.44, max: 65.2, condition: "Partly sunny" }

    const endpoint = 'https://api.apixu.com/v1/forecast.json';
    const key = '23eb70d96270409aa1a233300191004';
    const params = `key=${key}&q=${lat},${lng}&days=10`;
    const url = `${endpoint}?${params}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        let days = [];
        const forecast = data.forecast.forecastday;
        for (let day of forecast){
            let regex = /\d{4}-(\d{2})-(\d{2})/;
            let monthDay = regex.exec(day.date);
            let date = `${monthDay[1]}/${monthDay[2]}`;
            let min = parseFloat(day.day.mintemp_f);
            let max = parseFloat(day.day.maxtemp_f);
            let condition = day.day.condition.text;
            let icon = day.day.condition.icon;
            // For a list of all possible conditions:
            // http://www.apixu.com/doc/Apixu_weather_conditions.json
            days.push({
                date, min, max, condition, icon
            });
        }
        callback(days);
    });
}

function getParkAlerts(parkCode, callback){
// Returns a list of alerts for the given parkCode (each campground has a parkCode)
// Returns a list of objects:
//      { title: <string>, description: <string>, url: <string> }
// Note: Any of these fields may be undefined!
    const endpoint = 'https://developer.nps.gov/api/v1/alerts';
    const key = 'SRKyrg45JuZyDSc2kS0nNjV8dJ5w5BWpWpuMUHLe';
    const params = `api_key=${key}&parkCode=${parkCode}`;
    const url = `${endpoint}?${params}`;
    fetch(url).
    then(response => response.json())
    .then(data => {
        let list = data.data;
        let alerts = [];
        for (let item of list){
            let alert = {};
            if (item.title != ''){
                alert.title = item.title;
            }
            if (item.description != ''){
                alert.description = item.description;
            }
            if (item.url != ''){
                alert.url = item.url;
            }
            alerts.push(alert);
        }
        callback(alerts);
    });
}