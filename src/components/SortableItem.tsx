import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform ? {
      x: transform.x,
      y: transform.y,
      scaleX: 1,
      scaleY: 1,
    } : {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
    }),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 999 : 1,
  };

  // Use a type assertion to handle the ref type mismatch between React Native and Web
  const setRef = (node: any) => {
    setNodeRef(node);
  };

  return (
    <View 
      ref={setRef} 
      style={[styles.container, style]}
    >
      {React.cloneElement(children as React.ReactElement, {
        // Use a type assertion to avoid the TypeScript error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(({ dragHandleProps: { ...attributes, ...listeners } } as any)),
        isDragging,
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
});
