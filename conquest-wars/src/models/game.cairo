use starknet::ContractAddress;

#[derive(Model, Copy, Drop, Serde)]
struct Game {
    #[key]
    game_id: u32,
    current_player: u8,
    phase: u8,
    turn_number: u32,
    winner: u8,
    is_finished: bool,
    player_count: u8,
}
