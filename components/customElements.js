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

    // Attributes cannot be objects, so 'campground' is a property rather than an attribute
    // get campground(){ return this.getAttribute('campground'); }
    // set campground(value){ this.setAttribute('campground', value); }

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
