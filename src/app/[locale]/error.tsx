"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Mail } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
  }, [error]);

  const handleContact = () => {
    // Open email client with error details
    const subject = encodeURIComponent("Error Report");
    const body = encodeURIComponent(
      `Error: ${error.message}\nDigest: ${error.digest || "N/A"}`
    );
    window.location.href = `mailto:cvak@frafol.sk?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Error Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute -top-4 -right-4 w-24 h-24 rounded-full"
              style={{ backgroundColor: "#ad2b08" }}
            ></div>
            <div
              className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full"
              style={{ backgroundColor: "#ad2b08" }}
            ></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Error Icon */}
            <div
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: "#ad2b08", opacity: 0.1 }}
            >
              <AlertTriangle
                className="w-10 h-10"
                style={{ color: "#ad2b08" }}
              />
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {/* Oops! Something went wrong */}
              Ups! Niečo sa pokazilo
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 mb-2 leading-relaxed">
              {/* We encountered an unexpected error. Don't worry, our team has
                  been notified and we're working to fix it. */}
              Vyskytla sa neočakávaná chyba, ale nebojte sa, náš tím bol
              upozornený a pracuje na jej odstránení.
            </p>

            {/* Error Details (for development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6 text-left">
                <p className="text-sm text-gray-500 mb-1">Error Details:</p>
                <p className="text-sm text-gray-700 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-sm text-gray-500 mt-1">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 mt-8">
              <button
                onClick={reset}
                className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: "#ad2b08" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#8a2206")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ad2b08")
                }
              >
                <RotateCcw className="w-4 h-4" />
                {/* Try Again */}
                Skúsiť znova
              </button>
            </div>

            {/* Contact Support */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">
                {/* Still having trouble? */}
                Stále to nefunguje?
              </p>
              <button
                onClick={handleContact}
                className="font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                style={{ color: "#ad2b08" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#8a2206")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#ad2b08")}
              >
                <Mail className="w-4 h-4" />
                cvak@frafol.sk
              </button>
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            {error.digest && (
              <>
                Error ID: <span className="font-mono">{error.digest}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
