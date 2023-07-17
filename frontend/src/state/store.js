import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk';

import componentsReducer from './slices/components'
import userReducer from './slices/user'
import questionReducer from './slices/question'

const store = configureStore({
  reducer: {
    components: componentsReducer,
    user: userReducer,
    question: questionReducer,
  },
  middleware: [thunk]
})

export default store;

