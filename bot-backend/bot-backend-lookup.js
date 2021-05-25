require('dotenv').config();
var Airtable = new require('airtable');

  
var base = new Airtable({apiKey: 'XXXXXXXXXXXXXX'}).base('YYYYYYYYYYYYYY');  


//Returns number between first digit and %, i.e. 2, 2.0, or 2.75
function rewardAsNumber(element){
  return parseFloat(element.substring(element.search(/\d/),element.indexOf('%')));
}

function fetchRewardsbyCard(cards,category,callback) {
  try {
    base('Card Data').select({
        view:'Grid view',
        maxRecords: 50
      }
    ).firstPage(function(err, records) {

        console.log("hello we're in RewardsbyCard");
        if (err) {console.error(err); return; }
        const rewardsArr = [];
        const numbersArr = [];
        const cardsArr = [];
        for (i=0; i < cards.length; i++) {
          records.forEach(function(record) {
            if(record.get('Card Full Name') === cards[i]) {
              var card = {};
              card.name = record.get('Card Full Name'); 
              card.shortName = record.get('Card Short Name'); 
              card.reward = record.get(category); 
              card.rewardValue = rewardAsNumber(card.reward);
              cardsArr.push(card);
            }
          });
        }
        cardsArr.sort((a,b) => b.rewardValue-a.rewardValue);
        for(var i=0;i<cardsArr.length;i++){
          var card = cardsArr[i];
          rewardsArr.push(card.shortName + ' ' + card.reward);
        }
        callback(rewardsArr);
      });
      } catch (e) {
        console.log('jordans error area', e);
    return {dberror: e}
  }
}



function fetchCardsByNumber(phoneNumber, callback) {
  try {
    base('Table1').select(
      {
        maxRecords: 50,
        view: 'Grid view'
      }
    ).firstPage(function page(err,records)
    {
      if (err){console.error(err); return; }

      records.forEach(function(record) {
        if (record.get('Phone Number') === phoneNumber) {
          cards = record.get('All Cards').replace(/\n/g, '')
          var cardsArr = cards.split(',').map((element)=>element.trim());
          console.log(cardsArr);
          callback(cardsArr);
        }
      });
    });
  } catch (e) {
      return { dberror : e}
  }
}




function fetchNameByNumber(phoneNumber, callback) {
  try {
    base('Table1').select(
        {
          maxRecords: 50,
          view: 'Grid view'
        }
      ).firstPage(function page(err, records)
        {
          if (err) { console.error(err); return; }
        //  var carolNumber = '(454) 382-9029';
          var name = ""
          records.forEach(function(record) {

      //    console.log(record.get('Phone Number'));
      //    console.log(carolNumber);
      //    var doesIt = carolNumber === record.get('Phone Number')
        //  console.log(doesIt);
          //if(carolNumber === "(454) 382-9029")
        //  { console.log("this is a true statement");}

          if (record.get('Phone Number') === phoneNumber) {
          //  console.log("hello I'm here")
          //  console.log('We have a winner', record.get('Full Name'));
            name = record.get('Full Name');
            //console.log("hi ",{name})
            callback(name);
          //  return {name};
            //return console.log(record.get('Full Name'));
          }
            });
          });
  } catch (e) {
      return { dberror : e }
  }
 }

 function fetchIsNumber(phoneNumber, callback) {
   try {
     var match = false;
     base('Table1').select(
       {
         maxRecords: 50,
         view: 'Grid view'
       }
     ).firstPage(function page(err,records)
     {
       if (err) {console.error(err); return; }
       records.forEach(function(record) {
         if (record.get('Phone Number') === phoneNumber) {
           match = true;
           callback(match);
         }
       }); 
     if(!match){
       callback(null);
     }    
     });
   } catch (e) {
       console.log("joe's error area", e);
       return { dberror : e}
   }
 }




/*
function main(params)
{
switch(params.actionname) {
    case "searchbyNumber":
        return fetchNameByNumber(params.phoneNum);
    default:
        return { dberror: "No action defined", actionname: params.actionname}
}*/

//This is where you can default a number
//var num = "(222) 222-2222";



