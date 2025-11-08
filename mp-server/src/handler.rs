use futures::{ Future, StreamExt, FutureExt };
use serde::Serialize;
use serde_json::from_str;
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use uuid::Uuid;
use warp::filters::ws::{ Message, WebSocket };
use warp::reject::Rejection;
use warp::reply::{ Reply, json };
use warp::http::StatusCode;

use crate::{
    RegisterRequest,
    Clients,
    RegisterResponse,
    Event,
    Client,
    TopicsRequest,
    GameResponse,
    GamePacket,
    FireEvent,
};

type Result<T> = std::result::Result<T, Rejection>;

pub async fn register_handler(body: RegisterRequest, clients: Clients) -> Result<impl Reply> {
    let user_id = body.user_id;
    let uuid = Uuid::new_v4().simple().to_string();
    println!("User: {}", user_id);

    register_client(uuid.clone(), user_id, clients).await;
    Ok(
        json(
            &(RegisterResponse {
                url: format!("ws://127.0.0.1:8000/ws/{}", uuid),
            })
        )
    )
}

pub async fn register_client(id: String, user_id: String, clients: Clients) {
    clients
        .lock()
        .unwrap()
        .insert(id, Client {
            user_id,
            topics: vec![String::from("cats")],
            sender: None,
            in_game: false,
            searching_for_game: true,
        });
}

pub async fn unregister_handler(id: String, clients: Clients) -> Result<impl Reply> {
    clients.lock().unwrap().remove(&id);
    Ok(StatusCode::OK)
}

pub fn health_handler() -> impl Future<Output = Result<impl Reply>> {
    futures::future::ready(Ok(StatusCode::OK))
}

pub async fn ws_handler(ws: warp::ws::Ws, id: String, clients: Clients) -> Result<impl Reply> {
    let client = clients.lock().unwrap().get(&id).cloned();
    match client {
        Some(c) => Ok(ws.on_upgrade(move |socket| client_connection(socket, id, clients, c))),
        None => Err(warp::reject::not_found()),
    }
}

pub async fn client_connection(ws: WebSocket, id: String, clients: Clients, mut client: Client) {
    let (client_ws_sender, mut client_ws_rcv) = ws.split();
    let (client_sender, client_rcv) = mpsc::unbounded_channel();

    let client_rcv = UnboundedReceiverStream::new(client_rcv);
    tokio::task::spawn(
        client_rcv.forward(client_ws_sender).map(|result| {
            if let Err(e) = result {
                eprintln!("error sending websocket msg: {}", e);
            }
        })
    );

    println!(" Made it to here");

    client.sender = Some(client_sender);
    let mut client_ref = &mut client;
    match
        clients
            .lock()
            .unwrap()
            .iter_mut()
            .find(|c| c.1.searching_for_game == true && c.1.user_id != client_ref.user_id)
    {
        Some(v) => {
            let my_id = &client_ref.user_id;
            let opponent_id = &v.1.user_id;

            // Send Opponent Id to Registering User
            match &client_ref.sender {
                Some(v) => {
                    let response = GameResponse {
                        opponent_id: opponent_id.to_string(),
                        found: true,
                    };
                    let _ = v.send(Ok(Message::text(serde_json::to_string(&response).unwrap())));
                    client_ref.searching_for_game = false;
                    client_ref.in_game = true;
                }
                None => {
                    println!("Could Not Send OpponentId to Searching User");
                }
            }

            // Send Registering User Id to Opponent
            match &v.1.sender {
                Some(c) => {
                    let response = GameResponse { opponent_id: my_id.to_string(), found: true };
                    let _ = c.send(Ok(Message::text(serde_json::to_string(&response).unwrap())));
                    v.1.searching_for_game = false;
                    v.1.in_game = true;
                }
                None => {
                    println!("Could Not Send Registering UserId to Opponent");
                }
            }

            println!("Found and Sent {} {}", my_id, opponent_id);
        }
        None => {
            println!("NONE FOUND");
            match &client_ref.sender {
                Some(v) => {
                    let _ = v.send(Ok(Message::text("No Opponents")));
                    println!("Sent");
                }
                None => {
                    println!("Not Sent");
                }
            }
        }
    }

    clients.lock().unwrap().insert(id.clone(), client);

    println!("{} connected", id);

    while let Some(result) = client_ws_rcv.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("error receiving ws message for id: {}): {}", id.clone(), e);
                break;
            }
        };
        client_msg(&id, msg, &clients).await;
    }

    clients.lock().unwrap().remove(&id);
    println!("{} disconnected", id);
}
async fn client_msg(id: &str, msg: Message, clients: &Clients) {
    println!("received message from {}: {:?}", id, msg);
    let message = match msg.to_str() {
        Ok(v) => v,
        Err(_) => {
            return;
        }
    };

    handle_game_packet(&message, &clients);

    handle_fire_event(&message, &clients);

    if message == "ping" || message == "ping\n" {
        return;
    }

    let topics_req: TopicsRequest = match from_str(&message) {
        Ok(v) => v,
        Err(e) => {
            eprintln!("could not parse into instance of Topic Request {}", e);
            return;
        }
    };

    let mut locked = clients.lock().unwrap();
    match locked.get_mut(id) {
        Some(v) => {
            v.topics = topics_req.topics;
        }
        None => {
            return;
        }
    };
}

pub fn handle_fire_event(message: &str, clients: &Clients) {
    let fire_event: FireEvent = match from_str(&message) {
        Ok(v) => v,
        Err(e) => {
            println!("Not a Fire Event");
            return;
        }
    };

    if !fire_event.bullet_type.is_empty() {
        let _ = send_fire_event(fire_event, &clients);
    }
}

pub fn handle_game_packet(message: &str, clients: &Clients) {
    let game_packet: GamePacket = match from_str(&message) {
        Ok(v) => v,
        Err(e) => {
            println!("Not a Packet");
            return;
        }
    };

    if !game_packet.opponent_id.is_empty() {
        let _ = send_packet_event(game_packet, &clients);
    }
}

pub fn send_packet_event(packet: GamePacket, clients: &Clients) {
    match
        clients
            .lock()
            .unwrap()
            .iter_mut()
            .find(|client| client.1.user_id == packet.opponent_id)
    {
        Some(c) => {
            if let Some(sender) = &c.1.sender {
                println!("SENDING VIA WS");
                let _ = sender.send(Ok(Message::text(serde_json::to_string(&packet).unwrap())));
            }
        }
        None => {}
    }
}

pub fn send_fire_event(packet: FireEvent, clients: &Clients) {
    println!("SENDING FIRE EVENT");
    match
        clients
            .lock()
            .unwrap()
            .iter_mut()
            .find(|client| client.1.user_id == packet.opponent_id)
    {
        Some(c) => {
            if let Some(sender) = &c.1.sender {
                println!("SENDING VIA WS");
                let _ = sender.send(Ok(Message::text(serde_json::to_string(&packet).unwrap())));
            }
        }
        None => {}
    }
}

pub async fn publish_handler(body: Event, clients: Clients) -> Result<impl Reply> {
    clients
        .lock()
        .unwrap()
        .iter_mut()
        .filter(|(_, client)| {
            match &body.user_id {
                Some(v) => client.user_id.eq(v),
                None => true,
            }
        })
        .filter(|(_, client)| client.topics.contains(&body.topic))
        .for_each(|(_, client)| {
            if let Some(sender) = &client.sender {
                let _ = sender.send(Ok(Message::text(body.message.clone())));
            }
        });

    Ok(StatusCode::OK)
}
