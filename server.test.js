const http = require('http')
const {Server} = require("socket.io");
const io = require("socket.io-client");
const express = require('express')

const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
describe("multsnake", () => {
    let serverSocket, client1, client2, port;
    let server,
        options = {
            transports: ['websocket'],
            'force new connection': true
        };

    beforeAll((done) => {
        server = require('./server.js').server;
        done()
    })
    beforeEach((done) => {
        client1 = io('http://localhost:3000')

        client2 = io('http://localhost:3000')

        client1.once('connect', () => {
            client2.once('connect', () => {
                done()
            })
        })
    })
    afterEach((done) => {
        client1.disconnect()
        client2.disconnect()
        done()
    })

    test("test echo function", (done) => {
        let message = client1.id
        client1.once('echo', (recvmessage) => {
            expect(recvmessage).toEqual(message)
            done()
        })
        client1.emit('echoTest', message)
    })

    test("test creating a fresh room", (done) => {
        let testGameState = {
            'boardCol': Math.floor(Math.random() * 1000),
            'boardRow': Math.floor(Math.random() * 1000),
            'player1id': client1.id,
            'roomid': client1.id,
            'frame': 0,
            'framerate': 15,
            'debug': false,
            'food': [],
            'foodCounter': 0,
            'snake1': [],
            'snake1Direction': 3,
            'snake2': [],
            'snake2Direction': 1,
            'gameFinished': false,
            'receivedInput1': true,
            'receivedInput2': true
        }
        for(let i = 0; i < 15; i++){
            testGameState.snake1.unshift([Math.floor(testGameState.boardRow / 2 - 5), i])
            testGameState.snake2.unshift([Math.floor(testGameState.boardRow / 2 + 5), testGameState.boardCol - i - 1])
        }
        client1.once('room created', (roomid) => {
            expect(roomid).toEqual(client1.id)
            client1.emit('getSnake')
        })
        client1.once('snakeUpdate', (gameState) => {
            expect(gameState).toEqual(testGameState)
            done()
        })
        client1.emit('createRoom', ({boardCol: testGameState.boardCol, boardRow: testGameState.boardRow, debugMode: testGameState.debug}))
    })

    test("try to join room that doesn't exist", (done) => {
        client2.once('room not found', () => {
            done()
        })
        client2.once('player 2 joined the room', () => {
            throw new Error('should not have joined room')
        })
        client2.once('room occupied', () => {
            throw new Error('should not have joined room')
        })
        client2.emit('joinRoom', client1.id)
    })

    test("try to join room that is already occupied", (done) => {
        let client3 = io('http://localhost:3000')
        client1.once('room created', (roomid) => {
            client2.emit('joinRoom', roomid)
        })

        client2.once('player 2 joined the room', () => {
            client3.once('connect', () => {
                sleep(50).then(() => {client3.emit('joinRoom', client1.id)})
            })
        })

        client3.once('room occupied', () => {
            client3.disconnect()
            done()
        })
        client3.once('room not found', () => {
            client3.disconnect()
            throw new Error('should have found room')
        })
        client3.once('player 2 joined the room', () => {
            client3.disconnect()
            throw new Error('should not have joined room')
        })
        client1.emit('createRoom', ({boardCol: 10, boardRow: 10, debugMode: false}))

    })
});