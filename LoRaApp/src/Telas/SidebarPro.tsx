import { useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Link } from "react-router-dom";
import Devices from 'react-icons/pi';
import Dashboards from 'lucide-react';

const SidebarPro = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [Selected, setSelected] = useState("Dashboard");

    return <div> SidebarPro </div>;
};

export default SidebarPro;