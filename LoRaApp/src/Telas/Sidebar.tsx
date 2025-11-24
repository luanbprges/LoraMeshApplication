import { useState } from "react";
import logo from '../../LoraIcon.png'
import { useNavigate } from "react-router-dom";

//Icons
import { IoMenu } from "react-icons/io5";
import { PiDevices } from "react-icons/pi";
import { CircleGauge } from 'lucide-react';

const menuItems = [
    {
        icons: <PiDevices size={30} color="white"/>,
        label: 'Dispositivos',
        path: "/devices"
    },

    {
        icons: <CircleGauge size={30} color="white"/>,
        label: 'Dashboard',
        path: "/dashboard"
    }
]

export default function Sidebar() {

    const [open, setOpen] = useState(true);
    const navigate = useNavigate();

    return (
        <div className="flex text-white">
        <nav className = {`shadow-md h-screen bg-[#000000] duration-500 ${open ? 'w-70' : 'w-16'}`}> 
            {/*Header */}
            <div className='px-4 h-20 flex justify-between items-center'>
                <img src={logo} alt="Logo" className={`${open ? 'w-20' : 'w-0'} rounded-md`} />
                <IoMenu size={30} color="white" className="cursor-pointer hover:bg-[#adaeb3] rounded" onClick={()=>setOpen(!open)}/>
            </div>

            {/*Body */}
            <ul>
                {
                    menuItems.map((item, index)=>{
                        return(
                            <li key={index} onClick={() => navigate(item.path)} 
                                className={`px-4 py-3 hover:bg-[#adaeb3] 
                                    rounded-md duration-300 cursor-pointer flex gap-4 items-center`}>
                                <div>{item.icons}</div>
                                <p className={`${!open && 'w-0 translate-x-24'} 
                                    duration-500 overflow-hidden` }>{item.label}</p>
                            </li>
                        )
                    })
                }
            </ul>
        </nav>
    </div>
    )
}