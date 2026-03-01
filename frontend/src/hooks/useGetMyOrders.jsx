import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { serverURL } from '../App';
import { setMyOrders } from '../redux/userSlice';
 
function useGetMyOrders() {
  const dispatch = useDispatch();
  const {userData} = useSelector(state => state.user)
  
  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${serverURL}/api/order/my-orders`, {withCredentials : true});

            dispatch(setMyOrders(response.data));
            // console.log("Order data: " ,response.data);

        } catch (error) {
            console.log(error)
        }
    }

    fetchOrders();

  }, [userData])
}

export default useGetMyOrders
