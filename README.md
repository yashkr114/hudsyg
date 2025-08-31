# Onboarding & Access Tracking System (OATS)

## Overview
OATS (Onboarding & Access Tracking System) is a modern, responsive web application that streamlines employee onboarding and automates access management for organizations. Designed for seamless usability across desktop and mobile, OATS promotes centralized, transparent workflows.

## Features
- Role-based dashboards for Admin, Team Leads, and Employees
- Onboarding checklists and induction tasks
- Secure access request and approval workflows
- Integrated notifications for onboarding, access, and offboarding
- Progress tracking and real-time status updates
- Document upload and management (AWS S3 integration)

## Getting Started

### Prerequisites
- Node.js and npm
- PostgreSQL database
- (For document storage) AWS S3 account

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/techm-comd-vmo2/Onboarding-portal.git
   cd Onboarding-portal
   ```

2. **Install dependencies:**
   ```sh
   cd backend
   npm install
   cd ../src
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in both `backend` and `src` folders and set your secrets, database URL, and AWS credentials.

4. **Start the application:**
   ```sh
   cd backend
   node app.js
   cd ../src
   npm run dev
   ```

5. **Access in your browser:**  
   Open [http://localhost:5173/](http://localhost:5173/)

## Usage
- **Admins:** Manage users, teams, and onboarding workflows. Review analytics and system logs.
- **Team Leads:** Assign induction tasks, approve access requests, and monitor team progress.
- **Employees:** Complete onboarding tasks, submit access requests, and check status updates in real time.

## Technologies Used
- **Frontend:** React.js (Vite)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Cloud & Storage:** AWS S3
- **Libraries:** Nodemailer, Multer, React Quill

## Exact Folder Structure

```
auth-app/
│
├── backend/
│   ├── app.js
│   ├── db.js
│   ├── .env.example
│   ├── login_calls/
│   ├── offboard_req_calls/
│   ├── role_based_calls/
│   │   ├── admin_calls.js
│   │   ├── common_calls.js
│   │   ├── teams_calls.js
│   ├── alarm_calls/
│   │   └── alarm_calls.js
│   ├── application_access_calls/
│   │   └── application_access_calls.js
│   ├── task_manage_calls/
│   │   └── task_manage_calls.js
│   ├── employee_ui_edit_calls/
│   ├── migrations/
│   ├── uploads/
│   │   └── tasks/
│   ├── mailer.js
│   ├── hash.js
│   ├── password.js
│   └── ...
│
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── assets/
│   │   ├── background.png
│   │   ├── logo.png
│   │   ├── logo1.png
│   │   ├── react.svg
│   ├── auth/
│   ├── components/
│   ├── constants/
│   ├── dashboard/
│   │   ├── admin-dashboard/
│   │   ├── team-dashboard/
│   │   ├── admin-team-features/
│   │   ├── client-dashboard/
│   │   └── ...
│   └── ...
│
├── public/
│   └── vite.svg
│
├── README.md
```

## Contributing
Contributions are welcome! Please see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## License
Distributed under the MIT License. See [docs/LICENSE](docs/LICENSE) for details.

## Contact & Support
For questions or issues, please email sahdevalish0@gmail.com.
