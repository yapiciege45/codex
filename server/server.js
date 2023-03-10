import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import { Configuration, OpenAIApi } from 'openai'
import mongoose from 'mongoose'
const { Schema } = mongoose;

dotenv.config()

mongoose.connect(process.env.MONGODB_URL,(err) => {
  if(err) {
    console.log(err)
  }else {
    console.log("Succesfully connected")
  }
})

const questionSchema = new Schema({
  title:  String, // String is shorthand for {type: String}
  questions: [{q: String, a: String}]
});

const Question = mongoose.model('Question', questionSchema);

const configuration = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  })
})

app.post('/create', async (req, res) => {
  try {
    const title = req.body.title;

    await Question.create({title})
    res.status(200).send({msg: "Succesfully created"})
  }catch(error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.get('/sidebar', async (req, res) => {
  res.send({questions: await Question.find({})})
})

app.get('/question/:id', async (req, res) => {
  try {
    const id = req.params.id
    const question = await Question.findOne({_id: id})
    res.send({questions: question.questions})
  }catch(error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
  
})

app.delete('/question', async (req, res) => {
  try {
    await Question.deleteOne({_id: req.body.id})
    res.send({msg: "Silme başarılı"})
  }catch(error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
  
})

app.post('/api/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `${prompt}`,
        max_tokens: 3000,
        temperature: 0
      })
    }).then(res => res.json()).then(data => {
      console.log(data)
      res.status(200).send({
        bot: data.choices[0].text
      });
    })
  } catch (error) {
    res.status(500).send(error);
  }
})

app.put('/question', async (req, res) => {
  try {
    const id = req.body.id
    const question = await Question.findOne({_id: id})
    question.questions.push(req.body.question)
    await question.save()
    res.send({question})
  }catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
  
})

app.listen(5000, () => console.log('AI server started on https://codex-vinn.onrender.com'))