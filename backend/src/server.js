const app = require('/app');

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Serverul rulează pe portul ${port}`);
}); 