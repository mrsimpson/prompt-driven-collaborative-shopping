import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

// Define the expected props for the child component
interface ChildProps {
  isDragging?: boolean;
  // Instead of passing dragHandleProps directly, we'll pass individual props
  onMouseDown?: (event: any) => void;
  onTouchStart?: (event: any) => void;
  'aria-roledescription'?: string;
  role?: string;
  tabIndex?: number;
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

  // Define the style with proper types
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

  // Create a properly typed ref handler
  const setRef = React.useCallback((node: View | null) => {
    // The setNodeRef function expects an HTMLElement in web context
    // but we're using React Native's View component
    setNodeRef(node as unknown as HTMLElement);
  }, [setNodeRef]);

  // Extract the props we need to pass to the child
  const childProps: ChildProps = {
    isDragging,
    ...attributes,
    ...listeners,
  };

  return (
    <View 
      ref={setRef} 
      style={[styles.container, style]}
    >
      {React.isValidElement(children) && 
        React.cloneElement(children, childProps)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
});
