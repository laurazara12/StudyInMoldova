const app = require('./src/App');
require('dotenv').config();

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Serverul rulează pe portul ${port}`);
});