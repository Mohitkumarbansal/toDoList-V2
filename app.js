//jshint esversion:6

const express = require("express");            //to incorporate express in our project
const bodyParser = require("body-parser");      //to incorporate body-Parser in our project body parser is used to parse the
                                                //data from html/ejs file to server

const mongoose = require("mongoose");           //to incorporate mongoose to our project

mongoose.connect("mongodb://localhost:27017/toDoListDB");  //to connect to localhost 27017 where our mongodb server is running and connect
                                                            //to toDoListDB database
const app = express();

app.set('view engine', 'ejs');                          //to set the view engine of app to ejs

app.use(bodyParser.urlencoded({extended: true}));       //to incorporate body-parser with express
app.use(express.static("public"));                      //to render the static files which are in public folder like css files

const toDoListSchema = new mongoose.Schema({             //defining schema for general list name of schema is toDOListSchema
  item:String
});

const toDoListItem = mongoose.model("toListItem",toDoListSchema);  //defining model means collection in mongodb with name toDoListItem
// const toDoListWork = mongoose.model("toDoListWork",toDoListSchema);
const item1 = new toDoListItem({                                  //defining item1 document of collection toDOListItem
  item:"Hello A"
});
const item2 = new toDoListItem({
  item:"Hello B"
});
const item3 = new toDoListItem({
  item:"Hello C"
});


let defaultList=[item1,item2,item3];                           //arry of documents of collection type toDoListItem
const listSchema = new mongoose.Schema({                     //defining new schema for various other toDoLists name si listSchema
  name:String,
  items: [toDoListSchema]                                     //items contain the arrry of toDoListSchema which means items is the collection of documents and documents schems is of type toDOListSchema
});

const List = mongoose.model("List",listSchema);             //defining collection of name List for other toDOLIsts


app.get("/", function(req, res) {                          //get requet at home route



toDoListItem.find(function(err,output){                     //getting all documents of which are in toDoListItem collection of mongodb getted in output arry
  if(err)
  {
    console.log(err);
  }
  else{
    console.log(output);
    res.render("list", {listTitle: "Today", toDoListItem:output});     //rendering list.ejs file to the requester
  }
});

});

app.get("/:customListName",function(req,res){                    //this get function is for varius urls get request like localhost:3000/work
  let customListName = req.params.customListName;                //this will take the name of customeListName


  List.findOne({name : customListName},function(err,foundList){  //finds one document which have name according to customListName and output is in foundList

    if(!err)
    {
      if(!foundList)                      //if their is not an list with the name:customeListName then create new document of type list1
      {
        const list1 = new List({
          name:customListName,
          items:defaultList
        });
        list1.save();                   //to save the document
        res.render("list",{listTitle:list1.name,toDoListItem: list1.items});
      }
      // console.log(foundList);
      // const a=foundList.name;
      // const b=foundList.items;
      // res.render("list",{listTitle: a ,toDoListItem: b});
      else
      {
        const a=foundList.name;                           //if given name:customeListName is present then
        const b=foundList.items;
        res.render("list",{listTitle: a ,toDoListItem: b});

      //  res.render("list",{listTitle: foundList.name ,toDoListItem: foundList.Items});
      }
    }
  });




});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const toDoInsert = new toDoListItem({         //As we always need of document of type toDoListItem collection
    item:itemName
  });

  if(listName==="Today")                          
  {
    toDoInsert.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listName},function(err,foundItem){
      foundItem.items.push(toDoInsert);
      foundItem.save();
      res.redirect("/"+ listName);
    });

  }



});

app.post("/delete",function(req,res){
  const listName = req.body.listName;
  const itemName = req.body.checkbox;

  if(listName==="Today")
  {
    toDoListItem.deleteOne({item:req.body.checkbox},function(err){
      if(err)
      {
        console.log(err);
      }
      else{
        console.log("Successful");
      }
    });
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listName},function(err,findOne){
      let index;
      console.log(findOne.items.length);
      for(let i=0;i<findOne.items.length;i++)
      {
        if(findOne.items[i].item===itemName)
        {
          index=i;
        }
      }
      console.log(index);
      findOne.items.splice(index,1);
      findOne.save();
      res.redirect("/" + listName);

    });
  }



});

// app.get("/work", function(req,res){
//
//
//   toDoListWork.find(function(err,output){
//     if(err)
//     {
//       console.log(err);
//     }
//     else{
//       res.render("list", {listTitle: "Work List", toDoListItem: output});
//     }
//   });
//
// });
// app.get("/:currentPage",function(req,res){
//   console.log(req.params.currentPage);
// });
//
// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
