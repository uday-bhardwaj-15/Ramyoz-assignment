# Mini Kanban Board

A Trello-like Kanban Board built with Next.js 15+, React 19, and Tailwind CSS. This project was developed as part of an Intern Assignment.

## 🚀 Features

- **Cards Management**: Create, view, edit, and delete tasks.
- **Workflow Stages**: Three distinct columns (Pending, In Progress, Completed).
- **Drag and Drop**: Seamlessly move tasks between stages using a desktop and mobile-friendly drag-and-drop interface.
- **Search & Filter**: Real-time searching of tasks by title or description.
- **Optimistic UI**: Instant UI updates on all user interactions for a snappy experience.
- **Data Persistence**: Tasks are persisted in a local JSON database on the server.
- **Responsive Design**: Fully responsive layout that works beautifully on mobile and desktop.
- **Modern UI**: Clean, glassmorphic design with dark mode support and smooth animations.

## 🛠️ Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🏁 Getting Started

### Prerequisites

- Node.js 18.17 or later

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd ramyos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

- **Server Components**: Used for initial data fetching and page layout to ensure zero-bundle size for the core logic.
- **Client Components**: Used for the interactive Kanban board, modals, and drag-and-drop state.
- **Server Actions**: Used for all CRUD operations, providing a seamless bridge between client and server without manual API route management.
- **Local persistence**: A custom JSON-based storage utility located in `lib/db.ts` handles task persistence.

## 📝 License

Distributed under the MIT License.
