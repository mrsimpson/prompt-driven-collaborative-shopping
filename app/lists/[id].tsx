import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Plus, ShoppingBag, Edit, Trash2 } from "lucide-react-native";
import { HeaderWithBack } from "@/src/components/HeaderWithBack";
import { layout, colors, buttons, typography } from "@/src/styles/common";
import { useListItems, useShoppingLists } from "@/src/hooks";
import { ListItem } from "@/src/types/models";
import { ShoppingListItem } from "@/src/components/ShoppingListItem";
import { SortableList } from "@/src/components/SortableList";
import { SortableItem } from "@/src/components/SortableItem";
import { CrossPlatformAlert } from "@/src/components/CrossPlatformAlert";

// Helper function to detect if we're on mobile
const isMobile = () => {
  if (Platform.OS !== "web") return true;

  // Check if window and navigator exist (they should in web environment)
  if (typeof window !== "undefined" && window.navigator) {
    const userAgent = window.navigator.userAgent || "";
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );
  }

  // Fallback to screen size check
  const windowWidth = Dimensions.get("window").width;
  return windowWidth < 768; // Common breakpoint for mobile devices
};

const styles = {
  addItemForm: {
    flexDirection: "row" as const,
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  itemNameInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 6,
    padding: 12,
    marginRight: 8,
  },
  quantityContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  quantityInput: {
    width: 40,
    backgroundColor: colors.gray100,
    borderRadius: 6,
    padding: 12,
    textAlign: "center" as const,
    marginRight: 4,
  },
  unitInput: {
    width: 40, // Narrower width for unit input
    backgroundColor: colors.gray100,
    borderRadius: 6,
    padding: 12,
    textAlign: "center" as const,
    marginRight: 8,
  },
  footer: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 16,
  },
  errorText: {
    color: colors.danger,
    textAlign: "center" as const,
    marginBottom: 16,
  },
  listContent: {
    padding: isMobile() ? 4 : 16,
    paddingBottom: 80, // Extra padding for the footer
  },
  listContainer: {
    flex: 1,
    padding: isMobile() ? 8 : 16,
    paddingBottom: 80, // Extra padding for the footer
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
};

export default function ListDetailScreen() {
  // Get the list ID from the URL parameters
  const params = useLocalSearchParams();
  const listId = typeof params.id === "string" ? params.id : "";

  const {
    lists,
    loading: listsLoading,
    error: listsError,
    deleteList,
  } = useShoppingLists();
  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
  } = useListItems(listId);

  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [localItems, setLocalItems] = useState<ListItem[]>([]);

  const nameInputRef = useRef<TextInput>(null);

  // Update local items when items from the hook change
  useEffect(() => {
    setLocalItems([...items]);
  }, [items]);

  // Find the current list from our lists
  const currentList = lists.find((list) => list.id === listId);

  // Handle loading state
  if (listsLoading || itemsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { marginTop: 16 }]}>
          Loading list...
        </Text>
      </View>
    );
  }

  // Handle error state
  if (listsError || itemsError || !currentList) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {listsError?.message || itemsError?.message || "List not found"}
        </Text>
        <TouchableOpacity
          style={buttons.secondary}
          onPress={() => router.replace("/lists")}
        >
          <Text style={typography.buttonTextSecondary}>Back to Lists</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    try {
      setIsAddingItem(true);

      const quantity = parseInt(newItemQuantity, 10) || 1;
      const unit = newItemUnit.trim() || "pc";

      await addItem({
        name: newItemName,
        quantity,
        unit,
        isPurchased: false,
      });

      // Clear the form
      setNewItemName("");
      setNewItemQuantity("1");
      setNewItemUnit("");

      // Focus back on the name input for quick entry of multiple items
      nameInputRef.current?.focus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add item";
      CrossPlatformAlert.show("Error", errorMessage);
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleUpdateItem = async (
    itemId: string,
    updates: Partial<ListItem>,
  ) => {
    try {
      // Log the updates to verify they're correct
      console.log("Updating item:", itemId, updates);

      await updateItem(itemId, updates);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update item";
      CrossPlatformAlert.show("Error", errorMessage);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete item";
      CrossPlatformAlert.show("Error", errorMessage);
    }
  };

  const handleReorderItems = async (newItems: ListItem[]) => {
    setLocalItems(newItems);

    // Persist the new order
    const newOrder = newItems.map((item) => item.id);
    try {
      await reorderItems(newOrder);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reorder items";
      CrossPlatformAlert.show("Error", errorMessage);

      // Revert to original order on error
      setLocalItems([...items]);
    }
  };

  const renderSortableItem = (
    item: ListItem,
    index: number,
    isDragging: boolean,
  ) => {
    return (
      <SortableItem id={item.id}>
        <ShoppingListItem
          item={item}
          onUpdate={handleUpdateItem}
          onDelete={handleDeleteItem}
          isDragging={isDragging}
          mode="edit"
        />
      </SortableItem>
    );
  };

  const startShoppingWithThisList = () => {
    router.push({
      pathname: "/shopping/session",
      params: { listIds: listId },
    });
  };

  return (
    <KeyboardAvoidingView
      style={layout.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <HeaderWithBack
        title={currentList.name}
        backTo="/lists"
        backTitle="My Lists"
        rightElement={
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={[buttons.iconSecondary, { marginRight: 8 }]}
              onPress={() => router.push(`/lists/edit/${listId}`)}
            >
              <Edit size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={buttons.iconDanger}
              onPress={() => {
                CrossPlatformAlert.confirm(
                  "Delete List",
                  "Are you sure you want to delete this list? This action cannot be undone.",
                  async () => {
                    try {
                      await deleteList(listId);
                      router.replace("/lists");
                    } catch (error) {
                      const errorMessage =
                        error instanceof Error
                          ? error.message
                          : "Failed to delete list";
                      CrossPlatformAlert.show("Error", errorMessage);
                    }
                  }
                );
              }}
            >
              <Trash2 size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.addItemForm}>
        <TextInput
          ref={nameInputRef}
          style={styles.itemNameInput}
          value={newItemName}
          onChangeText={setNewItemName}
          placeholder="Add new item..."
          editable={!isAddingItem}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
        />
        <View style={styles.quantityContainer}>
          <TextInput
            style={styles.quantityInput}
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            keyboardType="numeric"
            editable={!isAddingItem}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
          />
          <TextInput
            style={styles.unitInput}
            value={newItemUnit}
            onChangeText={setNewItemUnit}
            placeholder="pc"
            editable={!isAddingItem}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
          />
        </View>
        <TouchableOpacity
          style={[buttons.icon, isAddingItem && buttons.primaryDisabled]}
          onPress={handleAddItem}
          disabled={isAddingItem || !newItemName.trim()}
        >
          {isAddingItem ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Plus size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {localItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={typography.body}>This list is empty.</Text>
          <Text style={[typography.bodySmall, { marginTop: 8 }]}>
            Add items using the form above.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <SortableList
            items={localItems}
            renderItem={renderSortableItem}
            keyExtractor={(item) => item.id}
            onReorder={handleReorderItems}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={buttons.primary}
          onPress={startShoppingWithThisList}
        >
          <View style={buttons.iconText}>
            <ShoppingBag
              size={20}
              color={colors.white}
              style={styles.buttonIcon}
            />
            <Text style={typography.buttonText}>Shop with this list</Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
