import { createSlice } from "@reduxjs/toolkit";
import { BalancesState } from "./balancesTypes";
import {
  fetchUserBalances,
  scanQrCode,
  payAtRestaurant,
  giftBalance,
  fetchPublicPackages,
} from "./balancesThunks";

const initialState: BalancesState = {
  userBalances: [],
  packages: [],
  loading: {
    balances: false,
    packages: false,
    qrScan: false,
    payment: false,
    gift: false,
  },
  error: {
    balances: null,
    packages: null,
    qrScan: null,
    payment: null,
    gift: null,
  },
};

const balancesSlice = createSlice({
  name: "balances",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = {
        balances: null,
        packages: null,
        qrScan: null,
        payment: null,
        gift: null,
      };
    },
    clearBalances: (state) => {
      state.userBalances = [];
      state.packages = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch user balances
    builder
      .addCase(fetchUserBalances.pending, (state) => {
        state.loading.balances = true;
        state.error.balances = null;
      })
      .addCase(fetchUserBalances.fulfilled, (state, action) => {
        state.loading.balances = false;
        state.userBalances = action.payload;
        state.error.balances = null;
      })
      .addCase(fetchUserBalances.rejected, (state, action) => {
        state.loading.balances = false;
        state.error.balances = action.payload || "Failed to fetch balances";
      });

    // Scan QR code
    builder
      .addCase(scanQrCode.pending, (state) => {
        state.loading.qrScan = true;
        state.error.qrScan = null;
      })
      .addCase(scanQrCode.fulfilled, (state) => {
        state.loading.qrScan = false;
        state.error.qrScan = null;
      })
      .addCase(scanQrCode.rejected, (state, action) => {
        state.loading.qrScan = false;
        state.error.qrScan = action.payload || "Failed to scan QR code";
      });

    // Pay at restaurant
    builder
      .addCase(payAtRestaurant.pending, (state) => {
        state.loading.payment = true;
        state.error.payment = null;
      })
      .addCase(payAtRestaurant.fulfilled, (state) => {
        state.loading.payment = false;
        state.error.payment = null;
      })
      .addCase(payAtRestaurant.rejected, (state, action) => {
        state.loading.payment = false;
        state.error.payment = action.payload || "Failed to process payment";
      });

    // Gift balance
    builder
      .addCase(giftBalance.pending, (state) => {
        state.loading.gift = true;
        state.error.gift = null;
      })
      .addCase(giftBalance.fulfilled, (state) => {
        state.loading.gift = false;
        state.error.gift = null;
      })
      .addCase(giftBalance.rejected, (state, action) => {
        state.loading.gift = false;
        state.error.gift = action.payload || "Failed to gift balance";
      });

    // Fetch public packages
    builder
      .addCase(fetchPublicPackages.pending, (state) => {
        state.loading.packages = true;
        state.error.packages = null;
      })
      .addCase(fetchPublicPackages.fulfilled, (state, action) => {
        state.loading.packages = false;
        state.packages = action.payload;
        state.error.packages = null;
      })
      .addCase(fetchPublicPackages.rejected, (state, action) => {
        state.loading.packages = false;
        state.error.packages = action.payload || "Failed to fetch packages";
      });
  },
});

export const { clearErrors, clearBalances } = balancesSlice.actions;
export default balancesSlice.reducer;