function main(params) {
  //convert params.num to E.164 phone number
  //change the functions above to check if E.164 phone number equals the parameter passed via the argument
  
  console.log("api key", params.apiKey);
  
//var base = new Airtable({apiKey: 'keyj6I5jiTjkSk8so'}).base('appumWMhUzhgN8fFe');  
  
  let rewardsPromise = new Promise((resolve,reject) => {  
    testCode(params.num,params.category,(rewards)=>{
      resolve(rewards);
    })
  });  
  
  return new Promise((resolve,reject) => {
      fetchIsNumber(params.num, (output) => {
        resolve(output);
        })
      }).then((data)=>{
          console.log("is it a number in database?",data);
          if(data == null){
            console.log('yoooo');
            //at this point, post to some public function the params.num phone number
            //then google can call that function in order to get the phone number to pass to zapier/airtable
            //alternatively, keep the phone number on page 2 of Google Form using the pre-filled URL. 
            return {"result":"not in database","num":params.num};
          }
          else if(data){
            console.log("helllooo");
            
            return rewardsPromise.then((rewards)=>{
              console.log("i'm here");
              return {result:rewards};
            }).catch(err => console.log('Error was', err.message));  
            }
          }).catch(err => console.log('Error was', err.message));
}    

//main({"category":"Gas"});
//module.export = main;
exports.main = main;

// console.log('data is ',data);
// var jsonString = JSON.stringify(data);
// console.log('jsonString is ', jsonString)
// return jsonString;
// console.log('anybody out there');
//  return {'rewards': data};



//main({category:"gas"});

// function main(params) {
//   params.category = "Gas";
//   return new Promise((resolve,reject) =>{
//     data = testCode(num,params.category);
//     if (typeof data !== 'undefined' && data) {
//       const successObject = {
//         msg: 'Success', data: data
//       }
//       resolve(successObject);
//     }
//     else {
//       const errorObject = {
//         msg: 'An error occurred',
//         error: 'Some error we got back'
//       }
//       reject(errorObject);
//     }
//   });
// }



function testCode(num, category, callback){
  try {

  // 1) lookup Name from a phone number
  // 2) lookup cards of the person from a phone number
  // 3) Lookup Rewards from the cards
  fetchNameByNumber(num,(xyz)=>{
    console.log('your name is',xyz);
    fetchCardsByNumber(num,(uggabugga)=>{
    console.log('your cards are',uggabugga);
    fetchRewardsbyCard(uggabugga,category,(rewards)=>{
        console.log('your rewards are', rewards);
        //return {rewards: rewards};
        callback(rewards);
       });
    });
  });
  console.log("hello there");
  } catch (e) {
    return { dberror : e }
  }
//  return ("name: " + name + " and cards: " + cards)
}








/*
function testfetchRewardsByCard(){
  num = "(848) 383-2929";
  category = "Gas";
  var cards = fetchCardsByNumber(num)
  fetchRewardsbyCard(cards,category);
  console.log(cards)
}

testfetchRewardsByCard();
*/


// testing individual functions to see if they work
/* testfetchNameByNumber();
testfetchCardsByNumber();
*/

/*

function testfetchNameByNumber(){
  num = "(454) 382-9029";
  fetchNameByNumber(num);
  //return console.log(name);
}

function testfetchCardsByNumber(){
  num = "(454) 382-9029";
  fetchCardByNumber(num);
  //return console.log(name);
}

*/


/*function tryMe (param1, param2) {
    return (param1 + " and " + param2);
}

function callbackTester (callback, param1, param2) {
    callback (param1, param2);
}

callbackTester (tryMe, "hello", "goodbye");
*/

//console.log (fetchNameByNumber("(222) 222-2222)"));



/*
//main functions
function main(params) {
     dsn=params.__bx_creds[Object.keys(params.__bx_creds)[0]].dsn;

            // dsn does not exist in the DB2 credential for Standard instance. It must be built manually
            if(!dsn) {
                const dbname = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.database;
                const hostname = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.hosts[0].hostname;
                const port = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.hosts[0].port;
                const protocol = 'TCPIP';
                const uid = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.authentication.username;
                const password = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.authentication.password;

                //dsn="DATABASE=;HOSTNAME=;PORT=;PROTOCOL=;UID=;PWD=;Security=SSL";
                dsn = `DATABASE=${dbname};HOSTNAME=${hostname};PORT=${port};PROTOCOL=${protocol};UID=${uid};PWD=${password};Security=SSL`;
            }

            switch(params.actionname) {
                case "insert":
                    return insertEvent(dsn,params.eventValues.split(","));
                case "searchByDates":
                    return fetchEventByDates(dsn,params.eventdates);
                case "searchByName":
                    return fetchEventByShortname(dsn,params.eventname);
                default:
                    return { dberror: "No action defined", actionname: params.actionname}
            }
        }
*/
