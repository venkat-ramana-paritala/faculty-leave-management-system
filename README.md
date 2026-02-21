Faculty Leave Management System
Project Details

The Faculty Leave Management System is a role-based web application designed to manage faculty leave requests within an academic department. The system defines three roles — Admin, HOD, and Faculty — each with controlled access and responsibilities. Faculty members can apply for leave, HOD can approve or reject requests, and Admin manages departments and users. The application enforces business rules and role-based access control at the backend level to ensure secure workflow handling.

Tech Stack

HTML5

CSS3

Vanilla JavaScript

Node.js

Express.js

MongoDB

Why I Built This Project

This project was developed to gain a clear understanding of backend system design and real-world workflow implementation. It focuses on authentication and role-based authorization using secure cookies, RESTful API design, database modeling and validation, and structured backend–frontend communication using the Fetch API. The goal was to understand how authentication, business logic, and database operations work together in a secure and organized system.

Functionality
Faculty

Secure login

Apply for leave with date validation

View leave balance (Total / Used / Remaining)

View leave history and status

HOD

View pending leave requests

Approve or reject requests

View recent department leave history

Admin

Create and manage Faculty and HOD accounts

View all leave records

Maintain departmental structure

Further Improvements

Improve frontend UI/UX design and responsiveness

Allow faculty to apply leave for selected periods with better visualization

Assign an on-duty substitute faculty during leave

Implement leave date overlap detection

Add transaction-safe approval handling

Deploy the application to a cloud platform

Set-up instructions:
  1. clone repository
      git clone https://github.com/venkat-ramana-paritala/faculty-leave-management-system.git
      cd faculty-leave-management-system
  2. Install backend dependencies
      cd f-backend
      npm install
  3. Create a .env file inside the f-backend folder and add the following:
      PORT=5000
      DB_URL=your_mongodb_connection_string
      JWT_SECRET=your_secret_key
      ADMIN_PASS=admin_password
      FAC_PASS=faculty_default_password
      HOD_PASS=hod_default_password
  4. Start the backend server
       node server.js
  5. Open the front end
       Navigate to the f-frontend folder and open index.html in your browser.
