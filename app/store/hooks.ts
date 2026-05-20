import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/** Pre-typed `useDispatch` — use this instead of plain `useDispatch` */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Pre-typed `useSelector` — use this instead of plain `useSelector` */
export const useAppSelector = useSelector.withTypes<RootState>();
