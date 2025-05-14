import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import { HeaderWithBack } from "@/src/components/HeaderWithBack";
import {
  layout,
  cards,
  typography,
  buttons,
  colors,
  checkboxes,
} from "@/src/styles/common";
import { useShoppingLists, useListItems } from "@/src/hooks";
import { CrossPlatformAlert } from "@/src/components/CrossPlatformAlert";

const styles = {
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.black,
    marginBottom: 4,
  },
  listNameSelected: {
    color: colors.primaryDark,
  },
  listCount: {
    fontSize: 14,
    color: colors.gray500,
  },
  listCountSelected: {
    color: colors.primary,
  },
  buttonIcon: {
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: "center",
    marginBottom: 20,
  },
};

export default function ShoppingModeScreen() {
  const { lists, loading: listsLoading, error: listsError, refreshLists } = useShoppingLists();
  const { getItemsForList } = useListItems();
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [listItemCounts, setListItemCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Load item counts for each list
  useEffect(() => {
    const fetchItemCounts = async () => {
      if (lists.length === 0) return;
      
      setLoadingCounts(true);
      const counts: Record<string, number> = {};
      
      try {
        for (const list of lists) {
          const result = await getItemsForList(list.id);
          if (result.success) {
            // Only count non-purchased items
            counts[list.id] = result.data.filter(item => !item.isPurchased).length;
          }
        }
        setListItemCounts(counts);
      } catch (error) {
        console.error("Error fetching item counts:", error);
      } finally {
        setLoadingCounts(false);
      }
    };
    
    fetchItemCounts();
  }, [lists, getItemsForList]);

  const toggleListSelection = (id: string) => {
    setSelectedLists(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const startShopping = () => {
    if (selectedLists.size === 0) {
      CrossPlatformAlert.show(
        "No Lists Selected",
        "Please select at least one list to shop with."
      );
      return;
    }

    // Check if any selected list has no items
    const emptyLists = Array.from(selectedLists).filter(
      listId => listItemCounts[listId] === 0
    );

    if (emptyLists.length > 0) {
      // If there are empty lists, show a warning
      CrossPlatformAlert.show(
        "Empty Lists Selected",
        "Some of your selected lists have no items. Do you want to continue?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            onPress: () => navigateToShoppingSession(),
          },
        ]
      );
    } else {
      // If all lists have items, proceed directly
      navigateToShoppingSession();
    }
  };

  const navigateToShoppingSession = () => {
    const listIdsParam = Array.from(selectedLists).join(",");
    router.push(`/shopping/session?listIds=${listIdsParam}`);
  };

  return (
    <View style={layout.container}>
      <HeaderWithBack title="Shopping Mode" backTo="/" backTitle="Home" />

      <View style={layout.content}>
        <Text style={typography.subtitle}>Select lists to shop with:</Text>

        {listsLoading || loadingCounts ? (
          <View style={[layout.center, { flex: 1 }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.body, { marginTop: 16 }]}>
              Loading your shopping lists...
            </Text>
          </View>
        ) : listsError ? (
          <View style={[layout.center, { flex: 1 }]}>
            <Text style={[typography.body, { color: colors.danger }]}>
              {listsError.message || "Failed to load shopping lists"}
            </Text>
            <TouchableOpacity
              style={[buttons.secondary, { marginTop: 16 }]}
              onPress={() => refreshLists()}
            >
              <Text style={typography.buttonTextSecondary}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : lists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You don't have any shopping lists yet. Create a list to start shopping.
            </Text>
            <TouchableOpacity
              style={buttons.primary}
              onPress={() => router.push("/lists/new")}
            >
              <Text style={typography.buttonText}>Create a List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[cards.basic, selectedLists.has(item.id) && cards.selected]}
                onPress={() => toggleListSelection(item.id)}
              >
                <View style={layout.spaceBetween}>
                  <View style={styles.listInfo}>
                    <Text
                      style={[
                        styles.listName,
                        selectedLists.has(item.id) && styles.listNameSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.listCount,
                        selectedLists.has(item.id) && styles.listCountSelected,
                      ]}
                    >
                      {listItemCounts[item.id] || 0} items
                    </Text>
                  </View>
                  <View
                    style={[
                      checkboxes.base,
                      selectedLists.has(item.id) ? checkboxes.checked : checkboxes.unchecked,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        )}

        <TouchableOpacity
          style={[
            buttons.primary,
            selectedLists.size === 0 && buttons.primaryDisabled,
          ]}
          onPress={startShopping}
          disabled={selectedLists.size === 0}
        >
          <View style={buttons.iconText}>
            <ShoppingCart
              size={20}
              color={colors.white}
              style={styles.buttonIcon}
            />
            <Text style={typography.buttonText}>Start Shopping</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
