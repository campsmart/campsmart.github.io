window.onload = () => {

    let icon = document.getElementById('find-me-icon');
    icon.addEventListener('click', () => {
        findMe();
    });

    // let form = document.querySelector('form');
    // form.addEventListener('submit', () => {
    //     return submitForm(form);
    // });

};

// ================================================================================================

function findMe(){
    let errorDiv = document.getElementById('error');

    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition( (position) => {
            alert(JSON.stringify(position));
            let location = `${position.coords.latitude},${position.coords.longitude}`;
            let input = document.getElementById('location');
            input.value = location;

        }, (error) => {
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = 'Failed to find your location';
        }, {timeout:3000});

    } else{
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = 'Geolocation is not supported by this browser';
    }
}

function submitForm(form){
    let errorDiv = document.getElementById('error');
    let re = /(-?\d+\.\d+),(-?\d+\.\d+)/;
    let input = document.getElementById('location');
    let inputString = input.value;

    // Input left blank
    if (inputString === ''){
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = 'Please enter a location';
        return false;

    // Input already has coordinates
    } else if ( re.test(inputString) ){
        form.submit();

    // Input has query string
    } else {
        let container = document.getElementById('map');
        let service = new google.maps.places.PlacesService(container);
        service.findPlaceFromQuery({ query: inputString, fields: ['name', 'geometry.location'] },
        (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK){
                let result = results[0];
                let lat = result.geometry.location.lat();
                let lng = result.geometry.location.lng();
                let location = `${lat},${lng}`;
                input.value = location;
                form.submit();

            } else{
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = `"${inputString}" is not a location we recognize. Enter a different location.`;
                return false
            }
        });
        return false;
    }
}
