# FrontVentaMarket

FrontVentaMarket is an Angular-based web application designed to facilitate the reporting and management of anonymous complaints. This project leverages the Angular CLI for development and includes various components and routes to handle different functionalities.

## Table of Contents
1. [Development Server](#development-server)
2. [Code Scaffolding](#code-scaffolding)
3. [Building](#building)
4. [Running Unit Tests](#running-unit-tests)
5. [Running End-to-End Tests](#running-end-to-end-tests)
6. [Project Structure](#project-structure)
7. [Features](#features)
8. [Additional Resources](#additional-resources)

## Development Server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project, run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running Unit Tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running End-to-End Tests

To run end-to-end tests, use:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Project Structure

The project is organized into several key directories:

- **src/app/components**: Contains the main application components, including `admin`, `auth`, `denuncias`, and more.
- **src/app/components/denuncias**: Handles functionalities related to complaints, with subdirectories for `anonimas`, `middleware`, etc.
- **src/assets**: Stores static assets like images and styles.
- **src/environments**: Contains environment-specific configurations.

## Features

- **Anonymous Reporting**: Users can submit complaints anonymously.
- **Admin Management**: Admin routes and components for managing user reports.
- **Middleware Integration**: Routes and logic to handle data flow and processing.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
