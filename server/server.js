import express from 'express'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
import mongoose from 'mongoose'
const { Schema } = mongoose;

mongoose.connect("mongodb+srv://egeyapici:lnhqPnXcw5L0eBUB@cluster1.v95cm8k.mongodb.net/chatgpt?retryWrites=true&w=majority",(err) => {
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

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });

    console.log({
      bot: response.data.choices[0].text
    })

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
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

app.listen(5000, () => console.log('AI server started on http://localhost:5000'))