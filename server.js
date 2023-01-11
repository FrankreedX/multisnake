const express = require('express')
const {google} = require('googleapis')
const fetch = require('node-fetch')
const app = express()
const http = require('http')
const https = require('https')
const fs = require('fs')
const crypto = require('crypto')
const cookies = require("cookie-parser");
const {parse, serialize} = require('cookie')
app.use(cookies())

const {Server} = require('socket.io')

const server = https.createServer({
    key: fs.readFileSync('Certificates/server.key'),
    cert: fs.readFileSync('Certificates/server.crt'),
    ca: fs.readFileSync('Certificates/CAserver.crt')
}, app);

// const server = http.createServer(app)

const io = new Server(server)

const game = require('./game.js')
const db = require('./database.js')
const url = require("url");
let broadcaster
let gameStates = new Map()
let session_list = new Map()

let oauth_creds = JSON.parse(fs.readFileSync('./client_secret_641609187849-vi9j7dbnrl1tck1j66hsm7ablcdqko60.apps.googleusercontent.com.json')).web

const oauth2Client = new google.auth.OAuth2(
    oauth_creds.client_id,
    oauth_creds.client_secret,
    "https://lvh.me:3000/authorizedoauth2"
);

const google_oauth_login_url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    prompt: 'consent',
    response_type: 'code',

    // If you only need one scope you can pass it as a string
    scope: "https://www.googleapis.com/auth/userinfo.profile"
});

app.get('/oauth2', async (req, res) => {
    res.redirect(google_oauth_login_url)
})

app.get('/authorizedoauth2', async (req, res) => {
    const qs = new url.URL(req.url, 'https://lvh.me:3000')
        .searchParams.get('code');
    const response = await (await fetch('https://oauth2.googleapis.com/token?' +
        'grant_type=authorization_code&' +
        'code=' + qs + '&' +
        'client_id=' + oauth_creds.client_id + '&' +
        'client_secret=' + oauth_creds.client_secret + '&' +
        'redirect_uri=https%3A%2F%2Flvh.me%3A3000%2Fauthorizedoauth2', {method: 'post'})).json()
    const id_token = parseJwt(response.id_token)
    if (db.get_player(id_token.sub) === undefined) {
        db.add_player({
            id: id_token.sub,
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            socket_session: '',
            name: id_token.name,
            picture: id_token.picture,
            locale: id_token.locale,
            wins: 0,
            loss: 0,
            elo: 1500,
        })
    }

    console.log("id: ", id_token.sub)

    if (!req.cookies.sessionID) {
        let session_id = generate_session_id({id: id_token.sub}, '0000')

        let d = new Date(0)
        d.setUTCMilliseconds(session_list[session_id].timeout)

        res.cookie('sessionID', session_id, {httpOnly: true, secure: true, expires: d})
    } else {
        session_list[req.cookies.sessionID].id = id_token.sub

        let d = new Date(0)
        d.setUTCMilliseconds(session_list[req.cookies.sessionID].timeout)

        res.cookie('sessionID', req.cookies.sessionID, {httpOnly: true, secure: true, expires: d})
    }

    res.redirect('/')
})

app.get('/profile', (req, res) => {
    if (Object.keys(req.cookies).indexOf('sessionID') === -1 || session_list[req.cookies.sessionID] === undefined || session_list[req.cookies.sessionID] === null) {
        res.send({
            'access_token': null,
            'refresh_token': null,
            name: 'Guest',
            picture: '/Assets/person-placeholder.jpg',
            locale: 'en',
            wins: 0,
            loss: 0,
            elo: 1500,
        })
    } else if (session_list[req.cookies.sessionID].id === '0000') {
        res.send(session_list[req.cookies.sessionID])
    } else {
        console.log("Session_list from /profile: ", session_list)
        let db_item = db.get_player(session_list[req.cookies.sessionID].id)
        delete db_item['access_token']
        delete db_item['refresh_token']
        res.send(db_item)
    }
})

app.get('/backend_game.js', (req, res) => {
    res.type('.js');
    fs.readFile('./game.js', (err, data) => {
        res.send(data)
    })
})

io.engine.on("initial_headers", (headers, request) => {
    let cookie = parse(request.headers.cookie)
    if (!cookie.sessionID || !session_list[cookie.sessionID]) {
        let session_id = generate_session_id({id: '0000'}, '0000')

        headers["set-cookie"] = serialize('sessionID', session_id, {httpOnly: true, secure: true})
    }
});


