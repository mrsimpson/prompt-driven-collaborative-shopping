import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle,
  KeyboardTypeOptions,
} from "react-native";
import { colors } from "@/src/styles/common";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  textStyle?: TextStyle;
  inputStyle?: ViewStyle;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  validate?: (value: string) => boolean | string;
  onSubmitEditing?: (currentValue: string) => void;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  placeholder = "",
  isEditing,
  setIsEditing,
  textStyle = {},
  inputStyle = {},
  keyboardType = "default",
  autoFocus = true,
  validate,
  onSubmitEditing,
}) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<TextInput>(null);

  // Update the edit value when the external value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isEditing, autoFocus]);

  const handleSave = () => {
    if (validate) {
      const validationResult = validate(editValue);
      if (validationResult !== true && typeof validationResult === "string") {
        // Handle validation error
        return;
      }
    }

    // Immediately save the current value
    onSave(editValue);
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleSubmitEditing = () => {
    // Make sure we save before calling onSubmitEditing
    handleSave();

    // Then call onSubmitEditing if provided, passing the current value
    if (onSubmitEditing) {
      // Pass the current value directly to ensure it's up to date
      onSubmitEditing(editValue);
    }
  };

  if (isEditing) {
    return (
      <TextInput
        ref={inputRef}
        style={[styles.text, styles.input, textStyle]}
        value={editValue}
        onChangeText={setEditValue}
        placeholder={placeholder}
        keyboardType={keyboardType}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmitEditing}
        returnKeyType="done"
        autoFocus={autoFocus}
        selectTextOnFocus
      />
    );
  }

  return (
    <TouchableOpacity onPress={() => setIsEditing(true)}>
      <Text style={[styles.text, textStyle]} numberOfLines={1}>
        {value || placeholder}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.gray100,
    borderRadius: 6,
    padding: 8,
    minHeight: 36,
    minWidth: 40,
  },
  text: {
    fontSize: 16,
    minHeight: 36,
    paddingVertical: 8,
  },
});
