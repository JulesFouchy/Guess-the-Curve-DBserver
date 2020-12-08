const express = require('express')
const app = express()
const serv = require('http').Server(app)
if (process.env.DEBUG)
    require('dotenv/config')

// Allow CORS
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	next()
})

// DB

const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID
const client = new MongoClient(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true }).connect()

const dbRequest = async (req) => {
    try {
        await client.then( async (client) => {
            const db = client.db('Guess-the-Curve')
            await req(db)
        })
    }
    catch(err) {
        console.log('-----Error while connecting to database-----')
        console.log(err)
        console.log('-------------------------')
    }
}

app.get('/', (req, res) => {
    dbRequest( db => {
        db.collection('functionsToGuess').find({}).toArray( (err, result) => {
            if (err) {
                console.log('ERR')
                res.json(err)
            }
            else {
                res.json(result)
            }
        })
    })
})

//
//
//

const PORT = process.env.PORT || 2000
serv.listen(PORT, () => console.log(`Server started on port ${PORT}`))