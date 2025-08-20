# 🎯 VidTube Server Functions - Beautiful Study Tables

---

## 🔐 **AUTHENTICATION FUNCTIONS**

| 🌟 **Function**        | 🎯 **Purpose**     | 🔗 **Route**                    | ⚡ **Key Features**                                                                                                                                            |
| ---------------------- | ------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **registerUser**       | Create new account | `POST /api/users/register`      | • ✅ Input validation<br>• 🔍 Check duplicate users<br>• 🖼️ Upload avatar + cover to Cloudinary<br>• 🗄️ Create user in MongoDB<br>• 🧹 Auto-cleanup on failure |
| **loginUser**          | Sign in user       | `POST /api/users/login`         | • 🔐 Validate credentials<br>• 🎫 Generate JWT tokens<br>• 🍪 Set secure cookies<br>• 📊 Return user data                                                      |
| **logoutUser**         | End session        | `POST /api/users/logout`        | • 🗑️ Clear refresh token from DB<br>• 🍪 Clear all cookies<br>• 🔒 Secure logout                                                                               |
| **refreshAccessToken** | Renew tokens       | `POST /api/users/refresh-token` | • ✅ Validate refresh token<br>• 🔄 Generate new tokens<br>• 🍪 Update cookies<br>• ⏰ Handle expiry                                                           |

---

## 👤 **PROFILE MANAGEMENT**

| 🌟 **Function**           | 🎯 **Purpose**   | 🔗 **Route**                       | ⚡ **Key Features**                                                               |
| ------------------------- | ---------------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| **getCurrentUser**        | Get profile info | `GET /api/users/me`                | • 📊 Return user details<br>• 🚫 Exclude sensitive data<br>• ⚡ Quick lookup      |
| **updateAccountDetails**  | Edit profile     | `PATCH /api/users/update-account`  | • ✏️ Update fullname & email<br>• ✅ Field validation<br>• 🔄 Return updated user |
| **changeCurrentPassword** | Change password  | `PATCH /api/users/change-password` | • 🔐 Verify old password<br>• 🔒 Hash new password<br>• 🛡️ Secure update          |

---

## 🖼️ **IMAGE MANAGEMENT**

| 🌟 **Function**          | 🎯 **Purpose**     | 🔗 **Route**                   | ⚡ **Key Features**                                                                                        |
| ------------------------ | ------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **updateUserAvatar**     | Change profile pic | `PATCH /api/users/avatar`      | • 📤 Upload to Cloudinary<br>• 🔄 Update database URL<br>• 🗑️ Delete temp file<br>• 📊 Return updated data |
| **updateUserCoverImage** | Change cover photo | `PATCH /api/users/cover-image` | • 📤 Upload cover to cloud<br>• 🔄 Update user record<br>• 🧹 File cleanup<br>• 📊 Return profile          |

---

## 📊 **DATA RETRIEVAL**

| 🌟 **Function**           | 🎯 **Purpose**       | 🔗 **Route**                       | ⚡ **MongoDB Magic**                                                                                                                 |
| ------------------------- | -------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **getUserChannelProfile** | Channel page data    | `GET /api/users/channel/:username` | • 🔍 Find by username<br>• 📈 Count subscribers<br>• 📉 Count subscriptions<br>• ✅ Check if subscribed<br>• 🎯 Aggregation pipeline |
| **getWatchHistory**       | User's video history | `GET /api/users/watch-history`     | • 👤 Find user by ID<br>• 📺 Lookup watched videos<br>• 🎭 Get video owner details<br>• 🔗 Nested aggregation                        |

---

## 🔧 **SECURITY FEATURES**

