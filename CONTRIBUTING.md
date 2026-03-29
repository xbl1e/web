## <img src="./src/assets/readme/contributing.svg" height="24" style="vertical-align: middle;"> Contributing

> [!NOTE]
> Open an issue first for major changes or new features. Small fixes (typos, minor bugs) can go directly to a Pull Request.

### <img height="18" src="./src/assets/readme/documentation.svg" style="vertical-align: middle;">&nbsp;&nbsp;Ground Rules

- **Keep it minimal** — the design should be quiet, fast, and functional.
- **Vanilla JS only** — no frameworks or heavy libraries.
- **Respect the style** — use custom properties from `main.css`, no hardcoded colors.
- **Consistency** — Keep the "blueprint/engineering" aesthetic intact.

### <img height="18" src="./src/assets/readme/git-branch.svg" style="vertical-align: middle;">&nbsp;&nbsp;Contribution Flow

1. **Fork** the repository and clone it locally.
2. **Branch**: Create a new branch (`feat/...` or `fix/...`).
3. **Develop**: Make your changes following the code style.
4. **Validate**: Run `npm install` and `npm run build` to ensure no errors.
5. **PR**: Open a Pull Request with a clear description of the change.

### <img height="18" src="./src/assets/readme/commit-style.svg" style="vertical-align: middle;">&nbsp;&nbsp;Commit Style

Keep your commit messages simple and descriptive:

- **feat**: new feature or addition.
- **fix**: bug fix or correction.
- **refactor**: code improvement (no API changes).
- **docs**: documentation updates.

### <img height="18" src="./src/assets/readme/features.svg" style="vertical-align: middle;">&nbsp;&nbsp;PR Checklist

- [ ] Runs `npm run build` without errors.
- [ ] No debug code or `console.log` statements.
- [ ] Follows existing file structure and naming.
- [ ] New components live in `src/components/cards/`.
- [ ] New utilities go in `src/utils/`.