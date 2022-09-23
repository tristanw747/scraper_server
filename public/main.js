let [arrMatchedStocks,arrMatchedArticles,arrMatchedIndex]=[[],[],[]]
let [finStockNames, finScrapedTitles, finIndexList]= [[],[],[]]
var repeatCounter=0
var arrMasterStocksList
let arrMasterExclusion
let arrTimeStampLock=[]
let numIndexMatched
let arrMatchedStocksList
let arrScrapedRawData
let runCount = 0;
let accesswireRunCount=0
let ftRunCount=0
let jsonDataFT=0
let jsonDataAccess=0;
let BusinessNWRunCount=0
let jsonDataBusinessNW=0
let stockListRaw=0
var rando= Math.random()
let timeStampBusinessNW=[]
let timeStampFinancialTimes=[]
let timeStampAccessWire=[]
let rerunTimer= ()=> Math.round((rando*2000)+5000)
let rerunTimer2= ()=> Math.round((rando*200)+2300)
let funcDateStamp= () =>{
  let today = new Date();
  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = "Time Stamp: "+date+' '+time;
  return dateTime
}

////////////Initialization Code Set////////////
function funcStartOnLoad() {
  afuncLocalStocksImport()
  afuncFedScheduleSolo()
  afuncCPIScheduleSolo()
  afuncAccessWireScrapeLoop()
  afuncFinancialTimesScrapeLoop()
  afuncBusinessNWScrapeLoop()
  // afunc****ScrapeLoop()
}
async function afuncLocalStocksImport() {
  let response = await fetch("/localstocklist");
  stockListRaw = await response.json().catch(err => console.log(err));
  arrMasterStocksList= stockListRaw.product2
  arrMasterExclusion= stockListRaw.product3
}
////////////Initialization Code Set////////////

////////////Shared Code Set////////////
async function afuncMatchFilter(data) {
  [arrMatchedStocks,arrMatchedArticles,arrMatchedIndex]=[[],[],[]];
 
  arrScrapedRawData= data.product1
  let externalStockListRegex= new RegExp(arrMasterStocksList.join('|'), "gi")
  if(arrScrapedRawData[0]===undefined) {
    document.querySelector("#error-header").innerHTML  = "ERROR: SCRAPE FAILED"
  }
  for(let i=0;i<arrScrapedRawData.length;i++) {
    let singleScrapedTitle= arrScrapedRawData[i].toLowerCase()
    for(let k=0;k<arrMasterExclusion.length;k++){
      if(singleScrapedTitle.includes(arrMasterExclusion[k].toLowerCase())) {
        singleScrapedTitle= '@@!!@@'
      }
    }
    arrMatchedStocksList = singleScrapedTitle.match(externalStockListRegex)
    if(arrMatchedStocksList) {
      arrMatchedArticles.push('<br/>'+'* '+ singleScrapedTitle )
      if(!arrMatchedStocks.includes('<br/>'+ '* '+arrMatchedStocksList[0])) {
        arrMatchedStocks.push( '<br/>'+ '* '+arrMatchedStocksList[0])
      }
      numIndexMatched= arrMasterStocksList.indexOf(arrMatchedStocksList[0])
      if(!arrMatchedIndex.includes(numIndexMatched)){
        arrMatchedIndex.push(numIndexMatched)
      }
    }
  }
}

function funcRemoveDuplicate(rawJSON, tester) {
  tester= []
  afuncMatchFilter(rawJSON)
  if(arrMatchedIndex[0]!==undefined) {
    for(let b=0; b<arrMatchedIndex.length;b++) {
      arrMasterStocksList[arrMatchedIndex[b]]= '@@@@'
    }
  }
  afuncMatchFilter(rawJSON)
}

function funcValidateTimeStamp(tester) { 
    if(arrMatchedStocks[0]){
     tester.push(`<br/>${funcDateStamp()}`)
     tester.splice(1, 1)
     return tester[0]
    } else return "Scanning..."
}



document.querySelector('#custom-filter').addEventListener('submit',(e)=>{
  e.preventDefault();
  if(e.target.elements.newItem.value!=='') {
    if(e.target.elements.newItem.value!==' ') {
    arrMasterExclusion.push(e.target.elements.newItem.value)
    console.log(arrMasterExclusion)
    }
  }
  e.target.elements.newItem.value=''
})
////////////Shared Code Set////////////


////////////FedSchedule Code Set////////////
async function afuncFedScheduleSolo() {
  let responseFedSchedule = await fetch("/fedschedule");
  jsonDataFedSchedule = await responseFedSchedule.json().catch(err => console.log(err));
  document.querySelector("#FedSchedulesendtoHTML").innerHTML  = jsonDataFedSchedule.product1;
}
////////////FedSchedule Code Set////////////

////////////CPISchedule Code Set////////////
async function afuncCPIScheduleSolo() {
  let responseCPISchedule = await fetch("/CPIschedule");
  jsonDataCPISchedule = await responseCPISchedule.json().catch(err => console.log(err));
  document.querySelector("#CPISchedulesendtoHTML").innerHTML  = jsonDataCPISchedule.product1;
}
////////////CPISchedule Code Set////////////


