# Digitize - Deed Record Digitization System

Digitize is a powerful, modern web application designed to streamline the process of digitizing and managing deed records. Built with Next.js 15, it provides a robust platform for data entry, validation, and regional record organization.

## 🚀 Key Features

- **🔐 Secure Authentication**: Role-based access control (RBAC) using JWT and secure cookies.
- **🏢 Regional Management**: Hierarchical organization of records by Districts and Registration Offices (RO).
- **📦 Batch Processing**: Efficient workflow management through record batching.
- **📑 Deed Digitization**: Comprehensive forms for deed entry with real-time validation.
- **🛡️ Data Integrity**: Advanced checks for duplicate deeds and overlapping page ranges across years and offices.
- **⚙️ Automated Setup**: Built-in seeding and migration tools for rapid environment setup.
- **🎨 Premium UI**: Clean, responsive, and dynamic interface built with Tailwind CSS and Shadcn UI.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Authentication**: [Jose](https://github.com/panva/jose) (JWT) & [BcryptJS](https://github.com/dcodeIO/bcrypt.js)

## 📂 Project Architecture

The project follows a clean **Controller-Service-Repository** pattern for the backend, ensuring separation of concerns and maintainability.

- `src/app`: Next.js pages and API routes.
- `src/controllers`: Request handling and response formatting.
- `src/services`: Core business logic and validations.
- `src/repositories`: Direct data access layer for Mongoose models.
- `src/models`: Database schemas and types.
- `src/components`: Reusable UI components.
- `src/store`: Client-side state management.

## 🚦 Getting Started

### Prerequisites

- Node.js 20.x or later
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd digitize
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   IMAGE_BASE_URL=your_image_base_url
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Initialize the database (Seeds default data):
   Navigate to `/api/setup` or use the setup page if available to initialize districts, ROs, and the default admin user.

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.

## 📄 License

This project is private and intended for internal use only.
