const {token} = require('./config.json')
const {Client, Intents} = require('discord.js');

const express = require('express')

const app = express()
const port = 3000


const client = new Client({
    intents: [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

});

const prefix = '!'
let members = []
let id

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix)) return;
    if (!message.content.includes('ping')) return;
    if (!message.content.includes('_')) return;
    if (!message.content.includes('_')) return;
    let queryId = message.content.split('_').pop()
    if (queryId !== id) {
        members = [];
        id = queryId
    }

    client.channels.fetch(queryId).then(value => {
        if (!members || !members.length) {
            const req = Object.fromEntries(value.members)
            for (const objKey in req) {
                members.push(req[objKey].user.id)
            }
        }

        if (!members.length) {
            message.reply({content: `None on the server right now`})
            return
        }

        message.reply({content: `http://localhost:3000/${queryId}`}).then(value => {
            setTimeout(async () => {
                await value.delete()
            }, 10000)
        })

    }).catch(e => {
        message.reply(`${e.message} 'wrong request'`)
    })
});

client.on('voiceStateUpdate', async (oldState, newState) => {

    if (newState.channelId === id) {
        const obj = Object.fromEntries(newState.channel?.members)
        for (const objKey in obj) {
            if (!members.includes(obj[objKey].user.id)) {
                members.push(obj[objKey].user.id)
            }
        }
        return
    }
    if (!newState.channelId) {
        members = members.filter(member => member !== oldState.id)
        return
    }

    if (newState.channelId !== id && oldState.channelId !== id) {
        console.log('on from my sev')
        return
    }

    if (newState.channel.id !== id) {
        members = members.filter(member => member !== oldState.id)
    }

})


app.get('/:id?', (req, res) => {
    const requestId = req.params?.id
    if (requestId === id) {
        res.send(JSON.stringify({"ids": members.join(' ')}))
        return
    }
    res.send('idi v dupu')

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

client.login(token);