import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdsState, AdsFilters, Ad, AdsPagination } from "./adsTypes";
import { fetchAds, refreshAds } from "./adsThunks";

const initialState: AdsState = {
  ads: [],
  pagination: null,
  filters: {
    page: 1,
    pageSize: 10,
  },
  loading: false,
  refreshing: false,
  error: null,
};

export const adsSlice = createSlice({
  name: "clientAds",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<AdsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        pageSize: 10,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch ads
      .addCase(fetchAds.pending, (state) => {
        if (state.ads.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.append) {
          state.ads = [...state.ads, ...action.payload.data.ads];
        } else {
          state.ads = action.payload.data.ads;
        }
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch ads";
      })
      // Refresh ads
      .addCase(refreshAds.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(refreshAds.fulfilled, (state, action) => {
        state.refreshing = false;
        state.ads = action.payload.ads;
        state.pagination = action.payload.pagination;
      })
      .addCase(refreshAds.rejected, (state, action) => {
        state.refreshing = false;
        state.error = (action.payload as string) || "Failed to refresh ads";
      });
  },
});

export const { setFilters, clearFilters } = adsSlice.actions;
export default adsSlice.reducer;

