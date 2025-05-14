import { Platform, Dimensions } from "react-native";

/**
 * Detects if the current environment is a mobile device
 * @returns true if the environment is a mobile device
 */
export function isMobile(): boolean {
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
}

/**
 * Detects if the current environment is a mobile web browser
 * @returns true if the environment is a mobile web browser
 */
export function isMobileWeb(): boolean {
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
}
