# Application Design

## 1. Overview

This application is a healthcare claims transparency application designed to work with healthcare claims data and provide price transparency information.

The application provides a React-based user interface for working with healthcare claims data and exposes healthcare data capabilities through WebMCP tools. The application is organized as a frontend application with supporting backend and data directories.

The primary goals are to:

- Work with healthcare claims data.
- Provide healthcare price information.
- Allow users and AI agents to search claims.
- Compare healthcare prices by procedure.
- Summarize claims for a healthcare provider.
- Provide structured data that can be consumed by WebMCP-compatible AI agents.

## 2. Application Architecture

The application follows a component-based React architecture.

The major areas of the project are:

- `frontend/` - React/Vite frontend application.
- `backend/` - Backend application and dependencies.
- `data/` - Project data and coding challenge resources.
- `frontend/src/data/` - Frontend healthcare claims data handling.
- `frontend/src/pages/` - Page-level application components.
- `frontend/src/webmcp/` - WebMCP tool registration and execution.

The frontend is built with React and TypeScript and uses Vite as the development and build tool.

## 3. Application Flow

The high-level application flow is:

1. The user opens the healthcare price transparency application.
2. The React application initializes.
3. The application registers its WebMCP tools when the application loads.
4. Healthcare claims data is loaded when a WebMCP tool requires it.
5. An AI agent can discover the available healthcare tools through WebMCP.
6. The agent can search claims, compare procedure prices, or summarize provider claims.
7. The selected tool processes the claims data and returns structured JSON results.
8. The results can then be consumed by the AI agent.

## 4. Frontend Architecture

The frontend is implemented using React and TypeScript.

`App.tsx` is the main application component. It initializes the Mantine provider, initializes React Router, and registers the WebMCP tools when the application mounts.

The application uses `RouterProvider` with a browser router to manage navigation.

### Main frontend responsibilities

The frontend is responsible for:

- Rendering the user interface.
- Providing application navigation.
- Loading healthcare claims data.
- Registering WebMCP tools.
- Executing healthcare claims queries.
- Presenting healthcare price transparency information.

## 5. Routing

React Router is used for application routing.

The current routing configuration provides a main application route at:

`/`

The application also provides an error route through the router's `errorElement`.

The routing configuration is centralized in:

`frontend/src/routes.tsx`

This keeps navigation separate from individual page components.

## 6. State and Data Management

Healthcare claims data is loaded through the frontend data layer.

The WebMCP implementation maintains a cached promise for claims data so that multiple tool calls can reuse the same loading operation rather than repeatedly initiating the data-loading process.

The claims data is represented using the `Claim` type.

This approach keeps the data-loading logic separate from individual WebMCP tool implementations.

## 7. WebMCP Integration

The application exposes healthcare functionality through WebMCP.

The WebMCP implementation is located at:

`frontend/src/webmcp/tools.ts`

Three tools are currently registered.

### 7.1 Search Healthcare Claims

Tool name:

`search_healthcare_claims`

This tool searches the healthcare claims dataset using optional:

- Provider name
- Procedure code
- Place of service

The search is case-insensitive and returns matching claims.

The returned information includes:

- Claim ID
- Provider name
- Procedure code
- Billed amount
- Allowed amount
- Paid amount
- Place of service
- Service date
- Claim status

The tool limits returned claim records to the first 50 matches while still reporting the total match count.

### 7.2 Compare Healthcare Prices

Tool name:

`compare_healthcare_prices`

This tool analyzes claims for a specific procedure code.

It calculates:

- Number of matching claims
- Average billed amount
- Minimum billed amount
- Maximum billed amount
- Total billed amount
- Average allowed amount
- Minimum allowed amount
- Maximum allowed amount
- Total allowed amount
- Average paid amount
- Minimum paid amount
- Maximum paid amount
- Total paid amount

It also calculates payment differences:

- Billed minus allowed
- Allowed minus paid
- Billed minus paid

The tool also returns the providers associated with the procedure.

### 7.3 Summarize Provider Claims

Tool name:

`summarize_provider_claims`

This tool analyzes claims associated with a provider.

It returns:

- Provider name
- Number of matching claims
- Total billed amount
- Total allowed amount
- Total paid amount
- Average allowed amount
- Procedures used by the provider

## 8. Tool Validation and Error Handling

The WebMCP tools define input schemas for their arguments.

For example, procedure-code and provider-summary operations require their respective input values.

The tools also handle cases where no matching claims are found by returning a structured response containing:

- The requested value
- A match count of zero
- A message explaining that no claims were found

The WebMCP registration also checks whether the browser supports `document.modelContext`. If WebMCP is unavailable, the application logs a warning instead of causing the application to fail.

## 9. UI Framework

Mantine is used as the primary UI component framework.

The application configures a Mantine theme with:

- Inter/system font stack
- Custom `royalGreen` primary color
- Configured primary color shade

Using Mantine provides consistent UI components and application styling.

## 10. Styling

The project uses the styling approach specified by the coding challenge.

Tailwind CSS is used for utility-based styling where applicable, while Mantine provides reusable UI components.

This combination allows the application to maintain consistent visual styling while avoiding unnecessary custom component implementations.

## 11. Data Processing

Healthcare claims are represented using structured claim objects.

Claims contain information such as:

- Claim identifier
- Provider
- Procedure code
- Billed amount
- Allowed amount
- Paid amount
- Place of service
- Service date
- Claim status

The application performs filtering and numerical calculations directly against these structured records.

For numerical analysis, the application calculates totals, averages, minimums, and maximums from matching claims.

## 12. Backend

The repository contains a `backend/` directory for backend functionality.

The backend is separated from the frontend so that server-side functionality can be developed and deployed independently from the React application.

The architecture can therefore support future API-based communication between the frontend and backend.

## 13. Deployment

The frontend is deployed as a Vite application.

The frontend deployment uses the `frontend` directory as the project root.

The build command is:

`npm run build`

The resulting Vite production output is generated in the configured build directory.

## 14. Security and Privacy Considerations

Healthcare data can contain sensitive information. The application should therefore avoid exposing unnecessary personal information through the user interface or WebMCP tools.

The WebMCP tools are currently read-only. They are intended to retrieve and analyze claims information rather than modify the underlying dataset.

Production implementations should additionally consider:

- Authentication and authorization
- Access controls
- Secure API communication
- Data minimization
- Audit logging
- Appropriate handling of healthcare-related information

## 15. Maintainability

The project separates major responsibilities into different areas of the repository.

Examples include:

- Pages for page-level UI.
- Data modules for healthcare claims data.
- WebMCP modules for AI-agent functionality.
- Routing for navigation.
- Backend code for server-side functionality.

This separation makes individual parts of the application easier to maintain and extend.

## 16. Future Enhancements

Potential future enhancements include:

- Expanded claims management workflows.
- Additional healthcare analytics tools.
- Authentication and authorization.
- More detailed MRF generation functionality.
- API-based backend integration.
- Automated testing.
- Additional WebMCP tools.
- Improved error reporting and monitoring.
- More comprehensive healthcare price comparison capabilities.

## 17. Summary

The application combines a React/TypeScript frontend with structured healthcare claims data and WebMCP capabilities.

Its architecture separates UI, routing, data loading, and AI-agent tools into distinct modules. This provides a foundation for healthcare price transparency workflows while allowing AI agents to interact with the same healthcare claims data through standardized read-only tools.