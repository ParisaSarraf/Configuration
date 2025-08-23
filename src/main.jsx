import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import QueryProvider from './Services/reactQueryProvider.jsx'
import {App as AntApp} from 'antd';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryProvider>
            <AntApp>
                <App/>
            </AntApp>
        </QueryProvider>
    </StrictMode>,
)