import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
  name: "owner",
  initialState: {
    shopData: null,
  },
  reducers: {
    setShopData: (state, action) => {
      state.shopData = action.payload;
    },

    logoutOwner: (state) => {
      state.shopData = null;
    },
  },
});

export const { setShopData, logoutOwner } = ownerSlice.actions;
export default ownerSlice.reducer;
