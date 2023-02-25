const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "PLAYER"

const heading = $("header h2")
const cdThumb = $(".cd-thumb")
const audio = $("#audio")
const playButton = $(".btn-toggle-play")
const player = $(".player")
const progress = $("#progress")
const prevButton = $(".btn-prev")
const nextButton = $(".btn-next")
const randomButton = $(".btn-random")
const repeatButton = $(".btn-repeat")
const playlist = $(".playlist")

const app = {
	currentIndex: 0,
	isPlaying: false,
	isRandom: false,
	isRepeat: false,
	config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
	songs: [
		{
			id: 1,
			name: "Intro",
			singer: "Sơn Tùng MTP",
			path: "./assets/music/song1.mp3",
			image: "./assets/img/song1.jpg",
		},
		{
			id: 2,
			name: "Cơn mưa xa dần",
			singer: "Sơn Tùng MTP",
			path: "./assets/music/song2.mp3",
			image: "./assets/img/song2.jpg",
		},
		{
			id: 3,
			name: "Nắng ấm ngang qua",
			singer: "Sơn Tùng MTP",
			path: "./assets/music/song3.mp3",
			image: "./assets/img/song3.jpg",
		},
		{
			id: 4,
			name: "Muộn rồi mà sao còn",
			singer: "Sơn Tùng MTP",
			path: "./assets/music/song4.mp3",
			image: "./assets/img/song4.jpg",
		},
		{
			id: 5,
			name: "Hãy trao cho anh",
			singer: "Sơn Tùng MTP",
			path: "./assets/music/song5.mp3",
			image: "./assets/img/song5.jpg",
		},
		{
			id: 6,
			name: "Em của ngày hôm qua",
			singer: "Sơn Tùng MTP",
			path: "./assets/music/song6.mp3",
			image: "./assets/img/song6.jpg",
		},
	],
	setConfig(key, value) {
		this.config[key] = value
		localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
	},
	render() {
		const htmls = app.songs.map((song, index) => {
			return `
                <div class="song ${
									index === this.currentIndex ? "active" : ""
								}" data-index="${index}">
                        <div class="thumb" style="background-image: url('${
													song.image
												}')">
                        </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`
		})
		playlist.innerHTML = htmls.join("")
	},

	defineProperties() {
		Object.defineProperty(app, "currentSong", {
			get: () => {
				return app.songs[app.currentIndex]
			},
		})
	},
	handleEvent() {
		const _this = this
		const cd = $(".cd")
		const cdWidth = cd.offsetWidth

		// Handle CD rotate
		const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
			duration: 10000,
			iterations: Infinity,
		})
		cdThumbAnimate.pause()
		// Handle zoom in/out CD
		document.onscroll = () => {
			const scrollTop = window.scrollY || document.documentElement.scrollTop
			const newCdWidth = cdWidth - scrollTop

			cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0
			cd.style.opacity = newCdWidth / cdWidth
		}

		audio.onplay = () => {
			_this.isPlaying = true
			player.classList.add("playing")
			cdThumbAnimate.play()
		}
		audio.onpause = () => {
			_this.isPlaying = false
			player.classList.remove("playing")
			cdThumbAnimate.pause()
		}

		// Handle when clicking
		playButton.onclick = () => {
			_this.isPlaying ? audio.pause() : audio.play()
			// Handle duration
			audio.ontimeupdate = () => {
				if (audio.duration) {
					const progressPercent = Math.floor(
						(audio.currentTime / audio.duration) * 100
					)
					progress.value = progressPercent
				}
			}
		}
		// Handle seek
		progress.oninput = (e) => {
			const seekTime = (audio.duration / 100) * e.target.value
			audio.currentTime = seekTime
		}
		// Handle next song
		nextButton.onclick = () => {
			if (_this.isRandom) {
				_this.playRandomSong()
			} else {
				_this.nextSong()
			}
			audio.play()
			_this.render()
			_this.scrollToActiveSong()
		}
		// Handle previous song
		prevButton.onclick = () => {
			if (_this.isRandom) {
				_this.playRandomSong()
			} else {
				_this.prevSong()
			}
			audio.play()
			_this.render()
			_this.scrollToActiveSong()
		}
		// Handle random toggle
		randomButton.onclick = () => {
			_this.isRandom = !_this.isRandom
			_this.setConfig("isRandom", _this.isRandom)
			randomButton.classList.toggle("active", _this.isRandom)
		}
		// Handle repeat a song
		repeatButton.onclick = () => {
			_this.isRepeat = !_this.isRepeat
			_this.setConfig("isRepeat", _this.isRepeat)
			repeatButton.classList.toggle("active", _this.isRepeat)
		}
		// Handle next song when audio is ended
		audio.onended = () => {
			if (_this.isRepeat) {
				audio.play()
			} else {
				nextButton.click()
			}
		}
		// Listen to onclick behavior inside playlist
		playlist.onclick = (e) => {
			const songNode = e.target.closest(".song:not(.active)")
			// Handle when click a song
			if (songNode || e.target.closest(".option")) {
				// Handle when click another song
				if (songNode) {
					_this.currentIndex = Number(songNode.dataset.index)
					_this.loadCurrentSong()
					_this.render()
					audio.play()
				}
				// Handle when click option
				if (e.target.closest(".option")) {
				}
			}
		}
	},
	scrollToActiveSong() {
		setTimeout(() => {
			$(".song.active").scrollIntoView({
				behavior: "smooth",
				block: "end",
			})
		}, 300)
	},
	loadCurrentSong() {
		heading.textContent = app.currentSong.name
		cdThumb.style.backgroundImage = `url('${app.currentSong.image}')`
		audio.src = app.currentSong.path
	},
	loadConfig() {
		this.isRandom = this.config.isRandom
		this.isRepeat = this.config.isRepeat
	},
	nextSong() {
		this.currentIndex++
		if (this.currentIndex >= this.songs.length) {
			this.currentIndex = 0
		}
		this.loadCurrentSong()
	},
	prevSong() {
		this.currentIndex--
		if (this.currentIndex < 0) {
			this.currentIndex = this.songs.length - 1
		}
		this.loadCurrentSong()
	},
	playRandomSong() {
		let newIndex = this.currentIndex
		do {
			newIndex = Math.floor(Math.random() * this.songs.length)
		} while (newIndex === this.currentIndex)
		this.currentIndex = newIndex
		this.loadCurrentSong()
	},
	start() {
		// Load config to app
		this.loadConfig()
		// Define attribute for object
		app.defineProperties()
		// Listen to DOM events
		app.handleEvent()
		// Load current song information to UI
		app.loadCurrentSong()

		// Render playlist
		app.render()

		randomButton.classList.toggle("active", this.isRandom)
		repeatButton.classList.toggle("active", this.isRepeat)
	},
}

app.start()
