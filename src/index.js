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

// Reload only when an existing service worker is replaced by a new one (not on first-time install)
let refreshing = false;
if ("serviceWorker" in navigator) {
    const hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (hadController && !refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}

// Auto-update configuration for PWA (Forced automatically)

serviceWorkerRegistration.register({
    onUpdate: (registration) => {
        // When a new service worker is waiting, force it to activate immediately
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    },
    onSuccess: (registration) => {
        console.log('Service worker registered successfully');
    }
});
