# Smart Maternal System - API Documentation

## Overview
The Smart Maternal System backend is built with NestJS and runs on port **3001**. The API provides endpoints for managing users, hospitals, and woredas in the maternal health system.

## Why Port 3001?
The backend runs on port 3001 because:
- The frontend typically runs on port 3000 (React/Angular default)
- Port 3001 avoids conflicts with the frontend
- It's configured in `src/main.ts` with fallback to environment variable `PORT`

## Base URL
```
http://localhost:3001/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles
- **MOH_ADMIN**: Ministry of Health Administrator (highest level) - Can create all users, woredas, and hospitals
- **WOREDA_ADMIN**: Woreda (district) Administrator - Can only view information, cannot create users
- **HOSPITAL_ADMIN**: Hospital Administrator - Can create hospital workers (doctors, nurses, etc.)
- **DOCTOR**: Medical Doctor
- **NURSE**: Nurse
- **DISPATCHER**: Emergency Dispatcher
- **MOTHER**: Patient/Mother

## API Endpoints

### 1. Authentication Endpoints

#### POST /api/auth/register
Register a new user (public endpoint)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "DOCTOR",
  "hospitalId": "hospital_id_here",
  "woredaId": "woreda_id_here",
  "phoneNumber": "+251123456789",
  "department": "Obstetrics",
  "licenseNumber": "MD123456"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "DOCTOR"
  }
}
```

#### POST /api/auth/login
Login user and get JWT token (public endpoint)

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "DOCTOR"
  }
}
```

### 2. User Management Endpoints
*Requires authentication and appropriate role*

#### GET /api/users
Get all users (Admin roles only)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "DOCTOR",
    "hospitalId": "hospital_id",
    "woredaId": "woreda_id",
    "phoneNumber": "+251123456789",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/users/role/:role
Get users by specific role (Admin roles only)

**Example:** `/api/users/role/DOCTOR`

#### GET /api/users/:id
Get user by ID (authenticated users)

#### POST /api/users
Create new user (MOH_ADMIN and HOSPITAL_ADMIN roles only)

**Request Body:** Same as registration endpoint

### 3. Hospital Management Endpoints
*Requires authentication and appropriate role*

#### GET /api/hospitals
Get all hospitals (Admin and Hospital Admin roles)

**Response:**
```json
[
  {
    "id": "hospital_id",
    "name": "Black Lion Hospital",
    "type": "HOSPITAL",
    "location": "Addis Ababa, Ethiopia",
    "contact": "+251111234567",
    "woredaId": "woreda_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/hospitals
Create new hospital (MOH_ADMIN and WOREDA_ADMIN roles only)

**Request Body:**
```json
{
  "name": "New Hospital",
  "type": "HOSPITAL",
  "location": "Addis Ababa, Ethiopia",
  "contact": "+251123456789",
  "woredaId": "woreda_id"
}
```

### 4. Woreda Management Endpoints
*Requires authentication and appropriate role*

#### GET /api/woredas
Get all woredas (Admin roles)

**Response:**
```json
[
  {
    "id": "woreda_id",
    "name": "Addis Ababa Woreda 1",
    "region": "Addis Ababa",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/woredas
Create new woreda (MOH_ADMIN role only)

**Request Body:**
```json
{
  "name": "New Woreda",
  "region": "Addis Ababa"
}
```

### 5. Root Endpoint

#### GET /
Get API information (public endpoint)

**Response:**
```json
{
  "message": "Smart Maternal Backend API is running",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    "hospitals": "/api/hospitals",
    "woredas": "/api/woredas"
  }
}
```

## How to Test with Postman

### 1. Setup Postman Collection

1. Create a new collection in Postman called "Smart Maternal System"
2. Set base URL: `http://localhost:3001/api`

### 2. Authentication Flow

#### Step 1: Register/Login
1. **POST** `{{baseUrl}}/auth/login`
2. **Body:** 
   ```json
   {
     "email": "moh.admin@maternal.gov.et",
     "password": "admin123"
   }
   ```
3. **Save the response token** to Postman environment variable `{{token}}`

#### Step 2: Set Authorization Header
For all protected endpoints:
1. Go to Authorization tab
2. Type: Bearer Token
3. Token: `{{token}}`

### 3. Test Endpoints

#### Public Endpoints (No Auth Required):
- `POST /auth/register`
- `POST /auth/login`
- `GET /`

#### Protected Endpoints (Auth Required):
- `GET /users`
- `GET /users/role/DOCTOR`
- `GET /users/:id`
- `POST /users`
- `GET /hospitals`
- `POST /hospitals`
- `GET /woredas`
- `POST /woredas`

### 4. Sample Postman Requests

#### Get All Users:
```
GET http://localhost:3001/api/users
Authorization: Bearer {{token}}
```

#### Create New Doctor:
```
POST http://localhost:3001/api/users
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Dr. New Doctor",
  "email": "new.doctor@maternal.gov.et",
  "password": "password123",
  "role": "DOCTOR",
  "hospitalId": "507f1f77bcf86cd799439013",
  "woredaId": "507f1f77bcf86cd799439011",
  "phoneNumber": "+251999999999",
  "department": "Pediatrics",
  "licenseNumber": "MD999999"
}
```

## Database Setup

### MongoDB Connection
The app connects to MongoDB at: `mongodb://localhost:27017/maternal-health`

### Seed the Database
Run the seed script to create initial users:

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run the seed script
npm run seed
```

### Default Admin Credentials
After running the seed script:

**Email:** `admin@maternal.gov.et`
**Password:** `admin123`
**Role:** MOH_ADMIN

### How to Use the System

#### 1. System Admin (MOH_ADMIN) can:
- Create woreda admins
- Create hospital admins  
- Create woredas
- Create hospitals
- View all users

#### 2. Woreda Admin (WOREDA_ADMIN) can:
- View information from hospitals
- **Cannot create users**

#### 3. Hospital Admin (HOSPITAL_ADMIN) can:
- Create hospital workers (doctors, nurses, etc.)
- View hospital information
- Manage hospital staff

## Running the Application

### Development Mode:
```bash
npm run start:dev
```

### Production Mode:
```bash
npm run build
npm run start:prod
```

### Environment Variables
Create a `.env` file in the root directory:
```
PORT=3001
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/maternal-health
```

## Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

Error responses include:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## CORS Configuration
The API allows requests from: `http://localhost:3000` (frontend)

## Next Steps
1. Start MongoDB server
2. Run `npm install` to install dependencies
3. Run `npm run seed` to create initial users
4. Run `npm run start:dev` to start the development server
5. Test endpoints using Postman with the provided credentials
