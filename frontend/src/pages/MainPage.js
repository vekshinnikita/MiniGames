import React, {FC, useState, useEffect} from "react";
import AlertErrors from "./components/AlertErrors";
import { FormConnection } from "./components/FormConnection";
import { FormCreateRoom } from "./components/FormCreateRoom";



export default function MainPage(){

    const [openForm, setOpenForm] = useState('')
  
    return (
        <div className="container main">
            <AlertErrors />
            <div className="main-form">
                {openForm == 'connect' ? (
                    <FormConnection setState={setOpenForm}/>
                ) : (
                    openForm == 'create' ? (
                        <FormCreateRoom setState={setOpenForm}/>
                    ) : (
                        <>
                        <button className='classic-button button' onClick={() => setOpenForm('connect')}>
                            Присоединиться к игре
                        </button>
                        <button className='classic-button button' onClick={() => setOpenForm('create')}>Создать игру</button>
                        </>
                    )
                )}
            </div>
        </div>
    )
}



