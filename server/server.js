const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/send", (req, res) => {
    const { message } = req.body;

    console.log("Новое сообщение:", message);

    res.json({ status: "Сообщение отправлено!" });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});