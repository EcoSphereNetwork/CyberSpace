# CyberSpace

A 3D immersive platform for network visualization and interaction.

## Project Structure

```
cyberspace/
├── src/                    # Source code
│   ├── core/              # Core functionality
│   │   ├── Scene.ts
│   │   ├── WindowManager.ts
│   │   ├── PluginSystem.ts
│   │   └── NetworkVisualizer.ts
│   ├── components/        # React components
│   ├── utils/            # Utility functions
│   ├── services/         # Service layer
│   ├── plugins/          # Plugin system
│   ├── blockchain/       # Blockchain integration
│   ├── vr/              # VR/AR features
│   ├── game/            # Game mechanics
│   ├── assets/          # Static assets
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
├── public/              # Public assets
│   └── assets/
│       ├── models/      # 3D models
│       ├── textures/    # Textures
│       └── fonts/       # Custom fonts
├── docs/               # Documentation
│   ├── api/           # API documentation
│   ├── guides/        # User guides
│   └── architecture/  # Architecture docs
├── tests/             # Test files
│   ├── unit/         # Unit tests
│   ├── integration/  # Integration tests
│   └── e2e/          # End-to-end tests
├── config/           # Configuration files
├── scripts/          # Build and utility scripts
├── package.json      # Project dependencies
├── tsconfig.json     # TypeScript configuration
├── vite.config.ts    # Vite configuration
└── README.md         # Project documentation

## Setup

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd cyberspace
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Start development server
\`\`\`bash
npm run dev
\`\`\`

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code

## Documentation

- API documentation is available in the `docs/api` directory
- User guides are available in the `docs/guides` directory
- Architecture documentation is available in the `docs/architecture` directory

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT