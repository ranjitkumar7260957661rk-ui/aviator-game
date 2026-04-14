const express = require("express");
const bodyParser = require("body-parser");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ users: [], deposits: [], withdraws: [] }).write();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// LOGIN
app.post("/login", (req, res) => {
  const { mobile, password } = req.body;

  let user = db.get("users").find({ mobile }).value();

  if (!user) {
    user = { mobile, password, balance: 0 };
    db.get("users").push(user).write();
  }

  res.json(user);
});

// DEPOSIT
app.post("/deposit", (req, res) => {
  const { mobile, amount, utr } = req.body;

  if (amount > 500) return res.send("Max 500");

  db.get("deposits")
    .push({ mobile, amount, utr, status: "pending" })
    .write();

  res.send("ok");
});

// WITHDRAW
app.post("/withdraw", (req, res) => {
  const { mobile, amount, name, acc, ifsc } = req.body;

  if (amount > 1000) return res.send("Max 1000");

  db.get("withdraws")
    .push({ mobile, amount, name, acc, ifsc, status: "pending" })
    .write();

  res.send("ok");
});

// ADMIN
app.get("/admin", (req, res) => {
  res.json({
    deposits: db.get("deposits").value(),
    withdraws: db.get("withdraws").value(),
    users: db.get("users").value()
  });
});

app.listen(3000, () => console.log("🚀 Server running"));
// USER DATA
app.get('/user-data', (req, res) => {
  let mobile = req.query.mobile;

  let user = db.data.users.find(u => u.mobile === mobile);

  res.json({
    balance: user?.balance || 0,
    deposits: db.data.deposits || [],
    withdraws: db.data.withdraws || []
  });
});

// UPDATE BALANCE (GAME)
app.post('/update-balance', async (req, res) => {
  let { mobile, amount } = req.body;

  let user = db.data.users.find(u => u.mobile === mobile);

  if(user){
    user.balance += amount;
    await db.write();
  }

  res.send("ok");
});
