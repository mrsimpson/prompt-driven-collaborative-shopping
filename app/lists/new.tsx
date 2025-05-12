import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { HeaderWithBack } from '@/src/components/HeaderWithBack';

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
    <View style={styles.container}>
      <HeaderWithBack 
        title="Create New List"
        backTo="/lists"
        backTitle="My Lists"
      />
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>List Name</Text>
        <TextInput
          style={styles.input}
          value={listName}
          onChangeText={setListName}
          placeholder="Enter list name"
        />
        
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={listDescription}
          onChangeText={setListDescription}
          placeholder="Enter list description"
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity 
          style={[
            styles.createButton,
            !listName.trim() && styles.createButtonDisabled
          ]}
          onPress={createList}
          disabled={!listName.trim()}
        >
          <Text style={styles.createButtonText}>Create List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
