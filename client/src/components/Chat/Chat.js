import React, {useRef, useEffect} from "react";
import io from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:8080";

const roomSelectionContainer = document.getElementById('room-selection-container')
const roomInput = document.getElementById('room-input')
const connectButton = document.getElementById('connect-button')
const videoChatContainer = document.getElementById('video-chat-container')
const localVideoComponent = document.getElementById('local-video')
const remoteVideoComponent = document.getElementById('remote-video')

const mediaConstraints = {
    audio: true,
    video: { width: 500, height: 500 },
}
let localStream
let remoteStream
let isRoomCreator
let rtcPeerConnection
let roomId

const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ],
}

// connectButton.addEventListener('click', () => {
//     joinRoom(roomInput.value)
// })

async function setLocalStream(mediaConstraints) {
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
    } catch (error) {
      console.error('Could not get user media', error)
    }
  
    localStream = stream
    localVideoComponent.srcObject = stream
  }
  

const Chat = () =>{
    // const [response, setResponse] = useState("");
    const btnConnect = useRef()
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        console.log(token)
        const socket = io(ENDPOINT, { transport: ["websocket"], query: {token}});

        btnConnect.current.addEventListener('click', () => {
            joinRoom(roomInput.value)
        })

        socket.on('room_created', async () => {
            console.log('Socket event callback: room_created')
            await setLocalStream(mediaConstraints)
            isRoomCreator = true
        });

        socket.on('room_joined', async () => {
            console.log('Socket event callback: room_joined')
            await setLocalStream(mediaConstraints)
            socket.emit('start_call', roomId)
        });

        socket.on('start_call', async () => {
            console.log('Socket event callback: start_call')

            if (isRoomCreator) {
                rtcPeerConnection = new RTCPeerConnection(iceServers)
                addLocalTracks(rtcPeerConnection)
                rtcPeerConnection.ontrack = setRemoteStream
                rtcPeerConnection.onicecandidate = sendIceCandidate
                await createOffer(rtcPeerConnection)
            }
        });

        socket.on('webrtc_offer', async (event) => {
            console.log('Socket event callback: webrtc_offer')

            if (!isRoomCreator) {
                rtcPeerConnection = new RTCPeerConnection(iceServers)
                addLocalTracks(rtcPeerConnection)
                rtcPeerConnection.ontrack = setRemoteStream
                rtcPeerConnection.onicecandidate = sendIceCandidate
                 rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
                await createAnswer(rtcPeerConnection)
            }
        })

        socket.on('webrtc_answer', (event) => {
            console.log('Socket event callback: webrtc_answer')

            rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
        })

        socket.on('webrtc_ice_candidate', (event) => {
            console.log('Socket event callback: webrtc_ice_candidate')

            let candidate = new RTCIceCandidate({
                sdpMLineIndex: event.label,
                candidate: event.candidate,
            })
            rtcPeerConnection.addIceCandidate(candidate)
        });

        function addLocalTracks(rtcPeerConnection) {
            localStream.getTracks().forEach((track) => {
                rtcPeerConnection.addTrack(track, localStream)
            })
        }

        async function createOffer(rtcPeerConnection) {
            let sessionDescription
            try {
                sessionDescription = await rtcPeerConnection.createOffer()
                rtcPeerConnection.setLocalDescription(sessionDescription)
            } catch (error) {
                console.error(error)
            }

            socket.emit('webrtc_offer', {
                type: 'webrtc_offer',
                sdp: sessionDescription,
                roomId,
            });
        }

        async function createAnswer(rtcPeerConnection) {
            let sessionDescription
            try {
                sessionDescription = await rtcPeerConnection.createAnswer()
                rtcPeerConnection.setLocalDescription(sessionDescription)
            } catch (error) {
                console.error(error)
            }

            socket.emit('webrtc_answer', {
                type: 'webrtc_answer',
                sdp: sessionDescription,
                roomId,
            })
        }

        function setRemoteStream(event) {
            remoteVideoComponent.srcObject = event.streams[0]
            remoteStream = event.stream
        }

        function sendIceCandidate(event) {
            if (event.candidate) {
                socket.emit('webrtc_ice_candidate', {
                    roomId,
                    label: event.candidate.sdpMLineIndex,
                    candidate: event.candidate.candidate,
                })
            }
        }

        function joinRoom(room) {
            if (room === '') {
                alert('Please type a room ID')
            } else {
                roomId = room
                socket.emit('join', room)
                showVideoConference()
            }
        }

        function showVideoConference() {
            roomSelectionContainer.style = 'display: none'
            videoChatContainer.style = 'display: block'
        }

        // return () => socket.disconnect()

    }, []);

    

    return(<div>
        <div id="room-selection-container" className="centered">
            <h1>WebRTC video conference</h1>
            <label>Enter the number of the room you want to connect</label>
            <input id="room-input" type="text"/>
            <button id="connect-button" ref={btnConnect}>CONNECT</button>
        </div>

        <div id="video-chat-container" className="video-position" style={{display: "none"}}>
            <video id="local-video" autoPlay="autoplay" muted="muted"></video>
            <video id="remote-video" autoPlay="autoplay"></video>
        </div>
    </div>);
}

export default Chat
