# Faculty Leave Management System

## Overview

Faculty Leave Management System is a role-based web application designed to streamline faculty leave administration within academic departments.

The system provides secure workflows for Faculty, HODs, and Administrators, ensuring that leave requests are processed efficiently while maintaining proper approval hierarchies and departmental records. The application enforces role-based access control at the backend level and includes advanced leave validation, substitution management, overlap detection, and offline leave handling.

---

## Features

### Faculty

* Secure authentication and authorization
* Apply for full-day or half-day leave
* Request substitute faculty during leave periods
* Automatic leave balance tracking
* View leave history and approval status
* Leave date validation and conflict prevention

### HOD

* View department leave requests
* Approve or reject leave applications
* Review substitute faculty assignments
* View department leave history
* Transaction-safe approval workflow

### Admin

* Create and manage Faculty accounts
* Create and manage HOD accounts
* Manage departments and organizational structure
* View all leave records across departments
* Process offline leave applications submitted manually
* Monitor system-wide leave activity

---

## Advanced Business Rules

### Leave Overlap Detection

The system prevents faculty members from applying for leave on dates that overlap with existing approved or pending leave requests.

### Half-Day Leave Support

Faculty members can apply for half-day leave, providing greater flexibility and more accurate leave accounting.

### Substitute Faculty Assignment

Faculty can assign a substitute instructor while applying for leave, ensuring uninterrupted academic activities.

### Offline Leave Management

Administrators can record and manage leave applications submitted through offline channels, allowing departments to maintain complete leave records.

### Transaction-Safe Approval Handling

Leave approval operations are designed to maintain data consistency and prevent race conditions during approval workflows.

### Role-Based Access Control (RBAC)

Backend-enforced authorization ensures that users can access only the resources and actions permitted by their assigned roles.

---

## Tech Stack

### Frontend

* React 18
* React DOM
* React Scripts

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT Authentication
* HTTP-Only Secure Cookies
* Role-Based Authorization

---

## Project Goals

This project was built to gain practical experience in:

* Backend architecture and workflow design
* REST API development
* Authentication and authorization systems
* Database schema design and validation
* Role-based access control
* Full-stack application development
* Transaction handling and business rule enforcement
* Frontend-backend integration

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/venkat-ramana-paritala/faculty-leave-management-system.git

cd faculty-leave-management-system
```

### 2. Install Backend Dependencies

```bash
cd f-backend

npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `f-backend` directory:

```env
PORT=5000

DB_URL=your_mongodb_connection_string

JWT_SECRET=your_secret_key

ADMIN_PASS=admin_password

FAC_PASS=faculty_default_password

HOD_PASS=hod_default_password
```

### 4. Start Backend Server

```bash
node server.js
```

### 5. Start Frontend Application

```bash
cd ../f-frontend-react

npm install

npm start
```

Open:

```text
http://localhost:3000
```

---

## System Roles

| Role    | Responsibilities                                                |
| ------- | --------------------------------------------------------------- |
| Faculty | Apply leave, assign substitutes, view leave balance and history |
| HOD     | Review, approve, or reject leave requests                       |
| Admin   | Manage users, departments, and offline leave records            |

---

## Future Enhancements

* Email notifications for leave status updates
* Calendar-based leave visualization
* Faculty workload balancing
* Department-wise analytics dashboard
* Multi-level approval workflows
* Audit logs and activity tracking

This project was developed for educational and learning purposes while exploring full-stack web development concepts and enterprise workflow implementation.
