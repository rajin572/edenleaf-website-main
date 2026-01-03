/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";

export const decodedToken = (token: string): any => {
  if (!token || token.split(".").length !== 3) {
    return null; // Return null or throw an error if you prefer
  }

  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};
