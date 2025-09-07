import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import adminUsersReducer from "@/features/admin/users/adminUsersSlice";
import adminRestaurantsReducer from "@/features/admin/restaurants/adminRestaurantsSlice";
import adminPlansReducer from "@/features/admin/plans/adminPlansSlice";
import aadminSubscriptionsReducer from "@/features/admin/subscriptions/adminSubscriptionsSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import { attachStoreToAxios } from "@/utils/axiosInstance";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminUsers: adminUsersReducer,
    adminRestaurants: adminRestaurantsReducer,
    adminPlans: adminPlansReducer,
    adminSubscriptions: aadminSubscriptionsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Attach store to axios to avoid import cycles
attachStoreToAxios(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
