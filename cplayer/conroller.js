const { SOCKET_EVENT, routeList, userData, songQueue, current } = require("./data")

module.exports.logoutUser = (socket, socketId, socketData) => {
    const route = socketData.route
    const data = socketData.data

    const songQueueNew = songQueue.filter(v => v.username!==data.username)
    console.log(songQueue, songQueueNew)

    if(songQueueNew.length>-1) {
        songQueue.splice(0, songQueue.length)
        songQueue.push(...songQueueNew)
        console.log(songQueueNew)
        this.getSongList(socket, socketId, socketData)
        if(current.song!==null && current.song!==undefined && current.song.username===data.username) {
            this.videoEnd(socket, socketId, socketData)
        }
        delete userData.userList[data.username]
    }

}

module.exports.enterUser = (socket, socketId, socketData) => {
    const route = socketData.route
    const data = socketData.data

    const userList = {...userData.userList}

    const userNameList = [...Object.keys(userList), ...songQueue.map(v => v.username)]
	if(current.song!==undefined && current.song!==null) userNameList.push(current.song.username)
    const alreadyExistIndex = userNameList.findIndex(uname => uname===data.username)
	
	const userListAuth = [
		"lucy",
		"myintmyathein",
		"shayne",
		"maythu",
		"thaenuwin",
		"nayhtet",
		"htookyaw",
		"yinyin",
		"hlaingminthein",
		"ethical",
		"khaingkhant",
		"thuzarsein",
		"heinhtet",
		"kyawpyhokhant",
		"mimi",
		"thiri",
		"nyuntnyunt",
		"htinhtin",
		"mike", 
		"cplayer"
	]
	
	const userIndex = userListAuth.findIndex(u => u===data.username)
    
    // console.log(userIndex, alreadyExistIndex, userIndex>-1, userNameList, userListAuth)

    if(alreadyExistIndex===-1 && userIndex>-1) {
        userList[data.username] = socketId
        userData.userList = userList
        socket.connected[socketId].emit(SOCKET_EVENT, { 
            success: true, 
            route, 
            screen: data.username==="cplayer" ? true : false,
            message: "Welcome to the CPLayer"})
        
    } else {
        socket.connected[socketId].emit(SOCKET_EVENT, { 
            success: false, 
            route, 
            screen: data.username==="cplayer" ? true : false,
            message: alreadyExistIndex>-1 ? "Seriously, are you a hacker? No you can't. You are a fool trying to cheat! :P" : userIndex===-1 ? "You are not allowed to enter Kumo CPlayer Group!" : "Opps! Something went wrong!"
        })
    }

}

module.exports.addSong = (socket, socketId, socketData) => {
    const route = socketData.route
    const data = socketData.data

    const video = { ...data.video, time: new Date(), pause: false, username: data.username }

    // console.log("time: ", video.time)

    if(current.song===null || current.song===undefined) {
        current.song = video
        socket.emit(SOCKET_EVENT, { route: routeList.CURRENT_SONG, currentSong: current.song })
    } else {
        songQueue.push(video)

    }
    const tmpSongList = [...songQueue]
    // console.log(tmpSongList)
    if(current.song!==null && current.song!==undefined)
        tmpSongList.unshift(current.song)
    
    socket.emit(SOCKET_EVENT, { route: routeList.SONG_LIST, songList: tmpSongList })

}

module.exports.getSongList = (socket, socketId, socketData) => {
    const route = socketData.route
    const data = socketData.data

    const tmpSongList = [...songQueue]
    if(current.song!==null && current.song!==undefined)
        tmpSongList.unshift(current.song )
    // console.log("tmpSongList, ", tmpSongList, current.song)
    socket.emit(SOCKET_EVENT, { route: routeList.SONG_LIST, songList: tmpSongList })

    socket.emit(SOCKET_EVENT, { route: routeList.SONG_VOLUME, volume: current.volume })

}

module.exports.getCurrentSong = (socket, socketId, socketData) => {
    const route = socketData.route
    const data = socketData.data

    socket.emit(SOCKET_EVENT, { route: routeList.CURRENT_SONG, currentSong: current.song })

}

module.exports.videoEnd = (socket, socketId, socketData) => {
    const route = socketData.route
    const data = socketData.data

    current.song = songQueue.shift()
    socket.emit(SOCKET_EVENT, { route: routeList.CURRENT_SONG, currentSong: current.song })

    const tmpSongList = [...songQueue]

    if(current.song!==null && current.song!==undefined && current.song!==undefined)
        tmpSongList.unshift(current.song)
    socket.emit(SOCKET_EVENT, { route: routeList.SONG_LIST, songList: tmpSongList })

    // console.log("tmpSongList: ", tmpSongList)

}

module.exports.videoVolumeChange = (socket, socketId, socketData) => {
    const route = socketData.route
    const data = socketData.data

    current.volume = data.volume

    socket.emit(SOCKET_EVENT, { route: routeList.SONG_VOLUME, volume: data.volume })
}

module.exports.videoPause = (socket, socketId, socketData) => {
    const route = socketData.route
    const data = socketData.data

    const screenUserId = userData.userList["cplayer"]

    // current.song = songQueue.shift()
    current.song.pause = !current.song.pause 
    socket.emit(SOCKET_EVENT, { route: routeList.SONG_PAUSE, currentSong: current.song })
    // if(socket.connected[screenUserId]!==undefined && socket.connected[screenUserId]!==null) {
    //     socket.connected[screenUserId].emit(SOCKET_EVENT, { route: routeList.SONG_PAUSE, currentSong: current.song })
    // }

    // const tmpSongList = [...songQueue]
    // if(current.song!==null && current.song!==undefined)
    //     tmpSongList.unshift(current.song)
    // socket.emit(SOCKET_EVENT, { route: routeList.SONG_LIST, songList: tmpSongList })

}

// module.exports.videoPause = (socket, socketId, socketData) => {
//     const route = socketData.route
//     const data = socketData.data

//     const screenUserId = userData.userList["cplayer"]

//     // current.song = songQueue.shift()
//     current.song.pause = !current.song.pause
//     socket.emit(SOCKET_EVENT, { route: routeList.SONG_PAUSE, currentSong: current.song })
//     // if(socket.connected[screenUserId]!==undefined && socket.connected[screenUserId]!==null) {
//     //     socket.connected[screenUserId].emit(SOCKET_EVENT, { route: routeList.SONG_PAUSE, currentSong: current.song })
//     // }

//     // const tmpSongList = [...songQueue]
//     // if(current.song!==null && current.song!==undefined)
//     //     tmpSongList.unshift(current.song)
//     // socket.emit(SOCKET_EVENT, { route: routeList.SONG_LIST, songList: tmpSongList })

// }
