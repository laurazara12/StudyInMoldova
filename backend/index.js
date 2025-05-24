const app = require('./src/app');
require('dotenv').config();

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Serverul rulează pe portul ${port}`);
});