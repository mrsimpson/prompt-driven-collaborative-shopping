import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  DndContext, 
  closestCenter,
  TouchSensor,
  PointerSensor,
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface SortableListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  keyExtractor: (item: T) => string;
  onReorder?: (newItems: T[]) => void;
  contentContainerStyle?: any;
}

export function SortableList<T>({
  items,
  renderItem,
  keyExtractor,
  onReorder,
  contentContainerStyle,
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors optimized for touch devices
  const sensors = useSensors(
    // Primary touch sensor with a small delay to distinguish from taps
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      }
    }),
    // Pointer sensor as fallback for desktop/web
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => keyExtractor(item) === active.id);
      const newIndex = items.findIndex(item => keyExtractor(item) === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        if (onReorder) {
          onReorder(newItems);
        }
      }
    }
    
    setActiveId(null);
  };

  return (
    <View style={[styles.container, contentContainerStyle]}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={items.map(keyExtractor)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <View key={keyExtractor(item)}>
              {renderItem(item, index, keyExtractor(item) === activeId)}
            </View>
          ))}
        </SortableContext>
      </DndContext>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
