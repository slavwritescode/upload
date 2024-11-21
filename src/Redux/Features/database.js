import { createSlice } from '@reduxjs/toolkit';

export const database = createSlice({
    name: 'database',
    initialState: {
        value: {},
    },
    reducers: {
        updateDatabase: (state, action) => {
            const objectKey = action.payload.key;
            const objectValue = action.payload.value;
            state.value[objectKey] = objectValue;
        }
    },
})

// Action creators are generated for each case reducer function
export const { updateDatabase } = database.actions;

export default database.reducer;