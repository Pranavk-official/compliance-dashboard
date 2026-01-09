# Configuration Guide

This guide explains how to use and customize the `config.ts` file to control the behavior of the Compliance Dashboard.

## Overview

The `config.ts` file centralizes all configuration settings, making it easy to modify the application's behavior without touching the core implementation code. All settings are clearly documented and grouped by category.

## Configuration Sections

### 1. Excel Sheet Processing (`SHEET_CONFIG`)

Control which sheets are processed when loading Excel files.

#### Settings:

- **`FIRST_SHEET_INDEX`** (default: `1`)
  - The index of the first sheet to process (0-based)
  - Default skips the first sheet (usually contains guidelines)
  - Change to `0` if you want to process all sheets

- **`EXCLUDED_SHEETS`** (array)
  - List of sheet names to exclude from processing
  - Default excludes: `test`, `sheet 17`, `sheet 128`, `guideline`, `instructions`, `template`
  - **How to add more:**
    ```typescript
    EXCLUDED_SHEETS: [
        'test',
        'sheet 17',
        'your_sheet_name',  // Add your sheet name here
        'another_excluded_sheet',
    ] as const,
    ```

- **`CASE_INSENSITIVE_EXCLUSION`** (default: `true`)
  - Whether sheet name matching should be case-insensitive
  - When `true`, "Test", "TEST", and "test" are all excluded

- **`TRIM_SHEET_NAMES`** (default: `true`)
  - Whether to trim whitespace from sheet names before checking
  - Helps avoid issues with accidental spaces in sheet names

### 2. Excel Row Mapping (`EXCEL_ROW_INDICES`)

Maps data fields to their row positions in the Excel file.

**⚠️ Important:** These must match your Excel file structure exactly!

```typescript
EXCEL_ROW_INDICES = {
    VILLAGE_NAME: 55,      // Row containing village names
    STAGE: 1,              // Row containing current stage
    PUBLISHED_DATE: 2,     // Row containing 9(2) published date
    DAYS_PASSED: 3,        // Row containing days passed after 9(2)
    HEAD_SURVEYOR: 7,      // Row containing head surveyor names
    // ... etc
}
```

**How to update:**
If your Excel structure changes, update the row numbers:
```typescript
VILLAGE_NAME: 60,  // Changed from 55 to 60
```

### 3. Business Rules (`COMPLIANCE_THRESHOLDS`)

Control the thresholds for compliance calculations.

```typescript
COMPLIANCE_THRESHOLDS = {
    COMPLETED: 0.9,     // 90% - Mark as "Completed"
    HIGH: 0.75,         // 75% - High compliance threshold
    MEDIUM: 0.5,        // 50% - Medium compliance threshold
    CRITICAL_DAYS: 90,  // Days to mark village as critical
}
```

**Examples:**

- **Change critical threshold to 60 days:**
  ```typescript
  CRITICAL_DAYS: 60,
  ```

- **Change completion threshold to 95%:**
  ```typescript
  COMPLETED: 0.95,
  ```

### 4. Stage Detection (`STAGE_PATTERNS`)

Configure how different stages are detected in your data.

#### **Above 90% Detection**

Customize patterns to identify villages with >90% field survey completion:

```typescript
ABOVE_90_PERCENT: [
    'above 90',
    'above90',
    '>90',
    '> 90',
    'above 90%',
    'above90%',
    '>90%',
    '> 90%',
] as const,
```

**To add new patterns:**
```typescript
ABOVE_90_PERCENT: [
    'above 90',
    'above90',
    '>90',
    '> 90',
    'field survey above 90',  // New pattern
    'survey >90',             // Another pattern
] as const,
```

#### **Section 9(2) Published Detection**

```typescript
SECTION_92_PUBLISHED: [
    '9(2)',
    'published',
    '9(2) published'
] as const,
```

#### **Section 13 Published Detection**

```typescript
SECTION_13_PUBLISHED: [
    '13 published',
    'section 13 published'
] as const,
```

### 5. Data Validation (`VALIDATION_RULES`)

Control what values are considered invalid or default.

```typescript
VALIDATION_RULES = {
    INVALID_VILLAGE_NAMES: ['#REF!', '#N/A', '#VALUE!', '#DIV/0!'],
    MIN_VILLAGE_NAME_LENGTH: 1,
    DEFAULT_SURVEYOR: 'Not Assigned',
    DEFAULT_OFFICER: 'Not Assigned',
}
```

**Examples:**

- **Change default text for unassigned personnel:**
  ```typescript
  DEFAULT_SURVEYOR: 'No Surveyor Assigned',
  ```

- **Add more invalid values:**
  ```typescript
  INVALID_VILLAGE_NAMES: ['#REF!', '#N/A', '#VALUE!', 'ERROR', 'N/A'],
  ```

### 6. UI Configuration (`PAGINATION`, `CHART_COLORS`, etc.)

Control UI behavior and appearance.

#### **Pagination Settings**

```typescript
PAGINATION = {
    DEFAULT_PAGE_SIZE: 50,        // Rows per page in tables
    CHART_ITEMS_SMALL: 10,        // Items in small charts
    CHART_ITEMS_MEDIUM: 20,       // Items in medium charts
    CHART_ITEMS_LARGE: 30,        // Items in large charts
}
```

