# 🍔 Food Delivery Platform with Live Tracking

A full-stack food delivery web application built with the **MERN Stack** featuring real-time order tracking, live location updates, and three dedicated dashboards for Users, Delivery Partners, and Shop Owners.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Google Maps](https://img.shields.io/badge/Google_Maps_API-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## 📖 About the Project

**Food Delivery Platform** is a real-time, full-stack food delivery application inspired by modern platforms like Swiggy and Zomato. It supports three types of users — **Customers**, **Delivery Partners**, and **Shop Owners** — each with their own dedicated dashboard and role-based access. Orders are tracked live using **Socket.io** and **Google Maps API**, giving customers real-time visibility of their delivery.

---

## ✨ Features

### 👤 User Dashboard
- 🔐 Register & Login with secure **JWT authentication**
- 🛒 Browse restaurants and place orders seamlessly
- 📍 **Live order tracking** with real-time delivery partner location on Google Maps
- 🔔 Real-time order status updates via **Socket.io**
- 📜 View complete **order history**
- ⭐ Rate and **review** restaurants after delivery

### 🏪 Shop Owner Dashboard
- 🏬 Manage shop profile and menu items
- 📦 Receive and manage **incoming orders** in real time
- 📊 View order history and customer reviews
- ✅ Update order status (accepted, preparing, ready for pickup)

### 🚴 Delivery Partner Dashboard
- 📋 View and **accept available delivery requests**
- 📍 Share **live location** with the customer in real time
- 🗺️ Navigate to pickup and drop-off using **Google Maps**
- 📜 View completed delivery history

### 🔒 General
- Role-based access control for all three user types
- Secure **JWT** authentication across all dashboards
- Clean, responsive, and **modern UI**
- Real-time communication powered by **WebSockets**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, HTML5, CSS3 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-Time** | Socket.io (WebSockets) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Maps & Location** | Google Maps API |
| **API Style** | RESTful APIs |

---

## 🏗️ System Architecture

```
                        ┌─────────────────────────────────┐
                        │         React Frontend           │
                        │  User │ Shop Owner │ Delivery    │
                        └──────────────┬──────────────────┘
                                       │ HTTP / WebSocket
                        ┌──────────────▼──────────────────┐
                        │      Node.js + Express.js        │
                        │     REST API  +  Socket.io       │
                        └──────┬───────────────┬──────────┘
                               │               │
              ┌────────────────▼──┐     ┌──────▼──────────────┐
              │     MongoDB       │     │   Google Maps API    │
              │  (Data Storage)   │     │  (Live Location)     │
              └───────────────────┘     └─────────────────────┘
```

---

## 📁 Project Structure

```
food-delivery-app/
│
├── client/                        # React frontend
│   ├── public/
│   └── src/
│       ├── components/            # Reusable UI components
│       ├── pages/
│       │   ├── user/              # User dashboard pages
│       │   ├── shopOwner/         # Shop owner dashboard pages
│       │   └── delivery/          # Delivery partner dashboard pages
│       ├── context/               # Auth & socket context
│       ├── socket/                # Socket.io client setup
│       └── App.js
│
├── server/                        # Node.js + Express backend
│   ├── controllers/               # Route logic (user, shop, order, delivery)
│   ├── models/                    # Mongoose schemas
│   ├── routes/                    # API route definitions
│   ├── middleware/                # JWT auth middleware
│   ├── socket/                    # Socket.io event handlers
│   └── server.js
│
├── .env                           # Environment variables (not committed)
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Git](https://git-scm.com/)
- A **Google Maps API Key** (for live tracking)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/food-delivery-app.git
cd food-delivery-app
```

### 2. Install dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Set up environment variables

Create a `.env` file inside the `server/` folder (see [Environment Variables](#-environment-variables) below).

### 4. Run the application

```bash
# Start the backend server (runs on port 5000)
cd server
npm run dev

# In a new terminal, start the frontend (runs on port 5173)
cd client
npm run dev
```

The app will be running at **http://localhost:5173**

---

## 🔑 Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Add this to the `client/` directory as `.env`:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_SERVER_URL=http://localhost:5000
```

> ⚠️ Never commit your `.env` files. They are already included in `.gitignore`.

---


## 👨‍💻 Author

**Harshad Wagatkar**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/harshadwagatkar)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/YOUR_GITHUB_USERNAME)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:harshadwagatkar86@gmail.com)

---


---

<p align="center">⭐ If you found this project helpful, give it a star!</p>
