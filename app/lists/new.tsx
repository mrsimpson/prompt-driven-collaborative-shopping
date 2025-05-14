import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { HeaderWithBack } from "@/src/components/HeaderWithBack";
import {
  layout,
  forms,
  buttons,
  typography,
  colors,
} from "@/src/styles/common";
import { useShoppingLists } from "@/src/hooks";
import { CrossPlatformAlert } from "@/src/components/CrossPlatformAlert";

export default function NewListScreen() {
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  const { createList } = useShoppingLists();

  const handleCreateList = async () => {
    if (!listName.trim()) {
      CrossPlatformAlert.show("Error", "List name is required");
      nameInputRef.current?.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      const newList = await createList(listName, listDescription);

      // Navigate directly to the newly created list
      if (newList && newList.id) {
        router.replace(`/lists/${newList.id}`);
      } else {
        router.replace("/lists");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create list";
      CrossPlatformAlert.show("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: any, inputType: 'name' | 'description') => {
    // Check if Enter key was pressed
    if (e.nativeEvent && e.nativeEvent.key === 'Enter') {
      if (inputType === 'name') {
        // If name field has content and Enter is pressed, move to description
        if (listName.trim()) {
          descriptionInputRef.current?.focus();
        }
      } else if (inputType === 'description') {
        // If Enter is pressed in description and name is filled, create the list
        if (listName.trim()) {
          handleCreateList();
        } else {
          nameInputRef.current?.focus();
          CrossPlatformAlert.show("Error", "List name is required");
        }
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={layout.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <HeaderWithBack
        title="Create New List"
        backTo="/lists"
        backTitle="My Lists"
      />

      <View style={forms.formContainer}>
        <Text style={forms.label}>List Name</Text>
        <TextInput
          ref={nameInputRef}
          style={forms.input}
          value={listName}
          onChangeText={setListName}
          placeholder="Enter list name"
          editable={!isSubmitting}
          returnKeyType="next"
          onSubmitEditing={() => descriptionInputRef.current?.focus()}
          onKeyPress={(e) => handleKeyPress(e, 'name')}
          blurOnSubmit={false}
          autoFocus
        />

        <Text style={forms.label}>Description (Optional)</Text>
        <TextInput
          ref={descriptionInputRef}
          style={[forms.input, forms.textArea]}
          value={listDescription}
          onChangeText={setListDescription}
          placeholder="Enter list description"
          multiline
          numberOfLines={4}
          editable={!isSubmitting}
          returnKeyType="done"
          onSubmitEditing={listName.trim() ? handleCreateList : undefined}
          onKeyPress={(e) => handleKeyPress(e, 'description')}
        />

        <TouchableOpacity
          style={[
            buttons.primary,
            (!listName.trim() || isSubmitting) && buttons.primaryDisabled,
          ]}
          onPress={handleCreateList}
          disabled={!listName.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={typography.buttonText}>Create List</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
