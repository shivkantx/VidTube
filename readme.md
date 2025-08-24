# 🎬 VidTube Backend API

A robust and scalable backend API for a video sharing platform built with Node.js and Express.js. This RESTful API provides all the necessary endpoints for user management, video operations, authentication, and social features like comments, likes, and subscriptions.

## ✨ Features

- **🔐 Authentication & Authorization**: JWT-based secure user authentication
- **🎥 Video Management**: Complete CRUD operations for videos
- **👤 User Management**: User registration, profiles, and account management
- **📤 File Upload**: Video and thumbnail upload with validation
- **💬 Comment System**: Nested comments and replies
- **👍 Like/Dislike System**: Engagement tracking for videos and comments
- **🔔 Subscription System**: User subscription and notification management
- **📊 Analytics**: View tracking and engagement metrics
- **🔍 Search & Filter**: Advanced search functionality with filters
- **📂 Playlist Management**: Create and manage video playlists
- **🛡️ Security**: Input validation, rate limiting, and data sanitization
- **📱 RESTful API**: Clean and intuitive API design
- **🔄 Real-time Features**: Socket.io integration for live interactions

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary/AWS S3
- **Video Processing**: FFmpeg (optional)
- **Validation**: Joi/Express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Logging**: Winston/Morgan
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory
2. Install all dependencies using npm or yarn
3. Create a `.env` file with your environment variables (database URI, JWT secrets, API keys)
4. Start the development server
5. Access the API at your configured port

## 📁 Project Structure

The project follows a clean and organized structure with separate folders for controllers, models, routes, middleware, services, and utilities. The main application logic is contained in the src directory with proper separation of concerns.

## 🔧 API Endpoints

### Authentication Routes

- User registration and login
- Token refresh and logout
- Password reset functionality
- Email verification

### User Routes

- Profile management
- User subscription system
- Avatar upload
- Account settings

### Video Routes

- Video upload and management
- Like/dislike functionality
- View tracking
- Search and filtering
- Trending videos

### Comment Routes

- Add, edit, and delete comments
- Nested replies system
- Comment likes and interactions

### Playlist Routes

- Create and manage playlists
- Add/remove videos from playlists
- Public and private playlist options

## 📊 Database Schema

The application uses MongoDB with well-designed schemas for Users, Videos, Comments, Playlists, and Subscriptions. Each model includes proper validation, indexing, and relationships between entities.

## 🧪 Testing

Comprehensive test suite covering all major functionalities including authentication, CRUD operations, file uploads, and API endpoints. Tests can be run in development, production, and coverage modes.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Hashing**: bcrypt implementation for secure password storage
- **Input Validation**: Comprehensive data validation and sanitization
- **Rate Limiting**: Protection against spam and abuse
- **CORS Configuration**: Secure cross-origin request handling
- **File Upload Security**: Type and size validation for uploads
- **Environment Protection**: Secure handling of sensitive configuration data

## 📈 Performance Optimizations

- Database indexing for optimized queries
- Pagination for efficient data loading
- Caching strategies for frequently accessed data
- Media compression and optimization
- Connection pooling for database efficiency

## 🌐 Deployment

The application is deployment-ready for various platforms including Railway, Heroku, AWS, and other cloud providers. Environment configuration and production optimizations are included for seamless deployment.

## 📚 API Documentation

Interactive API documentation is available through Swagger/OpenAPI integration, providing detailed endpoint descriptions, request/response examples, and authentication requirements.

## 🤝 Contributing

Contributions are welcome! The project follows standard Git workflow with feature branches, pull requests, and code review processes. Please follow the established coding standards and include tests for new features.

## 📋 Development Roadmap

- WebSocket integration for real-time notifications
- Video transcoding for multiple quality options
- Advanced analytics and reporting
- AI-powered content moderation
- Mobile API optimizations
- Microservices architecture migration
- GraphQL support
- Live streaming capabilities
- Redis caching implementation
- Elasticsearch integration for advanced search

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Shivkant**

- GitHub: [@shivkantx](https://github.com/shivkantx)
- Email: your-email@example.com

## 🙏 Acknowledgments

Thanks to the Express.js community, MongoDB team, Cloudinary for media services, and all contributors who help improve this project.

---

⭐ Don't forget to star this repository if you found it helpful!

## 📞 Support

If you have any questions or need help with setup, please open an issue or contact me directly.
