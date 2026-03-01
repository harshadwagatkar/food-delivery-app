import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { serverURL } from '../App'
import { setAllItemsInCity } from '../redux/userSlice'

function useGetItemsInCity() {
    const {city, locationStatus} = useSelector(state => state.user)
    const dispatch = useDispatch()

    // const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (locationStatus !== "success") return;
        if(!city) return;

        const fetchItems = async () => {
            try {
                const response = await axios.get(`${serverURL}/api/item/get-city-items/${city.toLowerCase()}`, {withCredentials : true})
                // setItems(response.data)
                dispatch(setAllItemsInCity(response.data))
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        fetchItems();

    }, [city, locationStatus])

}

export default useGetItemsInCity
