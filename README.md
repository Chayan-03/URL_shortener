# URL Shortener Backend 🚀

A simple **URL Shortener API** built with **Express.js** and **PocketBase** as a database.  
This backend service allows users to shorten URLs, track their usage, and fetch statistics.

## 📌 **Project Overview**
A URL shortener takes a long URL (e.g., `https://www.example.com/long-url`) and converts it into a short, easy-to-share version (e.g., `short.ly/abc123`).  
This backend provides REST API endpoints to:
- Shorten a single URL (`POST /shorten`)
- Retrieve recent short URLs (`GET /urls/recent`)
- Get active URL stats (`GET /stats/active`)
- Shorten multiple URLs in a batch (`POST /urls/batch`)
- Redirect a short URL to the original (`GET /:shortcode`)

## 🛠 **How It Works**
### **1. Shorten a URL (`POST /shorten`)**
- Receives a long URL and an optional expiration date.
- Generates a random shortcode using `nanoid(6)`.
- Saves the original URL, shortcode, creation date, and expiration date in **PocketBase**.

### **2. Redirect to Original URL (`GET /:shortcode`)**
- Looks up the original URL based on the shortcode.
- If the URL is expired, returns a 404 error.
- If valid, increases the visit count and redirects.

### **3. Fetch Active URL Stats (`GET /stats/active`)**
- Retrieves all non-expired URLs from PocketBase.
- Groups them by their creation date and counts active URLs per day.

### **4. Get Recent URLs (`GET /urls/recent`)**
- Fetches the last 5 shortened URLs from the database.

### **5. Shorten Multiple URLs (`POST /urls/batch`)**
- Accepts an array of URLs and shortens them in bulk.

---

## ⚙️ **Setup and Run Locally**
### **1️⃣ Install Dependencies**
Make sure you have **Node.js** installed, then run:
```sh
    npm install express pocketbase express nanoid
```
### 2️⃣ **Set Up PocketBase Locally**
### 1.Download PocketBase 
### 2.Run PocketBase Server by running this command :
```shell
./pocketbase serve
```
This will start a local PocketBase server at http://127.0.0.1:8090


### 3. Create a Collection in the PocketBase Admin UI:
#### 3.1 Collection Name: urls
#### 3.2 Fields:
#### originalurl (Type: Text)
#### shortcode (Type: Text - Unique)
#### createdate (Type: Date)
#### expirydate (Type: Date, optional)
#### visitcount (Type: Number, default: 0)
### 4. Run the Express Server
```sh 
node index.js
```
The service will start at http://localhost:3000.
## 💡 Example API Usage
### 1.Shorten a URL
Request
```shell
POST /shorten
Content-Type: application/json
{
  "url": "https://example.com/long-url",
  "expirydate": "2025-03-15"
}
```
Response 
```sh
{
  "shortcode": "abc123"
}
```
### 2. Redirect to Original URL
Request: 
```sh 
GET /abc123
```
Response  : (Redirects to original URL)
### 3.Get Active URL Stats
Request:
```sh
GET /stats/active
```
Response : 
```sh
{
  "totalActiveCount": 10,
  "urlsByDay": [
    { "date": "2025-03-10", "count": 5 },
    { "date": "2025-03-11", "count": 5 }
  ]
}
```
### 4. Get Recent URLs
Request:
```sh 
GET /urls/recent
```
Response:
```sh 
{
  "recentUrls": [
    { "shortcode": "xyz789", "originalurl": "https://example.com" }
  ]
}
```
### 5. Shorten Multiple URLs
Requests:
```sh 
POST /urls/batch
Content-Type: application/json
{
  "urls": [
    "https://example.com/one",
    "https://example.com/two"
  ]
}
```
Response: 
```sh
{
  "results": [
    { "originalurl": "https://example.com/one", "shortcode": "abc123" },
    { "originalurl": "https://example.com/two", "shortcode": "def456" }
  ]
}
```
## 🚀 Tech Stack
### Node.js & Express.js - Backend framework
### PocketBase - Lightweight NoSQL database
### NanoID - Generates unique shortcodes

## 📺 Video Demo
[![Watch the video](https://img.youtube.com/vi/08C2N52UaF8/maxresdefault.jpg)](https://youtu.be/08C2N52UaF8)
