const express = require('express')
const app = express()
const port = process.env.PORT || 2020
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const jwt = require('jsonwebtoken');


// middleware boss
app.use(cors())
app.use(express.json())
// pratic //HRiaLaGC3ReB5qxM
const uri = "mongodb+srv://pratic:HRiaLaGC3ReB5qxM@cluster0.cfrtdkt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true, } });
// varify token stats
const varifytoken = (req, res, next) => {
  const headerdata = req.headers.authorization
  if (!headerdata) {
    return res.status(401).send({ Message: 'unset user token' })
  }
  const token = headerdata.split(' ')[1]
  jwt.verify(token, '11223344', function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'sry Not your decoded access' })
    }
    req.decoded = decoded
    next()
  });
}
// varify token ends
async function run() {
  try {
    const database = client.db("Appointment").collection("Data");
    const dbuser= client.db("Appointment").collection("User");
    // user get data
    app.get('/user',async(req,res)=>{
      const result=await dbuser.find({}).toArray()
      res.send(result)
    })
    // user data post
    app.post('/user',async(req,res)=>{
      const user=req.body
      const query={email:user?.email}
      const existinguser=await dbuser.findOne(query)
      if(existinguser){
        return res.send({message:'//user alreay exiss'})
      }else{
        const result=await dbuser.insertOne(user
          )
         res.send(result)
      }
      
      

    })
    // jwt login
    app.post('/login', async (req, res) => {
      const user = req.body
      const accesstoken = jwt.sign(user, '11223344', { expiresIn: '1d' })
      res.send({ accesstoken })
    })
    // Appointments get 
    app.get('/appointmentget', varifytoken, async (req, res) => {
      const email1=req.query.email
      const decodedemail=req.decoded.email
      const currentpage=parseFloat(req.query.page) || 0
      const skip=(currentpage-1)*10
      // sort your date
      const options = {
        sort: { date: 1 },
      };
      if(email1 === decodedemail){
        const result = await database.find({otheremail:email1},options).skip(skip).limit(10).toArray()
         res.send(result)
      }else{
        res.status(403).send({message:'sry Not your decoded access'})
      }
      
      
    })
    // appointment total counts
    app.get('/appointmentotalcount', varifytoken, async (req, res) => {
      const email1=req.query.email
      const decodedemail=req.decoded.email
      if(email1 === decodedemail){
        const result = await database.estimatedDocumentCount()
         res.send({result})
      }else{
        res.status(403).send({message:'sry Not your decoded access'})
      }
      
      
    })
    // Appointments post
    app.post('/appointmentsent', async (req, res) => {
      const body = req.body
      const result = await database.insertOne(body)
      if (result.insertedId !== undefined) {
        res.send({
          success: true,
          message: 'Your Appointent sent successfull'
        })
      } else {
        res.send({
          success: false,
          message: 'Your Appointent sent Not successfull'
        })
      }
    })


    app.get('/', async (req, res) => {
      res.send('Server is ranning Doc house Project')
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
