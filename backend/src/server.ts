import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT || 3000);

app.listen(port, "0.0.0.0", () => {
  console.log(`CorrigeAI backend em http://localhost:${port}`);
  console.log(`API em http://localhost:${port}/api`);
});
