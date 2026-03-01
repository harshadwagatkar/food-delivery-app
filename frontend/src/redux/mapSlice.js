import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
    name : "map",
    initialState : {
        location : {
            lat : null,
            lng : null,
        },
        finalAddress : null,
    },
    reducers : {
        setLocation : (state, action) => {
            const {lat, lng} = action.payload
            state.location.lat = lat
            state.location.lng = lng
        },
        setFinalAddress : (state, action) => {
            state.finalAddress = action.payload
        }
    }
})

export const {
    setLocation,
    setFinalAddress,
} = mapSlice.actions;

export default mapSlice.reducer;