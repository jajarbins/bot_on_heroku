// Librarys
const restify = require('restify');
const builder = require('botbuilder');
const axios = require('axios');


// Files
const dialog1 = require('./conversation'); // Load conversation

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
// var connector = new builder.ChatConnector({
//     appId: process.env.MicrosoftAppId,
//     appPassword: process.env.MicrosoftAppPassword
// });

// Listen for messages from users 
//server.post('/api/messages', connector.listen());


var connector = new builder.ConsoleConnector().listen();

var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, [
    (session, result, next) => {
        if (session.dialogData.firstChoice){
            next();
        }
        session.send("Hey ! Welcome to your Music Agent");
        next();
    },

    (session) => {
        session.beginDialog('modeSelector');
    }

]).set('storage', inMemoryStorage); // Register in-memory storage

//WATERFALL
bot.dialog(`modeSelector`, [

    (session, result, next) => {
        let str = `Do you want to discover latest cool music or do you want to know about an artist's discography (discover || discog)`
        if (session.dialogData.firstChoice){
            builder.send(`Soo.. what do you want to do now ?`);
        }
        builder.Prompts.text(session, str);
    },

    (session, results) => {
        session.dialogData.firstChoice = results.response;
        if (session.dialogData.firstChoice == `discover`){
            session.beginDialog('musicSelector');
        } else if (session.dialogData.firstChoice == `discog` || session.dialogData.firstChoice == `discography`){
            session.beginDialog('artistDiscog');
        }
    }

])
.endConversationAction(
    `endMusicSelector`, `That's suck, I feel durty now !`,
    {
        matches: /^cancel$|^goodbye$/i,
    });


//WATERFALL  
bot.dialog(`musicSelector`, [

    (session) => {
        session.send(`Yoooo ! Welcome to your Music Selector ( #MOOOOOODESELEKTOOOR )`);
        builder.Prompts.text(session, `Please tel me if you want knews from nodata or bandcamp (nodata || bandcamp)`);
    },

    (session, results) => {
        session.dialogData.musicWebSite = results.response;
        builder.Prompts.text(session, `which music style do you want to ear about`);
    },

    (session, results) => {
        session.dialogData.musicStyle = results.response;        
        session.send(`ooOOOK Baaby ! So you want fresh hot ${session.dialogData.musicStyle} music comming from the insane ${session.dialogData.musicWebSite}`);
        session.replaceDialog(`modeSelector`);    
    }

])
.endConversationAction(
    `endArtistDiscog`, `Whoooo yaa ; qu'est-ce tu fou gros ?!? Vas-y je m'éclipse`,
    {
        matches: /^cancel$|^goodbye$/i,
    });


//WATERFALL  
bot.dialog(`artistDiscog`, [

    (session) => {
        session.send( "Bonjourno !");
        builder.Prompts.text( session, "Please tel me which artist do you want to know about ?");
    },

    (session, results) => {
        session.dialogData.artistDiscog = results.response;
        session.send (`No Problemo Senior ! here is the discography of the one and unique "${session.dialogData.artistDiscog}"`);
        getArtistDiscog (session.dialogData.artistDiscog).then( (discog) => {
                session.send(orderDiscog(discog));
                session.replaceDialog(`modeSelector`);
        });    
    }

])
.endConversationAction(
    "endArtistDiscog", "Ok. Boenostardes.",
    {
        matches: /^cancel$|^goodbye$/i,
    });




async function getArtistDiscog(artistName) {

    const url = `https://api.deezer.com/`;
    let discography = [];



    let axiosResult = await axios.get(url + `search?q=` + artistName);

    for (let album of axiosResult.data.data) {
        if (album.album && album.album.title && album.album.type == `album`) { //check if the current element is an album
            if (!discography.includes(album.album.title)) {     //check if album is already stored
                discography.push(album.album.title);
            }
        }
    }
    return discography ;
}

function orderDiscog (discog){

    if (discog.length > 0){
        let str = ``
        for (let album of discog){    
            str += `          --> ${album} \n`;            
        }
        return str;
    }
    return `ya pas d'album gros   `;
}


