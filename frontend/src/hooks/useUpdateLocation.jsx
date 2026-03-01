import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { serverURL } from '../App';

function useUpdateLocation() {
  const dispatch = useDispatch();
  const {userData} = useSelector(state => state.user)

  useEffect(() => {
    const updateLocation = async (lat, lng) => {
        const response = await axios.post(`${serverURL}/api/user/update-location`, {lat, lng}, {withCredentials : true})
        // console.log(response.data)
    }
    navigator.geolocation.watchPosition((pos) => {
      updateLocation(pos.coords.latitude, pos.coords.longitude)
    })
  }, [userData])
}

export default useUpdateLocation
