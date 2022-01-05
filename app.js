
const express = require ('express');
const bodyParser = require('body-parser');
const mongoose = require ('mongoose'); 
const _ = require('lodash');
require('dotenv').config()

const app = express();  

// create db
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}) ;

const itemSchema = new mongoose.Schema({
   name : String
  });

  const Item = mongoose.model('Item', itemSchema);
//new mongoose.Schema
  const listSchema = new mongoose.Schema ({ 
    name: String,
    items : [ itemSchema]
   }); 


  const item1 = new Item ({
    name : 'Frederick'
  });

  const item2 = new Item ({
    name : 'Magima'
  });

  const defaultItems = [item1, item2 ]                      

  const List = mongoose.model('List', listSchema);  
  //---------db end--------
  

  app.set('view engine', 'ejs'); 
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(express.static('public'));


// get home route      !!+++important 
     app.get( '/', (req, res) => {

      // get current time 

      var today = new Date();

      //uSing toLocaleDateString()

       var options = { 
         weekday : 'long',
         day : 'numeric',
         month : 'long'
           };

    var day = today.toLocaleDateString('en-us', options);           
     

       Item.find({  }, (err, foundItems) => {
                                                     
             if(foundItems.length === 0) {
              Item.insertMany(defaultItems, (err) => {
                    if(err){
                    console.log(err);       
                     } else {
                    console.log('added default');      
                       }
                       } );
         res.redirect('/');      


        } else { 
        res.render ('list3', { listTitle : day, newListItems : foundItems });
         }
      });
                   
  });

//Here the server gets post requests !!!!!!!!!!!!!!!!!!!!!!!!important
app.post( '/', (req, res) => {
     const itemName = req.body.newItem;
     const listName = req.body.list; 

  // item module
  const item = new Item ({ 
    name : itemName
   }); 

   if(listName) { 
    item.save();
    res.redirect('/');
   } else { 
  List.findOne( {name : listName }, (err, foundList) => {
  foundList.items.push(item);         
   foundList.save();
   res.redirect('/' + _.lowerCase(listName));
  
      } );
     }
 });



//add delete route


app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove({_id: checkedItemId}, (err) => {
      if (!err) {
        console.log("Deleted item successfully");
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, results)=>{
      if (!err) {
        res.redirect('/' + _.lowerCase(listName));
      }
    });
  }
 
});

//custom WITH express params !!
app.get('/:customListNameUrl',  (req, res) => {

const listName = req.params.customListNameUrl;

List.findOne({name: _.capitalize(listName)}, (err, foundList) => { 

  if(!err) {
     if(!foundList) {
               const list = new List ({  //------customlist ch!!!
                name: _.capitalize(listName),
                items : defaultItems 
                     });
               
               list.save();

               res.redirect('/' + _.lowerCase(listName));
              } else {
           //show existing lists-------------
      res.render ('list3', { listTitle :  _.capitalize(foundList.name), newListItems : foundList.items });
   
          }
     }
});
  
} );


//-----Added to avoid bug favicon in bd

// app.get("/favicon.ico", (req, res) => {
//   res.sendStatus(204);
// });


  app.listen(3000, function(){console.log('port 3000 workapp to app1'); });







  

 

