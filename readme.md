# @rugved__03/express-jwt-auth

A lightweight, reusable **JWT authentication middleware for Express**, including utilities for generating and verifying access & refresh tokens. Designed to be simple, flexible, and production-friendly.

---

## ✨ Features

- 🔐 Express JWT authentication middleware
- 📌 Supports optional or required authentication
- ⚡ Generate Access & Refresh tokens
- ✔️ Verify tokens programmatically
- 🧱 Custom API Error class included
- 📦 Zero external dependencies except `jsonwebtoken`
- 🧪 Clean, reusable, framework-agnostic design

---

## 📦 Installation

```bash
npm install @rugved__03/express-jwt-auth
```

or

```bash
yarn add @rugved__03/express-jwt-auth
```

---

## 🚀 Quick Start

### 1. Import the library

```js
const {
  createAuthMiddleware,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  ApiError
} = require("@rugved__03/express-jwt-auth");
```

---

## 🔐 Use JWT Middleware in Express

### Protect a route

```js
const express = require("express");
const app = express();

const SECRET = "MY_SECRET_KEY";

app.get(
  "/protected",
  createAuthMiddleware({ secret: SECRET }),
  (req, res) => {
    res.json({
      message: "Protected route accessed successfully",
      user: req.user,
    });
  }
);
```

### How it works:

- Extracts token from `Authorization: Bearer <token>`
- Verifies token using your secret
- Injects decoded payload into `req.user`
- Rejects invalid/missing tokens with `401 Unauthorized`

---

## 🔓 Optional Auth (allow requests without a token)

```js
app.get(
  "/public-or-auth",
  createAuthMiddleware({ secret: SECRET, required: false }),
  (req, res) => {
    res.json({
      message: "This route works with or without authentication",
      user: req.user || null
    });
  }
);
```

---

## 🔑 Generate Tokens

### Access Token

```js
const accessToken = generateAccessToken(
  { id: "123", email: "test@example.com" },
  SECRET,
  "15m" // optional
);
```

### Refresh Token

```js
const refreshToken = generateRefreshToken(
  { id: "123" },
  SECRET,
  "7d" // optional
);
```

---

## 🧐 Verify Token Manually

```js
try {
  const decoded = verifyToken(accessToken, SECRET);
  console.log(decoded);
} catch (err) {
  console.error("Token invalid");
}
```

---

## 🔥 Full Example

```js
const express = require("express");
const {
  createAuthMiddleware,
  generateAccessToken,
  generateRefreshToken
} = require("@rugved__03/express-jwt-auth");

const app = express();
app.use(express.json());

const SECRET = "MY_SECRET";

// Login route
app.post("/login", (req, res) => {
  const user = { id: "u123", name: "Rugved" };

  const accessToken = generateAccessToken(user, SECRET, "15m");
  const refreshToken = generateRefreshToken(user, SECRET, "7d");

  res.json({ accessToken, refreshToken });
});

// Protected route
app.get(
  "/dashboard",
  createAuthMiddleware({ secret: SECRET }),
  (req, res) => {
    res.send(`Hello ${req.user.name}, welcome to the dashboard`);
  }
);

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

## 📁 Project Structure

```
express-jwt-auth/
├── LICENSE
├── package.json
├── Readme.md
└── src/
    ├── index.js
    ├── middleware/
    │   └── auth.js
    └── utils/
        ├── ApiError.js
        └── tokens.js
```

---

## 🛠 API Reference

### `createAuthMiddleware(options)`

| Option   | Type    | Default | Description                             |
|----------|---------|---------|------------------------------------------|
| secret   | string  | —       | JWT signing key                          |
| required | boolean | true    | If false → allows request without token  |

### `generateAccessToken(payload, secret, expiresIn)`

Returns a signed JWT access token.

**Parameters:**
- `payload` (object): Data to encode in the token
- `secret` (string): JWT signing secret
- `expiresIn` (string): Token expiration time (default: "15m")

### `generateRefreshToken(payload, secret, expiresIn)`

Returns a signed refresh token.

**Parameters:**
- `payload` (object): Data to encode in the token
- `secret` (string): JWT signing secret
- `expiresIn` (string): Token expiration time (default: "7d")

### `verifyToken(token, secret)`

Returns decoded payload or throws an error.

**Parameters:**
- `token` (string): JWT token to verify
- `secret` (string): JWT signing secret

---

## 📄 License

MIT License © 2025 **Rugved Agasti**

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## 👤 Author

**Rugved Agasti**

- GitHub: [@rugved__03](https://github.com/rugved__03)
- npm: [@rugved__03](https://www.npmjs.com/~rugved__03)

---

## ⭐ Show your support

Give a ⭐️ if this project helped you!