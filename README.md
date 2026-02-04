# Eva.Watch

Dashboard comunitário para monitoramento do EVA com dados on-chain, preços em tempo real e verificação pública de reservas.

## ✅ Requisitos

- Node.js 18+
- pnpm

## 🔧 Desenvolvimento local

```bash
pnpm install
pnpm dev
```

## 🧱 Build

```bash
# Build padrão (inclui server bundle)
pnpm build

# Build otimizado para GitHub Pages (gera /docs)
pnpm build:pages

# Preview local do build de GitHub Pages
pnpm preview:pages
```

## 🚀 Deploy no GitHub Pages

O deploy é automatizado via GitHub Actions e publica a pasta `/docs` como artefato do Pages.
Veja instruções completas em `GITHUB_PAGES_SETUP.md`.
