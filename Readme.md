
# 🌿 MediBridge

### Connecting Patients and Ayurvedic Healthcare Professionals

A full-stack telemedicine project designed to simplify doctor discovery, appointment scheduling, online consultations, and digital prescription management.

[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Planned-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Status](https://img.shields.io/badge/Status-In_Development-orange)](https://github.com/ashishpatel0856/MediBridge)
[![GitHub Stars](https://img.shields.io/github/stars/ashishpatel0856/MediBridge?style=social)](https://github.com/ashishpatel0856/MediBridge/stargazers)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Running Locally](#-running-locally)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🩺 Overview

**MediBridge (Amrutam CareConnect)** is a telemedicine project focused on connecting patients with Ayurvedic healthcare professionals through a unified digital platform.

The project aims to simplify traditional healthcare workflows by providing interfaces for patients, doctors, and administrators.

Its intended capabilities include doctor discovery, availability management, appointment booking, consultation tracking, prescription management, and administrative oversight.

### Project Objectives

- Simplify access to Ayurvedic healthcare services.
- Provide a centralized platform for patients and doctors.
- Streamline appointment scheduling and management.
- Support secure, role-based healthcare workflows.
- Design a scalable backend architecture.
- Improve the overall digital consultation experience.

> **Development status:** MediBridge is under active development. The frontend is available in the repository, while the backend implementation and several infrastructure components require further repository setup or verification. Features described as planned should not be interpreted as production-ready.

---

## ✨ Key Features

MediBridge is organized around three primary user roles.

### 👤 Patient Portal

The patient-facing experience is designed around:

- Patient registration and login.
- Personalized dashboard.
- Doctor discovery and filtering.
- Detailed doctor profiles.
- Appointment booking workflows.
- Appointment history and status tracking.
- Access to consultation-related information.

### 👨‍⚕️ Doctor Portal

The doctor-facing interface is designed to support:

- Doctor registration.
- Profile management.
- Availability and appointment-slot management.
- Appointment tracking.
- Consultation management.
- Prescription-related workflows.

### 🛡️ Administrator Portal

Administrative interfaces cover:

- Administrative dashboard.
- Doctor verification workflows.
- Platform monitoring.
- Audit-log views.
- User and consultation oversight.

### Additional Architectural Goals

The project documentation also outlines the following backend capabilities:

| Capability | Intended Implementation |
|---|---|
| Authentication | JWT access and refresh tokens |
| Authorization | Role-based access control |
| Additional security | Multi-factor authentication |
| Booking reliability | Idempotent booking requests |
| Payments | Stripe integration |
| Prescriptions | Digital signatures and verification |
| Database | PostgreSQL |
| Caching | Optional Redis |
| Observability | OpenTelemetry and monitoring tools |

**Note:** These are documented architectural goals. Their operational status depends on completing and verifying the backend implementation.

---

## 🛠 Technology Stack

### Frontend

The following technologies are declared in `frontend/package.json`.

| Technology | Purpose |
|---|---|
| React 19 | User interface development |
| Vite 8 | Development server and build tooling |
| JavaScript | Application logic |
| React Router 7 | Client-side navigation |
| Tailwind CSS 4 | Utility-first styling |
| Axios | HTTP communication |
| Lucide React | Interface icons |
| Stripe.js | Payment integration dependencies |
| UUID | Unique identifier generation |

### Backend and Infrastructure

The existing project documentation proposes the following stack:

| Technology | Purpose | Status |
|---|---|---|
| Backend runtime | REST API implementation | Requires verification |
| PostgreSQL | Relational database | Planned architecture |
| Redis | Caching and locking | Optional |
| Stripe | Payment processing | Integration planned |
| Docker | Containerization | Planned |
| GitHub Actions | CI/CD automation | Planned |
| OpenTelemetry | Distributed tracing | Planned |
| Prometheus / Grafana | Metrics and monitoring | Planned |

The backend runtime and framework should be documented once their source code and dependency manifest are available.

---

## 📁 Project Structure

The publicly visible repository currently contains two top-level application entries and a README.

```text
MediBridge/
│
├── backend/                  # Backend entry; source requires verification
│
├── frontend/                 # React application
│   ├── public/               # Public assets
│   │
│   ├── src/
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # Application contexts
│   │   ├── pages/
│   │   │   ├── auth/         # Authentication screens
│   │   │   ├── patient/      # Patient-facing screens
│   │   │   ├── doctor/       # Doctor-facing screens
│   │   │   └── admin/        # Administration screens
│   │   │
│   │   └── services/         # API communication modules
│   │
│   ├── package.json          # Frontend dependencies and scripts
│   └── ...
│
└── README.md                 # Project documentation
```

The frontend subdirectory layout above follows the project's documented organization. Refer to the current source tree for exact filenames.

### Proposed Documentation Structure

The following directories are recommended additions and are not assumed to exist:

```text
docs/
├── openapi.yaml
├── architecture.md
└── security.md

infra/
└── docker-compose.yml

.github/
└── workflows/
```

---

## 📋 Prerequisites

Before setting up MediBridge, install the following tools.

### Required for Frontend Development

| Software | Requirement |
|---|---|
| Node.js | Version compatible with Vite 8 |
| npm | Compatible with your Node.js installation |
| Git | Latest stable version |
| Code editor | VS Code or equivalent |

Vite 8 requires Node.js 20.19+ or 22.12+. A current supported Node.js LTS release is recommended.

Check your installed versions:

```bash
node --version
npm --version
git --version
```

### Additional Backend Requirements

The documented backend architecture expects:

- PostgreSQL 14 or later.
- Redis 7 or later (optional).
- Backend runtime and dependencies (to be confirmed).
- Docker and Docker Compose (optional, once configured).

---

## 🚀 Installation

### Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/ashishpatel0856/MediBridge.git
```

Navigate into the project directory:

```bash
cd MediBridge
```

### Step 2: Install Frontend Dependencies

Navigate to the frontend directory:

```bash
cd frontend
```

Install the required packages:

```bash
npm install
```

This installs the dependencies defined in `package.json`.

### Step 3: Configure Environment Variables

Create a `.env` file inside the `frontend` directory.

If an `.env.example` file has been added, copy it:

```bash
cp .env.example .env
```

Otherwise, create `.env` manually using the template provided below.

Update the API URL and other required configuration values.

### Step 4: Start the Frontend

Run:

```bash
npm run dev
```

Vite will display the local development URL in your terminal.

The default address is typically:

```text
http://localhost:5173
```

Open this URL in your browser.

> The frontend may require a running backend API for authentication, appointment booking, and other data-dependent operations.

### Step 5: Backend Setup

The repository's existing documentation references a backend server, database migrations, and a local API port of `4000`.

However, the backend source is not currently available as a normal, verifiable directory in the public repository.

Before attempting backend installation:

1. Ensure the backend source is committed and accessible.
2. Confirm its runtime and package manager.
3. Create the required environment configuration.
4. Configure PostgreSQL.
5. Install backend dependencies.
6. Apply the project's actual database migrations.
7. Start the backend using its verified development command.

**Backend installation command:** `[TODO: Add after backend source is available]`

Do not assume that the frontend can perform all application workflows without a configured backend.

---

## 🔐 Environment Configuration

Environment variables allow MediBridge to separate application configuration from source code.

Never commit production credentials or private keys.

### Frontend Environment

Create:

```text
frontend/.env.example
```

Suggested template:

```dotenv
# Backend API URL
VITE_API_BASE_URL=http://localhost:4000/api/v1

# Stripe publishable key (optional until payment integration is configured)
VITE_STRIPE_PUBLISHABLE_KEY=
```

Copy the example into your local environment:

```bash
cp .env.example .env
```

### Backend Environment

The following template reflects the configuration described in the project's existing documentation.

Create `backend/.env.example` when the backend implementation is available:

```dotenv
# Server
PORT=4000

# Database
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/medibridge

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Encryption
ENCRYPTION_KEY=
PRESCRIPTION_SIGNING_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# CORS
CORS_ORIGINS=http://localhost:5173

# Observability (optional)
OTEL_EXPORTER_OTLP_ENDPOINT=
```

These backend variables are a proposed configuration reference. Verify their names and expected formats against the actual backend implementation.

### Security Recommendations

- Add `.env` files to `.gitignore`.
- Never expose backend secrets through `VITE_` variables.
- Use unique, cryptographically secure secrets.
- Keep development and production credentials separate.
- Avoid storing real patient data in development environments.
- Use a secrets manager for production deployments.

---

## 💻 Running Locally

### Frontend Development

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

Vite generates the production build inside the frontend's `dist` directory.

### Preview Production Build

```bash
npm run preview
```

### Available Frontend Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Generate production build |
| `npm run preview` | Preview production build |

These scripts are declared in the frontend package manifest.

Backend execution and testing commands will be added after the backend source is committed and verified.

---

## 📱 Usage Guide

The following walkthrough describes the application's intended end-to-end workflow.

Some steps require a working backend and completed integrations.

### 1. Patient Workflow

1. Open the MediBridge application.
2. Navigate to the registration page.
3. Register as a patient.
4. Sign in using your credentials.
5. Access the patient dashboard.
6. Search for available doctors.
7. View a doctor's profile.
8. Select an available appointment slot.
9. Submit the appointment request.
10. Track the appointment through the patient dashboard.

### 2. Doctor Workflow

1. Register using the doctor registration interface.
2. Complete the required profile information.
3. Wait for administrative verification, where required.
4. Sign in to the doctor dashboard.
5. Configure consultation availability.
6. Review scheduled appointments.
7. Manage consultation progress.
8. Complete prescription-related workflows when supported by the backend.

### 3. Administrator Workflow

1. Sign in with an authorized administrator account.
2. Access the administration dashboard.
3. Review doctor verification requests.
4. Approve or reject requests according to platform policies.
5. Monitor platform activity.
6. Review available audit information.

### Example: Doctor Search

The documented API design supports doctor filtering using parameters such as:

```text
GET /api/v1/doctors?specialty=Ayurveda&page=1&limit=10
```

This example illustrates the intended API contract and requires the corresponding backend endpoint.

---

## 📡 API Documentation

The original project documentation describes a versioned REST API.

**Proposed Base URL:**

```text
http://localhost:4000/api/v1
```

Protected endpoints are designed to use bearer-token authentication:

```http
Authorization: Bearer <access_token>
```

> API endpoints listed below represent the documented backend contract. They should be tested against the backend implementation before being treated as operational.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register/patient` | Register a patient |
| POST | `/auth/register/doctor` | Register a doctor |
| POST | `/auth/login` | Authenticate a user |
| POST | `/auth/refresh` | Refresh an access token |
| POST | `/auth/mfa/setup` | Initiate MFA setup |
| POST | `/auth/mfa/verify` | Verify MFA |
| GET | `/auth/me` | Retrieve current user |

### Doctors and Availability

| Method | Endpoint | Description |
|---|---|---|
| GET | `/doctors` | Search and filter doctors |
| GET | `/doctors/:id` | Retrieve doctor details |
| PUT | `/doctors/profile` | Update doctor profile |
| PATCH | `/doctors/:id/verify` | Verify doctor (admin) |
| GET | `/slots` | Retrieve availability |
| POST | `/slots` | Create availability slots |

### Appointment Booking

| Method | Endpoint | Description |
|---|---|---|
| POST | `/bookings/book` | Create booking request |
| POST | `/bookings/confirm-payment` | Confirm payment |
| GET | `/bookings` | Retrieve user's bookings |
| GET | `/bookings/:id` | Retrieve booking details |
| PATCH | `/bookings/:id/status` | Update booking status |

### Prescriptions and Administration

| Method | Endpoint | Description |
|---|---|---|
| POST | `/prescriptions` | Create prescription |
| GET | `/prescriptions/:consultationId` | Retrieve prescription |
| POST | `/prescriptions/verify` | Verify prescription |
| GET | `/audit` | Retrieve audit logs |
| GET | `/analytics/overview` | Retrieve administrative analytics |

### Example API Request

The documented booking design uses an idempotency key to help prevent duplicate booking operations.

```bash
curl -X POST http://localhost:4000/api/v1/bookings/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Idempotency-Key: YOUR_UNIQUE_REQUEST_ID" \
  -d '{
    "slotId": "YOUR_SLOT_ID",
    "symptoms": "Acidity",
    "paymentMethod": "UPI"
  }'
```

Replace the placeholder values with valid application data.

### API Response Convention

The documented response format uses a data wrapper.

Example:

```json
{
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 120
  }
}
```

Example error structure:

```json
{
  "error": {
    "message": "Slot already booked"
  }
}
```

Actual response schemas should be verified when the backend implementation becomes available.

---

## 🏗 Architecture

MediBridge follows a frontend/backend separation in its documented design.

The following diagram represents the intended architecture rather than a verified production deployment.

```mermaid
flowchart TD
    A[Patient / Doctor / Admin] --> B[React Frontend]

    B --> C[REST API]

    C --> D[(PostgreSQL)]
    C --> E[(Redis - Optional)]
    C --> F[Payment Integration]

    C --> G[Authentication]
    C --> H[Consultation Management]
    C --> I[Prescription Management]
```

### Design Considerations

The proposed backend architecture prioritizes:

- Separation of application responsibilities.
- Secure authentication and authorization.
- Reliable appointment scheduling.
- Prevention of duplicate bookings.
- Structured audit logging.
- Database consistency.
- Scalability and observability.

### Performance Goals

The original project specification identifies these targets:

| Metric | Target |
|---|---|
| Daily consultations | 100,000 |
| Read latency (p95) | Below 200 ms |
| Write latency (p95) | Below 500 ms |
| Availability | 99.95% |

These are architectural objectives, not independently verified performance results.

---

## 📸 Screenshots

Application screenshots will be added as the user interface is finalized.

### Authentication

![Authentication Screenshot](docs/screenshots/authentication.png)

### Patient Dashboard

![Patient Dashboard](docs/screenshots/patient-dashboard.png)

### Doctor Discovery

![Doctor Search](docs/screenshots/doctor-search.png)

### Doctor Dashboard

![Doctor Dashboard](docs/screenshots/doctor-dashboard.png)

### Admin Dashboard

![Admin Dashboard](docs/screenshots/admin-dashboard.png)

**Note:** The image paths above are placeholders. Create the `docs/screenshots/` directory and add the corresponding screenshots before publishing this section.

### Demo Video

[Watch Project Demo](#)

`TODO: Replace this placeholder with the actual demonstration video URL.`

---

## 🗺 Future Improvements

The following improvements are planned or recommended for future development.

### Core Development

- [ ] Commit and verify the complete backend source.
- [ ] Complete backend/database integration.
- [ ] Finalize the appointment booking workflow.
- [ ] Complete Stripe payment confirmation.
- [ ] Improve JWT refresh-token handling.
- [ ] Implement secure MFA enrollment.
- [ ] Complete digital prescription workflows.

### User Experience

- [ ] Improve responsive layouts.
- [ ] Add loading states and error handling.
- [ ] Optimize doctor search with debouncing.
- [ ] Improve dashboard usability.
- [ ] Add appointment notifications.
- [ ] Enhance accessibility.

### Security and Reliability

- [ ] Move refresh tokens to secure HTTP-only cookies.
- [ ] Add comprehensive input validation.
- [ ] Implement API rate limiting.
- [ ] Expand role-based access tests.
- [ ] Add concurrency and idempotency tests.
- [ ] Establish a secure secrets-management strategy.

### Developer Experience

- [ ] Add complete `.env.example` files.
- [ ] Publish OpenAPI documentation.
- [ ] Add automated frontend and backend tests.
- [ ] Configure GitHub Actions.
- [ ] Add Docker Compose configuration.
- [ ] Add deployment documentation.
- [ ] Record an application demo.
- [ ] Document the final database schema.

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

Whether you are improving documentation, fixing bugs, or proposing new features, your contributions can help improve MediBridge.

### How to Contribute

**1. Fork the repository**

Click the **Fork** button at the top of the GitHub repository.

**2. Clone your fork**

```bash
git clone https://github.com/YOUR_USERNAME/MediBridge.git
cd MediBridge
```

**3. Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

**4. Make your changes**

Follow the existing project structure and coding conventions.

**5. Verify your changes**

For frontend changes:

```bash
cd frontend
npm install
npm run build
```

Run any additional relevant checks available in the affected package.

**6. Commit your changes**

```bash
git add .
git commit -m "feat: describe your changes"
```

**7. Push your branch**

```bash
git push origin feature/your-feature-name
```

**8. Open a Pull Request**

Submit your pull request against the main repository and describe:

- What you changed.
- Why the change is needed.
- How you tested it.
- Any relevant screenshots.

### Contribution Guidelines

- Keep pull requests focused.
- Follow existing naming conventions.
- Write clear commit messages.
- Update documentation when behavior changes.
- Avoid committing secrets or generated files.
- Do not include real patient or sensitive healthcare data.
- Be respectful in all project discussions.

### Reporting Issues

Found a bug or have a feature suggestion?

[Open an Issue](https://github.com/ashishpatel0856/MediBridge/issues)

Include reproduction steps, expected behavior, actual behavior, and relevant logs where appropriate. Remove credentials and sensitive data before sharing logs.

---

## 📄 License

**License status: To be confirmed.**

The existing project documentation states an intention to distribute MediBridge under the MIT License. However, a standalone license file should be added and verified before describing the repository as MIT-licensed.

If MIT is the intended license, add a root-level `LICENSE` file containing the official MIT License text and the appropriate copyright information.

Until then, do not assume the repository grants unrestricted reuse or redistribution rights.

---

## 👨‍💻 Author

**Ashish Patel**

GitHub: [@ashishpatel0856](https://github.com/ashishpatel0856)

Project Repository:

https://github.com/ashishpatel0856/MediBridge

---

## ⭐ Support the Project

If you find MediBridge interesting or useful, consider giving the repository a star.

Your feedback and contributions are appreciated.

**MediBridge — Bridging the gap between healthcare and technology.**
