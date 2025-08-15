## 📋 Complete API Commands Table

| #      | Operation               | HTTP Method | Endpoint                          | Auth Required    | Content Type          | Operation Description               |
| ------ | ----------------------- | ----------- | --------------------------------- | ---------------- | --------------------- | ----------------------------------- |
| **1**  | **User Registration**   | `POST`      | `/api/v1/users/register`          | ❌ No            | `multipart/form-data` | Create new user account with avatar |
| **2**  | **User Login**          | `POST`      | `/api/v1/users/login`             | ❌ No            | `application/json`    | Authenticate user and get tokens    |
| **3**  | **User Logout**         | `POST`      | `/api/v1/users/logout`            | ✅ Yes           | -                     | End session and clear tokens        |
| **4**  | **Refresh Token**       | `POST`      | `/api/v1/users/refresh`           | ⚠️ Refresh Token | `application/json`    | Get new access token                |
| **5**  | **Change Password**     | `PATCH`     | `/api/v1/users/change-password`   | ✅ Yes           | `application/json`    | Update user password                |
| **6**  | **Get Current User**    | `GET`       | `/api/v1/users/me`                | ✅ Yes           | -                     | Retrieve logged-in user profile     |
| **7**  | **Update Account**      | `PATCH`     | `/api/v1/users/account`           | ✅ Yes           | `application/json`    | Update profile information          |
| **8**  | **Update Avatar**       | `PATCH`     | `/api/v1/users/avatar`            | ✅ Yes           | `multipart/form-data` | Change profile picture              |
| **9**  | **Update Cover Image**  | `PATCH`     | `/api/v1/users/cover-image`       | ✅ Yes           | `multipart/form-data` | Change cover/banner image           |
| **10** | **Get Channel Profile** | `GET`       | `/api/v1/users/channel/:username` | ⚠️ Optional      | -                     | View public channel with stats      |
| **11** | **Get Watch History**   | `GET`       | `/api/v1/users/history`           | ✅ Yes           | -                     | Retrieve user's video history       |

---

# VidTube User API Documentation

## 🚀 Base Configuration

- **Base URL**: `http://localhost:8000`
- **API Prefix**: `/api/v1`
- **Database**: MongoDB/Mongoose
- **Authentication**: JWT (access/refresh tokens)
- **Token Storage**: httpOnly cookies + Bearer header support

## 🔐 Authentication System

### Token Management

- **Access Token**: Short-lived, for API requests
- **Refresh Token**: Long-lived, for token renewal
- **Storage**: httpOnly cookies (secure in production)
- **Fallback**: Authorization Bearer header

### Content Types

- **Standard Requests**: `application/json`
- **File Uploads**: `multipart/form-data` (avatar, coverImage)

## 📚 API Endpoints

### 1. User Registration

```http
POST /api/v1/users/register
```

**Authentication**: ❌ Not required

**Content-Type**: `multipart/form-data`

**Request Body**:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `fullname` | string | ✅ Yes | User's full name |
| `email` | string | ✅ Yes | Valid email address |
| `username` | string | ✅ Yes | Will be lowercased |
| `password` | string | ✅ Yes | Strong password required |
| `avatar` | File | ✅ Yes | Profile image (mandatory) |
| `coverImage` | File | ❌ No | Cover/banner image |

**🎯 Postman Configuration:**

- **Body Tab**: form-data
- **Fields**: Add each field with appropriate type (Text/File)

**Success Response** (201 Created):

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
  "message": "🎉 User registered successfully!"
}
```

**📝 Notes**:

- Avatar upload is mandatory
- Failed registrations trigger automatic file cleanup
- Files uploaded to Cloudinary

---

### 2. User Login

```http
POST /api/v1/users/login
```

**Authentication**: ❌ Not required

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "StrongPass#123"
  // Optional: "username": "handle"
}
```

**Success Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "...",
      "fullname": "...",
      "email": "...",
      "username": "...",
      "avatar": "https://...",
      "coverImage": ""
    },
    "accessToken": "...",
    "refreshToken": "..."
  },
  "message": "User logged in successfully!"
}
```

**📝 Notes**:

- Sets httpOnly cookies: `accessToken`, `refreshToken`
- Supports login with email OR username
- Password validated server-side

---

### 3. User Logout

```http
POST /api/v1/users/logout
```

**Authentication**: ✅ Required

**Behavior**:

- Clears `user.refreshToken` in database
- Clears `accessToken` and `refreshToken` cookies

**Success Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {},
  "message": "User logged out successfully!"
}
```

---

### 4. Refresh Access Token

```http
POST /api/v1/users/refresh
```

