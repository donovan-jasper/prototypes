import { createStore, combineReducers } from 'redux';
import deepLinkReducer from './deepLinkReducer';

const store = createStore(combineReducers({ deepLink: deepLinkReducer }));

export default store;
