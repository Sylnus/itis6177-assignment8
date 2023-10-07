function browserResponse(name, keyword) {
    return `${name} says ${keyword}.`;
  }
  app.get('/say', (req, res) => {
    const myName = 'Nihar Shukla';
    const keyword = req.query.keyword;
    const result = browserResponse(myName, keyword);
    res.status(200).send(result);
  });