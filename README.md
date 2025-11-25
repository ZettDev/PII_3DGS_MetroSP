# 🚇 Sistema de Monitoramento 3D - Metro SP

Sistema completo de gestão de ativos, visualização de nuvens de pontos e análise comparativa BIM vs Realidade utilizando **3D Gaussian Splatting (3DGS)** para reconstrução fotogramétrica e comparação com modelos BIM.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características Principais](#características-principais)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Usar](#como-usar)
- [Funcionalidades Detalhadas](#funcionalidades-detalhadas)
- [API e Endpoints](#api-e-endpoints)
- [Desenvolvimento](#desenvolvimento)
- [Requisitos do Sistema](#requisitos-do-sistema)
- [Boas Práticas](#boas-práticas)
- [Licença](#licença)

---

## 🎯 Visão Geral

Este sistema foi desenvolvido para o **Metro de São Paulo** com o objetivo de:

- **Gerenciar projetos** de monitoramento de infraestrutura
- **Processar fotografias** para reconstrução 3D usando Gaussian Splatting
- **Visualizar modelos 3DGS** diretamente no navegador com alta performance
- **Comparar modelos BIM** com reconstruções da realidade capturada (análise C2C - Cloud-to-Cloud)
- **Analisar divergências** entre o projeto (BIM) e a realidade capturada
- **Gerar relatórios** de análise de qualidade e discrepâncias

O sistema integra múltiplas tecnologias de visão computacional e renderização 3D para criar um pipeline automatizado de reconstrução e análise.

---

## ✨ Características Principais

### 🏗️ Gestão de Projetos
- Criação e gerenciamento de projetos de monitoramento
- Upload e armazenamento de modelos BIM (OBJ, PLY)
- Organização hierárquica: Projetos → Registros → Análises

### 📸 Processamento Fotográfico
- Upload de múltiplas fotografias por registro
- Processamento completo automatizado:
  - Reconstrução 3D usando Gaussian Splatting
  - Geração de modelos 3DGS (.ply, .ksplat, .splat)
  - Integração com COLMAP e Brush para pipeline SfM

### 🎨 Visualização 3D
- **Visualizador 3DGS** integrado com Three.js
- Suporte para múltiplos formatos: PLY, KSplat, Splat
- Renderização em tempo real com WebGL
- Controles de câmera (orbit, pan, zoom)
- Modos de visualização: 2D e 3D
- Visualizadores para modelos OBJ e PLY

### 📊 Análise Comparativa (C2C)
- Comparação Cloud-to-Cloud entre BIM e realidade
- Cálculo de distâncias ponto-a-ponto
- Métricas estatísticas: média, desvio padrão
- Visualização de mapas de calor de divergências
- Relatórios detalhados de análise

### 🎛️ Interface Moderna
- Design responsivo e intuitivo
- Tema claro/escuro
- Feedback visual de progresso
- Tratamento de erros robusto
- Navegação fluida entre módulos

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework UI
- **React Router DOM** - Roteamento
- **Vite** - Build tool e dev server
- **Three.js** - Renderização 3D
- **GaussianSplats3D** - Biblioteca de visualização 3DGS
- **CSS Modules** - Estilização modular

### Desktop (Electron)
- **Electron 28** - Aplicação desktop multiplataforma
- **Electron Builder** - Empacotamento de distribuições

### Backend (API Externa)
- API REST para comunicação
- Endpoints para projetos, registros e análises
- Upload de arquivos multipart
- Processamento assíncrono de análises

### Bibliotecas e Ferramentas
- **COLMAP** - Structure-from-Motion
- **Brush** - Pipeline de reconstrução 3DGS
- **WebAssembly** - Workers para ordenação de splats
- **SharedArrayBuffer** - Performance otimizada

---

## 🏛️ Arquitetura do Sistema

### Arquitetura em Camadas

```
┌─────────────────────────────────────────┐
│         Camada de Apresentação         │
│  (React Components, Pages, UI)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Camada de Casos de Uso          │
│  (Use Cases, Business Logic)            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Camada de Domínio                │
│  (Entities, Interfaces, Domain Logic)    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Camada de Dados                  │
│  (Repositories, DTOs, API Service)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         API Backend (Externa)            │
│  (REST Endpoints, File Storage)          │
└─────────────────────────────────────────┘
```

### Padrões de Design

- **Repository Pattern** - Abstração de acesso a dados
- **Use Case Pattern** - Lógica de negócio isolada
- **DTO Pattern** - Transferência de dados entre camadas
- **Factory Pattern** - Criação de instâncias de use cases
- **Observer Pattern** - Atualização de estado de análises

---

## 📂 Estrutura do Projeto

```
PII_3DGS_MetroSP/
├── src/                          # Biblioteca GaussianSplats3D (core)
│   ├── loaders/                  # Carregadores de formatos (PLY, KSplat, Splat)
│   ├── splatmesh/                # Renderização de splats
│   ├── splattree/                # Estrutura de dados para splats
│   ├── raycaster/                # Sistema de raycasting
│   ├── ui/                       # Componentes UI do viewer
│   ├── webxr/                    # Suporte WebXR (AR/VR)
│   ├── worker/                   # Web Workers e WASM
│   └── Viewer.js                 # Classe principal do viewer
│
├── src-react/                    # Aplicação React
│   ├── components/               # Componentes reutilizáveis
│   │   ├── AnalysisCard.jsx      # Card de análise
│   │   ├── ProjectCard.jsx       # Card de projeto
│   │   ├── RecordCard.jsx        # Card de registro
│   │   ├── FileUpload.jsx        # Upload de arquivos
│   │   ├── LoadingSpinner.jsx    # Indicador de carregamento
│   │   └── ThemeToggle.jsx       # Alternador de tema
│   │
│   ├── pages/                    # Páginas da aplicação
│   │   ├── Home.jsx              # Página inicial
│   │   ├── ProjectsList.jsx      # Lista de projetos
│   │   ├── ProjectCreate.jsx     # Criação de projeto
│   │   ├── ProjectDetails.jsx    # Detalhes do projeto
│   │   ├── RecordCreate.jsx      # Criação de registro
│   │   ├── AnalysisCreate.jsx    # Criação de análise
│   │   ├── AnalysisDetails.jsx   # Detalhes da análise
│   │   ├── Viewer3DGS.jsx        # Visualizador 3DGS
│   │   ├── PLYViewer.jsx         # Visualizador PLY
│   │   └── OBJViewer.jsx         # Visualizador OBJ
│   │
│   ├── domain/                   # Camada de domínio
│   │   ├── entities/             # Entidades de negócio
│   │   │   ├── Project.ts
│   │   │   ├── Record.ts
│   │   │   └── Analysis.ts
│   │   └── interfaces/           # Contratos de repositórios
│   │
│   ├── data/                     # Camada de dados
│   │   ├── repositories/         # Implementação de repositórios
│   │   ├── dtos/                 # Data Transfer Objects
│   │   ├── services/             # Serviços de API
│   │   └── factories/            # Factories de use cases
│   │
│   ├── usecases/                 # Casos de uso
│   │   ├── projects/             # Use cases de projetos
│   │   ├── records/              # Use cases de registros
│   │   ├── analyses/             # Use cases de análises
│   │   └── health/               # Health check
│   │
│   ├── shared/                   # Código compartilhado
│   │   ├── errors/               # Tratamento de erros
│   │   ├── types/                 # Tipos TypeScript
│   │   └── utils/                 # Utilitários
│   │
│   ├── services/                 # Serviços auxiliares
│   │   └── api.js                # Cliente API simplificado
│   │
│   ├── assets/                    # Assets estáticos
│   ├── public/                    # Arquivos públicos
│   ├── App.jsx                    # Componente raiz
│   └── main.jsx                   # Entry point
│
├── electron/                     # Configuração Electron
│   └── main.js                   # Processo principal Electron
│
├── util/                         # Utilitários e scripts
│   ├── server.js                 # Servidor de desenvolvimento
│   └── create-ksplat.js          # Conversão de formatos
│
├── build/                        # Build da biblioteca (gerado)
├── dist-react/                   # Build React (gerado)
│
├── package.json                  # Dependências e scripts
├── vite.config.js               # Configuração Vite
├── rollup.config.js             # Configuração Rollup
└── README.md                     # Este arquivo
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git**

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd PII_3DGS_MetroSP
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure a API Backend**

   Crie um arquivo `.env` na raiz do projeto (ou configure via variáveis de ambiente):
```env
VITE_API_BASE_URL=http://localhost:3000
```

4. **Build da biblioteca core**
```bash
npm run build-library
```

### Executando a Aplicação

#### Modo Desenvolvimento (Web)

```bash
npm run dev:react
```

A aplicação estará disponível em `http://localhost:5173`

#### Modo Desenvolvimento (Electron)

```bash
npm run electron:dev
```

Isso iniciará o servidor Vite e o Electron simultaneamente.

#### Build de Produção

```bash
# Build React
npm run build:react

# Build Electron (distribuição)
npm run electron:build
```

---

## 📖 Como Usar

### 1. Criar um Projeto

1. Na página inicial, clique em **"Novo Projeto"**
2. Preencha:
   - **Nome do projeto**
   - **Descrição** (opcional)
   - **Modelo BIM** (arquivo OBJ ou PLY)
3. Clique em **"Criar Projeto"**

### 2. Adicionar Registro Fotográfico

1. Acesse os detalhes do projeto
2. Clique em **"Adicionar Registro"**
3. Selecione múltiplas fotografias
4. Escolha uma das opções:
   - **Upload simples**: Apenas upload das fotos
   - **Processamento completo**: Upload + reconstrução 3DGS automática

### 3. Processamento Completo

O processamento completo realiza automaticamente:

1. **Upload das fotografias**
2. **Reconstrução 3DGS** usando COLMAP + Brush
3. **Geração do modelo** (.ply, .ksplat)
4. **Criação do registro** no sistema

⚠️ **Atenção**: O processamento pode levar vários minutos dependendo do número de fotos.

### 4. Visualizar Modelos

#### Visualizar 3DGS

1. No projeto, clique em **"Visualizar"** no registro desejado
2. Ou acesse `/threedgs` e carregue um arquivo manualmente
3. Use os controles:
   - **Mouse**: Orbit, Pan, Zoom
   - **Tecla I**: Painel de debug
   - **Tecla P**: Modo point cloud
   - **Tecla O**: Projeção ortográfica

#### Visualizar BIM/PLY/OBJ

- Os modelos BIM podem ser visualizados diretamente nos detalhes do projeto
- Formatos suportados: OBJ, PLY

### 5. Criar Análise C2C

1. No projeto, clique em **"Reanálise C2C"**
2. Selecione um **registro** com reconstrução 3DGS
3. Clique em **"Criar Análise"**

A análise compara o modelo BIM com a reconstrução 3DGS e calcula:
- Distâncias ponto-a-ponto
- Média de divergências
- Desvio padrão
- Mapa de calor de discrepâncias

### 6. Visualizar Resultados da Análise

1. Acesse **"Painel de Análises"** ou os detalhes do projeto
2. Clique em uma análise para ver:
   - Status e progresso
   - Logs de processamento
   - Métricas estatísticas
   - Download de resultados

---

## 🔧 Funcionalidades Detalhadas

### Gestão de Projetos

- ✅ Criação, edição e exclusão de projetos
- ✅ Upload de modelos BIM (OBJ, PLY)
- ✅ Visualização e download de modelos
- ✅ Organização hierárquica de dados

### Processamento de Registros

- ✅ Upload de múltiplas fotografias
- ✅ Processamento assíncrono
- ✅ Reconstrução 3DGS automatizada
- ✅ Suporte a formatos: PLY, KSplat, Splat
- ✅ Visualização de progresso em tempo real

### Visualização 3D

#### Visualizador 3DGS
- Renderização em tempo real com WebGL
- Suporte a milhões de splats
- Controles de câmera intuitivos
- Modos de renderização: 2D e 3D
- Configurações de alpha threshold
- Anti-aliasing opcional

#### Visualizadores OBJ/PLY
- Carregamento de modelos mesh
- Visualização de nuvens de pontos
- Controles de câmera padrão

### Análise Comparativa

- ✅ Comparação Cloud-to-Cloud (C2C)
- ✅ Cálculo de distâncias ponto-a-ponto
- ✅ Métricas estatísticas:
  - Média de distâncias
  - Desvio padrão
  - Distribuição de divergências
- ✅ Geração de mapas de calor
- ✅ Relatórios em JSON
- ✅ Download de resultados

### Interface do Usuário

- ✅ Design moderno e responsivo
- ✅ Tema claro/escuro
- ✅ Feedback visual de ações
- ✅ Tratamento de erros robusto
- ✅ Loading states e progress bars
- ✅ Navegação intuitiva

---

## 🌐 API e Endpoints

### Base URL

```
http://localhost:3000
```

### Endpoints Principais

#### Health Check
```
GET /health
```

#### Projetos
```
GET    /api/projects              # Listar projetos
POST   /api/projects              # Criar projeto
GET    /api/projects/:id          # Obter projeto
DELETE /api/projects/:id          # Deletar projeto
GET    /api/:id/bim/:fileId       # Download BIM
```

#### Registros
```
GET    /api/:projectId/records    # Listar registros
POST   /api/:projectId/records    # Criar registro
GET    /api/:id/registro/:fileId  # Download registro
```

#### Análises
```
GET    /api/analyses              # Listar análises
POST   /api/analyses              # Criar análise
GET    /api/analyses/:id          # Obter análise
DELETE /api/analyses/:id          # Cancelar análise
GET    /api/:id/analise/:fileId   # Download resultado
GET    /api/:projectId/analyses   # Análises do projeto
```

#### Processamento Completo
```
POST   /api/:projectId/photo-processing-full  # Upload + Reconstrução + Registro
POST   /api/:projectId/analysis-full          # Análise com modelos existentes
```

### Formato de Requisições

#### Criar Projeto (multipart/form-data)
```javascript
FormData {
  name: string
  description?: string
  modeloBim: File
}
```

#### Criar Registro (multipart/form-data)
```javascript
FormData {
  name: string
  fotos: File[]  // Múltiplas fotos
}
```

#### Criar Análise (JSON)
```json
{
  "projectId": number,
  "recordId": number,
  "parametros": object  // Opcional
}
```

### Formato de Respostas

#### Projeto
```json
{
  "id": number,
  "name": string,
  "description": string | null,
  "bimPath": string,
  "createdAt": string
}
```

#### Registro
```json
{
  "id": number,
  "name": string,
  "uploadedFilesPaths": string[],
  "recordPath": string | null,
  "createdAt": string,
  "projectId": number
}
```

#### Análise
```json
{
  "id": number,
  "projectId": number,
  "recordId": number,
  "status": "pending" | "processing" | "completed" | "failed",
  "progress": number,
  "logs": string[],
  "error": string | null,
  "outputPaths": {
    "modelo3d": string,
    "comparacaoBim": string,
    "relatorio": string
  },
  "meanDistance": number | null,
  "stdDeviation": number | null,
  "createdAt": string,
  "startedAt": string | null,
  "updatedAt": string,
  "completedAt": string | null
}
```

---

## 💻 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev:react              # Servidor Vite (React)
npm run electron:dev           # Electron + Vite

# Build
npm run build-library          # Build da biblioteca core
npm run build:react            # Build React para produção
npm run electron:build         # Build Electron distribuição

# Preview
npm run preview:react          # Preview do build React

# Qualidade de Código
npm run lint                   # ESLint
npm run fix-js                  # Corrigir problemas JS
npm run prettify                # Formatar código
npm run fix-styling             # Corrigir CSS/SCSS
```

### Estrutura de Código

#### Componentes React
- Componentes funcionais com hooks
- CSS Modules para estilização
- Props tipadas (quando usando TypeScript)

#### Casos de Uso
- Lógica de negócio isolada
- Testável e reutilizável
- Sem dependências de UI

#### Repositórios
- Abstração de acesso a dados
- Implementação de interfaces de domínio
- Conversão de DTOs para entidades

### Adicionando Novas Funcionalidades

1. **Nova Entidade de Domínio**
   - Criar classe em `domain/entities/`
   - Definir interface em `domain/interfaces/`
   - Criar DTO em `data/dtos/`

2. **Novo Repositório**
   - Implementar interface em `domain/interfaces/`
   - Criar implementação em `data/repositories/`

3. **Novo Caso de Uso**
   - Criar em `usecases/`
   - Registrar na factory

4. **Nova Página**
   - Criar componente em `pages/`
   - Adicionar rota em `App.jsx`

---

## ⚙️ Requisitos do Sistema

### Navegador (Modo Web)

⚠️ **Não recomendado para produção**. Use Electron.

- Chrome/Edge/Brave/Opera (recomendado)
- Aceleração de hardware **obrigatória**
- WebGL 2.0 suportado
- SharedArrayBuffer habilitado

**Configuração Chrome:**
```
chrome://settings/system
→ "Usar aceleração de hardware quando disponível" ✅
```

### Electron (Recomendado)

- Electron 28+
- Aceleração gráfica automática
- SharedArrayBuffer habilitado por padrão
- Melhor performance para modelos grandes

### Hardware Recomendado

- **GPU**: Dedicada (NVIDIA/AMD) recomendada
- **RAM**: Mínimo 8GB, recomendado 16GB+
- **CPU**: Multi-core para processamento
- **Armazenamento**: SSD recomendado

---

## 📸 Boas Práticas

### Captura Fotográfica

Para obter melhores resultados na reconstrução 3DGS:

1. **Movimentação suave**
   - Evite movimentos bruscos
   - Velocidade uniforme ao redor da cena

2. **Overlap adequado**
   - 60-80% de sobreposição entre fotos
   - Sequência contínua, não fotos isoladas

3. **Distância consistente**
   - Objetos pequenos: 0,5m - 1,5m
   - Ambientes maiores: 2m - 4m

4. **Variação de ângulos**
   - Circule completamente o objeto
   - Capture diferentes alturas
   - Atenção a cantos e bordas

5. **Iluminação**
   - Luz difusa preferível
   - Evite reflexos e flash direto
   - Ambiente homogêneo ajuda correspondências

6. **Vídeo (opcional)**
   - Grave em 4K se possível
   - Estabilização ativa ajuda
   - Evite motion blur

### Uso de Análises C2C

**Recomendação:**
- Use **3DGS como referência (source)**
- Use **outro modelo** (mesh/PLY) como target

**Motivos:**
- 3DGS é mais rico em detalhes
- Mais eficiente computacionalmente
- Tempo de análise reduzido

⚠️ Usar 3DGS como target aumenta significativamente o tempo de processamento.

---

## 🐛 Troubleshooting

### Problemas Comuns

#### Visualizador não carrega
- Verifique aceleração de hardware
- Confirme suporte WebGL 2.0
- Teste em Electron (recomendado)

#### Performance baixa
- Reduza número de splats
- Ajuste alpha threshold
- Use modo 2D para preview
- Verifique GPU dedicada

#### Upload falha
- Verifique tamanho do arquivo
- Confirme formato suportado
- Verifique conexão com API

#### Análise não completa
- Verifique logs da análise
- Confirme modelos válidos
- Verifique recursos do servidor

---

## 📄 Licença

- **GaussianSplats3D** (base): MIT License
- **Este projeto**: MIT License (ver `LICENSE`)
- **COLMAP**: Licença própria (ver `EXTERNAL_LICENSES`)
- **Brush**: Licença própria (ver `EXTERNAL_LICENSES`)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📞 Suporte

Para questões e suporte:
- Abra uma issue no repositório
- Consulte a documentação em `DOCUMENTACAO.md`
- Verifique `ELECTRON_REACT_SETUP.md` para setup detalhado

---

## 🎓 Referências

- [GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D) - Biblioteca base
- [COLMAP](https://colmap.github.io/) - Structure-from-Motion
- [Three.js](https://threejs.org/) - Biblioteca 3D
- [React](https://react.dev/) - Framework UI
- [Electron](https://www.electronjs.org/) - Framework desktop

---

**Desenvolvido para o Metro de São Paulo** 🚇
