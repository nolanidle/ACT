import { Ollama } from "ollama";
import dotenv from "dotenv";

dotenv.config();

const ollama = new Ollama({
  host: "https://ollama.com",
  headers: { Authorization: "Bearer " + process.env.OLLAMA_API_KEY },
});

export default ollama;
