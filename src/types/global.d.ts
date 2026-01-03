/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/global.d.ts

// This file extends the global scope for types used by external scripts.

// 1. Declare the Google Maps namespace
declare global {
  interface Window {
    // The Google Maps API object
    google?: typeof import("google.maps");

    // 2. Declare your custom global callback function
    initMapCallback?: () => void;

    // Add other dynamically created global properties here if needed
    [key: string]: any;
  }
}

// Ensures the file is treated as a module
export { };



// Note: npm install --save-dev @types/google.maps