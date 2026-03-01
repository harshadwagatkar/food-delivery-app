// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { setAddress, setCity, setState } from "../redux/userSlice";

// import axios from "axios";
// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { setLocation, setFinalAddress } from "../redux/mapSlice";
// import { setAddress, setCity, setState } from "../redux/userSlice";

// function useGetCity() {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (!navigator.geolocation) return;

//     navigator.geolocation.getCurrentPosition(
//       async ({ coords }) => {
//         try {
//           const { latitude, longitude } = coords;

//           const res = await fetch(
//             `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${import.meta.env.VITE_OPEN_CAGE_API_KEY}`
//           );

//           const data = await res.json();

//           if (!data.results?.length) return;

//           const result = data.results[0];
//           const components = result.components;

//           const city =
//             components.city ||
//             components.town ||
//             components.village ||
//             "Unknown";

//           const state = components.state || "Unknown";

//           const address = result.formatted;

//           dispatch(setCity(city));
//           dispatch(setState(state));
//           dispatch(setAddress(address));

//           // console.log("Location:", { city, state, address });
//         } catch (err) {
//           console.error("Geocoding error:", err);
//         }
//       },
//       (err) => console.error("Location denied", err)
//     );
//   }, []);
// }

// export default useGetCity;





import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setAddress,
  setCity,
  setState,
  setLocationLoading,
  setLocationSuccess,
  setLocationError,
} from "../redux/userSlice";

import { setLocation, setFinalAddress } from "../redux/mapSlice";


function useGetCity() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!navigator.geolocation) {
      dispatch(setLocationError());
      return;
    }

    dispatch(setLocationLoading());

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          // if (accuracy > 50000) {
          //   dispatch(setLocationError());
          //   return;
          // }

          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${
              import.meta.env.VITE_OPEN_CAGE_API_KEY
            }&language=en&countrycode=in`
          );

          const data = await response.json();

          if (!data.results || data.results.length === 0) {
            dispatch(setLocationError());
            return;
          }

          const result = data.results[0];
          const components = result.components;

          const city =
            components.city ||
            components.town ||
            components.municipality ||
            components.county ||
            components.state_district ||
            components.suburb ||
            components.village ||
            "Unknown";

          dispatch(setCity(city));
          dispatch(setState(components.state || "Unknown"));
          dispatch(setAddress(result.formatted));

          // setting map location and address
          dispatch(setLocation({lat:latitude, lng:longitude}))
          dispatch(setFinalAddress(result.formatted))

          dispatch(setLocationSuccess());

          // console.log("Detected city:", city);
          // console.log("Accuracy:", accuracy);
        } catch (error) {
          console.error("Location error:", error);
          dispatch(setLocationError());
        }
      },
      (error) => {
        console.error("Geolocation permission error:", error);
        dispatch(setLocationError());
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [isAuthenticated, dispatch]);
}

export default useGetCity;





// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setAddress,
//   setCity,
//   setState,
//   setLocationLoading,
//   setLocationSuccess,
//   setLocationError,
// } from "../redux/userSlice";

// import { setLocation, setFinalAddress } from "../redux/mapSlice";

// function useGetCity() {
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.user);

//   useEffect(() => {
//     if (!isAuthenticated) return;

//     if (!navigator.geolocation) {
//       dispatch(setLocationError());
//       return;
//     }

//     dispatch(setLocationLoading());

//     navigator.geolocation.getCurrentPosition(
//       async ({ coords }) => {
//         try {
//           const { latitude, longitude } = coords;

//           const response = await fetch(
//             `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${
//               import.meta.env.VITE_OPEN_CAGE_API_KEY
//             }&language=en&countrycode=in`
//           );

//           const data = await response.json();

//           if (!data.results?.length) {
//             dispatch(setLocationError());
//             return;
//           }

//           const result = data.results[0];
//           const components = result.components;

//           const city =
//             components.city ||
//             components.town ||
//             components.village ||
//             components.suburb ||
//             components.county ||
//             components.state_district ||
//             "Unknown";

//           dispatch(setCity(city));
//           dispatch(setState(components.state || "Unknown"));
//           dispatch(setAddress(result.formatted));

//           //setting map location and address
//           dispatch(setLocation({lat:latitude, lng:longitude}))
//           dispatch(setFinalAddress(result.formatted))

//           dispatch(setLocationSuccess());
//         } catch (err) {
//           console.error("Reverse geocode failed:", err);
//           dispatch(setLocationError());
//         }
//       },
//       (err) => {
//         console.error("Geolocation error:", err);
//         dispatch(setLocationError());
//       },
//       {
//         enableHighAccuracy: false, // IMPORTANT
//         timeout: 15000,
//         maximumAge: 60000,
//       }
//     );
//   }, [isAuthenticated, dispatch]);
// }

// export default useGetCity;




// function useGetCity() {
//   const dispatch = useDispatch()
//   const {userData} = useSelector(state => state.user)
//   const apiKey = "44cbc725071d489f96840c2573544c99"

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(async (position) => {
//       const latitude = position.coords.latitude
//       const longitude = position.coords.longitude
//       dispatch(setLocation({lat:latitude, lng:longitude}))
//       const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`)

//       dispatch(setCity(result?.data?.results[0].city))
//       dispatch(setState(result?.data?.results[0].state))
//       dispatch(setAddress(result?.data?.results[0].address_line2))

//       dispatch(setFinalAddress(result?.data?.results[0].address_line2))

//     })
//   }, [userData])
// }

// export default useGetCity