////////////Access NewsWire Times Code Set////////////
async function afuncAccessWireScrapeLoop() {
  let responseAccess2 = await fetch("/accesswire");
  jsonDataAccess = await responseAccess2.json().catch(err => console.log(err));

  if(jsonDataAccess.product1=='####') {
     document.querySelector("#product").innerHTML = "Error! Search tag not Found!"
  } else {
    afuncMatchFilter(jsonDataAccess)
    accesswireRunCount += 1
    funcSendtoBrowserAN()
  }
  setTimeout(afuncAccessWireScrapeLoop, rerunTimer())
}
function funcSendtoBrowserAN() {
  document.querySelector("#product").innerHTML  = arrMatchedArticles;
  document.querySelector("#product2").innerHTML  = arrMatchedStocks;
  document.querySelector("#product3").innerHTML  = `Bot Run Count: ${accesswireRunCount} <br/>${funcValidateTimeStamp(timeStampAccessWire)}`;
} 

let scrapeButton = document.getElementById("remove-button1");
scrapeButton.addEventListener("click", (e) => {
  play()
  e.preventDefault();
  funcRemoveDuplicate(jsonDataAccess,timeStampAccessWire);
  funcSendtoBrowserAN()
});
////////////Access NewsWire Times Code Set////////////

////////////Financial Times Code Set////////////
async function afuncFinancialTimesScrapeLoop() {
  let responseFT = await fetch("/financialtimes");
  jsonDataFT = await responseFT.json().catch(err => console.log(err));
  if(jsonDataFT.product1=='####') {
     document.querySelector("#product4").innerHTML = "Error! Search tag not Found!"
  } else {

  afuncMatchFilter(jsonDataFT)
  ftRunCount+=1;
  funcSendtoBrowserFT()
  }
  setTimeout(afuncFinancialTimesScrapeLoop, rerunTimer())
}
function funcSendtoBrowserFT() {
  document.querySelector("#product4").innerHTML  = arrMatchedArticles;
  document.querySelector("#product5").innerHTML  = arrMatchedStocks;
  document.querySelector("#product6").innerHTML  = `Bot Run Count: ${ftRunCount} ${funcValidateTimeStamp(timeStampFinancialTimes)}`;
}
  
let scrapeButtonz = document.getElementById("remove-button2");
scrapeButtonz.addEventListener("click", (e) => {
  play()
  e.preventDefault();
  funcRemoveDuplicate(jsonDataFT,timeStampFinancialTimes);
  funcSendtoBrowserFT()
});
////////////Financial Times Code Set////////////


////////////BusinessWire Code Set////////////
async function afuncBusinessNWScrapeLoop() {
  let responseBusinessNW = await fetch("/BusinessNW");
  jsonDataBusinessNW = await responseBusinessNW.json().catch(err => console.log(err));
  
  if(jsonDataBusinessNW.product1=='####') {
    document.querySelector("#BusinessNWsendtoHTML2").innerHTML = "Error! Search tag not Found!"
  } else {
  afuncMatchFilter(jsonDataBusinessNW)
  BusinessNWRunCount+=1;
  funcSendtoBrowserBusinessNW()
 }
  setTimeout(afuncBusinessNWScrapeLoop, rerunTimer())
}
function funcSendtoBrowserBusinessNW() {
  document.querySelector("#BusinessNWsendtoHTML1").innerHTML  = `Bot Run Count: ${BusinessNWRunCount} ${funcValidateTimeStamp(timeStampBusinessNW)}`;
  document.querySelector("#BusinessNWsendtoHTML2").innerHTML  = arrMatchedArticles;
  document.querySelector("#BusinessNWsendtoHTML3").innerHTML  = arrMatchedStocks;
}
let BusinessNWButton = document.getElementById("remove-buttonBusinessNW");
BusinessNWButton.addEventListener("click", (e) => {
  play()
  e.preventDefault();
  funcRemoveDuplicate(jsonDataBusinessNW,timeStampBusinessNW);
  funcSendtoBrowserBusinessNW()
});
////////////BusinessWire Code Set////////////








addEventListener('load', funcStartOnLoad())






////////////Template Code Set////////////
// let ****RunCount=0
// let jsonData****=0
// let timeStamp****=[]

// async function afunc****ScrapeLoop() {
//   let response**** = await fetch("/****");
//   jsonData**** = await response****.json().catch(err => console.log(err));
//   afuncMatchFilter(jsonData****)
//   ****RunCount+=1;
//   funcSendtoBrowser****()
//   setTimeout(afunc****ScrapeLoop, rerunTimer())
// }
// function funcSendtoBrowser****() {
//   document.querySelector("#****sendtoHTML1").innerHTML  = `Bot Run Count: ${****RunCount} ${funcValidateTimeStamp(timeStamp****)}`;
//   document.querySelector("#****sendtoHTML2").innerHTML  = arrMatchedArticles;
//   document.querySelector("#****sendtoHTML3").innerHTML  = arrMatchedStocks;
// }
  
// let ****Button = document.getElementById("remove-button****");
// ****Button.addEventListener("click", (e) => {
//   e.preventDefault();
//   funcRemoveDuplicate(jsonData****);
//   funcSendtoBrowser****()
// });
////////////Template Code Set////////////