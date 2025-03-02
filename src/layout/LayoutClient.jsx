import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './client/Header'
import Footer from './client/Footer'


const LayoutClient = () => {

  return (
    <>
      <div className="page-wrapper">
        <Header/>

        <main>
          <Outlet />
        </main>

        <Footer/>

      </div>
    </>
  )
}

export default LayoutClient
