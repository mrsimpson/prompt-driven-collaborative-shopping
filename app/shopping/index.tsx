import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
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

// Mock data - will be replaced with actual data from Dexie.js
const MOCK_LISTS = [
  { id: "1", name: "Grocery List", itemCount: 5, selected: false },
  { id: "2", name: "Hardware Store", itemCount: 3, selected: false },
  { id: "3", name: "Birthday Party", itemCount: 8, selected: false },
];

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
};

export default function ShoppingModeScreen() {
  const [lists, setLists] = useState(MOCK_LISTS);

  const toggleListSelection = (id: string) => {
    setLists(
      lists.map((list) =>
        list.id === id ? { ...list, selected: !list.selected } : list,
      ),
    );
  };

  const startShopping = () => {
    const selectedLists = lists.filter((list) => list.selected);
    if (selectedLists.length === 0) {
      // Show error - would use a proper alert/toast in a real implementation
      console.log("Please select at least one list");
      return;
    }

    // In a real implementation, this would create a shopping session
    // with the selected lists using our ShoppingSessionService
    console.log(
      "Starting shopping with lists:",
      selectedLists.map((l) => l.id),
    );

    // Navigate to the shopping session screen
    router.push("/shopping/session");
  };

  return (
    <View style={layout.container}>
      <HeaderWithBack title="Shopping Mode" backTo="/" backTitle="Home" />

      <View style={layout.content}>
        <Text style={typography.subtitle}>Select lists to shop with:</Text>

        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[cards.basic, item.selected && cards.selected]}
              onPress={() => toggleListSelection(item.id)}
            >
              <View style={layout.spaceBetween}>
                <View style={styles.listInfo}>
                  <Text
                    style={[
                      styles.listName,
                      item.selected && styles.listNameSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.listCount,
                      item.selected && styles.listCountSelected,
                    ]}
                  >
                    {item.itemCount} items
                  </Text>
                </View>
                <View
                  style={[
                    checkboxes.base,
                    item.selected ? checkboxes.checked : checkboxes.unchecked,
                  ]}
                />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ flexGrow: 1 }}
        />

        <TouchableOpacity
          style={[
            buttons.primary,
            !lists.some((l) => l.selected) && buttons.primaryDisabled,
          ]}
          onPress={startShopping}
          disabled={!lists.some((l) => l.selected)}
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
