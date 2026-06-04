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

// Auto-update configuration for PWA (Forced automatically)

serviceWorkerRegistration.register({
    onUpdate: (registration) => {
        // When a new service worker is waiting, force it to activate immediately
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Listen for when the new service worker takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Force reload the page to apply the latest version
            window.location.reload();
        });
    },
    onSuccess: (registration) => {
        console.log('Service worker registered successfully');
    }
});
