import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import { Toaster } from "react-hot-toast";
import useGetCurrentUser from './hooks/useGetCurrentUser'
import Home from './pages/home'
import { useDispatch, useSelector } from 'react-redux'
import useGetCity from './hooks/useGetCity'
import useGetShop from './hooks/useGetShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItems from './pages/AddItems'
import EditItem from './pages/EditItem'
import useGetItemsInCity from './hooks/useGetItemsInCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import ShopItemsPage from './components/ShopItemsPage'
import { io } from 'socket.io-client'
import { setSocket } from './redux/userSlice'
import DeliveredOrders from './components/DeliveredOrders'



export const serverURL = "https://soez-backend.onrender.com"

function App() {
  const {userData} = useSelector(state => state.user)
  useGetCurrentUser()
  useGetCity()
  useGetShop()
  useGetMyOrders()
  useUpdateLocation()
  // useGetItemsInCity()
  const dispatch = useDispatch()

  useEffect(() => {
    const socketInstance = io(serverURL, {withCredentials : true})
    dispatch(setSocket(socketInstance))
    socketInstance.on('connect', () => {
      // console.log(socket)
      if(userData)  {
        socketInstance.emit('identity', {userId : userData._id})
      }
    })
    return () => {
      socketInstance.disconnect()
    }
  },[userData?._id])
  
  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
    <Routes>
      <Route path='/signup' element={!userData?<SignUp/> : <Navigate to={"/"}/> }/>
      <Route path='/signin' element={!userData?<SignIn/> : <Navigate to={"/"}/> }/>
      <Route path='/forgot-password' element={!userData?<ForgotPassword/> : <Navigate to={"/"}/> }/>
      <Route path='/' element={userData?<Home /> : <Navigate to={"/signin"}/>}/>
      <Route path='/create-edit-shop' element={userData?<CreateEditShop /> : <Navigate to={"/signin"}/>}/>
      <Route path='/add-item' element={userData?<AddItems /> : <Navigate to={"/signin"}/>}/>
      <Route path='/edit-item/:itemId' element={userData?<EditItem /> : <Navigate to={"/signin"}/>}/>
      <Route path='/cart' element={userData?<CartPage /> : <Navigate to={"/signin"}/>}/>
      <Route path='/check-out' element={userData?<CheckOut /> : <Navigate to={"/signin"}/>}/>
      <Route path='/order-placed' element={userData?<OrderPlaced /> : <Navigate to={"/signin"}/>}/>
      <Route path='/my-orders' element={userData?<MyOrders /> : <Navigate to={"/signin"}/>}/>
      <Route path='/track-order/:orderId' element={userData?<TrackOrderPage /> : <Navigate to={"/signin"}/>}/>
      <Route path='/shop-items/:shopId' element={userData?<ShopItemsPage /> : <Navigate to={"/signin"}/>}/>
      <Route path='/delivered-orders' element={userData?<DeliveredOrders /> : <Navigate to={"/signin"}/>}/>
      
    </Routes>
    </>
  )
}

export default App
