'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../_context/CartContext'
import Cart from './Cart'
import Link from 'next/link'
import data from "../../../public/data.json"
const Header: React.FC = () => {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen((prevState) => !prevState);
  };

  return (
    <header id='home' className="bg-white">
    <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8 shadow-md">
     <Image src={data.images.logo} alt={'logo'} width={120} height={60}></Image>
  
      <div className="flex flex-1 items-center justify-end md:justify-between">
        <nav aria-label="Global" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            <li>
              <Link className="text-gray-500 transition hover:text-gray-500/75" href="/#home"> Home </Link>
            </li>
  
            <li>
              <Link className="text-gray-500 transition hover:text-gray-500/75" href="#"> Appointment </Link>
            </li>
  
            <li>
              <Link className="text-gray-500 transition hover:text-gray-500/75" href="/#product"> Products </Link>
            </li>
  
            <li>
              <Link className="text-gray-500 transition hover:text-gray-500/75" href="#"> About Us</Link>
            </li>
  
            <li>
              <Link className="text-gray-500 transition hover:text-gray-500/75" href="/#f"> Contact Us </Link>
            </li>
  
            
          </ul>
        </nav>
  
        <div className="flex items-center gap-4">
          <div className="sm:flex sm:gap-4">
            <button
              className="flex justify-around items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-hovprimary"
              onClick={toggleCart} 
            >
            <ShoppingCart/> ({cart?.length})
            </button>
          </div>
  
         
        </div>
      </div>
    </div>
    {isCartOpen && (<Cart />)}
  </header>
  )
}

export default Header