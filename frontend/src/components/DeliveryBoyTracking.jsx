// import React from 'react'
// import scooter from "../assets/scooter.png"
// import home from "../assets/home.png"
// import L from "leaflet"

// const deliveryBoyIcon = new L.Icon({
//     iconUrl : scooter,
//     iconSize : [40, 40],
//     iconAnchor : [20, 40]
// })
// const customerIcon = new L.Icon({
//     iconUrl : home,
//     iconSize : [40, 40],
//     iconAnchor : [20, 40]
// })

// function DeliveryBoyTracking({data}) {
//     const deliveryBoyLat = data.deliveryBoyLocation.lat
//     const deliveryBoyLon = data.deliveryBoyLocation.lon
//     const customerLat = data.customerLocation.lat
//     const customerLon = data.customerLocation.lon

//     const path = [
//         [deliveryBoyLat, deliveryBoyLon],
//         [customerLat, customerLon]
//     ]

//     const center = [deliveryBoyLat, deliveryBoyLon]

//   return (
//     <div>
      
//     </div>
//   )
// }

// export default DeliveryBoyTracking


import React from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function DeliveryBoyTracking({ data }) {
  const deliveryBoyLat = data.deliveryBoyLocation.lat;
  const deliveryBoyLon = data.deliveryBoyLocation.lon;
  const customerLat = data.customerLocation.lat;
  const customerLon = data.customerLocation.lon;

  const deliveryPosition = [deliveryBoyLat, deliveryBoyLon];
  const customerPosition = [customerLat, customerLon];

  const path = [deliveryPosition, customerPosition];

  // 📏 Calculate Distance (Haversine formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const distance = getDistance(
    deliveryBoyLat,
    deliveryBoyLon,
    customerLat,
    customerLon
  );

  return (
    <div className="mt-6">
      <MapContainer
        center={deliveryPosition}
        zoom={15}
        className="h-80 rounded-xl shadow-lg"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🚴 Delivery Boy Marker */}
        <Marker position={deliveryPosition} icon={deliveryBoyIcon}>
          <Popup>Delivery Boy Location</Popup>
        </Marker>

        {/* 🏠 Customer Marker */}
        <Marker position={customerPosition} icon={customerIcon}>
          <Popup>Customer Location</Popup>
        </Marker>

        {/* 📍 Path Line */}
        <Polyline positions={path} color="orange" />
      </MapContainer>

      {/* 📏 Distance Info */}
      <div className="mt-4 bg-white p-4 rounded-xl shadow text-center font-medium">
        Distance to Customer: <span className="text-orange-600">{distance} km</span>
      </div>
    </div>
  );
}

export default DeliveryBoyTracking;
