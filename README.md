# 🔐 NodeJs Authentication Library

A lightweight and secure authentication library for Node.js applications with MySQL support.

## ✨ Features

- Simple and flexible authentication API
- MySQL database integration
- Password hashing with bcrypt
- JWT (JSON Web Token) authentication
- Input validation and sanitization
- Rate limiting protection
- Easy to integrate with any Node.js project

## 🛠️ Installation

1. Install the package:
```bash
npm install node-auth-lib
# or
yarn add node-auth-lib
```

2. Configure environment variables:
```bash
# Create .env file
cp .env.example .env

# Edit with your values
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=auth_db
JWT_SECRET=your_jwt_secret
```

3. Initialize database:
```bash
# Import schema
mysql -u root -p auth_db < database/schema.sql
```

## 🚦 Quick Start

```javascript
const { Auth } = require('node-auth-lib');

// Initialize
const auth = new Auth({
  database: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  }
});

// Register user
await auth.register({
  email: 'user@example.com',
  password: 'securepass',
  name: 'John Doe'
});

// Login user
const { token } = await auth.login({
  email: 'user@example.com',
  password: 'securepass'
});

// Verify token
const user = await auth.verify(token);
```

## 📡 API Reference

### Authentication Methods

#### Register User
```javascript
auth.register({
  email: string,
  password: string,
  name: string
}): Promise<User>
```

#### Login
```javascript
auth.login({
  email: string,
  password: string
}): Promise<{ token: string, user: User }>
```

#### Verify Token
```javascript
auth.verify(token: string): Promise<User>
```

#### Logout
```javascript
auth.logout(token: string): Promise<void>
```

## 🔒 Security Features

- Automatic password hashing with bcrypt
- Configurable JWT expiration
- Built-in rate limiting
- SQL injection prevention
- Input sanitization
- Session management

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Project Structure

```
.
├── lib/
│   ├── Auth.js         # Core authentication logic
│   └── db.js           # MySQL connection handler
├── models/
│   └── User.js         # User model
├── database/
│   └── schema.sql      # MySQL schema
├── .env                # Environment variables
├── example.js          # Usage examples
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

Project Link: [https://github.com/satory33/node-auth-lib](https://github.com/satory33/node-auth-lib)

## 🙏 Acknowledgments

- [MySQL2](https://github.com/sidorares/node-mysql2)
- [JWT](https://jwt.io/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)