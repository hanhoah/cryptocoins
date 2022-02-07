// VARIABLEN, KONSTANTEN

// cryptocompare.com
const rooturl = "https://www.cryptocompare.com/";
const api = "66939e2bb190c68981b8bf38891ae72e6ddf5edc9c69c7b49dab1b36d394b0f3";

// das Response Object liefert hier auch den vollständigen Namen des Coins
const toplisturl = "https://min-api.cryptocompare.com/data/top/mktcapfull?limit=100&tsym=USD"
let topListObject = {};

// get News List 
let newsurl = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"

// DOM-MAPPING
let domCoinList = dom.$(".coinList")
let tableCoinList = dom.create("table", "", domCoinList);
let domCoinDetail = dom.$(".coinDetail")

let domNews = dom.$(".news_body")
let domTable = dom.create("table", "", domNews)

// Objects
let topList;
let news;

// FUNKTIONEN
const getTrs = () => {
  let rows = document.querySelectorAll("tr");
  return rows
}

const getTds = (row) => {
  let tds = Array.from(row.querySelectorAll("td"));
  return tds
}

const getTd = (tds, index) => {
    return tds[index];
}

const getCoin = (row) => {
    let myRow = getTrs()
    return myRow[row].childNodes[3].innerText;
}

const fetchNews = async() => {
    let localNews = localStorage.getItem("news");
    if(!localNews){
        //console.log('fetching News from Web');
        let res = await fetch(`${newsurl}&api_key=${api}`);
        newsObject = await res.json();
        localStorage.setItem("news", JSON.stringify(newsObject))
    }else{
        //console.log('fetching News from Localstorage');
        newsObject = JSON.parse(localNews);
    }
    
    return newsObject;
}

const renderArticle = (el) => {
    let domHeaderRow = dom.create("tr", "", domTable)
    //Logo in Header
    let domTHLogo = dom.create("th", "", domHeaderRow)
    let logo = dom.create("img", "", domTHLogo)
    logo.src = el.imageurl;
    logo.width = 50;
    
    let domTHTitle = dom.create("th", "", domHeaderRow);
    let h2 = dom.create("h3", el.title, domTHTitle)

    let domTRNewsBody = dom.create("tr", "", domTable);
    // trim el.body to 40 words
    let teaser = el.body.split(" ").slice(0,40).join(" ");

    let tdBody = dom.create("td", teaser, domTRNewsBody);
    tdBody.colSpan = "2";

    // create link to source 
    let newsLink = dom.create("a", " [...more]", tdBody);
    newsLink.href=el.url;
    newsLink.target="_blank";
}

const renderNews = (page) => {
    console.log('renderNews()');
    if(!page) page = 1;
    let itemsPerPage = 3
    let maxPages;


    news = fetchNews().then((res)=>{
        maxPages = Math.ceil(res.Data.length/itemsPerPage);
        console.log('maxpages', maxPages);
        
        let news_slice = res.Data.slice((page-1)*itemsPerPage, (page-1)*itemsPerPage+itemsPerPage)
        for (let el of news_slice){
            renderArticle(el);
        }
    });
    let domNewsButton = dom.create("button", "more News")
    domNewsButton.classList.add("newsButton")
    domNews.appendChild(domNewsButton)
    domNewsButton.addEventListener("click", (evt)=>{
        evt.preventDefault();
        //domNews.innerText = "";
        domTable.innerHTML = "";
        if(page==maxPages)
            page = 1;
        renderNews(++page)

    });
}



// const renderNews = (page) => {
//     let itemsPerPage = 4
//     let news = fetchNews().then((res)=>{
//         console.log(typeof(res), res);
//         let i = 0;
//         for (let el of res.Data){
//             if (i<itemsPerPage)
//                 renderArticle(el);
//             i++
//         }
//     });
// }


const fetchTopList = async() => {
    let res = await fetch(`${toplisturl}&api_key=${api}`)
    topListObject = await res.json()
    return topListObject.Data
}

const numCoins = ()=> {

}

const getCoinDetails = (id) => {
    let coinDetails = JSON.parse(localStorage.getItem("topList"))[id-1]
    let coin = {};
    coin.name = coinDetails.CoinInfo.Name;
    coin.fullName = coinDetails.CoinInfo.FullName;
    let moreDetails = coinDetails.DISPLAY.USD;
    coin.price = moreDetails.PRICE;
    coin.change24hour = moreDetails.CHANGE24HOUR;
    coin.changeHour = moreDetails.CHANGEHOUR;
    coin.changePct24hour = moreDetails.CHANGEPCT24HOUR;
    coin.changePctHour = moreDetails.CHANGEPCTHOUR;
    coin.image = moreDetails.IMAGEURL;
    coin.marketcap = moreDetails.MKTCAP;
    return coin
}

