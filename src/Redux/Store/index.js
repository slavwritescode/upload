import { configureStore } from '@reduxjs/toolkit';
import userInfo from '../Features/userInfo';
import databaseConnections from '../Features/databaseConnections';
import database from '../Features/database';

export default configureStore({
    reducer: {
        userInfo: userInfo,
        databaseConnections: databaseConnections,
        database: database,
    },
})