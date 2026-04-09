
/**
 * This file defines the Inventory interface for the ReadyForSupplies application. The Inventory interface represents an inventory item in the system, including properties such as
 * item name, description, brand, color, size, type, material, count, quantity, and notes. The _id property is optional and is used for identifying items when performing delete operations.
 * This interface is used throughout the Inventory component and related services to ensure type safety and consistency when handling inventory data within the application.
 */

// Interface representing an inventory item, including properties such as item name, description, brand, color, size, type, material, count, quantity, and notes. The _id property is optional and is used for identifying items when performing delete operations.
export interface Inventory {
  _id?: string, // Added for delete functionality
  item: string,
  brand: string,
  color: string,
  size: string,
  type: string[],
  style: string[],
  material: string[],
  bin: number[],
  count: number,
  quantity: number,
  notes: string
}
