import React, { useState, useEffect } from "react";
import { CSSTransition } from 'react-transition-group'


import MenuItem from "./MenuItem"
import RightArrow from '../../image/right_arrow.svg'
import LeftArrow from '../../image/left_arrow.svg'
import Friends from "../../image/friends.jpg"
import PreviewFriends from "../../image/FriendsPreview.jpg"
import { friends } from "../../static/GameInfo"
import User from "../../image/eleven.jpg"
import Refresh from "../../image/refresh.svg"
import Check from "../../image/check.svg"
import { useSelector } from "react-redux";


export default ({settings, setSettings, chatSocket, request_id, code}) =>{
    
    const [activeMenu, setActiveMenu] = useState('main')
    const [ prevMenu, setPrevMenu ] = useState([])

    const [activeLevel, setActiveLevel] = useState(1)
    const [lastGap, setLastGap] = useState(1)


    const user_me = useSelector(state => state.user.users.filter(user => user.me === true)[0])
    const [username, setUsername] = useState(user_me.name)


    
    const handleActive = (goToMenu) => {
        
        setPrevMenu([...prevMenu , activeMenu])
        setActiveMenu(goToMenu)

        if (activeLevel == 1){
            setLastGap(1)
        } else if (activeLevel == 2) {
            setLastGap(2)
        }
        
        setActiveLevel(activeLevel + 1)
    }

    const handlePrev = () => {
        if (prevMenu[prevMenu.length - 1] !== 'main'){
            setActiveMenu(prevMenu[prevMenu.length -1])
            setPrevMenu([...prevMenu.slice(0,-1)])
        }else{
            setActiveMenu('main')
            setPrevMenu([])
        }

        if (activeLevel == 3){
            setLastGap(2)
        } else if (activeLevel == 2) {
            setLastGap(1)
        }
        setActiveLevel(activeLevel - 1)
    }

    function handleStart(game){
        chatSocket.send(
            JSON.stringify({
                action: "subscribe_instance",
                code: code,
                request_id: request_id,
            })
        );
        chatSocket.send(
            JSON.stringify({
                action: "start_game",
                game: game,
                code: code,
                request_id: request_id,
            })
        );        
    }

    function handleUpdateImage(){
        console.log('change')
        chatSocket.send(
            JSON.stringify({
                action: "subscribe_instance",
                code: code,
                request_id: request_id,
            })
        );
        chatSocket.send(
            JSON.stringify({
                action: "update_image",
                code: code,
                request_id: request_id,
            })
        );        
    }

    function handleResetUsername(){
        chatSocket.send(
            JSON.stringify({
                action: "subscribe_instance",
                code: code,
                request_id: request_id,
            })
        );
        chatSocket.send(
            JSON.stringify({
                action: "update_username",
                username: username,
                request_id: request_id,
            })
        );        
    }

    return (
        <>
        <CSSTransition
            in={settings}
            unmountOnExit
            timeout={500}
            classNames='layout-amin'
        >
            <div className='layout' onClick={() => setSettings(false)}></div>
        </CSSTransition>
        <CSSTransition
            in={settings}
            unmountOnExit
            timeout={500}
            classNames='settings-menu'
        >
            <div className='settings-window'>
                <div style={{position: 'relative'}}>
                    <div className="settings-title">    
                        { activeMenu !== 'main' && (
                            <div className="button-light button-back" onClick={handlePrev}><img src={LeftArrow}/></div>
                        )}

                        <h1>Настройки</h1>
                    </div>

                    <CSSTransition
                        in={activeMenu === 'main'}
                        unmountOnExit
                        timeout={500}
                        classNames='menu-primary'
                    >
                        <div className="settings-row">
                            <MenuItem goToMenu='room' handleActive={handleActive}><h3>Комната</h3><div className="right-item"><img src={RightArrow} /></div></MenuItem>
                            <MenuItem goToMenu='user' handleActive={handleActive}><h3>Игрок</h3><div className="right-item"><img src={RightArrow} /></div></MenuItem>
                        </div>
                    </CSSTransition>
                    
                    <CSSTransition
                        in={activeMenu === 'room'}
                        unmountOnExit
                        timeout={500}
                        classNames={ lastGap === 2  ? 'menu-primary' : 'menu-secondary'}
                    >
                
                        <div className="settings-row">
                        <MenuItem goToMenu='game_friends' handleActive={handleActive}><div className="image-game"><img src={Friends} /></div><h3>Узнай друга</h3><div className="right-item"><img src={RightArrow} /></div></MenuItem>
                        </div>
                    </CSSTransition>

                    <CSSTransition
                        in={activeMenu === 'game_friends'}
                        unmountOnExit
                        timeout={500}
                        classNames='menu-secondary'
                    >
                        <div className="game-wrapper">
                            <div className="preview_image">
                                <img src={PreviewFriends} />
                            </div>
                            <div className="game-description">
                                <p>Узнай друга — идеальная игра-викторина, чтобы узнать, насколько хорошо вы знаете своих друзей и насколько хорошо они знают вас.</p>
                                <p>В каждом раунде одному из игроков лично адресован вопрос. Его задача - выбрать из предложенных вариантов наиболее подходящий.</p>
                                <p>Цель остальных участников - угадать, какой вариант выбрал герой вопроса. Те, кому это удастся, получат победные очки. Побеждает тот, кто наберет наибольшее количество очков.</p>
                                <p>Душевный микс из веселых и интересных, серьезных и не очень вопросов поможет вам отлично провести время и узнать друг друга чуточку лучше.</p>
                                <p>Похожие игры: "Кто скорее всего", "Я никогда не", викторины</p>
                            </div>
                            <button className='classic-button button button-ready' onClick={() => handleStart('friends')} >
                                Начать игру
                            </button>
                        </div>
                    </CSSTransition>

                    <CSSTransition
                        in={activeMenu === 'user'}
                        unmountOnExit
                        timeout={500}
                        classNames='menu-secondary'
                    >
                        <div className="game-wrapper">
                            <div className="user-image">
                                <img src={user_me.url_image} />
                            </div>
                            <button className='classic-button button button-refresh' onClick={handleUpdateImage}>
                                <img src={Refresh}/>
                            </button>
                            <div className="input-username">
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} class="signup-text-input" />
                                <button className="classic-button button button-username" onClick={handleResetUsername}><img src={Check} /></button>
                            </div>
                        </div>
                    </CSSTransition>

                    
                </div>
            </div>
        </CSSTransition>
        </>
    )
}