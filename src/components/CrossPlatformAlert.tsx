import React from "react";
import { Alert, Platform } from "react-native";
import { WebAlert } from "./WebAlert";

/**
 * Button configuration for alerts
 */
export interface AlertButton {
  text: string;
  onPress: () => void;
  style?: "default" | "cancel" | "destructive";
}

// Map to store React roots by alert ID
const alertRoots = new Map();

/**
 * Cross-platform alert service that uses the appropriate alert mechanism based on platform
 */
export const CrossPlatformAlert = {
  /**
   * Show an alert dialog with the specified title, message, and buttons
   *
   * @param title Alert title
   * @param message Alert message
   * @param buttons Array of button configurations
   * @param options Additional options
   * @returns A function to dismiss the alert (web only)
   */
  show: (
    title: string,
    message: string,
    buttons: AlertButton[] = [
      { text: "OK", onPress: () => {}, style: "default" },
    ],
    options: { cancelable?: boolean } = {},
  ): (() => void) | undefined => {
    // For web platform, use our custom WebAlert component
    if (Platform.OS === "web") {
      // Create a container for the web alert if it doesn't exist
      let container = document.getElementById("web-alert-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "web-alert-container";
        document.body.appendChild(container);
      }

      // Create a unique ID for this alert instance
      const alertId = `alert-${Date.now()}`;

      // Create a new div for this specific alert
      const alertContainer = document.createElement("div");
      alertContainer.id = alertId;
      container.appendChild(alertContainer);

      // State to control alert visibility
      let isVisible = true;

      // Function to dismiss the alert
      const dismiss = () => {
        isVisible = false;
        // Force re-render to hide the alert
        renderAlert();

        // Remove the alert container and clean up the root after animation completes
        setTimeout(() => {
          // Clean up the React root
          const root = alertRoots.get(alertId);
          if (root) {
            root.unmount();
            alertRoots.delete(alertId);
          }

          // Remove the DOM element
          const element = document.getElementById(alertId);
          if (element) {
            element.remove();
          }
        }, 300);
      };

      // Map our buttons to the format expected by WebAlert
      const webAlertButtons = buttons.map((button) => ({
        text: button.text,
        onPress: () => {
          button.onPress();
          dismiss();
        },
        style: button.style,
      }));

      // Function to render the alert using React 18's createRoot API
      const renderAlert = () => {
        try {
          // Use dynamic import to avoid bundling issues
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const ReactDOM = require("react-dom/client");

          // Get or create the root
          let root = alertRoots.get(alertId);
          if (!root) {
            root = ReactDOM.createRoot(alertContainer);
            alertRoots.set(alertId, root);
          }

          // Render the WebAlert component
          root.render(
            <WebAlert
              visible={isVisible}
              title={title}
              message={message}
              buttons={webAlertButtons}
              onDismiss={dismiss}
            />,
          );
        } catch (error) {
          console.error("Failed to render web alert:", error);
          // Fallback to window.alert
          if (window.confirm(`${title}\n\n${message}`)) {
            // Find and execute the non-cancel button
            const confirmButton = buttons.find((b) => b.style !== "cancel");
            if (confirmButton) {
              confirmButton.onPress();
            }
          } else {
            // Execute the cancel button
            const cancelButton = buttons.find((b) => b.style === "cancel");
            if (cancelButton) {
              cancelButton.onPress();
            }
          }
        }
      };

      // Initial render
      renderAlert();

      // Return the dismiss function so the caller can dismiss the alert programmatically
      return dismiss;
    }
    // For native platforms, use the native Alert API
    else {
      // Map our buttons to the format expected by React Native Alert
      const alertButtons = buttons.map((button) => ({
        text: button.text,
        onPress: button.onPress,
        style: button.style,
      }));

      // Show the native alert
      Alert.alert(title, message, alertButtons, options);

      // Native alerts can't be programmatically dismissed
      return undefined;
    }
  },

  /**
   * Show a confirmation dialog with OK and Cancel buttons
   *
   * @param title Alert title
   * @param message Alert message
   * @param onConfirm Function to call when the user confirms
   * @param onCancel Function to call when the user cancels (optional)
   * @returns A function to dismiss the alert (web only)
   */
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ): (() => void) | undefined => {
    return CrossPlatformAlert.show(title, message, [
      {
        text: "Cancel",
        onPress: onCancel || (() => {}),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: onConfirm,
        style: "default",
      },
    ]);
  },

  /**
   * Show a destructive confirmation dialog with Cancel and a destructive action
   *
   * @param title Alert title
   * @param message Alert message
   * @param destructiveText Text for the destructive button
   * @param onDestructivePress Function to call when the destructive button is pressed
   * @param onCancel Function to call when the user cancels (optional)
   * @returns A function to dismiss the alert (web only)
   */
  destructiveConfirm: (
    title: string,
    message: string,
    destructiveText: string,
    onDestructivePress: () => void,
    onCancel?: () => void,
  ): (() => void) | undefined => {
    return CrossPlatformAlert.show(title, message, [
      {
        text: "Cancel",
        onPress: onCancel || (() => {}),
        style: "cancel",
      },
      {
        text: destructiveText,
        onPress: onDestructivePress,
        style: "destructive",
      },
    ]);
  },
};
