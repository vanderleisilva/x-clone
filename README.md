# X Clone

This is a demo full-stack application that allows users to create profiles and post their thoughts. It features:

- **User Profiles**: Manage user profiles with basic information (username, avatar placeholder);
- **Post Feed**: Manage posts made by users;

## Assumptions and Future Improvements

The project, to decrease its scope and considering its demo purpose, does not include important aspects which in a normal production-ready application would be expected, such as:

- **CI/CD pipeline**: a GitHub workflow for continuous integration, via running some tests and related quality assurance checks; the CD part of this project is managed by the [render](https://render.com/) platform;
- **Database migrations**: Managing the application state via database migrations;
- **REST API Client SDK**: for type checking purposes, it would be expected that the API provides it, so clients do not have to duplicate these type definitions;
- **Authentication**: Implement proper user authentication with token-based authentication managed by an identity provider;
- **End-to-end typing support**: Implement a setup where clients could automatically get updated typing references, which could be achieved by automatically generating types from the OpenAPI spec, or technologies like tRPC for instance;
- **Improve backend layering architecture**: as the system grows, potentially consider improving the application layering, extracting domain use-cases and removing the hard dependencies currently existent between the services and the infrastructure layer (typeORM), going closer to the principles established by the [hexagonal architecture](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html);
- **Content moderation**: proper handling for content moderation via a variety of techniques such as: machine learning classifiers, keyword and pattern matching, behavioral signals and so on;
- **Search**: full-text search for users and posts;
- **Pagination**: proper pagination and virtual scrolling in the frontend;
- **UX consistency**: extract reusable frontend component, reusable design system tokens and implement theming capabilities;
- **SSR**: consider server-side-rendering in the frontend application for improved SEO and user experience;
- **i18n**: add localization support for the frontend application;
- **Real-time Updates**: WebSocket support for live feed (posts) updates;
- **Accessibility**: improve ARIA labels and keyboard navigation;
- **Testing**: expand test coverage;
- **Developer Experience**:
  - consider migrating to [NX](https://nx.dev/) for better monorepo management
  - consider replacing [eslint](https://eslint.org/) for [biomejs](https://biomejs.dev/) for better code linting
  - consider [lefthook](https://lefthook.dev/) for including git hook in the project

## Architecture

### System Context Diagram

```mermaid
C4Context

    Person(user, "User", "A person who wants to create profiles and post thoughts")

    System(x_clone, "X Clone", "A full-stack application that allows users to create profiles and post their thoughts")

    System_Ext(render, "Render.com", "Cloud platform hosting the application")

    Rel(user, x_clone, "Uses", "HTTPS")
    Rel(x_clone, render, "Deployed on", "HTTPS")

    UpdateElementStyle(user, $bgColor="#E3F2FD", $fontColor="#1976D2")
    UpdateElementStyle(x_clone, $bgColor="#C8E6C9", $fontColor="#2E7D32")
    UpdateElementStyle(render, $bgColor="#FFF3E0", $fontColor="#F57C00")
```

### Container Diagram

```mermaid
C4Container

    Person(user, "User", "A person who wants to create profiles and post thoughts")

    System_Boundary(x_clone, "X Clone System") {
        Container(frontend, "Frontend Application", "React, TypeScript", "Single Page Application that provides the user interface for creating profiles and posting thoughts")
        Container(backend, "Backend API", "NestJS, TypeScript", "REST API that provides endpoints for managing users and posts. Exposes OpenAPI specification")
        ContainerDb(database, "PostgreSQL Database", "PostgreSQL", "Stores user profiles and posts data")
    }

    Rel(user, frontend, "Uses", "HTTPS")
    Rel(frontend, backend, "Makes API calls to", "HTTPS/REST")
    Rel(backend, database, "Reads from and writes to", "SQL/TCP")

    UpdateElementStyle(user, $bgColor="#E3F2FD", $fontColor="#1976D2")
    UpdateElementStyle(frontend, $bgColor="#E1F5FE", $fontColor="#0277BD")
    UpdateElementStyle(backend, $bgColor="#F3E5F5", $fontColor="#7B1FA2")
    UpdateElementStyle(database, $bgColor="#E8F5E9", $fontColor="#388E3C")
```

### Monorepo Organization

The project uses **npm workspaces** for monorepo management, with two main packages:

- `@x_clone/backend`: NestJS REST API server
- `@x_clone/frontend`: React single-page application

### Data Model

**User Entity**

- `id`: UUID (primary key)
- `username`: Unique string identifier
- `avatar`: Optional image URL
- `createdAt`, `updatedAt`: Timestamps

**Post Entity**

- `id`: UUID (primary key)
- `content`: Text content
- `userId`: Foreign key to User
- `createdAt`, `updatedAt`: Timestamps

**Relationships**

- User has many Posts (one-to-many)
- Post belongs to one User (many-to-one)

### Backend Architecture

The backend follows a **three-layer architecture** pattern:

**Presentation Layer (Controllers)**

- Handles HTTP requests and responses
- Route definitions and OpenAPI/Swagger documentation
- Input validation via DTOs (Data Transfer Objects)
- Delegates business logic to services

**Business Logic Layer (Services)**

- Contains domain business logic
- Transaction management
- Error handling with NestJS exceptions (e.g., `NotFoundException`)
- Orchestrates data access via repositories

**Data Access Layer (TypeORM Repositories)**

- Database operations abstraction
- Entity relationship management
- Query construction and execution
- Type-safe database interactions

### Frontend Architecture

The frontend follows a **component-based architecture** with clear separation of concerns:

- **Pages**: Route-level components (`ProfilePage`, `PostsPage`) handling top-level views
- **Components**: Reusable UI components (`Navigation`, `Posts`) with encapsulated logic
- **API Layer**:
  - `client.ts`: Centralized API client with typed fetch wrapper
  - `queries.ts`: React Query hooks for data fetching with caching and invalidation
- **State Management**: TanStack Query handles server state (cache, refetching, optimistic updates)
- **Routing**: React Router v7 for declarative routing
- **Styling**: Tailwind CSS utility-first approach for responsive design

## Deployment

The deployment is managed by [https://render.com/](https://render.com/) free tier plan and are available respectively:

- the REST API: [https://x-clone-btx5.onrender.com/api](https://x-clone-btx5.onrender.com/api)
- the frontend application: [https://x-clone-frontend-5okj.onrender.com](https://x-clone-frontend-5okj.onrender.com)

## How to Run Locally

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose

### Local Development

1. **Start PostgreSQL**:

   ```bash
   docker-compose up
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Define env values**:

   ```bash
   cp packages/backend/.env.sample packages/backend/.env
   ```

Then provide your database connection value in the `.env file`

4. **Optional: Seed database**:

   ```bash
   npm run seed-backend
   ```

5. **Start backend** (from project root):

   ```bash
   npm run start:backend
   ```

6. **Start frontend** (in a new terminal):

   ```bash
   npm run start:frontend
   ```

**Note**: Backend defaults to `localhost:5432` for PostgreSQL. Frontend defaults to `http://localhost:3000` for the API. Configure via environment variables if needed.

This will start PostgreSQL, backend API (http://localhost:3000), and frontend (http://localhost:5173). API docs available at http://localhost:3000/api.

### Testing

For testing the application you may run:

- `npm run test -w packages/frontend` for testing the frontend application
- `npm run test -w packages/backend` for testing the backend application
- `npm run test:coverage` for testing all the application and getting the test coverage

## Technology Stack

### Backend

- **NestJS**: Progressive Node.js framework
- **TypeORM**: ORM for PostgreSQL
- **OpenAPI Spec**: REST API exposed via OpenAPI Specification
- **TypeScript**: Type-safe JavaScript
- **PostgreSQL**: Relational database

### Frontend

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **React Router**: Declarative routing for React
- **TanStack Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first CSS framework
