import { useInputValue } from "../../hooks"
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"

import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { hideAlert, showAlert } from "../../state/slices/components"




export function FormConnection(props){

    const code = useInputValue('')
    const user = useInputValue('')
    const [styleCode, setCode] = useState('')
    const [styleUser, setUser] = useState('')
    const navigate = useNavigate();

    const state = useSelector(state => state.components)
    const dispatch = useDispatch()

    async function ConnectRoom({code, user}, dispatch){
    
        const data = {
            code: code.value.trim().toUpperCase(),
            user: user.value.trim()
        }
        axios.post('http://127.0.0.1:8000/api-auth/connect/', data)
            .then((resp) => {
                console.log(resp.data)
                if (resp.data.errors.length > 0){
                    console.log(resp)
                    dispatch(showAlert(resp.data.errors))
                }else{

                    navigate('/lobby', { state: { code: resp.data.code, session_key: resp.data.session_key} });
                }
            })
    }

    function submitHandle(event){
        event.preventDefault()

        if (code.value !== '' && user.value !== ''){
            ConnectRoom({code, user}, dispatch)
            setTimeout(()=>{
                dispatch(hideAlert())
            }, 5000)
        }else{
            // Validate Form
            let errors = []
            if (code.value !== ''){
                setCode('#ffffff')
            } else {
                setCode('#f98787')
                errors.push('Поле кода комнаты не должно быть пустым')
            }
            if (user.value !== '') {
                setUser('#ffffff')
            }else{
                setUser('#f98787')
                errors.push('Поле имени не должно быть пустым')
            }
            dispatch(showAlert(errors))
            setTimeout(()=>{
                dispatch(hideAlert())
            }, 5000)
        }
    }

    return(
        <>
        
        <div className="form-connection">
            <div className='back-arrow' onClick={() => props.setState(false)}>
                <span >
                    <i className="fas fa-arrow-left"></i>
                </span>
            </div>
            <form method='POST' >
                <input {...code} type="text" size='100' style={{backgroundColor: styleCode}} placeholder="Введите код комнаты"/>
                <input {...user} type="text" size='100' style={{backgroundColor: styleUser}} placeholder="Введите ваше имя" />
                <button type="submit" className="classic-button button" onClick={submitHandle}>Присоединиться</button> 
            </form>
        </div>
        </>
    )
}