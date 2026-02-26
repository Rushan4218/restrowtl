import React from "react";

interface BillingSectionProps {
  subtotal: number;
  taxRate?: number;
  total: number;
}

export const BillingSection: React.FC<BillingSectionProps> = ({
  subtotal,
  taxRate = 0.08,
  total,
}) => {
  const taxAmount = subtotal * taxRate;

  return (
    <div className="space-y-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800/40">
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">
          Billing Summary
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700 dark:text-gray-300">Subtotal</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Tax ({(taxRate * 100).toFixed(0)}%)
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            ${taxAmount.toFixed(2)}
          </span>
        </div>

        <div className="border-t border-orange-300 dark:border-orange-700/50 pt-2 flex justify-between items-center">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            Total
          </span>
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
