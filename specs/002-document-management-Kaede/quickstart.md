# Quick Start: 文書管理システム

**Date**: 2025-01-14  
**Feature**: 文書管理システム

## Prerequisites

- Node.js v22
- pnpm v10.12.4+
- Git

## Setup

1. **Clone and install dependencies**:
   ```bash
   git checkout 002-document-management-Kaede
   pnpm install
   ```

2. **Generate API clients**:
   ```bash
   pnpm gen:api
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Run tests**:
   ```bash
   pnpm test:run    # Unit/Component tests
   pnpm test:e2e    # E2E tests
   ```

## Development Workflow

### File Structure
```
src/
├── domain/           # Business logic
├── adapters/         # External integrations
├── presentations/    # UI components
└── app/             # App configuration
```

### Key Files
- `src/presentations/pages/DocumentManagementPage.tsx` - Main page
- `src/adapters/generated/files.ts` - API client
- `playwright/tests/specs/document-management/` - E2E tests

### Adding New Components
1. Create component in `src/presentations/components/`
2. Export from `src/presentations/components/index.ts`
3. Add tests in `__tests__/` directory
4. Update i18n keys in `src/i18n/locales/`

### API Integration
- Use generated clients from `src/adapters/generated/`
- Wrap in repository pattern for data access
- Handle errors with domain error types

## Testing

### Unit Tests
```bash
pnpm test:run -- --testPathPattern=domain
```

### Component Tests
```bash
pnpm test:run -- --testPathPattern=presentations
```

### E2E Tests
```bash
pnpm test:e2e
```

## Deployment

1. **Build**:
   ```bash
   pnpm build
   ```

2. **Preview**:
   ```bash
   pnpm preview
   ```

## Troubleshooting

- **API not working**: Check MSW handlers in `src/mocks/`
- **Styling issues**: Verify MUI theme in `src/app/providers/`
- **Type errors**: Run `pnpm type-check`
- **Lint errors**: Run `pnpm lint`

## Related Documentation

- [Feature Spec](spec.md)
- [Data Model](data-model.md)
- [API Contracts](contracts/openapi.yaml)
- [Research Findings](research.md)</content>
<parameter name="filePath">/home/kaepo/speckit-workshop/specs/002-document-management-Kaede/quickstart.md