# 📅 Predictive Content Publishing Scheduler

An **AI-powered content scheduling platform** that analyzes historical engagement data to recommend optimal publishing times and generate high-performing headlines.  
The application features a **drag-and-drop calendar**, **analytics dashboard**, and **Gemini-powered insights** to help creators and marketers maximize engagement across platforms.

---

## ✨ Features

- 📊 **Historical Engagement Tracking**
  - Likes, shares, comments, clicks, impressions
  - Auto-calculated engagement score per post

- 🗓 **Interactive Scheduling Calendar**
  - Drag-and-drop scheduling and rescheduling
  - Day, week, and time-grid views (FullCalendar)

- 🤖 **AI-Powered Insights (Gemini API)**
  - Best posting times by platform
  - High-performing content patterns
  - Platform-specific engagement insights

- ✍️ **AI-Generated Headlines**
  - Catchy, platform-aware headline suggestions
  - Based on top-performing historical posts

- 📈 **Analytics Dashboard**
  - Engagement trends over time
  - Platform-wise performance
  - Engagement distribution charts

- 📤 **CSV Export**
  - Export scheduled posts for external workflows or mock publishing APIs

---

## 🧠 Tech Stack

### Frontend
- React + TypeScript
- Vite
- FullCalendar.io
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB (Aggregation Pipelines)
- Mongoose

### AI
- Google Gemini API
- Custom `geminiService` for analysis and generation

---

## 📁 Project Structure

```bash
content-scheduler/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── MetricsChart.tsx
│   │   │   ├── PostList.tsx
│   │   │   ├── AIRecommendations.tsx
│   │   │   └── ScheduleForm.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── csvExport.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── vite.config.ts
│
└── server/                     # Node.js backend
    ├── models/
    │   ├── Post.js
    │   └── Metric.js
    ├── routes/
    │   ├── posts.js
    │   ├── metrics.js
    │   └── ai.js
    ├── controllers/
    │   ├── postController.js
    │   ├── metricController.js
    │   └── aiController.js
    ├── services/
    │   ├── geminiService.js
    │   └── analyticsService.js
    ├── config/
    │   └── db.js
    ├── data/
    │   └── sampleData.js
    ├── server.js
    └── .env.example

## ⚙️ Backend Setup

**1. Install Dependencies**
-cd server
-npm install
**2. Environment Variables**
-Create a .env file inside the server directory:

-.env
    -PORT=5000
    -MONGODB_URI=your_mongodb_connection_string
    -GEMINI_API_KEY=your_gemini_api_key
    -NODE_ENV=development

**3. Database Connection**
-MongoDB connection is handled in config/db.js
-Application exits automatically if the connection fails
-Database connection is initialized before routes are registered in server.js

**4. Data Models**
-Post
-title, content, platform
-scheduledTime, publishedTime
-status (draft / scheduled / published)
-aiSuggestedHeadline, aiSuggestedTime
-metrics (likes, shares, comments, clicks, impressions)
-engagementScore (auto-computed using a pre-save hook)

-Metric
    -engagementRate, reach

    -hourOfDay, dayOfWeek

    -Indexed for efficient time-based queries

**5. Services**
-analyticsService.js
-Engagement grouped by hour, day, and platform
-Top-performing posts
-Platform-wise aggregates
-Engagement trends over time
-geminiService.js
-Engagement pattern analysis
-AI-powered headline generation
-Engagement prediction with confidence score and reasoning

**6. API Routes**
-/api/posts
    -GET – List posts (filters supported)
    -POST – Create post (draft or scheduled)
    -PUT – Update post
    -DELETE – Remove post
    -PUT /bulk-schedule – Update multiple scheduled times (calendar drag-and-drop)

-/api/metrics
    -GET /engagement
    -GET /top-posts
    -GET /platform-stats
    -GET /trends

-/api/ai
    -GET /optimal-times
    -POST /headlines
    -POST /predict-engagement

**7. Seed Sample Data**
    -npm run seed
    -Seeds multi-platform posts with varied engagement data for demo and testing purposes.

**8. Run Backend**
-npm run dev
-API Base URL:
-http://localhost:5000/api

##🖥 Frontend Setup
**1. Install Dependencies**
-cd client
-npm install
**2. Environment Variables (Optional)**
-Create client/.env:
-VITE_API_URL=http://localhost:5000/api
**3. Run Frontend**
-npm run dev
-Open in browser:
-http://localhost:5173


##🧩 Frontend Overview
###Core Components
-Dashboard – Global state management, filters, and layout
-Calendar – Drag-and-drop scheduling interface
-PostList – Draft, Scheduled, and Published posts view
-MetricsChart – Engagement trends and platform analytics
-AIRecommendations – Gemini-powered insights panel
-ScheduleForm – Create and update posts with AI-generated headlines

## Utilities
-CSV export for scheduled posts
-Formatting helpers for engagement rates, platforms, and status badges

## 🚀 Usage Flow
-Seed sample data
-Start backend and frontend servers
-Browse posts and analytics dashboard
-View AI-recommended posting times
-Generate AI-powered headlines
-Schedule posts using the interactive calendar
-Export scheduled posts as CSV files