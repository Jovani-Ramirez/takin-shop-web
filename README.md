# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

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

export default tseslint.config([
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

## Versiones específicas requeridas

- Node.js versión mínima recomendada: **v22.14.0**  
- Vite versión: **7.0.6**  
- @vitejs/plugin-react versión mínima recomendada: **4.7.0**  
- vite-plugin-pwa versión: **1.0.2**

Puedes verificar tu versión de Node.js con:

```bash
node -v
```

## Instalación y ejecución paso a paso

Después de clonar el repositorio, sigue estos pasos para ejecutar el proyecto:

1. Abre una terminal y navega a la carpeta del proyecto:

   ```bash
   cd takin-shop-web
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Ejecuta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre tu navegador y visita la URL que indique la terminal (por defecto suele ser `http://localhost:5173`).

5. ¡Listo! Ahora puedes empezar a desarrollar con React, TypeScript y Vite.

## Notas adicionales

- Para proyectos modernos con React y TypeScript, configurar ESLint con reglas que analicen tipos es altamente recomendable para mayor robustez y calidad en el código.

- Puedes elegir entre `@vitejs/plugin-react` (Babel) o `@vitejs/plugin-react-swc` (SWC) para Fast Refresh.

- Asegúrate de usar Node.js versión **v22.14.0** o superior.

- Vite está en la versión **7.0.6**.

- El plugin oficial React recomendado es **@vitejs/plugin-react 4.7.0**.

- Se usa `vite-plugin-pwa` en la versión **1.0.2**.

