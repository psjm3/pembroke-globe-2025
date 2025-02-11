import './globe.css'
import Globe from "./globegl.js";

const myGlobe = Globe();

myGlobe(document.getElementById('app'))
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');

myGlobe.controls().autoRotate = true;
myGlobe.controls().autoRotateSpeed = 1.0;

function showProfiles() {
    stopDistribution();
    myGlobe.controls().autoRotate = true;
    fetch('./data/pembroke_alumni.arr')
    .then(response => 
        response.json().then(json => {
            console.log(json);
            myGlobe
                .htmlElementsData(json)
                .htmlElement(d => {
                    const el = document.createElement('div');
                    el.setAttribute('id', "thumbnail-div");
                    let img = document.createElement('img');
                    img.setAttribute('class', "thumbnail-img");
                    img.setAttribute('id', "thumbnail-img");
                    img.setAttribute('src', d.imageUrl);
                    img.setAttribute('width', 30);
                    img.setAttribute('height', 30);
                    el.appendChild(img);
                    el.style['pointer-events'] = 'auto';
                    el.style.cursor = 'pointer';
                    el.onclick= (e) => setToFocus(e, d.imageUrl, d.NAME, d.facts, d.lat, d.lng, d.altitude);
                    return el;
                })
        })
    );
    fetch('../data/pembroke_alumni.geojson')
        .then(res => res.json())
        .then(countries => {
            myGlobe
                .labelsData(countries.features)
                .labelLat(d => d.properties.latitude)
                .labelLng(d => d.properties.longitude)
                .labelText(d => d.properties.shortname)
                .labelColor(() => 'rgb(255, 255, 0)')
                .labelSize(1)
                .labelResolution(10)
                .labelDotRadius(0);
            setTimeout(() => myGlobe
                .labelsTransitionDuration(4000)
                .labelAltitude(
                    d =>
                        Math.max(0.05, Math.sqrt(+d.properties.labelrank)*0.05))
                // .htmlTransitionDuration(4000)
                // .htmlAltitude(d => Math.max(0.05, Math.sqrt(+d.altitude)*0.05))
            , 2000);
        });
}

function setToFocus(e, imageURL, name, facts, lat, lng, altitude) {
    stopProfiles();
    myGlobe
        .pointOfView({ lat: lat, lng: lng, altitude: altitude }, 0)
        .htmlElementsData([{
            "name":name,
            "imageURL":imageURL,
            "facts":facts,
            "lat":lat,
            "lng":lng,
            "altitude":altitude
        }])
        .htmlElement(thisData => {
            let popup = document.createElement('div');
            popup.setAttribute('class', 'card');
            let img = document.createElement('img');
            img.setAttribute('src', thisData.imageURL);
            img.setAttribute('alt', thisData.name);
            img.setAttribute('width', "20%");
            img.setAttribute('height', "20%");
            let container = document.createElement('div');
            container.setAttribute('class', 'container');
            container.innerHTML = `
                <h2>${thisData.name}</h2>
                <p class="profileText">${thisData.facts}</p>`;
            popup.appendChild(img);
            popup.appendChild(container);
            return popup;
        });
    toggleRotation();
}

function stopProfiles() {
    myGlobe.labelsData([]);
}

function showDistribution() {
    stopProfiles();

    fetch('./data/pembroke_alumni.arr')
    .then(response => 
        response.json().then(json => {
            myGlobe.htmlElementsData(json)})
    );
    myGlobe.htmlElement(d => {
            const el = document.createElement('div');
            el.innerHTML = `<svg viewBox="-4, 0, 36 36"><path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path><circle fill="black" cx="14" cy="14" r="7"></circle></svg>`;
            el.style.color = d.color;
            el.style.width = `${d.size}px`;
            el.style['pointer-events'] = 'auto';
            el.style.cursor = 'pointer';
            return el;
        });
}

function stopDistribution() {
    myGlobe.htmlElementsData([]);
}

function toggleRotation() {
    myGlobe.controls().autoRotate = !myGlobe.controls().autoRotate;
}

const viewProfiles = document.getElementById("viewProfiles");
viewProfiles.addEventListener('click', showProfiles);

const viewDist = document.getElementById("viewDist");
viewDist.addEventListener('click', showDistribution);

function toggleView() {
    console.log(viewButton.value);

    if (viewButton.value === 'View - Highlights') {
        stopDistribution();
        showHighlights();
        viewButton.value = 'View - Distribution';
        // const imgElement = document.getElementById("thumbnail");
        // //imgElement.addEventListener('click', (event) => setToFocus(event));
        // imgElement.addEventListener('click', () => {
        //     console.log("img clicked: ", img.target);
        // });
        // imgElement.lat = d.latitude;
        // imgElement.lng = d.longitude;
        // imgElement.altitude = d.altitude;
    } else {
        stopProfiles();
        showDistribution();
        viewButton.value = 'View - Highlights';
    }
}