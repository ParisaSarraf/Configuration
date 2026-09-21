import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import QueryProvider from './Services/reactQueryProvider.jsx'
import {App as AntApp} from 'antd';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryProvider>
            <AntApp>
                <ErrorBoundary>
                    <App/>
                </ErrorBoundary>
            </AntApp>
        </QueryProvider>
    </StrictMode>,
)
