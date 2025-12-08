import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
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
serviceWorkerRegistration.register({
    onUpdate: (registration) => {
        // When a new service worker is waiting, automatically activate it
        if (registration && registration.waiting) {
            // Send SKIP_WAITING message to the waiting service worker
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });

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
