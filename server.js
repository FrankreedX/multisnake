const express = require('express')
const {google} = require('googleapis')
const fetch = require('node-fetch')
const app = express()
const https = require('https')
const http = require('http')
const fs = require('fs')

const {Server} = require('socket.io')

// const server = https.createServer({
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('cert.pem')
// }, app);

const server = http.createServer(app)
//
// const io = new Server(server)
//
// const game = require('./game.js')
// const url = require("url");
// let broadcaster
// let gameStates = new Map()
//
// let oauth_creds = JSON.parse(fs.readFileSync("./client_secret_641609187849-vi9j7dbnrl1tck1j66hsm7ablcdqko60.apps.googleusercontent.com-2.json")).web
// // let oauth_creds = JSON.parse(fs.readFileSync("./client_secret_641609187849-7lo1jrmsjrl1vupkodhoukjt46m8jsvd.apps.googleusercontent.com.json")).installed
// console.log(oauth_creds)
//
// const oauth2Client = new google.auth.OAuth2(
//     oauth_creds.client_id,
//     oauth_creds.client_secret,
//     "http://lvh.me:3000/authorizedoauth2"
// );
//
// const google_oauth_login_url = oauth2Client.generateAuthUrl({
//     // 'online' (default) or 'offline' (gets refresh_token)
//     access_type: 'offline',
//
//     // If you only need one scope you can pass it as a string
//     scope: "https://www.googleapis.com/auth/userinfo.profile"
// });
// console.log(google_oauth_login_url)
//
// app.get('/oauth2', async (req, res) => {
//     res.redirect(google_oauth_login_url)
// })
//
// app.get('/authorizedoauth2', async (req, res) => {
//     res.redirect('/')
//     const qs = new url.URL(req.url, 'http://lvh.me:3000')
//         .searchParams.get('code');
//     const response = await fetch('https://accounts.google.com/o/oauth2/v2/auth?' +
//         ' response_type=code&' +
//         ' client_id=' + oauth_creds.client_id + '&' +
//         ' scope=openid%20email&' +
//         ' redirect_uri=http%3A//lvh.me:3000/authorizedoauth2&')
//     const json = response.json()
//     console.log(json)
//     // google.auth2.init();
//     // console.log(google.auth2.isSignedIn.get())
//     // try {
//     //     oauth2Client.getToken(qs).then(token => {
//     //             console.log(token)
//     //         }
//     //     )
//     // } catch(error) {
//     //     console.log(error)
//     // }
// })
// app.get('/', (req, res) => { res.send('this is an secure server') });
app.use(express.static('./public'))

