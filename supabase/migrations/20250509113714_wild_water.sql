/*
  # Initial Schema Setup

  1. New Tables
    - shopping_lists
      - list_id (uuid, primary key)
      - name (text)
      - description (text)
      - created_by (uuid, references auth.users)
      - is_shared (boolean)
      - is_locked (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)
      - deleted_at (timestamp)
      - last_modified_at (timestamp)
    
    - list_items
      - item_id (uuid, primary key)
      - list_id (uuid, references shopping_lists)
      - name (text)
      - quantity (float)
      - unit (text)
      - is_purchased (boolean)
      - purchased_by (uuid, references auth.users)
      - purchased_at (timestamp)
      - created_at (timestamp)
      - updated_at (timestamp)
      - deleted_at (timestamp)
      - last_modified_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Set up audit triggers for timestamps
*/

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  list_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users NOT NULL,
  is_shared boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  last_modified_at timestamptz DEFAULT now()
);

-- Create list_items table
CREATE TABLE IF NOT EXISTS list_items (
  item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shopping_lists NOT NULL,
  name text NOT NULL,
  quantity float NOT NULL DEFAULT 1,
  unit text,
  is_purchased boolean DEFAULT false,
  purchased_by uuid REFERENCES auth.users,
  purchased_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  last_modified_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- Create policies for shopping_lists
CREATE POLICY "Users can create shopping lists"
  ON shopping_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own shopping lists"
  ON shopping_lists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by AND deleted_at IS NULL);

CREATE POLICY "Users can update their own shopping lists"
  ON shopping_lists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can soft delete their own shopping lists"
  ON shopping_lists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (deleted_at IS NOT NULL);

-- Create policies for list_items
CREATE POLICY "Users can create items in their lists"
  ON list_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE list_id = list_items.list_id
      AND created_by = auth.uid()
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can view items in their lists"
  ON list_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE list_id = list_items.list_id
      AND created_by = auth.uid()
      AND deleted_at IS NULL
    )
    AND list_items.deleted_at IS NULL
  );

CREATE POLICY "Users can update items in their lists"
  ON list_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE list_id = list_items.list_id
      AND created_by = auth.uid()
      AND deleted_at IS NULL
    )
    AND list_items.deleted_at IS NULL
  );

CREATE POLICY "Users can soft delete items in their lists"
  ON list_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE list_id = list_items.list_id
      AND created_by = auth.uid()
    )
  )
  WITH CHECK (deleted_at IS NOT NULL);

-- Create triggers for timestamp management
CREATE OR REPLACE FUNCTION update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_modified_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shopping_lists_timestamps
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER update_list_items_timestamps
  BEFORE UPDATE ON list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamps();