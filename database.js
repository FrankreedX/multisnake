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
 * Called when a best of 5 has ended. Updates both players' elo ratings, wins and loss records. The changed values are returned
 * @param id1 the corresponding player id in the database
 * @param id2 the corresponding player id in the database
 * @param winner 0 if player1 won, 1 if player2 won
 * @returns {[{wins: *, loss: *, elo: *, id},{wins: *, loss: *, elo: *, id}]}
 */
function end_game(id1, id2, winner){
    //get players' ratings and stats
    let players = db.prepare(
        'select id, wins, loss, elo from player_data where id=? or id=?'
    ).all(id1, id2)

    //calculate elo stuff
    let expected_score_player_1 = 1/(1 + Math.pow(10, (players[1].elo - players[0].elo)/400))
    let score = 1 - winner
    let new_score_player_1 = players[0].elo + 32 * (score - expected_score_player_1)
    let new_score_player_2 = players[1].elo + 32 * (winner - (1 - expected_score_player_1))

    //update players' databases
    let updatePlayers = db.prepare(
        'update player_data set elo=?, wins=wins+?, loss=? where id=?'
    )
    updatePlayers.run(new_score_player_1, score, winner, id1)
    updatePlayers.run(new_score_player_2, winner, score, id2)

    return [
        {
            id: id1,
            wins: players[0].wins + score,
            loss: players[0].loss + winner,
            elo: new_score_player_1
        },
        {
            id: id2,
            wins: players[1].wins + winner,
            loss: players[1].loss + score,
            elo: new_score_player_2
        }
    ]
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
    close: close,
    end_game: end_game
}