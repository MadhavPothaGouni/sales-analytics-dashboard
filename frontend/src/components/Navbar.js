import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav>
    <Link to="/">Dashboard</Link> | <Link to="/sales">Sales</Link>
  </nav>
);

export default Navbar;
