const fs = require('fs');
const http = require('https');
const axios = require('axios');
const html =  require('node-html-parser');

const linkDownload = 'https://www.yt-download.org/api/button/mp3';

var idExtract = link =>{
    let idParsed;
    if(link.includes('youtu.be/')){
        idParsed = link.split('/');
        idParsed = idParsed[3];
        return idParsed;
    }else{
        idParsed = link.split('=');
        if(link.includes('&')){
            idParsed = idParsed[1].slice(0,idParsed[1].indexOf("&"));
            return idParsed;
        }else{
            return idParsed[1];
        }
    }
};

const buildLink = link =>{
    return `${linkDownload}/${idExtract(link)}`
}

const musicDownload = async (link, audioNumber, callback) =>{
    console.log("Gravando audio");
    try{
        axios.get(`${buildLink(link)}`).then(response =>{
            let htmlContent = html.parse(response.data);
            let htmlParsed = htmlContent.querySelectorAll("a");

            htmlParsed = htmlParsed[0].rawAttributes.href;
            console.log(`html link: ${htmlParsed} \n`);

            let file = fs.createWriteStream(`./audio/audio${audioNumber}.mp3`);
            http.get(htmlParsed, resp=>{
                resp.pipe(file);
                file.on('finish', ()=>{
                    file.close();
                    console.log(`Gravação concluida:`);
                    return callback(true);
                });
            }).on('error', err=>{
                fs.unlink('./audio/audio.mp3');
                console.log(`erro na gravação: \n ${err}`);
                return callback(false);
            });
        });
        
    }catch(e){
        console.log(e);
        return false;
    }
}

module.exports = {musicDownload};