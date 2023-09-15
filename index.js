const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { constrainedMemory } = require('process');
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
const _ = require ("lodash");

mongoose.connect("mongodb+srv://gorkemgok94:grkem123@learnmongodbcluster.eo5xx5b.mongodb.net/todoListDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your To-Do List!"
});

const item2 = new Item({
    name: "You can add new items."
});

const item3 = new Item({
    name: "You can keep track of your tasks!"
});

const defaultItems = [item1, item2, item3];


/**/

const listSchema = {
    name: String,
    items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get('/', (req, res) => {
    const listTitle = "Today";
    Item.find({})
        .then(foundItems => {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems)
                    .then(() => {
                        console.log("Successfully saved default items to DB.");
                    })
                    .catch(err => {
                        console.log(err);
                    });
                    res.redirect("/");
            } else {
                res.render('index', { tasks: foundItems, listTitle: "Today" });

            }
        })
        .catch(err => {
            console.log(err);
        });

});

// Other routes for adding, deleting, and updating tasks can be added here

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name: customListName})
        .then(foundList => {
            if (!foundList) {
                const list = new List ({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName)
            } else {
                res.render('index', { tasks: foundList.items, listTitle: foundList.name });

            }
        })
        .catch(err => {
            console.log(err);
        });
})


app.post('/addTodo', (req, res) => {
    const newTodo = req.body.newTodo;
    const listName = req.body.list;
   
    const item = new Item ({
        name: newTodo
    });

    if (listName === "Today") {
        item.save();
    res.redirect("/");

    } else {
        List.findOne({name: listName})
        .then(foundList => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
        .catch(err => {
            console.log(err);
        });
    }

    
});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndRemove(checkedItemId)
  .then(removedDoc => {
    // Handle success case
    if (removedDoc) {
      console.log('Document removed:', removedDoc);
    } else {
      console.log('Document not found');
    }
  })
  .catch(err => {
    // Handle error case
    console.error(err);
  });
  res.redirect("/")
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
  .then(updatedDocument => {
    res.redirect("/" + listName);
    console.log('Document updated successfully:', updatedDocument);
  })
  .catch(error => {
    console.error('Error updating document:', error);
  });
    }

    
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
