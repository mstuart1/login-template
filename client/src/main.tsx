import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { setAssetPath } from '@esri/calcite-components/dist/components'

import CCPackage from "../node_modules/@esri/calcite-components/package.json";

const path = `https://js.arcgis.com/calcite-components/${CCPackage?.version}/assets`;

setAssetPath(path)



// console.log('React version:', React.version)
// console.log('vars', import.meta.env.VITE_APP_BASENAME, process.env.NODE_ENV)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <App/>
  </React.StrictMode>,
)
