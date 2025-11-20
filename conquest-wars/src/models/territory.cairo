#[derive(Model, Copy, Drop, Serde)]
struct Territory {
    #[key]
    game_id: u32,
    #[key]
    territory_id: u8,
    owner: u8,
    armies: u8,
    name: felt252,
    x: u16,
    y: u16,
}
