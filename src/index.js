import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";

const dispatchLifecycleEvent = (name, detail = {}) => {
    window.dispatchEvent(new CustomEvent(name, { detail }));
};

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

let refreshing = false;
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });
}

// Auto-update configuration for PWA
serviceWorkerRegistration.register({
    onUpdate: (registration) => {
        dispatchLifecycleEvent("pwa-update-available");

        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
    },
    onSuccess: (registration) => {
        dispatchLifecycleEvent("pwa-ready", { registration });
    }
});
