
const io = require('socket.io')(3333);
const { SOCKET_EVENT, routeList, userData, songQueue, current } = require("./data")
const { enterUser, addSong, getSongList, getCurrentSong, videoEnd, videoPause, videoNext } = require("./conroller")

io.on('connection', (socket) => {

    socket.on(SOCKET_EVENT, data => socketService(socket.id, data));

    socket.on('disconnect', function () {
        const username = Object.values(userData.userList).reduce((r, c, i) => {
            if(c===socket.id) return Object.keys(userData.userList)[i]
            else return r
        }, null)
        console.log("--------------------")
        console.log("list: ", userData.userList)
        console.log("username", username)
        if(username!==null)
            delete userData.userList.username
        // io.emit('user disconnected');
    });
});

const socketService = (socketId, data) => {
    // console.log(io)
    switch (data.route) {
        case routeList.ENTER_USER:
            enterUser(io.sockets, socketId, data)
            break;
        case routeList.ADD_SONG:
            addSong(io.sockets, socketId, data)
            break;
        case routeList.SONG_LIST:
            getSongList(io.sockets, socketId, data)
            break;
        case routeList.CURRENT_SONG:
            getCurrentSong(io.sockets, socketId, data)
            break;
        case routeList.SONG_END:
            videoEnd(io.sockets, socketId, data)
            break;
        case routeList.SONG_PAUSE: 
            videoPause(io.sockets, socketId, data)
            break;
        case routeList.SONG_NEXT: 
            console.log("check, ", current, data)
            if(data.data.username!==undefined && data.data.username!==null && current.song!==undefined && current.song!==null && data.data.username===current.song.username)
                videoEnd(io.sockets, socketId, data)
            break;

    }

}