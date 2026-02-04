import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import adminUsersReducer from "@/features/admin/users/adminUsersSlice";
import adminRestaurantsReducer from "@/features/admin/restaurants/adminRestaurantsSlice";
import adminPlansReducer from "@/features/admin/plans/adminPlansSlice";
import aadminSubscriptionsReducer from "@/features/admin/subscriptions/adminSubscriptionsSlice";
import adminInvoicesReducer from "@/features/admin/invoices/adminInvoicesSlice";
import adminOverviewReducer from "@/features/admin/overview/adminOverviewSlice";
import adminPermissionsReducer from "@/features/admin/subadmins/adminPermissionsSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import restaurantAccountReducer from "@/features/restaurant/restaurantAccount/restaurantAccountSlice";
import restaurantGroupsReducer from "@/features/restaurant/groups/groupsSlice";
import restaurantMenuReducer from "@/features/restaurant/menu/menuSlice";
import restaurantPackagesReducer from "@/features/restaurant/packages/packagesSlice";
import restaurantAdsReducer from "@/features/restaurant/ads/adsSlice";
import restaurantInvoicesReducer from "@/features/restaurant/invoices/invoicesSlice";
import restaurantOverviewReducer from "@/features/restaurant/overview/restaurantOverviewSlice";
import qrScansReducer from "@/features/restaurant/qrScans/qrScansSlice";
import paymentsReducer from "@/features/restaurant/payments/paymentsSlice";
import publicRestaurantsReducer from "@/features/public/restaurants/publicRestaurantsSlice";
import publicPlansReducer from "@/features/public/plans/publicPlansSlice";
import {
  clientAccountReducer,
  balancesReducer,
  clientMenuReducer,
  clientAdsReducer,
} from "@/features/client";
import { attachStoreToAxios } from "@/utils/axiosInstance";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminUsers: adminUsersReducer,
    adminRestaurants: adminRestaurantsReducer,
    adminPlans: adminPlansReducer,
    adminSubscriptions: aadminSubscriptionsReducer,
    adminInvoices: adminInvoicesReducer,
    adminOverview: adminOverviewReducer,
    adminPermissions: adminPermissionsReducer,
    notifications: notificationsReducer,
    restaurantAccount: restaurantAccountReducer,
    restaurantGroups: restaurantGroupsReducer,
    restaurantMenu: restaurantMenuReducer,
    restaurantPackages: restaurantPackagesReducer,
    restaurantAds: restaurantAdsReducer,
    restaurantInvoices: restaurantInvoicesReducer,
    restaurantOverview: restaurantOverviewReducer,
    qrScans: qrScansReducer,
    payments: paymentsReducer,
    publicRestaurants: publicRestaurantsReducer,
    publicPlans: publicPlansReducer,
    clientAccount: clientAccountReducer,
    clientBalances: balancesReducer,
    clientMenu: clientMenuReducer,
    clientAds: clientAdsReducer,
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
