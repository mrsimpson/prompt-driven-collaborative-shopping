import { StyleSheet } from "react-native";

// Colors
export const colors = {
  primary: "#3B82F6",
  primaryLight: "#93C5FD",
  primaryDark: "#1E40AF",
  danger: "#EF4444",
  white: "#FFFFFF",
  black: "#111827",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  amber50: "#FEF3C7",
  amber500: "#F59E0B",
  amber900: "#92400E",
};

// Typography
export const typography = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.black,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.gray700,
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.black,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: colors.gray600,
    marginBottom: 24,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    color: colors.black,
  },
  bodySmall: {
    fontSize: 14,
    color: colors.gray500,
  },
  bodyTiny: {
    fontSize: 12,
    color: colors.gray400,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
});

// Layout
export const layout = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

// Forms
export const forms = StyleSheet.create({
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray700,
    marginBottom: 8,
  },
  formContainer: {
    padding: 16,
  },
});

// Buttons
export const buttons = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    padding: 14,
    alignItems: "center",
  },
  primaryDisabled: {
    backgroundColor: colors.primaryLight,
  },
  danger: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  iconText: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

// Cards
export const cards = StyleSheet.create({
  basic: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: "#EFF6FF", // Light blue
  },
  warning: {
    backgroundColor: colors.amber50,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.amber500,
  },
});

// Lists
export const lists = StyleSheet.create({
  item: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  itemSelected: {
    backgroundColor: colors.gray100,
  },
  content: {
    padding: 16,
  },
});

// Headers
export const headers = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.black,
    marginLeft: 4,
  },
  rightPlaceholder: {
    width: 40,
  },
});

// Checkboxes
export const checkboxes = StyleSheet.create({
  base: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checked: {
    backgroundColor: colors.primary,
  },
  unchecked: {
    borderColor: colors.gray300,
  },
});

// Footer
export const footer = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: 16,
  },
});

// Export all styles
export default {
  colors,
  typography,
  layout,
  forms,
  buttons,
  cards,
  lists,
  headers,
  checkboxes,
  footer,
};
