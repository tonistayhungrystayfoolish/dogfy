# Dogfy Diet Delivery Microservice

A microservice for managing delivery operations with support for multiple shipping providers and asynchronous status updates through both polling and webhook mechanisms.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Testing Asynchronous Status Updates](#testing-asynchronous-status-updates)
- [Example Payloads](#example-payloads)
- [Running Tests](#running-tests)

## Overview

This microservice handles delivery creation and status tracking with two different shipping providers:

- **NRW Shipping Provider**: Uses polling mechanism for status updates (for packages > 20kg)
- **TLS Shipping Provider**: Uses webhook mechanism for real-time status updates (for packages ≤ 20kg)

### Provider Selection Logic

The system automatically selects the appropriate shipping provider based on **package weight**:

| Package Weight | Provider | Update Mechanism | Polling Interval |
| -------------- | -------- | ---------------- | ---------------- |
| **> 20kg**     | NRW      | Polling          | Every 1 hour     |
| **≤ 20kg**     | TLS      | Webhooks         | Real-time        |

**Example:**

- Package weighing 25kg → NRW Provider → Status polled every hour
- Package weighing 5kg → TLS Provider → Status updated via webhooks

### Key Features

- **RESTful API** for delivery management
- **Automatic provider selection** based on package weight (> 20kg = NRW, ≤ 20kg = TLS)
- **Dual update mechanisms**: Polling (NRW) and Webhooks (TLS)
- **MongoDB** for data persistence with Mongoose ODM
- **Comprehensive test suite**:unit tests, integration tests, E2E tests
- **Docker support** for easy deployment and development
- **Configurable polling** intervals (default: 1 hour)
- **Clean Architecture** with clear separation of concerns
- **Type-safe** with TypeScript and Zod validation




## Prerequisites

- **Docker** and **Docker Compose** (recommended)
- **Node.js** 20+ (for local development without Docker)
- **MongoDB** 7.0+ (if running without Docker)
- **pnpm** (package manager)

## Setup Instructions

### Option 1: Using Docker Compose (Recommended)

This is the easiest way to run the service with all dependencies.

1. **Clone the repository**

```bash
git clone <repository-url>
cd dogfy_diet_technical_test
```

2. **Start the services**

```bash
docker-compose up --build
```

This will:

- Build the application Docker image
- Start MongoDB container on port 27017
- Start the application container on port 3000
- Initialize the database with required collections and indexes

The service is now accessible at `http://localhost:3000`

4. **Stop the services**

```bash
docker-compose down
```

To remove volumes (database data):

```bash
docker-compose down -v
```

### Option 2: Local Development (Without Docker)

1. **Install dependencies**

```bash
npm install -g pnpm
pnpm install
```

2. **Start MongoDB**

Ensure MongoDB is running locally on port 27017, or update the `.env` file with your MongoDB connection string.

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/dogfy_diet_deliveries
MONGODB_DATABASE_NAME=dogfy_diet_deliveries
PORT=3000
```

4. **Start the development server**

```bash
npm run dev
```

The service will start on `http://localhost:3000` with hot-reload enabled.

5. **Build for production**

```bash
npm run build
npm run start:prod
```

## API Endpoints

### 1. Create Delivery

Creates a new delivery and automatically selects the appropriate shipping provider.

**Endpoint:** `POST /deliveries`

**Request Body:**

```json
{
  "orderId": "ORDER-001",
  "sender": {
    "street": "Carrer de Balmes 150",
    "city": "Barcelona",
    "state": "Catalonia",
    "country": "Spain",
    "zipCode": "08008"
  },
  "recipient": {
    "street": "Passeig de Gràcia 92",
    "city": "Barcelona",
    "state": "Catalonia",
    "country": "Spain",
    "zipCode": "08008"
  },
  "packagingType": "box",
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 15,
    "weight": 2.5
  },
  "items": [
    {
      "productId": "PROD-001",
      "quantity": 2,
      "unitWeight": 1.25
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "deliveryId": "550e8400-e29b-41d4-a716-446655440000",
  "shippingLabel": {
    "provider": "TLS",
    "trackingNumber": "TLS-TRK-1234567890",
    "labelUrl": "https://tls-logistics.example.com/labels/TLS-TRK-1234567890"
  },
  "status": "created"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/deliveries \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER-001",
    "sender": {
      "street": "Carrer de Balmes 150",
      "city": "Barcelona",
      "state": "Catalonia",
      "country": "Spain",
      "zipCode": "08008"
    },
    "recipient": {
      "street": "Passeig de Gràcia 92",
      "city": "Barcelona",
      "state": "Catalonia",
      "country": "Spain",
      "zipCode": "08008"
    },
    "packagingType": "box",
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 15,
      "weight": 2.5
    },
    "items": [
      {
        "productId": "PROD-001",
        "quantity": 2,
        "unitWeight": 1.25
      }
    ]
  }'
```

### 2. Get Delivery Status

Retrieves the current status of a delivery.

**Endpoint:** `GET /deliveries/:id/status`

**Response:** `200 OK`

```json
{
  "deliveryId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "in_transit",
  "lastUpdated": "2025-10-17T12:34:56.789Z"
}
```

**cURL Example:**

```bash
curl http://localhost:3000/deliveries/550e8400-e29b-41d4-a716-446655440000/status
```

### 3. TLS Webhook (Status Update)

Receives status updates from the TLS shipping provider via webhook.

**Endpoint:** `POST /webhooks/tls/status`

**Request Body:**

```json
{
  "trackingId": "TLS-TRK-9876543210",
  "status": "shipped",
  "timestamp": "2025-10-17T12:34:56.789Z"
}
```

**Response:** `200 OK`

```json
{
  "success": true
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/webhooks/tls/status \
  -H "Content-Type: application/json" \
  -d '{
    "trackingId": "TLS-TRK-9876543210",
    "status": "shipped",
    "timestamp": "2025-10-17T12:34:56.789Z"
  }'
```

## Testing Asynchronous Status Updates

The microservice supports two mechanisms for status updates:

### 1. Polling Mechanism (NRW Provider)

The NRW provider uses a polling mechanism that runs **every 1 hour** to check for status updates.

#### How It Works

1. Create a delivery with package weight **greater than 20kg** (this selects NRW provider)
2. The polling task automatically runs every hour
3. The task queries the NRW provider API for status updates
4. Status is updated in the database automatically

#### Provider Selection Logic

- **Weight > 20kg** → NRW Provider (polling-based)
- **Weight ≤ 20kg** → TLS Provider (webhook-based)

#### Testing Polling Flow

**Step 1: Create an NRW delivery (weight > 20kg)**

```bash
curl -X POST http://localhost:3000/deliveries \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER-NRW-001",
    "sender": {
      "street": "Carrer de Balmes 150",
      "city": "Barcelona",
      "state": "Catalonia",
      "country": "Spain",
      "zipCode": "08008"
    },
    "recipient": {
      "street": "Passeig de Gràcia 92",
      "city": "Barcelona",
      "state": "Catalonia",
      "country": "Spain",
      "zipCode": "08007"
    },
    "packagingType": "box",
    "dimensions": {
      "length": 50,
      "width": 40,
      "height": 30,
      "weight": 25.0
    },
    "items": [
      {
        "productId": "PROD-HEAVY-001",
        "quantity": 1,
        "unitWeight": 25.0
      }
    ]
  }'
```

**Note:** Weight is 25kg (> 20kg threshold), so NRW provider will be selected.

**Step 2: Save the delivery ID from the response**

```json
{
  "deliveryId": "abc123...",
  "shippingLabel": {
    "provider": "NRW",
    "trackingNumber": "NRW-TRK-...",
    "labelUrl": "..."
  },
  "status": "created"
}
```

**Step 3: Check initial status**

```bash
curl http://localhost:3000/deliveries/abc123.../status
```

**Step 4: Wait for polling cycle (or trigger manually in tests)**

The polling task runs every hour (3600000ms). In production, you'll see status updates automatically after each polling cycle.

**Step 5: Check updated status**

```bash
curl http://localhost:3000/deliveries/abc123.../status
```

You should see the status has progressed (e.g., from `created` to `shipped` to `in_transit`).

#### Polling Configuration

The polling interval is **1 hour by default** and can be configured in multiple ways:

**Option 1: Use default (recommended)**

```typescript
// src/main.ts
pollingTask.startPolling(); // Uses default: 1 hour
```

**Option 2: Environment variable**

```bash
# .env file
POLLING_INTERVAL_MS=3600000  # 1 hour (default)
POLLING_INTERVAL_MS=1800000  # 30 minutes
```

**Option 3: Custom interval in code**

```typescript
pollingTask.startPolling(30 * 60 * 1000); // 30 minutes
```

For more details, see [Polling Configuration Documentation](docs/POLLING-CONFIGURATION.md).

### 2. Webhook Mechanism (TLS Provider)

The TLS provider uses webhooks for real-time status updates.

#### How It Works

1. Create a delivery with package weight **20kg or less** (this selects TLS provider)
2. The TLS provider sends webhook notifications to `/webhooks/tls/status` when status changes
3. The webhook handler updates the delivery status immediately

#### Testing Webhook Flow

**Step 1: Create a TLS delivery**

```bash
curl -X POST http://localhost:3000/deliveries \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER-TLS-001",
    "sender": {
      "street": "Carrer de Mallorca 401",
      "city": "Barcelona",
      "state": "Catalonia",
      "country": "Spain",
      "zipCode": "08013"
    },
    "recipient": {
      "street": "Carrer de Provença 261",
      "city": "Barcelona",
      "state": "Catalonia",
      "country": "Spain",
      "zipCode": "08008"
    },
    "packagingType": "envelope",
    "dimensions": {
      "length": 25,
      "width": 18,
      "height": 5,
      "weight": 0.8
    },
    "items": [
      {
        "productId": "PROD-TLS-001",
        "quantity": 1,
        "unitWeight": 0.8
      }
    ]
  }'
```

**Step 2: Save the tracking number from the response**

```json
{
  "deliveryId": "xyz789...",
  "shippingLabel": {
    "provider": "TLS",
    "trackingNumber": "TLS-TRK-9876543210",
    "labelUrl": "..."
  },
  "status": "created"
}
```

**Step 3: Check initial status**

```bash
curl http://localhost:3000/deliveries/xyz789.../status
```

**Step 4: Simulate webhook from TLS provider (status: shipped)**

```bash
curl -X POST http://localhost:3000/webhooks/tls/status \
  -H "Content-Type: application/json" \
  -d '{
    "trackingId": "TLS-TRK-9876543210",
    "status": "shipped",
    "timestamp": "2025-10-17T12:00:00.000Z"
  }'
```

**Step 5: Verify status updated**

```bash
curl http://localhost:3000/deliveries/xyz789.../status
```

You should see `"status": "shipped"`

**Step 6: Simulate additional status updates**

```bash
# Update to in_transit
curl -X POST http://localhost:3000/webhooks/tls/status \
  -H "Content-Type: application/json" \
  -d '{
    "trackingId": "TLS-TRK-9876543210",
    "status": "in_transit",
    "timestamp": "2025-10-17T14:00:00.000Z"
  }'

# Update to delivered
curl -X POST http://localhost:3000/webhooks/tls/status \
  -H "Content-Type: application/json" \
  -d '{
    "trackingId": "TLS-TRK-9876543210",
    "status": "delivered",
    "timestamp": "2025-10-17T16:00:00.000Z"
  }'
```

**Step 7: Verify final status**

```bash
curl http://localhost:3000/deliveries/xyz789.../status
```

You should see `"status": "delivered"`

## Example Payloads

### Complete Delivery Lifecycle Examples

#### Example 1: NRW Provider (Polling-based)

**Create Delivery (Heavy Package > 20kg):**

```json
{
  "orderId": "ORDER-20251017-001",
  "sender": {
    "street": "Carrer de Mallorca 401",
    "city": "Barcelona",
    "state": "Catalonia",
    "country": "Spain",
    "zipCode": "08013"
  },
  "recipient": {
    "street": "Gran Via de les Corts Catalanes 585",
    "city": "Barcelona",
    "state": "Catalonia",
    "country": "Spain",
    "zipCode": "08011"
  },
  "packagingType": "box",
  "dimensions": {
    "length": 60,
    "width": 50,
    "height": 40,
    "weight": 30.0
  },
  "items": [
    {
      "productId": "DOG-FOOD-BULK-30KG",
      "quantity": 1,
      "unitWeight": 30.0
    }
  ]
}
```

**Note:** Weight is 30kg (> 20kg), so NRW provider is automatically selected.

**Expected Response:**

```json
{
  "deliveryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "shippingLabel": {
    "provider": "NRW",
    "trackingNumber": "NRW-TRK-1729180800123",
    "labelUrl": "https://nrw-shipping.example.com/labels/NRW-TRK-1729180800123"
  },
  "status": "created"
}
```

#### Example 2: TLS Provider (Webhook-based)

**Create Delivery:**

```json
{
  "orderId": "ORDER-20251017-002",
  "sender": {
    "street": "La Rambla 115",
    "city": "Barcelona",
    "state": "Catalonia",
    "country": "Spain",
    "zipCode": "08002"
  },
  "recipient": {
    "street": "Avinguda Diagonal 640",
    "city": "Barcelona",
    "state": "Catalonia",
    "country": "Spain",
    "zipCode": "08017"
  },
  "packagingType": "envelope",
  "dimensions": {
    "length": 30,
    "width": 22,
    "height": 8,
    "weight": 1.5
  },
  "items": [
    {
      "productId": "DOG-TREATS-SAMPLE-PACK",
      "quantity": 3,
      "unitWeight": 0.5
    }
  ]
}
```

**Expected Response:**

```json
{
  "deliveryId": "f9e8d7c6-b5a4-3210-9876-543210fedcba",
  "shippingLabel": {
    "provider": "TLS",
    "trackingNumber": "TLS-TRK-1729180800456",
    "labelUrl": "https://tls-logistics.example.com/labels/TLS-TRK-1729180800456"
  },
  "status": "created"
}
```

**Webhook Payloads for Status Updates:**

```json
// Status: Shipped
{
  "trackingId": "TLS-TRK-1729180800456",
  "status": "shipped",
  "timestamp": "2025-10-17T10:30:00.000Z"
}

// Status: In Transit
{
  "trackingId": "TLS-TRK-1729180800456",
  "status": "in_transit",
  "timestamp": "2025-10-17T14:15:00.000Z"
}

// Status: Delivered
{
  "trackingId": "TLS-TRK-1729180800456",
  "status": "delivered",
  "timestamp": "2025-10-17T18:45:00.000Z"
}
```

### Valid Status Values

The following status values are supported:

- `created` - Delivery has been created
- `shipped` - Package has been picked up by the carrier
- `in_transit` - Package is in transit to destination
- `delivered` - Package has been delivered
- `failed` - Delivery failed

### Error Response Examples

**400 Bad Request - Invalid Payload:**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error: Weight must be a positive number"
}
```

**404 Not Found - Delivery Not Found:**

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Delivery not found"
}
```

**404 Not Found - Invalid Tracking ID:**

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Delivery with tracking ID 'INVALID-ID' not found"
}
```

## Running Tests

The project includes comprehensive test suites:

### Unit Tests

Test individual functions and business logic in isolation.

```bash
npm run test:unit
```

### Integration Tests

Test database operations with real MongoDB using Testcontainers.

```bash
npm run test:integration
```

### E2E Tests

Test complete flows through the API with real HTTP requests.

```bash
npm run test:e2e
```

### All Tests

Run all test suites:

```bash
npm run test:all
```

### Test Coverage

Generate test coverage report:

```bash
npm run test:coverage
```

### Watch Mode

Run tests in watch mode during development:

```bash
npm run test:watch              # Unit tests
npm run test:integration:watch  # Integration tests
npm run test:e2e:watch          # E2E tests
```

## Postman Collection

You can import the following Postman collection to test the API:

### Collection JSON

```json
{
  "info": {
    "name": "Dogfy Diet Delivery API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Barcelona Delivery",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"orderId\": \"ORDER-BCN-001\",\n  \"sender\": {\n    \"street\": \"Carrer de Balmes 150\",\n    \"city\": \"Barcelona\",\n    \"state\": \"Catalonia\",\n    \"country\": \"Spain\",\n    \"zipCode\": \"08008\"\n  },\n  \"recipient\": {\n    \"street\": \"Passeig de Gràcia 92\",\n    \"city\": \"Barcelona\",\n    \"state\": \"Catalonia\",\n    \"country\": \"Spain\",\n    \"zipCode\": \"08008\"\n  },\n  \"packagingType\": \"box\",\n  \"dimensions\": {\n    \"length\": 30,\n    \"width\": 20,\n    \"height\": 15,\n    \"weight\": 2.5\n  },\n  \"items\": [\n    {\n      \"productId\": \"PROD-001\",\n      \"quantity\": 2,\n      \"unitWeight\": 1.25\n    }\n  ]\n}"
        },
        "url": {
          "raw": "http://localhost:3000/deliveries",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["deliveries"]
        }
      }
    },
    {
      "name": "Create TLS Delivery",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"orderId\": \"ORDER-TLS-001\",\n  \"sender\": {\n    \"street\": \"Carrer de Mallorca 401\",\n    \"city\": \"Barcelona\",\n    \"state\": \"Catalonia\",\n    \"country\": \"Spain\",\n    \"zipCode\": \"08013\"\n  },\n  \"recipient\": {\n    \"street\": \"Carrer de Provença 261\",\n    \"city\": \"Barcelona\",\n    \"state\": \"Catalonia\",\n    \"country\": \"Spain\",\n    \"zipCode\": \"08008\"\n  },\n  \"packagingType\": \"envelope\",\n  \"dimensions\": {\n    \"length\": 25,\n    \"width\": 18,\n    \"height\": 5,\n    \"weight\": 0.8\n  },\n  \"items\": [\n    {\n      \"productId\": \"PROD-TLS-001\",\n      \"quantity\": 1,\n      \"unitWeight\": 0.8\n    }\n  ]\n}"
        },
        "url": {
          "raw": "http://localhost:3000/deliveries",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["deliveries"]
        }
      }
    },
    {
      "name": "Get Delivery Status",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/deliveries/:id/status",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["deliveries", ":id", "status"],
          "variable": [
            {
              "key": "id",
              "value": "{{deliveryId}}"
            }
          ]
        }
      }
    },
    {
      "name": "TLS Webhook - Shipped",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"trackingId\": \"{{trackingId}}\",\n  \"status\": \"shipped\",\n  \"timestamp\": \"{{$isoTimestamp}}\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/webhooks/tls/status",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["webhooks", "tls", "status"]
        }
      }
    },
    {
      "name": "TLS Webhook - In Transit",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"trackingId\": \"{{trackingId}}\",\n  \"status\": \"in_transit\",\n  \"timestamp\": \"{{$isoTimestamp}}\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/webhooks/tls/status",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["webhooks", "tls", "status"]
        }
      }
    },
    {
      "name": "TLS Webhook - Delivered",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"trackingId\": \"{{trackingId}}\",\n  \"status\": \"delivered\",\n  \"timestamp\": \"{{$isoTimestamp}}\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/webhooks/tls/status",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["webhooks", "tls", "status"]
        }
      }
    }
  ]
}
```
