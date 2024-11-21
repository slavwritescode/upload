import { createSlice } from '@reduxjs/toolkit';

export const userInfo = createSlice({
    name: 'userInfo',
    initialState: {
        value: null,
    },
    reducers: {
        updateUserInfo: (state, action) => {
            state.value = action.payload
        }
    },
})

// Action creators are generated for each case reducer function
export const { updateUserInfo } = userInfo.actions;

export default userInfo.reducer;