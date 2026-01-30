# Security Fix Plan: npm tar Vulnerabilities

**Branch**: `001-study-management-site` | **Date**: 2026-01-29 | **Spec**: [spec.md](spec.md)
**Input**: npm audit HIGH vulnerabilities in tar via node-pre-gyp dependency chain

## Summary

Fixed 3 HIGH severity vulnerabilities in `tar` package (CVE path traversal, symlink poisoning, hardlink traversal) by applying npm overrides to force `tar@7.5.7` (patched version). Added audit scripts for CI integration.

## Technical Context

**Language/Version**: Node.js 20+ (ES Modules)  
**Primary Dependencies**: bcrypt@5.1.1 → @mapbox/node-pre-gyp@1.0.11 → tar (vulnerable)  
**Storage**: MongoDB (unchanged)  
**Testing**: jest (unchanged)  
**Target Platform**: Linux/Windows server  
**Project Type**: web (backend API)  
**Constraints**: No breaking changes to existing functionality

## Constitution Check

*GATE: Passed - Security fix aligns with Constitution Section IV (Security)*

| Principle | Status | Notes |
|-----------|--------|-------|
| IV. Security - Input validation | ✅ | tar vulnerabilities are path traversal attacks |
| IV. Security - SQL injection prevention | N/A | Not database related |
| Governance - Tests must pass | ✅ | No test changes required |

## Vulnerability Analysis

### Dependency Chain

```
bcrypt@5.1.1 (direct dependency)
  └── @mapbox/node-pre-gyp@1.0.11 (transitive)
        └── tar@<=7.5.6 (vulnerable) → tar@7.5.7 (patched via override)
```

### CVEs Fixed

| Advisory | Severity | CVSS | Description |
|----------|----------|------|-------------|
| GHSA-8qq5-rm4j-mr97 | HIGH | - | Arbitrary File Overwrite via Path Traversal |
| GHSA-r6q2-hw4h-h46w | HIGH | 8.8 | Race Condition via Unicode Ligature (macOS) |
| GHSA-34x7-hfp2-rc4v | HIGH | 8.2 | Hardlink Path Traversal |

### Risk Assessment

- **Runtime Impact**: None - tar is only used during `npm install` for downloading pre-built bcrypt binaries
- **Build-time Impact**: Mitigated - override forces patched version
- **Breaking Changes**: None - bcrypt API unchanged

## Changes Made

### backend/package.json

```json
{
  "scripts": {
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix",
    "preinstall": "npx npm-force-resolutions || true"
  },
  "overrides": {
    "tar": "^7.5.7"
  }
}
```

### Verification

```bash
$ npm audit
found 0 vulnerabilities

$ npm ls tar
└─┬ bcrypt@5.1.1
  └─┬ @mapbox/node-pre-gyp@1.0.11
    └── tar@7.5.7  # ✅ Patched version
```

## CI Integration

New npm scripts available for CI pipelines:

| Script | Usage | Exit Code |
|--------|-------|-----------|
| `npm run audit` | Check for HIGH+ vulnerabilities | Non-zero if found |
| `npm run audit:fix` | Auto-fix vulnerabilities | - |

### Recommended CI Step (GitHub Actions)

```yaml
- name: Security Audit
  run: cd backend && npm run audit
```

### Recommended CI Step (Azure DevOps)

```yaml
- script: cd backend && npm run audit
  displayName: 'Security Audit'
```

## Alternatives Considered

| Option | Description | Rejected Because |
|--------|-------------|------------------|
| Upgrade bcrypt to 6.0.0 | Removes node-pre-gyp entirely | Potential breaking changes, untested with existing code |
| Replace with bcryptjs | Pure JS, no native binaries | Performance regression (~3x slower) |
| Ignore vulnerabilities | Build-time only risk | Does not align with Constitution security principles |
| **Override tar (chosen)** | Force patched version | ✅ No breaking changes, immediate fix |

## Future Recommendations

1. **Monitor bcrypt@6.0.0** - Once stable, consider upgrading to eliminate node-pre-gyp entirely
2. **Add npm audit to CI** - Prevent future vulnerable dependencies from merging
3. **Regular dependency updates** - Schedule monthly `npm update` reviews
