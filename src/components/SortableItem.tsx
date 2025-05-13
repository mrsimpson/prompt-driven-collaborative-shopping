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
    position: 'relative',
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <View 
      ref={setNodeRef} 
      style={[styles.container, style]}
    >
      {React.cloneElement(children as React.ReactElement, {
        dragHandleProps: { ...attributes, ...listeners },
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
