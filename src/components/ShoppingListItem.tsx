import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert, Platform, Dimensions } from 'react-native';
import { Edit2, Trash2, GripVertical } from 'lucide-react-native';
import { colors } from '@/src/styles/common';
import { ListItem} from '@/src/types/models';
import { InlineEdit } from './InlineEdit';
import { Swipeable, RectButton } from 'react-native-gesture-handler';

// Helper function to detect if we're on mobile web
const isMobileWeb = () => {
  if (Platform.OS !== 'web') return false;
  
  // Check if window and navigator exist (they should in web environment)
  if (typeof window !== 'undefined' && window.navigator) {
    const userAgent = window.navigator.userAgent || '';
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }
  
  // Fallback to screen size check
  const windowWidth = Dimensions.get('window').width;
  return windowWidth < 768; // Common breakpoint for mobile devices
};

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
  const swipeableRef = useRef<Swipeable>(null);

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

  const handleDelete = async () => {
    try {
      await onDelete(item.id);
      // Close the swipeable after deletion
      swipeableRef.current?.close();
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item");
    }
  };

  // Determine if we should show quantity and unit (only when quantity > 1)
  const showQuantityAndUnit = isEditing || item.quantity > 1;

  // Render the delete action for swipe
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    
    const opacity = dragX.interpolate({
      inputRange: [-80, -60, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <RectButton style={styles.deleteAction} onPress={handleDelete}>
        <Animated.View 
          style={[
            styles.deleteActionContent,
            {
              transform: [{ translateX: trans }],
              opacity,
            },
          ]}
        >
          <Trash2 size={20} color={colors.white} />
          <Text style={styles.deleteActionText}>Delete</Text>
        </Animated.View>
      </RectButton>
    );
  };

  // Don't enable swipe when in editing mode or when dragging
  const enableSwipe = !isEditing && !isDragging;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      enabled={enableSwipe}
    >
      <View style={[
        styles.itemRow, 
        isDragging && styles.draggingItem
      ]}>
        <TouchableOpacity 
          style={styles.dragHandle}
          {...dragHandleProps}
        >
          <GripVertical size={16} color={colors.gray400} />
        </TouchableOpacity>
        
        <View style={styles.itemContent}>
          <View style={styles.contentRow}>
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
            
            {showQuantityAndUnit && (
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
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={handleStartEditing}
        >
          <Edit2 size={16} color={colors.primary} />
        </TouchableOpacity>

        {/* Only show delete button on desktop */}
        {Platform.OS === 'web' && !isMobileWeb() && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Trash2 size={16} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: Platform.OS === 'web' && !isMobileWeb() ? 10 : 8, // Less padding on mobile
    borderRadius: 8,
    marginBottom: Platform.OS === 'web' && !isMobileWeb() ? 6 : 3, // Less margin on mobile
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityUnitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginRight:16,
  },
  itemName: {
    fontSize: 15, // Slightly smaller font
    fontWeight: '500',
    color: colors.black,
    flex: 1,
  },
  itemNameInput: {
    flex: 1,
    minWidth: 100,
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
    width: 40,
    textAlign: 'center',
  },
  unitSeparator: {
    fontSize: 14,
    color: colors.gray500,
    marginHorizontal: 2,
  },
  dragHandle: {
    marginRight: 8, // Reduced margin
    justifyContent: 'center',
    width: 24, // Smaller width
    height: 24, // Smaller height
    alignItems: 'center',
  },
  deleteButton: {
    padding: 6, // Smaller padding
  },
  editButton: {
    padding: 6, // Smaller padding
    marginRight: 4, // Reduced margin
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 80,
    borderRadius: 8,
    marginBottom: Platform.OS === 'web' && !isMobileWeb() ? 6 : 3, // Match the item margin
  },
  deleteActionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    flexDirection: 'row',
  },
  deleteActionText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
});
