# Electron + React Setup

Este projeto foi migrado para uma arquitetura Electron + React, mantendo toda a funcionalidade original intacta.

## Estrutura

- `src-react/` - Código fonte React
  - `pages/` - Componentes de página (Home, Viewer3DGS, PLYViewer)
  - `components/` - Componentes reutilizáveis (ThemeToggle)
  - `main.jsx` - Ponto de entrada React
  - `App.jsx` - Componente principal com roteamento
- `electron/` - Processo principal Electron
  - `main.js` - Gerenciamento de janela Electron
- `vite.config.js` - Configuração Vite para React
- `dist-react/` - Build de produção (gerado)

## Comandos Disponíveis

### Desenvolvimento
```bash
# Desenvolvimento React apenas (http://localhost:5173)
npm run dev:react

# Desenvolvimento Electron + React (recomendado)
npm run electron:dev
```

### Build
```bash
# Build React para produção
npm run build:react

# Build Electron app (requer electron-builder configurado)
npm run electron:build
```

### Comandos Originais (ainda funcionam)
```bash
# Build da biblioteca
npm run build-library

# Build demo (HTML estático)
npm run build-demo

# Servir demo
npm run demo
```

## Instalação

```bash
npm install
```

Isso instalará todas as dependências, incluindo:
- React e React DOM
- Electron
- Vite
- Three.js (como dependência)
- Outras dependências do projeto original

## Como Funciona

1. **React App**: A aplicação React roda em `src-react/` e é servida pelo Vite em desenvolvimento
2. **Electron**: O processo Electron (`electron/main.js`) abre uma janela que carrega a aplicação React
3. **Roteamento**: Usa `HashRouter` para compatibilidade com Electron (arquivos locais)
4. **Three.js**: Integrado via imports ES modules, funcionando tanto no React quanto no Electron

## Migração de Páginas

- `demo/index.html` → `src-react/pages/Home.jsx`
- `demo/threedgs.html` → `src-react/pages/Viewer3DGS.jsx`
- `demo/ply-viewer.html` → `src-react/pages/PLYViewer.jsx`

Toda a funcionalidade original foi preservada, incluindo:
- Dark mode toggle
- Carregamento de arquivos .ply, .ksplat, .splat
- Visualização 3DGS
- Visualização PLY
- Controles e navegação

## Notas Importantes

- O projeto original (`demo/`) ainda está intacto e pode ser usado normalmente
- A biblioteca `gaussian-splats-3d` é importada de `build/gaussian-splats-3d.module.js`
- Three.js é uma dependência regular do npm
- O build da biblioteca deve ser executado antes de usar a aplicação React (`npm run build-library`)

