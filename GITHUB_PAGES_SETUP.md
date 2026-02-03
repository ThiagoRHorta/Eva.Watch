# GitHub Pages Setup para Eva's Audit

Este projeto foi reestruturado para rodar **gratuitamente** no GitHub Pages.

## 🚀 Como ativar GitHub Pages

1. Vá para **Settings** do repositório
2. Navegue até **Pages** (no menu lateral esquerdo)
3. Em **Source**, selecione:
   - **Deploy from a branch**
   - Branch: `development`
   - Folder: `/docs`
4. Clique em **Save**

O site será publicado em: `https://ThiagoRHorta.github.io/Eva-s-Audit/`

## 📦 Stack Técnico

- **React 19** + TypeScript
- **Vite** para build otimizado
- **Tailwind CSS 4** para estilos
- **ethers.js** para integração com blockchain (Arbitrum)
- **Recharts** para visualizações (se necessário)

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Rodar servidor de desenvolvimento
pnpm dev

# Fazer build para produção (gera a pasta docs para o GitHub Pages)
pnpm build:pages

# Visualizar build localmente
pnpm preview
```

## 📊 Funcionalidades

O dashboard inclui:

- **Dados On-Chain**: Integração com Arbitrum RPC para leitura de dados do contrato EVA
- **Preços em Tempo Real**: Integração com CoinGecko API
- **Transações**: Scan de eventos Transfer do WBTC (mês corrente)
- **Calculadora**: Modal interativo para calcular valores de EVA
- **Tema Escuro**: Interface otimizada para dark mode

## 🌐 Acesso Público

Após ativar GitHub Pages, o site estará disponível em:
- `https://ThiagoRHorta.github.io/Eva-s-Audit/`

## ⚙️ Configuração de Base Path

O arquivo `vite.config.ts` detecta automaticamente quando está rodando no GitHub Pages:

```typescript
base: process.env.GITHUB_PAGES ? "./" : "/",
```

Isso garante que todos os assets e rotas funcionem corretamente mesmo quando o projeto é publicado em um subdiretório (como o GitHub Pages).

## 📝 Notas

- O projeto é **100% estático** - não requer backend
- Todas as chamadas de dados são feitas diretamente do frontend
- Cache de preços: 1 minuto (otimizado para não sobrecarregar APIs)
- Suporte a navegadores modernos (Chrome, Firefox, Safari, Edge)

## 🔗 Links Úteis

- [Documentação Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ethers.js](https://docs.ethers.org/)
- [GitHub Pages](https://pages.github.com/)
