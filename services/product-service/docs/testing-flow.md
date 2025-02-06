# Product Service Testing Flow

This guide outlines the proper sequence for testing the Product Service, ensuring all dependencies are properly created and managed.

## Testing Sequence

### 1. Category Management

#### Create Category

- **Method**: POST
- **Endpoint**: `/api/categories`
- **Description**: Create a product category first, as products need valid category IDs
- **Request Body**:

```json
{
  "name": "Eco-Friendly Containers",
  "description": "Sustainable containers and bottles",
  "isActive": true
}
```

- **Response**: Returns created category with UUID

#### List Categories

- **Method**: GET
- **Endpoint**: `/api/categories`
- **Description**: Verify category creation and get category ID for product creation

### 2. Inventory Management

#### Create Inventory

- **Method**: POST
- **Endpoint**: `/api/inventory`
- **Description**: Set up inventory record before creating products
- **Request Body**:

```json
{
  "quantity": 100,
  "lowStockThreshold": 20,
  "warehouseLocation": "MAIN-01"
}
```

- **Response**: Returns created inventory record with UUID

#### Check Inventory

- **Method**: GET
- **Endpoint**: `/api/inventory/:id`
- **Description**: Verify inventory creation and get inventory ID for product creation

### 3. Product Management

#### Create Product

- **Method**: POST
- **Endpoint**: `/api/products`
- **Description**: Create product with category and inventory references
- **Request Body**:

```json
{
  "name": "Eco-Friendly Water Bottle",
  "description": "Sustainable water bottle made from recycled materials",
  "price": 24.99,
  "sku": "ECO-WB-001",
  "categoryId": "<category-uuid-from-step-1>",
  "inventoryId": "<inventory-uuid-from-step-2>",
  "isActive": true
}
```

#### Verify Product Creation

- **Method**: GET
- **Endpoint**: `/api/products/:id`
- **Description**: Confirm product details including category and inventory associations

## Testing Flow Example

1. Create a category:

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Eco-Friendly Containers",
    "description": "Sustainable containers and bottles",
    "isActive": true
  }'
```

2. Create an inventory record:

```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 100,
    "lowStockThreshold": 20,
    "warehouseLocation": "MAIN-01"
  }'
```

3. Create a product using the category and inventory IDs:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Eco-Friendly Water Bottle",
    "description": "Sustainable water bottle made from recycled materials",
    "price": 24.99,
    "sku": "ECO-WB-001",
    "categoryId": "<category-uuid-from-step-1>",
    "inventoryId": "<inventory-uuid-from-step-2>",
    "isActive": true
  }'
```

## Important Notes

1. Always create categories first as they are required for product creation
2. Set up inventory records before creating products to ensure proper stock management
3. Use the returned UUIDs from category and inventory creation when creating products
4. Verify each step using the corresponding GET endpoints
5. Keep track of the UUIDs returned from each creation step
