import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    showAlert: false,
    errors: []
}

const componentsSlice = createSlice({
  name: 'components',
  initialState,
  reducers: {
    showAlert(state, action) {
        state.showAlert = true
        state.errors = action.payload
    },
    hideAlert(state) {
        state.showAlert = false
    },
  },
})

export const { showAlert, hideAlert } = componentsSlice.actions
export default componentsSlice.reducer