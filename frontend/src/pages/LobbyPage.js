import React, { useEffect, useState,useMemo } from "react";
import { useLocation } from "react-router-dom";
import Image from "../image/reviews-user-photo.jpg"
import Settings from "../image/settings.svg"
import { motion } from "framer-motion"

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { deleteUser, retrieveUser, createUser, updateUser } from "../state/slices/user";
import SettingsMenu from './components/SettingsMenu'


export default () =>{

    const location = useLocation()
    const dispatch = useDispatch()
    const users = useSelector(state => state.user.users)
    const navigate = useNavigate();
    const code = location.state.code
    const session_key = location.state.session_key

    const request_id = new Date().getTime()
    const chatSocket = useMemo(() => new WebSocket(`ws://127.0.0.1:8000/ws?session_key=${session_key}&code=${code}`), [])

    const [settings, setSettings] = useState(false)
    

    useEffect(() => {
        chatSocket.onopen = function () {
            chatSocket.send(
                JSON.stringify({
                    action: "subscribe_instance",
                    code: code,
                    request_id: request_id,
                })
            );
            chatSocket.send(
                JSON.stringify({
                    action: "subscribe_to_member_activity",
                    request_id: request_id,
                })
            );
            chatSocket.send(
                JSON.stringify({
                    action: "retrieve",
                    request_id: request_id,
                })
            );
            
            
            
        }
        
        chatSocket.onmessage = function (e) {
            const data = JSON.parse(e.data);
            console.log('RealTime', data)
            switch (data.action) {
                case 'retrieve':
                    if (data.action == 'retrieve'){
                    dispatch(retrieveUser(data.data))
                    console.log('retrive')
                    }
                    break
                case 'create':
                    if (data.action == 'create'){
                        dispatch(createUser(data.data))
                        console.log('create')
                    };
                    break
                case 'update':
                    if (data.model == 'Member' ){
                        dispatch(updateUser(data.data))
                        console.log('update')
                    }
                    break
                case 'delete':
                    if (data.data.model == 'Member' && data.action == 'delete'){
                        dispatch(deleteUser(data.data))
                    }
                    break
                case 'start':
                    chatSocket.send(
                        JSON.stringify({
                            action: "disconnect",
                            code: code,
                            request_id: request_id,
                        })
                    )
                    navigate(`/game/${data.data.game}?session_key=${session_key}&code=${code}`)
                    break
                default:
                    break;
            }
        }; 
        chatSocket.onclose = function (e) {
            console.log('CLOSE WEBSOCKET')
            navigate('/')
        }
        chatSocket.onerror = function (e) {
            navigate('/')
        }
        console.log('hello')
    }, [])

    


    return(<>
        
        <SettingsMenu chatSocket={chatSocket} code={code} request_id={request_id} settings={settings} setSettings={setSettings}/>
        <div 
            
            className="main"
            >
            <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}  
                className="code">
                <h2>{code}</h2>
            </motion.span>
            <motion.button 
                initial={{ opacity: 0}}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5}}  
                className="classic-button button settings" 
                onClick={() => setSettings(!settings)}

                >
                    <img src={Settings} />
            </motion.button>
            <motion.div 
                initial={{ opacity: 0, scale: 0.5}}
                animate={{ opacity: 1 , scale: 1}}
                transition={{ duration: 0.5 }}  
                className="lobby-window"
                >
                <div className="lobby-header">
                    Игроки
                </div>
                <div className="lobby-users">
                    { users.map(user => (
                    <div className="user" key={user.pk}>
                        <div className="user-image-lobby">
                            <img src={user.url_image}/>
                        </div>
                        <div className="user-main-sec">
                            <h3>{user.name}</h3>
                        </div>
                    </div>
                    ))}
                </div>
            </motion.div>
        </div>
    </>
    )
}