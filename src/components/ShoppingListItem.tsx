import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit2, Trash2, GripVertical } from 'lucide-react-native';
import { colors } from '@/src/styles/common';
import { ListItem} from '@/src/types/models';
import { InlineEdit } from './InlineEdit';

interface ShoppingListItemProps {
  item: ListItem;
  onUpdate: (id: string, updates: Partial<ListItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  onUpdate,
  onDelete,
  dragHandleProps = {},
  isDragging = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());
  const [editUnit, setEditUnit] = useState(item.unit);

  // Update local state when item props change
  useEffect(() => {
    if (!isEditing) {
      setEditName(item.name);
      setEditQuantity(item.quantity.toString());
      setEditUnit(item.unit);
    }
  }, [item, isEditing]);

  const handleSaveAll = async (name = editName, quantity = editQuantity, unit = editUnit) => {
    try {
      // Parse quantity
      const currentQuantity = parseInt(quantity, 10) || 1;
      const currentUnit = unit || 'pc';
      
      console.log("Saving item with values:", { 
        name, 
        quantity: currentQuantity, 
        unit: currentUnit 
      });
      
      // Use the passed values for the update
      await onUpdate(item.id, {
        name,
        quantity: currentQuantity,
        unit: currentUnit,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleStartEditing = () => {
    // Always update local state from the item props to ensure we have the latest values
    setEditName(item.name);
    setEditQuantity(item.quantity.toString());
    setEditUnit(item.unit);
    setIsEditing(true);
  };

  const handleNameChange = (value: string) => {
    console.log("Name changed to:", value);
    setEditName(value);
  };

  const handleQuantityChange = (value: string) => {
    console.log("Quantity changed to:", value);
    setEditQuantity(value);
  };

  const handleUnitChange = (value: string) => {
    console.log("Unit changed to:", value);
    setEditUnit(value);
  };

  const handleNameSubmit = (currentValue: string) => {
    handleSaveAll(currentValue, editQuantity, editUnit);
  };

  const handleQuantitySubmit = (currentValue: string) => {
    handleSaveAll(editName, currentValue, editUnit);
  };

  const handleUnitSubmit = (currentValue: string) => {
    handleSaveAll(editName, editQuantity, currentValue);
  };

  return (
    <View style={[
      styles.itemRow, 
      isDragging && styles.draggingItem
    ]}>
      <TouchableOpacity 
        style={styles.dragHandle}
        {...dragHandleProps}
      >
        <GripVertical size={18} color={colors.gray400} />
      </TouchableOpacity>
      
      <View style={styles.itemContent}>
        <View style={styles.itemNameContainer}>
          <InlineEdit
            value={editName}
            onSave={handleNameChange}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            textStyle={styles.itemName}
            inputStyle={styles.itemNameInput}
            placeholder="Item name"
            onSubmitEditing={handleNameSubmit}
            autoFocus={false}
          />
        </View>
        
        <View style={styles.quantityUnitContainer}>
          <InlineEdit
            value={editQuantity}
            onSave={handleQuantityChange}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            textStyle={styles.itemQuantity}
            inputStyle={styles.quantityInput}
            keyboardType="numeric"
            placeholder="1"
            onSubmitEditing={handleQuantitySubmit}
            autoFocus={isEditing} // Focus on quantity when editing starts
          />
          
          <Text style={styles.unitSeparator}>{isEditing ? '' : ' '}</Text>
          
          <InlineEdit
            value={editUnit}
            onSave={handleUnitChange}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            textStyle={styles.itemQuantity}
            inputStyle={styles.unitInput}
            placeholder="pc"
            onSubmitEditing={handleUnitSubmit}
            autoFocus={false}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={handleStartEditing}
      >
        <Edit2 size={18} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
      >
        <Trash2 size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  draggingItem: {
    opacity: 0.7,
    backgroundColor: colors.gray100,
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  itemContent: {
    flex: 1,
  },
  itemNameContainer: {
    flexDirection: 'row',
  },
  quantityUnitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  itemNameInput: {
    width: '100%',
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.gray500,
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
  },
  unitInput: {
    width: 60,
  },
  unitSeparator: {
    fontSize: 14,
    color: colors.gray500,
    marginHorizontal: 2,
  },
  dragHandle: {
    marginRight: 12,
    justifyContent: 'center',
    width: 30,
    height: 30,
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
});
