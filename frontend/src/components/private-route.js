import React from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user'))

  if (!user) {
    console.log('Utilizator neautentificat. Redirecționare la pagina de autentificare.')
    return <Navigate to="/sign-in" />
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`Acces interzis. Rol necesar: ${requiredRole}, rol utilizator: ${user.role}`)
    return <Navigate to="/not-authorized" />
  }

  return children
}

export default PrivateRoute 