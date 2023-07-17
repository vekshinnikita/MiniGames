import React from "react";


export default ({goToMenu, handleActive, children}) =>{
    

    return (
        <div className="settings-item" onClick={() => goToMenu && handleActive(goToMenu)}>
            {children}
        </div>
    )
}