"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface DynamicInputListProps {
  items: string[];
  setItems: (items: string[]) => void;
  placeholder?: string;
}

export const DynamicInputList = ({
  items,
  setItems,
  placeholder,
}: DynamicInputListProps) => {
  const handleAddItem = () => {
    setItems([...items, ""]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-x-2">
          <Input
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder={`${placeholder || "List item"} #${index + 1}`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleRemoveItem(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        className="mt-2"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
};
