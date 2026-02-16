import { getAuthToken } from "./getAuthToken";
import { getBaseUrl } from "@/helpers/config/envConfig";

// Custom fetch wrapper to handle Authorization token injection and refresh
const baseUrl = getBaseUrl();
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
        const accessToken = await getAuthToken();

        // Add the Authorization header only when a token exists.
        // Contract: Authorization: Bearer <accessToken> — matches the backend auth middleware.
        const headers = {
            ...options.headers,
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        };


        // Make the request
        //* Right now I make it const but when I use refresh token it will be changed to let
        const response = await fetch(baseUrl + url, {
            ...options,
            headers,
        });

        // Check if the access token expired (401 Unauthorized)
        // if (response.status === 401) {
        //   // Attempt to refresh the token
        //   const refreshResponse = await fetch(`${baseUrl}/refresh-token`, {
        //     method: "POST",
        //     credentials: "same-origin", // Make sure cookies are sent
        //   });

        //   if (refreshResponse.ok) {
        //     const { accessToken: newAccessToken } = await refreshResponse.json();

        //     // Save the new access token in cookies (make sure to use HttpOnly cookies for security)
        //     document.cookie = `accessToken=${newAccessToken}; Path=/; HttpOnly; Secure; SameSite=Strict`;

        //     // Retry the original request with the new token
        //     response = await fetch(url, {
        //       ...options,
        //       headers: {
        //         ...headers,
        //         Authorization: `Bearer ${newAccessToken}`,
        //       },
        //     });
        //   } else {
        //     // Handle refresh failure (e.g., redirect to login page)
        //     window.location.href = "sign-in"; // Redirect to login
        //   }
        // }

        return response; // Return the response
    } catch (error) {
        throw error;
    }
};
