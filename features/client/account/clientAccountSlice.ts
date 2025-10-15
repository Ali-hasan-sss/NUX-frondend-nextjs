import { createSlice } from "@reduxjs/toolkit";
import { ClientAccountState } from "./clientAccountTypes";
import {
  fetchClientProfile,
  updateClientProfile,
  changeClientPassword,
  deleteClientAccount,
} from "./clientAccountThunks";

const initialState: ClientAccountState = {
  profile: null,
  loading: {
    profile: false,
    updateProfile: false,
    changePassword: false,
    deleteAccount: false,
  },
  error: {
    profile: null,
    updateProfile: null,
    changePassword: null,
    deleteAccount: null,
  },
};

const clientAccountSlice = createSlice({
  name: "clientAccount",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = {
        profile: null,
        updateProfile: null,
        changePassword: null,
        deleteAccount: null,
      };
    },
    clearProfile: (state) => {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch client profile
    builder
      .addCase(fetchClientProfile.pending, (state) => {
        state.loading.profile = true;
        state.error.profile = null;
      })
      .addCase(fetchClientProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = action.payload;
        state.error.profile = null;
      })
      .addCase(fetchClientProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error.profile = action.payload || "Failed to fetch profile";
      });

    // Update client profile
    builder
      .addCase(updateClientProfile.pending, (state) => {
        state.loading.updateProfile = true;
        state.error.updateProfile = null;
      })
      .addCase(updateClientProfile.fulfilled, (state, action) => {
        state.loading.updateProfile = false;
        state.profile = action.payload;
        state.error.updateProfile = null;
      })
      .addCase(updateClientProfile.rejected, (state, action) => {
        state.loading.updateProfile = false;
        state.error.updateProfile =
          action.payload || "Failed to update profile";
      });

    // Change password
    builder
      .addCase(changeClientPassword.pending, (state) => {
        state.loading.changePassword = true;
        state.error.changePassword = null;
      })
      .addCase(changeClientPassword.fulfilled, (state) => {
        state.loading.changePassword = false;
        state.error.changePassword = null;
      })
      .addCase(changeClientPassword.rejected, (state, action) => {
        state.loading.changePassword = false;
        state.error.changePassword =
          action.payload || "Failed to change password";
      });

    // Delete account
    builder
      .addCase(deleteClientAccount.pending, (state) => {
        state.loading.deleteAccount = true;
        state.error.deleteAccount = null;
      })
      .addCase(deleteClientAccount.fulfilled, (state) => {
        state.loading.deleteAccount = false;
        state.profile = null;
        state.error.deleteAccount = null;
      })
      .addCase(deleteClientAccount.rejected, (state, action) => {
        state.loading.deleteAccount = false;
        state.error.deleteAccount =
          action.payload || "Failed to delete account";
      });
  },
});

export const { clearErrors, clearProfile } = clientAccountSlice.actions;
export default clientAccountSlice.reducer;
