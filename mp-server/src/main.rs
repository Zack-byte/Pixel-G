use std::{ sync::{ Arc, Mutex }, collections::HashMap, convert::Infallible };

use tokio::sync::mpsc;
use warp::{ reject::Rejection, filters::ws::Message, Filter };

mod handler;

#[derive(Clone)]
pub struct Client {
    pub user_id: String,
    pub topics: Vec<String>,
    pub in_game: bool,
    pub searching_for_game: bool,
    pub sender: Option<mpsc::UnboundedSender<std::result::Result<Message, warp::Error>>>,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct RegisterRequest {
    user_id: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct RegisterResponse {
    url: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct GameResponse {
    opponent_id: String,
    found: bool,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct GamePacket {
    opponent_id: String,
    player_x: f32,
    player_y: f32,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct FireEvent {
    opponent_id: String,
    bullet_type: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct Event {
    topic: String,
    user_id: Option<String>,
    message: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct TopicsRequest {
    topics: Vec<String>,
}

type Result<T> = std::result::Result<T, Rejection>;
type Clients = Arc<Mutex<HashMap<String, Client>>>;

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(HashMap::new()));

    let health_route = warp::path("health").and_then(handler::health_handler);

    let register = warp::path("register");
    let register_routes = register
        .and(warp::post())
        .and(warp::body::json())
        .and(with_clients(clients.clone()))
        .and_then(handler::register_handler)
        .or(
            register
                .and(warp::delete())
                .and(warp::path::param())
                .and(with_clients(clients.clone()))
                .and_then(handler::unregister_handler)
        );

    let publish = warp
        ::path("publish")
        .and(warp::body::json())
        .and(with_clients(clients.clone()))
        .and_then(handler::publish_handler);

    let ws_route = warp
        ::path("ws")
        .and(warp::ws())
        .and(warp::path::param())
        .and(with_clients(clients.clone()))
        .and_then(handler::ws_handler);

    let cors = warp
        ::cors()
        .allow_any_origin()
        .allow_headers(
            vec![
                "User-Agent",
                "Sec-Fetch-Mode",
                "Referer",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "Content-Type"
            ]
        )
        .allow_methods(vec!["POST", "GET"]);

    let routes = health_route.or(register_routes).or(ws_route).or(publish).with(cors);

    warp::serve(routes).run(([127, 0, 0, 1], 8000)).await;
}

fn with_clients(clients: Clients) -> impl Filter<Extract = (Clients,), Error = Infallible> + Clone {
    warp::any().map(move || clients.clone())
}
