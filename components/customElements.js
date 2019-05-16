const defaultPreviewImage = `https://d1yn1kh78jj1rr.cloudfront.net/image/preview/Bwb4bH4iOliyzsy5m7/graphicstock-freehand-drawn-black-and-white-cartoon-tent_HIpTZuyjmZ_SB_PM.jpg`;
let previewTemplate = document.createElement('template');
previewTemplate.innerHTML = `
    <style>
        div {
            margin: 2%;
            padding: 3%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 5%;
            border: inset;
            border-width: 2px;
            border-color: gainsboro;
        }
        h1 {
            font-size: 20px;
        }
        .photo {
            width: 150px;
        }
        h2 {
            font-size: 16px;
        }
    </style>
    <div>
        <h1></h1>
        <img class="photo" src="${defaultPreviewImage}" />
        <h2>?? mi</h2>
    </div>
`;

class CampsitePreview extends HTMLElement{
    constructor(){
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.appendChild( previewTemplate.content.cloneNode(true) );

        this.nameElement = this.shadow.querySelector('h1');
        this.photoElement = this.shadow.querySelector('.photo');
        this.distanceElement = this.shadow.querySelector('h2');
    }

    connectedCallback(){
        if (this.campground != null){
            if (this.campground.name != null){
                this.nameElement.innerHTML = this.campground.name;
            }
            if (this.campground.images != null && this.campground.images.length > 0){
                this.photoElement.src = this.campground.images[0];
            }
            if (this.campground.distance != null){
                this.distanceElement.innerHTML = `${this.campground.distance} mi`;
            }
        }
    }
}
customElements.define('campsite-preview', CampsitePreview);


// ====================================================================================

const forecastTemplate = document.createElement('template');
forecastTemplate.innerHTML = `
    <style>
        .container {
            width: 150px;
            margin: 2%;
            padding: 3%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 5%;
            border: inset;
            border-width: 2px;
            border-color: gainsboro;
        }
        .details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 6em;
        }
        
        h1 {font-size: 20px;}
        h2 {font-size: 16px;}
        i {font-size: 30px;}
        img {height: 30px; width: 30px;}
    </style>
    <div class="container">
       <h1 class="date">Date</h1>
       <h2 class="condition">Condition</h2>
    <img class="icon" src="" alt=""></img>
       <div class="details">
           <h2>High</h2>
           <h2 class="hi">??°F</h2>
       </div>
      <div class="details">
           <h2>Low</h2>
           <h2 class="lo">??°F</h2>
       </div>
    </div>
`;
class ForecastDay extends HTMLElement{
    constructor(){
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.appendChild( forecastTemplate.content.cloneNode(true) );

        this.dateElement = this.shadow.querySelector('.date');
        this.conditionElement = this.shadow.querySelector('.condition');
        this.hiElement = this.shadow.querySelector('.hi');
        this.loElement = this.shadow.querySelector('.lo');
        this.iconElement = this.shadow.querySelector('.icon');
    }

    connectedCallback(){
        if (this.forecast != null){
            this.dateElement.innerHTML = this.forecast.date;
            this.conditionElement.innerHTML = this.forecast.condition;
            this.iconElement.setAttribute("src","https:" + this.forecast.icon);
            this.iconElement.setAttribute("alt",this.forecast.condition);
            this.hiElement.innerHTML = `${this.forecast.max}°F`;
            this.loElement.innerHTML = `${this.forecast.min}°F`;
        }
    }
}
customElements.define('forecast-day', ForecastDay);




const slideshowTemplate = document.createElement('template');
slideshowTemplate.innerHTML = `
    <style>
        div {
            display: flex;
            flex-direction: row;
        }
        img {
            width: 500px;
        }
        button {
            border-color: black;
            border-width: 1px;
        }
    </style>
    <div>
        <button id="prev" type="button"><-</button>
        <img />
        <button id="next" type="button">-></button>
    </div>
`;
class SlideShow extends HTMLElement{
    constructor(){
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.appendChild( slideshowTemplate.content.cloneNode(true) );

        this.imgElement = this.shadow.querySelector('img');
        this.prevElement = this.shadow.querySelector('#prev');
        this.nextElement = this.shadow.querySelector('#next');

        this.currPhoto = 0;
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
    }

    prev(){
        if (this.photos && this.photos.length > 0){
            this.currPhoto = (this.currPhoto - 1) % (this.photos.length);
            let photo = this.photos[Math.abs(this.currPhoto)];
            this.imgElement.src = photo;
        }
    }

    next(){
        if (this.photos && this.photos.length > 0){
            this.currPhoto = (this.currPhoto + 1) % (this.photos.length);
            let photo = this.photos[this.currPhoto];
            this.imgElement.src = photo;
        }
    }

    connectedCallback(){
        if (this.photos && this.photos.length > 0){
            this.imgElement.src = this.photos[this.currPhoto];
            this.prevElement.addEventListener('click', this.prev);
            this.nextElement.addEventListener('click', this.next);
        }
    }
}
customElements.define('slide-show', SlideShow);
