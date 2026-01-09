# Compliance Dashboard - Government of Kerala

A modern, responsive dashboard for tracking survey compliance status across districts and villages.

## Features

- **Data Visualization**: Interactive charts and KPI grids to visualize compliance progress.
- **Detailed Reporting**: Comprehensive village-level reports with filtering and search capabilities.
- **Excel/Google Sheets Integration**: Seamlessly load data from local Excel files or Google Sheets.
- **Responsive Design**: Optimized for all devices, from desktops to mobile phones.
- **Performance Optimized**: Efficient data processing and memoized components for smooth user experience.
- **Modern UI**: Built with Shadcn UI, Tailwind CSS, and Lucide Icons.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: Zustand
- **Data Parsing**: XLSX (SheetJS)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Pranavk-official/compliance-dashboard.git
    cd compliance-dashboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```

## Deployment

This project is configured for automatic deployment to GitHub Pages:

- **Automatic Deployment**: Every push to the `main` branch automatically triggers a build and deployment.
- **GitHub Actions**: The workflow is defined in `.github/workflows/deploy.yml`.
- **Live URL**: Once deployed, the application will be available at `https://pranavk-official.github.io/compliance-dashboard/`

### Manual Deployment

You can also deploy manually using:
```bash
npm run deploy
```

This will build the project and push to the `gh-pages` branch.

### First-time Setup

Before automatic deployment works, ensure:

1. GitHub Pages is enabled in your repository settings (`Settings > Pages`)
2. Source is set to "GitHub Actions"
3. The workflow has necessary permissions (configured in the workflow file)

## Code Quality Improvements

This project has undergone a significant code quality overhaul:

- **Type Safety**: strict TypeScript configuration with no `any` types.
- **Performance**: Heavy computations are memoized using `useMemo` and `useCallback`.
- **Maintainability**: Constants and helper functions are centralized.
- **Linting**: Enhanced ESLint configuration with strict rules for React Hooks and Fast Refresh.

## Project Structure

- `src/components`: UI components (including Shadcn UI components).
- `src/lib`: Core logic, types, store, constants, and helper functions.
    - `parser.ts`: Excel parsing logic.
    - `store.ts`: Global state management.
    - `constants.ts`: Centralized configuration.
    - `helpers.ts`: Reusable utility functions.
- `src/App.tsx`: Main application entry point.

## License

[MIT](LICENSE)
