use hyperprocess_macro::hyperprocess;
// 
use hyperware_app_common::hyperware_process_lib::kiprintln;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct HyperprocessState {
    state: HashMap<String, String>,
}

#[hyperprocess(
    name = "Hyperprocess",
    ui = Some(HttpBindingConfig::default()),
    endpoints = vec![
        Binding::Http { 
            path: "/api",
            config: HttpBindingConfig::new(false, false, false, None),
        },
        Binding::Ws {
            path: "/ws",
            config: WsBindingConfig::new(false, false, false),
        }
    ],
    save_config = SaveOptions::EveryMessage,
    wit_world = "hyperprocess-template-dot-os-v0"
)]

impl HyperprocessState {
    #[init]
    async fn initialize(&mut self) {
        println!("init");
        self.state = HashMap::new();
    }

    // Local Hyperware request
    #[local]
    async fn add_to_state(&mut self, value: String) -> bool {
        // Using the value as both key and value for simplicity
        // You may want to modify this based on your actual requirements
        self.state.insert(value.clone(), value);
        true
    }

    // Double annotation for endpoint accepting both local and remote Hyperware requests
    #[local]
    #[remote]
    async fn get_state(&self) -> Vec<String> {
        // Convert HashMap values to Vec<String>
        self.state.values().cloned().collect()
    }

    // HTTP endpoint, will need to be a POST request on the frontend
    // to the /api endpoint
    // We add an empty string as a parameter to satisfy the HTTP POST
    // requirement, but it is not used.
    #[http]
    async fn view_state(&self, empty: String) -> Vec<String> {
        // Convert HashMap values to Vec<String>
        self.state.values().cloned().collect()
    }

    // HTTP endpoint, will need to be a POST request on the frontend
    // to the /api endpoint
    #[http]
    async fn submit_entry(&mut self, value: String) -> bool {
        // Using the value as both key and value for simplicity
        // You may want to modify this based on your actual requirements
        self.state.insert(value.clone(), value);
        true
    }


}
