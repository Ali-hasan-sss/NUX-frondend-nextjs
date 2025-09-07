import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import adminUsersReducer from "@/features/admin/users/adminUsersSlice";
import adminRestaurantsReducer from "@/features/admin/restaurants/adminRestaurantsSlice";
import adminPlansReducer from "@/features/admin/plans/adminPlansSlice";
import aadminSubscriptionsReducer from "@/features/admin/subscriptions/adminSubscriptionsSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import restaurantAccountReducer from "@/features/restaurant/restaurantAccount/restaurantAccountSlice";
import restaurantGroupsReducer from "@/features/restaurant/groups/groupsSlice";
import restaurantMenuReducer from "@/features/restaurant/menu/menuSlice";
import restaurantPackagesReducer from "@/features/restaurant/packages/packagesSlice";
import { attachStoreToAxios } from "@/utils/axiosInstance";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminUsers: adminUsersReducer,
    adminRestaurants: adminRestaurantsReducer,
    adminPlans: adminPlansReducer,
    adminSubscriptions: aadminSubscriptionsReducer,
    notifications: notificationsReducer,
    restaurantAccount: restaurantAccountReducer,
    restaurantGroups: restaurantGroupsReducer,
    restaurantMenu: restaurantMenuReducer,
    restaurantPackages: restaurantPackagesReducer,
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
