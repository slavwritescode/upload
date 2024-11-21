import { createSlice } from '@reduxjs/toolkit';

export const databaseConnections = createSlice({
    name: 'databaseConnections',
    initialState: {
        value: [],
    },
    reducers: {
        connectToRoot: (state, action) => {
            if (!state.value.includes(action.payload)) {
                console.log('Connecting to "', action.payload + '"');
                state.value = [...state.value, action.payload];
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { connectToRoot } = databaseConnections.actions;

export default databaseConnections.reducer;