// function resetGame(gameState) {
//     gameState.gameFinished = true
//     gameState.food = []
//     gameState.nextFood = []
//     gameState.foodCounter = 0
//     let game_score = []
//     for (let n = 0; n < 2; n++) {
//         game_score.push(0)
//         if (!gameState.matchFinished && gameState.snakes[n] !== undefined)
//             game_score[n] = gameState.snakes[n].game_score
//     }
//     gameState.snakes = []
//     for (let n = 0; n < 2; n++) {
//         let currentSnake = {
//             'body_coords': [],
//             'direction': n * 2 + 1,
//             'skin_head': ['Assets/head_snake_red.png', 'Assets/head_snake_blue.png'],
//             'skin_body_straight': ['Assets/body_red.png', 'Assets/body_blue.png'],
//             'skin_body_angle': ['Assets/90_degree_turn_red.png', 'Assets/90_degree_turn_blue.png'],
//             'skin_tail': ['Assets/tail_red.png', 'Assets/tail_blue.png'],
//             'received_input': true,
//             'advantage_point': 0,
//             'game_score': game_score[n]
//         }
//         gameState.snakes.push(currentSnake)
//     }
//     for (let i = 0; i < 15; i++) {
//         gameState.snakes[0].body_coords.unshift([Math.floor(gameState.boardRow / 2 - 5), i])
//         gameState.snakes[1].body_coords.unshift([Math.floor(gameState.boardRow / 2 + 5), gameState.boardCol - i - 1])
//     }
//     if (gameState.matchFinished) {
//         gameState.deuce = false
//         gameState.matchFinished = false
//     }
// }
//
// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
//
// async function startGame(gameState) {
//     broadcaster.emit('snake update', gameState)
//     broadcaster.emit('game score', gameState)
//     game.spawnFood(gameState)
//     game.shiftFood(gameState)
//     for (let i = 3; i >= 0; i--) {
//         if (i === 1) {
//             broadcaster.emit('snake update', gameState)
//         }
//         broadcaster.emit('initial countdown', i)
//         await sleep(1000)
//     }
//
//     gameState.frame = 0
//     gameState.gameFinished = false
//     console.log("playing state: ", gameState)
//     broadcaster.emit('snake update', gameState)
//     broadcaster.emit('get input', gameState)
// }
//
// io.on('connection', (socket) => {
//     console.log('user id ', socket.id, ' connected')
//
//     socket.on('echoTest', (message) => {
//         console.log('server echo', message)
//         socket.emit('echo', message)
//     })
//
//     socket.on('getSnake', () => {
//         socket.emit('snakeUpdate', gameStates.get(socket.data.roomid))
//     })
//
//     socket.on('createRoom', (values) => {
//         let gameState = {
//             'boardCol': values.boardCol,
//             'boardRow': values.boardRow,
//             'playerIDs': [socket.id],
//             'roomid': socket.id,
//             'roomPlayerNum': 2,
//             'frame': 0,
//             'framerate': 15,
//             'debug': values.debugMode,
//             'food': [],
//             'nextFood': [],
//             'foodCounter': 0,
//             'snakes': [],
//             'gameFinished': false,
//             'deuce': false,
//             'matchFinished': false
//         }
//         resetGame(gameState)
//         console.log("created room id: ", gameState.roomid)
//         socket.data.roomid = socket.id
//         broadcaster = io.to(gameState.roomid)
//         gameStates.set(socket.id, gameState)
//         socket.emit("room created", gameState.roomid)
//     })
//
//     socket.on('joinRoom', (roomid) => {
//         console.log("Player ", socket.id, " tried joining room ", roomid)
//         let gameState = gameStates.get(roomid)
//         if (gameState === undefined) {
//             socket.emit('room not found')
//             return
//         }
//         if (gameState.playerIDs.length === gameState.roomPlayerNum) {
//             socket.emit('room occupied')
//             return
//         }
//         socket.join(gameState.roomid)
//         socket.data.roomid = gameState.roomid
//         gameState.playerIDs.push(socket.id)
//         broadcaster.emit(`player ${gameState.playerIDs.length} joined the room`)
//         startGame(gameState)
//     })
//
//     socket.on('send input', (direction) => {
//         let time = new Date()
//         let gameState = gameStates.get(socket.data.roomid)
//         if (gameState === undefined) {
//             socket.emit('room not found')
//             return
//         }
//         if (gameState.gameFinished) {
//             broadcaster.emit('game score', gameState)
//             if (gameState.snakes[0].game_score === 6 && gameState.snakes[1].game_score === 6)
//                 gameState.deuce = true
//             if (gameState.deuce) {
//                 if (gameState.snakes[0].game_score - gameState.snakes[1].game_score > 1) {
//                     broadcaster.emit('match ended', {'winner': 1})
//                     gameState.matchFinished = true
//                 } else if (gameState.snakes[1].game_score - gameState.snakes[0].game_score > 1) {
//                     broadcaster.emit('match ended', {'winner': 2})
//                     gameState.matchFinished = true
//                 }
//             } else {
//                 if (gameState.snakes[0].game_score > 6) {
//                     broadcaster.emit('match ended', {'winner': 1})
//                     gameState.matchFinished = true
//                 } else if (gameState.snakes[1].game_score > 6) {
//                     broadcaster.emit('match ended', {'winner': 2})
//                     gameState.matchFinished = true
//                 }
//             }
//             if (!gameState.matchFinished && gameState.nextFood.length > 0) {
//                 resetGame(gameState)
//                 sleep(2000).then(() => {
//                         startGame(gameState)
//                     }
//                 )
//             }
//             return
//         }
//         console.log("received data ", direction.dir, "from id ", socket.id, " on frame ", direction.frame)
//         let snakeIndex = gameState.playerIDs.indexOf(socket.id)
//         if (snakeIndex === -1) {
//             socket.emit('not in room')
//             return
//         }
//         gameState.snakes[snakeIndex].direction = direction.dir
//         gameState.snakes[snakeIndex].received_input = true
//         for (let i = 0; i < gameState.snakes.length; i++) {
//             if (!gameState.snakes[i].received_input)
//                 return
//         }
//         console.log("all inputs received")
//
//         for (let i = 0; i < gameState.snakes.length; i++) {
//             gameState.snakes[i].received_input = false
//         }
//
//         game.play(broadcaster, gameState)
//         broadcaster.emit('snake update', gameState)
//         gameState.frame++
//         time = new Date() - time
//         console.log("time: ", time)
//         if (!gameState.debug) {
//             gameState.framerate = 10 + gameState.foodCounter
//         }
//         console.log("pausing for ", 1000 / gameState.framerate - time)
//         sleep(1000 / gameState.framerate - time).then(() => {
//             broadcaster.emit('get input', gameState)
//         })
//     })
//
//     socket.on('updateFramerate', (framerate) => {
//         let gameState = gameStates.get(socket.data.roomid)
//         if (gameState === undefined) {
//             socket.emit('room not found')
//             return
//         }
//         if (gameState.debug)
//             gameState.framerate = framerate
//     })
//
//     socket.on('rematch', () => {
//         let gameState = gameStates.get(socket.data.roomid)
//         if (gameState === undefined) {
//             socket.emit('room not found')
//             return
//         }
//         console.log("rematch requested from room id ", socket.data.roomid)
//
//         resetGame(gameState)
//         startGame(gameState)
//     })
//     socket.on('disconnect', () => {
//         let gameState = gameStates.get(socket.data.roomid)
//         if (gameState !== undefined) {
//             console.log('user disconnected from room ', socket.data.roomid)
//             broadcaster.emit('player left room')
//             gameState.gameFinished = true
//             gameStates.delete(socket.data.roomid)
//         }
//     })
// })

let port = process.env.PORT || 3000
server.listen(port, () => {
    console.log('listening on *:', port)
})

exports.server = server
