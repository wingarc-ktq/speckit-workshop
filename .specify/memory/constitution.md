<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Change Type: MAJOR (Initial Constitution Creation)
Modified Principles: All principles created from scratch
Added Sections:
  - Core Principles (7 principles)
  - Technology Stack & Standards
  - Development Workflow
  - Governance
Templates Status:
  ✅ plan-template.md - Compatible (references constitution check)
  ✅ spec-template.md - Compatible (aligns with testing requirements)
  ✅ tasks-template.md - Compatible (aligns with testing and phasing requirements)
Follow-up TODOs: None - all placeholders filled
-->

# UI Prototype Constitution

## Core Principles

### I. TypeScript Strict Mode (NON-NEGOTIABLE)

TypeScript MUST be configured with strict mode enabled. All code MUST pass TypeScript compilation without errors or warnings.

**Rules**:

- `strict: true` in tsconfig.json
- No `any` types except when interfacing with untyped third-party libraries (requires inline justification comment)
- All function parameters and return types MUST be explicitly typed
- Null and undefined MUST be handled explicitly

**Rationale**: Type safety prevents runtime errors, improves code maintainability, and enables better refactoring capabilities. Strict mode catches edge cases at compile time.

### II. Component Architecture

All React components MUST be written as functional components using hooks. Class components are forbidden.

**Rules**:

- Function declarations preferred over arrow functions for components (aids debugging)
- Props MUST be typed with explicit TypeScript interfaces/types
- Props interfaces MUST be exported for reusability
- Components MUST be self-contained and testable in isolation
- Use composition over inheritance

**Rationale**: Functional components with hooks are the modern React standard, providing better composition, code reuse, and testing capabilities compared to class components.

### III. Material-UI First

UI components MUST prioritize Material-UI (MUI) components. Custom components are only permitted when MUI does not provide the required functionality.

**Rules**:

- Use MUI components for all standard UI elements (buttons, inputs, dialogs, etc.)
- MUI theming system MUST be used for consistent styling
- Custom components MUST follow MUI design patterns and use MUI's `sx` prop or styled components
- Justify any custom component that duplicates MUI functionality

**Rationale**: MUI provides accessible, tested, and consistent UI components. Using MUI reduces development time and ensures design consistency.

### IV. Test-Driven Development

Testing is mandatory. Code without tests MUST NOT be merged.

**Rules**:

- **Unit Tests**: All business logic, utilities, and hooks MUST have unit tests (Vitest)
- **Component Tests**: Core components MUST have component tests verifying behavior
- **E2E Tests**: Critical user flows MUST have E2E tests (Playwright) with markdown specifications
- Tests MUST be written following the Arrange-Act-Assert pattern
- Test coverage MUST be maintained (target: >80% for critical paths)
- Use `data-testid` attributes for E2E test element identification

**Rationale**: Tests catch bugs early, enable confident refactoring, and serve as living documentation. E2E tests ensure critical user journeys remain functional.

### V. API-First with OpenAPI

All API interactions MUST be defined in OpenAPI 3.1 specifications before implementation.

**Rules**:

- API contracts MUST be defined in `schema/*/openapi.yaml` files
- Code generation via Orval MUST be used (`pnpm gen:api`)
- Generated API clients MUST NOT be manually edited
- MSW handlers MUST be generated alongside API clients for testing
- Any API changes MUST update OpenAPI specs first

**Rationale**: OpenAPI provides a single source of truth for API contracts, enables automatic code generation, reduces manual errors, and ensures frontend-backend alignment.

### VI. Clean Architecture & Separation of Concerns

Code MUST be organized following Clean Architecture principles with clear layer separation.

**Rules**:

- **Domain Layer** (`src/domain/`): Business logic, models, errors - NO external dependencies
- **Adapters Layer** (`src/adapters/`): External integrations (API, storage) - implements domain interfaces
- **Application Layer** (`src/app/`): Application configuration, routing, providers
- **Presentation Layer** (`src/presentations/`): UI components, pages, layouts
- Dependencies MUST flow inward: Presentation → Application → Domain ← Adapters
- Repository pattern MUST be used for data access abstraction

**Rationale**: Clear separation enables independent testing, easier maintenance, technology swapping, and parallel development of layers.

### VII. Accessibility & Responsive Design (NON-NEGOTIABLE)

All UI MUST meet WCAG 2.1 Level AA standards and be fully responsive.

**Rules**:

- Semantic HTML MUST be used
- All interactive elements MUST be keyboard accessible
- Color contrast MUST meet WCAG AA ratios (4.5:1 for text)
- Images MUST have alt text
- Forms MUST have proper labels and error messages
- Responsive breakpoints MUST be tested (mobile, tablet, desktop)
- Use MUI's responsive utilities and Grid system

