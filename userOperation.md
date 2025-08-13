# 🎬 VidTube User Controller API Documentation

> **A comprehensive guide to VidTube's User Management API**  
> _Complete with examples, authentication, and best practices_

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🔐 Authentication](#-authentication)
- [📌 API Endpoints](#-api-endpoints)
  - [👤 User Registration & Auth](#-user-registration--auth)
  - [⚙️ Account Management](#️-account-management)
  - [📊 Profile & Data](#-profile--data)
- [🛠️ Testing with Postman](#️-testing-with-postman)
- [❌ Error Handling](#-error-handling)
- [💡 Tips & Best Practices](#-tips--best-practices)

---

## 🚀 Quick Start

### Base URL

```
🌐 http://localhost:8000/api/v1/users
```

### 📦 Content Types

| Type                  | Usage                           |
| --------------------- | ------------------------------- |
| `application/json`    | 📄 Text data, login, updates    |
| `multipart/form-data` | 📁 File uploads (avatar, cover) |

---

## 🔐 Authentication

Most endpoints require **JWT Authentication** via:

| Method         | Description                           | Example                               |
| -------------- | ------------------------------------- | ------------------------------------- |
| 🔑 **Header**  | Bearer token in Authorization header  | `Authorization: Bearer <accessToken>` |
| 🍪 **Cookies** | HTTP-only cookies (set automatically) | `accessToken`, `refreshToken`         |

> **💡 Pro Tip:** Tokens are automatically managed via cookies after login!

---

## 📌 API Endpoints

### 👤 User Registration & Auth

#### 🆕 1. Register User

> **Create a new user account with profile images**

|                   |                       |
| ----------------- | --------------------- |
| **Endpoint**      | `POST /register`      |
| **Content-Type**  | `multipart/form-data` |
| **Auth Required** | ❌ No                 |

##### 📥 Request Body

| Field        | Type   | Required | Description            |
| ------------ | ------ | -------- | ---------------------- |
| `fullname`   | string | ✅       | User's full name       |
| `email`      | string | ✅       | Valid email address    |
| `username`   | string | ✅       | Unique username        |
| `password`   | string | ✅       | User password          |
| `avatar`     | file   | ✅       | Profile picture        |
| `coverImage` | file   | ⭕       | Cover image (optional) |

##### 📤 Example Request

```http
POST http://localhost:8000/api/v1/users/register
Content-Type: multipart/form-data
```

##### 🎯 **Postman Body Configuration:**

**Body Tab → form-data**
| Key | Type | Value |
|-----|------|-------|
| `fullname` | Text | `Shiv Kant` |
| `email` | Text | `shiv@example.com` |
| `username` | Text | `shivkant` |
| `password` | Text | `mypassword123` |
| `avatar` | **File** | 📁 Select image file |
| `coverImage` | **File** | 📁 Select image file (optional) |

##### ✅ Success Response

```json
{
  "statusCode": 200,
  "data": {
    "_id": "689b808c04b6c243512f63f3",
    "fullname": "Shiv Kant",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg",
    "coverImage": "https://res.cloudinary.com/.../cover.jpg",
    "email": "shiv@example.com",
    "username": "shivkant"
  },
  "message": "🎉 User registered successfully!"
}
```

---

#### 🔓 2. Login User

> **Authenticate user and receive access tokens**

|                   |                    |
| ----------------- | ------------------ |
| **Endpoint**      | `POST /login`      |
| **Content-Type**  | `application/json` |
| **Auth Required** | ❌ No              |

##### 📥 Request Body

```json
{
  "email": "shiv@example.com",
  "password": "mypassword123"
}
```

##### 📤 Example Request

```http
POST http://localhost:8000/api/v1/users/login
Content-Type: application/json
```

##### 🎯 **Postman Body Configuration:**

**Body Tab → raw → JSON**

```json
{
  "email": "shiv@example.com",
  "password": "mypassword123"
}
```

##### ✅ Success Response

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "689b808c04b6c243512f63f3",
      "fullname": "Shiv Kant",
      "avatar": "https://res.cloudinary.com/.../avatar.jpg",
      "email": "shiv@example.com",
      "username": "shivkant"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "🚀 User logged in successfully!"
}
```

> **🍪 Cookies Set:** `accessToken` and `refreshToken` are automatically stored as HTTP-only cookies

---

#### 🚪 3. Logout User

> **End user session and clear tokens**

|                   |                |
| ----------------- | -------------- |
| **Endpoint**      | `POST /logout` |
| **Auth Required** | ✅ Yes         |

##### 📤 Example Request

```http
POST http://localhost:8000/api/v1/users/logout
Authorization: Bearer <accessToken>
```

##### 🎯 **Postman Body Configuration:**

**Body Tab:** ❌ **No Body Required**  
**Headers Tab:** ✅ **Authorization Required**
| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{accessToken}}` |

##### ✅ Success Response

```json
{
  "statusCode": 200,
  "data": {},
  "message": "👋 User logged out successfully!"
}
```

---

#### 🔄 4. Refresh Access Token

> **Get new tokens when access token expires**

|                   |                       |
| ----------------- | --------------------- |
| **Endpoint**      | `POST /refresh-token` |
| **Content-Type**  | `application/json`    |
| **Auth Required** | ⭕ Refresh Token      |

##### 📥 Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### 📤 Example Request

```http
POST http://localhost:8000/api/v1/users/refresh-token
Content-Type: application/json
```

##### 🎯 **Postman Body Configuration:**

**Body Tab → raw → JSON**

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

##### ✅ Success Response

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "🔄 Access token refreshed successfully!"
}
```

---

### ⚙️ Account Management

#### 🔒 5. Change Password

> **Update user password securely**

|                   |                         |
| ----------------- | ----------------------- |
| **Endpoint**      | `POST /change-password` |
| **Content-Type**  | `application/json`      |
| **Auth Required** | ✅ Yes                  |

##### 📥 Request Body

```json
{
  "oldpassword": "securepass123",
  "newPassword": "newsecurepass456"
}
```

##### 📤 Example Request

```http
POST http://localhost:8000/api/v1/users/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json
```

##### 🎯 **Postman Body Configuration:**

**Body Tab → raw → JSON**

```json
{
  "oldpassword": "mypassword123",
  "newPassword": "mynewpassword456"
}
```

**Headers Tab:** ✅ **Authorization Required**
| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{accessToken}}` |

##### ✅ Success Response

```json
{
  "statusCode": 200,
  "data": {},
  "message": "🔐 Password changed successfully!"
}
```

---

#### 👤 6. Get Current User

> **Retrieve logged-in user's profile**

|                   |                     |
| ----------------- | ------------------- |
| **Endpoint**      | `GET /current-user` |
| **Auth Required** | ✅ Yes              |

##### 📤 Example Request

```http
GET http://localhost:8000/api/v1/users/current-user
Authorization: Bearer <accessToken>
```

##### 🎯 **Postman Body Configuration:**

**Body Tab:** ❌ **No Body Required**  
**Headers Tab:** ✅ **Authorization Required**
| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{accessToken}}` |

##### ✅ Success Response

```json
{
  "statusCode": 200,
  "data": {
    "_id": "689b808c04b6c243512f63f3",
    "fullname": "Shiv Kant",
    "email": "shiv@example.com",
    "username": "shivkant",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg",
    "coverImage": "https://res.cloudinary.com/.../cover.jpg"
  },
  "message": "📋 Current user details retrieved"
}
```

---

#### ✏️ 7. Update Account Details

> **Modify user profile information**

|                   |                         |
| ----------------- | ----------------------- |
| **Endpoint**      | `PATCH /update-account` |
| **Content-Type**  | `application/json`      |
| **Auth Required** | ✅ Yes                  |

##### 📥 Request Body

```json
{
  "fullname": "John Doe Updated",
  "email": "john.new@example.com"
}
```

##### 📤 Example Request

```http
PATCH http://localhost:8000/api/v1/users/update-account
Authorization: Bearer <accessToken>
Content-Type: application/json
```

##### 🎯 **Postman Body Configuration:**

**Body Tab → raw → JSON**

```json
{
  "fullname": "Shiv Kant Updated",
  "email": "shiv.new@example.com"
}
```

**Headers Tab:** ✅ **Authorization Required**
| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{accessToken}}` |

##### ✅ Success Response

```json
{
  "statusCode": 200,
  "data": {
    "_id": "689b808c04b6c243512f63f3",
    "fullname": "Shiv Kant Updated",
    "email": "shiv.new@example.com",
    "username": "shivkant",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg"
  },
  "message": "✅ Account details updated successfully!"
}
```

---

#### 🖼️ 8. Update Avatar

> **Change profile picture**

|                   |                        |
| ----------------- | ---------------------- |
| **Endpoint**      | `PATCH /update-avatar` |
| **Content-Type**  | `multipart/form-data`  |
| **Auth Required** | ✅ Yes                 |

##### 📤 Example Request

```http
PATCH http://localhost:8000/api/v1/users/update-avatar
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

##### 🎯 **Postman Body Configuration:**

**Body Tab → form-data**
| Key | Type | Value |
|-----|------|-------|
| `avatar` | **File** | 📁 Select new image file |

**Headers Tab:** ✅ **Authorization Required**
| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{accessToken}}` |

##### ✅ Success Response

```json
{
  "statusCode": 200,
  "data": {
    "_id": "689b808c04b6c243512f63f3",
    "fullname": "Shiv Kant",
    "avatar": "https://res.cloudinary.com/.../new-avatar.jpg",
    "username": "shivkant"
  },
  "message": "🖼️ Avatar updated successfully!"
}
```

---

#### 🌄 9. Update Cover Image

> **Change channel cover image**

|                   |                       |
| ----------------- | --------------------- |
| **Endpoint**      | `PATCH /update-cover` |
| **Content-Type**  | `multipart/form-data` |
| **Auth Required** | ✅ Yes                |

##### 📤 Example Request

```http
PATCH http://localhost:8000/api/v1/users/update-cover
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

##### 🎯 **Postman Body Configuration:**

**Body Tab → form-data**
| Key | Type | Value |
|-----|------|-------|
| `coverImage` | **File** | 📁 Select new cover image file |

**Headers Tab:** ✅ **Authorization Required**
| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{accessToken}}` |

---

### 📊 Profile & Data

#### 📺 10. Get User Channel Profile

> **View public channel profile with stats**

|                   |                          |
| ----------------- | ------------------------ |
| **Endpoint**      | `GET /channel/:username` |
| **Auth Required** | ✅ Yes                   |

##### 📤 Example Request

```http
GET http://localhost:8000/api/v1/users/channel/shivkant
Authorization: Bearer <accessToken>
```

##### 🎯 **Postman Body Configuration:**

**Body Tab:** ❌ **No Body Required**  
**URL:** ✅ **Path Parameter Required**  
Replace `:username` with actual username: `shivkant`

**Headers Tab:** ✅ **Authorization Required**
| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{accessToken}}` |

##### ✅ Success Response

```json
{
  "statusCode": 200,
  "data": {
    "_id": "689b808c04b6c243512f63f3",
    "fullname": "Shiv Kant",
    "username": "shivkant",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg",
    "coverImage": "https://res.cloudinary.com/.../cover.jpg",
    "subscriberCount": 1250,
    "channelsSubscribedToCount": 45,
    "isSubscribed": false
  },
  "message": "📺 User channel profile fetched successfully!"
}
```

| Field                       | Description                              |
| --------------------------- | ---------------------------------------- |
| `subscriberCount`           | 👥 Number of subscribers                 |
| `channelsSubscribedToCount` | 📺 Channels this user subscribes to      |
| `isSubscribed`              | ✅/❌ Whether current user is subscribed |

---

#### 📺 11. Get Watch History

> **Retrieve user's video viewing history**

|                   |                      |
| ----------------- | -------------------- |
| **Endpoint**      | `GET /watch-history` |
| **Auth Required** | ✅ Yes               |

##### 📤 Example Request

```http
GET http://localhost:8000/api/v1/users/watch-history
Authorization: Bearer <accessToken>
```

##### 🎯 **Postman Body Configuration:**

**Body Tab:** ❌ **No Body Required**  
**Headers Tab:** ✅ **Authorization Required**
| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{accessToken}}` |

##### ✅ Success Response

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "video_id_1",
      "title": "🎬 Amazing Tutorial Video",
      "description": "Learn something awesome in this video...",
      "thumbnail": "https://res.cloudinary.com/.../thumb1.jpg",
      "duration": 300,
      "views": 12500,
      "owner": {
        "_id": "owner_id",
        "fullname": "Content Creator",
        "username": "creator123",
        "avatar": "https://res.cloudinary.com/.../owner-avatar.jpg"
      }
    }
  ],
  "message": "📺 Watch history fetched successfully!"
}
```

> **📅 Note:** Videos are returned in reverse chronological order (most recent first)

---

## 🛠️ Testing with Postman

### 🔧 Initial Setup

1. **🍪 Enable Cookies**
   - Settings → General → ✅ "Send cookies with requests"
   - Settings → General → ✅ "Automatically follow redirects"

2. **🌍 Environment Setup**
   ```json
   {
     "baseUrl": "http://localhost:8000/api/v1/users",
     "accessToken": "{{token_from_login}}",
     "refreshToken": "{{refresh_from_login}}"
   }
   ```

### 📋 Postman Body Configuration Quick Reference

| Content Type    | Postman Body Tab    | Usage                                   |
| --------------- | ------------------- | --------------------------------------- |
| **JSON Data**   | `Body → raw → JSON` | Login, password change, account updates |
| **File Upload** | `Body → form-data`  | Registration, avatar/cover updates      |
| **No Body**     | `Body → none`       | GET requests, logout                    |

### 🎯 **Step-by-Step Postman Setup:**

#### For JSON Requests (Login, Updates):

1. Select **Body** tab
2. Choose **raw** option
3. Select **JSON** from dropdown
4. Paste JSON data in text area

#### For File Uploads (Register, Avatar):

1. Select **Body** tab
2. Choose **form-data** option
3. Add key-value pairs:
   - Text fields: Set Type to **Text**
   - File fields: Set Type to **File** → Click **Select Files**

#### For GET Requests (Profile, History):

1. **Body** tab: Select **none**
2. **Headers** tab: Add Authorization header

### 📋 Common Headers Template

```
# For JSON requests
Authorization: Bearer {{accessToken}}
Content-Type: application/json

# For file uploads
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data
```

### 🔄 Workflow Recommendations

| Step | Action                     | Endpoint                   |
| ---- | -------------------------- | -------------------------- |
| 1️⃣   | Register new user          | `POST /register`           |
| 2️⃣   | Login to get tokens        | `POST /login`              |
| 3️⃣   | Save tokens to environment | Manual step                |
| 4️⃣   | Test protected routes      | Any authenticated endpoint |
| 5️⃣   | Refresh when expired       | `POST /refresh-token`      |

---

## ❌ Error Handling

### 📋 Standard Error Format

```json
{
  "statusCode": 400,
  "data": null,
  "message": "❌ Detailed error description",
  "success": false
}
```

### 🚨 Common Error Codes

| Code    | Type            | Description            | Example                    |
| ------- | --------------- | ---------------------- | -------------------------- |
| **400** | 🔴 Bad Request  | Invalid input data     | Missing required fields    |
| **401** | 🟡 Unauthorized | Authentication failed  | Invalid/expired token      |
| **404** | 🔵 Not Found    | Resource doesn't exist | User not found             |
| **409** | 🟠 Conflict     | Duplicate data         | Username already exists    |
| **500** | ⚫ Server Error | Internal server issues | Database connection failed |

### 🛡️ Error Examples

```json
// 401 Unauthorized
{
  "statusCode": 401,
  "message": "🔒 Access denied. Please login first.",
  "success": false
}

// 409 Conflict
{
  "statusCode": 409,
  "message": "⚠️ Username 'johndoe' is already taken.",
  "success": false
}
```

---

## 💡 Tips & Best Practices

### 🔐 Security Best Practices

| ✅ **DO**               | ❌ **DON'T**                   |
| ----------------------- | ------------------------------ |
| Use HTTPS in production | Store tokens in localStorage   |
| Validate input data     | Send passwords in GET requests |
| Handle token expiration | Ignore error responses         |
| Use strong passwords    | Hardcode credentials           |

### 🚀 Performance Tips

- **📦 File Uploads**: Keep images under 5MB for better performance
- **🔄 Token Management**: Implement automatic refresh logic
- **🎯 Pagination**: Use pagination for large datasets (watch history)
- **🔍 Error Logging**: Log errors for debugging

### 📱 Frontend Integration

```javascript
// Example: Auto-refresh token on 401
const apiCall = async (endpoint, options) => {
  let response = await fetch(endpoint, options);

  if (response.status === 401) {
    // Auto-refresh token
    await refreshAccessToken();
    // Retry original request
    response = await fetch(endpoint, options);
  }

  return response.json();
};
```

---

<div align="center">

### 🎬 **VidTube API Documentation**

_Made with ❤️ for developers_

**📚 [More Docs](https://github.com/shivkantx/VidTube)** • **🐛 [Report Issue](https://github.com/shivkantx/VidTube/issues)** • **⭐ [Star on GitHub](https://github.com/shivkantx/VidTube)**

---

_Last updated: 2025 • Version: 1.0.0_

</div>
