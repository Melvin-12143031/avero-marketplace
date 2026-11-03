
import { useEffect, useState } from 'react'

const useLocalStorage = (key, initialValue, validate) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key)

            if (item === null) {
                return initialValue
            }

            const parsedValue = JSON.parse(item)

            if (validate && !validate(parsedValue)) {
                return initialValue
            }

            return parsedValue
        } catch (error) {
            console.error('Error reading localStorage:', error)
            return initialValue
        }
    })

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(storedValue))
        } catch (error) {
            console.error('Error saving to localStorage:', error)
        }
    }, [key, storedValue])

    return [storedValue, setStoredValue]
}

export default useLocalStorage
