import { getAuth } from "firebase/auth";
import { app } from "./Config";

export const auth = getAuth(app);
