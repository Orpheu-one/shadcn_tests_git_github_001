
// components/GoogleMaps/GoogleMaps.jsx
'use client';

import { useMemo, useRef, useEffect } from 'react';
import {
  GoogleMap,
  Marker,
  Circle,
  StandaloneSearchBox,
  useLoadScript,
} from '@react-google-maps/api';



const libraries = ['places'];

export default function GoogleMaps({
  radius = 1000,
  latitude,
  longitude,
  address = '',
  setLatitude,
  setLongitude,
  setAddress,
  style = '',
}) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '',
    libraries,
  });

  const center = useMemo(() => ({ lat: latitude, lng: longitude }), [latitude, longitude]);
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) mapRef.current.panTo({ lat: latitude, lng: longitude });
  }, [latitude, longitude]);

  const onPlaceChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (!places?.length) return;
    const place = places[0];
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();
    if (lat != null && lng != null) {
      setLatitude(lat);
      setLongitude(lng);
      setAddress(place.formatted_address || '');
    }
  };

  const onMarkerDrag = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setLatitude(lat);
    setLongitude(lng);
  };

  if (!isLoaded) return <div className="w-full h-96 grid place-content-center ">Loading map…</div>;

  return (
    <div className="relative w-full flex h-96 ">
      <GoogleMap
        zoom={10}
        center={center}
        mapContainerClassName="w-full h-full rounded-lg"
        gestureHandling={"cooperative"}
        disableDefaultUI={true}
        onLoad={(m) => (mapRef.current = m)}
      >
        

        <Marker
          position={center}
          draggable
          onDragEnd={onMarkerDrag}
        />
        <Circle
          center={center}
          radius={radius}
          options={{
            strokeColor: '#ec8500',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#cb965a',
            fillOpacity: 0.3,
          }}
        />
      </GoogleMap>
      <div className="flex items-centerjustify-between">
        
        <StandaloneSearchBox
          onLoad={(ref) => (searchBoxRef.current = ref)}
          onPlacesChanged={onPlaceChanged}
        >
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search location…"
            className={`absolute top-2 left-2 z-10 w-64 p-2 rounded shadow `}
          />
        </StandaloneSearchBox>

        <button
          onClick={() => mapRef.current?.panTo({ lat: latitude, lng: longitude })}
          className="absolute top-22 right-2 z-10 text-[10px] bg-yellow-400 hover:bg-yellow-500 px-2 py-2 rounded-md text-xs"
        >
          center
        </button>
        
        </div>
    </div>
    
  );
}

