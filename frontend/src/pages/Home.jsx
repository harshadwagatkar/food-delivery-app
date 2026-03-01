import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoyDashboard from '../components/DeliveryBoyDashboard'
import Navbar from '../components/Navbar'

function Home() {
  const {userData} = useSelector(state => state.user)
  // console.log(userData)
  return (
    <div>
      {userData.role == "user" && <UserDashboard />}
      {userData.role == "owner" && <OwnerDashboard />}
      {userData.role == "deliveryBoy" && <DeliveryBoyDashboard />}
    </div>
  )
}

export default Home
 