const addColorClass = (domElement, changeValue) => {
    let value = parseFloat(changeValue.replace("$ ",""));
    if (value>0){
        domElement.classList.add("green")
        domElement.insertAdjacentHTML("beforeend", `<i class="fa-solid fa-circle-arrow-up"></i>`);
    }
    else if (value<0){
        domElement.classList.add("red")
        domElement.insertAdjacentHTML("beforeend", `<i class="fa-solid fa-circle-arrow-down"></i>`)
    }
    else{
        domElement.classList.add("yellow")
    }
    return true;
}

const renderCoinDetails = (coin) => {
    domCoinDetail.innerText = "";
    let image = dom.create("img", "", domCoinDetail);
    image.src=`${rooturl}${coin.image}`

    let h1 = dom.create("h1", `${coin.fullName} (${coin.name})  `, domCoinDetail);
    h1.classList.add("blue");

    let pPrice = dom.create("p", "Price: " + coin.price, domCoinDetail);
    pPrice.classList.add("blue");

    let p24hour = dom.create("p", "Änderung 24 Stunden: " + coin.change24hour, domCoinDetail);
    addColorClass(p24hour, coin.change24hour)

    let p24hourPct = dom.create("p", "Änderung 24 Stunden (%): " + coin.changePct24hour, domCoinDetail);
    addColorClass(p24hourPct, coin.changePct24hour)

    let pHour = dom.create("p", "Änderung letzte Stunde: " + coin.changeHour, domCoinDetail);
    addColorClass(pHour, coin.changeHour)

    let pHourPct = dom.create("p", "Änderung letzte Stunde (%): " + coin.changePctHour, domCoinDetail);
    addColorClass(pHourPct, coin.changePctHour)

    let pMarketCap = dom.create("p", "Marktkapitalisierung: " + coin.marketcap, domCoinDetail);
    pMarketCap.classList.add("blue");

    //let pYoutube = dom.create("p", `<img src="https://logosmarken.com/wp-content/uploads/2020/04/YouTube-Emblem.png">`, domCoinDetail)
    let pYoutube = dom.create("p", `<a target="_blank" href="https://www.youtube.com/results?search_query=${coin.fullName}+${coin.name}"><img align="left" width='100px' src='https://logosmarken.com/wp-content/uploads/2020/04/YouTube-Emblem.png'> <b>Die neuesten Informationen über ${coin.fullName} auf Youtube</b>`, domCoinDetail);
    pYoutube.classList.add("youtube");

    //let pPrice = dom.create("p", "Price: " + coin.price, domCoinDetail);
    // let pPrice = dom.create("p", "Price: " + coin.price, domCoinDetail);
    // let pPrice = dom.create("p", "Price: " + coin.price, domCoinDetail);
}

const handleClick = (evt) => {
    let coinName = evt.target.closest('tr').className
    let id = evt.target.closest('tr').firstChild.innerText;
    renderCoinDetails(getCoinDetails(id))
}


const renderCoinInListView = (coinObject, i) => {
   let tr = dom.create("tr", "", tableCoinList, [coinObject.CoinInfo.Name]);

   tr.addEventListener("click", handleClick)
   let tdCounter = dom.create("td", i , tr);
   let td = dom.create("td", "" , tr);
   let img = dom.create("img", "", td, ["coinLogo"])
   img.src = rooturl + coinObject.CoinInfo.ImageUrl
   let td1 = dom.create("td", coinObject.CoinInfo.Name, tr);
   let td2 = dom.create("td", coinObject.CoinInfo.FullName, tr);
}

const renderCoinTable = async (topList)=>{
    let i = 1;
    for(let coin of topList){
        renderCoinInListView(coin, i);
        i++;
    }
}

const createSubCoinList = (page) => {
    console.log('createSubcoinlist');
    console.log('toplist', topList);
}

const renderTopCoins = async(page) => {
    if(!page)page = 1;
    topList = JSON.parse(localStorage.getItem("topList"))
    if (!topList){
        console.log('fetchTopList from Web');
        let topList = await fetchTopList();
        localStorage.setItem("topList", JSON.stringify(topList))
        //erzeuge subList aus der top List
        let subCoinList = createSubCoinList(page)
        renderCoinTable(topList);
    
    }else{
        //erzeuge subList aus der top List
        console.log('fetchTopList found in localstorage');
        let subCoinList = createSubCoinList(page)
        renderCoinTable(topList);
    }
}

