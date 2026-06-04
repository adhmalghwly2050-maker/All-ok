import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Page not found at route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-sans font-bold text-gray-900 tracking-tight">404</h1>
        <p className="mt-4 text-xl text-gray-600 font-sans">الصفحة غير موجودة</p>
        <p className="mt-2 text-sm text-gray-500 font-mono">{location.pathname}</p>
        <a
          href="/"
          className="mt-6 inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          العودة للرئيسية
        </a>
      </div>
    </div>
  );
}
