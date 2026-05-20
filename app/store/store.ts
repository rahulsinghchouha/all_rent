import { configureStore } from "@reduxjs/toolkit";
import listingReducer from "./listingSlice";

export const store = configureStore({
  reducer: {
    listing: listingReducer,
    // auth: authReducer,   // future
    // ui: uiReducer,       // future
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ImageFile.file is a File object (non-serializable) — ignore it
        ignoredPaths: ["listing.draft.images"],
        ignoredActions: ["listing/updateDraft"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
