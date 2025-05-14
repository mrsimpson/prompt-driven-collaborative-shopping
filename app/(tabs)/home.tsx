import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import {
  ShoppingCart,
  ListPlus,
  ShoppingBag,
  AlertCircle,
} from "lucide-react-native";
import { useAuth } from "@/src/contexts/AuthContext";
import { useShoppingLists } from "@/src/hooks/useShoppingLists";
import { useListItems } from "@/src/hooks/useListItems";
import { ShoppingList } from "@/src/types/models";

// Maximum number of recent lists to show on the home screen
const MAX_RECENT_LISTS = 3;

// Define a type for shopping lists with item counts
type ShoppingListWithItemCount = ShoppingList & { itemCount: number };

export default function HomeScreen() {
  const { isLocalMode } = useAuth();
  const {
    lists,
    loading: listsLoading,
    error: listsError,
    refreshLists,
  } = useShoppingLists();
  const { getListItemsCount } = useListItems();
  const [recentLists, setRecentLists] = useState<ShoppingListWithItemCount[]>([]);
  const [loadingItemCounts, setLoadingItemCounts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load item counts for each list
  useEffect(() => {
    const loadItemCounts = async () => {
      if (lists.length === 0) return;

      setLoadingItemCounts(true);
      try {
        const listsWithCounts = await Promise.all(
          // Sort by last modified date and take only the most recent ones
          [...lists]
            .sort((a, b) => {
              const dateA = a.lastModifiedAt
                ? new Date(a.lastModifiedAt).getTime()
                : 0;
              const dateB = b.lastModifiedAt
                ? new Date(b.lastModifiedAt).getTime()
                : 0;
              return dateB - dateA; // Most recent first
            })
            .slice(0, MAX_RECENT_LISTS)
            .map(async (list) => {
              const count = await getListItemsCount(list.id);
              return { ...list, itemCount: count } as ShoppingListWithItemCount;
            }),
        );

        setRecentLists(listsWithCounts);
      } catch (error) {
        console.error("Error loading item counts:", error);
      } finally {
        setLoadingItemCounts(false);
      }
    };

    loadItemCounts();
  }, [lists, getListItemsCount]);

  // Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLists();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.heading}>Shopping Companion</Text>
          <Text style={styles.subheading}>
            Create and manage shopping lists, then use shopping mode to
            efficiently shop for multiple lists at once.
          </Text>

          {isLocalMode && (
            <View style={styles.localModeCard}>
              <Text style={styles.localModeTitle}>
                You&apos;re in Local Mode
              </Text>
              <Text style={styles.localModeText}>
                Your data is stored only on this device. Sign in to sync across
                devices.
              </Text>
              <Link href="/profile" asChild>
                <TouchableOpacity style={styles.signInButton}>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Link href="/lists/new" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <ListPlus size={24} color="#3B82F6" />
                <Text style={styles.actionButtonText}>New List</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/shopping" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <ShoppingBag size={24} color="#3B82F6" />
                <Text style={styles.actionButtonText}>Go Shopping</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Lists</Text>
            <Link href="/lists" asChild>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {listsLoading || loadingItemCounts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading lists...</Text>
            </View>
          ) : listsError ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={24} color="#EF4444" />
              <Text style={styles.errorText}>
                Error loading lists. Please try again.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRefresh}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : recentLists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                You don&apos;t have any shopping lists yet.
              </Text>
              <Link href="/lists/new" asChild>
                <TouchableOpacity style={styles.createListButton}>
                  <Text style={styles.createListButtonText}>
                    Create Your First List
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            recentLists.map((list) => (
              <Link key={list.id} href={`/lists/${list.id}`} asChild>
                <TouchableOpacity style={styles.listItem}>
                  <ShoppingCart
                    size={20}
                    color="#6B7280"
                    style={styles.listIcon}
                  />
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>{list.name}</Text>
                    <Text style={styles.listCount}>{list.itemCount} items</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 24,
    lineHeight: 24,
  },
  localModeCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  localModeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  localModeText: {
    fontSize: 14,
    color: "#92400E",
    marginBottom: 12,
  },
  signInButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  listIcon: {
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  listCount: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
    color: "#B91C1C",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#EF4444",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyText: {
    marginBottom: 16,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  createListButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  createListButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
