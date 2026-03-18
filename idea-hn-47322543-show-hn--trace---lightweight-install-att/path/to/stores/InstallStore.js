import { createStore, combineReducers } from 'redux';
import installReducer from './installReducer';

const store = createStore(combineReducers({ install: installReducer }));

export default store;
