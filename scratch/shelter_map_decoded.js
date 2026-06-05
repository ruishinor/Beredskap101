let map;
    let userMarker;
    const shelters = []; // En liste for å lagre alle tilfluktsrom

    async function initMap() {
        // Definerer koordinatsystemene
        const fromProjection = '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
        const toProjection = '+proj=longlat +datum=WGS84 +no_defs';

        // Kart-innstillinger
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 5,
            center: { lat: 62.0, lng: 10.0 }
        });

        // NYTT: Lag kun én enkelt infowindow som gjenbrukes
        const infowindow = new google.maps.InfoWindow();

        try {
            // Henter data fra JSON-filen din
            const geoJsonUrl = '/wp-content/uploads/2025/09/Samfunnssikkerhet_0000_Norge_25833_TilfluktsromOffentlige_GeoJSON.json';
            const response = await fetch(geoJsonUrl);
            const data = await response.json();

            // Går gjennom hvert tilfluktsrom
            data.features.forEach(feature => {
                const properties = feature.properties;
                const coordinates = feature.geometry.coordinates;
                const [lng, lat] = proj4(fromProjection, toProjection, coordinates);
                
                if (isNaN(lat) || isNaN(lng)) return;

                const contentString = `
                    <div class="info-window-content">
                        <h3>${properties.adresse || 'Ukjent adresse'}</h3>
                        <p><strong>Antall plasser:</strong> ${properties.plasser || 'Ikke oppgitt'}</p>
                        <p><strong>Romnummer:</strong> ${properties.romnr || 'Ikke oppgitt'}</p>
                    </div>`;

                const marker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    title: properties.adresse
                });

                // NYTT: Oppdater innholdet og åpne den ene infowindowen ved klikk
                marker.addListener('click', () => {
                    infowindow.setContent(contentString);
                    infowindow.open(map, marker);
                });

                // Lagre all info vi trenger for senere
                shelters.push({
                    marker: marker,
                    contentString: contentString, // Lagrer innholdet i stedet for selve boksen
                    lat: lat,
                    lng: lng,
                    properties: properties
                });
            });
        } catch (error) {
            console.error('Feil ved lasting av kartdata:', error);
            document.getElementById('map').innerText = 'Kunne ikke laste kartdata.';
        }
    
        // Funksjon for å beregne avstand (Haversine-formelen)
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Jordens radius i km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Avstand i km
        }

        // Lytter etter klikk på knappen
        document.getElementById('findNearestBtn').addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("Geolokasjon støttes ikke av nettleseren din.");
                return;
            }

            navigator.geolocation.getCurrentPosition(position => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                if (userMarker) {
                    userMarker.setMap(null);
                }

                userMarker = new google.maps.Marker({
                    position: { lat: userLat, lng: userLng },
                    map: map,
                    title: "Din posisjon",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 7,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white"
                    }
                });

                let closestShelter = null;
                let minDistance = Infinity;

                shelters.forEach(shelter => {
                    const distance = calculateDistance(userLat, userLng, shelter.lat, shelter.lng);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestShelter = shelter;
                    }
                });

                if (closestShelter) {
                    map.setCenter(closestShelter.marker.getPosition());
                    map.setZoom(15);
                    
                    // NYTT: Oppdater og åpne den gjenbrukbare infowindowen
                    infowindow.setContent(closestShelter.contentString);
                    infowindow.open(map, closestShelter.marker);
                } else {
                    alert("Fant ingen tilfluktsrom i dataen.");
                }

            }, () => {
                alert("Kunne ikke hente posisjonen din. Du må gi tillatelse for at denne funksjonen skal virke.");
            });
        });
    }