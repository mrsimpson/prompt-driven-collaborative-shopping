import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { headers, typography } from '@/src/styles/common';

interface HeaderWithBackProps {
  title: string;
  backTo?: string;
  backTitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const HeaderWithBack: React.FC<HeaderWithBackProps> = ({
  title,
  backTo,
  backTitle,
  onBack,
  rightElement,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      router.push(backTo);
    } else {
      router.back();
    }
  };

  return (
    <View style={headers.container}>
      <TouchableOpacity style={headers.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color="#111827" />
        {backTitle && <Text style={headers.backButtonText}>{backTitle}</Text>}
      </TouchableOpacity>
      
      <View style={headers.titleContainer}>
        <Text style={typography.title}>{title}</Text>
      </View>
      
      {rightElement ? (
        rightElement
      ) : (
        <View style={headers.rightPlaceholder} />
      )}
    </View>
  );
};
