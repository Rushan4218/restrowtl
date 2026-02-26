# Order Management System - Quick Start Guide

## 5-Minute Setup

### What You Get
A fully functional order editing interface with real-time pricing calculations, item management, and order modifications.

### Where to Find It
1. Navigate to Admin → Orders → List
2. Click "Edit" on any order
3. Advanced order editor modal opens

## Key Controls

### Adding Items
```
1. Click "Add Item" button
2. Search product name or description
3. Click product to add
   - Auto-adds with quantity 1
   - Or increases quantity if already in order
```

### Changing Quantities
```
1. Use stepper (+ / - buttons) next to quantity
2. Or click directly in number field and type
3. Total price updates instantly
```

### Modifying Prices
```
1. Click $ field next to unit price
2. Type new price (must be > $0)
3. Item subtotal recalculates
4. Order total updates
```

### Removing Items
```
1. Click trash icon on item card
2. Item removed immediately
3. Total recalculates
```

### Applying Discounts
```
1. In "Pricing Controls" section, set "Discount %" 
2. Example: enter 15 for 15% discount
3. Discount amount shows in breakdown
4. Tax applied to amount AFTER discount
```

### Splitting Among Guests
```
1. Change "Guest Count" (top right)
2. Scroll pricing panel down
3. "Per Person" shows total ÷ guests
4. Perfect for splitting checks
```

### Changing Order Status
```
1. Use "Order Status" dropdown
2. Options: pending_ack → acknowledged → completed → served → payment_done → cancelled
3. Status saved with order
```

## Real-Time Calculations

The system automatically calculates:
- ✅ Subtotal (sum of all items)
- ✅ Discount (if %)
- ✅ Tax (default 10%, adjustable)
- ✅ Service Charge (if %)
- ✅ Grand Total
- ✅ Per-person cost

### Example
```
Item: Grilled Salmon $22 × 2  = $44
Item: Caesar Salad   $9 × 1   = $9
─────────────────────────────────
Subtotal:                      $53
Discount (10%):               -$5.30
Tax (10% on $47.70):          $4.77
Service Charge (15%):         $7.95
─────────────────────────────────
TOTAL:                        $60.12

3 Guests → Per Person: $20.04
```

## Common Tasks

### Task: Fix Wrong Item Price
```
1. Open edit modal
2. Find item with wrong price
3. Click price field ($X.XX)
4. Change to correct amount
5. Click Save Order
✓ Done - total recalculates automatically
```

### Task: Add Extra Charges
```
1. Set "Service %" to desired amount
   Example: 20 for 20% service charge
2. See Service Charge amount in breakdown
3. Save order
✓ Done - service charge included in total
```

### Task: Adjust for Multiple Diners
```
1. Set Guest Count to number of people
2. Scroll pricing panel down
3. See Per Person cost
4. Guests can split evenly
✓ Done - calculation shown for reference
```

### Task: Add Special Notes
```
1. Scroll to bottom of modal
2. Click "Notes" field
3. Type instructions (allergies, preferences, etc.)
4. Save order
✓ Done - notes saved with order
```

## Validation & Error Handling

### Red Flags (Won't Allow Save)
- ❌ Order has 0 items → "Order must have at least one item"
- ❌ Quantity < 1 → "Quantity must be at least 1"
- ❌ Price ≤ 0 → "Price must be greater than 0"

### Warnings (Show Alerts)
- ⚠️ Successfully added item → "Added [Item Name]"
- ⚠️ Item removed → "Removed [Item Name]"
- ⚠️ Quantity increased → "Increased [Item Name] quantity"
- ⚠️ Save successful → "Order updated successfully"

## Tips & Tricks

### 💡 Tip 1: Quick Price Changes
Instead of modifying individual items, adjust:
- Discount % to apply store-wide discount
- Tax % if different area/service type
- Service % for gratuity or service charges

### 💡 Tip 2: Per-Person Splitting
Set guest count to automatically calculate per-person cost - useful for:
- Table splitting bills
- Group dining
- Event catering

### 💡 Tip 3: Search Products Efficiently
- Search by partial name: "Caff" finds "Cappuccino"
- Search by category: "Salad" finds all salads
- Search by ingredient: "Mint" finds all items with mint

### 💡 Tip 4: Track Price Changes
Price difference shown at bottom of modal:
- Green with minus: Price went down
- Orange with plus: Price went up
- Hidden if no change

### 💡 Tip 5: Batch Item Changes
If modifying quantity for many items:
1. Use stepper for quick +/- adjustments
2. Or click field and type multiple items fast
3. All updates real-time with instant calculations

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between fields |
| `Enter` | Submit form / Add item |
| `Esc` | Close modal |
| `+` | Increment quantity |
| `-` | Decrement quantity |
| `Ctrl+S` | Save order (if focused) |

## Troubleshooting

### Q: Total not updating?
**A:** Make sure to click out of number fields. Calculations update on blur.

### Q: Can't add item?
**A:** Product might be disabled/unavailable. Check product availability in menu.

### Q: Discount not applying?
**A:** Verify discount % is between 0-100. Tax is calculated AFTER discount.

### Q: Per-person cost not showing?
**A:** Scroll down in pricing panel. Only shows if guest count > 1.

### Q: Save button disabled?
**A:** Order needs at least 1 item. Check that at least 1 item has quantity ≥ 1.

## What Happens When You Save

1. All validations run
2. Final pricing recalculated
3. Order object created with updates:
   - Items list
   - Quantities
   - Prices
   - Total
   - Status
   - Notes
   - Guest count
4. Mock API delay (800ms) simulates backend
5. Order list refreshes
6. Success toast shows
7. Modal closes

## Calculations Deep Dive

All prices follow strict accounting rules:

```typescript
// Tax calculated AFTER discount
Taxable = Subtotal - Discount
Tax = Taxable × (TaxPercent / 100)

// Service charge usually before tax
Total = Subtotal - Discount + Tax + ServiceCharge

// Rounding: All amounts to 2 decimals (cents)
Final = Math.round(amount × 100) / 100
```

This prevents rounding errors in large orders.

## Next Steps

### To Modify for Your Needs:
1. Default tax % → Edit in `advanced-edit-order-modal.tsx` line ~45
2. Service charge rules → Modify `calculateServiceCharge()` in `lib/order-calculations.ts`
3. Add new fields → Update Order type in `types/index.ts`

### To Integrate with Backend:
1. Replace 800ms mock delay with API call
2. Update `handleSave()` to POST to `/api/orders/update`
3. Remove localStorage dependency in order service

### To Add Features:
- Combo selection: Add combo UI component
- Modifiers: Item-level add-ons selector
- Split payment: Multi-payer breakdown
- Printing: KOT/Bill generation

---

## Support

For issues or questions:
1. Check `ORDER_MANAGEMENT_SYSTEM.md` for detailed docs
2. Review `IMPLEMENTATION_SUMMARY.md` for architecture
3. Check `lib/order-calculations.ts` for calculation formulas

**Happy order editing!** 🎉
