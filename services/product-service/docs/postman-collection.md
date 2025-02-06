# Product Service API Documentation

This document describes the available endpoints for the Product Service. You can import these endpoints into Postman for testing.

## Base URL

```
http://localhost:3000
```

## Endpoints

### Products

#### List Products

- **Method**: GET
- **Endpoint**: `/api/products`
- **Description**: Retrieves a list of all products
- **Response**: Array of products

#### Search Products

- **Method**: GET
- **Endpoint**: `/api/products/search`
- **Description**: Search products based on query parameters
- **Query Parameters**:
  - `q`: Search term
  - `category`: Category ID
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price

#### Create Product

- **Method**: POST
- **Endpoint**: `/api/products`
- **Description**: Create a new product
- **Request Body**:

```json
{
  "name": "Eco-Friendly Water Bottle",
  "description": "Sustainable water bottle made from recycled materials",
  "price": 24.99,
  "sku": "ECO-WB-001",
  "categoryId": "uuid-of-category",
  "isActive": true
}
```

#### Get Product

- **Method**: GET
- **Endpoint**: `/api/products/:id`
- **Description**: Get a specific product by ID
- **Parameters**:
  - `id`: Product UUID

#### Update Product

- **Method**: PATCH
- **Endpoint**: `/api/products/:id`
- **Description**: Update a specific product
- **Parameters**:
  - `id`: Product UUID
- **Request Body** (all fields optional):

```json
{
  "name": "Updated Water Bottle",
  "description": "Updated description",
  "price": 29.99,
  "isActive": true
}
```

#### Delete Product

- **Method**: DELETE
- **Endpoint**: `/api/products/:id`
- **Description**: Delete a specific product
- **Parameters**:
  - `id`: Product UUID

## Database Schema

### Product Model

```typescript
{
  id: uuid,
  name: string,
  description: string (optional),
  price: decimal,
  sku: string (unique),
  isActive: boolean,
  categoryId: uuid,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Getting Started

1. Make sure the product service is running:

```bash
npm run dev
```

2. The service will be available at `http://localhost:3000`

3. Import this documentation into Postman:

   - Create a new collection in Postman
   - Set the base URL as an environment variable
   - Create requests for each endpoint described above

4. Test the health endpoint first:
   GET http://localhost:3000/health

This should return: `{ "status": "ok" }`
