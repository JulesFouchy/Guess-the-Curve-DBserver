const express = require('express')
const app = express()
const serv = require('http').Server(app)
if (process.env.DEBUG)
    require('dotenv/config')

// Allow CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Methods", "PUT")
    next()
  });

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

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

const addFunction = async (db, value, explanation) => {
    // Add Function
    await db.collection('functionsToGuess')
        .insertOne({
            value,
            explanation,
        })
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

const onPutFunction = async function(req, res) {
    const client = new MongoClient(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  
    try {
        await client.connect();
        console.log("Connected correctly to server")
    
        const db = client.db('Guess-the-Curve')
    
        await addFunction(db, req.body.value, req.body.explanation)
        res.send('success')
    }
    catch (err) {
        console.log('--------------------')
        console.log('Something went wrong')
        console.log('--------------------')
        console.log(err)
        res.send('error')
    }
    finally {
        client.close()
    }
}

app.put('/', (req, res) => {
    onPutFunction(req, res)
})

//
//
//

const PORT = process.env.PORT || 2000
serv.listen(PORT, () => console.log(`Server started on port ${PORT}`))