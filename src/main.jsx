import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/design-system.css'
import QueryProvider from './Services/reactQueryProvider.jsx'
import {App as AntApp} from 'antd';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'
import QueryFeedbackBridge from './components/AsyncState/QueryFeedbackBridge.jsx'

createRoot(document.getElementById('root')).render(
 <StrictMode>
 <QueryProvider>
 <AntApp>
 <ErrorBoundary>
 <QueryFeedbackBridge/>
 <App/>
 </ErrorBoundary>
 </AntApp>
 </QueryProvider>
 </StrictMode>,
)
