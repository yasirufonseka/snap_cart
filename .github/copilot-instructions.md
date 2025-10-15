# Copilot Instructions for SnapCart

## Project Overview

SnapCart is a full-stack e-commerce platform with a modern Angular frontend (`src/`) and a Spring Boot backend (`Backend/SnapCart/`). The frontend and backend are developed and run independently, communicating via REST APIs. MongoDB is used for backend data persistence.

## Architecture & Key Components

- **Frontend (Angular, `src/`)**
  - Uses Angular standalone components (see `src/app/components/`).
  - Routing is defined in `src/app/app.routes.ts`.
  - UI leverages Bootstrap 5 (see `src/index.html`).
  - HTTP requests are made directly to backend endpoints (e.g., `http://localhost:8080/api/`).
  - Forms use Angular Reactive Forms (`FormBuilder`, `FormGroup`).
  - Example: `SignUpComponent` and `SellerComponent` show typical form and HTTP usage.

- **Backend (Spring Boot, `Backend/SnapCart/`)**
  - REST controllers in `controller/Controller.java` handle user, product, and authentication endpoints.
  - Data models in `entity/` and DTOs in `dto/`.
  - MongoDB repositories in `repository/` (e.g., `UserRepository`, `ProductRepository`).
  - Service layer (`services/`) implements business logic.
  - Global error handling via `ErrorHandling/GlobalExceptionHandler.java`.
  - Application config in `src/main/resources/application.properties`.

## Developer Workflows

- **Frontend**
  - Start dev server: `npm start` or `ng serve` (runs on `http://localhost:4200/`).
  - Run unit tests: `npm test` or `ng test` (Karma/Jasmine).
  - Build: `npm run build` or `ng build` (output in `dist/`).
  - Add components: `ng generate component <name>` (see README for more CLI usage).

- **Backend**
  - Build/run: Use Maven wrapper scripts (`mvnw`/`mvnw.cmd`) in `Backend/SnapCart/`.
    - Example: `./mvnw spring-boot:run` (Linux/macOS) or `mvnw.cmd spring-boot:run` (Windows).
  - Tests: Standard JUnit tests in `src/test/java/`.
  - MongoDB must be running locally at `mongodb://localhost:27017/SnapCart` (see `application.properties`).

## Project Conventions & Patterns

- **API Endpoints**
  - All backend APIs are prefixed with `/api/` (e.g., `/api/CreateUser`, `/api/login`, `/api/SaveProduct`).
  - CORS is enabled for `http://localhost:4200`.

- **Frontend**
  - Use Angular standalone components and modules.
  - Use SCSS for styles (see `angular.json` and component `.scss` files).
  - Use `HttpClient` for backend communication.
  - Form validation is handled in the component using Angular Validators.

- **Backend**
  - Use Lombok for model boilerplate (`@Getter`, `@Setter`, etc.).
  - MongoDB collections: `User`, `products`.
  - Exception handling is centralized.
  - User passwords are stored in plaintext (TODO: hash for production).

## Integration Points

- **Frontend ↔ Backend**: All data flows via REST endpoints. Example: `SignUpComponent` posts to `/api/CreateUser`.
- **Backend ↔ MongoDB**: Spring Data MongoDB repositories.
- **Bootstrap**: UI styling via CDN in `src/index.html`.

## Notable Files & Directories

- `src/app/components/` — Angular UI components
- `src/app/app.routes.ts` — Angular routing
- `Backend/SnapCart/src/main/java/com/example/SnapCart/controller/Controller.java` — Main REST API controller
- `Backend/SnapCart/src/main/resources/application.properties` — Backend config
- `Backend/SnapCart/pom.xml` — Backend dependencies
- `README.md` — Basic setup and CLI usage

## Tips for AI Agents

- Always keep frontend and backend servers running separately for full-stack features.
- When adding new API endpoints, update both backend controller and frontend service/component.
- Use the provided Angular and Spring Boot conventions for new code.
- For new backend features, add DTOs and update the service layer as needed.
- For new frontend features, prefer standalone components and keep styles modular.

---

_Last updated: 2025-10-13_
