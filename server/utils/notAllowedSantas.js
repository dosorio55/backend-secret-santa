export const notSantasCheck = (name, santa) => {
    if (name === 'Catalina Acevedo' && santa === 'Diego Alejandro') {
        return false
    } else if (name === 'Emma Torr' && santa === 'Ariel') {
        return false
    } else if (name === 'Dasha' && santa === 'Fernando') {
        return false
    } else if (name === 'Diego Alejandro' && santa === 'Catalina Acevedo') {
        return false
    } else if (name === 'Ariel' && santa === 'Emma Torr') {
        return false
    } else if (name === 'Fernando' && santa === 'Dasha') {
        return false
    } else {
        return true
    }
}