app.use(express.static('./public'))

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sendScore(gameState) {
    console.log("playerIDs: ", gameState.playerIDs)
    let db1 = db.get_player(session_list[gameState.playerIDs[0]].id)
    let db2 = db.get_player(session_list[gameState.playerIDs[1]].id)
    if (db1 === undefined) {
        db1 = {
            name: "guest",
            picture: "Assets/person-placeholder.jpg"
        }
    }
    if (db2 === undefined) {
        db2 = {
            name: "guest",
            picture: "Assets/person-placeholder.jpg"
        }
    }
    console.log("sending score: ", db1, db2)
    broadcaster.emit('game score', gameState, {name: db1.name, picture: db1.picture}, {
        name: db2.name,
        picture: db2.picture
    })
}

function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

async function startGame(gameState) {
    broadcaster.emit('snake update', gameState)
    sendScore(gameState)
    game.spawnFood(gameState)
    game.shiftFood(gameState)
    for (let i = 3; i >= 0; i--) {
        if (i === 1) {
            broadcaster.emit('snake update', gameState)
        }
        broadcaster.emit('initial countdown', i)
        await sleep(1000)
    }

    gameState.frame = 0
    gameState.gameFinished = false
    console.log("playing state: ", gameState)
    broadcaster.emit('snake update', gameState)
    broadcaster.emit('get input', gameState)
}

function handle_match_ending(gameState){
    if (gameState.snakes[0].game_score === 6 && gameState.snakes[1].game_score === 6)
        gameState.deuce = true
    if (gameState.deuce) {
        if (gameState.snakes[0].game_score - gameState.snakes[1].game_score > 1) {
            broadcaster.emit('match ended', {'winner': 1})
            gameState.matchFinished = true
            db.end_game(session_list[gameState.playerIDs[0]].id, session_list[gameState.playerIDs[1]].id, 0)
        } else if (gameState.snakes[1].game_score - gameState.snakes[0].game_score > 1) {
            broadcaster.emit('match ended', {'winner': 2})
            gameState.matchFinished = true
            db.end_game(session_list[gameState.playerIDs[0]].id, session_list[gameState.playerIDs[1]].id, 1)
        }
    } else {
        if (gameState.snakes[0].game_score > 6) {
            broadcaster.emit('match ended', {'winner': 1})
            gameState.matchFinished = true
            db.end_game(session_list[gameState.playerIDs[0]].id, session_list[gameState.playerIDs[1]].id, 0)
        } else if (gameState.snakes[1].game_score > 6) {
            broadcaster.emit('match ended', {'winner': 2})
            gameState.matchFinished = true
            db.end_game(session_list[gameState.playerIDs[0]].id, session_list[gameState.playerIDs[1]].id, 1)
        }
    }
    if (!gameState.matchFinished && gameState.nextFood.length > 0) {
        game.resetGame(gameState)
        sleep(2000).then(() => {
            startGame(gameState)
        })
    }
}

function generate_session_id(player_id, sessionID) {
    if (sessionID === '0000')
        sessionID = crypto.randomUUID()
    let obj = player_id
    obj['socket_id'] = ''
    obj['socket_room'] = ''
    obj['timeout'] = Date.now() + 2629746000 //will expire 1 month from now
    session_list[sessionID] = obj;
    return sessionID
}

