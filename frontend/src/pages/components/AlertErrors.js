import React from "react";
import { CSSTransition } from "react-transition-group"
import { useSelector } from "react-redux"


export default () =>{
    
    const state = useSelector(state => state.components)

    return (
        <div className="alert-errors">
            
            {state.errors.map((e) => (
                <CSSTransition in={state.showAlert} timeout={500} classNames="dropdown" unmountOnExit>
                    <div className="alert alert-danger" role="alert" >
                        {e}
                    </div>
                </CSSTransition>
            ))}
        
        </div>
    )
}