#### **Chart Colors**

```typescript
CHART_COLORS = {
    HIGH_COMPLIANCE: '#10b981',   // Green (emerald-500)
    MEDIUM_COMPLIANCE: '#f59e0b', // Orange (amber-500)
    LOW_COMPLIANCE: '#ef4444',    // Red (red-500)
}
```

## Helper Functions

The config file includes helpful utility functions you can use in your components:

### `shouldExcludeSheet(sheetName: string): boolean`

Check if a sheet should be excluded.

```typescript
import { shouldExcludeSheet } from './lib/config';

if (shouldExcludeSheet('test')) {
    // Skip this sheet
}
```

### `isAbove90Stage(stage: string): boolean`

Check if a stage indicates >90% field survey completion.

```typescript
import { isAbove90Stage } from './lib/config';

if (isAbove90Stage(village.stage)) {
    // This village has >90% survey completion
}
```

### `is92PublishedStage(stage: string): boolean`

Check if Section 9(2) is published for a village.

```typescript
import { is92PublishedStage } from './lib/config';

if (is92PublishedStage(village.stage)) {
    // Section 9(2) is published
}
```

### `is13PublishedStage(stage: string): boolean`

Check if Section 13 is published for a village.

```typescript
import { is13PublishedStage } from './lib/config';

if (is13PublishedStage(village.stage)) {
    // Section 13 is published (completed)
}
```

## Common Customization Scenarios

### Scenario 1: Exclude Additional Sheets

If you have new sheets to exclude (e.g., "backup", "draft"):

1. Open `src/lib/config.ts`
2. Find the `EXCLUDED_SHEETS` array
3. Add your sheet names:

```typescript
EXCLUDED_SHEETS: [
    'test',
    'sheet 17',
    'sheet 128',
    'backup',      // ← Add this
    'draft',       // ← Add this
    'archive',     // ← Add this
] as const,
```

### Scenario 2: Change Critical Days Threshold

To mark villages as critical after 60 days instead of 90:

1. Open `src/lib/config.ts`
2. Find `COMPLIANCE_THRESHOLDS`
3. Update the value:

```typescript
COMPLIANCE_THRESHOLDS = {
    COMPLETED: 0.9,
    HIGH: 0.75,
    MEDIUM: 0.5,
    CRITICAL_DAYS: 60,  // ← Changed from 90 to 60
} as const;
```

### Scenario 3: Adjust Excel Row Indices

If your Excel structure changes (e.g., village names are now on row 60):

1. Open `src/lib/config.ts`
2. Find `EXCEL_ROW_INDICES`
3. Update the row number:

```typescript
EXCEL_ROW_INDICES = {
    VILLAGE_NAME: 60,  // ← Changed from 55
    STAGE: 1,
    // ... rest unchanged
}
```

### Scenario 4: Add New Stage Detection Pattern

If villages use ">= 90%" or "survey above 90%" in their stage:

1. Open `src/lib/config.ts`
2. Find `STAGE_PATTERNS.ABOVE_90_PERCENT`
3. Add new patterns:

```typescript
ABOVE_90_PERCENT: [
    'above 90',
    'above90',
    '>90',
    '> 90',
    '>= 90',        // ← New pattern
    'survey above 90',  // ← New pattern
] as const,
```

### Scenario 5: Change Default Personnel Text

To show "To Be Assigned" instead of "Not Assigned":

1. Open `src/lib/config.ts`
2. Find `VALIDATION_RULES`
3. Update the default values:

```typescript
VALIDATION_RULES = {
    // ... other settings
    DEFAULT_SURVEYOR: 'To Be Assigned',  // ← Changed
    DEFAULT_OFFICER: 'To Be Assigned',   // ← Changed
}
```

## Best Practices

1. **Always backup** before making changes
2. **Test thoroughly** after modifying any configuration
3. **Use meaningful names** when adding new patterns
4. **Document custom changes** with comments in the config file
5. **Keep patterns consistent** across similar detection rules
6. **Restart dev server** after configuration changes: `npm run dev`

## TypeScript Considerations

The `as const` declarations make the arrays readonly and preserve literal types. When adding new values:

```typescript
// ✅ Correct - includes 'as const'
EXCLUDED_SHEETS: [
    'test',
    'mysheet',
] as const,

// ❌ Incorrect - missing 'as const'
EXCLUDED_SHEETS: [
    'test',
    'mysheet',
]
```

## Getting Help

If you encounter issues after modifying the configuration:

1. **Check the browser console** for error messages
2. **Verify TypeScript compilation**: Look for red underlines in VS Code
3. **Restart the development server**: `Ctrl+C` then `npm run dev`
4. **Revert changes** if needed and compare with the original

## Migration from Old Structure

If you were using hardcoded values in `constants.ts` or `parser.ts`:

1. **All row indices** → Use `EXCEL_ROW_INDICES` in `config.ts`
2. **Compliance thresholds** → Already in `config.ts`
3. **Sheet exclusions** → Use `SHEET_CONFIG.EXCLUDED_SHEETS`
4. **Stage patterns** → Use helper functions like `isAbove90Stage()`

The old `constants.ts` file still exists for backward compatibility but will eventually be phased out in favor of `config.ts`.