io.on('connection', (socket) => {
    // if(!socket.handshake.headers.cookie && !socket.request.headers.cookie){
    //     socket.emit("reconnect")
    //     return
    // }
    const cookie = parse(socket.request.headers.cookie)
    console.log('user id ', socket.id, ' connected')
    console.log('with cookie: ', cookie)
    console.log(session_list)
    if (session_list[cookie.sessionID]) {
        session_list[cookie.sessionID].socket_session = socket.id
        console.log("adding user id")
    } else {
        console.log("telling client to refresh")
        socket.emit('refresh')
    }

    socket.on('echoTest', (message) => {
        console.log('server echo', message)
        socket.emit('echo', message)
    })

    socket.on('getSnake', () => {
        socket.emit('snakeUpdate', gameStates.get(socket.data.roomid))
    })

    socket.on('createRoom', (values) => {
        let cur_sesion = '0000'
        console.log("cookie when creating room: ", cookie.sessionID)
        if (cookie.sessionID !== null && cookie.sessionID !== undefined) {
            cur_sesion = cookie.sessionID
        }
        let gameState = {
            'boardCol': values.boardCol,
            'boardRow': values.boardRow,
            'playerSocketIDs': [socket.id],
            'playerIDs': [cur_sesion],
            'roomid': socket.id,
            'roomPlayerNum': 2,
            'frame': 0,
            'framerate': 15,
            'debug': values.debugMode,
            'food': [],
            'nextFood': [],
            'foodCounter': 0,
            'snakes': [],
            'gameFinished': false,
            'deuce': false,
            'matchFinished': false
        }
        game.resetGame(gameState)
        if (cookie.sessionID !== null && cookie.sessionID !== undefined) {
            session_list[cookie.sessionID].socket_room = socket.id
        }
        console.log("created room id: ", gameState.roomid)
        socket.data.roomid = socket.id
        broadcaster = io.to(gameState.roomid)
        gameStates.set(socket.id, gameState)
        socket.emit("room created", gameState.roomid)
    })

    socket.on('joinRoom', (roomid) => {
        console.log("Player ", socket.id, " tried joining room ", roomid)
        let gameState = gameStates.get(roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        if (gameState.playerSocketIDs.length === gameState.roomPlayerNum) {
            socket.emit('room occupied')
            return
        }
        socket.join(gameState.roomid)
        socket.data.roomid = gameState.roomid
        if (cookie.sessionID !== null && cookie.sessionID !== undefined) {
            session_list[cookie.sessionID].socket_room = roomid
            gameState.playerIDs.push(cookie.sessionID)
        } else {
            gameState.playerIDs.push('0000')
        }
        gameState.playerSocketIDs.push(socket.id)
        broadcaster.emit(`player ${gameState.playerSocketIDs.length} joined the room`)
        startGame(gameState)
    })

    socket.on('send input', (direction) => {
        let time = new Date()
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        if (gameState.gameFinished) {
            sendScore(gameState)
            handle_match_ending(gameState)
            return
        }
        console.log("received data ", direction.dir, "from id ", socket.id, " on frame ", direction.frame)
        let snakeIndex = gameState.playerSocketIDs.indexOf(socket.id)
        if (snakeIndex === -1) {
            socket.emit('not in room')
            return
        }
        gameState.snakes[snakeIndex].direction = direction.dir
        gameState.snakes[snakeIndex].received_input = true
        for (let i = 0; i < gameState.snakes.length; i++) {
            if (!gameState.snakes[i].received_input)
                return
        }
        console.log("all inputs received")

        for (let i = 0; i < gameState.snakes.length; i++) {
            gameState.snakes[i].received_input = false
        }
        let gameEndObj = game.play(gameState)
        if(gameEndObj !== undefined){
            broadcaster.emit('game ended', gameEndObj)
        }
        broadcaster.emit('snake update', gameState)
        gameState.frame++
        time = new Date() - time
        console.log("time: ", time)
        if (!gameState.debug) {
            gameState.framerate = 10 + gameState.foodCounter
        }
        console.log("pausing for ", 1000 / gameState.framerate - time)
        sleep(1000 / gameState.framerate - time).then(() => {
            broadcaster.emit('get input', gameState)
        })
    })

    socket.on('updateFramerate', (framerate) => {
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        if (gameState.debug)
            gameState.framerate = framerate
    })

    socket.on('rematch', () => {
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        console.log("rematch requested from room id ", socket.data.roomid)

        game.resetGame(gameState)
        startGame(gameState)
    })

    socket.on('disconnect', () => {
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState !== undefined) {
            if (cookie.sessionID !== null && cookie.sessionID !== undefined) {
                session_list[cookie.sessionID].socket_room = ''
                session_list[cookie.sessionID].socket_id = ''
                if (session_list[cookie.sessionID].id === '0000') {
                    session_list.delete(cookie.sessionID)
                }
            }
            console.log('user disconnected from room ', socket.data.roomid)
            broadcaster.emit('player left room')
            gameState.gameFinished = true
            gameStates.delete(socket.data.roomid)
        }
    })
})

let port = process.env.PORT || 3001
server.listen(port, () => {
    console.log('listening on *:', port)
})

exports.server = server

process.on('SIGINT', () => {
    db.close();
    server.close();
});