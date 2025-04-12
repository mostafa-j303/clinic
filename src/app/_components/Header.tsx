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
    <header id='home' className="z-50 fixed bg-white w-full">
    <div className=" flex h-16  items-center gap-8 px-4 sm:px-6 lg:px-8 shadow-md mx-0 ">
     <Link href='/#home'>
<Image className='h-14 rounded-2xl' src={data.images.logo} alt={'logo'} width={120} height={60}></Image>
  
     </Link>
     
      <div className="flex flex-1 items-center justify-end md:justify-between">
        <nav aria-label="Global" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            <li>
              <Link className="text-gray-500 transition hover:text-gray-500/75" href="/#home"> Home </Link>
            </li>
  
            <li>
              <Link className="text-gray-500 transition hover:text-gray-500/75" href="#appointment"> Appointment </Link>
            </li>
  
            <li>
              <Link className="text-gray-500 transition hover:text-gray-500/75" href="/#product"> Products </Link>
            </li>
  
            <li>
              <Link className="text-gray-500 transition hover:text-gray-500/75" href="/#aboutus"> About Us</Link>
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
    {isCartOpen && (<Cart setIsCartOpen={setIsCartOpen}/>)}
  </header>
  )
}

export default Header