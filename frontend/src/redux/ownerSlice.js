import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
  name: "owner",
  initialState: {
    shopData: null,
    shopLoading: true,
  },
  reducers: {
    setShopData: (state, action) => {
      state.shopData = action.payload;
    },

    setShopLoading: (state, action) => {
      state.shopLoading = action.payload;
    },

    logoutOwner: (state) => {
      state.shopData = null;
      state.shopLoading = false;
    },
  },
});

export const { setShopData, setShopLoading, logoutOwner } = ownerSlice.actions;
export default ownerSlice.reducer;
