import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { HeaderWithBack } from '@/src/components/HeaderWithBack';
import { layout, forms, buttons, typography } from '@/src/styles/common';

export default function NewListScreen() {
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  
  const createList = () => {
    if (!listName.trim()) {
      // Show error - would use a proper alert/toast in a real implementation
      console.log('List name is required');
      return;
    }
    
    // In a real implementation, this would call our ShoppingListService
    console.log(`Creating new list: ${listName}, ${listDescription}`);
    
    // Navigate back to the lists screen
    router.replace('/lists');
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
        />
        
        <Text style={forms.label}>Description (Optional)</Text>
        <TextInput
          style={[forms.input, forms.textArea]}
          value={listDescription}
          onChangeText={setListDescription}
          placeholder="Enter list description"
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity 
          style={[
            buttons.primary,
            !listName.trim() && buttons.primaryDisabled
          ]}
          onPress={createList}
          disabled={!listName.trim()}
        >
          <Text style={typography.buttonText}>Create List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
