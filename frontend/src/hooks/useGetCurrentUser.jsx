import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { serverURL } from '../App'
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice'

function useGetCurrentUser() {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const user = await axios.get(`${serverURL}/api/user/current`, {withCredentials:true})
            dispatch(setUserData(user.data))
            // console.log(user)
        } catch (error) {
            console.log(error)
        }
    }

    fetchUser()
  }, [])
}

export default useGetCurrentUser
