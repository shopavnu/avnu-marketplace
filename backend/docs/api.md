# Avnu Marketplace API Documentation

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

All API endpoints require authentication unless marked as `[Public]`.

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Products

#### [Public] List Products

```http
GET /products
```

Query Parameters:

- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)
- `search` (string): Search query
- `category` (string): Filter by category
- `vendor` (string): Filter by vendor
- `cause` (string): Filter by cause
- `local` (boolean): Filter local vendors only
- `inStock` (boolean): Filter in-stock items only

Response:

```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "price": number,
      "image": "string",
      "category": "string",
      "vendor": {
        "id": "string",
        "name": "string",
        "isLocal": boolean,
        "causes": ["string"]
      },
      "rating": {
        "average": number,
        "count": number
      },
      "inStock": boolean,
      "isNew": boolean
    }
  ],
  "meta": {
    "currentPage": number,
    "totalPages": number,
    "totalItems": number
  }
}
```

#### [Public] Get Product

```http
GET /products/:id
```

Response: Single product object

### Authentication

#### [Public] Register

```http
POST /auth/register
```

Request Body:

```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

#### [Public] Login

```http
POST /auth/login
```

Request Body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response:

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

### User Profile

#### Get Profile

```http
GET /users/me
```

#### Update Profile

```http
PUT /users/me
```

Request Body:

```json
{
  "name": "string",
  "email": "string",
  "preferences": {
    "newsletter": boolean,
    "localOnly": boolean
  }
}
```

### Orders

#### Create Order

```http
POST /orders
```

Request Body:

```json
{
  "items": [
    {
      "productId": "string",
      "quantity": number
    }
  ],
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  }
}
```

#### List Orders

```http
GET /orders
```

Response:

```json
{
  "data": [
    {
      "id": "string",
      "status": "string",
      "total": number,
      "items": [
        {
          "product": {
            "id": "string",
            "title": "string",
            "price": number
          },
          "quantity": number
        }
      ],
      "createdAt": "string"
    }
  ]
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {} // optional
  }
}
```

Common Error Codes:

- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error
