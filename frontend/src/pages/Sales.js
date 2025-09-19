import React, { useEffect, useState } from "react";
import api from "../services/api";

const Sales = () => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      const { data } = await api.get("/sales");
      setSales(data);
    };
    fetchSales();
  }, []);

  return (
    <div>
      <h2>Sales Records</h2>
      <ul>
        {sales.map((s) => (
          <li key={s._id}>{s.product} - ${s.amount}</li>
        ))}
      </ul>
    </div>
  );
};

export default Sales;
