import { useInputValue } from "../../hooks"
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"

import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { showAlert, hideAlert } from "../../state/slices/components"



export function FormCreateRoom(props){

    const code = useInputValue('')
    const user = useInputValue('')
    const [styleUser, setUser] = useState('')
    const navigate = useNavigate();

    const state = useSelector(state => state.components)
    const dispatch = useDispatch()

    async function ConnectRoom({user}, dispatch){
    
        const data = {
            user: user.value.trim()
        }
        axios.post('http://127.0.0.1:8000/api-auth/create/', data)
        .then(resp => {
            navigate('/lobby', { state: { code: resp.data.code, session_key: resp.data.session_key} })
        })
    }
    

    function submitHandle(event){
        event.preventDefault()

        if (user.value !== ''){
            ConnectRoom({user}, dispatch)
            setTimeout(()=>{
                dispatch(hideAlert())
            }, 5000)
        }else{
            // Validate Form
            let errors = []
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
                <input {...user} type="text" size='100' style={{backgroundColor: styleUser}} placeholder="Введите ваше имя" />
                <button type="submit" className="classic-button button" onClick={submitHandle}>Присоединиться</button> 
            </form>
        </div>
        </>
    )
}