import { useState } from "react"


export function useInputValue(defaultValue=''){
    const [value, setValue] = useState('')

    return {
        value,
        onChange: (event) => setValue(event.target.value)
    }
}