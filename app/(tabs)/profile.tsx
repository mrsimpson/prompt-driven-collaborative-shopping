import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { layout, typography, colors, buttons, forms } from '@/src/styles/common';
import { useAuth } from '@/src/contexts/AuthContext';
import { useUser } from '@/src/hooks';

export default function ProfileScreen() {
  const { isAuthenticated, isLocalMode, login, logout } = useAuth();
  const { user, loading, error, updateProfile } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      await updateProfile({
        username,
        email
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await login(loginEmail, loginPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log in';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log out';
      Alert.alert('Error', errorMessage);
    }
  };
  
  if (loading) {
    return (
      <View style={[layout.container, layout.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { marginTop: 16 }]}>Loading profile...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[layout.container, layout.centered]}>
        <Text style={[typography.body, { color: colors.danger, marginBottom: 16 }]}>
          {error.message || 'Failed to load profile'}
        </Text>
        <TouchableOpacity 
          style={buttons.secondary}
          onPress={() => window.location.reload()}
        >
          <Text style={typography.buttonTextSecondary}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={layout.container}>
      <View style={styles.header}>
        <Text style={typography.title}>Profile</Text>
        {isLocalMode && (
          <View style={styles.localModeBadge}>
            <Text style={styles.localModeText}>Local Mode</Text>
          </View>
        )}
      </View>
      
      {user ? (
        <View style={styles.profileContainer}>
          {isEditing ? (
            // Edit mode
            <View style={styles.editForm}>
              <Text style={forms.label}>Username</Text>
              <TextInput
                style={forms.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                editable={!isSubmitting}
              />
              
              <Text style={forms.label}>Email</Text>
              <TextInput
                style={forms.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                keyboardType="email-address"
                editable={!isSubmitting}
              />
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[buttons.secondary, styles.buttonHalf]}
                  onPress={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  <Text style={typography.buttonTextSecondary}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[buttons.primary, styles.buttonHalf, isSubmitting && buttons.primaryDisabled]}
                  onPress={handleUpdateProfile}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={typography.buttonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // View mode
            <View>
              <View style={styles.profileField}>
                <Text style={styles.fieldLabel}>Username</Text>
                <Text style={styles.fieldValue}>{user.username}</Text>
              </View>
              
              <View style={styles.profileField}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldValue}>{user.email}</Text>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[buttons.secondary, styles.buttonHalf]}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={typography.buttonTextSecondary}>Edit Profile</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[buttons.danger, styles.buttonHalf]}
                  onPress={handleLogout}
                >
                  <Text style={typography.buttonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        // Login form
        <View style={styles.loginContainer}>
          <Text style={typography.subtitle}>Login to Your Account</Text>
          
          <Text style={forms.label}>Email</Text>
          <TextInput
            style={forms.input}
            value={loginEmail}
            onChangeText={setLoginEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            editable={!isLoggingIn}
          />
          
          <Text style={forms.label}>Password</Text>
          <TextInput
            style={forms.input}
            value={loginPassword}
            onChangeText={setLoginPassword}
            placeholder="Enter your password"
            secureTextEntry
            editable={!isLoggingIn}
          />
          
          <TouchableOpacity 
            style={[
              buttons.primary, 
              { marginTop: 16 },
              isLoggingIn && buttons.primaryDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoggingIn || !loginEmail || !loginPassword}
          >
            {isLoggingIn ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={typography.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.localModeInfo}>
            You are currently in local mode. All data is stored only on your device.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  localModeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  localModeText: {
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: 12,
  },
  profileContainer: {
    padding: 16,
  },
  profileField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: colors.black,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  buttonHalf: {
    flex: 0.48,
  },
  editForm: {
    marginBottom: 16,
  },
  loginContainer: {
    padding: 16,
  },
  localModeInfo: {
    marginTop: 24,
    textAlign: 'center',
    color: colors.gray500,
    fontSize: 14,
  },
});
