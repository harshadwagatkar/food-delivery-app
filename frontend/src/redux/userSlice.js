import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    isAuthenticated: false,
    city: null,
    state: null,
    address: null,
    locationStatus: "idle",
    allItemsInCity: null,
    cartItems: [],
    myOrders: [],
    socket: null,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.isAuthenticated = true;
    },
    // clearUserData: (state) => {
    //   state.userData = null;
    //   state.isAuthenticated = false;
    // },
    setCity: (state, action) => {
      state.city = action.payload;
    },
    setState: (state, action) => {
      state.state = action.payload;
    },
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    logoutUser: (state) => {
      state.userData = null;
      state.isAuthenticated = false;
      state.city = null;
      state.state = null;
      state.address = null;
      state.allItemsInCity = null;
      state.myOrders = [];
      state.cartItems = [];
      state.socket = null;
    },
    setAllItemsInCity: (state, action) => {
      state.allItemsInCity = action.payload;
    },

    //location reducer
    setLocationLoading: (state) => {
      state.locationStatus = "loading";
    },
    setLocationError: (state) => {
      state.locationStatus = "error";
    },
    setLocationSuccess: (state) => {
      state.locationStatus = "success";
    },

    //add to cart
    addToCart: (state, action) => {
      const cartItem = action.payload;
      const existingItem = state.cartItems.find((i) => i.id == cartItem.id);

      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const currentItem = state.cartItems.find((i) => i.id == id);
      if (currentItem) {
        currentItem.quantity = quantity;
      }
    },

    removeCartItem: (state, action) => {
      const { id } = action.payload;
      state.cartItems = state.cartItems.filter((i) => i.id != id);
    },

    clearCart: (state) => {
      state.cartItems = [];
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },

    addMyOrders: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders];
    },

    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find((o) => o._id == orderId);
      if (order) {
        if (order.shopOrders && order.shopOrders[0].shop._id == shopId) {
          order.shopOrders[0].status = status;
        }
      }
    },

    updateOrderStatusRealtime: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find((o) => o._id == orderId);
      if (order) {
        const shopOrder = order.shopOrders.find((so) => so.shop._id == shopId);
        if (shopOrder) {
          shopOrder.status = status;
        }
      }
    },

    setSocket: (state, action) => {
      state.socket = action.payload;
    },
  },
});

export const {
  setUserData,
  setCity,
  setState,
  setAddress,
  logoutUser,
  setAllItemsInCity,
  setLocationError,
  setLocationLoading,
  setLocationSuccess,
  addToCart,
  updateQuantity,
  removeCartItem,
  clearCart,
  setMyOrders,
  addMyOrders,
  updateOrderStatus,
  setSocket,
  updateOrderStatusRealtime,
} = userSlice.actions;
export default userSlice.reducer;
