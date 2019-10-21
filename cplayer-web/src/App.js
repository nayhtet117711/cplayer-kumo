import React, { Component } from 'react';
import socket from "socket.io-client"
import YouTube from 'react-youtube';
import queryString from "query-string"
import moment from "moment"

const routeList = {
	ENTER_USER: "ENTER_USER",
    ADD_SONG: "ADD_SONG",
    SONG_LIST: "SONG_LIST",
    CURRENT_SONG: "CURRENT_SONG",
    SONG_END: "SONG_END",
    SONG_PAUSE: "SONG_PAUSE",
    SONG_NEXT: "SONG_NEXT"

}

const SOCKET_EVENT = "SOCKET_EVENT"
const youtube = "https://www.googleapis.com/youtube/v3/videos?"
const key = "AIzaSyAy_xGAX-98yl0FQ8bC1dTCfgI23aLyWK4" 
const part = "snippet"

class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			username: "",
			newUrl: "",
			isInApp: false,
			screen: false,
			player: null,
			songList: [],
			currentSong: null
		}
		this.socket = socket.connect("http://192.168.100.44:3333") //192.168.100.44
	}

	componentDidMount() {
		this.socket.on(SOCKET_EVENT, this.socketService)
		this.socket.emit(SOCKET_EVENT, { route: routeList.SONG_LIST })
		this.socket.emit(SOCKET_EVENT, { route: routeList.CURRENT_SONG, data: null })
	}

	socketService = data => {
		switch (data.route) {
			case routeList.ENTER_USER:
				this.userEnterFromSocket(data)
				break;
			case routeList.SONG_LIST:
				this.songListFromSocket(data)
				break;
			case routeList.CURRENT_SONG:
				this.getCurrentSongFromSocket(data)
				break;
			case routeList.SONG_PAUSE:
				this.pauseSongFromSocket(data)
				break;				

		}
	}

	userEnterFromSocket = data => {
		const { player } = this.state
		
		if (data.success) {
			this.handleStateChange({ isInApp: true, screen: data.screen })
			// alert(data.message)

		} else {
			alert(data.message)
		}
	}

	getCurrentSongFromSocket = data => {
		const { player } = this.state
		console.log("currentSong:", data.currentSong)
		this.setState({ currentSong: data.currentSong!==undefined ? data.currentSong : null  })
	}

	pauseSongFromSocket = data => {

		console.log("test132", data.currentSong)

		this.setState({ currentSong: data.currentSong!==undefined ? data.currentSong : null  })

		const { player } = this.state

		console.log("player", player)
		
		if(player!==null && data.currentSong.pause)
			player.pauseVideo()
		else if(player!==null)
			player.playVideo()
		
		// this.player
		// console.log("currentSong:", data.currentSong)
		// this.setState({ currentSong: data.currentSong })
	}

	songListFromSocket = data => {
		const { player } = this.state
		// console.log(data)
		this.setState({ songList: data.songList })
	}

	handleStateChange = stateData => this.setState(stateData)

	handleEnterApp = () => {
		const { username } = this.state
		if (username.trim().length > 0) {
			this.socket.emit(SOCKET_EVENT, { route: routeList.ENTER_USER, data: { username } })
		} else {
			alert("Username shouldnt be empty!")
		}
	}

	handleAddSong = () => {
		const { username, newUrl } = this.state
		if (newUrl.trim().length > 0) {
			const urlArr = newUrl.split("?")
			const urlString = urlArr.length>1 ? urlArr[1] : urlArr[0]
			const url = queryString.parse(urlString)
			
			const query = {
				key: key,
				part: part,
				id: url.v
			}

			// console.log(queryString.stringify(query))
			fetch(`${youtube}${queryString.stringify(query)}`)
			.then(res => res.json())
			.then(res => {
				// console.log(res)
				if(res.error!==undefined && res.error!==null) {
					// console.log("error", res.error, res.error===undefined)
					alert(res.error.message)
					throw res.error
				} else {
					// console.log("okay")
					const video = {
						username: username,
						id: res.items[0].id,
						title: res.items[0].snippet.title
					}
					// console.log(video)
					this.socket.emit(SOCKET_EVENT, { route: routeList.ADD_SONG, data: { username, video } })
					this.setState({ newUrl: "" })
				}
			})
			.catch(errr => {
				console.log(errr.message)
				// alert("opps! something went wrong!")
			})		

			
		} else {
			alert("Video url shouldnt be empty!")
		}
	}

	handlePauseSong = props => {
		console.log("pause")
		const { username, currentSong } = this.state
		this.socket.emit(SOCKET_EVENT, { route: routeList.SONG_PAUSE, data: { username } })
	}

	handleNextSong = props => {
		console.log("next")
		const { username, currentSong } = this.state
		this.socket.emit(SOCKET_EVENT, { route: routeList.SONG_NEXT, data: { username } })
	}

	render() {
		const { isInApp, screen } = this.state

		if (!isInApp) return this.renderUserInput()

		else if (screen) return this.renderScreen()

		else return this.renderUserHome()

	}

	renderUserInput = () => {
		const { username } = this.state
		return (
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-4 p-3">
						<div className="p-2">
							<input type="text" value={username} onChange={e => this.handleStateChange({ username: e.target.value })} className="form-control" placeholder="Enter a username" />
						</div>
						<div className="p-2">
							<button className="btn btn-primary btn-block" onClick={this.handleEnterApp}>Enter</button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	renderUserHome = () => {
		const { username, newUrl, songList, currentSong } = this.state
		console.log("currentSong, songList ", currentSong, songList)
		return (
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 p-3">
						<div className="py-3 px-2 d-flex justify-content-end">
							<span className="text-muted pr-3">USER:</span>
							<span className="font-weight-bold h5">{username}</span>
						</div>
						<div className="py-3 px-2">
							<div className="p-3 bg-secondary border rounded d-flex flex-row justify-content-between">
								<div className="h5 text-light d-flex flex-column align-items-center my-auto">{currentSong!==null ? currentSong.title : "No Song"}</div>
								<div className="d-flex flex-row">
									{currentSong!==null && <div className="mx-2 p-1 bg-light text-secondary rounded" style={{ cursor: "pointer" }} onClick={this.handlePauseSong}>
										{ currentSong.pause ? "Resume" : "Pause" }
									</div>}
									{currentSong!==null && <div className="mx-2 p-1 bg-light text-secondary rounded" style={{ cursor: "pointer" }} onClick={this.handleNextSong}>
										Next
									</div>}
								</div>
							</div>	
						</div>
						<div className="p-2">
							<div className="input-group mb-3">
								<input type="text" value={newUrl} onChange={e => this.handleStateChange({ newUrl: e.target.value })} className="form-control" placeholder="Song URL (YouTube link)" aria-label="Recipient's username" aria-describedby="basic-addon2" />
								<div className="input-group-append" style={{ cursor: "pointer" }} onClick={this.handleAddSong}>
									<span className="input-group-text btn btn-primary" id="basic-addon2">Add Link</span>
								</div>
							</div>
						</div>
						<div className="p-2">
							<div className="p-2 text-secondary">SONG LIST</div>
							<ul className="list-group">
								{ songList.length===0 && <div className="p-2 text-muted text-center border border-top border-bottom-0 border-left-0 border-right-0">THERE IS NO SONG YET.</div>	}
								{ 
									songList.map((v,k) =>
										(
											<div key={k} className="list-group-item d-flex flex-row justify-content-between">
												<div className="" style={{ cursor: "default" }}>{ v.title }</div>
												<div className="" style={{ cursor: "default" }}>{ moment(v.time, "YYYY-MM-DDTHH:mm:ss").format("HH:mm:ss a")}</div>
											</div>
										)
									)
								}
							</ul>
						</div>
					</div>
				</div>
			</div>
		)
	}

	renderScreen = () => {
		const { username, songList, currentSong } = this.state

		const song = currentSong===null ? {} : currentSong

		console.log("currentSong: ", currentSong)

		const opts = {
			height: '800',
			width: '100%',
			playerVars: { // https://developers.google.com/youtube/player_parameters
				autoplay: 1
			}
		};

		return (
			<div className="container-fluid">
				<div className="row justify-content-center">
					<div className="col-12 p-0">

						<div className="p-1 bg-secondary border border-dark" style={{ height: 810 }}>
							<YouTube
								videoId={song.id}
								opts={opts}
								onReady={this.onVideoReady}
								onEnd={this.onVideoEnd}
								onPause={this.onVideoPause}
							/>
						</div>

					</div>
				</div>
			</div>
		)
	}

	onVideoReady = event => {
		// access to player in all event handlers via event.target

		const { currentSong } = this.state
		if(currentSong!==null && currentSong.pause) 
			event.target.pauseVideo();
		event.target.setVolume(100)
		// this.setState({ player: event.target })
		this.setState({ player: event.target })
	}

	onVideoEnd = event => {
		this.socket.emit(SOCKET_EVENT, { route: routeList.SONG_END, username: this.state.username, data: null })
		console.log("End ")
	
	}

	// onVideoPause = event => {
	// 	this.socket.emit(SOCKET_EVENT, { route: routeList.SONG_END, username: this.state.username, data: null })
	// 	console.log("End ")
	// }


}

export default App;
