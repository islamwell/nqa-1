import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { toast } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </React.StrictMode>,
    document.getElementById("root")
);

// Auto-update configuration for PWA
const UpdateToast = ({ registration }) => (
    <div>
        A new version of the app is available! 
        <button 
            onClick={() => {
                if (registration && registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            }} 
            style={{ marginLeft: '10px', padding: '4px 8px', cursor: 'pointer', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginTop: '5px' }}
        >
            Refresh Now
        </button>
    </div>
);

serviceWorkerRegistration.register({
    onUpdate: (registration) => {
        // When a new service worker is waiting, notify the user
        if (registration && registration.waiting) {
            toast.info(<UpdateToast registration={registration} />, { 
                autoClose: false, 
                closeOnClick: false, 
                position: "bottom-center" 
            });

            // Listen for when the new service worker takes control
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                // Reload the page to get the latest content
                window.location.reload();
            });
        }
    },
    onSuccess: (registration) => {
        console.log('Service worker registered successfully');
    }
});
