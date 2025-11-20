use starknet::ContractAddress;

#[derive(Model, Copy, Drop, Serde)]
struct Player {
    #[key]
    game_id: u32,
    #[key]
    player_id: u8,
    address: ContractAddress,
    color: u32,
    territories_owned: u8,
    reinforcements: u8,
    is_active: bool,
}
