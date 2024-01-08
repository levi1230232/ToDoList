import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = process.env.PORT || 3000;

const pool = new pg.Pool({
  user: "todolist_itr3_user",
  host: "dpg-cme0b1n109ks739btmp0-a",
  database: "todolist_itr3",
  password: "0EvZeRz6iGueThFzb9PxOjCRyXlCVXtt",
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM items ORDER BY id ASC");
    const items = result.rows;
    client.release(); // Release the client back to the pool after use

    const dateObj = new Date();
    const month = dateObj.getUTCMonth() + 1;
    const day = dateObj.getUTCDate();
    const year = dateObj.getUTCFullYear();

    const newDate = day + "/" + month + "/" + year;
    res.render("index.ejs", {
      listTitle: newDate,
      listItems: items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    const client = await pool.connect();
    await client.query("INSERT INTO items (title) VALUES ($1)", [item]);
    client.release();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  try {
    const client = await pool.connect();
    await client.query("UPDATE items SET title = $1 WHERE id = $2", [item, id]);
    client.release();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    const client = await pool.connect();
    await client.query("DELETE FROM items WHERE id = $1", [id]);
    client.release();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
