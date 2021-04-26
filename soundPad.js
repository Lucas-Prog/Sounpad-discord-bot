const Discord = require('discord.js');
const createSound = require('./routes/createSound');
const client =  new Discord.Client();
const fs = require('fs');

const Token =  process.env.TOKEN;
const prefix = '.';
client.on('ready', ()=>{
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message =>{
    if(message.author.bot) return;

    if(message.content.includes(prefix)){
        let msg = message.content.slice(prefix.length);
        let args = msg.split(' ');
        let command = args.shift().toLocaleLowerCase();

        if(command === "set"){
            if(args[0] >= 1 && args[0] <= 10){
                message.channel.send("Iniciando Gravação");
                createSound.musicDownload(args[1], args[0], messageSend =>{
                    if(messageSend)
                        message.channel.send("Gravação Concluida !");
                    else{
                        message.channel.send("Ocorreu um erro, tente novamente.");
                    }
                })
            }else{
                message.channel.send("Slot indisponivel !");
            }
        }
        
        if(command === "pl"){
            if(args[0] >= 1 && args[0] <= 10){
                if(verificaAudio(args[0])){
                    let audioPath = `./audio/audio${args[0]}.mp3`;
                    if(message.member.voice.channel === null){
                        message.channel.send("Você deve estar em um canal de voz para me utilizar !");
                    }else if(! message.member.voice.channel.permissionsFor(client.user).has('CONNECT')){
                        message.channel.send("Eu não tenho permissão para acessar este canal de voz ;-;")
                    }else{
                        const connection = await message.member.voice.channel.join();
                        const dispatcher = connection.play(audioPath);
                        const voiceChannel = message.member.voice.channel;
                        message.channel.send("Tocando `btn" + args[0] + "`");

                        dispatcher.on('finish', () =>{
                            dispatcher.destroy();
                            voiceChannel.leave();
                        });
                    }
                }else{
                    message.channel.send("Audio Não Encontrado. \nGrave um, com o comando '.set `btnNumber` `link`'");
                }
            }else{
                message.channel.send("Disponivel Apenas 10 Slots !");
            }
        }

        if(command === "view"){
            let commandMessage = "Os slots estão com a dispostos da seguinte forma";
            const slotVerify = (fl) =>{
                if(verificaAudio(fl)){ return "Ocupado"}
                else{ return "Vazio"}
            }

            for(let fileNumber = 1; fileNumber <= 10; fileNumber++){
                commandMessage = commandMessage.concat(`\nSlot ${fileNumber}: ${slotVerify(fileNumber)}`);
            }

            message.channel.send(commandMessage);
        }
    }

});

const verificaAudio = fileNumber =>{
    let retorno = false;

    try{
        if(fs.existsSync(`./audio/audio${fileNumber}.mp3`)){
            retorno = true;
        }else{
            retorno = false;
        }
        return retorno
    }catch(e){
        console.log(e);
    }
}

client.login(Token);