**Rationale**: Accessibility is a legal requirement and ensures the application is usable by all users. Responsive design provides optimal experience across devices.

## Technology Stack & Standards

### Required Technologies

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v6+
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router v7+
- **API Client**: Axios with generated types from OpenAPI
- **Testing**: Vitest + React Testing Library + Playwright
- **Internationalization**: react-i18next
- **Mocking**: MSW (Mock Service Worker)
- **Code Generation**: Orval (OpenAPI → TypeScript)
- **Package Manager**: pnpm (v10.12.4+)
- **Node Version**: v22 (managed via `.npmrc`)

### Code Quality Standards

**Linting & Formatting**:

- ESLint MUST pass with zero warnings (`pnpm lint`)
- Prettier MUST be used for code formatting (`pnpm format:fix`)
- Pre-commit hooks SHOULD enforce formatting

**Naming Conventions**:

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `HTTP_STATUS_CODES`)
- Types/Interfaces: PascalCase (e.g., `UserProfile`, `AuthResponse`)

**File Organization**:

- One component per file
- Co-locate related files (component + styles + tests)
- Use `index.ts` for clean public exports
- Tests MUST be in `__tests__/` directories or `*.test.ts(x)` files

### Design Integration

- UI designs MUST be created in Figma
- Figma MCP server integration SHOULD be used to extract design assets
- Design tokens from Figma SHOULD be synchronized with MUI theme

## Development Workflow

### Branching Strategy

- **main**: Production-ready code only
- **develop**: Integration branch for features (if used)
- **feature/[###-name]**: Feature branches following `/speckit` workflow

### Pull Request Requirements

**Before Creating PR**:

- [ ] All tests pass locally (`pnpm test:run` and `pnpm test:e2e`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Linting passes with zero warnings (`pnpm lint`)
- [ ] Code is formatted (`pnpm format:check`)
- [ ] OpenAPI specs updated if API changes made

**PR Content Requirements**:

- Descriptive title following conventional commits (e.g., `feat:`, `fix:`, `test:`)
- Description explaining the change and motivation
- Link to related specification document if using `/speckit` workflow
- Screenshots for UI changes

**Review Requirements**:

- At least one approval required
- All CI checks MUST pass
- No merge conflicts
- Test coverage MUST NOT decrease

### E2E Testing Workflow

E2E tests MUST follow the Page Object Model pattern:

**Structure**:

```
playwright/
├── tests/
│   ├── pages/          # Page Object classes
│   ├── fixtures/       # Test data and custom fixtures
│   └── specs/
│       └── [feature]/
│           ├── [feature].md  　　　  # Test specification
│           └── [feature].spec.ts    # Test implementation
```

**Requirements**:

- Test specification (`.spec.md`) MUST be written before test implementation
- Test specification and implementation MUST be in the same directory
- Page Objects MUST encapsulate page interactions
- Tests MUST be independent and idempotent
- Use meaningful test descriptions matching specification

### Quality Gates

**Pre-Merge Gates** (MUST pass before merging to main/develop):

- Unit tests pass
- E2E tests for affected flows pass
- Type checking passes
- Linting passes (zero warnings)
- PR approved by reviewer(s)

**Post-Merge Actions**:

- Automated deployment to staging (if applicable)
- Smoke tests executed

## Governance

### Constitution Authority

This Constitution supersedes all other development practices and guidelines. When conflicts arise between this document and other documentation, the Constitution takes precedence.

### Amendment Process

1. Proposed changes MUST be documented with rationale
2. Team discussion and consensus required
3. Version bump according to semantic versioning:
   - **MAJOR**: Backward-incompatible principle changes or removals
   - **MINOR**: New principles added or material expansions
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements
4. All dependent templates in `.specify/templates/` MUST be reviewed and updated
5. Migration plan required for MAJOR changes affecting existing code

### Compliance & Enforcement

- All pull requests MUST verify compliance with this Constitution
- Violations MUST be justified in writing with approval from team lead
- Complexity additions MUST be justified referencing specific requirements
- Regular compliance reviews SHOULD be conducted quarterly

### Related Documentation

- Runtime development guidance: See `.specify/templates/` for workflow templates
- Feature specifications: Follow `.specify/templates/spec-template.md`
- Implementation plans: Follow `.specify/templates/plan-template.md`
- Task management: Follow `.specify/templates/tasks-template.md`

**Version**: 1.0.0 | **Ratified**: 2025-10-25 | **Last Amended**: 2025-10-25
