import React from 'react'
import ReactDOM from 'react-dom/client'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store';
import Root from './routes/root';
import Home from './pages/home';
import O33Form from './pages/O33Form';
import './index.css'

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "o33",
                element: <O33Form />,
            }
        ]
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(

    <React.StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>,
)
