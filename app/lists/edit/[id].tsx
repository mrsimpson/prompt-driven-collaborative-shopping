import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { HeaderWithBack } from "@/src/components/HeaderWithBack";
import { layout, colors, buttons, typography } from "@/src/styles/common";
import { useShoppingLists } from "@/src/hooks";
import { CrossPlatformAlert } from "@/src/components/CrossPlatformAlert";

const styles = {
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: "500" as const,
  },
  input: {
    backgroundColor: colors.gray100,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: colors.gray100,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    minHeight: 100,
    textAlignVertical: "top" as const,
  },
  buttonContainer: {
    marginTop: 24,
  },
  errorText: {
    color: colors.danger,
    marginTop: 8,
  },
};

export default function EditListScreen() {
  // Get the list ID from the URL parameters
  const params = useLocalSearchParams();
  const listId = typeof params.id === "string" ? params.id : "";

  const { lists, loading, error, updateList } = useShoppingLists();
  const currentList = lists.find((list) => list.id === listId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Load the current list data when it becomes available
  useEffect(() => {
    if (currentList) {
      setName(currentList.name || "");
      setDescription(currentList.description || "");
    }
  }, [currentList]);

  // Handle form submission
  const handleSave = async () => {
    // Validate form
    if (!name.trim()) {
      setValidationError("List name is required");
      return;
    }

    try {
      setIsSaving(true);
      setValidationError("");

      await updateList(listId, {
        name: name.trim(),
        description: description.trim(),
      });

      // Navigate back to the list detail screen
      router.back();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update list";
      CrossPlatformAlert.show("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <View style={[layout.container, layout.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { marginTop: 16 }]}>
          Loading list...
        </Text>
      </View>
    );
  }

  // Handle error state
  if (error || !currentList) {
    return (
      <View style={[layout.container, layout.center]}>
        <Text style={[typography.body, { color: colors.danger }]}>
          {error?.message || "List not found"}
        </Text>
        <TouchableOpacity
          style={[buttons.secondary, { marginTop: 16 }]}
          onPress={() => router.replace("/lists")}
        >
          <Text style={typography.buttonTextSecondary}>Back to Lists</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={layout.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <HeaderWithBack title="Edit List" backTo={`/lists/${listId}`} />

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[typography.body, styles.label]}>List Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter list name"
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[typography.body, styles.label]}>Description (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter list description"
            multiline
            numberOfLines={4}
          />
        </View>

        {validationError ? (
          <Text style={styles.errorText}>{validationError}</Text>
        ) : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[buttons.primary, isSaving && buttons.primaryDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={typography.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
