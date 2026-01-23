import { ControlPanelGameListener } from "./ControlPanelGameListener";
import { TitleBar } from "../src/components/TitleBar/TitleBar";
import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { LoginScreen } from "./components/Auth/LoginScreen";
import { UpdaterGate } from "./components/Updater/UpdaterGate";
import { UserManagement } from "./components/UserManagement/UserManagement";
import "./index.css";

export default function App() {
  const [version, setVersion] = useState<string>("—");
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Listen for pathname changes (for user management window)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Check initial path
    handleLocationChange();

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", handleLocationChange);

    // Poll for pathname changes (since Electron might not trigger popstate)
    const interval = setInterval(handleLocationChange, 100);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    window.appInfo
      ?.getVersion?.()
      .then(setVersion)
      .catch(() => setVersion("dev"));
  }, []);

  // Check if we're on the user management route
  const isUserManagementRoute = currentPath === "/user-management" || currentPath.endsWith("/user-management");

  // Skip auth loading screen for user management route (it's opened from authenticated session)
  if (isLoading && !isUserManagementRoute) {
    return (
      <div
        className="
          h-screen w-screen
          flex items-center justify-center
          bg-linear-to-br from-csabg-500 via-csabg-400 to-csab-500
        "
      >
        <div className="text-white/80 text-sm tracking-wide">
          Preparing your session…
        </div>
      </div>
    );
  }

  // What should show INSIDE the app: user management, login, or control panel
  let mainContent;
  if (isUserManagementRoute) {
    mainContent = <UserManagement />;
  } else if (isAuthenticated) {
    mainContent = <ControlPanelGameListener />;
  } else {
    mainContent = <LoginScreen />;
  }

  return (
    <div
      className="
        h-screen w-screen
        overflow-hidden
        flex flex-col
        relative
        bg-linear-to-br from-csabg-500 via-csabg-400 to-csab-500
      "
    >
      {/* 🔹 Always visible window controls / drag region (hide on user management) */}
      {!isUserManagementRoute && <TitleBar />}

      {/* 🔹 Main content area - skip UpdaterGate for user management route */}
      <div className="flex-1 overflow-hidden p-3 relative">
        {isUserManagementRoute ? (
          mainContent
        ) : (
          <UpdaterGate>{mainContent}</UpdaterGate>
        )}
      </div>

      {/* ✅ GLOBAL FOOTER (outside panels) */}
      <div
        className="
          absolute bottom-2 left-3
          text-xs text-white/60
          flex items-center gap-2
          pointer-events-none
          select-none
        "
      >
        <span className="opacity-80">v{version}</span>
        <span className="opacity-40">•</span>
        <span className="opacity-60">Made by NuKEy</span>
      </div>

      {/* ✅ GLOBAL FOOTER — RIGHT */}
      <div
        className="
          absolute bottom-2 right-3
          text-xs text-white/80
          pointer-events-none
          select-none
          flex items-center gap-1
        "
      >
        <span className="opacity-80">©</span>
        <span className="font-medium tracking-wide">playcsa.com</span>
      </div>
    </div>
  );
}
