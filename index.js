const express = require("express");
const app = express();
const port = 3000;
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const {externalStocksList}= require('./../../personalcoding/stock-list.js')
const {externalExclusionList}= require('./../../personalcoding/stock-exclude.js')
puppeteer.use(StealthPlugin())
app.use(express.static("public"));
let arrTitlesScrapedAccessWire
let arrTitlesScrapedBusinessNW
let arrTitlesScrapedFinancialTimes

////////////Initialization Code Set////////////
app.get("/localstocklist", async (req, res) => {
  res.send({product2: externalStocksList, product3: externalExclusionList});
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
////////////Initialization Code Set////////////
////////////FedSchedule Code Set////////////
let arrFedMonths=[]
let arrFedDates=[]
let arrFedSchedule=[]
const urlFedSchedule = 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'

async function afuncFedSchedule(urlFedSchedule) {
  let browser= await puppeteer.launch({userDataDir: './ZZdata', headless: true }).then(async browser => {
  let page = await browser.newPage()
  await page.goto(urlFedSchedule, {waitUntil: "load", timeout: 0 })

  let arrDate1 = await page.evaluate(()=> {
      return Array.from(document.querySelectorAll('.fomc-meeting__month.col-xs-5.col-sm-3.col-md-2')).map(x=>x.textContent)
  })
  arrFedMonths.push(arrDate1[0],arrDate1[1],arrDate1[2],arrDate1[3],arrDate1[4],arrDate1[5],arrDate1[6],arrDate1[7])
  
  let arrDate2 = await page.evaluate(()=> {
      return Array.from(document.querySelectorAll('.fomc-meeting__date.col-xs-4.col-sm-9.col-md-10.col-lg-1')).map(x=>x.textContent)
  })
  arrFedDates.push(arrDate2[0],arrDate2[1],arrDate2[2],arrDate2[3],arrDate2[4],arrDate2[5],arrDate2[6],arrDate2[7])
  
  for(let m=0;m<arrFedDates.length;m++) {
      arrFedSchedule.push(arrFedMonths[m]+ ': '+arrFedDates[m] +'<br/>')
  }
  arrFedSchedule=arrFedSchedule.join('')
  browser.close()
  })
}

app.get("/fedschedule", async (req, res) => {
  await afuncFedSchedule(urlFedSchedule)
  res.send({product1: arrFedSchedule});
});
////////////FedSchedule Code Set////////////




////////////CPISchedule Code Set////////////
let arrCPIMonths=[]
let arrCPIDates=[]
let arrCPISchedule=[]
const urlCPISchedule = 'https://www.bls.gov/schedule/news_release/cpi.htm'

async function afuncCPISchedule(urlCPISchedule) {
  let browser= await puppeteer.launch({userDataDir: './ZZdata', headless: true }).then(async browser => {
  let page = await browser.newPage()
  await page.goto(urlCPISchedule, {waitUntil: "load", timeout: 0 })

  let arrDate1 = await page.evaluate(()=> {
      return Array.from(document.querySelectorAll('.release-list-even-row')).map(x=>x.textContent)
  })

  arrCPIMonths.push(arrDate1[4],arrDate1[5],arrDate1[6])
  // console.log(arrCPIMonths[0][0])
  let arrDate2 = await page.evaluate(()=> {
      return Array.from(document.querySelectorAll('.release-list-odd-row')).map(x=>x.textContent)
  })
  arrCPIDates.push(arrDate2[4],arrDate2[5],arrDate2[6])
  
  for(let m=0;m<arrCPIDates.length;m++) {
      arrCPISchedule.push(arrCPIMonths[m] +'<br/>'+arrCPIDates[m] +'<br/>')
  }
  arrCPISchedule=arrCPISchedule.join('')
  browser.close()
  })
}

app.get("/CPIschedule", async (req, res) => {
  await afuncCPISchedule(urlCPISchedule)
  res.send({product1: arrCPISchedule});
});
////////////CPISchedule Code Set////////////




////////////AccessWire Code Set////////////
const urlAccessWire ="https://www.accesswire.com/newsroom/";
async function afuncScrapeAccessWire(urlAccessWire) {
  let browser= await puppeteer.launch({userDataDir: './ZZdata', headless: true }).then(async browser => {
    let page = await browser.newPage()
    await page.goto(urlAccessWire, {waitUntil: "load", timeout: 0 })
    arrTitlesScrapedAccessWire = await page.evaluate(()=> {
      let tagID= '.w-embed'
      return Array.from(document.querySelectorAll(tagID)).map(x=>x.textContent)
    })
    if(arrTitlesScrapedAccessWire[0]==undefined) {
      arrTitlesScrapedAccessWire= '####'
    }
    browser.close()
  })
}

app.get("/accesswire", async (req, res) => {
  await afuncScrapeAccessWire(urlAccessWire);
  res.send({product1: arrTitlesScrapedAccessWire});
});
////////////AccessWire Code Set////////////
////////////Financial Times Code Set////////////
const urlFinancialTimes='https://www.ft.com/news-feed'
async function afuncScrapeFinancialTimes(urlFinancialTimes) {
  let browser= await puppeteer.launch({userDataDir: './ZZdata', headless: true }).then(async browser => {
    let page = await browser.newPage()
    await page.goto(urlFinancialTimes, {waitUntil: "load", timeout: 0 })
    arrTitlesScrapedFinancialTimes = await page.evaluate(()=> {
      let tagID= '.o-teaser__heading'
      return Array.from(document.querySelectorAll(tagID)).map(x=>x.textContent)
    })
    if(arrTitlesScrapedFinancialTimes[0]==undefined) {
      arrTitlesScrapedFinancialTimes= '####'
    }
    browser.close()
  })
}

app.get("/financialtimes", async (req, res) => {
  await afuncScrapeFinancialTimes(urlFinancialTimes);
 res.send({product1: arrTitlesScrapedFinancialTimes});
});
////////////Financial Times Code Set////////////
////////////BusinessWire Code Set////////////
const urlBusinessNW="https://www.businesswire.com/portal/site/home/news/"

async function afuncScrapeBusinessNW(urlBusinessNW) {
  let browser= await puppeteer.launch({userDataDir: './ZZdata', headless: true }).then(async browser => {
    let page = await browser.newPage()
    await page.goto(urlBusinessNW, {waitUntil: "load", timeout: 0 })
    arrTitlesScrapedBusinessNW = await page.evaluate(()=> {
      let tagID= '.bwTitleLink'
      return Array.from(document.querySelectorAll(tagID)).map(x=>x.textContent)
    })
    if(arrTitlesScrapedBusinessNW[0]==undefined) {
      arrTitlesScrapedBusinessNW= '####'
    }
    browser.close()
  })
}

app.get("/BusinessNW", async (req, res) => {
  await afuncScrapeBusinessNW(urlBusinessNW);
 res.send({product1: arrTitlesScrapedBusinessNW});
});
////////////BusinessWire Code Set////////////





////////////Template Code Set////////////
// let arrTitlesScraped****
// const url****=""

// async function afuncScrape****(url**** {
//   let browser= await puppeteer.launch({userDataDir: './ZZdata', headless: true }).then(async browser => {
//     let page = await browser.newPage()
//     await page.goto(url**** {waitUntil: "load", timeout: 0 })
//     arrTitlesScraped**** = await page.evaluate(()=> {
//       let tagID= '!!!!'
//       return Array.from(document.querySelectorAll(tagID)).map(x=>x.textContent)
//     })
  // if(arrTitlesScraped****[0]==undefined) {
  //   arrTitlesScraped****= '####'
  // }
//     browser.close()
//   })
// }

// app.get("/****", async (req, res) => {
//   await afuncScrape****(url****);
//  res.send({product1: arrTitlesScraped****});
// });
////////////Template Code Set////////////