**Authentication**: ⚠️ Requires valid refresh token

**Content-Type**: `application/json`

**Request Options**:

- **Preferred**: Refresh token from cookies (automatic)
- **Alternative**: JSON body with `refreshToken`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**🎯 Postman Configuration:**

- **Body Tab**: raw → JSON (if not using cookies)
- **Cookies**: Ensure refreshToken cookie is present

**Success Response** (200 OK):

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "🔄 Access token refreshed successfully"
}
```

**📝 Notes**:

- Validates against `REFRESH_TOKEN_SECRET`
- Matches token with database record
- Rotates both access and refresh tokens on success

---

### 5. Change Password

```http
PATCH /api/v1/users/change-password
```

**Authentication**: ✅ Required

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "oldpassword": "mypassword123",
  "newPassword": "mynewpassword456"
}
```

**🎯 Postman Configuration:**

- **Body Tab**: raw → JSON
- **Headers**: Authorization: Bearer {{accessToken}}

**Success Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {},
  "message": "🔐 Password changed successfully!"
}
```

---

### 6. Get Current User

```http
GET /api/v1/users/me
```

**Authentication**: ✅ Required

**🎯 Postman Configuration:**

- **Body Tab**: none
- **Headers**: Authorization: Bearer {{accessToken}}

**Success Response** (200 OK):

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
  "message": "📋 Current user details"
}
```

---

### 7. Update Account Details

```http
PATCH /api/v1/users/account
```

**Authentication**: ✅ Required

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "fullname": "New Name",
  "email": "new@example.com"
}
```

**Success Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "fullname": "New Name",
    "email": "new@example.com",
    "username": "...",
    "avatar": "https://...",
    "coverImage": ""
  },
  "message": "Account details updated successfully!"
}
```

---

### 8. Update User Avatar

```http
PATCH /api/v1/users/avatar
```

**Authentication**: ✅ Required

**Content-Type**: `multipart/form-data`

**Request Body**:
| Field | Type | Required |
|-------|------|----------|
| `avatar` | File | ✅ Yes |

**🎯 Postman Configuration:**

- **Body Tab**: form-data
- **Field**: avatar (File type) - Select new image file
- **Headers**: Authorization: Bearer {{accessToken}}

**Success Response** (200 OK):

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

### 9. Update Cover Image

```http
PATCH /api/v1/users/cover-image
```

**Authentication**: ✅ Required

**Content-Type**: `multipart/form-data`

**Request Body**:
| Field | Type | Required |
|-------|------|----------|
| `coverImage` | File | ✅ Yes |

**🎯 Postman Configuration:**

- **Body Tab**: form-data
- **Field**: coverImage (File type) - Select new cover image
- **Headers**: Authorization: Bearer {{accessToken}}

**Success Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "_id": "689b808c04b6c243512f63f3",
    "fullname": "Shiv Kant",
    "coverImage": "https://res.cloudinary.com/.../new-cover.jpg",
    "username": "shivkant"
  },
  "message": "🌄 Cover image updated successfully!"
}
```

---

### 10. Get User Channel Profile

```http
GET /api/v1/users/channel/:username
```

**Authentication**: ⚠️ Recommended (for accurate `isSubscribed` value)

**URL Parameters**:
| Parameter | Type | Required |
|-----------|------|----------|
| `username` | string | ✅ Yes |

**Success Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "fullname": "...",
    "username": "...",
    "email": "...",
    "avatar": "https://...",
    "coverImage": "https://...",
    "subscribersCount": 0,
    "channelsSubscribedToCount": 0,
    "isSubscribed": false
  },
  "message": "Channel profile fetched successfully!"
}
```

**📝 Notes**:

- Aggregates subscriber and subscription counts
- `isSubscribed` checks if current user follows this channel

---

### 11. Get Watch History

```http
GET /api/v1/users/history
```

**Authentication**: ✅ Required

