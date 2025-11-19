# CETROHOGAR - Sistema de Gestión de Ventas

Panel de administración completo para mueblería con autenticación JWT, gestión de usuarios, clientes, productos, ventas, pagos y reportes en tiempo real.

## 🎨 Características

- **Autenticación JWT** con roles (Administrador, Vendedor, Encargado de Stock)
- **Dashboard interactivo** con gráficos y KPIs en tiempo real
- **Gestión completa** de usuarios, clientes, productos, ventas y pagos
- **Sistema de cuotas** con seguimiento de vencimientos
- **Modo claro/oscuro** con tema personalizado de CETROHOGAR
- **Diseño responsive** con Chakra UI
- **Optimización de datos** con React Query

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js 18+ 
- MySQL 8.0+
- Backend ya configurado en puerto 3000

### Backend

```powershell
cd backend
npm install
npm run dev
```

El backend debe estar corriendo en `http://localhost:3000`

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

El frontend se abrirá en `http://localhost:5173`

## 👤 Credenciales por Defecto

**Usuario:** admin  
**Contraseña:** admin123

## 🎨 Paleta de Colores CETROHOGAR

- **Naranja Principal:** #FF6B00 (Botones CTA, elementos destacados)
- **Azul Profundo:** #003087 (Navegación, enlaces)
- **Blanco Puro:** #FFFFFF (Fondo principal)
- **Gris Oscuro:** #333333 (Texto principal)
- **Gris Claro:** #F5F5F5 (Fondos secundarios)

## 🔐 Roles y Permisos

### Administrador
- Acceso completo a todas las funciones
- Gestión de usuarios
- Reportes avanzados

### Vendedor
- Gestión de clientes
- Creación de ventas
- Registro de pagos

### Encargado de Stock
- Gestión de productos
- Control de inventario

## 🛠️ Tecnologías Utilizadas

- **React 19** con TypeScript
- **Chakra UI** para componentes
- **React Router** para navegación
- **React Query** para cache y sincronización
- **Axios** para peticiones HTTP
- **Recharts** para gráficos
- **React Icons** para iconos

## 📝 Variables de Entorno

Crear archivo `.env` en la carpeta `frontend`:

```env
VITE_API_URL=http://localhost:3000
```

---

# React + TypeScript + Vite (Template Original)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
