const Sqlite = require('better-sqlite3')
const fs = require('fs')

const db = new Sqlite('./player_data.db')

try{
    db.exec(fs.readFileSync('./initialization.sql').toString())
} catch (e) {
    console.log(e)
}


function get_player(id){
    return db.prepare(
        'select * from player_data where id=?'
    ).get(id)
}

/**
 * Add a player to the database with an object representing the player. player_data must at least contain that player's id, name, and picture path.
 * @param player_data
 * @type {player_data: Object}
 */
function add_player(player_data){
    const insert_player_statement = db.prepare(
        'insert into player_data(id, access_token, refresh_token, name, picture, locale, wins, loss, elo) values (@id, @access_token, @refresh_token, @name, @picture, @locale, @wins, @loss, @elo)'
    )

    insert_player_statement.run(player_data)
}

/**
 * Send a friend request from player1 to player2. The ID of both players must be provided.
 * @param player1
 * @param player2
 * @type {player1: string, player2: string}
 */
function send_friend_request(player1, player2){
    const send_friend_request_statement = db.prepare(
        'insert into player_friendship(requesterID, addresseeID, status) values (?, ?, 1)'
    )

    send_friend_request_statement.run(player1, player2)
}

function close(){
    db.close()
}

module.exports = {
    add_player:add_player,
    send_friend_request: send_friend_request,
    get_player: get_player,
    close: close
}