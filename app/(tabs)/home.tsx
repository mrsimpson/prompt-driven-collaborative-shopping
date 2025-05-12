import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from 'expo-router';
import { ShoppingCart, ListPlus, ShoppingBag } from 'lucide-react-native';
import { useAuth } from '@/src/contexts/AuthContext';

// Mock data - will be replaced with actual data from Dexie.js
const MOCK_LISTS = [
  { id: '1', name: 'Grocery List', itemCount: 5 },
  { id: '2', name: 'Hardware Store', itemCount: 3 },
];

export default function HomeScreen() {
  const { isLocalMode } = useAuth();
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.heading}>Shopping Companion</Text>
          <Text style={styles.subheading}>
            Create and manage shopping lists, then use shopping mode to efficiently shop for multiple lists at once.
          </Text>
          
          {isLocalMode && (
            <View style={styles.localModeCard}>
              <Text style={styles.localModeTitle}>You&apos;re in Local Mode</Text>
              <Text style={styles.localModeText}>
                Your data is stored only on this device. Sign in to sync across devices.
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
          
          {MOCK_LISTS.map(list => (
            <Link key={list.id} href={`/lists/${list.id}`} asChild>
              <TouchableOpacity style={styles.listItem}>
                <ShoppingCart size={20} color="#6B7280" style={styles.listIcon} />
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{list.name}</Text>
                  <Text style={styles.listCount}>{list.itemCount} items</Text>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
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
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  localModeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  localModeText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 12,
  },
  signInButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listIcon: {
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  listCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});
