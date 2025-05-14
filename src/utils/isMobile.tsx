import { Platform, Dimensions } from "react-native";

// Helper function to detect if we're on mobile
export const isMobile = () => {
  if (Platform.OS !== "web") return true;

  // Check if window and navigator exist (they should in web environment)
  if (typeof window !== "undefined" && window.navigator) {
    const userAgent = window.navigator.userAgent || "";
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );
  }

  // Fallback to screen size check
  const windowWidth = Dimensions.get("window").width;
  return windowWidth < 768; // Common breakpoint for mobile devices
};


// Helper function to detect if we're on mobile web
export const isMobileWeb = () => {
  if (Platform.OS !== "web") return false;

  // Check if window and navigator exist (they should in web environment)
  if (typeof window !== "undefined" && window.navigator) {
    const userAgent = window.navigator.userAgent || "";
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );
  }

  // Fallback to screen size check
  const windowWidth = Dimensions.get("window").width;
  return windowWidth < 768; // Common breakpoint for mobile devices
};