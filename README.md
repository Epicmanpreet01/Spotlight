# Spotlight

## Application Overview

**Spotlight** is a full-stack mobile application designed to connect **event organizers (Bookers)** with **professional performers** such as musicians, DJs, dancers, anchors, and artists.  
The platform streamlines the entire event booking lifecycle — from event creation and performer discovery to secure booking confirmation and completion.

The app focuses on **real-world usability**, **role-based workflows**, and **clear user feedback**, ensuring a reliable and professional booking experience for both sides.

---

## Problem Statement

Traditional performer booking is often:
- Manual and unstructured
- Time-consuming
- Lacking transparency
- Prone to miscommunication

Spotlight solves these issues by providing:
- Centralized event creation
- Verified performer profiles
- Structured booking workflows
- Secure booking confirmation
- Real-time status updates
- Clear and responsive user experience

---

## User Roles

### Booker (Event Organizer)
- Create and manage events
- Browse and hire performers
- Track booking status
- Communicate with performers
- Manage multiple events from a single platform

### Performer (Artist)
- Build a professional portfolio
- Upload images and videos
- Apply to available gigs
- Accept or decline bookings
- Complete bookings using OTP verification

---

## Core Features

### Event Management
- Create events with title, category, location, dates, description, and budget
- Image upload for event preview
- Form validation and error handling
- Button buffering during submission to prevent duplicate actions

### Performer Profiles
- Bio and starting price
- Media gallery (images and videos)
- Automatic video thumbnail generation
- Edit portfolio in a dedicated modal
- Safe media removal and updates

### Booking System
- Structured booking lifecycle:
  - Pending
  - Accepted
  - Confirmed
  - Completed
  - Cancelled / Declined
- Role-specific booking actions
- OTP-based event completion
- Real-time status indicators

### Communication
- One-to-one chat between booker and performer
- Chat linked to individual bookings
- Message history preservation
- Keyboard-safe input handling

### User Experience Enhancements
- Loading indicators on all action buttons
- Disabled buttons during API calls
- Clear feedback for every user action
- Prevention of duplicate submissions

---

## Booking Lifecycle Flow

Booker creates an event  
↓  
Performer applies **OR** booker hires directly  
↓  
Booking status: **Pending**  
↓  
Performer accepts booking  
↓  
Booking confirmed  
↓  
Event completed using **OTP verification**

---

## Application Architecture
```css
Frontend (React Native / Expo)
|
├── Authentication & Role Management
|
├── Booker Module
|   ├── Event Creation
|   ├── Event Management
|   └── Performer Hiring
|
├── Performer Module
|   ├── Portfolio Management
|   ├── Gig Applications
|   └── Booking Actions
|
├── Booking System
|   ├── Status Management
|   ├── OTP Verification
|   └── Action Validation
|
├── Chat System
|   ├── Booking-based Conversations
|   └── Message Persistence
|
└── Media Handling
    ├── Image Uploads
    ├── Video Support
    └── Thumbnail Generation
```
---

## Technology Stack

### Frontend
- React Native
- Expo
- Expo Router
- React Query (v5)
- Context API (Theme management)
- Expo Image Picker
- Expo Video Thumbnails

### Backend (Integrated)
- REST API architecture
- Authentication and authorization
- Role-based access control
- Booking lifecycle management
- OTP verification system
- Media upload handling

---

## Button Buffering and State Management

Every critical user action includes:
- Loading indicator
- Temporary button disable state
- Clear visual feedback

This prevents:
- Duplicate API calls
- Accidental multiple submissions
- User confusion during network delays

Examples:
- Create Event
- Apply to Gig
- Hire Performer
- Accept or Decline Booking
- Save Portfolio
- Submit OTP

---

## Security and Reliability

- Role-based action validation
- OTP verification for booking completion
- Backend-validated requests
- Safe state updates
- Controlled navigation flow
- Error handling with user-friendly messages

---

## How to Use the App

### For Bookers
1. Register or log in
2. Create an event
3. Browse or select performers
4. Send booking requests
5. Track booking progress
6. Complete the event

### For Performers
1. Register or log in
2. Set up a portfolio
3. Browse available gigs
4. Apply or accept booking requests
5. Complete bookings using OTP
6. Manage past bookings

---

## Development Principles

- Production-grade architecture

- Clear separation of concerns

- Backend-friendly frontend logic

- No unsafe hook usage

- Consistent UX patterns

- Scalable and maintainable codebase

---

## © Copyright

© 2025 [Your Name] & [Your Friend’s Name]. All rights reserved.

This application is an original product developed independently by the authors.  
The source code, design, workflows, and architecture are protected under a proprietary license.

Unauthorized copying, modification, distribution, or commercial use of this project is strictly prohibited.

See the [LICENSE](LICENSE) file for full license details.

### Authors

- **Sumit Kumar** – Frontend Development, App Architecture, UI/UX  
- **Manpreet Singh** – Backend Development, API Design, Database Integration  

Built as an original idea with a focus on performance, scalability, and real-world usability.

## Conclusion

Spotlight is designed as a real-world event booking platform with a strong focus on usability, reliability, and professional workflows.
It bridges the gap between event organizers and performers by providing a structured, transparent, and secure booking experience.

## Installation (Frontend)

```bash
git clone <repository-url>
cd spotlight
npm install
npx expo start
```