| 🛡️ **Feature**         | 📍 **Implementation**         | 🎯 **Used In**               |
| ---------------------- | ----------------------------- | ---------------------------- |
| **Password Hashing**   | 🔐 bcrypt auto-hash on save   | registerUser, changePassword |
| **JWT Tokens**         | 🎫 Access + Refresh pattern   | login, refresh, all auth     |
| **Secure Cookies**     | 🍪 httpOnly, secure flags     | login, logout, refresh       |
| **Input Validation**   | ✅ Check empty/missing fields | all user input functions     |
| **File Cleanup**       | 🗑️ Delete local after upload  | register, avatar updates     |
| **Token Verification** | 🔍 Validate refresh tokens    | refreshAccessToken           |

---

## 🗄️ **DATABASE OPERATIONS**

| 🎯 **Operation** | 📝 **Functions Using**                             | 💡 **Purpose**          |
| ---------------- | -------------------------------------------------- | ----------------------- |
| **CREATE**       | registerUser                                       | 🆕 New user creation    |
| **READ**         | loginUser, getCurrentUser, getChannelProfile       | 📖 Fetch user data      |
| **UPDATE**       | updateAccountDetails, updateAvatar, changePassword | ✏️ Modify user info     |
| **AGGREGATION**  | getUserChannelProfile, getWatchHistory             | 🔍 Complex data queries |

---

## 📁 **FILE HANDLING FLOW**

| 📋 **Step**    | 🔧 **Component**   | ⚡ **Action**                          |
| -------------- | ------------------ | -------------------------------------- |
| **1. Receive** | Multer middleware  | 📥 Get files, save locally to `/temp/` |
| **2. Upload**  | Cloudinary utility | ☁️ Upload to cloud storage             |
| **3. Store**   | Database update    | 💾 Save Cloudinary URLs                |
| **4. Cleanup** | File system        | 🗑️ Delete local temp files             |

---

## 🚨 **ERROR HANDLING PATTERNS**

| ❌ **Error Type**        | 🔢 **Status Code** | 📍 **Where Used**        | 💬 **Example Message**    |
| ------------------------ | ------------------ | ------------------------ | ------------------------- |
| **Validation Error**     | `400`              | All input validation     | "All fields are required" |
| **Authentication Error** | `401`              | Login, token functions   | "Invalid credentials"     |
| **Not Found Error**      | `404`              | User lookups             | "User not found"          |
| **Conflict Error**       | `409`              | User registration        | "User already exists"     |
| **Server Error**         | `500`              | File upload, DB failures | "Registration failed"     |

---

## 🎫 **JWT TOKEN SYSTEM**

| 🏷️ **Token Type** | ⏰ **Lifespan**   | 🎯 **Purpose**                | 📍 **Storage**           |
| ----------------- | ----------------- | ----------------------------- | ------------------------ |
| **Access Token**  | Short (15-30 min) | 🔐 API authentication         | 🍪 HTTP-only cookie      |
| **Refresh Token** | Long (7-30 days)  | 🔄 Generate new access tokens | 🍪 HTTP-only cookie + DB |

---

## 📊 **API RESPONSE STRUCTURE**

| ✅ **Success Response**                                                                                          | ❌ **Error Response**                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `res.status(200).json(new ApiResponse(200, data, "Success!"))`                                                   | `throw new ApiError(400, "Error message")`                                                                              |
| **Structure:**<br>• `statusCode`: 200<br>• `data`: user object<br>• `message`: success text<br>• `success`: true | **Structure:**<br>• `statusCode`: 400/401/404/500<br>• `message`: error text<br>• `success`: false<br>• `errors`: array |

---

## 🔄 **HELPER FUNCTION**

| 🛠️ **Function**                   | 🎯 **Purpose**  | 📝 **Used By**                | ⚡ **Process**                                                                                                                                |
| --------------------------------- | --------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **generateAccessAndRefreshToken** | Create JWT pair | loginUser, refreshAccessToken | • 🔍 Find user by ID<br>• 🎫 Generate access token<br>• 🎫 Generate refresh token<br>• 💾 Save refresh token to DB<br>• 📤 Return both tokens |