const getRandomImage = () => {
    let images = [
        "https://public.bnbstatic.com/20190213/cd4e36ea-548d-4d67-ba7d-c318b4e7d7e6.png",
        "https://cdn.wallpapersafari.com/43/44/la3oyQ.jpg",
        "https://wallpaperaccess.com/full/5851945.png",
        "https://www.stex.com/static/33ee5a8360c08a123674bfdf8ea29d67/a764f/Ethereum-and-Binance-Smart-Chain2.jpg",
        "https://www.wallpapertip.com/wmimgs/96-967065_bitcoin-increasing-in-growth-with-a-fiery-background.jpg",
        "https://thumbs.dreamstime.com/b/bitcoin-auf-feuer-118877268.jpg",
        "https://images3.alphacoders.com/102/thumb-1920-1020783.jpg",
        "https://www.wallpapertip.com/wmimgs/10-102822_bitcoin-wallpaper-hd-src-bitcoin-wallpapers-for-1080p.jpg", 
        "https://images6.alphacoders.com/912/thumb-1920-912465.jpg", 
        "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZXRoZXJldW18ZW58MHx8MHx8&w=1000&q=80",
        "https://wallpapercave.com/wp/wp2322101.jpg",
        "https://external-preview.redd.it/mO1AkmXYMhyQDKKDRotReW2NWR4dYv_sRUs6_9r9M1g.jpg?auto=webp&s=d3423a72925f74fe60723e2429828529364f1600",
        "https://live.staticflickr.com/4535/37895449274_8c76da7efe_b.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSh6NIgvdcExHoUw97TbwV1Yvd3rFuPnIoIkA&usqp=CAU",
        "https://www.trendingtopics.eu/wp-content/uploads/2021/06/Untitled-design-42.jpg",
        "https://www.btc-echo.de/wp-content/uploads/2021/03/shutterstock_1551046811-scaled.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpGimx-ZlxANTHwTB32hiC8ZghcxQr15eleQ&usqp=CAU",
        "https://cryptoslate.com/wp-content/uploads/2021/11/solana-5k.jpg",
        "https://images4.alphacoders.com/201/thumb-1920-201154.jpg",
        "https://thenewscrypto.com/wp-content/uploads/2021/08/WhatsApp-Image-2021-08-20-at-3.08.14-AM-1280x720.jpeg",
        "https://coinchapter-f476.kxcdn.com/wp-content/uploads/2021/11/1_PCGUhfsMp0PZDD_uWjlIIg-1024x576.jpeg",
        "https://news-krypto.de/wp-content/uploads/2021/12/Ethereum-Rivale-Terra-LUNA-bereitet-sich-laut-Coin-Bureau-moglicherweise.jpg",
        "https://i.redd.it/24b3h8u6hqu61.jpg",
        "https://qph.fs.quoracdn.net/main-qimg-a8e8831559efeb6fd9417f1e90ed0737",
        "https://cnews24.ru/uploads/08b/08b177d6ec291f5aa5bf0f56b6c1b23532367dda.jpg",
        "https://wallpaperaccess.com/full/6329154.jpg",
        "https://i.ytimg.com/vi/mkHpxtGX_HU/maxresdefault.jpg",
        "https://wallpapercave.com/wp/wp9583857.jpg",
        "https://i.pinimg.com/originals/95/de/e5/95dee5c0df7fe3cc9f208a4636ffe483.png",
        "https://cdn.coingape.com/wp-content/uploads/2021/10/04101946/Axie-Infinity-AXS-Metaverse.jpeg",
        "https://cdnb.artstation.com/p/assets/images/images/040/199/981/large/hanabi-axie-infinity-entry-final-2.jpg?1628153400",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc3dzBuzqiS717RRGyOtjIkAvYgXLe56E-8Q&usqp=CAU",
        "http://www.playtoearn.online/wp-content/uploads/2022/01/Axie_banner1.jpeg",
        "https://cwstatic.nyc3.digitaloceanspaces.com/2020/03/29/images/3/Axie%20Infinity%20Review%20Image%202.jpg",
        "https://miro.medium.com/max/2560/1*T1N9SpTApX3UhBq313zpeA.png",
        "https://playtoearn.net/img/dapp/axie-infinity/axie-infinity-HUgVj3YnzE9w.png",
    ]
    let image = images[~~(Math.random()*images.length)]
    return image
}

const changeBackgroundImage = () => {
    let domBody = document.querySelector("body")
    let randomImage = getRandomImage()
    domBody.style.backgroundImage = `url('${randomImage}')`
}
