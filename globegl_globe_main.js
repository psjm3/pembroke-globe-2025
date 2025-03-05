import './globe.css'
import Globe from "./globegl.js";

const myGlobe = Globe();

myGlobe(document.getElementById('app'))
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');

myGlobe.controls().autoRotate = true;
myGlobe.controls().autoRotateSpeed = 0.8;
myGlobe.controls().saveState();

const original = {};
original.position = myGlobe.camera().position.clone();
original.rotation = myGlobe.camera().rotation.clone();

const camToSave = {};
camToSave.position = myGlobe.camera().position.clone();
camToSave.rotation = myGlobe.camera().rotation.clone();

let counter = 0;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let alumni_arr = null;
fetch('./real-data/pembroke_selected_alumni.arr')
    .then(response => response.json()
        .then(json => {
            alumni_arr = json;
            for (let i=0; i<alumni_arr.length; i++) {
                alumni_arr[i].idx = i;
            }
            setTimeout(showProfiles, 1000);
        }));

async function showProfiles() {
    clearHtmlData();
    myGlobe.controls().autoRotate = true;
    console.log("In showProfiles - camToSave: x: ", camToSave.position.x, " y: ", camToSave.position.y, " z: ", camToSave.position.z);

    myGlobe.camera().position.set(camToSave.position.x, camToSave.position.y, camToSave.position.z);
    myGlobe.camera().rotation.set(original.rotation);
    myGlobe
        .htmlElementsData(alumni_arr)
        .htmlElement(d => {
            const el = document.createElement('div');
            el.setAttribute('id', "thumbnail-div");
            let img = document.createElement('img');
            img.setAttribute('class', "thumbnail-img");
            img.setAttribute('id', "thumbnail-img");
            img.setAttribute('src', d.imageUrl);
            img.setAttribute('width', 30);
            img.setAttribute('height', 30);
            img.setAttribute('style', "border:1px solid lightblue");

            el.appendChild(img);
            el.style['pointer-events'] = 'auto';
            el.style.cursor = 'pointer';
            el.onclick= () => setToFocus();
            return el;
    });

    if (counter < alumni_arr.length) {   
        console.log("About to sleep 3000, counter is ", counter, " alumni_arr.length is: ", alumni_arr.length);

        sleep(1000).then(() => {
            console.log("Fired showProfiles");
            setToFocus();
        });
    } else {
        console.log("Fired showDistribution");
        showDistribution();
    }
}

async function setToFocus() {
    toggleRotation();
    clearHtmlData();
    let json = [alumni_arr[counter]];

    myGlobe.pointOfView({ lat: json[0].lat, lng: json[0].lng}, 0);

    myGlobe
        .htmlElementsData(json) 
        .htmlElement(thisData => {
            console.log("Reading ", thisData.name);
            let popup = document.createElement('div');  
            popup.setAttribute('class', 'card');
            let img = document.createElement('img');
            img.setAttribute('src', thisData.imageUrl);
            img.setAttribute('alt', thisData.name);
            img.setAttribute('width', "300px");
            img.setAttribute('height', "400px");
            img.setAttribute('style', "border:10px groove lightblue");
            let container = document.createElement('div');
            container.setAttribute('class', 'container');
            container.innerHTML = `
                <h2>${thisData.name} (${thisData.matriculation_year})</h2>
                <p class="profileText">
                Country: ${thisData.country}
                <br>Profession: ${thisData.job}
                <br>Organisation: ${thisData.organisation}
                </p>
                `;
            popup.appendChild(img);
            popup.appendChild(container);
            return popup;
        });
        counter = counter + 1;
        console.log("About to sleep 5000, counter is ", counter);
        sleep(1000).then(() => {
            console.log("Fired setToFocus");
            showProfiles();
        });

    let coords = myGlobe.getCoords(json[0].lat, json[0].lng);
    console.log("Got coords: ", coords);
    camToSave.position = myGlobe.camera().position.clone();
    // camToSave.position.x = coords.x;
    // camToSave.position.y = coords.y;
    // camToSave.position.z = coords.z;
    console.log("In setToFocus, after saving - camToSave: x: ", camToSave.position.x, " y: ", camToSave.position.y, " z: ", camToSave.position.z);
}

function clearHtmlData() {
    myGlobe.htmlElementsData([]);
}

function showDistribution() {
    clearHtmlData();
    counter = 0;
    myGlobe.controls().reset();
    // myGlobe.controls().autoRotate = true;
    // myGlobe.controls().autoRotateSpeed = 0.8;


    fetch('./real-data/All_pembroke_women.arr')
    .then(dist_data => 
        dist_data.json().then(dist_json => {
            myGlobe.htmlElementsData(dist_json)})
    );
    myGlobe
        .htmlElement(d => {
            const el = document.createElement('div');
            el.innerHTML = `<svg viewBox="-4, 0, 36 36"><path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path><circle fill="black" cx="14" cy="14" r="7"></circle></svg>`;
            el.style.color = d.color;
            el.style.width = `${d.size}px`;
            el.style['pointer-events'] = 'auto';
            el.style.cursor = 'pointer';
            return el;
        });
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
    } else {
        stopProfiles();
        showDistribution();
        viewButton.value = 'View - Highlights';
    }
}