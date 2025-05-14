import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Platform,
} from "react-native";
import { Edit2, Trash2, GripVertical, Check } from "lucide-react-native";
import { colors } from "@/src/styles/common";
import { ListItem } from "@/src/types/models";
import { InlineEdit } from "./InlineEdit";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { isMobile, isMobileWeb } from "../utils/isMobile";

interface ShoppingListItemProps {
  item: ListItem;
  onUpdate: (id: string, updates: Partial<ListItem>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  // Define the expected props from SortableItem
  mode?: "edit" | "shopping";
  sourceListName?: string;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  onUpdate,
  onDelete,
  isDragging = false,
  mode = "edit",
  sourceListName,
  dragHandleProps,
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

  const handleSaveAll = async (
    name = editName,
    quantity = editQuantity,
    unit = editUnit,
  ) => {
    try {
      // Parse quantity
      const currentQuantity = parseInt(quantity, 10) || 1;
      const currentUnit = unit || "pc";

      console.log("Saving item with values:", {
        name,
        quantity: currentQuantity,
        unit: currentUnit,
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
    if (!onDelete) return;

    try {
      await onDelete(item.id);
      // Close the swipeable after deletion
      swipeableRef.current?.close();
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const handleTogglePurchased = async () => {
    if (!item.id) return;

    try {
      await onUpdate(item.id, { isPurchased: !item.isPurchased });
    } catch (error) {
      console.error("Error toggling purchased status:", error);
      Alert.alert("Error", "Failed to update item");
    }
  };

  // Determine if we should show quantity and unit (only when quantity > 1)
  const showQuantityAndUnit = isEditing || item.quantity > 1;

  // Render the delete action for swipe
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: "clamp",
    });

    const opacity = dragX.interpolate({
      inputRange: [-80, -60, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: "clamp",
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

  // Don't enable swipe when in editing mode or when dragging or in shopping mode
  const enableSwipe =
    !isEditing && !isDragging && mode === "edit" && onDelete !== undefined;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      enabled={enableSwipe}
    >
      <View
        style={[
          styles.itemRow,
          isDragging && styles.draggingItem,
          item.isPurchased && styles.itemRowPurchased,
        ]}
      >
        {/* Show drag handle in edit mode, checkbox in shopping mode */}
        {mode === "edit" ? (
          <View style={styles.dragHandle}>
            <TouchableOpacity {...dragHandleProps}>
              <GripVertical size={16} color={colors.gray400} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.checkbox,
              item.isPurchased && styles.checkboxChecked,
            ]}
            onPress={handleTogglePurchased}
          >
            {item.isPurchased && <Check size={16} color="#FFFFFF" />}
          </TouchableOpacity>
        )}

        <View style={styles.itemContent}>
          <View style={styles.contentRow}>
            {mode === "edit" ? (
              <InlineEdit
                value={editName}
                onSave={handleNameChange}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                textStyle={
                  item.isPurchased ? styles.itemPurchased : styles.itemName
                }
                placeholder="Item name"
                onSubmitEditing={handleNameSubmit}
                autoFocus={false}
              />
            ) : (
              <Text
                style={[
                  styles.itemName,
                  item.isPurchased && styles.itemPurchased,
                ]}
              >
                {item.name}
              </Text>
            )}

            {showQuantityAndUnit && (
              <View style={styles.quantityUnitContainer}>
                {mode === "edit" ? (
                  <>
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

                    <Text style={styles.unitSeparator}>
                      {isEditing ? "" : " "}
                    </Text>

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
                  </>
                ) : (
                  <Text style={styles.itemQuantity}>
                    {item.quantity} {item.unit}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Show source list name in shopping mode */}
          {mode === "shopping" && sourceListName && (
            <Text style={styles.itemSource}>From: {sourceListName}</Text>
          )}
        </View>

        {/* Only show edit button in edit mode */}
        {mode === "edit" && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleStartEditing}
          >
            <Edit2 size={16} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Only show delete button on desktop in edit mode */}
        {mode === "edit" &&
          Platform.OS === "web" &&
          !isMobileWeb() &&
          onDelete && (
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: isMobile() ? 8 : 10, // Less padding on mobile
    borderRadius: 8,
    marginBottom: isMobile() ? 3 : 6, // Less margin on mobile
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  itemRowPurchased: {
    backgroundColor: colors.gray100,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityUnitContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    marginRight: 16,
  },
  itemName: {
    fontSize: 15, // Slightly smaller font
    fontWeight: "500",
    color: colors.black,
    flex: 1,
  },
  itemPurchased: {
    textDecorationLine: "line-through",
    color: colors.gray400,
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
    textAlign: "center",
  },
  unitInput: {
    width: 40,
    textAlign: "center",
  },
  unitSeparator: {
    fontSize: 14,
    color: colors.gray500,
    marginHorizontal: 2,
  },
  dragHandle: {
    marginRight: 8, // Reduced margin
    justifyContent: "center",
    width: 24, // Smaller width
    height: 24, // Smaller height
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
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
    justifyContent: "center",
    alignItems: "flex-end",
    width: 80,
    borderRadius: 8,
    marginBottom: isMobile() ? 3 : 6, // Match the item margin
  },
  deleteActionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    flexDirection: "row",
  },
  deleteActionText: {
    color: colors.white,
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 4,
  },
  itemSource: {
    fontSize: 12,
    color: colors.gray400,
    marginTop: 4,
  },
});
