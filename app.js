/** @format */

import express from "express";
import bodyParser from "body-Parser";
import mongoose from "mongoose";
import _ from "lodash";
import { getDate, getDay } from "./date.js";
import { Item, defaultItems, List } from "./model/items.js";

const app = express();


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB");

app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB");
        }
      });
      res.redirect("/");
    } else {
      let day = getDate();
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  let day = getDate();
  if (listName == day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  let day = getDate();
  if (listName == day) {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        console.log("Successfully deleted checked item. ");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
  }
});

app.get("/:variety", (req, res) => {
   const variety = _.capitalize(req.params.variety);

  List.findOne({ name: variety }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: variety,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + variety);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.post("/work", (req, res) => {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, (req, res) => {
  console.log("server started on port 3000");
});
