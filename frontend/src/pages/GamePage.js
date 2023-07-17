import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Image from "../image/eleven.jpg"
import { motion } from "framer-motion"

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { createUser, createWaitingUser, deleteUser, deleteWaitingUser, retrieveUser, updateUser } from "../state/slices/user";
import { ChangeQuestions, setCorrectAnswer, setNextQuestion, setQuestion } from "../state/slices/question";

export default () =>{

    const location = useLocation().search
    const dispatch = useDispatch()
    const users = useSelector(state => state.user.users)
    const waiting = useSelector(state => state.user.waiting)
    const navigate = useNavigate();

    const { game } = useParams()
    const code = new URLSearchParams(location).get('code')
    const session_key = new URLSearchParams(location).get('session_key')

    const request_id = new Date().getTime()
    const chatSocket =  useMemo(() => new WebSocket(`ws://127.0.0.1:8000/game/${game}?session_key=${session_key}&code=${code}`), [])

    const questionState = useSelector(state => state.question)
    const [toAnswer, setToAnswer] = useState(false) 
    const [timer, setTimer] = useState(10)
    const [isCounting, setIsCounting] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [ disconnect, setDisconnect ] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            isCounting && setTimer(timer => (timer>=1 ? timer-1 : 0))
        },1000)
        return () => {
            clearInterval(interval)
        }
    }, [isCounting])

    useEffect(() => {
        if (timer === 0){
            dispatch(ChangeQuestions())
            setIsCounting(false)
            setTimer(10)
        }
    }, [timer])



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
                    code: code,
                    request_id: request_id,
                })
            );
            chatSocket.send(
                JSON.stringify({
                    action: "subscribe_to_waiting_activity",
                    request_id: request_id,
                })
            );
            chatSocket.send(
                JSON.stringify({
                    action: "retrieve",
                    request_id: request_id,
                })
            );
            chatSocket.send(
                JSON.stringify({
                    action: "start",
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
                case 'update':
                    if (data.model == 'Member' ){
                        dispatch(updateUser(data.data))
                        console.log('update')
                    }
                    break
                case 'create':
                    if (data.model == 'Member' ){
                        dispatch(createUser(data.data))
                        console.log('create')
                    }else if (data.model =="Waiting"){
                        dispatch(createWaitingUser(data.data))
                        console.log(data.data)
                    }
                    break
                case 'delete':
                    if (data.model == 'Member' ){
                        dispatch(deleteUser(data.data))
                    } else if (data.model =="Waiting"){
                        dispatch(deleteWaitingUser(data.data))
                    }
                    break
                case 'start':
                    dispatch(setQuestion(data.data))
                    break
                case 'next':
                    dispatch(setNextQuestion(data.data))
                    break
                case 'correct_answer':
                    dispatch(setCorrectAnswer(data.data))
                    setIsCounting(true)
                    setToAnswer(false)
                    break
                case 'reset_game':
                    chatSocket.send(
                        JSON.stringify({
                            action: "start",
                            request_id: request_id,
                        }))
                    break
                case 'end_game':
                    setDisconnect(true)
                    chatSocket.send(
                        JSON.stringify({
                            action: "disconnect",
                            code: code,
                            request_id: request_id,
                        })
                    );

                    navigate('/lobby', { state: { code, session_key} })
                    break
                    
                default: 
                    break;
            }
        }; 
        chatSocket.onclose = function (e) {
            console.log('CLOSE WEBSOCKET')
            if(!disconnect){
                setDisconnect(true)
            } else{
                
                navigate('/')
            }
            
        }
        chatSocket.onerror = function (e) {
            navigate('/')
        }
    }, [])


    function handleAnswer(e){
        setToAnswer(true)
        chatSocket.send(
            JSON.stringify({
                action: "subscribe_instance",
                code: code,
                request_id: request_id,
            })
        );
        chatSocket.send(
            JSON.stringify({
                action: "answer_to",
                answer_id: e.target.dataset.id,
                question_id: questionState.id,
                request_id: request_id, 
            })
        );
    }   

    const handleBackToLobby = () => {
        if (chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.send(
                JSON.stringify({
                    action: "end_game",
                    request_id: request_id, 
                })
            );
        }
    }

    const handleReset = () => {
        if (chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.send(
                JSON.stringify({
                    action: "reset_game",
                    request_id: request_id, 
                })
            );
        }
    }

    return(<>
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1}}
            transition={{ duration: 0.5 }}
            className="main"
            >
            <a className="leave-button" href="/">Выйти</a>
            <span className="code"><h2>{code}</h2></span>
            <div className="active-member">


                { users.map(user => (
                <div className="user-avatar"><div className="wrapper-img"><img src={user.url_image}/></div> <div className="user-status" style={user.is_online ? {backgroundColor: '#4bb34b'} : {backgroundColor: '#aeaeae'}}></div></div>
                    
                ))}
                
            </div>
            <div className="game-block">
                {!questionState.isEnd ? (
                <>
                    <h2>
                        ВОПРОС 1/6
                    </h2>
                    <p>
                        {toAnswer ? "Ожидаем..." :questionState.question}
                    </p>
                    {!toAnswer ? (
                        <>
                        {isCounting && <h2>Таймер: {timer}</h2>}
                        <div className="row-answers">
                            { questionState.answers.map(answer => (
                                
                                <div className="button-section">
                                    <button className={(
                                        questionState.answered[0] && 
                                        questionState.answered.find(el => el.correct === true).answer !== null &&
                                        questionState.answered.find(el => el.correct === true).answer.id === answer.id) ? 
                                        "classic-button" : 
                                        "classic-button wrong-answer"} 
                                            onClick={handleAnswer} 
                                            data-id={answer.id} 
                                            key={answer.id}>
                                        {answer.answer}
                                    </button>

                                    {questionState.answered.filter(el => ( el.answer != null && el.correct != true && el.answer.id === answer.id)).map((el, index) => 
                                        <div className="waiting-user answered-user" style={{right: `-${60 + 25*index}px`,}} >
                                            <div>
                                                {console.log(el)}
                                                <img src={el.member.url_image}/>
                                            </div>
                                        </div>
                                    ) }
                                </div>
                            ))}
                        </div>
                        </>
                    ) : (
                        <>
                            
                            <div className="row-waiting">
                                { waiting.map(user => (
                                    <div className="waiting-user" key={user.id}>
                                        <div>
                                            <img src={user.url_image}/>
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
                ) : (
                    <div style={{margin: 'auto'}}>
                        <h1>Конец</h1>
                        <div className="buttons-block">

                            <button className='classic-button button' onClick={() => handleBackToLobby()}>
                                Выйти в лобби
                            </button>
                            <button className='classic-button button' onClick={() => handleReset()}>
                                Начать заново
                            </button>
                        </div>
                    </div>
                    
                )}

            </div>
        </motion.div>
    </>
    )
}