**Success Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": [
    {
      "title": "...",
      "description": "...",
      "thumbnail": "https://...",
      "videoUrl": "https://...",
      "owner": {
        "fullname": "...",
        "username": "...",
        "avatar": "https://..."
      },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "message": "Watch history fetched successfully!"
}
```

**📝 Notes**:

- Populates video owner information
- Returns chronological watch history

---

## 🛠️ Utilities & Dependencies

### Token Management

- `generateAccessToken()` - Creates JWT access tokens
- `generateRefreshToken()` - Creates JWT refresh tokens

### File Management

- `uploadOnCloudinary()` - Handles file uploads to Cloudinary
- `deleteFromCloudinary()` - Removes files from Cloudinary

### Response Wrappers

- `ApiResponse` - Standardized success responses
- `ApiError` - Standardized error responses

---

## 📮 Postman Configuration

### Collection Structure

```
📁 VidTube API
├── 👤 Users
│   ├── Register (multipart/form-data)
│   ├── Login (JSON)
│   ├── Refresh Token (JSON/cookies)
│   ├── Logout
│   ├── Get Current User (GET)
│   ├── Change Password (JSON)
│   ├── Update Account (JSON)
│   ├── Update Avatar (multipart/form-data)
│   ├── Update Cover Image (multipart/form-data)
│   ├── Channel Profile (GET)
│   └── Watch History (GET)
```

### Auto-Token Management (Tests Tab)

```javascript
const res = pm.response.json?.() || {};
if (res.accessToken) pm.collectionVariables.set("accessToken", res.accessToken);
if (res.refreshToken)
  pm.collectionVariables.set("refreshToken", res.refreshToken);
const user = res.data?.user || res.user || res.data;
const id = user?._id || user?.id;
if (id) pm.collectionVariables.set("userId", id);
```

### Cookie Handling

- Postman automatically stores cookies from `http://localhost:8000`
- For protected routes, ensure cookies are present in requests
- Alternative: Use `Authorization: Bearer <token>` header

---

## 🗺️ Route Mapping

| Controller Function     | HTTP Method | Route Path                 |
| ----------------------- | ----------- | -------------------------- |
| `registerUser`          | POST        | `/users/register`          |
| `loginUser`             | POST        | `/users/login`             |
| `logoutUser`            | POST        | `/users/logout`            |
| `refreshAccessToken`    | POST        | `/users/refresh`           |
| `changeCurrentPassword` | PATCH       | `/users/change-password`   |
| `getCurrentUser`        | GET         | `/users/me`                |
| `updateAccountDetails`  | PATCH       | `/users/account`           |
| `updateUserAvatar`      | PATCH       | `/users/avatar`            |
| `updateUserCoverImage`  | PATCH       | `/users/cover-image`       |
| `getUserChannelProfile` | GET         | `/users/channel/:username` |
| `getWatchHistory`       | GET         | `/users/history`           |

---

## 💡 Best Practices & Tips

### 🔐 Security Best Practices

| ✅ **DO**                    | ❌ **DON'T**                   |
| ---------------------------- | ------------------------------ |
| Use HTTPS in production      | Store tokens in localStorage   |
| Validate input data          | Send passwords in GET requests |
| Handle token expiration      | Ignore error responses         |
| Use strong passwords         | Hardcode credentials           |
| Implement auto-refresh logic | Log sensitive data             |

### 🚀 Performance Tips

- **📦 File Uploads**: Keep images under 5MB for better performance
- **🔄 Token Management**: Implement automatic refresh logic in frontend
- **🎯 Pagination**: Use pagination for large datasets (watch history)
- **🔍 Error Logging**: Log errors for debugging and monitoring
- **⚡ Caching**: Cache user profile data to reduce API calls

### 📱 Frontend Integration Examples

#### Auto-refresh token on 401

```javascript
const apiCall = async (endpoint, options) => {
  let response = await fetch(endpoint, options);

  if (response.status === 401) {
    // Auto-refresh token
    await refreshAccessToken();
    // Retry original request with new token
    response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
    });
  }

  return response.json();
};
```

#### File upload with progress

```javascript
const uploadFile = (file, endpoint) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return fetch(endpoint, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
};
```

### 🎯 Testing Workflow

| Step | Action                | Endpoint                 | Expected Result              |
| ---- | --------------------- | ------------------------ | ---------------------------- |
| 1️⃣   | Register new user     | `POST /register`         | User created, files uploaded |
| 2️⃣   | Login to get tokens   | `POST /login`            | Tokens received and stored   |
| 3️⃣   | Test current user     | `GET /me`                | User profile returned        |
| 4️⃣   | Update profile        | `PATCH /account`         | Profile updated successfully |
| 5️⃣   | Upload avatar         | `PATCH /avatar`          | New avatar URL returned      |
| 6️⃣   | Check channel profile | `GET /channel/:username` | Channel stats visible        |
| 7️⃣   | Test logout           | `POST /logout`           | Tokens cleared               |

---

<div align="center">

### 🎬 **VidTube User API Documentation**

_Beautiful, comprehensive API documentation for developers_

**📚 [GitHub Repository](https://github.com/your-username/VidTube)** • **🐛 [Report Issues](https://github.com/your-username/VidTube/issues)** • **⭐ [Star Project](https://github.com/your-username/VidTube)**

---

_Last updated: August 2025 • Version: 1.0.0 • Made with ❤️ for developers_

</div>
