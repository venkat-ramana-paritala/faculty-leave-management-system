# Faculty Leave Management System

A role-based leave management platform designed for academic departments to streamline faculty leave requests, approval workflows, substitution assignments, and departmental leave administration.

## Overview

Faculty Leave Management System provides a structured workflow for managing leave applications within educational institutions. The platform supports Faculty, HOD, and Administrator roles, ensuring secure access control and efficient leave processing.

The system includes advanced features such as half-day leave requests, substitute faculty assignment, leave overlap detection, offline leave management, and transaction-safe approval handling to mimic real-world departmental workflows.

---

## Key Features

### Faculty

* Secure login and authentication
* Apply for full-day and half-day leave
* Assign substitute faculty during leave periods
* View leave balance (Total, Used, Remaining)
* Track leave request history and approval status
* Automatic leave validation and conflict detection

### HOD

* Review pending leave applications
* Approve or reject leave requests
* Monitor substitute faculty assignments
* Access departmental leave history
* Manage leave workflow approvals

### Administrator

* Create and manage Faculty accounts
* Create and manage HOD accounts
* Manage department structure
* View organization-wide leave records
* Handle offline leave applications
* Monitor system activity

---

## Advanced Functionalities

### Leave Overlap Detection

Prevents faculty members from applying for leave on dates that conflict with existing approved or pending leave requests.

### Half-Day Leave Support

Allows faculty members to request leave for a specific portion of a working day.

### Substitute Faculty Assignment

Enables assignment of an alternate faculty member to handle academic responsibilities during leave periods.

### Offline Leave Processing

Administrators can manually record and manage leave requests submitted through offline channels.

### Transaction-Safe Approval Handling

Ensures data consistency during leave approval and status update operations.

### Role-Based Access Control (RBAC)

Backend-enforced authorization ensures users can access only the resources and actions permitted by their assigned role.

---

## Tech Stack

### Frontend

* React 18
* React DOM
* React Router
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT Authentication
* HTTP-Only Cookies
* Role-Based Authorization
* Protected Routes

---

## Project Objectives

This project was built to gain hands-on experience with:

* Backend architecture design
* RESTful API development
* Authentication and authorization
* Database schema modeling
* Full-stack application development
* Business rule implementation
* Role-based access control
* Frontend and backend integration

---

## Installation

### Clone Repository

```bash
git clone https://github.com/venkat-ramana-paritala/faculty-leave-management-system.git

cd faculty-leave-management-system
```

### Backend Setup

```bash
cd f-backend

npm install
```

Create a `.env` file inside `f-backend`:

```env
PORT=5000
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
ADMIN_PASS=admin_password
PRINCIPAL_PASS=principal_password
FRONTEND_URL=http://localhost:3000
```

Start backend server:

```bash
node server.js
```

### Frontend Setup

```bash
cd ../f-frontend-react

npm install

npm start
```

Application will run at:

```text
http://localhost:3000
```

---

## System Roles

| Role    | Responsibilities                                                      |
| ------- | --------------------------------------------------------------------- |
| Faculty | Apply leave, assign substitutes, view leave balance and leave history |
| HOD     | Review, approve, or reject leave requests                             |
| Admin   | Manage users, departments, and offline leave records                  |

---

## Future Improvements

* Email notifications
* Calendar-based leave visualization
* Department analytics dashboard
* Multi-level approval workflows
* Audit logging and activity tracking
* Cloud deployment with CI/CD

---

## Learning Outcomes

This project helped strengthen understanding of authentication systems, role-based authorization, workflow-driven backend development, database design, API integration, and enterprise-style application architecture.

---

## License

Developed for educational and learning purposes.
