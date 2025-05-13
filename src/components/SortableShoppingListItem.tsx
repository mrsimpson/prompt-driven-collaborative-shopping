import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ShoppingListItem } from './ShoppingListItem';
import { ListItem } from '@/src/types/models';

interface SortableListItemProps {
  item: ListItem;
  onUpdate: (id: string, updates: Partial<ListItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const SortableListItem: React.FC<SortableListItemProps> = ({
  item,
  onUpdate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ShoppingListItem
        item={item}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
};
