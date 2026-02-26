import React, { useState } from "react";
import { OrderItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";

interface OrderItemsEditorProps {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  isReadOnly?: boolean;
}

export const OrderItemsEditor: React.FC<OrderItemsEditorProps> = ({
  items,
  onItemsChange,
  isReadOnly = false,
}) => {
  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity,
    };
    onItemsChange(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Order Items
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">
              No items in order
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>

                {!isReadOnly && (
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        handleQuantityChange(index, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center text-xs font-bold text-primary">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        handleQuantityChange(index, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {isReadOnly && (
                  <div className="text-right ml-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      x{item.quantity}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Item summary */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
