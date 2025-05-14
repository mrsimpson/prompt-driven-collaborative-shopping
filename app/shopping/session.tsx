import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import { HeaderWithBack } from "@/src/components/HeaderWithBack";
import { colors, layout, typography, buttons } from "@/src/styles/common";
import { useShoppingSession } from "@/src/hooks";
import { ShoppingSessionStatus } from "@/src/types/models";
import { CrossPlatformAlert } from "@/src/components/CrossPlatformAlert";
import { ShoppingListItem } from "@/src/components/ShoppingListItem";
import { isMobile } from "@/src/utils/isMobile";

export default function ShoppingSessionScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  // Use useMemo to prevent the listIds array from being recreated on every render
  const listIds = useMemo(() => {
    return params.listIds ? String(params.listIds).split(",") : [];
  }, [params.listIds]);

  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [activeListFilter, setActiveListFilter] = useState<string | null>(null);

  const {
    session,
    lists,
    items,
    loading,
    error,
    createSession,
    markItemAsPurchased,
    endSession,
    cancelSession,
  } = useShoppingSession();
  
  // Filter items based on the active list filter
  const filteredItems = useMemo(() => {
    if (!activeListFilter) return items.sort((a, b) => a.sortOrder - b.sortOrder);
    return items
      .filter(item => item.listId === activeListFilter)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [items, activeListFilter]);

  // Create a new shopping session when the component mounts
  useEffect(() => {
    if (listIds.length > 0 && !session) {
      createSession(listIds).catch((err) => {
        console.error("Failed to create shopping session:", err);
        CrossPlatformAlert.show(
          "Error",
          "Failed to create shopping session. Please try again.",
          [
            {
              text: "Go Back",
              onPress: () => router.back(),
            },
          ],
        );
      });
    }
  }, [listIds, createSession, session]);

  // Add a listener to end the session when navigating away
  useEffect(() => {
    // This function will be called when the screen is about to be unfocused/navigated away from
    const endSessionOnLeave = () => {
      if (session) {
        console.log("Canceling shopping session due to navigation away");
        cancelSession().catch((error) => {
          console.error(
            "Failed to cancel shopping session on navigation:",
            error,
          );
        });
      }
    };

    // Add the listener for navigation events
    const unsubscribe = navigation.addListener(
      "beforeRemove",
      endSessionOnLeave,
    );

    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, [session, cancelSession, navigation]);

  // Handle loading state
  if (loading) {
    return (
      <View style={[layout.container, layout.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { marginTop: 16 }]}>
          {session
            ? "Loading shopping items..."
            : "Creating shopping session..."}
        </Text>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={[layout.container, layout.center]}>
        <Text
          style={[typography.body, { color: colors.danger, marginBottom: 16 }]}
        >
          {error.message || "An error occurred during shopping"}
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

  // Handle case where no lists were selected
  if (listIds.length === 0) {
    return (
      <View style={[layout.container, layout.center]}>
        <Text style={typography.body}>No shopping lists selected</Text>
        <TouchableOpacity
          style={[buttons.primary, { marginTop: 16 }]}
          onPress={() => router.replace("/shopping")}
        >
          <Text style={typography.buttonText}>Select Lists</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleToggleItemPurchased = async (
    itemId: string,
    currentStatus: boolean,
  ) => {
    try {
      await markItemAsPurchased(itemId, !currentStatus);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update item";
      CrossPlatformAlert.show("Error", errorMessage);
    }
  };

  const handleGoToCheckout = () => {
    if (!items.some((item) => item.isPurchased)) {
      CrossPlatformAlert.show(
        "No Items Purchased",
        "You need to purchase at least one item to proceed to checkout.",
      );
      return;
    }
    setIsCheckoutMode(true);
  };

  const handleEndShopping = () => {
    if (!session || !lists || lists.length === 0) {
      console.error("No active session or lists to end");
      return;
    }

    // Get the first list to use its name and description for the new list
    const sourceList = lists[0];
    const newListName = `${sourceList.name}`;
    const newListDescription = `${sourceList.description}`;

    console.log("Showing end shopping confirmation...");

    // Use our cross-platform alert
    CrossPlatformAlert.destructiveConfirm(
      "End Shopping Session",
      "Are you sure you want to end this shopping session?",
      "End Session",
      () => {
        handleConfirmEndShopping(newListName, newListDescription);
      },
    );
  };

  const handleConfirmEndShopping = (
    newListName: string,
    newListDescription: string,
  ) => {
    if (!session) return;

    console.log("Ending shopping session...");
    endSession({
      sessionId: session.id,
      status: ShoppingSessionStatus.COMPLETED,
      createNewListForUnpurchased: true,
      newListName: newListName,
      newListDescription: newListDescription,
    })
      .then(() => {
        router.replace("/");
      })
      .catch((error) => {
        console.error("Failed to end shopping session:", error);
      });
  };

  // Checkout mode
  if (isCheckoutMode) {
    return (
      <View style={styles.container}>
        <HeaderWithBack
          title="Checkout"
          onBack={() => setIsCheckoutMode(false)}
          backTitle="Shopping"
        />

        <FlatList
          data={lists}
          keyExtractor={(list) => list.id}
          renderItem={({ item: list }) => {
            const listItems = items.filter(
              (item) => item.listId === list.id && item.isPurchased,
            );

            if (listItems.length === 0) return null;

            return (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>{list.name}</Text>
                {listItems.map((item) => (
                  <View key={item.id} style={styles.checkoutItem}>
                    <Text style={styles.checkoutItemName}>{item.name}</Text>
                    {item.quantity > 1 && (
                      <Text style={styles.checkoutItemQuantity}>
                        {item.quantity} {item.unit}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
        />

        <TouchableOpacity
          style={styles.endButton}
          onPress={() => {
            console.log("End button pressed");
            handleEndShopping();
          }}
        >
          <Text style={styles.endButtonText}>End Shopping Session</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Toggle list filter
  const toggleListFilter = (listId: string) => {
    if (activeListFilter === listId) {
      setActiveListFilter(null); // Clear filter if already active
    } else {
      setActiveListFilter(listId); // Set new filter
    }
  };

  return (
    <View style={styles.container}>
      <HeaderWithBack
        title="Shopping"
        backTo={listIds.length > 0 ? `/lists/${listIds[0]}` : "/shopping"}
        backTitle={listIds.length > 0 ? "Back to List" : "Select Lists"}
      />
      
      {lists.length > 1 && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by list:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {lists.map(list => (
              <TouchableOpacity
                key={list.id}
                style={[
                  styles.filterChip,
                  activeListFilter === list.id && styles.filterChipActive
                ]}
                onPress={() => toggleListFilter(list.id)}
              >
                <Text 
                  style={[
                    styles.filterChipText,
                    activeListFilter === list.id && styles.filterChipTextActive
                  ]}
                >
                  {list.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => {
          // Generate a stable ID for each item
          if (!item.id) {
            // If the item doesn't have an ID, create one from its properties
            return `${item.listId}-${item.name}-${item.quantity}-${item.unit}`;
          }
          return item.id;
        }}
        renderItem={({ item }) => {
          // Find the source list for this item
          const sourceList = lists.find((list) => list.id === item.listId);
          
          // Check if this item is aggregated from multiple lists
          const isAggregated = item.sources && item.sources.length > 1;
          
          // Get all source list names if the item is aggregated
          const sourceLists = isAggregated 
            ? item.sources?.map(source => {
                const list = lists.find(l => l.id === source.listId);
                return list?.name || "Unknown list";
              })
            : [];

          return (
            <ShoppingListItem
              item={item}
              onUpdate={async (id, updates) => {
                // For shopping mode, we only care about the isPurchased property
                if (updates.isPurchased !== undefined) {
                  await handleToggleItemPurchased(id, !updates.isPurchased);
                }
              }}
              mode="shopping"
              sourceListName={sourceList?.name}
              sourceLists={isAggregated ? sourceLists : undefined}
              highlightSource={isAggregated}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleGoToCheckout}
        >
          <View style={styles.buttonContainer}>
            <ShoppingBag size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.checkoutButtonText}>Go to Checkout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  listContent: {
    padding: isMobile() ? 4 : 16,
    paddingBottom: 80, // Extra padding for the footer
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: 16,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  checkoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  listSection: {
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 12,
    backgroundColor: colors.gray200,
    padding: 8,
    borderRadius: 4,
  },
  checkoutItem: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkoutItemName: {
    fontSize: 16,
    color: colors.black,
  },
  checkoutItemQuantity: {
    fontSize: 14,
    color: colors.gray500,
  },
  endButton: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: "center",
  },
  endButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  filterContainer: {
    backgroundColor: colors.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray700,
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: "row",
  },
  filterChip: {
    backgroundColor: colors.gray100,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.gray700,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: "500",
  },
});
