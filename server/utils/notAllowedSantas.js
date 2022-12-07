export const notSantasCheck = (name, santa) => {
    if (name === 'Catalina Acevedo' && santa === 'Diego Alejandro') {
        return false
    } else if (name === 'Emma Torr' && santa === 'Ariel Álvarez') {
        return false
    } else if (name === 'Dasha Kustova' && santa === 'Fernando Aguirre') {
        return false
    } else if (name === 'Diego Alejandro' && santa === 'Catalina Acevedo') {
        return false
    } else if (name === 'Ariel Álvarez' && santa === 'Emma Torr') {
        return false
    } else if (name === 'Fernando Aguirre' && santa === 'Dasha Kustova') {
        return false
    } else {
        return true
    }
}