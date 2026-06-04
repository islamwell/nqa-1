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

// Global listener to ensure the page reloads as soon as the new service worker takes over,
// even if it happens before the onUpdate callback runs.
let refreshing = false;
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
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
