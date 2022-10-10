const express = require("express")

const PORT = process.env.PORT || 3001

const app = express()

app.get("/game", (req, res) => {
    res.json({ message: "Server is here :)" })
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})