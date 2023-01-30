import React from "react";
import { Map, Marker, GoogleApiWrapper } from "google-maps-react";
import { useState, useEffect } from "react";

function RentalsMap({ locations, google, setHighLight }) {
    const [center, setCenter] = useState();
    useEffect(() => {
        var arr = Object.keys(locations);
        var getLat = (key) => locations[key]["lat"];
        var avgLat = arr.reduce((a, c) => a + Number(getLat(c)), 0) / arr.length;

        var getLng = (key) => locations[key]["lng"];
        var avgLng = arr.reduce((a, c) => a + Number(getLng(c)), 0) / arr.length;

        setCenter({ lat: avgLat, lng: avgLng });
    }, [locations]);

    return (
        <>
            {center && (
                <Map
                    google={google}
                    containerStyle={{
                        width: "45vw",
                        height: "55vh",
                        marginLeft:"3%",
                        marginRight:"3%",
                        border: '2px solid red'
                    }}
                    center={center}
                    initialCenter={locations[0]}
                    zoom={13}
                    disableDefaultUI={true}
                >
                    {locations.map((coords, i) => (
                        <Marker position={coords} onClick={() => setHighLight(i)} />
                    ))}
                </Map>
            )}
        </>
    );
}

export default GoogleApiWrapper({
    apiKey: "AIzaSyC1fzGlggsK3ZT56hp-NX5bj-BqZ3iOEJU",
})(RentalsMap);
