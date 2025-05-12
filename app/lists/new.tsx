import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { HeaderWithBack } from '@/src/components/HeaderWithBack';
import { layout, forms, buttons, typography, colors } from '@/src/styles/common';
import { useShoppingLists } from '@/src/hooks';

export default function NewListScreen() {
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createList } = useShoppingLists();
  
  const handleCreateList = async () => {
    if (!listName.trim()) {
      Alert.alert('Error', 'List name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createList(listName, listDescription);
      
      // Navigate back to the lists screen
      router.replace('/lists');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create list';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={layout.container}>
      <HeaderWithBack 
        title="Create New List"
        backTo="/lists"
        backTitle="My Lists"
      />
      
      <View style={forms.formContainer}>
        <Text style={forms.label}>List Name</Text>
        <TextInput
          style={forms.input}
          value={listName}
          onChangeText={setListName}
          placeholder="Enter list name"
          editable={!isSubmitting}
        />
        
        <Text style={forms.label}>Description (Optional)</Text>
        <TextInput
          style={[forms.input, forms.textArea]}
          value={listDescription}
          onChangeText={setListDescription}
          placeholder="Enter list description"
          multiline
          numberOfLines={4}
          editable={!isSubmitting}
        />
        
        <TouchableOpacity 
          style={[
            buttons.primary,
            (!listName.trim() || isSubmitting) && buttons.primaryDisabled
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
    </View>
  );
}
