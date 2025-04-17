use hyperprocess_macro::hyperprocess;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use hyperware_app_common::hyperware_process_lib as hyperware_process_lib;

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct HyperprocessState {
    state: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseAPI {
    response: String,
}

pub struct InternalType {
    pub type_name: String,
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
    wit_world = "hyperprocess-app-template-dot-os-v0"
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
    #[http]
    async fn get_state_http(&self) -> Vec<String> {
        // Convert HashMap values to Vec<String>
        self.state.values().cloned().collect()
    }

    #[local]
    async fn get_state_api(&self) -> ResponseAPI {
        // Convert HashMap values to Vec<String>
        ResponseAPI {
            response: self.state.values().cloned().collect()
        }
    }

}
