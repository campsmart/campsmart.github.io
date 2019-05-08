class CampsitePreview extends HTMLElement{
    constructor(){
        super();
        this.shadow = this.attachShadow({mode: 'open'});

        const defaultImage = `https://d1yn1kh78jj1rr.cloudfront.net/image/preview/Bwb4bH4iOliyzsy5m7/graphicstock-freehand-drawn-black-and-white-cartoon-tent_HIpTZuyjmZ_SB_PM.jpg`;
        let template = document.createElement('template');
        template.innerHTML = `
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
                <img class="photo" src="${defaultImage}" />
                <h2>?? mi</h2>
            </div>
        `;
        this.shadow.appendChild( template.content.cloneNode(true) );

        this.nameElement = this.shadow.querySelector('h1');
        this.photoElement = this.shadow.querySelector('.photo');
        this.distanceElement = this.shadow.querySelector('h2');
    }

    get name(){ return this.getAttribute('name'); }
    set name(value){ this.setAttribute('name', value); }

    get photo(){ return this.getAttribute('photo'); }
    set photo(value){ this.setAttribute('photo', value); }

    get distance(){ return this.getAttribute('distance'); }
    set distance(value){ this.setAttribute('distance', value); }

    connectedCallback(){
        if (this.name != null){
            this.nameElement.innerHTML = this.name;
        }
        if (this.photo != null){
            this.photoElement.src = this.photo;
        }
        if (this.distance != null){
            this.distanceElement.innerHTML = `${this.distance} mi`;
        }
    }
}
customElements.define('campsite-preview', CampsitePreview);